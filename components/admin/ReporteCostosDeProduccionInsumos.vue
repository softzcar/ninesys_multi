<template>
  <div>
    <b-link @click="showModal">$ {{ (Number(costoInsumosTotal) || 0).toFixed(2) }}</b-link>

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
            foot-clone
          >
            <template #cell(total_tinta_consumo_ml)="data">
              {{ (Number(data.item.total_tinta_consumo_ml) || 0).toFixed(2) }} ml
            </template>
            <template #cell(total_tinta_costo)="data">
              $ {{ (Number(data.item.total_tinta_costo) || 0).toFixed(2) }}
            </template>

            <!-- Footer para Tintas -->
            <template #foot(cyan)>
              <strong>Totales:</strong>
            </template>
            <template #foot(magenta)>
              <span>&nbsp;</span>
            </template>
            <template #foot(yellow)>
              <span>&nbsp;</span>
            </template>
            <template #foot(black)>
              <span>&nbsp;</span>
            </template>
            <template #foot(total_tinta_consumo_ml)>
              <strong>{{ totalTintaML.toFixed(2) }} ml</strong>
            </template>
            <template #foot(total_tinta_costo)>
              <strong class="text-primary">$ {{ totalTintaCosto.toFixed(2) }}</strong>
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
            foot-clone
          >
            <template #cell(sku)="data">
              {{ data.item.sku }} - {{ data.item.id_insumo }}
            </template>
            <template #cell(total_insumo)="data">
              $ {{ (Number(data.item.total_insumo) || 0).toFixed(2) }}
            </template>
            <template #cell(cantidad_utilizada)="data">
              {{ (Number(data.item.cantidad_utilizada) || 0).toFixed(2) }}
              {{ data.item.unidad }}
            </template>
            <template #cell(cantidad_restante)="data">
              {{ (Number(data.item.cantidad_restante) || 0).toFixed(2) }}
              {{ data.item.unidad }}
            </template>

            <!-- Footer para Insumos -->
            <template #foot(sku)>
              <strong>Totales:</strong>
            </template>
            <template #foot(nombre_insumo)>
              <span>&nbsp;</span>
            </template>
            <template #foot(costo)>
              <span>&nbsp;</span>
            </template>
            <template #foot(cantidad_utilizada)>
              <span>&nbsp;</span>
            </template>
            <template #foot(cantidad_restante)>
              <span>&nbsp;</span>
            </template>
            <template #foot(total_insumo)>
              <strong class="text-primary">$ {{ totalInsumosCosto.toFixed(2) }}</strong>
            </template>
          </b-table>

          <!-- Resumen Total -->
          <div class="mt-4 p-3 bg-light border rounded">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="mb-0">TOTAL INSUMOS</h3>
              <h3 class="mb-0 text-primary">$ {{ totalGeneralInsumos.toFixed(2) }}</h3>
            </div>
            <hr />
            <small class="text-muted">
              * El total incluye la sumatoria de Tintas e Insumos consumidos en la orden.
            </small>
          </div>
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
    costoInsumosTotal: {
      type: Number,
      required: true,
      default: 0,
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
        { key: "total_tinta_consumo_ml", label: "Total Tinta" }, // Changed key
        { key: "total_tinta_costo", label: "Total Costo" }, // New field
      ],
      fieldsInsumos: [
        { key: "sku", label: "SKU" }, // New field
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

    totalTintaML() {
      return this.reporte.tintas.reduce((sum, item) => sum + (Number(item.total_tinta_consumo_ml) || 0), 0);
    },
    totalTintaCosto() {
      return this.reporte.tintas.reduce((sum, item) => sum + (Number(item.total_tinta_costo) || 0), 0);
    },
    totalInsumosCosto() {
      return this.reporte.insumos_consumidos.reduce((sum, item) => sum + (Number(item.total_insumo) || 0), 0);
    },
    totalGeneralInsumos() {
      return this.totalTintaCosto + this.totalInsumosCosto;
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
