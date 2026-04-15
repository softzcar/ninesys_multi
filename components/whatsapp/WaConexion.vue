<template>
  <div>
    <!-- Acciones -->
    <b-card class="mb-4 border-0 shadow-sm" header="Acciones">
      <div class="d-flex flex-wrap gap-2">
        <b-button
          variant="outline-info"
          :disabled="actionLoading !== null"
          @click="doRestart"
        >
          <b-spinner v-if="actionLoading === 'restart'" small class="mr-1" />
          <b-icon v-else icon="arrow-clockwise" class="mr-1" />
          Reiniciar conexión
        </b-button>

        <b-button
          variant="outline-danger"
          :disabled="actionLoading !== null || session.status === 'NOT_REGISTERED'"
          @click="confirmDisconnect"
        >
          <b-spinner v-if="actionLoading === 'disconnect'" small class="mr-1" />
          <b-icon v-else icon="power" class="mr-1" />
          Desvincular sesión
        </b-button>

        <b-button
          variant="outline-secondary"
          :disabled="actionLoading !== null"
          @click="refreshStatus"
        >
          <b-spinner v-if="actionLoading === 'refresh'" small class="mr-1" />
          <b-icon v-else icon="arrow-repeat" class="mr-1" />
          Actualizar estado
        </b-button>
      </div>
      <small class="text-muted d-block mt-2">
        <strong>Reiniciar:</strong> cierra y reabre la sesión actual (conserva el vínculo).
        <strong>Desvincular:</strong> elimina las credenciales y requiere escanear un nuevo código QR.
      </small>
    </b-card>

    <!-- Estado de la conexión -->
    <b-card class="mb-4 border-0 shadow-sm">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="mb-1">Estado de la Conexión</h5>
          <p class="text-muted mb-0">
            Sesión de WhatsApp vinculada a esta empresa.
          </p>
        </div>
        <b-badge :variant="statusVariant" pill class="px-3 py-2" style="font-size: 0.85rem">
          {{ statusLabel }}
        </b-badge>
      </div>

      <!-- Info de sesión cuando está conectada -->
      <div v-if="session.status === 'READY'" class="mt-3">
        <b-row>
          <b-col md="4">
            <small class="text-muted d-block">Número vinculado</small>
            <strong>{{ session.phone_number ? ('+' + session.phone_number) : '-' }}</strong>
          </b-col>
          <b-col md="4">
            <small class="text-muted d-block">Nombre</small>
            <strong>{{ session.pushname || '-' }}</strong>
          </b-col>
          <b-col md="4">
            <small class="text-muted d-block">Último contacto</small>
            <strong>{{ formatDate(session.last_seen_at) }}</strong>
          </b-col>
        </b-row>
      </div>

      <!-- Último error -->
      <b-alert
        v-if="session.last_error && ['ERROR', 'DEGRADED', 'DISCONNECTED'].includes(session.status)"
        variant="danger"
        show
        class="mt-3 mb-0"
      >
        <strong>Error:</strong> {{ session.last_error }}
      </b-alert>

      <!-- Estado DEGRADED -->
      <b-alert v-if="session.status === 'DEGRADED'" variant="warning" show class="mt-3 mb-0">
        La reconexión automática se agotó. Es necesario reiniciar manualmente la conexión.
      </b-alert>
    </b-card>

    <!-- Código QR -->
    <b-card
      v-if="showQrSection"
      class="mb-4 border-0 shadow-sm"
      header="Vincular dispositivo"
    >
      <div class="text-center">
        <div v-if="qrCode" class="qr-container mx-auto mb-3">
          <img :src="qrCode" alt="Código QR WhatsApp" class="img-fluid" style="max-width: 280px" />
        </div>
        <div v-else-if="session.status === 'INITIALIZING'" class="py-4">
          <b-spinner variant="info" />
          <p class="mt-2 text-muted">Preparando código QR...</p>
        </div>
        <div v-else class="py-4">
          <b-icon icon="qr-code" font-scale="3" class="text-muted" />
          <p class="mt-2 text-muted">Esperando código QR...</p>
        </div>
        <p class="text-muted mb-0">
          Abre WhatsApp en tu teléfono, ve a
          <strong>Dispositivos vinculados</strong> y escanea este código.
        </p>
        <small v-if="session.qr_attempts > 0" class="text-muted">
          Intento {{ session.qr_attempts }}
        </small>
      </div>
    </b-card>

    <!-- Salud del servicio -->
    <b-card class="mb-4 border-0 shadow-sm" header="Salud del Servicio">
      <div v-if="serviceHealth">
        <b-row>
          <b-col md="4">
            <small class="text-muted d-block">Estado</small>
            <b-badge :variant="serviceHealth.healthy ? 'success' : 'warning'" class="px-2">
              {{ serviceHealth.healthy ? 'Operativo' : 'Degradado' }}
            </b-badge>
          </b-col>
          <b-col md="4">
            <small class="text-muted d-block">Uptime</small>
            <strong>{{ formatUptime(serviceHealth.uptime_s) }}</strong>
          </b-col>
          <b-col md="4">
            <small class="text-muted d-block">Circuit Breaker IA</small>
            <b-badge :variant="breakerVariant" class="px-2">
              {{ serviceHealth.breakerState || '-' }}
            </b-badge>
          </b-col>
        </b-row>
      </div>
      <div v-else class="text-center py-3">
        <b-spinner small variant="secondary" />
        <small class="text-muted ml-2">Consultando servicio...</small>
      </div>
    </b-card>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "WaConexion",
  data() {
    return {
      session: {
        status: "NOT_REGISTERED",
        phone_number: null,
        pushname: null,
        last_seen_at: null,
        last_error: null,
        qr_attempts: 0,
      },
      qrCode: null,
      actionLoading: null,
      serviceHealth: null,
    };
  },
  computed: {
    ...mapState("login", ["idEmpresa"]),
    statusVariant() {
      const map = {
        READY: "success",
        AUTHENTICATED: "success",
        INITIALIZING: "info",
        REQUIRES_QR: "warning",
        PAUSED: "secondary",
        DISCONNECTED: "danger",
        ERROR: "danger",
        DEGRADED: "danger",
        NOT_REGISTERED: "secondary",
      };
      return map[this.session.status] || "secondary";
    },
    statusLabel() {
      const map = {
        READY: "Conectado",
        AUTHENTICATED: "Autenticado",
        INITIALIZING: "Inicializando...",
        REQUIRES_QR: "Esperando QR",
        PAUSED: "Pausado",
        DISCONNECTED: "Desconectado",
        ERROR: "Error",
        DEGRADED: "Degradado",
        NOT_REGISTERED: "Sin registrar",
      };
      return map[this.session.status] || this.session.status;
    },
    showQrSection() {
      return ["NOT_REGISTERED", "INITIALIZING", "REQUIRES_QR"].includes(
        this.session.status
      );
    },
    breakerVariant() {
      if (!this.serviceHealth) return "secondary";
      const s = this.serviceHealth.breakerState;
      if (s === "closed") return "success";
      if (s === "half-open") return "warning";
      if (s === "open") return "danger";
      return "secondary";
    },
  },
  mounted() {
    this.fetchSessionInfo();
    this.fetchServiceHealth();
    this.initSocket();
  },
  beforeDestroy() {
    this.teardownSocket();
  },
  methods: {
    // ---- Datos iniciales via HTTP ----
    async fetchSessionInfo() {
      try {
        const { data } = await this.$wsApi.get(
          `/session-info/${this.idEmpresa}`
        );
        this.applySessionData(data);
      } catch (e) {
        console.error("[WaConexion] fetchSessionInfo error:", e.message);
      }
    },

    async fetchServiceHealth() {
      try {
        // /health y /ready no requieren auth
        const base = this.$wsApi.defaults.baseURL;
        const [healthRes, readyRes] = await Promise.all([
          this.$axios.get(`${base}/health`),
          this.$axios.get(`${base}/ready`).catch(() => null),
        ]);
        const health = healthRes.data || {};
        const ready = readyRes ? readyRes.data : null;
        this.serviceHealth = {
          healthy: ready ? ready.status === "ready" : true,
          uptime_s: health.uptime_s || 0,
          breakerState: ready?.checks?.ai_breaker?.state || "closed",
        };
      } catch (e) {
        console.error("[WaConexion] fetchServiceHealth error:", e.message);
        this.serviceHealth = null;
      }
    },

    applySessionData(data) {
      this.session.status = data.status || "NOT_REGISTERED";
      this.session.phone_number = data.phone_number || data.phoneNumber || null;
      this.session.pushname = data.pushname || null;
      this.session.last_seen_at = data.last_seen_at || null;
      this.session.last_error = data.last_error || data.lastError || data.message || null;
      this.session.qr_attempts = data.qr_attempts || data.qrAttempts || 0;

      if (data.qr) {
        this.qrCode = data.qr;
      } else if (this.session.status !== "REQUIRES_QR") {
        this.qrCode = null;
      }
    },

    // ---- Socket.IO en tiempo real ----
    initSocket() {
      const socket = this.$wsSocket;
      if (!socket) return;

      this.setupSocketListeners(socket);

      const doSubscribe = () => {
        socket.emit("subscribe", this.idEmpresa);
      };

      if (socket.connected) {
        doSubscribe();
      } else {
        socket.once("connect", doSubscribe);
        socket.connect();
      }
    },

    setupSocketListeners(socket) {
      socket.off("qr", this._onQr);
      socket.off("ready", this._onReady);
      socket.off("status", this._onStatus);
      socket.off("disconnected", this._onDisconnected);
      socket.off("error", this._onError);

      this._onQr = (data) => {
        if (data.companyId && String(data.companyId) !== String(this.idEmpresa)) return;
        this.qrCode = data.qr;
        this.session.status = "REQUIRES_QR";
      };

      this._onReady = (data) => {
        if (data.companyId && String(data.companyId) !== String(this.idEmpresa)) return;
        this.session.status = "READY";
        this.session.last_error = null;
        this.qrCode = null;
        // Recargar info completa para obtener phone/pushname
        this.fetchSessionInfo();
      };

      this._onStatus = (data) => {
        if (data.companyId && String(data.companyId) !== String(this.idEmpresa)) return;
        this.session.status = data.status;
        if (data.message) this.session.last_error = data.message;
        if (data.pausedUntil) this.session.pausedUntil = data.pausedUntil;
      };

      this._onDisconnected = (data) => {
        if (data.companyId && String(data.companyId) !== String(this.idEmpresa)) return;
        this.session.status = "DISCONNECTED";
        this.session.last_error = data.reason || "Desconectado";
        this.qrCode = null;
      };

      this._onError = (data) => {
        if (data.companyId && String(data.companyId) !== String(this.idEmpresa)) return;
        this.session.last_error = data.message || "Error desconocido";
      };

      socket.on("qr", this._onQr);
      socket.on("ready", this._onReady);
      socket.on("status", this._onStatus);
      socket.on("disconnected", this._onDisconnected);
      socket.on("error", this._onError);
    },

    teardownSocket() {
      const socket = this.$wsSocket;
      if (!socket) return;
      socket.off("qr", this._onQr);
      socket.off("ready", this._onReady);
      socket.off("status", this._onStatus);
      socket.off("disconnected", this._onDisconnected);
      socket.off("error", this._onError);
    },

    // ---- Acciones ----
    async doRestart() {
      this.actionLoading = "restart";
      try {
        await this.$wsApi.post(`/restart/${this.idEmpresa}`);
        this.$bvToast.toast("Reinicio solicitado. Esperando reconexión...", {
          title: "Conexión WhatsApp",
          variant: "info",
        });
        this.session.status = "INITIALIZING";
        this.session.last_error = null;
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error al reiniciar",
          variant: "danger",
        });
      } finally {
        this.actionLoading = null;
      }
    },

    async confirmDisconnect() {
      const ok = await this.$bvModal.msgBoxConfirm(
        "Esto eliminará las credenciales de la sesión actual. Tendrás que escanear un nuevo código QR para vincular el dispositivo de nuevo.",
        {
          title: "Desvincular sesión de WhatsApp",
          okVariant: "danger",
          okTitle: "Desvincular",
          cancelTitle: "Cancelar",
        }
      );
      if (!ok) return;

      this.actionLoading = "disconnect";
      try {
        await this.$wsApi.delete(`/disconnect/${this.idEmpresa}`);
        this.$bvToast.toast(
          "Sesión desvinculada. Generando nuevo código QR...",
          { title: "Conexión WhatsApp", variant: "warning" }
        );
        this.session.status = "INITIALIZING";
        this.session.phone_number = null;
        this.session.pushname = null;
        this.session.last_error = null;
        this.qrCode = null;
        // Dispara init() en backend para generar un nuevo QR
        await this.fetchSessionInfo();
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error al desvincular",
          variant: "danger",
        });
      } finally {
        this.actionLoading = null;
      }
    },

    async refreshStatus() {
      this.actionLoading = "refresh";
      try {
        await Promise.all([this.fetchSessionInfo(), this.fetchServiceHealth()]);
        this.$bvToast.toast("Estado actualizado.", {
          title: "Conexión WhatsApp",
          variant: "info",
          autoHideDelay: 1500,
        });
      } finally {
        this.actionLoading = null;
      }
    },

    // ---- Formateo ----
    formatDate(val) {
      if (!val) return "-";
      const d = new Date(val);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleString("es", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatUptime(seconds) {
      if (!seconds && seconds !== 0) return "-";
      const s = Math.floor(seconds);
      if (s < 60) return `${s}s`;
      if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      if (h < 24) return `${h}h ${m}m`;
      const d = Math.floor(h / 24);
      return `${d}d ${h % 24}h`;
    },
  },
};
</script>

<style scoped>
.qr-container {
  padding: 16px;
  background: #fff;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  display: inline-block;
}

.gap-2 > * {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
