<template>
  <div class="d-inline">
    <b-button 
      v-if="hasHistorial"
      @click="openModal" 
      variant="outline-info" 
      size="sm" 
      v-b-tooltip.hover 
      title="Ver Auditoría de Cambios"
      class="btn-audit"
    >
      <b-icon icon="clock-history"></b-icon>
      <b-badge v-if="historialCount > 0" variant="light" class="ml-1">{{ historialCount }}</b-badge>
    </b-button>

    <b-modal 
      :id="modalId" 
      :title="`Auditoría de Movimiento #${idMovimiento}`" 
      size="lg" 
      hide-footer
      header-bg-variant="info"
      header-text-variant="white"
    >
      <b-overlay :show="loading" spinner-variant="info">
        <div v-if="!loading && historial.length === 0" class="text-center py-4">
          <b-icon icon="info-circle" font-scale="3" variant="muted"></b-icon>
          <p class="mt-3 text-secondary">No se encontraron registros de auditoría para este movimiento.</p>
        </div>

        <div v-else class="audit-timeline">
          <div v-for="(cambio, index) in historial" :key="cambio._id" class="audit-item">
            <div class="audit-marker"></div>
            <div class="audit-content card shadow-sm mb-3">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="user-info">
                    <b-avatar size="sm" variant="info" class="mr-2"></b-avatar>
                    <strong>{{ cambio.usuario_nombre || 'Sistema' }}</strong>
                  </div>
                  <span class="badge badge-light border">
                    <b-icon icon="calendar3" class="mr-1"></b-icon>
                    {{ formatDateTime(cambio.fecha) }}
                  </span>
                </div>

                <div class="change-details p-2 bg-light rounded border mb-2">
                  <div class="d-flex align-items-center flex-wrap">
                    <span class="text-muted mr-2">Campo:</span>
                    <b-badge variant="dark" class="mr-3">{{ cambio.campo_modificado }}</b-badge>
                    
                    <div class="values-flow d-flex align-items-center">
                      <span class="val-prev text-danger">{{ cambio.valor_anterior }}</span>
                      <b-icon icon="arrow-right-short" font-scale="1.5" class="mx-2 text-muted"></b-icon>
                      <span class="val-new text-success font-weight-bold">{{ cambio.valor_nuevo }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="cambio.observaciones" class="audit-notes italic border-left pl-3 mt-2 text-secondary">
                  <b-icon icon="chat-quote" class="mr-1"></b-icon>
                  "{{ cambio.observaciones }}"
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ModalHistorialMovimiento",
  props: {
    idMovimiento: {
      type: [Number, String],
      required: true
    },
    historialCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      modalId: `modal-audit-${this.idMovimiento}`,
      loading: false,
      historial: []
    }
  },
  computed: {
    hasHistorial() {
      return this.historialCount > 0;
    }
  },
  methods: {
    openModal() {
      this.$bvModal.show(this.modalId);
      this.loadHistorial();
    },
    async loadHistorial() {
      this.loading = true;
      try {
        const response = await this.$axios.get(`${this.$config.API}/inventario/movimientos/${this.idMovimiento}/historial`);
        if (response.data.success) {
          this.historial = response.data.items || [];
        }
      } catch (error) {
        console.error("Error cargando historial de auditoría:", error);
      } finally {
        this.loading = false;
      }
    },
    formatDateTime(val) {
      if (!val) return "";
      return new Date(val).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.audit-timeline {
  padding: 10px 0 10px 20px;
  position: relative;
  max-height: 500px;
  overflow-y: auto;
}

.audit-timeline::before {
  content: "";
  position: absolute;
  left: 5px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.audit-item {
  position: relative;
  padding-left: 25px;
}

.audit-marker {
  position: absolute;
  left: -19px;
  top: 15px;
  width: 10px;
  height: 10px;
  background: #17a2b8;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #17a2b8;
  z-index: 1;
}

.val-prev {
  text-decoration: line-through;
  font-style: italic;
}

.audit-notes {
  font-size: 0.9rem;
  font-style: italic;
}

.btn-audit {
  transition: all 0.2s;
}

.btn-audit:hover {
  transform: scale(1.1);
}
</style>
