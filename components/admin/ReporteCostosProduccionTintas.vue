<template>
  <div>
    <b-link @click="showModal">$ {{ valor.toFixed(2) }}</b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Tintas Consumidas - Orden #${id_orden}`"
      hide-footer
      size="xl"
    >
      <b-overlay :show="isLoading" rounded="sm">
        <div v-if="!isLoading && reporte.tintas.length">
          <b-table
            striped
            hover
            :items="reporte.tintas"
            :fields="fields"
            responsive
          >
            <template #cell(cyan)="data">
              {{ data.item.cyan ? data.item.cyan.toFixed(2) : '0.00' }} ml
            </template>
            <template #cell(magenta)="data">
              {{ data.item.magenta ? data.item.magenta.toFixed(2) : '0.00' }} ml
            </template>
            <template #cell(yellow)="data">
              {{ data.item.yellow ? data.item.yellow.toFixed(2) : '0.00' }} ml
            </template>
            <template #cell(black)="data">
              {{ data.item.black ? data.item.black.toFixed(2) : '0.00' }} ml
            </template>
            <template #cell(white)="data">
              {{ data.item.white ? data.item.white.toFixed(2) : '0.00' }} ml
            </template>
            <template #cell(total_tinta_consumo_ml)="data">
              <strong>{{ data.item.total_tinta_consumo_ml ? data.item.total_tinta_consumo_ml.toFixed(2) : '0.00' }} ml</strong>
            </template>
            <template #cell(total_tinta_costo)="data">
              <strong>$ {{ data.item.total_tinta_costo ? data.item.total_tinta_costo.toFixed(2) : '0.00' }}</strong>
            </template>
          </b-table>
        </div>
        <p v-else>No se encontraron datos de tintas para esta orden.</p>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ReporteCostosProduccionTintas",
  props: {
    id_orden: {
      type: [Number, String],
      required: true,
    },
    valor: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      reporte: {
        tintas: [],
      },
      isLoading: false,
      fields: [
        { key: "cyan", label: "Cyan" },
        { key: "magenta", label: "Magenta" },
        { key: "yellow", label: "Yellow" },
        { key: "black", label: "Black" },
        { key: "white", label: "White" },
        { key: "total_tinta_consumo_ml", label: "Total Consumo" },
        { key: "total_tinta_costo", label: "Total Costo" },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-tintas-${this.id_orden}`;
    },
  },
  methods: {
    async getTintasOrden() {
      this.isLoading = true;
      try {
        const url = `${this.$config.API}/reporte/insumos-cosumidos-por-orden/${this.id_orden}`;
        const { data } = await this.$axios.get(url);
        this.reporte = data;
      } catch (error) {
        console.error("Error al obtener las tintas de la orden:", error);
        this.$bvToast.toast(
          "No se pudieron cargar los detalles de las tintas.",
          {
            title: "Error",
            variant: "danger",
            solid: true,
          }
        );
      } finally {
        this.isLoading = false;
      }
    },
    showModal() {
      this.getTintasOrden();
      this.$bvModal.show(this.modalId);
    },
  },
};
</script>