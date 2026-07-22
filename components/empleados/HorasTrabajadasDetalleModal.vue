<template>
  <b-modal
    :id="modalId"
    title="Detalle de Horas Trabajadas"
    size="lg"
    @hidden="onHidden"
  >
    <div v-if="Array.isArray(tareas) && tareas.length > 0">
      <p class="text-muted small mb-3">
        Tiempo real de tareas terminadas, independientemente de si ya fueron pagadas.
      </p>
      <b-table
        bordered
        responsive
        small
        striped
        :items="tareas"
        :fields="fields"
        :per-page="perPage"
        :current-page="currentPage"
      >
        <template #cell(id_orden)="data">
          <linkSearch :id="data.item.id_orden" />
        </template>
        <template #cell(duracion)="data">
          {{ formatDuration(data.item.tiempo_transcurrido) }}
        </template>
        <template #cell(monto_pago)="data">
          {{ data.item.monto_pago !== null && data.item.monto_pago !== undefined ? `$${parseFloat(data.item.monto_pago).toFixed(2)}` : 'N/A' }}
        </template>
        <template #cell(estado_pago)="data">
          <b-badge :variant="data.item.fecha_pago ? 'success' : 'warning'">
            {{ data.item.fecha_pago ? 'Pagado' : 'Pendiente de pago' }}
          </b-badge>
        </template>
      </b-table>
      <b-pagination
        v-if="tareas.length > perPage"
        v-model="currentPage"
        :total-rows="tareas.length"
        :per-page="perPage"
        align="center"
      ></b-pagination>
    </div>
    <div v-else>
      <p>No hay tareas terminadas para mostrar.</p>
    </div>
    <template #modal-footer>
      <b-button variant="secondary" @click="hideModal">Cerrar</b-button>
    </template>
  </b-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'HorasTrabajadasDetalleModal',
  props: {
    tareas: {
      type: Array,
      default: () => [],
    },
    modalId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      perPage: 15,
      currentPage: 1,
      fields: [
        { key: 'id_orden', label: 'Orden', class: 'text-center' },
        {
          key: 'fecha_inicio',
          label: 'Fecha Inicio',
          class: 'text-center',
          formatter: (val) => (val ? moment(val).format('DD/MM/YYYY HH:mm') : 'N/A'),
        },
        {
          key: 'fecha_terminado',
          label: 'Fecha Fin',
          class: 'text-center',
          formatter: (val) => (val ? moment(val).format('DD/MM/YYYY HH:mm') : 'N/A'),
        },
        { key: 'duracion', label: 'Duración', class: 'text-center' },
        { key: 'monto_pago', label: 'Monto', class: 'text-center' },
        { key: 'estado_pago', label: 'Estado de Pago', class: 'text-center' },
      ],
    }
  },
  methods: {
    formatDuration(seconds) {
      if (seconds === null || seconds === undefined) return 'N/A'
      const duration = moment.duration(seconds, 'seconds')
      const days = Math.floor(duration.asDays())
      const hours = duration.hours()
      const minutes = duration.minutes()
      const secs = duration.seconds()
      if (days > 0) return `${days}d ${hours}h ${minutes}m`
      if (hours > 0) return `${hours}h ${minutes}m`
      if (minutes > 0) return `${minutes}m ${secs}s`
      return `${secs}s`
    },
    hideModal() {
      this.$bvModal.hide(this.modalId)
    },
    onHidden() {
      this.currentPage = 1
      this.$emit('modal-closed')
    },
  },
}
</script>
