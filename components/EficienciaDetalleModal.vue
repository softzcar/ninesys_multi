<template>
  <b-modal :id="modalId" title="Detalle de Eficiencia" @hidden="onHidden">
    <div v-if="orden">
      <p><strong>Orden:</strong> {{ orden.id_orden }}</p>
      <p><strong>Cliente:</strong> {{ orden.cliente }}</p>
      <p><strong>Fecha de Inicio:</strong> {{ formatTimestamp(orden.fecha_inicio) }}</p>
      <p><strong>Fecha de Fin:</strong> {{ formatTimestamp(orden.fecha_terminado) }}</p>
      <p><strong>Tiempo Empleado:</strong> {{ formatDuration(orden.tiempo_empleado) }}</p>
      <p><strong>Tiempo Estimado:</strong> {{ orden.tiempo_estimado_de_produccion }} minutos</p>
      <p><strong>Diferencia Tiempo (Rendimiento):</strong> {{ formatSecondsToHours(orden.rendimiento) }}</p>
    </div>
    <div v-else>
      <p>No hay datos de la orden para mostrar.</p>
    </div>
    <template #modal-footer>
      <b-button variant="secondary" @click="hideModal">Cerrar</b-button>
    </template>
  </b-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'EficienciaDetalleModal',
  props: {
    orden: {
      type: Object,
      default: null,
    },
    modalId: {
      type: String,
      required: true,
    },
  },
  methods: {
    formatTimestamp(timestamp) {
      if (!timestamp) return 'N/A'
      return moment(timestamp).format('DD/MM/YYYY HH:mm:ss')
    },
    formatDuration(seconds) {
      if (seconds === null || seconds === undefined) return 'N/A'
      const duration = moment.duration(seconds, 'seconds')
      const days = Math.floor(duration.asDays())
      const hours = duration.hours()
      const minutes = duration.minutes()
      return `${days}d ${hours}h ${minutes}m`
    },
    formatSecondsToHours(seconds) {
      if (seconds === null || seconds === undefined) return 'N/A'
      const hours = seconds / 3600
      return `${hours.toFixed(2)} horas`
    },
    hideModal() {
      this.$bvModal.hide(this.modalId)
    },
    onHidden() {
      this.$emit('modal-closed')
    },
  },
}
</script>

<style scoped>
p {
  margin-bottom: 0.5rem;
}
</style>
