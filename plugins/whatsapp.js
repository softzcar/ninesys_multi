
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

  // Caché de peticiones GET en vuelo y recientes (TTL 2 segundos) para wsApi
  const requestCache = new Map()
  const originalRequest = wsApi.request

  wsApi.request = function (config) {
    const method = (config.method || 'get').toLowerCase()
    if (method === 'get') {
      const url = config.url || ''
      let paramsStr = ''
      try {
        paramsStr = config.params ? JSON.stringify(config.params) : ''
      } catch (e) {
        paramsStr = String(config.params)
      }
      const key = `${url}?${paramsStr}`

      const now = Date.now()
      const cached = requestCache.get(key)

      // Reutilizar si no ha expirado
      if (cached && (now - cached.timestamp < 2000)) {
        console.log(`🔄 [WS-API-CACHE] Reutilizando respuesta/promesa para: ${url}`)
        return cached.promise
      }

      const promise = originalRequest.call(this, config)
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

    return originalRequest.call(this, config)
  }

  // Auditoría de seguridad 2026-09-10 (hallazgos C5/C6, ver
  // [[project_fase_seguridad_pendiente]]): antes este plugin se logueaba
  // aparte contra msg_ninesys con una credencial de admin compartida
  // (`jwtUsername`/`jwtPassword`) que vivía en el bundle público de Nuxt --
  // cualquiera podía leerla y operar el WhatsApp de cualquier empresa. Ahora
  // manda el MISMO JWT de sesión que ya usa el resto de la app para
  // ninesys-api (`store.state.login.apiToken`) -- msg_ninesys lo valida con
  // el mismo secreto compartido servidor-a-servidor, nunca visible acá.
  wsApi.onRequest((config) => {
    const apiToken = store.state.login?.apiToken
    if (apiToken && !config.url.includes('/login')) {
      config.headers.Authorization = `Bearer ${apiToken}`
    }
    return config
  })

  // Interceptor de Respuesta para $wsApi: un 401/403 acá significa que la
  // sesión (la misma de ninesys-api) ya no es válida -- el interceptor
  // principal (axios-interceptor.js) es quien decide el logout forzado
  // cuando corresponde; acá solo se propaga el error.
  wsApi.onResponseError(async (error) => {
    return Promise.reject(error)
  })

  // Inyectar la instancia como $wsApi
  inject('wsApi', wsApi)
}
