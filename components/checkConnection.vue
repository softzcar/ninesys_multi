<template>
  <div>
    <div v-if="$store.state.login.dataUser.acceso" class="floatme">
      <b-button :disabled="disableBtnOnIdDep" @click="$bvModal.show(modalId)" variant="light">
        <span style="margin-right: 10px">
          <b-icon icon="whatsapp" :variant="statusVariant" font-scale="1.2" />
        </span>
        <span v-if="$nuxt.isOffline">
          <b-icon icon="wifi-off" variant="danger" />
        </span>
        <span v-else>
          <b-icon icon="wifi" variant="success" />
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

    <div v-else class="floatme">
      <b-button disabled variant="light">
        <b-icon icon="whatsapp" variant="secondary" font-scale="1.2" />
        <span style="margin-left: 10px">
          <b-icon
            :icon="$nuxt.isOffline ? 'wifi-off' : 'wifi'"
            :variant="$nuxt.isOffline ? 'danger' : 'success'"
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
.floatme {
  float: right;
  margin-bottom: 10px;
}
</style>
