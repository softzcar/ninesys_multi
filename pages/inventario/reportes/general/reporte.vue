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
        <b-overlay :show="loading" spinner-small>
          <b-container fluid>
            <b-row>
              <b-col>
                <h1 class="mb-4">{{ titulo }}</h1>
              </b-col>
            </b-row>

            <!-- Filtro de Fechas para Gráficos -->
            <b-row class="mb-3 align-items-end">
              <b-col md="auto">
                <label class="d-block font-weight-bold">Rango de fechas (gráficos):</label>
              </b-col>
              <b-col md="auto">
                <label class="small text-muted">Desde:</label>
                <b-form-input
                  v-model="fechaDesde"
                  type="date"
                  size="sm"
                  @change="loadReport"
                ></b-form-input>
              </b-col>
              <b-col md="auto">
                <label class="small text-muted">Hasta:</label>
                <b-form-input
                  v-model="fechaHasta"
                  type="date"
                  size="sm"
                  @change="loadReport"
                ></b-form-input>
              </b-col>
              <b-col md="auto">
                <b-button size="sm" variant="outline-secondary" @click="resetFechas">Últimos 30 días</b-button>
              </b-col>
            </b-row>

            <!-- Sección de Gráficos de Producción y Consumo -->
            <b-row class="mb-5" v-if="!loading && chartData">
              <b-col lg="4" md="6" class="mb-4">
                <charts-ColumnChart 
                  v-if="chartData.materiales && chartData.materiales.length > 0"
                  :series-data="chartData.materiales.map(i => i.value)"
                  :categories="chartData.materiales.map(i => i.label)"
                  :units="chartData.materiales.map(i => i.unidad)"
                  :title="filtroStock === 'enStock' ? 'Telas e Insumos Disponibles (Stock)' : 'Telas e Insumos Más Usados (' + rangoFechasLabel + ')'"
                />
              </b-col>
              <b-col lg="4" md="6" class="mb-4">
                <charts-PieChart 
                  v-if="chartData.tintas"
                  :values="chartData.tintas.values"
                  :labels="chartData.tintas.labels"
                  :colors="chartData.tintas.colors"
                  :title="filtroStock === 'enStock' ? 'Distribución de Tintas en Stock' : 'Distribución de Tintas Consumidas (' + rangoFechasLabel + ')'"
                />
              </b-col>
              <b-col lg="4" md="12" class="mb-4">
                <charts-LineChart 
                  v-if="chartData.papel && chartData.papel.length > 0"
                  :series-data="chartData.papel.map(i => i.value)"
                  :categories="chartData.papel.map(i => i.label)"
                  :title="filtroStock === 'enStock' ? 'Stock de Papel Disponible' : 'Consumo de Papel Semanal (' + rangoFechasLabel + ')'"
                  unit="m"
                />
              </b-col>
            </b-row>

            <!-- Filtros por Departamento -->
            <b-row class="mb-4">
              <b-col md="6">
                <label class="d-block">Filtrar por Departamento:</label>
                <b-form-radio-group
                  v-model="departamentoSeleccionado"
                  :options="opcionesDepartamentos"
                  buttons
                  button-variant="outline-primary"
                  size="md"
                  name="radio-btn-dept"
                  @change="loadReport"
                ></b-form-radio-group>
              </b-col>
              <b-col md="6">
                <label class="d-block">Disponibilidad:</label>
                <b-form-radio-group
                  v-model="filtroStock"
                  :options="opcionesStock"
                  buttons
                  button-variant="outline-primary"
                  size="md"
                  name="radio-btn-stock"
                  @change="loadReport"
                ></b-form-radio-group>
              </b-col>
            </b-row>

            <b-row class="mb-3">
              <b-col class="d-flex align-items-center">
                <b-button variant="info" @click="imprimirReporte" :disabled="items.length === 0" class="mr-2">IMPRIMIR REPORTE</b-button>
                <b-button variant="secondary" @click="loadReport">REFRESCAR</b-button>
              </b-col>
            </b-row>

            <b-row v-if="items.length > 0">
              <b-col>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 class="text-info m-0">{{ items.length }} Ítems encontrados</h3>
                  <b-form-input
                    v-model="filter"
                    placeholder="Buscar en resultados..."
                    size="sm"
                    class="w-25"
                  ></b-form-input>
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
        </b-overlay>
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
      console.log("loadReport calling API with params:", {
        departamento: this.departamentoSeleccionado,
        filtroStock: this.filtroStock,
        fechaDesde: this.fechaDesde,
        fechaHasta: this.fechaHasta
      });
      this.loading = true;
      try {
        const res = await this.$axios.get(`${this.$config.API}/inventario/reportes/general`, {
          params: {
            departamento: this.departamentoSeleccionado,
            filtroStock: this.filtroStock,
            fechaDesde: this.fechaDesde || null,
            fechaHasta: this.fechaHasta || null
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
          this.chartData = res.data.chartData || null;
          
          // Actualizar opciones de departamentos dinámicamente
          if (res.data.availableDepartments) {
            const dynamicOptions = [
              { text: "Todas", value: "Todas" },
              ...res.data.availableDepartments.map(dep => ({ text: dep, value: dep }))
            ];
            this.opcionesDepartamentos = dynamicOptions;
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
      // Método conservado por compatibilidad pero ya no se usa
      // Los datos de charts se obtienen desde loadReport() directamente
    },
    resetFechas() {
      this.fechaDesde = null;
      this.fechaHasta = null;
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
    this.loadReport();
  }
};
</script>
