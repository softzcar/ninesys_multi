<template>
  <div>
    <b-link @click="showModal">$ {{ valor.toFixed(2) }}</b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Insumos - Orden #${id_orden}`"
      hide-footer
      size="xl"
    >
      <b-overlay :show="isLoading" rounded="sm">
        <div
          v-if="
            !isLoading &&
            (reporte.tintas.length || reporte.insumos_consumidos.length)
          "
        >
          <!-- Tabla de Tintas -->
          <h4 class="mt-4">Tintas</h4>
          <b-table
            striped
            hover
            :items="reporte.tintas"
            :fields="fieldsTinta"
            responsive
          >
            <template #cell(total_tinta)="data">
              {{ data.item.total_tinta.toFixed(2) }} ml
            </template>
          </b-table>

          <!-- Tabla de Insumos -->
          <h4 class="mt-4">Insumos</h4>
          <b-table
            striped
            hover
            :items="reporte.insumos_consumidos"
            :fields="fieldsInsumos"
            responsive
          >
            <template #cell(total_insumo)="data">
              $ {{ data.item.total_insumo.toFixed(2) }}
            </template>
            <template #cell(cantidad_utilizada)="data">
              {{ data.item.cantidad_utilizada.toFixed(2) }}
              {{ data.item.unidad }}
            </template>
            <template #cell(cantidad_restante)="data">
              {{ data.item.cantidad_restante.toFixed(2) }}
              {{ data.item.unidad }}
            </template>
          </b-table>
        </div>
        <p v-else>No se encontraron insumos para esta orden.</p>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ReporteCostosDeProduccionInsumos",
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
        insumos_consumidos: [],
      },
      isLoading: false,
      fieldsTinta: [
        { key: "cyan", label: "Cyan" },
        { key: "magenta", label: "Magenta" },
        { key: "yellow", label: "Yellow" },
        { key: "black", label: "Black" },
        { key: "total_tinta", label: "Total Tinta" },
      ],
      fieldsInsumos: [
        { key: "nombre_insumo", label: "Insumo" },
        { key: "costo", label: "Costo" },
        { key: "cantidad_utilizada", label: "Utilizado" },
        { key: "cantidad_restante", label: "Restante" },
        { key: "total_insumo", label: "Total Insumo" },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-insumos-${this.id_orden}`;
    },
  },
  methods: {
    async getInsumosOrden() {
      this.isLoading = true;
      try {
        const url = `${this.$config.API}/reporte/insumos-cosumidos-por-orden/${this.id_orden}`;
        const { data } = await this.$axios.get(url);
        this.reporte = data;
      } catch (error) {
        console.error("Error al obtener los insumos de la orden:", error);
        this.$bvToast.toast(
          "No se pudieron cargar los detalles de los insumos.",
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
      this.getInsumosOrden();
      this.$bvModal.show(this.modalId);
    },
  },
};
</script>