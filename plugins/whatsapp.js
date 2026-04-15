
export default function ({ $axios, store, $config }, inject) {
  // Token propio para msg_ninesys, aislado del token principal de la app
  let _wsToken = null

  // Crear una instancia aislada de Axios para el servicio de WhatsApp
  const wsApi = $axios.create({
    baseURL: $config.WS_API,
    timeout: 5000, // Timeout agresivo de 5s para WhatsApp
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })

  // Función para obtener token JWT del servicio msg_ninesys
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
        _wsToken = response.data.token
        return _wsToken
      }
    } catch (error) {
      console.error('[WS-API] Error obteniendo token JWT:', error.message)
      throw error
    }
  }

  // Interceptor de Peticion para $wsApi
  wsApi.onRequest(async (config) => {
    // Si no es la ruta de login, intentar adjuntar token
    if (!config.url.includes('/login')) {
      // Si no hay token propio, obtener uno nuevo
      if (!_wsToken) {
        try {
          await getJWTToken()
        } catch (e) {
          // Continuar, el error de respuesta manejara el 401/403 si es necesario
        }
      }

      if (_wsToken) {
        config.headers.Authorization = `Bearer ${_wsToken}`
      }
    }
    return config
  })

  // Interceptor de Respuesta para $wsApi (Manejo de 401/403 / Refresco)
  wsApi.onResponseError(async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    // Reintentar en 401 (no proporcionado) o 403 (token invalido/expirado)
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await getJWTToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return wsApi.request(originalRequest)
      } catch (loginError) {
        _wsToken = null
        console.error('[WS-API] No se pudo renovar el token:', loginError.message)
      }
    }

    return Promise.reject(error)
  })

  // Inyectar la instancia como $wsApi
  inject('wsApi', wsApi)
}
