<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div
        v-if="
          dataUser.departamento === 'Administración' ||
          dataUser.departamento === 'Producción'
        "
      >
        <b-container fluid>
          <b-row>
            <b-col>
              <h1 class="mb-3">{{ titulo }}</h1>
            </b-col>
          </b-row>

          <!-- ════════════════════════════════════════════════════
               BARRA DE CONTROL SUPERIOR — Siempre visible,
               sin ningún overlay que la tape durante la carga.
               ════════════════════════════════════════════════════ -->
          <div class="report-control-bar mb-4">
            <b-row class="align-items-end flex-wrap" no-gutters>

              <!-- Ver: Stock / Consumido -->
              <b-col cols="auto" class="mr-3 mb-2">
                <div class="rcb-label">Ver</div>
                <b-form-radio-group
                  v-model="filtroStock"
                  :options="opcionesStock"
                  buttons
                  button-variant="outline-primary"
                  size="sm"
                  name="radio-btn-stock"
                  @change="onFiltroStockChange"
                />
              </b-col>

              <div class="rcb-divider mr-3 mb-2 d-none d-md-block" />

              <!-- Departamento -->
              <b-col cols="auto" class="mr-3 mb-2">
                <div class="rcb-label">Departamento</div>
                <b-form-radio-group
                  v-model="departamentoSeleccionado"
                  :options="opcionesDepartamentos"
                  buttons
                  button-variant="outline-secondary"
                  size="sm"
                  name="radio-btn-dept"
                  @change="loadReport"
                />
              </b-col>

              <div class="rcb-divider mr-3 mb-2 d-none d-md-block" />

              <!-- Rango de fechas -->
              <b-col cols="auto" class="mr-2 mb-2">
                <div class="rcb-label">Desde</div>
                <b-form-input
                  v-model="fechaDesde"
                  type="date"
                  size="sm"
                  style="width:138px"
                  @change="loadReport"
                />
              </b-col>
              <b-col cols="auto" class="mr-2 mb-2">
                <div class="rcb-label">Hasta</div>
                <b-form-input
                  v-model="fechaHasta"
                  type="date"
                  size="sm"
                  style="width:138px"
                  @change="loadReport"
                />
              </b-col>
              <b-col cols="auto" class="mr-3 mb-2">
                <div class="rcb-label">&nbsp;</div>
                <b-button size="sm" variant="outline-secondary" @click="resetFechas">
                  Últimos 30d
                </b-button>
              </b-col>

              <!-- Acciones al extremo derecho -->
              <b-col class="text-right mb-2">
                <div class="rcb-label">&nbsp;</div>
                <b-button
                  variant="info"
                  size="sm"
                  class="mr-2"
                  :disabled="items.length === 0"
                  @click="imprimirReporte"
                >
                  Imprimir
                </b-button>
                <b-button variant="outline-secondary" size="sm" @click="loadReport">
                  Refrescar
                </b-button>
              </b-col>
            </b-row>
          </div>

          <!-- ════════════════════════════════════════════════════
               SECCIÓN DE GRÁFICOS
               Usa CSS opacity en lugar de v-if para que el layout
               nunca colapse durante la carga — sin saltos visuales.
               ════════════════════════════════════════════════════ -->
          <div :class="['rpt-charts', { 'rpt-charts--loading': loading }]">

            <!-- ── Gráfico 1: Telas e Insumos (ancho completo) ── -->
            <b-row class="mb-4" v-if="chartData">
              <b-col cols="12">
                <div class="chart-card">

                  <!-- Header con título + filtro de límite integrado -->
                  <div class="chart-card__header">
                    <span class="chart-card__title">
                      {{ filtroStock === 'enStock'
                          ? 'Telas e Insumos Disponibles (Stock)'
                          : 'Telas e Insumos Más Usados' }}
                      <span v-if="chartData.materiales" class="chart-card__badge">
                        {{ chartData.materiales.length }} registros
                      </span>
                    </span>
                    <div class="chart-card__filter">
                      <span class="chart-card__filter-label">Mostrar:</span>
                      <div class="cc-pills">
                        <button
                          v-for="opt in opcionesLimite"
                          :key="opt.value"
                          :class="['cc-pill', { 'cc-pill--active': limiteGrafico === opt.value }]"
                          @click="onLimiteChange(opt.value)"
                        >{{ opt.text }}</button>
                      </div>
                    </div>
                  </div>

                  <!-- Cuerpo del gráfico -->
                  <div class="chart-card__body">
                    <!-- Columnas verticales: ≤ 10 ítems -->
                    <charts-ColumnChart
                      v-if="usarColumnChart && chartData.materiales && chartData.materiales.length > 0"
                      :series-data="chartData.materiales.map(i => i.value)"
                      :categories="chartData.materiales.map(i => i.label)"
                      :units="chartData.materiales.map(i => i.unidad)"
                      title=""
                    />
                    <!-- Barras horizontales: > 10 ítems -->
                    <charts-BarChart
                      v-else-if="!usarColumnChart && chartData.materiales && chartData.materiales.length > 0"
                      :series-data="chartData.materiales.map(i => i.value)"
                      :categories="chartData.materiales.map(i => i.label)"
                      :units="chartData.materiales.map(i => i.unidad)"
                      title=""
                      :horizontal="true"
                      :distributed="true"
                      series-name="Cantidad"
                    />
                    <b-alert
                      v-else-if="chartData.materiales && chartData.materiales.length === 0"
                      show variant="info" class="m-3"
                    >
                      No hay datos para mostrar con los filtros seleccionados.
                    </b-alert>
                  </div>
                </div>
              </b-col>
            </b-row>

            <!-- ── Fila 2: Tintas (50%) + Papel (50%) ── -->
            <b-row class="mb-4" v-if="chartData">

              <!-- Gráfico de Tintas + filtro de tipo integrado -->
              <b-col lg="6" md="12" class="mb-4 mb-lg-0">
                <div class="chart-card">
                  <div class="chart-card__header">
                    <span class="chart-card__title">
                      {{ filtroStock === 'enStock'
                          ? 'Distribución de Tintas en Stock'
                          : 'Distribución de Tintas Consumidas' }}
                    </span>
                    <!-- Filtro de tipo solo en enStock con >1 tipo -->
                    <div
                      v-if="filtroStock === 'enStock' && opcionesTipoTinta.length > 1"
                      class="chart-card__filter"
                    >
                      <span class="chart-card__filter-label">Tipo:</span>
                      <div class="cc-pills">
                        <button
                          v-for="opt in opcionesTipoTinta"
                          :key="opt.value"
                          :class="['cc-pill cc-pill--info', { 'cc-pill--active': tipoTintaSeleccionada === opt.value }]"
                          @click="onTipoTintaChange(opt.value)"
                        >{{ opt.text }}</button>
                      </div>
                    </div>
                  </div>
                  <div class="chart-card__body">
                    <charts-PieChart
                      v-if="chartData.tintas && chartData.tintas.values && chartData.tintas.values.some(v => v > 0)"
                      :values="chartData.tintas.values"
                      :labels="chartData.tintas.labels"
                      :colors="chartData.tintas.colors"
                      title=""
                    />
                    <b-alert v-else show variant="light" class="m-3 text-center text-muted">
                      Sin datos de tintas para los filtros seleccionados.
                    </b-alert>
                  </div>
                </div>
              </b-col>

              <!-- Gráfico de Papel -->
              <b-col lg="6" md="12" class="mb-4 mb-lg-0">
                <div class="chart-card">
                  <div class="chart-card__header">
                    <span class="chart-card__title">
                      {{ filtroStock === 'enStock' ? 'Stock de Papel Disponible' : 'Consumo de Papel Semanal' }}
                      <span v-if="rangoFechasLabel !== '30d'" class="chart-card__badge">{{ rangoFechasLabel }}</span>
                    </span>
                  </div>
                  <div class="chart-card__body">
                    <charts-LineChart
                      v-if="chartData.papel && chartData.papel.length > 0"
                      :series-data="chartData.papel.map(i => i.value)"
                      :categories="chartData.papel.map(i => i.label)"
                      title=""
                      unit="m"
                    />
                    <b-alert v-else show variant="light" class="m-3 text-center text-muted">
                      Sin datos de papel para los filtros seleccionados.
                    </b-alert>
                  </div>
                </div>
              </b-col>
            </b-row>

            <!-- Spinner solo en la primera carga (cuando no hay chartData todavía) -->
            <b-row v-if="loading && !chartData" class="justify-content-center py-5">
              <b-col cols="auto" class="text-center">
                <b-spinner variant="primary" style="width:2.5rem;height:2.5rem" />
                <div class="mt-2 text-muted small">Cargando gráficos...</div>
              </b-col>
            </b-row>
          </div>

          <!-- ════ TABLA DE DATOS ════ -->
          <b-row v-if="items.length > 0">
            <b-col>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="text-info m-0">{{ items.length }} Ítems encontrados</h3>
                <b-form-input
                  v-model="filter"
                  placeholder="Buscar en resultados..."
                  size="sm"
                  class="w-25"
                />
              </div>
              <b-table
                responsive
                small
                striped
                hover
                :items="items"
                :fields="fields"
                :filter="filter"
                v-model="itemsFiltrados"
              >
                <template #cell(cantidad)="data">
                  {{ displayCantidad(data.item) }}
                </template>
                <template #cell(costo)="data">
                  ${{ data.value }}
                </template>
              </b-table>
            </b-col>
          </b-row>
          <b-row v-else-if="!loading">
            <b-col>
              <b-alert show variant="info">No se encontraron registros para el departamento seleccionado.</b-alert>
            </b-col>
          </b-row>

        </b-container>
      </div>
      <div v-else>
        <accessDenied />
      </div>
    </div>

    <!-- Componente para impresión, oculto -->
    <div style="display: none;">
      <reportes-ReporteInventarioGeneral
        v-if="items.length > 0"
        :datos-reporte="datosParaElReporte"
        ref="reporteParaImprimir"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixin-login.js";
