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
          <!-- Panel de Fórmula de Insumos -->
          <b-row class="mb-4">
            <b-col md="12">
              <b-card bg-variant="light" border-variant="primary" class="shadow-sm">
                <h5 class="text-primary mb-3">
                  <b-icon-collection class="mr-2"></b-icon-collection>
                  Estructura de Costos de Insumos
                </h5>
                <p class="text-muted mb-3">
                  El costo de insumos de una orden representa la sumatoria total del valor del material consumido físicamente (telas, accesorios, avíos) y la porción proporcional de tintas utilizadas durante el proceso de impresión.
                </p>
                <b-row class="align-items-center">
                  <b-col md="4" class="border-right">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span>
                        Costo de Tintas:
                        <b-badge v-if="hayTintaEstimada" variant="warning" pill class="ml-1" title="Uno o más valores de tinta son un estimado calculado, no una medición manual real">
                          (estimado)
                        </b-badge>
                      </span>
                      <b-badge variant="info" pill class="px-3 py-2 font-weight-bold">
                        $ {{ totalTintaCosto.toFixed(2) }}
                      </b-badge>
                    </div>
                    <small class="text-muted d-block text-right">
                      Consumo Total: {{ totalTintaML.toFixed(2) }} ml
                    </small>
                  </b-col>
                  <b-col md="4" class="border-right">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span>Costo de Materiales:</span>
                      <b-badge variant="secondary" pill class="px-3 py-2 font-weight-bold">
                        $ {{ totalInsumosCosto.toFixed(2) }}
                      </b-badge>
                    </div>
                    <small class="text-muted d-block text-right">
                      Insumos Físicos de la Orden
                    </small>
                  </b-col>
                  <b-col md="4" class="text-center">
                    <div class="p-3 bg-white border rounded">
                      <small class="text-muted d-block uppercase font-weight-bold mb-1">
                        CÁLCULO DEL COSTO DE INSUMOS
                      </small>
                      <code class="d-block font-weight-bold text-dark mb-1" style="font-size: 1.1rem;">
                        $ {{ totalTintaCosto.toFixed(2) }} + $ {{ totalInsumosCosto.toFixed(2) }}
                      </code>
                      <strong class="text-primary" style="font-size: 1.3rem;">
                        = $ {{ totalGeneralInsumos.toFixed(2) }}
                      </strong>
                    </div>
                  </b-col>
                </b-row>
              </b-card>
            </b-col>
          </b-row>

          <!-- Tabla de Tintas -->
          <h4 class="mt-4">Tintas</h4>
          <b-table
            striped
            hover
            :items="reporte.tintas"
            :fields="fieldsTinta"
            responsive
          >
            <template #cell(total_tinta_consumo_ml)="data">
              {{ (Number(data.item.total_tinta_consumo_ml) || 0).toFixed(2) }} ml
            </template>
            <template #cell(total_tinta_costo)="data">
              $ {{ (Number(data.item.total_tinta_costo) || 0).toFixed(2) }}
              <b-badge v-if="data.item.es_estimado" variant="warning" pill class="ml-1" title="Estimado calculado, no una medición manual real">
                estimado
              </b-badge>
            </template>


            <!-- Custom dynamic footer matching exactly the number of columns -->
            <template #custom-foot>
              <tr class="font-weight-bold" v-if="reporte.tintas.length">
                <td>Totales:</td>
                <!-- Celdas vacías para el resto de columnas de colores -->
                <td v-for="i in (coloresDetalles.length - 1)" :key="i">&nbsp;</td>
                <td>{{ totalTintaML.toFixed(2) }} ml</td>
                <td class="text-primary">$ {{ totalTintaCosto.toFixed(2) }}</td>
              </tr>
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
            <template #cell(costo)="data">
              $ {{ (Number(data.item.costo) || 0).toFixed(4) }}/mts
            </template>
            <template #cell(total_insumo)="data">
              $ {{ (Number(data.item.total_insumo) || 0).toFixed(2) }}
            </template>
            <template #cell(cantidad_utilizada)="data">
              {{ (Number(data.item.cantidad_utilizada) || 0).toFixed(2) }} mts
            </template>
            <template #cell(cantidad_restante)="data">
              {{ (Number(data.item.cantidad_restante) || 0).toFixed(2) }} mts
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
        colores_detalles: [],
      },
      isLoading: false,
      fieldsInsumos: [
        { key: "sku", label: "SKU" },
        { key: "nombre_insumo", label: "Insumo" },
        { key: "costo", label: "Costo/mts" },
        { key: "cantidad_utilizada", label: "Consumido (mts)" },
        { key: "cantidad_restante", label: "Restante (mts)" },
        { key: "total_insumo", label: "Total ($)" },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-insumos-${this.id_orden}`;
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

    fieldsTinta() {
      const base = [];
      this.coloresDetalles.forEach(col => {
        base.push({
          key: col.key,
          label: col.nombre,
          formatter: (value) => `${(Number(value) || 0).toFixed(2)} ml`
        });
      });
      base.push({ key: "total_tinta_consumo_ml", label: "Total Tinta" });
      base.push({ key: "total_tinta_costo", label: "Total Costo" });
      return base;
    },

    totalTintaML() {
      return this.reporte.tintas.reduce((sum, item) => sum + (Number(item.total_tinta_consumo_ml) || 0), 0);
    },
    totalTintaCosto() {
      return this.reporte.tintas.reduce((sum, item) => sum + (Number(item.total_tinta_costo) || 0), 0);
    },
    hayTintaEstimada() {
      return this.reporte.tintas.some(item => !!item.es_estimado);
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
