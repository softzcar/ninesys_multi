import axios from 'axios'

// Caché de peticiones GET en vuelo y recientes (TTL 2 segundos)
const requestCache = new Map()

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
      const key = `${url}?${paramsStr}`

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

export default function ({ $axios, store }) {

  // Función auxiliar para verificar si una URL pertenece al servicio WhatsApp
  const isWhatsAppService = (url) => {
    return url && url.includes(store.$config?.WS_API)
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
        const id_empresa = store.state.login?.idEmpresa || 0
        config.headers.common["Authorization"] = id_empresa

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
                config.headers.common["Authorization"] = `Bearer ${token}`
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
        }
        // Para otros endpoints, no hacer logout por errores 401/403
        return Promise.reject(error)
    })

    $axios.onError((error) => {
        console.error("Axios Error:", error)
        return Promise.reject(error)
    })
}
