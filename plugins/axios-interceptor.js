// plugins/axios.js
export default function ({ $axios, store }) {
    // Función auxiliar para verificar si una URL pertenece al servicio WhatsApp
    const isWhatsAppService = (url) => {
        return url && url.includes(store.$config?.WS_API)
    }

    // Función para obtener token JWT
    const getJWTToken = async () => {
        const username = process.env.JWT_USERNAME || 'admin'
        const password = process.env.JWT_PASSWORD || 'Ninesys@2024'

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
        }
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

    // ========== INTERCEPTOR DE RESPUESTAS EXITOSAS ==========
    // Detecta automáticamente el campo 'success' y muestra notificaciones
    $axios.onResponse((response) => {
        // Solo procesar respuestas JSON de nuestra API
        if (response.data && typeof response.data === 'object') {

            // Si la respuesta tiene el campo 'success'
            if ('success' in response.data && response.data.message) {
                const message = response.data.message

                if (response.data.success === true) {
                    // Mostrar notificación de éxito
                    if (window.$nuxt?.$bvToast) {
                        window.$nuxt.$bvToast.toast(message, {
                            title: 'Operación exitosa',
                            variant: 'success',
                            solid: true,
                            autoHideDelay: 5000
                        })
                    } else if (window.$nuxt?.$toast) {
                        window.$nuxt.$toast.success(message)
                    }
                } else if (response.data.success === false) {
                    // Mostrar notificación de error
                    if (window.$nuxt?.$bvToast) {
                        window.$nuxt.$bvToast.toast(message, {
                            title: 'Error',
                            variant: 'danger',
                            solid: true,
                            autoHideDelay: 8000
                        })
                    } else if (window.$nuxt?.$toast) {
                        window.$nuxt.$toast.error(message)
                    }
                }
            }
        }
        return response
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

    // ========== MANEJO GLOBAL DE ERRORES DE CONEXIÓN ==========
    // Variable para evitar notificaciones duplicadas (debounce)
    let lastErrorNotification = { type: null, timestamp: 0 };
    const DEBOUNCE_TIME = 5000; // 5 segundos entre notificaciones iguales

    const showConnectionError = (type, title, message) => {
        const now = Date.now();

        // Evitar mostrar la misma notificación múltiples veces
        if (lastErrorNotification.type === type &&
            (now - lastErrorNotification.timestamp) < DEBOUNCE_TIME) {
            return;
        }

        lastErrorNotification = { type, timestamp: now };

        // Usar $bvToast si está disponible
        if (window.$nuxt?.$bvToast) {
            window.$nuxt.$bvToast.toast(message, {
                title: title,
                variant: 'danger',
                solid: true,
                autoHideDelay: 8000,
                toaster: 'b-toaster-top-right'
            });
        } else if (window.$nuxt?.$toast) {
            window.$nuxt.$toast.error(`${title}: ${message}`);
        } else {
            console.error(`[${title}] ${message}`);
        }
    };

    $axios.onError((error) => {
        // 1. Error de red (sin conexión, servidor no disponible, CORS)
        if (!error.response && error.request) {
            // Verificar si es un error de timeout
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                showConnectionError(
                    'timeout',
                    'Tiempo de espera agotado',
                    'El servidor tardó demasiado en responder. Por favor, intenta de nuevo.'
                );
            } else {
                // Error de red genérico (sin internet, servidor caído)
                showConnectionError(
                    'network',
                    'Error de conexión',
                    'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
                );
            }
        }
        // 2. Error del servidor (5xx)
        else if (error.response?.status >= 500) {
            const serverMessage = error.response.data?.message ||
                'Ocurrió un error interno en el servidor. Intenta más tarde.';
            showConnectionError(
                'server_error',
                'Error del servidor',
                serverMessage
            );
        }
        // 3. Error 404 - Recurso no encontrado
        else if (error.response?.status === 404) {
            showConnectionError(
                'not_found',
                'Recurso no encontrado',
                'El recurso solicitado no existe o fue eliminado.'
            );
        }
        // 4. Error de validación (400) - solo si no tiene el formato ApiResponse
        else if (error.response?.status === 400 && !error.response.data?.success === false) {
            const validationMessage = error.response.data?.message ||
                'Los datos enviados no son válidos.';
            showConnectionError(
                'validation',
                'Error de validación',
                validationMessage
            );
        }

        console.error("Axios Error:", error);
        return Promise.reject(error);
    });
}
