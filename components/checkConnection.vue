<template>
  <div>
    <!-- {{ $store.state.login.currentDepartament }} -->
    <div v-if="$store.state.login.dataUser.acceso" class="floatme">
      <b-button :disabled="disableBtnOnIdDep" @click="$bvModal.show(modalId)" variant="light">

        <span style="margin-right: 10px">
          <b-icon icon="whatsapp" :variant="statusWs.variant" font-scale="1.2"></b-icon>
        </span>
        <span v-if="$nuxt.isOffline">
          <b-icon icon="wifi-off" variant="danger"></b-icon>
        </span>
        <span v-else>
          <b-icon icon="wifi" variant="success"></b-icon>
        </span>
      </b-button>

      <b-modal :id="modalId" title="Estado del Servicio de WhatsApp" hide-footer size="xl" @show="onModalShow"
        @hide="onModalHide">
        <div v-if="ws.error">
          <b-alert show :variant="ws.ws_ready ? 'success' : 'danger'">
            <p>{{ ws.error }}</p>
            <p v-if="ws.details">Detalles: {{ ws.details }}</p>
          </b-alert>
          <div class="text-center mt-3">
            <b-button variant="primary" @click="activateWhatsapp(getCompanyId)" :disabled="isActionLoading">
              <b-spinner small v-if="isActionLoading"></b-spinner>
              Activar / Reintentar
            </b-button>
          </div>
        </div>

        <b-container v-else-if="ws.ws_ready" class="pb-4">
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
                <b-button variant="warning" class="mr-2" @click="confirmRestart(getCompanyId)"
                  :disabled="isActionLoading">
                  <b-icon icon="arrow-clockwise" class="mr-2"></b-icon>
                  <b-spinner small v-if="
                    isActionLoading &&
                    currentAction === 'restart'
                  "></b-spinner>
                  Reiniciar Cliente
                </b-button>
                <b-button variant="danger" class="mr-2" @click="confirmDisconnect(getCompanyId)"
                  :disabled="isActionLoading">
                  <b-icon icon="power" class="mr-2"></b-icon>
                  <b-spinner small v-if="
                    isActionLoading &&
                    currentAction === 'disconnect'
                  "></b-spinner>
                  Desconectar Cliente
                </b-button>

                <span class="floatme mr-2">
                  <admin-departamentosEditWs />
                </span>

                <span class="floatme mr-2">
                  <admin-WsSendMsg />
                </span>
                <span class="floatme mr-2">
                  <admin-WsSendMsgCustomInterno />
                </span>
              </div>
            </b-col>
          </b-row>
        </b-container>

        <b-container v-else-if="ws.qr" class="mb-4">
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
            </b-col>
            <b-col md="6" class="text-center">
              <!-- Contenedor con tamaño fijo para evitar el salto de la interfaz -->
              <div style="width: 300px; height: 300px;"
                class="d-flex justify-content-center align-items-center mx-auto my-0">
                <div v-if="isActionLoading && currentAction === 'fetchQR'">
                  <b-spinner style="width: 3rem; height: 3rem" label="Cargando QR..."></b-spinner>
                  <p class="mt-2">Generando nuevo código...</p>
                </div>
                <b-img-lazy v-else-if="ws.qr" v-bind="wsImgProps" :src="ws.qr"
                  alt="Código QR para WhatsApp"></b-img-lazy>
              </div>

              <div class="mt-2">
                <b-button variant="success" @click="fetchQRCode(getCompanyId)" :disabled="isActionLoading">
                  <b-icon icon="whatsapp" class="mr-2"></b-icon>
                  Recargar Código QR
                </b-button>
              </div>
            </b-col>
          </b-row>
        </b-container>

        <b-container v-else>
          <b-row>
            <b-col class="text-center">
              <h2 class="mt-2 mb-4">
                Cargando estado del servicio...
              </h2>
              <b-spinner variant="primary" label="Cargando..."></b-spinner>
              <p class="mt-2">
                Por favor, espera mientras verificamos la
                conexión.
              </p>
              <p v-if="ws.details" class="text-muted small">
                {{ ws.details }}
              </p>
              <div class="mt-3">
                <b-button variant="primary" @click="activateWhatsapp(getCompanyId)" :disabled="isActionLoading">
                  <b-spinner small v-if="isActionLoading"></b-spinner>
                  Activar / Reintentar
                </b-button>
              </div>
            </b-col>
          </b-row>
        </b-container>
      </b-modal>

      <b-modal id="confirm-restart-modal" title="Confirmar Reinicio" hide-footer>
        <p class="my-4">
          ¿Estás seguro de que deseas reiniciar el servicio de
          WhatsApp para esta empresa? Esto podría requerir volver a
          escanear el código QR si la sesión no se recupera
          automáticamente.
        </p>
        <div class="text-right">
          <b-button variant="secondary" @click="$bvModal.hide('confirm-restart-modal')"
            :disabled="isActionLoading">Cancelar</b-button>
          <b-button variant="warning" @click="performRestartClient(companyIdToAction)" :disabled="isActionLoading"
            class="ml-2">
            <b-spinner small v-if="
              isActionLoading && currentAction === 'restart'
            "></b-spinner>
            Reiniciar
          </b-button>
        </div>
      </b-modal>

      <b-modal id="confirm-disconnect-modal" title="Confirmar Desconexión" hide-footer>
        <p class="my-4">
          ¿Estás seguro de que deseas desconectar el servicio de
          WhatsApp para esta empresa? Se eliminarán los datos de
          sesión y se requerirá escanear un nuevo código QR para
          volver a conectar.
        </p>
        <div class="text-right">
          <b-button variant="secondary" @click="$bvModal.hide('confirm-disconnect-modal')"
            :disabled="isActionLoading">Cancelar</b-button>
          <b-button variant="danger" @click="performDisconnectClient(companyIdToAction)" :disabled="isActionLoading"
            class="ml-2">
            <b-spinner small v-if="
              isActionLoading &&
              currentAction === 'disconnect'
            "></b-spinner>
            Desconectar
          </b-button>
        </div>
      </b-modal>
    </div>

    <div v-else class="floatme">
      <b-button disabled variant="light">
        <b-icon icon="whatsapp" variant="secondary" font-scale="1.2"></b-icon>
        <span style="margin-left: 10px">
          <b-icon :icon="$nuxt.isOffline ? 'wifi-off' : 'wifi'"
            :variant="$nuxt.isOffline ? 'danger' : 'success'"></b-icon>
        </span>
      </b-button>
    </div>
  </div>