import PrintService from "@/utils/PrintService";

export default {
  mixins: [mixin],
  data() {
    return {
      titulo: "Reporte General de Inventario",
      loading: false,
      items: [],
      fields: [],
      filter: "",
      departamentoSeleccionado: "Todas",
      fechaDesde: null,
      fechaHasta: null,
      opcionesDepartamentos: [
        { text: "Todas", value: "Todas" },
        { text: "Impresión", value: "Impresión" },
        { text: "Estampado", value: "Estampado" },
        { text: "Corte", value: "Corte" },
        { text: "Costura", value: "Costura" },
        { text: "Diseño", value: "Diseño" },
        { text: "Administración", value: "Administración" }
      ],
      itemsFiltrados: [],
      filtroStock: 'enStock',
      opcionesStock: [
        { text: "Material en Stock", value: "enStock" },
        { text: "Material Consumido", value: "terminados" }
      ],
      limiteGrafico: 5,
      opcionesLimite: [
        { text: "Top 5",  value: 5 },
        { text: "Top 10", value: 10 },
        { text: "Top 20", value: 20 },
        { text: "Todos",  value: 0 }
      ],
      // Filtro de tipo de tinta — poblado dinámicamente desde la API
      tipoTintaSeleccionada: 'Todas',
      opcionesTipoTinta: [{ text: 'Todas', value: 'Todas' }],
      chartData: null
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),
    rangoFechasLabel() {
      if (this.fechaDesde && this.fechaHasta) {
        return `${this.fechaDesde} → ${this.fechaHasta}`;
      }
      return '30d';
    },
    /**
     * ≤ 10 ítems → ColumnChart vertical (etiquetas caben bien)
     * > 10 ítems → BarChart horizontal (etiquetas en eje Y, siempre legibles)
     */
    usarColumnChart() {
      return this.limiteGrafico > 0 && this.limiteGrafico <= 10;
    },
    datosParaElReporte() {
      return {
        items: this.itemsFiltrados.length > 0 ? this.itemsFiltrados : this.items,
        departamento: this.departamentoSeleccionado,
        filtroStock: this.filtroStock
      };
    },
  },
  methods: {
    async loadReport() {
      this.loading = true;
      try {
        const res = await this.$axios.get(`${this.$config.API}/inventario/reportes/general`, {
          params: {
            departamento: this.departamentoSeleccionado,
            filtroStock: this.filtroStock,
            fechaDesde: this.fechaDesde || null,
            fechaHasta: this.fechaHasta || null,
            limiteGrafico: this.limiteGrafico,
            tipoTinta: this.tipoTintaSeleccionada
          }
        });
        if (res.data.success) {
          this.items = res.data.items;
          this.fields = res.data.fields.map(field => {
            if (field.key === 'cantidad') {
              return {
                ...field,
                label: this.filtroStock === 'terminados' ? 'Consumido' : 'Stock'
              };
            }
            return field;
          });

          // Calcular materiales localmente para respetar el límite y la agrupación
          let materialsList = [];
          if (this.items && this.items.length > 0) {
            const grouped = {};
            this.items.forEach(item => {
              const label = item.insumo;
              const key = `${item.sku}_${label}_${item.unidad}`;
              let value = 0;
              if (this.filtroStock === 'terminados') {
                const cant = parseFloat(item.cantidad || 0);
                const cantIni = parseFloat(item.cantidad_inicial) || cant || 0;
                const diff = cantIni - cant;
                if (item.tipo_insumo === 'tela') {
                  const rend = parseFloat(item.rendimiento) || 1;
                  value = diff * rend;
                } else {
                  value = diff;
                }
              } else {
                const cant = parseFloat(item.cantidad || 0);
                if (item.tipo_insumo === 'tela') {
                  const rend = parseFloat(item.rendimiento) || 1;
                  value = cant * rend;
                } else {
                  value = cant;
                }
              }

              if (value > 0) {
                if (!grouped[key]) {
                  grouped[key] = {
                    label: label,
                    value: 0,
                    unidad: item.tipo_insumo === 'tela' ? 'Mts' : item.unidad
                  };
                }
                grouped[key].value += value;
              }
            });

            materialsList = Object.values(grouped).map(g => {
              g.value = parseFloat(g.value.toFixed(2));
              return g;
            });
            materialsList.sort((a, b) => b.value - a.value);
            if (this.limiteGrafico > 0) {
              materialsList = materialsList.slice(0, this.limiteGrafico);
            }
          }

          if (res.data.chartData) {
            this.chartData = { ...res.data.chartData, materiales: materialsList };
          } else {
            this.chartData = { materiales: materialsList, tintas: null, papel: [] };
          }

          // Departamentos disponibles dinámicamente
          if (res.data.availableDepartments) {
            this.opcionesDepartamentos = [
              { text: "Todas", value: "Todas" },
              ...res.data.availableDepartments.map(dep => ({ text: dep, value: dep }))
            ];
          }

          // Tipos de tinta disponibles dinámicamente
          if (res.data.availableTintaTypes && res.data.availableTintaTypes.length > 0) {
            this.opcionesTipoTinta = [
              { text: 'Todas', value: 'Todas' },
              ...res.data.availableTintaTypes.map(t => ({ text: t.nombre, value: t._id }))
            ];
          } else {
            this.opcionesTipoTinta = [{ text: 'Todas', value: 'Todas' }];
          }
        } else {
          this.$fire({
            title: "Error",
            text: res.data.message || "No se pudo cargar el reporte",
            type: "error"
          });
        }
      } catch (error) {
        console.error("Error al cargar reporte:", error);
        this.$fire({
          title: "Error",
          text: "Ocurrió un error al conectar con el servidor",
          type: "error"
        });
      } finally {
        this.loading = false;
      }
    },

    /** Cambia el límite del gráfico de materiales y recarga */
    onLimiteChange(valor) {
      this.limiteGrafico = valor;
      this.loadReport();
    },

    /** Cambia el tipo de tinta en el gráfico de tintas y recarga */
    onTipoTintaChange(valor) {
      this.tipoTintaSeleccionada = valor;
      this.loadReport();
    },

    /** Al cambiar entre Stock/Consumido: resetea el filtro de tipo tinta */
    onFiltroStockChange() {
      this.tipoTintaSeleccionada = 'Todas';
      this.loadReport();
    },

    displayCantidad(item) {
      const cant = parseFloat(item.cantidad || 0);
      const cantIni = parseFloat(item.cantidad_inicial) || cant || 0;
      if (this.filtroStock === 'terminados') {
        const consumed = cantIni - cant;
        return consumed > 0 ? consumed.toFixed(2) : '0.00';
      }
      return cant.toFixed(2);
    },

    async fetchChartsData() {
      // Conservado por compatibilidad — no se usa directamente
    },

    /**
     * Calcula el rango "últimos 30 días" en formato YYYY-MM-DD, en la zona
     * horaria local del navegador (evita el corrimiento de un día que
     * produce toISOString() por convertir a UTC).
     */
    calcularRango30Dias() {
      const toYMD = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      const hasta = new Date();
      const desde = new Date();
      desde.setDate(desde.getDate() - 30);
      return { desde: toYMD(desde), hasta: toYMD(hasta) };
    },

    resetFechas() {
      const { desde, hasta } = this.calcularRango30Dias();
      this.fechaDesde = desde;
      this.fechaHasta = hasta;
      this.loadReport();
    },

    imprimirReporte() {
      if (!this.$refs.reporteParaImprimir) return;
      const printContent = this.$refs.reporteParaImprimir.$el.innerHTML;
      const reportTitle = `Reporte de Inventario - ${this.departamentoSeleccionado}`;
      const customStyles = `
        <style>
          @page { size: landscape; margin: 10mm; }
          .report-container { width: 100%; }
          .report-header { text-align: center; margin-bottom: 20px; }
          .report-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .report-table th, .report-table td { border: 1px solid #333; padding: 5px; text-align: left; font-size: 9pt; }
          .report-table th { background-color: #eee; }
          h1, h2 { margin: 5px 0; font-size: 16pt !important; }
          .report-info { margin-bottom: 20px; text-align: left; }
          .report-info p { margin: 2px 0; }
        </style>
      `;
      PrintService.imprimir(reportTitle, customStyles + printContent);
    }
  },
  mounted() {
    const { desde, hasta } = this.calcularRango30Dias();
    this.fechaDesde = desde;
    this.fechaHasta = hasta;
    this.loadReport();
  }
};
</script>

