<template>
  <div>
    <b-link @click="showModal">
      {{ typeof valor === 'string' ? valor : (parseFloat(valor) || 0).toFixed(2) + '%' }}
    </b-link>

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
            <strong>{{ typeof data.item.eficiencia === 'string' ? data.item.eficiencia : ((parseFloat(data.item.eficiencia) || 0).toFixed(2) + '%') }}</strong>
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
      type: [Number, String],
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
      // Filtrar insumos_detalles por la orden específica y asegurar que sea un arreglo
      if (Array.isArray(this.insumos_detalles)) {
        this.reporte.insumos_detalles = this.insumos_detalles.filter(
          (item) => item.id_orden == this.id_orden
        );
      } else {
        this.reporte.insumos_detalles = [];
      }
      this.$bvModal.show(this.modalId);
    },
  },
};
</script>