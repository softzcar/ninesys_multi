<template>
  <div>
    <b-link @click="showModal" class="font-weight-bold">
      {{ typeof valor === 'string' ? valor : (parseFloat(valor) || 0).toFixed(2) + '%' }}
    </b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Eficiencia de Insumos - Orden #${id_orden}`"
      hide-footer
      size="xl"
    >
      <div v-if="reporte.insumos_detalles && reporte.insumos_detalles.length">
        <!-- Panel de Fórmula de Eficiencia -->
        <b-row class="mb-4">
          <b-col md="12">
            <b-card bg-variant="light" border-variant="success" class="shadow-sm">
              <h5 class="text-success mb-3">
                <b-icon-check-circle-fill class="mr-2"></b-icon-check-circle-fill>
                Criterio de Eficiencia de Insumos
              </h5>
              <p class="text-muted mb-3">
                La eficiencia de insumos mide el aprovechamiento de la tela y materiales. Se calcula dividiendo la cantidad teórica estimada (establecida en la ficha técnica del producto) entre el consumo real físico cortado en el taller. Una eficiencia del 100% indica uso óptimo; valores inferiores reflejan merma o consumo excedente.
              </p>
              <b-row class="align-items-center">
                <b-col md="4" class="border-right">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>Estimado Total (Meta):</span>
                    <b-badge variant="success" pill class="px-3 py-2 font-weight-bold">
                      {{ totalMeta.toFixed(2) }} mts
                    </b-badge>
                  </div>
                  <small class="text-muted d-block text-right">
                    Planificado por ficha técnica
                  </small>
                </b-col>
                <b-col md="4" class="border-right">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>Consumido Total (Real):</span>
                    <b-badge variant="secondary" pill class="px-3 py-2 font-weight-bold">
                      {{ totalReal.toFixed(2) }} mts
                    </b-badge>
                  </div>
                  <small class="text-muted d-block text-right">
                    Descontado físico del inventario
                  </small>
                </b-col>
                <b-col md="4" class="text-center">
                  <div class="p-3 bg-white border rounded">
                    <small class="text-muted d-block uppercase font-weight-bold mb-1">
                      CÁLCULO DE EFICIENCIA
                    </small>
                    <code class="d-block font-weight-bold text-dark mb-1" style="font-size: 1.1rem;">
                      ({{ totalMeta.toFixed(2) }} / {{ totalReal.toFixed(2) }}) x 100
                    </code>
                    <strong :class="getEficienciaClass(totalEficiencia)" style="font-size: 1.3rem;">
                      = {{ totalEficiencia.toFixed(2) }}%
                    </strong>
                  </div>
                </b-col>
              </b-row>
            </b-card>
          </b-col>
        </b-row>

        <!-- Tabla de Detalle -->
        <h4 class="text-secondary mb-3">Eficiencia Desglosada por Insumo</h4>
        <b-table
          striped
          hover
          :items="reporte.insumos_detalles"
          :fields="fields"
          responsive
          foot-clone
          class="shadow-sm border rounded"
        >
          <template #cell(meta)="data">
            {{ (Number(data.item.meta) || 0).toFixed(2) }} mts
          </template>
          <template #cell(real)="data">
            {{ (Number(data.item.real) || 0).toFixed(2) }} mts
          </template>
          <template #cell(eficiencia)="data">
            <strong :class="getEficienciaClass(data.item.eficiencia)">
              {{ typeof data.item.eficiencia === 'string' ? data.item.eficiencia : ((parseFloat(data.item.eficiencia) || 0).toFixed(2) + '%') }}
            </strong>
          </template>

          <!-- Footer de Totales -->
          <template #foot(producto)>
            <strong>Totales:</strong>
          </template>
          <template #foot(insumo)>
            <span>&nbsp;</span>
          </template>
          <template #foot(meta)>
            <strong>{{ totalMeta.toFixed(2) }} mts</strong>
          </template>
          <template #foot(real)>
            <strong>{{ totalReal.toFixed(2) }} mts</strong>
          </template>
          <template #foot(eficiencia)>
            <strong :class="getEficienciaClass(totalEficiencia)">{{ totalEficiencia.toFixed(2) }}%</strong>
          </template>
        </b-table>
      </div>
      <p v-else class="text-center p-4 text-muted">No se encontraron datos de eficiencia de insumos para esta orden.</p>
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
        { key: "producto", label: "Producto", sortable: true },
        { key: "insumo", label: "Insumo/Material", sortable: true },
        { key: "meta", label: "Estimado (Meta)", sortable: true },
        { key: "real", label: "Consumido (Real)", sortable: true },
        { key: "eficiencia", label: "Eficiencia (%)", sortable: true },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-insumos-eficiencia-${this.id_orden}`;
    },
    totalMeta() {
      return this.reporte.insumos_detalles.reduce((sum, item) => sum + (Number(item.meta) || 0), 0);
    },
    totalReal() {
      return this.reporte.insumos_detalles.reduce((sum, item) => sum + (Number(item.real) || 0), 0);
    },
    totalEficiencia() {
      const real = this.totalReal;
      return real > 0 ? (this.totalMeta / real) * 100 : 100;
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
    getEficienciaClass(val) {
      if (typeof val === 'string') return '';
      const numVal = parseFloat(val) || 0;
      if (numVal >= 90) return 'text-success';
      if (numVal >= 75) return 'text-warning';
      return 'text-danger';
    },
  },
};
</script>