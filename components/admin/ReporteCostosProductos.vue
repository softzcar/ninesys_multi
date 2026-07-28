<template>
  <div>
    <b-overlay :show="overlay" spinner-variant="primary">
      <b-container fluid class="py-4">
        <!-- Title and Toggle -->
        <b-row class="mb-4 align-items-center">
          <b-col md="6">
            <h2 class="text-dark font-weight-bold">
              <b-icon-graph-up class="mr-2 text-primary"></b-icon-graph-up>
              Reporte de Desviaciones de Costos
            </h2>
            <p class="text-muted mb-0">Compara las estimaciones de Ficha Técnica contra el historial real de taller.</p>
          </b-col>
          <b-col md="6" class="text-md-right mt-3 mt-md-0">
            <b-form-radio-group
              v-model="viewMode"
              buttons
              button-variant="outline-primary"
              size="lg"
              class="shadow-sm"
            >
              <b-form-radio value="productos">
                <b-icon-tag-fill class="mr-1"></b-icon-tag-fill> Por Productos
              </b-form-radio>
              <b-form-radio value="categorias">
                <b-icon-folder-fill class="mr-1"></b-icon-folder-fill> Por Categorías
              </b-form-radio>
            </b-form-radio-group>
          </b-col>
        </b-row>

        <!-- KPI Summary Cards -->
        <b-row class="mb-4">
          <!-- Card Costo -->
          <b-col md="6" lg="3" class="mb-3">
            <b-card no-body class="border-0 shadow-sm bg-primary text-white p-3 h-100">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-uppercase small text-white-50 font-weight-bold mb-1">Costo Total Promedio</h6>
                  <h3 class="mb-0 font-weight-bold">${{ formatNumber(globalKpis.costoReal) }}</h3>
                  <small class="text-white-50">Estimado: ${{ formatNumber(globalKpis.costoEstimado) }}</small>
                </div>
                <div class="h1 mb-0 opacity-50"><b-icon-cash></b-icon-cash></div>
              </div>
              <div class="mt-3">
                <span :class="['badge', getDeviationBadgeClass(globalKpis.desviacionCosto), 'px-2 py-1']">
                  {{ formatPercent(globalKpis.desviacionCosto) }}
                </span>
                <span class="small text-white-50 ml-1">Desviación global</span>
              </div>
            </b-card>
          </b-col>

          <!-- Card Tiempo -->
          <b-col md="6" lg="3" class="mb-3">
            <b-card no-body class="border-0 shadow-sm bg-dark text-white p-3 h-100">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-uppercase small text-muted font-weight-bold mb-1">Tiempo de Fabricación</h6>
                  <h3 class="mb-0 font-weight-bold">{{ formatSeconds(globalKpis.tiempoReal) }}</h3>
                  <small class="text-muted">Estimado: {{ formatSeconds(globalKpis.tiempoEstimado) }}</small>
                </div>
                <div class="h1 mb-0 text-muted"><b-icon-clock></b-icon-clock></div>
              </div>
              <div class="mt-3">
                <span :class="['badge', getDeviationBadgeClass(globalKpis.desviacionTiempo), 'px-2 py-1']">
                  {{ formatPercent(globalKpis.desviacionTiempo) }}
                </span>
                <span class="small text-muted ml-1">Desviación global</span>
              </div>
            </b-card>
          </b-col>

          <!-- Card Insumos -->
          <b-col md="6" lg="3" class="mb-3">
            <b-card no-body class="border-0 shadow-sm bg-white p-3 h-100">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-uppercase small text-muted font-weight-bold mb-1">Costo Materiales / Insumos</h6>
                  <h3 class="mb-0 font-weight-bold text-dark">${{ formatNumber(globalKpis.insumosReal) }}</h3>
                  <small class="text-muted">Estimado: ${{ formatNumber(globalKpis.insumosEstimado) }}</small>
                </div>
                <div class="h1 mb-0 text-info opacity-50"><b-icon-box></b-icon-box></div>
              </div>
              <div class="mt-3">
                <span :class="['badge', getDeviationBadgeClass(globalKpis.desviacionInsumos), 'px-2 py-1']">
                  {{ formatPercent(globalKpis.desviacionInsumos) }}
                </span>
                <span class="small text-muted ml-1">Desviación</span>
              </div>
            </b-card>
          </b-col>

          <!-- Card Mano Obra -->
          <b-col md="6" lg="3" class="mb-3">
            <b-card no-body class="border-0 shadow-sm bg-white p-3 h-100">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-uppercase small text-muted font-weight-bold mb-1">Mano de Obra Promedio</h6>
                  <h3 class="mb-0 font-weight-bold text-dark">${{ formatNumber(globalKpis.laborReal) }}</h3>
                  <small class="text-muted">Estimado: ${{ formatNumber(globalKpis.laborEstimado) }}</small>
                </div>
                <div class="h1 mb-0 text-success opacity-50"><b-icon-people></b-icon-people></div>
              </div>
              <div class="mt-3">
                <span :class="['badge', getDeviationBadgeClass(globalKpis.desviacionLabor), 'px-2 py-1']">
                  {{ formatPercent(globalKpis.desviacionLabor) }}
                </span>
                <span class="small text-muted ml-1">Desviación</span>
              </div>
            </b-card>
          </b-col>
        </b-row>

        <!-- Charts Block -->
        <b-row class="mb-4" v-if="filteredData && filteredData.length > 0">
          <!-- Cost Comparison Chart -->
          <b-col lg="6" class="mb-4">
            <b-card no-body class="border-0 shadow-sm bg-white rounded-lg p-3 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 font-weight-bold text-dark">Estimado vs. Real ($)</h5>
                <small class="text-muted">Top 10 por Volumen</small>
              </div>
              <client-only>
                <apexchart
                  type="bar"
                  height="320"
                  :options="costChartOptions"
                  :series="costChartSeries"
                />
              </client-only>
            </b-card>
          </b-col>

          <!-- Deviation Percentage Chart -->
          <b-col lg="6" class="mb-4">
            <b-card no-body class="border-0 shadow-sm bg-white rounded-lg p-3 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 font-weight-bold text-dark">Desviación Porcentual (%)</h5>
                <small class="text-muted">Desviación de Costo Total</small>
              </div>
              <client-only>
                <apexchart
                  type="bar"
                  height="320"
                  :options="deviationChartOptions"
                  :series="deviationChartSeries"
                />
              </client-only>
            </b-card>
          </b-col>

          <!-- Cost Breakdown 100% Chart -->
          <b-col cols="12" class="mb-4">
            <b-card no-body class="border-0 shadow-sm bg-white rounded-lg p-3 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 font-weight-bold text-dark">Desglose de Costo Real: Materiales vs. Mano de Obra (%)</h5>
                <small class="text-muted">Distribución porcentual de los costos reales</small>
              </div>
              <client-only>
                <apexchart
                  type="bar"
                  height="320"
                  :options="compositionChartOptions"
                  :series="compositionChartSeries"
                />
              </client-only>
            </b-card>
          </b-col>
        </b-row>

        <!-- Filters Block -->
        <b-row class="mb-4">
          <b-col cols="12">
            <b-card no-body class="border-0 shadow-sm bg-white rounded-lg p-3">
              <b-row class="align-items-end">
                <b-col md="3" sm="6" class="mb-3 mb-md-0">
                  <label class="font-weight-bold text-secondary text-uppercase small">Fecha Inicio Taller:</label>
                  <b-input-group>
                    <b-input-group-prepend>
                      <span class="input-group-text bg-light border-right-0"><b-icon-calendar></b-icon-calendar></span>
                    </b-input-group-prepend>
                    <b-form-datepicker
                      v-model="filters.inicio"
                      locale="es"
                      placeholder="Seleccionar Inicio"
                      class="border-left-0"
                    ></b-form-datepicker>
                  </b-input-group>
                </b-col>
                <b-col md="3" sm="6" class="mb-3 mb-md-0">
                  <label class="font-weight-bold text-secondary text-uppercase small">Fecha Fin Taller:</label>
                  <b-input-group>
                    <b-input-group-prepend>
                      <span class="input-group-text bg-light border-right-0"><b-icon-calendar></b-icon-calendar></span>
                    </b-input-group-prepend>
                    <b-form-datepicker
                      v-model="filters.fin"
                      locale="es"
                      placeholder="Seleccionar Fin"
                      class="border-left-0"
                    ></b-form-datepicker>
                  </b-input-group>
                </b-col>
                <b-col md="4" sm="8" class="mb-3 mb-md-0">
                  <label class="font-weight-bold text-secondary text-uppercase small">Buscar:</label>
                  <vue-typeahead-bootstrap
                    v-model="tableFilter"
                    :data="typeaheadData"
                    @hit="onTypeaheadHit"
                    placeholder="Escriba para buscar o seleccione..."
                    input-class="border-left-0"
                    class="w-100"
                  >
                    <template slot="prepend">
                      <span class="input-group-text bg-light border-right-0">
                        <b-icon-search></b-icon-search>
                      </span>
                    </template>
                  </vue-typeahead-bootstrap>
                </b-col>
                <b-col md="2" sm="4">
                  <b-button variant="primary" @click="fetchData(true)" class="w-100 font-weight-bold shadow-sm py-2">
                    <b-icon-arrow-repeat class="mr-1"></b-icon-arrow-repeat>
                    Actualizar
                  </b-button>
                </b-col>
              </b-row>
            </b-card>
          </b-col>
        </b-row>

        <!-- Main Comparative Table -->
        <b-row>
          <b-col cols="12">
            <b-card no-body class="border-0 shadow-sm bg-white rounded-lg">
              <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 class="mb-0 font-weight-bold text-dark">
                  Detalle del Reporte ({{ viewMode === 'productos' ? 'Productos' : 'Categorías' }})
                </h5>
                <small class="text-muted">* Los costos reales se calculan en base a órdenes terminadas.</small>
              </div>

              <!-- View mode PRODUCTOS -->
              <b-table
                v-if="viewMode === 'productos'"
                striped
                hover
                responsive
                class="mb-0"
                :items="filteredData"
                :fields="productFields"
              >
                <!-- Cell Renderers -->
                <template #cell(nombre)="data">
                  <div class="font-weight-bold text-dark">{{ data.item.nombre }}</div>
                  <div class="text-muted small">SKU: {{ data.item.sku || 'N/A' }}</div>
                </template>

                <template #cell(unidades_fabricadas)="data">
                  <b-badge variant="light" class="text-dark font-weight-bold border px-2 py-1">
                    {{ data.item.unidades_fabricadas || 0 }} und
                  </b-badge>
                </template>

                <template #cell(tiempo)="data">
                  <div class="small">
                    Est: <span class="text-secondary font-weight-bold">{{ formatSeconds(data.item.tiempo_estimado) }}</span>
                  </div>
                  <div class="small">
                    Real: <span class="text-dark font-weight-bold">{{ formatSeconds(data.item.tiempo_real) }}</span>
                  </div>
                  <div class="mt-1">
                    <span :class="['badge', getDeviationBadgeClass(data.item.desviacion_tiempo_pct), 'small']">
                      {{ formatPercent(data.item.desviacion_tiempo_pct) }}
                    </span>
                  </div>
                </template>

                <template #cell(insumos)="data">
                  <div class="small">Est: <span class="text-secondary">${{ formatNumber(data.item.insumos_estimado) }}</span></div>
                  <div class="small">Real: <span class="text-dark font-weight-bold">${{ formatNumber(data.item.insumos_real) }}</span></div>
                  <div class="mt-1">
                    <span :class="['badge', getDeviationBadgeClass(data.item.desviacion_insumos_pct), 'small']">
                      {{ formatPercent(data.item.desviacion_insumos_pct) }}
                    </span>
                  </div>
                </template>

                <template #cell(labor)="data">
                  <div class="small">Est: <span class="text-secondary">${{ formatNumber(data.item.labor_estimado) }}</span></div>
                  <div class="small">Real: <span class="text-dark font-weight-bold">${{ formatNumber(data.item.labor_real) }}</span></div>
                  <div class="mt-1">
                    <span :class="['badge', getDeviationBadgeClass(data.item.desviacion_labor_pct), 'small']">
                      {{ formatPercent(data.item.desviacion_labor_pct) }}
                    </span>
                  </div>
                </template>

                <template #cell(costo_total)="data">
                  <div class="small">Est: <span class="text-secondary">${{ formatNumber(data.item.costo_total_estimado) }}</span></div>
                  <div class="small">Real: <span class="text-primary font-weight-bold">${{ formatNumber(data.item.costo_total_real) }}</span></div>
                  <div class="mt-1">
                    <span :class="['badge', getDeviationBadgeClass(data.item.desviacion_total_pct), 'small']">
                      {{ formatPercent(data.item.desviacion_total_pct) }}
                    </span>
                  </div>
                </template>

                <template #cell(margen)="data">
                  <div class="small">Venta: <span class="font-weight-bold text-dark">${{ formatNumber(data.item.precio_venta) }}</span></div>
                  <div class="small mt-1">
                    Est: <span class="text-muted">{{ formatPercent(data.item.margen_estimado_pct) }}</span>
                  </div>
                  <div class="small">
                    Real: <span :class="data.item.margen_real_pct >= 0 ? 'text-success font-weight-bold' : 'text-danger font-weight-bold'">
                      {{ formatPercent(data.item.margen_real_pct) }}
                    </span>
                  </div>
                </template>

                <template #cell(acciones)="data">
                  <b-button
                    variant="outline-primary"
                    size="sm"
                    class="font-weight-bold px-3"
                    @click="openDetailModal(data.item)"
                  >
                    <b-icon-eye class="mr-1"></b-icon-eye> Tallas
                  </b-button>
                </template>
              </b-table>

              <!-- View mode CATEGORIAS -->
              <b-table
                v-else
                striped
                hover
                responsive
                class="mb-0"
                :items="filteredData"
                :fields="categoryFields"
              >
                <template #cell(nombre)="data">
                  <div class="font-weight-bold text-dark">{{ data.item.nombre }}</div>
                  <div class="text-muted small">{{ data.item.productos_count }} productos catalogados</div>
                </template>

                <template #cell(unidades_fabricadas)="data">
                  <b-badge variant="light" class="text-dark font-weight-bold border px-2 py-1">
                    {{ data.item.unidades_fabricadas || 0 }} und
                  </b-badge>
                </template>

                <template #cell(tiempo)="data">
                  <div class="small">Est Prom: <span class="text-secondary font-weight-bold">{{ formatSeconds(data.item.tiempo_estimado) }}</span></div>
                  <div class="small">Real Prom: <span class="text-dark font-weight-bold">{{ formatSeconds(data.item.tiempo_real) }}</span></div>
                  <div class="mt-1">
                    <span :class="['badge', getDeviationBadgeClass(data.item.desviacion_tiempo_pct), 'small']">
                      {{ formatPercent(data.item.desviacion_tiempo_pct) }}
                    </span>
                  </div>
                </template>

                <template #cell(insumos)="data">
                  <div class="small">Est: <span class="text-secondary">${{ formatNumber(data.item.insumos_estimado) }}</span></div>
                  <div class="small">Real: <span class="text-dark font-weight-bold">${{ formatNumber(data.item.insumos_real) }}</span></div>
                  <div class="mt-1">
                    <span :class="['badge', getDeviationBadgeClass(data.item.desviacion_insumos_pct), 'small']">
                      {{ formatPercent(data.item.desviacion_insumos_pct) }}
                    </span>
                  </div>
                </template>

                <template #cell(labor)="data">
                  <div class="small">Est: <span class="text-secondary">${{ formatNumber(data.item.labor_estimado) }}</span></div>
                  <div class="small">Real: <span class="text-dark font-weight-bold">${{ formatNumber(data.item.labor_real) }}</span></div>
                  <div class="mt-1">
                    <span :class="['badge', getDeviationBadgeClass(data.item.desviacion_labor_pct), 'small']">
                      {{ formatPercent(data.item.desviacion_labor_pct) }}
                    </span>
                  </div>
                </template>

                <template #cell(costo_total)="data">
                  <div class="small">Est: <span class="text-secondary">${{ formatNumber(data.item.costo_total_estimado) }}</span></div>
                  <div class="small">Real: <span class="text-primary font-weight-bold">${{ formatNumber(data.item.costo_total_real) }}</span></div>
                  <div class="mt-1">
                    <span :class="['badge', getDeviationBadgeClass(data.item.desviacion_total_pct), 'small']">
                      {{ formatPercent(data.item.desviacion_total_pct) }}
                    </span>
                  </div>
                </template>

                <template #cell(margen)="data">
                  <div class="small">Venta Prom: <span class="font-weight-bold text-dark">${{ formatNumber(data.item.precio_venta) }}</span></div>
                  <div class="small mt-1">Est: <span class="text-muted">{{ formatPercent(data.item.margen_estimado_pct) }}</span></div>
                  <div class="small">Real: <span :class="data.item.margen_real_pct >= 0 ? 'text-success font-weight-bold' : 'text-danger font-weight-bold'">
                    {{ formatPercent(data.item.margen_real_pct) }}
                  </span></div>
                </template>
              </b-table>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>

    <!-- Modal for size drill down -->
    <admin-ReporteCostosProductosDetalleModal
      ref="detailModal"
      :selected-product="selectedProductForModal"
      :filters="filters"
    />
  </div>
