<template>
    <div>
        <div v-if="$store.state.login.dataUser.acceso" class="floatme">
            <b-button @click="$bvModal.show(modal)" variant="light">
                <span style="margin-right: 20px;">
                    <b-icon icon="whatsapp" :variant="statusWs.variant" size="sm"></b-icon>
                </span>
                <span v-if="$nuxt.isOffline">
                    <b-icon icon="wifi-off" variant="danger"></b-icon>
                </span>
                <span v-else>
                    <b-icon icon="wifi" variant="success"></b-icon>
                </span>
            </b-button>
            <b-modal :id="modal" title="WhatsApp" hide-footer size="xl">
                <div v-if="ws.error">
                    <b-alert variant="info" show>
                        <p>{{ ws.error }}</p>
                        <p v-if="ws.details">Detalles: {{ ws.details }}</p>
                    </b-alert>
                </div>

                <b-container v-else-if="ws.ws_ready">
                    <b-row>
                        <b-col>
                            <h2 class="mt-2 mb-4">Estás conectado al servicio de WhatsApp</h2>
                            <p>Para desconectar el servicio desvincula la conexión desde el WhatsApp de tu teléfono.</p>
                        </b-col>
                    </b-row>
                </b-container>

                <b-container v-else>
                    <b-row>
                        <b-col>
                            <h2 class="mt-2 mb-4">Use Whatsapp para eviar mensajes a sus clientes</h2>
                            <ol>
                                <li>Abra WhatsApp en el su teléfono</li>
                                <li>Toque <strong>Menú</strong> <b-icon icon="three-dots-vertical"></b-icon></li>
                                <li>Seleccione <strong>Dispositivos vinculados</strong></li>
                                <li>Toque el botón <strong>Vincular in dispositivo</strong></li>
                                <li>Escanee el código QR</li>
                            </ol>
                        </b-col>
                        <b-col>
                            <b-img-lazy v-bind="wsImgProps" :src="ws.qr" alt="QR"></b-img-lazy>
                        </b-col>
                    </b-row>
                </b-container>
            </b-modal>
        </div>

        <div v-else class="floatme">
            <div v-if="$nuxt.isOffline">
                <b-button disabled variant="light">
                    <b-icon icon="wifi-off" variant="danger"></b-icon>
                </b-button>
            </div>
            <div v-else>
                <b-button disabled variant="light">
                    <b-icon icon="wifi" variant="success"></b-icon>
                </b-button>
            </div>
        </div>


    </div>
</template>

<script>
export default {
    data() {
        return {
            statusWs: {
                icon: 'whatsapp',
                variant: 'danger',
            },
            statusWifi: {
                icon: 'wifi',
                variant: 'success',
            },
            ws: {
                ws_ready: false,
                qr: null
            },
            wsImgProps: {
                center: true,
                blank: true,
                blankColor: '#bbb',
                width: 300,
                height: 300,
            },
            pollingInterval: null, // Variable para almacenar el intervalo
            shortInterval: 300000, // Intervalo corto (5 segundos) 'Temporalmente en 3 minutos mientras el desarrollo'
            longInterval: 30000, // Intervalo largo (30 segundos)
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `${this.id}-modal-${rand}`
        },
    },

    mounted() {
        if (this.$store.state.login.dataUser.acceso) {
            this.startPolling()
            this.getWSInfo()
        }
    },

    beforeDestroy() {
        if (this.$store.state.login.dataUser.acceso) {
            this.stopPolling(); // Detener el polling al destruir el componente
        }
    },

    methods: {
        /* async getWSInfo() {
            try {
                const res = await this.$axios.get(`${this.$config.API}/ws-connect/${this.$store.state.login.dataEmpresa.id}`);
                this.ws = res.data;
                this.statusWs.variant = this.ws.ws_ready ? 'success' : 'danger';
            } catch (error) {
                console.error("Error al obtener información de WhatsApp:", error);
                // Manejar el error, por ejemplo, mostrar un mensaje al usuario
            } finally {
                this.restartPolling(); // Reiniciar el polling con el intervalo adecuado
            }
        }, */

        async getWSInfo() {
            try {
                const res = await this.$axios.get(`${this.$config.API}/ws-connect/${this.$store.state.login.dataEmpresa.id}`);
                this.ws = res.data;
                this.statusWs.variant = this.ws.ws_ready ? 'success' : 'danger';
            } catch (error) {
                console.error("Error al obtener información de WhatsApp:", error);

                if (error.response) {
                    // El servidor respondió con un código de estado fuera del rango 2xx
                    console.error("Detalles del error del servidor:", error.response.data); // Muestra la respuesta del servidor
                    console.error("Código de estado:", error.response.status); // Muestra el código de estado HTTP

                    // Manejo específico para el error 503 (Servicio no disponible)
                    if (error.response.status === 503) {
                        this.ws = {
                            error: 'El servicio no está disponible en este momento. Inténtelo más tarde.',
                            details: error.response.data.details
                        };
                    } else if (error.response.status === 400) {
                        this.ws = {
                            error: 'Solicitud incorrecta',
                            details: error.response.data.details
                        };
                    }
                    else if (error.response.status === 500) {
                        this.ws = {
                            error: 'El servicio no está disponible en este momento. Inténtelo más tarde',
                            details: error.response.data.details
                        };
                    }
                    else {
                        this.ws = {
                            error: 'Error desconocido',
                            details: 'Error desconocido al conectar con el servidor'
                        };
                    }

                } else if (error.request) {
                    // La solicitud se realizó pero no se recibió ninguna respuesta
                    // `error.request` es una instancia de XMLHttpRequest en el navegador y una instancia de http.ClientRequest en node.js
                    console.error("No se recibió respuesta del servidor:", error.request);
                    this.ws = { error: 'No se pudo conectar con el servidor', details: 'Verifique su conexión a internet.' };
                } else {
                    // Algo sucedió al configurar la solicitud y desencadenó un error
                    console.error('Error al configurar la solicitud:', error.message);
                    this.ws = { error: 'Error en la solicitud', details: error.message };
                }
            } finally {
                this.restartPolling();
            }
        },

        startPolling() {
            this.getWSInfo(); // Obtener la información inicial inmediatamente
        },
        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
        },
        restartPolling() {
            this.stopPolling(); // Detener el intervalo actual antes de reiniciarlo

            const interval = this.ws.ws_ready ? this.longInterval : this.shortInterval;
            this.pollingInterval = setInterval(() => {
                this.getWSInfo();
            }, interval);
        },

        checkConnection() {
            window.addEventListener('offline', () => {
                console.log('offline');
                this.statusWifi.icon = 'wifi-off';
                this.statusWifi.variant = 'danger';
            });
            window.addEventListener('online', () => {
                console.log('online');
                this.statusWifi.icon = 'wifi';
                this.statusWifi.variant = 'success';
            });
        }
    }
}
</script>

<style scoped>
.custom-iframe {
    border: none;
    /* Eliminar los bordes */
    width: 300px;
    /* Ancho del iframe */
    height: 300px;
    /* Alto del iframe */
    /* overflow: hidden !important; */
    /* Ocultar barras de desplazamiento */
}
</style>
