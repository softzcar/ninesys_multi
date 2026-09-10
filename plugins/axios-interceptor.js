import axios from 'axios'
import { extractApiErrorMessage, getApiErrorTitle } from '@/utils/apiErrorHandler'

// Caché de peticiones GET en vuelo y recientes (TTL 2 segundos)
const requestCache = new Map()

export default function ({ $axios, store, app, $config }) {

  // La clave de caché DEBE incluir la empresa/usuario que hace la petición: este
  // wrapper corre antes de que el interceptor onRequest fije el header
  // Authorization (id_empresa), así que dos empresas distintas pidiendo la misma
  // url+params dentro del TTL recibirían la respuesta de la OTRA empresa si la
  // clave no las distingue (bug real: /refresh-session/{id} devolvía datos de
  // una empresa distinta a la que estaba activa en ese momento).
  if (!axios.Axios.prototype.request.__wrappedForCache) {
    const originalRequest = axios.Axios.prototype.request

    axios.Axios.prototype.request = function (configOrUrl, config) {
      let normalizedConfig
      if (typeof configOrUrl === 'string') {
        normalizedConfig = config || {}
        normalizedConfig.url = configOrUrl
      } else {
        normalizedConfig = configOrUrl || {}
      }

      const method = (normalizedConfig.method || 'get').toLowerCase()
      if (method === 'get') {
        const url = normalizedConfig.url || ''
        let paramsStr = ''
        try {
          paramsStr = normalizedConfig.params ? JSON.stringify(normalizedConfig.params) : ''
        } catch (e) {
          paramsStr = String(normalizedConfig.params)
        }
        // Solo particiona el caché por empresa activa -- no es la fuente de
        // autorización real (eso lo decide el interceptor onRequest, que
        // manda Bearer <apiToken> cuando existe; ver auditoría de seguridad
        // 2026-09-10).
        const idEmpresa = store.state.login?.idEmpresa || store.state.login?.dataEmpresa?.id || 0
        const key = `${idEmpresa}|${url}?${paramsStr}`

        const now = Date.now()
        const cached = requestCache.get(key)

        console.log(`🔍 [AXIOS-CACHE] Solicitud: ${key} | Cacheado: ${!!cached} | Edad: ${cached ? (now - cached.timestamp) + 'ms' : 'N/A'}`)

        // Reutilizar si no ha expirado
        if (cached && (now - cached.timestamp < 2000)) {
          console.log(`🔄 [AXIOS-CACHE] Reutilizando respuesta/promesa para: ${url}`)
          return cached.promise
        }

        const promise = originalRequest.call(this, normalizedConfig)
          .then(response => {
            return response
          })
          .catch(error => {
            // Si falló, remover de caché inmediatamente para permitir reintentos
            requestCache.delete(key)
            return Promise.reject(error)
          })

        requestCache.set(key, {
          promise,
          timestamp: now
        })

        return promise
      }

      return originalRequest.call(this, normalizedConfig)
    }

    axios.Axios.prototype.request.__wrappedForCache = true
  }


  // Función auxiliar para verificar si una URL pertenece al servicio WhatsApp
  const isWhatsAppService = (url) => {
    return url && url.includes(store.$config?.WS_API)
  }

  // Red de seguridad global: si un componente no maneja su propio error,
  // esto garantiza que el usuario SIEMPRE vea una notificación clara cuando una
  // petición falla con el mensaje real de la API.
  let lastToastMessage = null
  let lastToastTime = 0

  const showGlobalErrorToast = (error) => {
    try {
      const message = extractApiErrorMessage(error)
      const title = getApiErrorTitle(error, 'Error')
      const now = Date.now()

      // Evitar spam de toasts idénticos repetidos en menos de 1.5s
      if (lastToastMessage === message && now - lastToastTime < 1500) {
        return
      }
      lastToastMessage = message
      lastToastTime = now

      // $bvToast solo existe en la instancia raíz de Vue ya montada (window.$nuxt),
      // no en el objeto "app" de contexto del plugin (que se recibe antes del montaje).
      const bvToast = (typeof window !== 'undefined' && window.$nuxt && window.$nuxt.$bvToast) || (app && app.$bvToast)
      if (bvToast) {
        bvToast.toast(message, {
          title,
          variant: 'danger',
          autoHideDelay: 6000,
          appendToast: true,
          solid: true,
        })
      }
    } catch (toastError) {
      // Nunca dejar que el propio manejo de errores rompa la app
      console.error('Error mostrando el toast global de error:', toastError)
    }
  }

  let activeLoginPromise = null

  // Función para obtener token JWT
  const getJWTToken = async () => {
    if (activeLoginPromise) {
      console.log('[AXIOS-LOGIN] Reutilizando promesa de login JWT en curso...')
      return activeLoginPromise
    }

    // `process.env.JWT_USERNAME` nunca se resuelve en el bundle del navegador
    // (Nuxt 2 no lo reemplaza sin declararlo en `env:`) -- esto SIEMPRE caía
    // al valor hardcodeado de abajo, sin importar el entorno. Corregido para
    // leer el mismo publicRuntimeConfig que ya usa plugins/whatsapp.js, sin
    // fallback inseguro (auditoría de seguridad 2026-09-09).
    const username = $config.jwtUsername
    const password = $config.jwtPassword

    activeLoginPromise = (async () => {
      try {
        const response = await $axios.post(`${store.$config?.WS_API}/login`, {
          username,
          password
        })

        if (response.data.token) {
          store.commit('login/setToken', response.data.token)
          if (response.data.refreshToken) {
            store.commit('login/setRefreshToken', response.data.refreshToken)
          }
          return response.data.token
        }
      } catch (error) {
        console.error('Error obteniendo token JWT:', error)
        // Para errores de JWT, solo limpiar los tokens, no hacer logout completo
        if (error.response?.status === 401 || error.response?.status === 403) {
          store.commit('login/setToken', null)
          store.commit('login/setRefreshToken', null)
        }
        throw error
      } finally {
        activeLoginPromise = null
      }
    })()

    return activeLoginPromise
  }
    if (!$axios) {
        throw new Error("Instance of $axios is undefined")
    }

    $axios.onRequest(async (config) => {
        // Sesión real (JWT) -- auditoría de seguridad 2026-09-10 (hallazgo
        // C2). Si ya hay apiToken (login con el backend nuevo), se manda como
        // Bearer; si no, se cae al id_empresa crudo de siempre (transición
        // gradual, el backend acepta ambos formatos mientras migran los
        // demás repos). El bloque de WhatsApp que sigue abajo sobreescribe
        // esto incondicionalmente para sus propias URLs, sin cambios.
        const apiToken = store.state.login?.apiToken
        const id_empresa = store.state.login?.idEmpresa || store.state.login?.dataEmpresa?.id || 0
        const authValue = apiToken ? `Bearer ${apiToken}` : id_empresa
        if (config.headers) {
            config.headers["Authorization"] = authValue
            if (config.headers.common) {
                config.headers.common["Authorization"] = authValue
            }
        }

        // Para endpoints de WhatsApp, usar token JWT
        if (isWhatsAppService(config.url)) {
            let token = store.state.login?.token || localStorage.getItem('jwt_token')

            // Si no hay token, intentar obtener uno automáticamente
            // pero evitar bucles infinitos verificando que no sea una petición de login
            if (!token && !config.url.includes('/login')) {
                try {
                    console.log('Obteniendo token JWT automáticamente para WhatsApp...')
                    token = await getJWTToken()
                    console.log('Token JWT obtenido exitosamente')
                } catch (error) {
                    console.error('Error obteniendo token JWT automáticamente:', error)
                    // Continuar sin token, el interceptor de respuesta manejará el error
                }
            }

            // Usar token JWT si está disponible
            if (token) {
                if (config.headers) {
                    config.headers["Authorization"] = `Bearer ${token}`
                    if (config.headers.common) {
                        config.headers.common["Authorization"] = `Bearer ${token}`
                    }
                }
            }
        }

        // Configura los encabezados
        config.headers["Accept"] = "application/json"

        return config
    })

    $axios.onResponseError(async (error) => {
        // Solo manejar errores de autenticación para endpoints del servicio WhatsApp
        if (isWhatsAppService(error.config?.url)) {
            if (error.response?.status === 401) {
                // Token expirado, intentar renovar
                const refreshToken = store.state.login?.refreshToken || localStorage.getItem('refresh_token')
                if (refreshToken) {
                    try {
                        const response = await $axios.post(`${store.$config?.WS_API}/refresh`, { refreshToken })
                        store.commit('login/setToken', response.data.token)
                        // Reintentar la petición original
                        error.config.headers.Authorization = `Bearer ${response.data.token}`
                        return $axios.request(error.config)
                    } catch (refreshError) {
                        // Error renovando, intentar obtener nuevo token
                        try {
                            await getJWTToken()
                            // Reintentar con nuevo token
                            const newToken = store.state.login?.token
                            if (newToken) {
                                error.config.headers.Authorization = `Bearer ${newToken}`
                                return $axios.request(error.config)
                            }
                        } catch (newTokenError) {
                            // No se pudo obtener nuevo token, limpiar
                            store.commit('login/setToken', null)
                            store.commit('login/setRefreshToken', null)
                            console.error('Error obteniendo nuevo token JWT para WhatsApp')
                        }
                    }
                } else {
                    // No hay refresh token, intentar obtener nuevo token
                    try {
                        await getJWTToken()
                        const newToken = store.state.login?.token
                        if (newToken) {
                            error.config.headers.Authorization = `Bearer ${newToken}`
                            return $axios.request(error.config)
                        }
                    } catch (newTokenError) {
                        store.commit('login/setToken', null)
                        console.error('Error obteniendo token JWT para WhatsApp')
                    }
                }
            } else if (error.response?.status === 403) {
                // Acceso denegado - token inválido para WhatsApp
                console.error('Token JWT inválido para WhatsApp:', error.response.data)
                store.commit('login/setToken', null)
                store.commit('login/setRefreshToken', null)
            }
        } else if (error.response?.status === 401 && store.state.login?.apiToken) {
            // Sesión real (JWT, auditoría de seguridad 2026-09-10) inválida o
            // expirada: la API responde 401 `invalid_token`. Sin refresh
            // token (decisión de producto) -- se cierra sesión y se redirige
            // a login en vez del toast genérico, que dejaría al usuario
            // atascado viendo errores en cada petición sin entender por qué.
            // La condición sobre `apiToken` (no "cualquier 401") es
            // deliberada: evita disparar esto por un 401 de un endpoint que
            // no depende de la sesión nueva (ej. login fallido, antes de
            // tener apiToken).
            console.warn('[AUTH] Sesión expirada o inválida, cerrando sesión.')
            store.commit('login/logout')
            if (typeof window !== 'undefined' && window.location.pathname !== '/') {
                window.location.href = '/'
            }
        } else if (!error.config?.suppressGlobalErrorToast) {
            // Red de seguridad global (ver showGlobalErrorToast arriba): garantiza
            // que cualquier error de la API se vea, aunque el componente que hizo
            // la petición no tenga su propio manejo. Un componente puede pasar
            // `suppressGlobalErrorToast: true` en la config de su llamada si ya
            // muestra su propio mensaje y no quiere el toast genérico además.
            showGlobalErrorToast(error)
        }
        // Para otros endpoints (401/403 sin sesión JWT activa), no hacer logout
        return Promise.reject(error)
    })

    $axios.onError((error) => {
        console.error("Axios Error:", error)
        return Promise.reject(error)
    })
}
