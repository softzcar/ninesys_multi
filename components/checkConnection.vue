<template>
  <div>
    <!-- {{ $store.state.login.currentDepartament }} -->
    <div
      v-if="$store.state.login.dataUser.acceso"
      class="floatme"
    >
      <b-button
        :disabled="disableBtnOnIdDep"
        @click="$bvModal.show(modalId)"
        variant="light"
      >
        <span style="margin-right: 10px">
          <b-icon
            icon="whatsapp"
            :variant="statusWs.variant"
            font-scale="1.2"
          ></b-icon>
        </span>
        <span v-if="$nuxt.isOffline">
          <b-icon
            icon="wifi-off"
            variant="danger"
          ></b-icon>
        </span>
        <span v-else>
          <b-icon
            icon="wifi"
            variant="success"
          ></b-icon>
        </span>
      </b-button>

      <b-modal
        :id="modalId"
        title="Estado del Servicio de WhatsApp"
        hide-footer
        size="xl"
      >
        <div v-if="ws.error">
          <b-alert
            show
            :variant="ws.ws_ready ? 'success' : 'danger'"
          >
            <p>{{ ws.error }}</p>
            <p v-if="ws.details">Detalles: {{ ws.details }}</p>
          </b-alert>
          <div class="text-center mt-3">
            <b-button
              variant="primary"
              @click="activateWhatsapp(getCompanyId)"
              :disabled="isActionLoading"
            >
              <b-spinner
                small
                v-if="isActionLoading"
              ></b-spinner>
              Activar / Reintentar
            </b-button>
          </div>
        </div>

        <b-container
          v-else-if="ws.ws_ready"
          class="pb-4"
        >
          <b-row>
            <b-col>
              <h2 class="mt-2 mb-4">
                Estás conectado al servicio de WhatsApp
              </h2>
              <p>
                Para desconectar el servicio desvincula la
                conexión desde el WhatsApp de tu teléfono.
              </p>
              <div class="mt-4">
                <b-button
                  variant="warning"
                  class="mr-2"
                  @click="confirmRestart(getCompanyId)"
                  :disabled="isActionLoading"
                >
                  <b-spinner
                    small
                    v-if="
                                            isActionLoading &&
                                            currentAction === 'restart'
                                        "
                  ></b-spinner>
                  Reiniciar Cliente
                </b-button>
                <b-button
                  variant="danger"
                  class="mr-2"
                  @click="confirmDisconnect(getCompanyId)"
                  :disabled="isActionLoading"
                >
                  <b-spinner
                    small
                    v-if="
                                            isActionLoading &&
                                            currentAction === 'disconnect'
                                        "
                  ></b-spinner>
                  Desconectar Cliente
                </b-button>
                <span class="floatme mr-2">
                  <admin-departamentosEditWs />
                </span>

                <span class="floatme mr-2">
                  <admin-WsSendMsg />
                </span>
              </div>
            </b-col>
          </b-row>
        </b-container>

        <b-container v-else-if="ws.qr">
          <b-row>
            <b-col md="6">
              <h2 class="mt-2 mb-4">Vincular dispositivo</h2>
              <p>Sigue estos pasos en tu teléfono:</p>
              <ol>
                <li>Abre WhatsApp.</li>
                <li>
                  Ve a <strong>Menú</strong> (<b-icon icon="three-dots-vertical"></b-icon>).
                </li>
                <li>
                  Selecciona
                  <strong>Dispositivos vinculados</strong>.
                </li>
                <li>
                  Toca
                  <strong>Vincular un dispositivo</strong>.
                </li>
                <li>
                  Escanea el código QR que aparece a la
                  derecha.
                </li>
              </ol>
              <div class="mt-4">
                <b-button
                  variant="primary"
                  @click="fetchQRCode(getCompanyId)"
                  :disabled="isActionLoading"
                >
                  <b-spinner
                    small
                    v-if="
                                            isActionLoading &&
                                            currentAction === 'fetchQR'
                                        "
                  ></b-spinner>
                  Recargar Código QR
                </b-button>
              </div>
            </b-col>
            <b-col
              md="6"
              class="text-center"
            >
              <b-img-lazy
                v-bind="wsImgProps"
                :src="ws.qr"
                alt="Código QR para WhatsApp"
              ></b-img-lazy>
            </b-col>
          </b-row>
        </b-container>

        <b-container v-else>
          <b-row>
            <b-col class="text-center">
              <h2 class="mt-2 mb-4">
                Cargando estado del servicio...
              </h2>
              <b-spinner
                variant="primary"
                label="Cargando..."
              ></b-spinner>
              <p class="mt-2">
                Por favor, espera mientras verificamos la
                conexión.
              </p>
              <div class="mt-3">
                <b-button
                  variant="primary"
                  @click="activateWhatsapp(getCompanyId)"
                  :disabled="isActionLoading"
                >
                  <b-spinner
                    small
                    v-if="isActionLoading"
                  ></b-spinner>
                  Activar / Reintentar
                </b-button>
              </div>
            </b-col>
          </b-row>
        </b-container>
      </b-modal>

      <b-modal
        id="confirm-restart-modal"
        title="Confirmar Reinicio"
        hide-footer
      >
        <p class="my-4">
          ¿Estás seguro de que deseas reiniciar el servicio de
          WhatsApp para esta empresa? Esto podría requerir volver a
          escanear el código QR si la sesión no se recupera
          automáticamente.
        </p>
        <div class="text-right">
          <b-button
            variant="secondary"
            @click="$bvModal.hide('confirm-restart-modal')"
            :disabled="isActionLoading"
          >Cancelar</b-button>
          <b-button
            variant="warning"
            @click="performRestartClient(companyIdToAction)"
            :disabled="isActionLoading"
            class="ml-2"
          >
            <b-spinner
              small
              v-if="
                                isActionLoading && currentAction === 'restart'
                            "
            ></b-spinner>
            Reiniciar
          </b-button>
        </div>
      </b-modal>

      <b-modal
        id="confirm-disconnect-modal"
        title="Confirmar Desconexión"
        hide-footer
      >
        <p class="my-4">
          ¿Estás seguro de que deseas desconectar el servicio de
          WhatsApp para esta empresa? Se eliminarán los datos de
          sesión y se requerirá escanear un nuevo código QR para
          volver a conectar.
        </p>
        <div class="text-right">
          <b-button
            variant="secondary"
            @click="$bvModal.hide('confirm-disconnect-modal')"
            :disabled="isActionLoading"
          >Cancelar</b-button>
          <b-button
            variant="danger"
            @click="performDisconnectClient(companyIdToAction)"
            :disabled="isActionLoading"
            class="ml-2"
          >
            <b-spinner
              small
              v-if="
                                isActionLoading &&
                                currentAction === 'disconnect'
                            "
            ></b-spinner>
            Desconectar
          </b-button>
        </div>
      </b-modal>
    </div>

    <div
      v-else
      class="floatme"
    >
      <b-button
        disabled
        variant="light"
      >
        <b-icon
          icon="whatsapp"
          variant="secondary"
          font-scale="1.2"
        ></b-icon>
        <span style="margin-left: 10px">
          <b-icon
            :icon="$nuxt.isOffline ? 'wifi-off' : 'wifi'"
            :variant="$nuxt.isOffline ? 'danger' : 'success'"
          ></b-icon>
        </span>
      </b-button>
    </div>
  </div>
