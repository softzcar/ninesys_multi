<template>
  <div>
    <b-overlay :show="overlay" spinner-variant="primary">
      <b-container>
        <b-row class="mb-4 align-items-center">
          <b-col>
            <h3>Bitácora de Gastos</h3>
            <p class="text-muted mb-0">Historial de modificaciones y eliminaciones realizadas en los registros de gastos.</p>
          </b-col>
        </b-row>

        <!-- Filtros -->
        <b-card class="mb-4" bg-variant="light">
          <b-row>
            <b-col md="3">
              <b-form-group label="Sede de:" label-for="audit-desde" class="mb-0">
                <b-form-input id="audit-desde" v-model="filtros.desde" type="date"></b-form-input>
              </b-form-group>
            </b-col>
            <b-col md="3">
              <b-form-group label="Hasta:" label-for="audit-hasta" class="mb-0">
                <b-form-input id="audit-hasta" v-model="filtros.hasta" type="date"></b-form-input>
              </b-form-group>
            </b-col>
            <b-col md="3">
              <b-form-group label="Acción:" label-for="audit-accion" class="mb-0">
                <b-form-select id="audit-accion" v-model="filtros.accion" :options="opcionesAccion"></b-form-select>
              </b-form-group>
            </b-col>
            <b-col md="3" class="d-flex align-items-end">
              <b-button variant="primary" @click="getAuditoria" block>
                <b-icon icon="search"></b-icon> Filtrar
              </b-button>
            </b-col>
          </b-row>
        </b-card>

        <!-- Tabla -->
        <b-row>
          <b-col>
            <b-table striped hover :items="logs" :fields="fields" responsive show-empty empty-text="No se encontraron registros en la bitácora.">
              <template #cell(fecha_accion)="data">
                {{ formatDateTime(data.item.fecha_accion) }}
              </template>

              <template #cell(accion)="data">
                <b-badge :variant="data.item.accion === 'editado' ? 'warning' : 'danger'">
                  {{ data.item.accion.toUpperCase() }}
                </b-badge>
              </template>

              <template #cell(monto_anterior)="data">
                <span v-if="data.item.monto_anterior !== null" class="text-muted">
                  {{ data.item.monto_anterior | currency }}
                </span>
                <span v-else>-</span>
              </template>

              <template #cell(monto_nuevo)="data">
                <strong v-if="data.item.monto_nuevo !== null">
                  {{ data.item.monto_nuevo | currency }}
                </strong>
                <span v-else>-</span>
              </template>

              <template #cell(detalle)="data">
                <div class="small text-wrap" style="max-width: 250px;">
                  {{ data.item.detalle }}
                </div>
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>
  </div>
</template>

<script>
export default {
  name: 'GastosAuditoria',
  data() {
    const today = new Date().toISOString().substring(0, 10)
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    const sevenDaysAgo = lastWeek.toISOString().substring(0, 10)

    return {
      overlay: false,
      logs: [],
      filtros: {
        desde: sevenDaysAgo,
        hasta: today,
        accion: ''
      },
      opcionesAccion: [
        { value: '', text: 'Todas las acciones' },
        { value: 'editado', text: 'Ediciones' },
        { value: 'eliminado', text: 'Eliminaciones' }
      ],
      fields: [
        { key: 'fecha_accion', label: 'Fecha/Hora', sortable: true },
        { key: 'nombre_usuario', label: 'Usuario', sortable: true },
        { key: 'accion', label: 'Acción', sortable: true },
        { key: 'id_registro', label: 'ID Reg.', sortable: true },
        { key: 'monto_anterior', label: 'Anterior' },
        { key: 'monto_nuevo', label: 'Nuevo' },
        { key: 'detalle', label: 'Motivo / Detalle' }
      ]
    }
  },
  methods: {
    formatDateTime(dt) {
      if (!dt) return '-'
      // MySQL timestamp format YYYY-MM-DD HH:MM:SS
      const d = new Date(dt.replace(' ', 'T'))
      return d.toLocaleString('es-VE')
    },
    async getAuditoria() {
      this.overlay = true
      try {
        const params = {}
        if (this.filtros.desde) params.desde = this.filtros.desde
        if (this.filtros.hasta) params.hasta = this.filtros.hasta
        if (this.filtros.accion) params.accion = this.filtros.accion

        const { data } = await this.$axios.get(`${this.$config.API}/gastos/auditoria`, { params })
        this.logs = data || []
      } catch (e) {
        this.$bvToast.toast('Error al cargar la bitácora.', { title: 'Error', variant: 'danger', solid: true })
      } finally {
        this.overlay = false
      }
    }
  },
  mounted() {
    this.getAuditoria()
  }
}
</script>

<style scoped>
.text-wrap {
  white-space: normal !important;
}
</style>
