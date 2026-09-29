<template>
  <div class="connection-status-wrapper">
    <div v-if="$store.state.login.dataUser.acceso">
      <b-button
        :disabled="disableBtnOnIdDep"
        @click="$bvModal.show(modalId)"
        variant="light"
        class="header-action-btn d-inline-flex align-items-center justify-content-center"
        v-b-tooltip.hover.bottom
        title="Estado del Servicio de WhatsApp"
      >
        <span class="d-inline-flex align-items-center flex-nowrap">
          <b-icon icon="whatsapp" :variant="statusVariant" font-scale="1.15" class="mr-2" />
          <b-icon
            :icon="$nuxt.isOffline ? 'wifi-off' : 'wifi'"
            :variant="$nuxt.isOffline ? 'danger' : 'success'"
            font-scale="0.95"
          />
        </span>
      </b-button>


      <b-modal
        :id="modalId"
        title="Estado del Servicio de WhatsApp"
        hide-footer
        size="xl"
        @show="onModalShow"
        @hide="onModalHide"
      >
        <!-- Panel de conexión compartido: solo se monta cuando el modal está abierto -->
        <whatsapp-WaConnectionPanel
          v-if="modalOpen"
          :show-health="false"
          @status-change="onStatusChange"
        />

        <!-- Herramientas adicionales (visible solo cuando la sesión está activa) -->
        <div v-if="isConnected" class="mt-2 pb-2">
          <div class="d-flex flex-wrap">
            <span class="mr-2 mb-2"><admin-departamentosEditWs /></span>
            <span class="mr-2 mb-2"><admin-WsSendMsg /></span>
            <span class="mr-2 mb-2"><admin-WsSendMsgCustomInterno /></span>
          </div>
        </div>
      </b-modal>
    </div>

    <div v-else>
      <b-button
        disabled
        variant="light"
        class="header-action-btn d-inline-flex align-items-center justify-content-center"
      >
        <span class="d-inline-flex align-items-center flex-nowrap">
          <b-icon icon="whatsapp" variant="secondary" font-scale="1.15" class="mr-2" />
          <b-icon
            :icon="$nuxt.isOffline ? 'wifi-off' : 'wifi'"
            :variant="$nuxt.isOffline ? 'danger' : 'success'"
            font-scale="0.95"
          />
        </span>
      </b-button>
    </div>
  </div>

</template>

<script>
import AdminWsSendMsgCustomInterno from "./admin/WsSendMsgCustomInterno.vue"

export default {
  components: { AdminWsSendMsgCustomInterno },

  data() {
    return {
      modalId: "whatsapp-status-modal",
      modalOpen: false,
      statusVariant: "danger",
      isConnected: false,
    }
  },

  computed: {
    disableBtnOnIdDep() {
      return this.$store.state.login.currentDepartamentId === null
    },
    companyId() {
      return this.$store.state.login.dataEmpresa?.id
    },
  },

  mounted() {
    if (this.$store.state.login.dataUser?.acceso) {
      this.checkInitialStatus()
    }
  },

  methods: {
    async checkInitialStatus() {
      try {
        const { data } = await this.$wsApi.get(`/ws-info/${this.companyId}`, { timeout: 3000 })
        if (data.ws_ready) {
          this.statusVariant = 'success'
          this.isConnected = true
        }
      } catch (e) {
        console.warn('[CHECK-WS] No se pudo verificar estado inicial:', e.message)
      }
    },

    onModalShow() {
      this.modalOpen = true
    },

    onModalHide() {
      this.modalOpen = false
    },

    onStatusChange({ status, variant }) {
      this.statusVariant = variant
      this.isConnected = status === 'READY'
    },
  },
}
</script>

<style scoped>
.connection-status-wrapper {
  display: inline-flex;
  align-items: center;
}

.header-action-btn {
  height: 38px;
  padding: 0 0.65rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
  background-color: #fff;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.header-action-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}
</style>

