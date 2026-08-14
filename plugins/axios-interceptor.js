import axios from 'axios'

// Caché de peticiones GET en vuelo y recientes (TTL 2 segundos)
const requestCache = new Map()

export default function ({ $axios, store, app }) {

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

  // Red de seguridad global: si un componente no maneja su propio error (no hace
  // .catch()/$fire), esto garantiza que el usuario SIEMPRE vea algo cuando una
  // petición falla, en vez de que la UI quede silenciosamente desactualizada o
  // vacía sin explicación. No reemplaza el manejo específico por componente
  // (donde ya exista, este toast aparece además, no en su lugar); es un piso
  // mínimo para los casos que hoy no muestran nada.
  const showGlobalErrorToast = (error) => {
    try {
      const description = error?.response?.data?.error?.description
      const status = error?.response?.status
      const message = description && description !== 'An internal error has occurred while processing your request.'
        ? description
        : 'Ocurrió un error al comunicarse con el servidor. Por favor intente nuevamente.'

      // $bvToast solo existe en la instancia raíz de Vue ya montada (window.$nuxt),
      // no en el objeto "app" de contexto del plugin (que se recibe antes del montaje).
      const bvToast = (typeof window !== 'undefined' && window.$nuxt && window.$nuxt.$bvToast) || (app && app.$bvToast)
      if (bvToast) {
        bvToast.toast(message, {
          title: status ? `Error (${status})` : 'Error',
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

    const username = process.env.JWT_USERNAME || 'admin'
    const password = process.env.JWT_PASSWORD || 'Ninesys@2024'

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
        // Mantener el id_empresa como antes para APIs que no son WhatsApp
        const id_empresa = store.state.login?.idEmpresa || store.state.login?.dataEmpresa?.id || 0
        if (config.headers) {
            config.headers["Authorization"] = id_empresa
            if (config.headers.common) {
                config.headers.common["Authorization"] = id_empresa
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
        } else if (!error.config?.suppressGlobalErrorToast) {
            // Red de seguridad global (ver showGlobalErrorToast arriba): garantiza
            // que cualquier error de la API se vea, aunque el componente que hizo
            // la petición no tenga su propio manejo. Un componente puede pasar
            // `suppressGlobalErrorToast: true` en la config de su llamada si ya
            // muestra su propio mensaje y no quiere el toast genérico además.
            showGlobalErrorToast(error)
        }
        // Para otros endpoints, no hacer logout por errores 401/403
        return Promise.reject(error)
    })

    $axios.onError((error) => {
        console.error("Axios Error:", error)
        return Promise.reject(error)
    })
}