</template>

<script>
// Importar componentes de BootstrapVue si no están registrados globalmente
// import { BButton, BIcon, BModal, BAlert, BContainer, BRow, BCol, BImgLazy, BSpinner } from 'bootstrap-vue';
import axios from "axios";
export default {
  // Registrar componentes si no están registrados globalmente
  // components: {
  //     BButton, BIcon, BModal, BAlert, BContainer, BRow, BCol, BImgLazy, BSpinner
  // },
  data() {
    return {
      modalId: "whatsapp-status-modal", // ID fijo para el modal
      statusWs: {
        icon: "whatsapp",
        variant: "danger", // 'danger' por defecto, 'success' si está listo
      },
      // statusWifi: { // Ya usas $nuxt.isOffline
      //     icon: 'wifi',
      //     variant: 'success',
      // },
      ws: {
        // Estado de la conexión WhatsApp del backend
        ws_ready: false,
        qr: null,
        error: null, // Para mostrar errores del backend
        details: null, // Para detalles del error
      },
      wsImgProps: {
        // Propiedades para b-img-lazy
        center: true,
        blank: false, // No blank, usaremos la imagen del QR
        width: 300,
        height: 300,
      },
      pollingInterval: null, // Variable para almacenar el intervalo
      shortInterval: 10000, // Intervalo corto (10 segundos) para cuando no está listo o hay error
      longInterval: 30000, // Intervalo largo (30 segundos) para cuando está listo

      isActionLoading: false, // Estado para indicar si una acción (activate, restart, disconnect) está en curso
      currentAction: null, // Para rastrear qué acción está cargando
      companyIdToAction: null, // Para almacenar el companyId en diálogos de confirmación
    };
  },

  computed: {
    // No necesitamos una modalId dinámica si siempre usamos el mismo ID
    // modal: function () {
    //     const rand = Math.random().toString(36).substring(2, 7)
    //     return `${this.id}-modal-${rand}`
    // },
    getCompanyId() {
      // Obtener el ID de la empresa logueada desde el store
      return this.$store.state.login.dataEmpresa.id;
    },
    disableBtnOnIdDep() {
      if (this.$store.state.login.currentDepartamentId === null) {
        return true;
      } else {
        return false;
      }
    },
  },

  mounted() {
    // Solo iniciar polling si el usuario tiene acceso (está logueado)
    if (
      this.$store.state.login.dataUser &&
      this.$store.state.login.dataUser.acceso
    ) {
      console.log("Componente mounted. Iniciando polling para WS info.");
      this.startPolling();
      // No necesitamos checkConnection() si usamos $nuxt.isOffline
      // this.checkConnection();
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );
    } else {
      console.log(
        "Componente mounted. Usuario sin acceso, no se inicia polling."
      );
    }
  },

  beforeDestroy() {
    // Detener el polling al destruir el componente
    console.log("Componente beforeDestroy. Deteniendo polling.");
    this.stopPolling();
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  },

  methods: {
    handleVisibilityChange() {
      if (document.hidden) {
        // Si la página se oculta, detener el sondeo
        console.log("Página oculta, deteniendo polling.");
        this.stopPolling();
      } else {
        // Si la página se vuelve visible, reanudar el sondeo
        console.log("Página visible, reanudando polling.");
        this.startPolling();
      }
    },
    async getWSInfo() {
      // Evitar llamadas duplicadas si ya hay una en curso
      if (this.isActionLoading) {
        console.log("getWSInfo: Acción en curso, saltando polling.");
        return;
      }

      console.log(`Fetching WS info for company ID: ${this.getCompanyId}`);
      try {
        // *** Usar la URL base de la API de WhatsApp configurada en nuxt.config.js ($config.WS_API) ***
        const url = `${this.$config.WS_API}/session-info/${this.getCompanyId}`;
        console.log(`Calling API: ${url}`);
        const res = await this.$axios.get(url);

        // La respuesta esperada es { qr: '...', ws_ready: boolean, message: '...' } o { error: '...', details: '...' }
        this.ws = res.data;
        this.statusWs.variant = this.ws.ws_ready ? "success" : "danger";
        this.ws.error = res.data.error || null; // Asegurarse de limpiar error si la llamada fue exitosa
        this.ws.details = res.data.error ? res.data.details : null; // Asegurarse de limpiar detalles

        console.log("WS Info fetched:", this.ws);
      } catch (error) {
        console.error("Error al obtener información de WhatsApp:", error);
        this.statusWs.variant = "danger"; // Si hay error, el estado es peligro

        // Manejo de errores mejorado similar al backend
        if (error.response) {
          console.error(
            "Detalles del error del servidor:",
            error.response.data
          );
          console.error("Código de estado:", error.response.status);

          this.ws = {
            ws_ready: false,
            qr: null, // Asegurarse de que no está listo ni hay QR en caso de error
            error: error.response.data.message || "Error del servidor",
            details: `Código: ${error.response.status}. ${
              error.response.data.error || ""
            }`.trim(),
          };
        } else if (error.request) {
          console.error("No se recibió respuesta del servidor:", error.request);
          this.ws = {
            ws_ready: false,
            qr: null,
            error: "No se pudo conectar con el servidor",
            details: "Verifique la URL de la API y el estado del servidor.",
          };
        } else {
          console.error("Error al configurar la solicitud:", error.message);
          this.ws = {
            ws_ready: false,
            qr: null,
            error: "Error en la solicitud",
            details: error.message,
          };
        }
      } finally {
        // Reiniciar el polling con el intervalo adecuado basado en el estado actual
        this.restartPolling();
      }
    },

    startPolling() {
      this.stopPolling(); // Asegurarse de que no haya otro intervalo corriendo
      this.getWSInfo(); // Obtener la información inicial inmediatamente

      // El intervalo se establece en restartPolling
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
        console.log("Polling detenido.");
      }
    },

    restartPolling() {
      this.stopPolling(); // Detener el intervalo actual antes de reiniciarlo

      // Usar intervalo corto si no está listo o hay error, largo si está listo
      const interval =
        this.ws.ws_ready && !this.ws.error
          ? this.longInterval
          : this.shortInterval;

      console.log(
        `Reiniciando polling con intervalo de ${interval / 1000} segundos.`
      );
      this.pollingInterval = setInterval(() => {
        this.getWSInfo();
      }, interval);
    },

    // --- NUEVAS FUNCIONES PARA ACCIONES ---

    // Inicia el proceso de activación (llama a /session-info, que inicializa el cliente en backend si no existe)
    async activateWhatsapp(companyId) {
      console.log(`Attempting to activate/get session info for ${companyId}`);
      this.isActionLoading = true;
      this.currentAction = "activate";
      this.ws.error = null; // Limpiar errores anteriores al intentar activar
      this.ws.details = null;
      this.ws.qr = null; // Limpiar QR anterior
      this.ws.ws_ready = false; // Asumir que no está listo hasta confirmación

      // Detener polling temporalmente durante la acción
      this.stopPolling();

      try {
        // *** Usar la URL base de la API de WhatsApp ($config.WS_API) ***
        const url = `${this.$config.WS_API}/session-info/${companyId}`;
        console.log(`Calling API for activation: ${url}`);
        const res = await this.$axios.get(url);

        this.ws = res.data; // Actualizar estado con la respuesta (puede contener QR o ws_ready)
        this.statusWs.variant = this.ws.ws_ready ? "success" : "danger";
        this.ws.error = res.data.error || null;
        this.ws.details = res.data.error ? res.data.details : null;

        console.log("Activation/Session Info response:", this.ws);
      } catch (error) {
        console.error("Error during activation/session info fetch:", error);
        this.statusWs.variant = "danger";
        if (error.response) {
          this.ws = {
            ws_ready: false,
            qr: null,
            error:
              error.response.data.message ||
              "Error del servidor durante la activación",
            details: `Código: ${error.response.status}. ${
              error.response.data.error || ""
            }`.trim(),
          };
        } else {
          this.ws = {
            ws_ready: false,
            qr: null,
            error: "Error de red o solicitud durante la activación",
            details: error.message,
          };
        }
      } finally {
        this.isActionLoading = false;
        this.currentAction = null;
        // Reiniciar polling después de la acción
        this.restartPolling();
      }
    },

    // Función para recargar solo el código QR (si el cliente no está listo)
    // Llama al endpoint que devuelve el base64 en JSON
    async fetchQRCode(companyId) {
      console.log(`Attempting to fetch QR code for ${companyId}`);
      this.isActionLoading = true;
      this.currentAction = "fetchQR";
      this.ws.qr = null; // Limpiar QR anterior
      this.ws.error = null; // Limpiar errores anteriores
      this.ws.details = null;
      this.ws.ws_ready = false; // Asumir que no está listo

      // Detener polling temporalmente
      this.stopPolling();

      try {
        // *** Usar la URL base de la API de WhatsApp ($config.WS_API) ***
        const url = `${this.$config.WS_API}/qr/64/${companyId}`; // Usar el endpoint JSON
        console.log(`Calling API: ${url}`);
        const res = await this.$axios.get(url);

        // Esperamos { qr: '...', message: '...' } o { message: '...' } o { error: '...' }
        this.ws.qr = res.data.qr || null;
        // Puedes usar res.data.message si quieres mostrarlo
        // this.ws.message = res.data.message;
        this.ws.error = res.data.error || null; // Capturar error si viene en la respuesta JSON
        this.ws.details = res.data.error ? res.data.details : null;

        if (this.ws.qr) {
          console.log("QR code fetched successfully.");
          this.statusWs.variant = "danger"; // Todavía requiere QR, no está listo
        } else if (this.ws.error) {
          console.warn("API returned an error instead of QR:", this.ws.error);
          this.statusWs.variant = "danger";
        } else {
          console.warn("API returned no QR and no error. Status unknown.");
          this.ws.error = res.data.message || "No se recibió QR ni error.";
          this.statusWs.variant = "danger";
        }
      } catch (error) {
        console.error(`Error fetching QR code for ${companyId}:`, error);
        this.statusWs.variant = "danger";
        if (error.response) {
          this.ws = {
            ws_ready: false,
            qr: null,
            error:
              error.response.data.message || "Error del servidor al obtener QR",
            details: `Código: ${error.response.status}. ${
              error.response.data.error || ""
            }`.trim(),
          };
        } else {
          this.ws = {
            ws_ready: false,
            qr: null,
            error: "Error de red o solicitud al obtener QR",
            details: error.message,
          };
        }
      } finally {
        this.isActionLoading = false;
        this.currentAction = null;
        // Reiniciar polling después de la acción
        this.restartPolling();
      }
    },

    // Muestra el diálogo de confirmación para reiniciar
    confirmRestart(companyId) {
      this.companyIdToAction = companyId;
      this.$bvModal.show("confirm-restart-modal");
    },

    // Ejecuta la acción de reiniciar después de la confirmación
    async performRestartClient(companyId) {
      if (!companyId) return;
      console.log(`Performing restart for ${companyId}`);
      this.isActionLoading = true;
      this.currentAction = "restart";
      this.$bvModal.hide("confirm-restart-modal"); // Cerrar el diálogo de confirmación
      this.ws.error = null; // Limpiar errores anteriores
      this.ws.details = null;
      this.ws.qr = null; // Limpiar QR
      this.ws.ws_ready = false; // Asumir que no está listo

      // Detener polling temporalmente
      this.stopPolling();

      try {
        // *** Usar la URL base de la API de WhatsApp ($config.WS_API) ***
        const url = `${this.$config.WS_API}/restart/${companyId}`;
        console.log(`Calling API: ${url}`);
        const response = await this.$axios.post(url);

        // La respuesta esperada es { message: '...' }
        console.log("Restart response:", response.data.message);
        // Después de reiniciar, el polling se encargará de obtener el nuevo estado (QR o Ready)
      } catch (err) {
        console.error(`Error performing restart for ${companyId}:`, err);
        this.statusWs.variant = "danger";
        if (err.response) {
          this.ws = {
            ws_ready: false,
            qr: null,
            error:
              err.response.data.message || "Error del servidor al reiniciar",
            details: `Código: ${err.response.status}. ${
              err.response.data.error || ""
            }`.trim(),
          };
        } else {
          this.ws = {
            ws_ready: false,
            qr: null,
            error: "Error de red o solicitud al reiniciar",
            details: err.message,
          };
        }
      } finally {
        this.isActionLoading = false;
        this.currentAction = null;
        this.companyIdToAction = null;
        // Reiniciar polling después de la acción
        this.restartPolling();
      }
    },

    // Muestra el diálogo de confirmación para desconectar
    confirmDisconnect(companyId) {
      this.companyIdToAction = companyId;
      this.$bvModal.show("confirm-disconnect-modal");
    },

    // Ejecuta la acción de desconectar después de la confirmación
    async performDisconnectClient(companyId) {
      if (!companyId) return;
      console.log(`Performing disconnect for ${companyId}`);
      this.isActionLoading = true;
      this.currentAction = "disconnect";
      this.$bvModal.hide("confirm-disconnect-modal"); // Cerrar el diálogo de confirmación
      this.ws.error = null; // Limpiar errores anteriores
      this.ws.details = null;
      this.ws.qr = null; // Limpiar QR
      this.ws.ws_ready = false; // Asumir que no está listo

      // Detener polling temporalmente
      this.stopPolling();

      try {
        // *** Usar la URL base de la API de WhatsApp ($config.WS_API) ***
        const url = `${this.$config.WS_API}/disconnect/${companyId}`;
        console.log(`Calling API: ${url}`);
        const response = await this.$axios.delete(url);

        // La respuesta esperada es { message: '...' }
        console.log("Disconnect response:", response.data.message);
        // Después de desconectar, el polling obtendrá el estado (probablemente requiriendo QR)
      } catch (err) {
        console.error(`Error performing disconnect for ${companyId}:`, err);
        this.statusWs.variant = "danger";
        if (err.response) {
          this.ws = {
            ws_ready: false,
            qr: null,
            error:
              err.response.data.message || "Error del servidor al desconectar",
            details: `Código: ${err.response.status}. ${
              err.response.data.error || ""
            }`.trim(),
          };
        } else {
          this.ws = {
            ws_ready: false,
            qr: null,
            error: "Error de red o solicitud al desconectar",
            details: err.message,
          };
        }
      } finally {
        this.isActionLoading = false;
        this.currentAction = null;
        this.companyIdToAction = null;
        // Reiniciar polling después de la acción
        this.restartPolling();
      }
    },

    // checkConnection() { // Ya no es necesario si usas $nuxt.isOffline
    //     window.addEventListener('offline', () => {
    //         console.log('offline');
    //         // this.statusWifi.icon = 'wifi-off';
    //         // this.statusWifi.variant = 'danger';
    //     });
    //     window.addEventListener('online', () => {
    //         console.log('online');
    //         // this.statusWifi.icon = 'wifi';
    //         // this.statusWifi.variant = 'success';
    //     });
    // }
  },
};
</script>
