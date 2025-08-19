<template>
  <b-modal :id="modalId" title="Detalle de Eficiencia de Insumos" @hidden="onHidden">
    <div v-if="insumo">
      <p><strong>Orden:</strong> {{ insumo.id_orden }}</p>
      <p><strong>Producto:</strong> {{ insumo.nombre_producto }}</p>
      <p><strong>Talla:</strong> {{ insumo.talla }}</p>
      <p><strong>Insumo:</strong> {{ insumo.nombre_insumo }}</p>
      <p><strong>Piezas:</strong> {{ insumo.cantidad_piezas }}</p>
      <p><strong>Consumo Estimado:</strong> {{ insumo.consumo_estimado_total }}</p>
      <p><strong>Consumo Real:</strong> {{ insumo.consumo_real_total }}</p>
      <p><strong>Diferencia:</strong> {{ insumo.diferencia }}</p>
    </div>
    <div v-else>
      <p>No hay datos del insumo para mostrar.</p>
    </div>
    <template #modal-footer>
      <b-button variant="secondary" @click="hideModal">Cerrar</b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'EficienciaInsumosDetalleModal',
  props: {
    insumo: {
      type: Object,
      default: null,
    },
    modalId: {
      type: String,
      required: true,
    },
  },
  methods: {
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
