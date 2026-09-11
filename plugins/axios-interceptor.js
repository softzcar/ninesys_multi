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

    if (!$axios) {
        throw new Error("Instance of $axios is undefined")
    }

    $axios.onRequest(async (config) => {
        // Sesión real (JWT) -- auditoría de seguridad 2026-09-10 (hallazgo
        // C2). Si ya hay apiToken (login con el backend nuevo), se manda como
        // Bearer; si no, se cae al id_empresa crudo de siempre (transición
        // gradual, el backend acepta ambos formatos mientras migran los
        // demás repos). Las llamadas a msg_ninesys ($wsApi) y al CDN
        // ($cdnApi) usan este MISMO token, en sus propios plugins.
        const apiToken = store.state.login?.apiToken
        const id_empresa = store.state.login?.idEmpresa || store.state.login?.dataEmpresa?.id || 0
        const authValue = apiToken ? `Bearer ${apiToken}` : id_empresa
        if (config.headers) {
            config.headers["Authorization"] = authValue
            if (config.headers.common) {
                config.headers.common["Authorization"] = authValue
            }
        }

        // Configura los encabezados
        config.headers["Accept"] = "application/json"

        return config
    })

    $axios.onResponseError(async (error) => {
        if (error.response?.status === 401 && store.state.login?.apiToken) {
            // Sesión real (JWT, auditoría de seguridad 2026-09-10) inválida o
            // expirada: la API responde 401 `invalid_token`. Sin refresh
            // token (decisión de producto, ver JwtHelper.php) -- pero desde
            // la auditoría de seguridad 2026-09-11 ya NO se hace logout ni
            // redirect duro (eso perdía cualquier trabajo en curso: un
            // formulario a medio llenar, un editor Quill, etc.). En su lugar
            // se muestra un overlay de reautenticación (SesionExpiradaOverlay,
            // montado en layouts/default.vue) que solo pide la clave y sigue
            // exactamente donde estaba con un token fresco -- el árbol de
            // componentes de la página actual nunca se desmonta. La condición
            // sobre `apiToken` (no "cualquier 401") es deliberada: evita
            // disparar esto por un 401 de un endpoint que no depende de la
            // sesión nueva (ej. login fallido, antes de tener apiToken).
            // Sesión única por empleado (auditoría 2026-09-11): el backend
            // distingue `session_superseded` (otro login la reemplazó) de
            // `invalid_token` (expiró) -- el overlay muestra un mensaje
            // distinto según el motivo real.
            const motivo = error.response?.data?.error === 'session_superseded' ? 'otro_dispositivo' : 'expirada'
            console.warn(`[AUTH] Sesión inválida (${motivo}), mostrando overlay de reautenticación.`)
            store.commit('login/setMotivoSesionExpirada', motivo)
            store.commit('login/setSesionExpirada', true)
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