<style scoped>
/* ═══ BARRA DE CONTROL SUPERIOR ════════════════════════════════ */
.report-control-bar {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 14px 18px;
}
.rcb-label {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.rcb-divider {
  width: 1px;
  height: 32px;
  background: #dee2e6;
  align-self: flex-end;
  margin-bottom: 2px;
}

/* ═══ TRANSICIÓN DE CARGA ════════════════════════════════════════
   Los gráficos se atenúan levemente durante la carga —
   el layout NUNCA desaparece, evitando los saltos visuales.
   ═══════════════════════════════════════════════════════════════ */
.rpt-charts {
  transition: opacity 0.25s ease;
}
.rpt-charts--loading {
  opacity: 0.45;
  pointer-events: none;
}

/* ═══ CHART CARD ════════════════════════════════════════════════ */
.chart-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
}
.chart-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 18px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}
.chart-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}
.chart-card__badge {
  display: inline-block;
  background: #e9ecef;
  color: #6c757d;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
}
.chart-card__filter {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chart-card__filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  white-space: nowrap;
}
.chart-card__body {
  padding: 8px 0;
}

/* ═══ PILLS DE FILTRO (alternativa a radio buttons) ════════════ */
.cc-pills {
  display: flex;
  gap: 4px;
}
.cc-pill {
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid #ced4da;
  background: transparent;
  color: #495057;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.cc-pill:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}
.cc-pill--active {
  background: #007bff;
  border-color: #007bff;
  color: #fff;
}
.cc-pill--info.cc-pill--active {
  background: #17a2b8;
  border-color: #17a2b8;
  color: #fff;
}
</style>
