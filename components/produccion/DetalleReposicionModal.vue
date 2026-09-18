<template>
  <b-modal :id="modalId" title="Detalle de la Reposición" size="lg" hide-footer>
    <b-overlay :show="cargando" spinner-small>
      <div v-if="repoDetalle">
        <b-container fluid class="p-0">
          <b-row class="mb-3">
            <b-col md="6">
              <div class="card h-100 shadow-sm border-light">
                <div class="card-header bg-dark text-white font-weight-bold d-flex align-items-center justify-content-between py-2">
                  <span><b-icon icon="info-square" class="mr-1"></b-icon> Información Básica</span>
                  <b-badge variant="light">ID: #{{ repoDetalle.id_reposicion }}</b-badge>
                </div>
                <b-list-group flush>
                  <b-list-group-item>
                    <strong>Orden Vinculada:</strong> <linkSearch :id="repoDetalle.id_orden" :key="repoDetalle.id_orden" class="ml-1" />
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Estado de la Orden:</strong> <badge-estatus-orden :estatus="repoDetalle.estatus_orden" />
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Unidades a Reponer:</strong> <b-badge variant="info" pill class="px-2 font-weight-bold">{{ repoDetalle.unidades }}</b-badge>
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Fecha de Solicitud:</strong> <small class="text-muted"><b-icon icon="calendar3" class="mr-1"></b-icon>{{ repoDetalle.fecha_creacion }} {{ repoDetalle.hora_creacion }}</small>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </b-col>

            <b-col md="6">
              <div class="card h-100 shadow-sm border-light">
                <div class="card-header bg-primary text-white font-weight-bold py-2">
                  <b-icon icon="person-badge" class="mr-1"></b-icon> Personas Involucradas
                </div>
                <b-list-group flush>
                  <b-list-group-item class="d-flex align-items-center justify-content-between">
                    <strong>Emisor:</strong>
                    <b-badge variant="light" class="text-dark border font-weight-bold">
                      <b-icon icon="person-fill" class="mr-1"></b-icon>{{ repoDetalle.empleado_emisor || 'N/D' }}
                    </b-badge>
                  </b-list-group-item>
                  <b-list-group-item class="d-flex align-items-center justify-content-between">
                    <strong>Empleado Asignado:</strong>
                    <b-badge v-if="repoDetalle.empleado_asignado" variant="light" class="text-dark border font-weight-bold">
                      <b-icon icon="person-fill" class="mr-1"></b-icon>{{ repoDetalle.empleado_asignado }}
                    </b-badge>
                    <b-badge v-else variant="warning" class="font-weight-bold">
                      <b-icon icon="person-dash-fill" class="mr-1"></b-icon>Sin asignar
                    </b-badge>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </b-col>
          </b-row>

          <b-row class="mb-3">
            <b-col>
              <div class="card shadow-sm border-light">
                <div class="card-header bg-light font-weight-bold py-2">
                  <b-icon icon="tag" class="mr-1 text-secondary"></b-icon> Detalles del Producto
                </div>
                <div class="card-body py-3">
                  <h6 class="font-weight-bold text-dark mb-1">{{ repoDetalle.producto }}</h6>
                  <p class="mb-0 text-muted small">
                    <strong>Talla:</strong> {{ repoDetalle.talla }} &nbsp;&nbsp;|&nbsp;&nbsp;
                    <strong>Corte:</strong> {{ repoDetalle.corte }} &nbsp;&nbsp;|&nbsp;&nbsp;
                    <strong>Tela:</strong> {{ repoDetalle.tela }}
                  </p>
                </div>
              </div>
            </b-col>
          </b-row>

          <b-row class="mb-3">
            <b-col md="6">
              <div class="card shadow-sm border-light">
                <div class="card-header font-weight-bold py-2" style="background-color: rgba(255,193,7,0.1); border-bottom: 1px solid rgba(255,193,7,0.2);">
                  <b-icon icon="exclamation-circle" class="mr-1 text-warning"></b-icon> Detalle de Solicitud (Emisor)
                </div>
                <div class="card-body p-3 bg-light text-dark" style="min-height: 80px; font-size: 0.95em; white-space: pre-line;">
                  {{ repoDetalle.detalle_emisor || 'Ninguno proporcionado.' }}
                </div>
              </div>
            </b-col>
            <b-col md="6">
              <div class="card shadow-sm border-light">
                <div class="card-header font-weight-bold py-2" style="background-color: rgba(40,167,69,0.1); border-bottom: 1px solid rgba(40,167,69,0.2);">
                  <b-icon icon="check2-circle" class="mr-1 text-success"></b-icon> Detalle de Aprobación (Jefe de Producción)
                </div>
                <div class="card-body p-3 bg-light text-dark" style="min-height: 80px; font-size: 0.95em; white-space: pre-line;">
                  {{ repoDetalle.detalle_encargado || 'Ninguno proporcionado.' }}
                </div>
              </div>
            </b-col>
          </b-row>
        </b-container>
      </div>
      <div v-else-if="!cargando" class="text-muted text-center py-4">
        No se encontró información de esta reposición.
      </div>
    </b-overlay>
    <div class="text-right mt-3 border-top pt-2">
      <b-button variant="secondary" size="sm" @click="$bvModal.hide(modalId)">Cerrar</b-button>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DetalleReposicionModal',
  data() {
    return {
      repoDetalle: null,
      cargando: false,
    }
  },
  computed: {
    modalId() {
      return `detalle-reposicion-info-${this._uid}`
    },
  },
  methods: {
    // Ya se cuenta con el objeto completo (ej. la fila de una tabla que ya
    // lo cargó) -- se muestra directo, sin pedirlo de nuevo al servidor.
    abrirConItem(item) {
      this.repoDetalle = item
      this.$bvModal.show(this.modalId)
    },

    // Solo se tiene el ID de la reposición -- se pide el detalle completo
    // reusando la misma consulta que alimenta /produccion/reporte-reposiciones,
    // filtrada a esa única reposición.
    async abrirConId(idReposicion) {
      this.repoDetalle = null
      this.cargando = true
      this.$bvModal.show(this.modalId)
      try {
        const url = `${this.$config.API}/reposiciones-reporte/todas?id_reposicion=${idReposicion}`
        const res = await this.$axios.get(url)
        this.repoDetalle = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null
      } catch (e) {
        console.error('Error cargando detalle de reposición:', e)
        this.repoDetalle = null
      } finally {
        this.cargando = false
      }
    },
  },
}
</script>
