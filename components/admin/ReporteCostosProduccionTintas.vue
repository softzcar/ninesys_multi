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
        colores_detalles: [],
      },
      isLoading: false,
    };
  },
  computed: {
    modalId() {
      return `modal-tintas-${this.id_orden}`;
    },
    coloresDetalles() {
      return this.reporte.colores_detalles && this.reporte.colores_detalles.length
        ? this.reporte.colores_detalles
        : [
            { codigo: "C", nombre: "Cyan", key: "cyan" },
            { codigo: "M", nombre: "Magenta", key: "magenta" },
            { codigo: "Y", nombre: "Yellow", key: "yellow" },
            { codigo: "K", nombre: "Black", key: "black" },
            { codigo: "W", nombre: "White", key: "white" }
          ];
    },
    fields() {
      const base = [];
      this.coloresDetalles.forEach(col => {
        base.push({
          key: col.key,
          label: col.nombre,
          formatter: (value) => `${(Number(value) || 0).toFixed(2)} ml`
        });
      });
      base.push({ key: "total_tinta_consumo_ml", label: "Total Consumo" });
      base.push({ key: "total_tinta_costo", label: "Total Costo" });
      return base;
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