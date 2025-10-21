// plugins/axios.js
export default function ({ $axios, store }) {
    if (!$axios) {
        throw new Error("Instance of $axios is undefined")
    }

    $axios.onRequest((config) => {
        // Mantener el id_empresa como antes
        const id_empresa = store.state.login?.idEmpresa || 0
        config.headers.common["Authorization"] = id_empresa

        // Agregar token JWT SOLO para endpoints del servicio WhatsApp (WS_API)
        if (config.url && config.url.includes(store.$config?.WS_API)) {
            const token = store.state.login?.token || localStorage.getItem('jwt_token')
            if (token) {
                config.headers.common["Authorization"] = `Bearer ${token}`
            }
        }

        // Configura los encabezados
        config.headers["Accept"] = "application/json"

        return config
    })

    $axios.onResponseError((error) => {
        // Solo manejar errores de autenticación para endpoints del servicio WhatsApp
        if (error.config?.url && error.config.url.includes(store.$config?.WS_API)) {
            if (error.response?.status === 401) {
                // Token expirado, intentar renovar
                const refreshToken = store.state.login?.refreshToken || localStorage.getItem('refresh_token')
                if (refreshToken) {
                    return $axios.post(`${store.$config?.WS_API}/refresh`, { refreshToken })
                        .then(response => {
                            store.commit('login/setToken', response.data.token)
                            // Reintentar la petición original
                            error.config.headers.Authorization = `Bearer ${response.data.token}`
                            return $axios.request(error.config)
                        })
                        .catch(() => {
                            // Solo limpiar token JWT, no hacer logout completo
                            store.commit('login/setToken', null)
                            store.commit('login/setRefreshToken', null)
                            console.error('Error renovando token JWT para WhatsApp')
                        })
                } else {
                    // No hay refresh token, limpiar token JWT
                    store.commit('login/setToken', null)
                    console.error('No hay refresh token para renovar JWT')
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
