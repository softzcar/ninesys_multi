<template>
  <b-modal
    v-model="visible"
    size="xl"
    hide-footer
    body-class="p-0 bg-light"
    header-class="border-0 bg-white"
    title-class="font-weight-bold"
    scrollable
    centered
  >
    <template #modal-title>
      <div v-if="selectedProduct" class="text-dark">
        <b-icon-search class="mr-2 text-primary"></b-icon-search>
        Detalle de Costos por Talla: {{ selectedProduct.nombre }}
        <div class="small text-muted font-weight-normal mt-1">
          SKU: {{ selectedProduct.sku || 'N/A' }} | Precio Venta: ${{ formatNumber(selectedProduct.precio_venta) }}
        </div>
      </div>
    </template>

    <b-overlay :show="loading" spinner-variant="primary" rounded="lg">
      <div class="p-4" style="min-height: 400px;">
        <div v-if="!loading && detailData">
          <!-- Department Benchmarks (Time and Commissions) -->
          <b-row class="mb-4">
            <b-col md="6">
              <b-card no-body class="border-0 shadow-sm h-100">
                <div class="card-header bg-white font-weight-bold text-dark border-0 pb-1">
                  Estándar de Tiempos por Departamento
                </div>
                <div class="card-body py-2">
                  <div v-if="detailData.teorico_tiempo_dept && detailData.teorico_tiempo_dept.length > 0">
                    <div
                      v-for="(t, idx) in detailData.teorico_tiempo_dept"
                      :key="idx"
                      class="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <span class="text-secondary small">{{ t.departamento }}</span>
                      <span class="font-weight-bold text-dark">{{ formatSeconds(t.tiempo) }}</span>
                    </div>
                  </div>
                  <div v-else class="text-center text-muted py-3 small">
                    No hay tiempos estándar configurados.
                  </div>
                </div>
              </b-card>
            </b-col>
            <b-col md="6">
              <b-card no-body class="border-0 shadow-sm h-100">
                <div class="card-header bg-white font-weight-bold text-dark border-0 pb-1">
                  Estándar de Mano de Obra por Departamento
                </div>
                <div class="card-body py-2">
                  <div v-if="detailData.teorico_labor_dept && detailData.teorico_labor_dept.length > 0">
                    <div
                      v-for="(l, idx) in detailData.teorico_labor_dept"
                      :key="idx"
                      class="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <span class="text-secondary small">{{ l.departamento }}</span>
                      <span class="font-weight-bold text-dark">${{ formatNumber(l.comision) }}</span>
                    </div>
                  </div>
                  <div v-else class="text-center text-muted py-3 small">
                    No hay mano de obra de Ficha Técnica configurada.
                  </div>
                </div>
              </b-card>
            </b-col>
          </b-row>

          <!-- Tallas Breakdown List -->
          <h5 class="font-weight-bold text-dark mb-3">Análisis por Tallas</h5>
          <div v-if="detailData.tallas_detalle && detailData.tallas_detalle.length > 0">
            <div
              v-for="talla in detailData.tallas_detalle"
              :key="talla.id_talla"
              class="mb-4 bg-white rounded-lg shadow-sm border-0"
            >
              <!-- Accordion / Card Header -->
              <div class="p-3 d-flex justify-content-between align-items-center bg-white border-bottom rounded-top">
                <div>
                  <span class="h5 font-weight-bold text-primary mr-3">Talla: {{ talla.talla }}</span>
                  <b-badge variant="info" class="font-weight-bold px-2 py-1">
                    {{ talla.unidades_fabricadas }} fabricadas
                  </b-badge>
                </div>
                <div>
                  <span class="text-muted small">Costo Total:</span>
                  <span class="font-weight-bold text-dark ml-1">${{ formatNumber(talla.costo_total_real) }}</span>
                  <span :class="['badge', getDeviationBadgeClass(talla.desviacion_total_pct), 'ml-2']">
                    {{ formatPercent(talla.desviacion_total_pct) }}
                  </span>
                </div>
              </div>

              <!-- Metrics -->
              <div class="p-3 bg-light border-bottom">
                <b-row class="text-center">
                  <b-col md="4" class="border-right border-secondary-50">
                    <div class="small text-muted font-weight-bold">TIEMPO FABRICACIÓN</div>
                    <div class="h5 mb-0 font-weight-bold mt-1">
                      {{ formatSeconds(talla.tiempo_real) }}
                      <span class="text-muted small font-weight-normal">/ Est: {{ formatSeconds(talla.tiempo_estimado) }}</span>
                    </div>
                    <span :class="['badge', getDeviationBadgeClass(talla.desviacion_tiempo_pct), 'mt-1']">
                      {{ formatPercent(talla.desviacion_tiempo_pct) }}
                    </span>
                  </b-col>
                  <b-col md="4" class="border-right border-secondary-50">
                    <div class="small text-muted font-weight-bold">MANO DE OBRA</div>
                    <div class="h5 mb-0 font-weight-bold mt-1">
                      ${{ formatNumber(talla.labor_real) }}
                      <span class="text-muted small font-weight-normal">/ Est: ${{ formatNumber(talla.labor_estimado) }}</span>
                    </div>
                  </b-col>
                  <b-col md="4">
                    <div class="small text-muted font-weight-bold">COSTO MATERIALES</div>
                    <div class="h5 mb-0 font-weight-bold mt-1">
                      ${{ formatNumber(talla.insumos_real) }}
                      <span class="text-muted small font-weight-normal">/ Est: ${{ formatNumber(talla.insumos_estimado) }}</span>
                    </div>
                  </b-col>
                </b-row>
              </div>

              <!-- Materials Table -->
              <div class="p-3">
                <h6 class="font-weight-bold text-secondary mb-2">Desglose de Materiales de Ficha Técnica</h6>
                <div v-if="talla.insumos_detalle && talla.insumos_detalle.length > 0">
                  <b-table
                    striped
                    hover
                    small
                    responsive
                    class="mb-0 text-dark"
                    :items="talla.insumos_detalle"
                    :fields="materialFields"
                  >
                    <template #cell(cantidad_estimada)="data">
                      {{ formatQty(data.item.cantidad_estimada) }} {{ data.item.unidad }}
                    </template>
                    <template #cell(cantidad_real)="data">
                      {{ formatQty(data.item.cantidad_real) }} {{ data.item.unidad }}
                    </template>
                    <template #cell(costo_total_estimado)="data">
                      ${{ formatNumber(data.item.costo_total_estimado) }}
                    </template>
                    <template #cell(costo_total_real)="data">
                      ${{ formatNumber(data.item.costo_total_real) }}
                    </template>
                    <template #cell(desviacion_pct)="data">
                      <span :class="['font-weight-bold', getDeviationTextClass(data.item.desviacion_pct)]">
                        {{ formatPercent(data.item.desviacion_pct) }}
                      </span>
                    </template>
                  </b-table>
                </div>
                <div v-else class="text-center text-muted py-2 small">
                  No hay insumos/materiales registrados para esta talla.
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-5">
            <h5 class="text-muted">No se registran datos teóricos ni reales para este producto.</h5>
          </div>
        </div>
      </div>
    </b-overlay>
  </b-modal>
