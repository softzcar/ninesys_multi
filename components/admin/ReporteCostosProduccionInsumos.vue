<template>
  <div>
    <b-link @click="showModal">{{ valor.toFixed(2) }}%</b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Eficiencia de Insumos - Orden #${id_orden}`"
      hide-footer
      size="xl"
    >
      <div v-if="reporte.insumos_detalles && reporte.insumos_detalles.length">
        <b-table
          striped
          hover
          :items="reporte.insumos_detalles"
          :fields="fields"
          responsive
        >
          <template #cell(eficiencia)="data">
            <strong>{{ data.item.eficiencia ? data.item.eficiencia.toFixed(2) : '0.00' }}%</strong>
          </template>
        </b-table>
      </div>
      <p v-else>No se encontraron datos de eficiencia de insumos para esta orden.</p>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ReporteCostosProduccionInsumos",
  props: {
    id_orden: {
      type: [Number, String],
      required: true,
    },
    valor: {
      type: Number,
      required: true,
    },
    insumos_detalles: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      reporte: {
        insumos_detalles: [],
      },
      fields: [
        { key: "producto", label: "Producto" },
        { key: "insumo", label: "Insumo" },
        { key: "eficiencia", label: "Eficiencia" },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-insumos-eficiencia-${this.id_orden}`;
    },
  },
  methods: {
    showModal() {
      // Filtrar insumos_detalles por la orden específica
      this.reporte.insumos_detalles = this.insumos_detalles.filter(item =>
        item.id_orden == this.id_orden
      );
      this.$bvModal.show(this.modalId);
    },
  },
};
</script>