
export default function ({ $axios, store, $config }, inject) {
  // Crear una instancia aislada de Axios para el servicio de WhatsApp
  const wsApi = $axios.create({
    baseURL: $config.WS_API,
    timeout: 5000, // Timeout agresivo de 5s para WhatsApp
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })

  // Función para obtener token JWT aislada para esta instancia
  const getJWTToken = async () => {
    const username = $config.jwtUsername || 'admin'
    const password = $config.jwtPassword || 'Ninesys@2024'

    try {
      console.log('[WS-API] Solicitando nuevo token JWT...')
      const response = await wsApi.post('/login', {
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
      console.error('[WS-API] Error obteniendo token JWT:', error.message)
      throw error
    }
  }

  // Interceptor de Petición para $wsApi
  wsApi.onRequest(async (config) => {
    // Si no es la ruta de login, intentar adjuntar token
    if (!config.url.includes('/login')) {
      let token = store.state.login?.token || localStorage.getItem('jwt_token')

      // Si no hay token, intentar obtenerlo
      if (!token) {
        try {
          token = await getJWTToken()
        } catch (e) {
          // Continuar, el error de respuesta manejará el 401 si es necesario
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  })

  // Interceptor de Respuesta para $wsApi (Manejo de 401/Refresco)
  wsApi.onResponseError(async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = store.state.login?.refreshToken || localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          console.log('[WS-API] Refrescando token JWT...')
          const response = await wsApi.post('/refresh', { refreshToken })
          const newToken = response.data.token
          store.commit('login/setToken', newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return wsApi.request(originalRequest)
        } catch (refreshError) {
          // Si falla refresco, intentar login completo
          try {
            const newToken = await getJWTToken()
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return wsApi.request(originalRequest)
          } catch (loginError) {
            store.commit('login/setToken', null)
            store.commit('login/setRefreshToken', null)
          }
        }
      } else {
        // No hay refresh token, intentar login completo
        try {
          const newToken = await getJWTToken()
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return wsApi.request(originalRequest)
        } catch (loginError) {
          store.commit('login/setToken', null)
        }
      }
    }

    return Promise.reject(error)
  })

  // Inyectar la instancia como $wsApi
  inject('wsApi', wsApi)
}