</template>

<script>
export default {
  name: "ReporteCostosProductosDetalleModal",
  props: {
    selectedProduct: {
      type: Object,
      default: null
    },
    filters: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      detailData: null,

      materialFields: [
        { key: "nombre_insumo", label: "Insumo / Material", sortable: true },
        { key: "cantidad_estimada", label: "Cant. Est.", class: "text-center" },
        { key: "cantidad_real", label: "Cant. Real", class: "text-center" },
        { key: "costo_total_estimado", label: "Costo Est.", class: "text-right" },
        { key: "costo_total_real", label: "Costo Real", class: "text-right" },
        { key: "desviacion_pct", label: "Desviación %", class: "text-center" }
      ]
    };
  },
  methods: {
    showModal() {
      this.visible = true;
      this.fetchDetail();
    },

    async fetchDetail() {
      if (!this.selectedProduct) return;
      this.loading = true;
      try {
        const queryParams = `?fecha_inicio=${this.filters.inicio || ''}&fecha_fin=${this.filters.fin || ''}`;
        const url = `${this.$config.API}/reportes/costos-productos/${this.selectedProduct.id_producto}/detalle${queryParams}`;
        const { data } = await this.$axios.get(url);
        if (data && data.success) {
          this.detailData = data;
        }
      } catch (err) {
        console.error("Error al obtener detalle de talla:", err);
        this.$bvToast.toast("No se pudo cargar el desglose detallado del producto.", {
          title: "Error de Servidor",
          variant: "danger",
          solid: true
        });
      } finally {
        this.loading = false;
      }
    },

    // Formatters
    formatNumber(val) {
      if (val === null || val === undefined || isNaN(val)) return "0.00";
      return Number(val).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    formatQty(val) {
      if (val === null || val === undefined || isNaN(val)) return "0.000";
      return Number(val).toLocaleString("es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    },

    formatPercent(val) {
      if (val === null || val === undefined || isNaN(val)) return "0.0%";
      const sign = val > 0 ? "+" : "";
      return `${sign}${Number(val).toFixed(1)}%`;
    },

    formatSeconds(seconds) {
      if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) return "0s";
      if (seconds < 60) return `${Math.round(seconds)}s`;
      const mins = seconds / 60;
      if (mins < 60) return `${Math.round(mins)}m`;
      const hrs = mins / 60;
      return `${hrs.toFixed(1)}h`;
    },

    getDeviationBadgeClass(deviation) {
      const dev = parseFloat(deviation) || 0;
      if (dev > 10.0) {
        return "badge-danger text-white"; // 10%+ over budget
      } else if (dev < -10.0) {
        return "badge-success text-white"; // 10%+ under budget
      } else {
        return "badge-info text-white"; // within margins
      }
    },

    getDeviationTextClass(deviation) {
      const dev = parseFloat(deviation) || 0;
      if (dev > 10.0) return "text-danger";
      if (dev < -10.0) return "text-success";
      return "text-info";
    }
  }
};
</script>

<style scoped>
.rounded-lg {
  border-radius: 0.75rem !important;
}
.border-right {
  border-right: 1px solid rgba(0, 0, 0, 0.1) !important;
}
</style>