</template>

<script>
// Importar componentes de BootstrapVue si no están registrados globalmente
// import { BButton, BIcon, BModal, BAlert, BContainer, BRow, BCol, BImgLazy, BSpinner } from 'bootstrap-vue';
import axios from "axios";
import AdminWsSendMsgCustomInterno from "./admin/WsSendMsgCustomInterno.vue";
export default {
  components: { AdminWsSendMsgCustomInterno },
  data() {
    return {
      modalId: "whatsapp-status-modal", // ID fijo para el modal
      statusWs: {
        icon: "whatsapp",
        variant: "danger", // 'danger' por defecto, 'success' si está listo
      },
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

      isActionLoading: false, // Estado para indicar si una acción (activate, restart, disconnect) está en curso
      currentAction: null, // Para rastrear qué acción está cargando
      companyIdToAction: null, // Para almacenar el companyId en diálogos de confirmación
      modalOpen: false, // Para rastrear si el modal está abierto
      socketConnected: false, // Estado de conexión del socket
    };
  },

  computed: {
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
    // Inicialización
    if (
      this.$store.state.login.dataUser &&
      this.$store.state.login.dataUser.acceso
    ) {
      console.log("Componente mounted. Listo para WebSocket.");
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );

      // Verificar estado inicial del servicio para actualizar el icono
      this.checkInitialStatus();
    }
  },

  beforeDestroy() {
    // Limpieza
    console.log("Componente beforeDestroy. Limpiando conexiones.");
    this.disconnectSocket();
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  },

  methods: {
    async checkInitialStatus() {
      try {
        const response = await axios.get(`${this.$config.WS_API}/ws-info/${this.getCompanyId}`);
        if (response.data && response.data.ws_ready) {
          this.statusWs.variant = 'success';
          console.log('[CHECK] Servicio WhatsApp activo para empresa', this.getCompanyId);
        } else {
          this.statusWs.variant = 'danger';
        }
      } catch (error) {
        console.warn('[CHECK] No se pudo verificar estado inicial:', error.message);
        this.statusWs.variant = 'danger';
      }
    },

    handleVisibilityChange() {
      if (document.hidden) {
        // Si la página se oculta, desconectar WebSocket
        console.log("[WS] Página oculta, desconectando socket.");
        this.disconnectSocket();
      } else {
        // Si la página se vuelve visible, reconectar WebSocket si el modal está abierto
        if (this.modalOpen) {
          console.log("[WS] Página visible, reconectando socket.");
          this.initSocket();
        }
      }
    },

    // --- MÉTODOS DE WEBSOCKET ---

    initSocket() {
      if (!this.$socket) {
        console.error('[WS] Plugin de socket no disponible');
        this.ws.error = 'Error interno: Socket no disponible';
        return;
      }

      console.log('[WS] Iniciando conexión WebSocket...');
      this.$socket.connect();
      this.setupSocketListeners();
    },

    setupSocketListeners() {
      if (!this.$socket) return;

      // Limpiar listeners anteriores
      this.$socket.off('connect');
      this.$socket.off('disconnect');
      this.$socket.off('status');
      this.$socket.off('qr');
      this.$socket.off('ready');
      this.$socket.off('disconnected');
      this.$socket.off('error');

      this.$socket.on('connect', () => {
        console.log('[WS] Conectado al servidor');
        this.socketConnected = true;
        this.ws.error = null;
        // Suscribirse a eventos de la empresa
        this.$socket.emit('subscribe', this.getCompanyId);
      });

      this.$socket.on('disconnect', (reason) => {
        console.log('[WS] Desconectado:', reason);
        this.socketConnected = false;
        // Si se desconecta inesperadamente mientras el modal está abierto
        if (this.modalOpen && reason === 'io server disconnect') {
          this.ws.error = 'Desconectado por el servidor';
        }
      });

      this.$socket.on('status', (data) => {
        console.log('[WS] Estado recibido:', data);
        this.updateState(data);
      });

      this.$socket.on('qr', (data) => {
        console.log('[WS] QR recibido');
        this.ws.qr = data.qr;
        this.ws.ws_ready = false;
        this.ws.error = null;
        this.statusWs.variant = 'danger';

        // Si estábamos esperando QR, limpiar carga
        if (this.isActionLoading && (this.currentAction === 'activate' || this.currentAction === 'fetchQR' || this.currentAction === 'restart')) {
          this.isActionLoading = false;
          this.currentAction = null;
        }
      });

      this.$socket.on('ready', (data) => {
        console.log('[WS] Cliente listo');
        this.ws.ws_ready = true;
        this.ws.qr = null;
        this.ws.error = null;
        this.statusWs.variant = 'success';

        // Limpiar estados de carga
        this.isActionLoading = false;
        this.currentAction = null;
      });

      this.$socket.on('disconnected', (data) => {
        console.log('[WS] Cliente desconectado:', data.reason);
        this.ws.ws_ready = false;
        this.ws.qr = null;
        this.ws.error = `Desconectado: ${data.reason || 'Desconocido'}`;
        this.statusWs.variant = 'danger';

        // Limpiar estados de carga
        this.isActionLoading = false;
        this.currentAction = null;
      });

      this.$socket.on('error', (error) => {
        console.error('[WS] Error:', error);
        this.ws.error = error.message || 'Error de conexión';
        this.statusWs.variant = 'danger';
        this.isActionLoading = false;
        this.currentAction = null;
      });
    },

    disconnectSocket() {
      if (this.$socket && this.socketConnected) {
        console.log('[WS] Desconectando socket...');
        this.$socket.emit('unsubscribe', this.getCompanyId);
        this.$socket.disconnect();
        this.socketConnected = false;
      }
    },

    updateState(data) {
      // Si la empresa no está registrada, activar automáticamente
      if (data.status === 'NOT_REGISTERED') {
        console.log('[WS] Empresa no registrada, activando automáticamente...');
        this.activateWhatsapp(this.getCompanyId);
        return;
      }

      this.ws.ws_ready = data.ws_ready || false;
      this.ws.qr = data.qr || null;
      this.ws.error = data.error || null;
      this.ws.details = data.message || null;
      this.statusWs.variant = this.ws.ws_ready ? 'success' : 'danger';
    },

    onModalShow() {
      console.log("Modal abierto. Iniciando conexión WebSocket...");
      this.modalOpen = true;
      this.initSocket();
    },

    onModalHide() {
      console.log("Modal cerrado. Desconectando WebSocket...");
      this.modalOpen = false;
      this.disconnectSocket();
    },

    // --- ACCIONES QUE AHORA USAN WEBSOCKET ---

    activateWhatsapp(companyId) {
      console.log(`[WS] Activando cliente para ${companyId}`);
      this.isActionLoading = true;
      this.currentAction = "activate";
      this.ws.error = null;
      this.ws.qr = null;

      if (this.$socket && this.socketConnected) {
        this.$socket.emit('activate', companyId);
        // Timeout de seguridad
        setTimeout(() => {
          if (this.isActionLoading && this.currentAction === 'activate') {
            this.isActionLoading = false;
            this.currentAction = null;
            if (!this.ws.qr && !this.ws.ws_ready && !this.ws.error) {
              this.ws.error = "Tiempo de espera agotado. Intente nuevamente.";
            }
          }
        }, 15000);
      } else {
        this.ws.error = 'No conectado al servidor';
        this.isActionLoading = false;
      }
    },

    fetchQRCode(companyId) {
      // En el backend, activar genera el QR si no está listo
      this.activateWhatsapp(companyId);
      this.currentAction = "fetchQR";
    },

    confirmRestart(companyId) {
      this.companyIdToAction = companyId;
      this.$bvModal.show("confirm-restart-modal");
    },

    performRestartClient(companyId) {
      if (!companyId) return;
      console.log(`[WS] Reiniciando cliente para ${companyId}`);
      this.isActionLoading = true;
      this.currentAction = "restart";
      this.$bvModal.hide("confirm-restart-modal");
      this.ws.error = null;

      if (this.$socket && this.socketConnected) {
        this.$socket.emit('restart', companyId);
        setTimeout(() => {
          if (this.isActionLoading && this.currentAction === 'restart') {
            this.isActionLoading = false;
            this.currentAction = null;
          }
        }, 30000); // 30s timeout para reinicio
      } else {
        this.ws.error = 'No conectado al servidor';
        this.isActionLoading = false;
      }
    },

    confirmDisconnect(companyId) {
      this.companyIdToAction = companyId;
      this.$bvModal.show("confirm-disconnect-modal");
    },

    performDisconnectClient(companyId) {
      if (!companyId) return;
      console.log(`[WS] Desconectando cliente para ${companyId}`);
      this.isActionLoading = true;
      this.currentAction = "disconnect";
      this.$bvModal.hide("confirm-disconnect-modal");

      if (this.$socket && this.socketConnected) {
        this.$socket.emit('disconnect-client', companyId);
        // La respuesta vendrá por el evento 'disconnected' o 'status'
        setTimeout(() => {
          if (this.isActionLoading && this.currentAction === 'disconnect') {
            this.isActionLoading = false;
            this.currentAction = null;
          }
        }, 10000);
      } else {
        this.ws.error = 'No conectado al servidor';
        this.isActionLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.qr-reloading {
  filter: brightness(0.4);
  transition: filter 0.2s ease-in-out;
}

.qr-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}
</style>