</template>

<script>
// Module-level variables to share state/promises across instances (survives remounts)
let activePromise = null;
let activePromiseParams = null;
let lastCache = {
  key: null,
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 5000; // 5 seconds

export default {
  name: "ReporteCostosProductos",
  data() {
    // No usar .toISOString(): convierte a UTC, y en zonas con offset negativo
    // (ej. America/Caracas, UTC-4) cualquier hora local entre ~20:00 y 23:59
    // cruza al día siguiente en UTC, desplazando la fecha un día hacia adelante
    // (mismo bug ya corregido en ReporteCostosProduccion.vue).
    const toFechaLocal = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
      overlay: false,
      viewMode: "productos",
      tableFilter: "",
      filters: {
        inicio: toFechaLocal(thirtyDaysAgo),
        fin: toFechaLocal(today),
      },
      productsData: [],
      categoriesData: [],
      selectedProductForModal: null,
      selectedFilterProduct: null,

      productFields: [
        { key: "nombre", label: "Producto", sortable: true },
        { key: "categorias", label: "Categorías", sortable: true },
        { key: "unidades_fabricadas", label: "Fab.", sortable: true, class: "text-center" },
        { key: "tiempo", label: "Tiempo Fabricación", sortable: false },
        { key: "insumos", label: "Costo Insumos", sortable: false },
        { key: "labor", label: "Costo Mano Obra", sortable: false },
        { key: "costo_total", label: "Costo Total", sortable: false },
        { key: "margen", label: "Precios y Margen", sortable: false },
        { key: "acciones", label: "Acción", class: "text-center" }
      ],

      categoryFields: [
        { key: "nombre", label: "Categoría", sortable: true },
        { key: "unidades_fabricadas", label: "Fab. Total", sortable: true, class: "text-center" },
        { key: "tiempo", label: "Tiempo Promedio", sortable: false },
        { key: "insumos", label: "Costo Insumos", sortable: false },
        { key: "labor", label: "Costo Mano Obra", sortable: false },
        { key: "costo_total", label: "Costo Promedio", sortable: false },
        { key: "margen", label: "Margen Promedio", sortable: false }
      ]
    };
  },
  computed: {
    viewLabel() {
      return this.viewMode === "productos" ? "Producto" : "Categoría";
    },
    filteredData() {
      const isProd = this.viewMode === "productos";
      const source = isProd ? this.productsData : this.categoriesData;
      if (!this.tableFilter) return source;
      
      const filterFn = isProd ? this.customProductFilter : this.customCategoryFilter;
      return source.filter(item => filterFn(item, this.tableFilter));
    },
    chartData() {
      const data = [...this.filteredData];
      return data
        .sort((a, b) => (b.unidades_fabricadas || 0) - (a.unidades_fabricadas || 0))
        .slice(0, 10);
    },
    globalKpis() {
      const source = this.filteredData;
      
      let totalEstCosto = 0;
      let totalRealCosto = 0;
      let totalEstTiempo = 0;
      let totalRealTiempo = 0;
      let totalEstInsumos = 0;
      let totalRealInsumos = 0;
      let totalEstLabor = 0;
      let totalRealLabor = 0;
      let count = 0;

      source.forEach(item => {
        // Only average products/categories that have been fabricated or have estimates
        if (item.unidades_fabricadas > 0 || item.costo_total_estimado > 0) {
          totalEstCosto += item.costo_total_estimado || 0;
          totalRealCosto += item.costo_total_real || 0;
          totalEstTiempo += item.tiempo_estimado || 0;
          totalRealTiempo += item.tiempo_real || 0;
          totalEstInsumos += item.insumos_estimado || 0;
          totalRealInsumos += item.insumos_real || 0;
          totalEstLabor += item.labor_estimado || 0;
          totalRealLabor += item.labor_real || 0;
          count++;
        }
      });

      if (count === 0) {
        return {
          costoEstimado: 0, costoReal: 0, desviacionCosto: 0,
          tiempoEstimado: 0, tiempoReal: 0, desviacionTiempo: 0,
          insumosEstimado: 0, insumosReal: 0, desviacionInsumos: 0,
          laborEstimado: 0, laborReal: 0, desviacionLabor: 0
        };
      }

      const estCosto = totalEstCosto / count;
      const realCosto = totalRealCosto / count;
      const estTiempo = totalEstTiempo / count;
      const realTiempo = totalRealTiempo / count;
      const estInsumos = totalEstInsumos / count;
      const realInsumos = totalRealInsumos / count;
      const estLabor = totalEstLabor / count;
      const realLabor = totalRealLabor / count;

      return {
        costoEstimado: estCosto,
        costoReal: realCosto,
        desviacionCosto: estCosto > 0 ? ((realCosto - estCosto) / estCosto) * 100 : 0,
        
        tiempoEstimado: estTiempo,
        tiempoReal: realTiempo,
        desviacionTiempo: estTiempo > 0 ? ((realTiempo - estTiempo) / estTiempo) * 100 : 0,
        
        insumosEstimado: estInsumos,
        insumosReal: realInsumos,
        desviacionInsumos: estInsumos > 0 ? ((realInsumos - estInsumos) / estInsumos) * 100 : 0,
        
        laborEstimado: estLabor,
        laborReal: realLabor,
        desviacionLabor: estLabor > 0 ? ((realLabor - estLabor) / estLabor) * 100 : 0
      };
    },
    typeaheadData() {
      if (this.viewMode === "productos") {
        return Array.isArray(this.productsData) ? this.productsData.map(p => p.nombre).filter(Boolean) : [];
      } else {
        return Array.isArray(this.categoriesData) ? this.categoriesData.map(c => c.nombre).filter(Boolean) : [];
      }
    },
    costChartSeries() {
      return [
        {
          name: "Costo Estimado",
          data: this.chartData.map(item => parseFloat(item.costo_total_estimado) || 0)
        },
        {
          name: "Costo Real",
          data: this.chartData.map(item => parseFloat(item.costo_total_real) || 0)
        }
      ];
    },
    costChartOptions() {
      return {
        chart: {
          type: "bar",
          height: 320,
          toolbar: { show: false },
          fontFamily: "'Outfit', 'Inter', sans-serif"
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "50%",
            borderRadius: 5
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"]
        },
        xaxis: {
          categories: this.chartData.map(item => item.nombre || ""),
          labels: {
            rotate: -45,
            trim: true,
            style: {
              fontSize: "10px",
              colors: "#6c757d"
            }
          }
        },
        yaxis: {
          labels: {
            formatter: (val) => `$${val.toFixed(2)}`
          }
        },
        colors: ["#6c757d", "#008FFB"],
        tooltip: {
          y: {
            formatter: (val) => `$${val.toFixed(2)}`
          }
        },
        legend: {
          position: "top",
          horizontalAlign: "right"
        }
      };
    },
    deviationChartSeries() {
      return [
        {
          name: "Desviación",
          data: this.chartData.map(item => {
            const rawVal = parseFloat(item.desviacion_total_pct) || 0;
            // Cap the rendering value between -100% and +100% to avoid axis squishing by outliers
            return Math.min(100, Math.max(-100, rawVal));
          })
        }
      ];
    },
    deviationChartOptions() {
      return {
        chart: {
          type: "bar",
          height: 320,
          toolbar: { show: false },
          fontFamily: "'Outfit', 'Inter', sans-serif"
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 5,
            barHeight: "65%",
            colors: {
              ranges: [
                {
                  from: -100,
                  to: -10.01,
                  color: "#28a745" // Green
                },
                {
                  from: -10,
                  to: 10,
                  color: "#17a2b8" // Cyan
                },
                {
                  from: 10.01,
                  to: 1000,
                  color: "#dc3545" // Red
                }
              ]
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val, opt) => {
            if (opt && opt.dataPointIndex !== undefined) {
              const item = this.chartData[opt.dataPointIndex];
              if (item) {
                const realVal = parseFloat(item.desviacion_total_pct) || 0;
                const sign = realVal > 0 ? "+" : "";
                return `${sign}${realVal.toFixed(1)}%`;
              }
            }
            const sign = val > 0 ? "+" : "";
            return `${sign}${val.toFixed(1)}%`;
          },
          offsetX: 6,
          style: {
            fontSize: "10px",
            colors: ["#fff"]
          }
        },
        xaxis: {
          min: -100,
          max: 100,
          tickAmount: 4,
          labels: {
            formatter: (val) => `${val > 0 ? "+" : ""}${val}%`
          }
        },
        labels: this.chartData.map(item => item.nombre || ""),
        tooltip: {
          y: {
            formatter: (val, opt) => {
              if (opt && opt.dataPointIndex !== undefined) {
                const item = this.chartData[opt.dataPointIndex];
                if (item) {
                  const realVal = parseFloat(item.desviacion_total_pct) || 0;
                  const sign = realVal > 0 ? "+" : "";
                  return `${sign}${realVal.toFixed(1)}%`;
                }
              }
              const sign = val > 0 ? "+" : "";
              return `${sign}${val.toFixed(1)}%`;
            }
          }
        }
      };
    },
    compositionChartSeries() {
      return [
        {
          name: "Insumos (Materiales)",
          data: this.chartData.map(item => parseFloat(item.insumos_real) || 0)
        },
        {
          name: "Mano de Obra",
          data: this.chartData.map(item => parseFloat(item.labor_real) || 0)
        }
      ];
    },
    compositionChartOptions() {
      return {
        chart: {
          type: "bar",
          height: 320,
          stacked: true,
          stackType: "100%",
          toolbar: { show: false },
          fontFamily: "'Outfit', 'Inter', sans-serif"
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "45%",
            borderRadius: 5
          }
        },
        xaxis: {
          categories: this.chartData.map(item => item.nombre || ""),
          labels: {
            rotate: -45,
            trim: true,
            style: {
              fontSize: "10px",
              colors: "#6c757d"
            }
          }
        },
        colors: ["#fd7e14", "#28a745"],
        tooltip: {
          y: {
            formatter: (val) => `$${val.toFixed(2)}`
          }
        },
        legend: {
          position: "top",
          horizontalAlign: "right"
        }
      };
    }
  },
  watch: {
    viewMode() {
      // "Buscar" filtra por campos distintos según la vista (nombre/SKU/categoría de
      // producto vs. solo nombre de categoría) -- si quedara un texto de búsqueda de
      // la vista anterior, la tabla y las KPI cards de la nueva vista podían quedar
      // vacías sin ninguna indicación de por qué (ej. buscar "Franela Sublimada" en
      // Productos y cambiar a Categorías, donde ningún nombre de categoría calza).
      this.tableFilter = "";
      this.selectedFilterProduct = null;
      this.fetchData();
    },
    tableFilter(newVal) {
      if (newVal !== this.selectedFilterProduct) {
        this.selectedFilterProduct = null;
      }
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {

    async fetchData(force = false) {
      if (this.overlay) return;
      
      const queryParams = `?fecha_inicio=${this.filters.inicio || ''}&fecha_fin=${this.filters.fin || ''}`;
      const cacheKey = `${this.viewMode}:${queryParams}`;

      // 1. Check cache (only if not forcing refresh)
      if (!force && lastCache.key === cacheKey && (Date.now() - lastCache.timestamp) < CACHE_DURATION) {
        if (this.viewMode === "productos") {
          this.productsData = lastCache.data;
        } else if (this.viewMode === "categorias") {
          this.categoriesData = lastCache.data;
        }
        return;
      }

      this.overlay = true;
      try {
        let resData = null;

        // 2. Check if there is an active running promise for the exact same request
        if (activePromise && activePromiseParams === cacheKey) {
          resData = await activePromise;
        } else {
          const url = this.viewMode === "productos"
            ? `${this.$config.API}/reportes/costos-productos${queryParams}`
            : `${this.$config.API}/reportes/costos-productos/categorias${queryParams}`;
            
          const promise = this.$axios.get(url).then(res => res.data);
          activePromise = promise;
          activePromiseParams = cacheKey;

          resData = await promise;

          activePromise = null;
          activePromiseParams = null;
        }

        if (resData && resData.success) {
          if (this.viewMode === "productos") {
            this.productsData = resData.data;
          } else if (this.viewMode === "categorias") {
            this.categoriesData = resData.data;
          }

          // Update cache
          lastCache = {
            key: cacheKey,
            data: resData.data,
            timestamp: Date.now()
          };
        }
      } catch (err) {
        console.error("Error al cargar reportes:", err);
        this.$bvToast.toast("Ocurrió un error al obtener la información de costos.", {
          title: "Error de Servidor",
          variant: "danger",
          solid: true
        });
      } finally {
        this.overlay = false;
        if (activePromiseParams === cacheKey) {
          activePromise = null;
          activePromiseParams = null;
        }
      }
    },

    customProductFilter(item, filter) {
      if (!filter) return true;
      
      const cleanFilter = filter.trim();
      const isExact = (cleanFilter.startsWith('"') && cleanFilter.endsWith('"')) || (this.selectedFilterProduct === cleanFilter);
      const searchTerm = (cleanFilter.startsWith('"') && cleanFilter.endsWith('"'))
        ? cleanFilter.slice(1, -1).trim().toLowerCase() 
        : cleanFilter.toLowerCase();
        
      const name = String(item.nombre || '').toLowerCase();
      const sku = String(item.sku || '').toLowerCase();
      const cats = String(item.categorias || '').toLowerCase();
      
      if (isExact) {
        return name === searchTerm || sku === searchTerm || cats === searchTerm;
      } else {
        return name.includes(searchTerm) || sku.includes(searchTerm) || cats.includes(searchTerm);
      }
    },

    customCategoryFilter(item, filter) {
      if (!filter) return true;
      
      const cleanFilter = filter.trim();
      const isExact = (cleanFilter.startsWith('"') && cleanFilter.endsWith('"')) || (this.selectedFilterProduct === cleanFilter);
      const searchTerm = (cleanFilter.startsWith('"') && cleanFilter.endsWith('"'))
        ? cleanFilter.slice(1, -1).trim().toLowerCase() 
        : cleanFilter.toLowerCase();
        
      const name = String(item.nombre || '').toLowerCase();
      
      if (isExact) {
        return name === searchTerm;
      } else {
        return name.includes(searchTerm);
      }
    },

    onTypeaheadHit(item) {
      this.selectedFilterProduct = item;
      this.tableFilter = item;
    },

    openDetailModal(product) {
      this.selectedProductForModal = product;
      this.$nextTick(() => {
        this.$refs.detailModal.showModal();
      });
    },

    // Formatting helpers
    formatNumber(val) {
      if (val === null || val === undefined || isNaN(val)) return "0.00";
      return Number(val).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        return "badge-danger text-white"; // 10%+ over budget (Alert)
      } else if (dev < -10.0) {
        return "badge-success text-white"; // 10%+ under budget (Great)
      } else {
        return "badge-info text-white"; // Within margins
      }
    }
  }
};
</script>

<style scoped>
.rounded-lg {
  border-radius: 0.75rem !important;
}
.opacity-50 {
  opacity: 0.5;
}
</style>
