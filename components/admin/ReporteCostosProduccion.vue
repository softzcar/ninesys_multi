<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-variant="primary"
    >
      <b-container fluid>
        <b-row class="mb-3">
          <b-col>
            <h3>Reporte de Costos de Producción</h3>
          </b-col>
        </b-row>

        <!-- Filtros -->
        <b-row class="mb-4 p-3 bg-light border rounded align-items-end">
          <b-col md="3">
            <b-form-group label="Fecha de Inicio:">
              <b-form-datepicker
                v-model="filters.inicio"
                locale="es"
              ></b-form-datepicker>
            </b-form-group>
          </b-col>
          <b-col md="3">
            <b-form-group label="Fecha de Fin:">
              <b-form-datepicker
                v-model="filters.fin"
                locale="es"
              ></b-form-datepicker>
            </b-form-group>
          </b-col>
          <b-col md="2">
            <b-form-group label="Buscar por Orden:">
              <b-form-input
                v-model="tableFilter"
                placeholder="N° Orden"
                debounce="500"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col md="2">
            <b-form-group label="Incluir Gastos:">
              <b-form-checkbox-group
                v-model="selectedExpenses"
                :options="expenseOptions"
                switches
              ></b-form-checkbox-group>
            </b-form-group>
          </b-col>
          <b-col md="2">
            <b-button
              variant="primary"
              @click="getReport"
              class="w-100"
            >
              <b-icon-search></b-icon-search> Buscar
            </b-button>
          </b-col>
        </b-row>

        <!-- Tabla de Resultados -->
        <b-row>
          <b-col>
            <b-table
              striped
              hover
              :items="reportData"
              :fields="dynamicFields"
              :filter="tableFilter"
              :filter-included-fields="['id_orden']"
              @filtered="onFiltered"
              primary-key="id_orden"
              responsive
              foot-clone
            >
              <template #cell(id_orden)="data">
                <linkSearch :id="data.item.id_orden" />
              </template>
              <template #cell(total_productos)="data">
                <reporte-costos-produccion-productos
                  :id_orden="data.item.id_orden"
                  :valor="data.item.total_productos"
                />
              </template>
              <template #cell(costo_insumos_total)="data">
                <reporte-costos-produccion-insumos
                  :id_orden="data.item.id_orden"
                  :costo-insumos-total="Number(data.item.costo_insumos_total || 0)"
                />
              </template>
              <template #cell(costo_mano_de_obra_total)="data">
                <reporte-costos-produccion-labor
                  :id_orden="data.item.id_orden"
                  :costo-mano-obra="Number(data.item.costo_mano_de_obra_total || 0)"
                  :empleados-asignados="data.item.empleados_asignados"
                  :hora-empleados-precios="horaEmpleadosPrecios"
                  :hora-empleados-tiempos="horaEmpleadosTiempos"
                  :horario-laboral="getHorarioLaboral()"
                />
              </template>

              <!-- Celdas Dinámicas de Gastos -->
              <template #cell(gasto_fijo)="data">
                $ {{ (data.item.gasto_fijo || 0).toFixed(2) }}
              </template>
              <template #cell(gasto_variable)="data">
                $ {{ (data.item.gasto_variable || 0).toFixed(2) }}
              </template>
              <template #cell(gasto_adicional)="data">
                $ {{ (data.item.gasto_adicional || 0).toFixed(2) }}
              </template>

              <template #cell(eficiencia_insumos)="data">
                <reporte-costos-produccion-insumos-eficiencia
                  :id_orden="data.item.id_orden"
                  :valor="data.item.eficiencia_insumos"
                  :insumos_detalles="getInsumosDetalles()"
                />
              </template>
              <template #cell(tiempo_de_produccion)="data">
                {{ data.item.tiempo_de_produccion.toFixed(2) }} hrs
              </template>
              <template #cell(pago_total)="data">
                $ {{ data.item.pago_total.toFixed(2) }}
              </template>
              <template #cell(ganancia)="data">
                <strong
                  :class="data.item.ganancia > 0 ? 'text-success' : 'text-danger'"
                >
                  $ {{ data.item.ganancia.toFixed(2) }}
                </strong>
              </template>
              <template #cell(costo_total)="data">
                <strong>$ {{ data.item.costo_total.toFixed(2) }}</strong>
              </template>

              <!-- Footer Slots for Totals -->
              <template #foot(id_orden)>
                <strong>Totales:</strong>
              </template>
              <template #foot(vendedor)>
                <span>&nbsp;</span>
              </template>
              <template #foot(total_productos)>
                <strong>{{ reportTotals.total_productos }}</strong>
              </template>
              <template #foot(costo_insumos_total)>
                <strong>$ {{ reportTotals.costo_insumos_total.toFixed(2) }}</strong>
              </template>
              <template #foot(costo_mano_de_obra_total)>
                <strong>$ {{ reportTotals.costo_mano_de_obra_total.toFixed(2) }}</strong>
              </template>

              <!-- Footer Dinámico Gastos -->
              <template #foot(gasto_fijo)>
                <strong>$ {{ (reportTotals.gasto_fijo || 0).toFixed(2) }}</strong>
              </template>
              <template #foot(gasto_variable)>
                <strong>$ {{ (reportTotals.gasto_variable || 0).toFixed(2) }}</strong>
              </template>
              <template #foot(gasto_adicional)>
                <strong>$ {{ (reportTotals.gasto_adicional || 0).toFixed(2) }}</strong>
              </template>

              <template #foot(material_consumido)>
                <strong>{{ reportTotals.material_consumido.toFixed(2) }} m</strong>
              </template>
              <template #foot(eficiencia_insumos)>
                <strong>{{ reportTotals.eficiencia_insumos.toFixed(2) }}%</strong>
              </template>
              <template #foot(reposiciones)>
                <strong>{{ reportTotals.reposiciones }}</strong>
              </template>
              <template #foot(tiempo_de_produccion)>
                <strong>{{
                    reportTotals.tiempo_de_produccion.toFixed(2)
                  }}
                  hrs</strong>
              </template>
              <template #foot(pago_total)>
                <strong>$ {{ reportTotals.pago_total.toFixed(2) }}</strong>
              </template>
              <template #foot(ganancia)>
                <strong :class="
                    reportTotals.ganancia > 0 ? 'text-success' : 'text-danger'
                  ">
                  $ {{ reportTotals.ganancia.toFixed(2) }}
                </strong>
              </template>
              <template #foot(costo_total)>
                <strong>$ {{ reportTotals.costo_total.toFixed(2) }}</strong>
              </template>
            </b-table>
          </b-col>
        </b-row>

        <!-- Costos Operativos -->
        <hr />
        <b-row
          class="mt-4"
          v-if="costosOperativos.total_productos_periodo"
        >
          <b-col>
            <h4>Resumen de Costos Operativos (Periodo Seleccionado)</h4>
            <b-card
              no-body
              class="mt-3"
            >
              <b-list-group flush>
                <b-list-group-item class="d-flex justify-content-between align-items-center">
                  Total Productos Fabricados:
                  <b-badge variant="secondary" pill>{{ costosOperativos.total_productos_periodo }}</b-badge>
                </b-list-group-item>
                <b-list-group-item v-for="(val, tipo) in totalGastosPorTipoUSD" :key="tipo" class="d-flex justify-content-between align-items-center">
                  Total Gastos {{ tipo.charAt(0).toUpperCase() + tipo.slice(1) }}s:
                  <b-badge variant="info" pill>$ {{ val.toFixed(2) }}</b-badge>
                </b-list-group-item>
                <b-list-group-item class="d-flex justify-content-between align-items-center bg-light">
                  <strong>Utilidad Neta del Periodo (Estimada):</strong>
                  <strong :class="reportTotals.ganancia > 0 ? 'text-success' : 'text-danger'">
                    $ {{ reportTotals.ganancia.toFixed(2) }}
                  </strong>
                </b-list-group-item>
              </b-list-group>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>
  </div>
</template>

<script>
import ReporteCostosProduccionProductos from "./ReporteCostosProduccionProductos.vue";
import ReporteCostosProduccionInsumos from "./ReporteCostosDeProduccionInsumos.vue";
import ReporteCostosProduccionMaterial from "./ReporteCostosProduccionMaterial.vue";
import ReporteCostosProduccionLabor from "./ReporteCostosProduccionLabor.vue";
import ReporteCostosProduccionInsumosEficiencia from "./ReporteCostosProduccionInsumos.vue";

import mixintime from "~/mixins/mixin-time.js";
import { mapState } from "vuex";

export default {
  mixins: [mixintime],
  components: {
    ReporteCostosProduccionProductos,
    ReporteCostosProduccionInsumos,
    ReporteCostosProduccionMaterial,
    ReporteCostosProduccionLabor,
    ReporteCostosProduccionInsumosEficiencia,
  },
  data() {
    return {
      horaEmpleadosPrecios: [],
      horaEmpleadosTiempos: [],
      salariosEmpleados: [],
      overlay: true,
      reportData: [],
      filteredReportData: [],
      costosOperativos: {},
      tintasResumen: [],
      insumosResumen: [],
      insumosDetalles: [],
      tableFilter: "",
      filters: {
        inicio: null,
        fin: null,
      },
      selectedExpenses: [],
      expenseOptions: [
        { text: 'Fijos', value: 'fijo' },
        { text: 'Variables', value: 'variable' },
        { text: 'Adicionales', value: 'adicional' }
      ],
      baseFields: [
        { key: "id_orden", label: "Orden", sortable: true },
        { key: "vendedor", label: "Vendedor", sortable: true },
        { key: "total_productos", label: "Productos", sortable: true },
        { key: "costo_insumos_total", label: "Costo Insumos", sortable: true },
        { key: "costo_mano_de_obra_total", label: "Costo M.O.", sortable: true },
      ]
    };
  },
  computed: {
    ...mapState("login", ["tasas"]),
    
    dynamicFields() {
      const fields = [...this.baseFields];
      
      if (this.selectedExpenses.includes('fijo')) {
        fields.push({ key: "gasto_fijo", label: "G. Fijo", sortable: true });
      }
      if (this.selectedExpenses.includes('variable')) {
        fields.push({ key: "gasto_variable", label: "G. Var.", sortable: true });
      }
      if (this.selectedExpenses.includes('adicional')) {
        fields.push({ key: "gasto_adicional", label: "G. Adic.", sortable: true });
      }
      
      fields.push(
        { key: "eficiencia_insumos", label: "Eficiencia Insumos (%)", sortable: true },
        { key: "reposiciones", label: "Reposiciones", sortable: true },
        { key: "tiempo_de_produccion", label: "T. Producción", sortable: true },
        { key: "pago_total", label: "Venta", sortable: true },
        { key: "ganancia", label: "Ganancia", sortable: true },
        { key: "costo_total", label: "Costo Total", sortable: true }
      );
      
      return fields;
    },

    totalGastosPorTipoUSD() {
      const totals = { fijo: 0, variable: 0, adicional: 0 };
      const gastos = this.costosOperativos.gastos_por_tipo || {};
      
      ['fijo', 'variable', 'adicional'].forEach(tipo => {
        if (gastos[tipo]) {
          gastos[tipo].forEach(g => {
            const tasa = parseFloat(this.tasas[this.getTasaKey(g.moneda)]) || 1;
            totals[tipo] += g.total * tasa;
          });
        }
      });
      return totals;
    },

    costPerUnitByType() {
      const costs = { fijo: 0, variable: 0, adicional: 0 };
      const totalUnits = this.costosOperativos.total_productos_periodo || 0;
      
      if (totalUnits > 0) {
        const totalsUSD = this.totalGastosPorTipoUSD;
        costs.fijo = totalsUSD.fijo / totalUnits;
        costs.variable = totalsUSD.variable / totalUnits;
        costs.adicional = totalsUSD.adicional / totalUnits;
      }
      return costs;
    },

    reportTotals() {
      const dataToProcess = this.filteredReportData;
      const totals = {
        total_productos: 0,
        costo_insumos_total: 0,
        costo_mano_de_obra_total: 0,
        gasto_fijo: 0,
        gasto_variable: 0,
        gasto_adicional: 0,
        material_consumido: 0,
        eficiencia_insumos: 0,
        eficiencia_count: 0,
        reposiciones: 0,
        tiempo_de_produccion: 0,
        pago_total: 0,
        ganancia: 0,
        costo_total: 0,
      };

      if (dataToProcess.length === 0) return totals;

      dataToProcess.forEach((item) => {
        totals.total_productos += Number(item.total_productos || 0);
        totals.costo_insumos_total += this.roundToTwoDecimals(item.costo_insumos_total);
        totals.costo_mano_de_obra_total += this.roundToTwoDecimals(item.costo_mano_de_obra_total);
        
        // Gastos dinámicos
        if (this.selectedExpenses.includes('fijo')) totals.gasto_fijo += (item.gasto_fijo || 0);
        if (this.selectedExpenses.includes('variable')) totals.gasto_variable += (item.gasto_variable || 0);
        if (this.selectedExpenses.includes('adicional')) totals.gasto_adicional += (item.gasto_adicional || 0);

        totals.material_consumido += this.roundToTwoDecimals(item.material_consumido);
        totals.pago_total += this.roundToTwoDecimals(item.pago_total);
        totals.costo_total += this.roundToTwoDecimals(item.costo_total);
        totals.ganancia += this.roundToTwoDecimals(item.ganancia);
        
        totals.reposiciones += Number(item.reposiciones || 0);
        totals.tiempo_de_produccion += Number(item.tiempo_de_produccion || 0);

        const effVal = parseFloat(item.eficiencia_insumos);
        if (!isNaN(effVal) && effVal > 0) {
          totals.eficiencia_insumos += effVal;
          totals.eficiencia_count++;
        }
      });

      totals.costo_insumos_total = this.roundToTwoDecimals(totals.costo_insumos_total);
      totals.costo_mano_de_obra_total = this.roundToTwoDecimals(totals.costo_mano_de_obra_total);
      totals.pago_total = this.roundToTwoDecimals(totals.pago_total);
      totals.costo_total = this.roundToTwoDecimals(totals.costo_total);
      totals.ganancia = this.roundToTwoDecimals(totals.ganancia);

      if (totals.eficiencia_count > 0) {
        totals.eficiencia_insumos = this.roundToTwoDecimals(totals.eficiencia_insumos / totals.eficiencia_count);
      }
      return totals;
    },
  },
  watch: {
    selectedExpenses() {
      this.updateUnifiedColumns();
    }
  },
  methods: {
    getTasaKey(moneda) {
      const map = {
        'USD': 'dolar',
        'VES': 'bolivar',
        'COP': 'peso_colombiano',
        'BS': 'bolivar'
      };
      return map[(moneda || 'USD').toUpperCase()] || 'dolar';
    },

    roundToTwoDecimals(value) {
      return Math.round((Number(value) || 0) * 100) / 100;
    },

    getInsumosDetalles() {
      return this.insumosDetalles || [];
    },

    getHorarioLaboral() {
      const horarioRaw = this.$store.state.login.dataEmpresa.horario_laboral;
      const parsed = typeof horarioRaw === "string"
        ? JSON.parse(horarioRaw || "{}")
        : horarioRaw || {};
      return parsed;
    },

    onFiltered(filteredItems) {
      this.filteredReportData = filteredItems;
      this.combineReportDataWithTintas(filteredItems);
      this.combineReportDataWithInsumos(filteredItems);
      this.updateUnifiedColumns(filteredItems);
    },

    updateUnifiedColumns(dataToProcess = null) {
      const data = dataToProcess || this.reportData;
      const costsPerUnit = this.costPerUnitByType;

      data.forEach((item) => {
        const numProds = Number(item.total_productos || 0);
        
        // Asignar gastos individuales
        item.gasto_fijo = this.selectedExpenses.includes('fijo') ? (costsPerUnit.fijo * numProds) : 0;
        item.gasto_variable = this.selectedExpenses.includes('variable') ? (costsPerUnit.variable * numProds) : 0;
        item.gasto_adicional = this.selectedExpenses.includes('adicional') ? (costsPerUnit.adicional * numProds) : 0;
        
        const gastos_totales_fila = item.gasto_fijo + item.gasto_variable + item.gasto_adicional;

        const pago = this.roundToTwoDecimals(item.pago_total || 0);
        const insumos = Number(item.costos_de_insumos || 0);
        const tintas = Number(item.total_tinta_costo || 0);
        
        const costo_mano_de_obra_actual = Number(item.costo_mano_de_obra_total || 0);
        const costo_mano_de_obra_api = Number(item.costo_mano_de_obra || 0);
        
        const costo_mano_de_obra_total = costo_mano_de_obra_actual > 0 
            ? costo_mano_de_obra_actual 
            : costo_mano_de_obra_api;

        item.pago_total = pago;
        item.costo_insumos_total = this.roundToTwoDecimals(insumos + tintas);
        item.costo_mano_de_obra_total = this.roundToTwoDecimals(costo_mano_de_obra_total);
        
        // El costo total incluye los gastos operativos seleccionados
        item.costo_total = this.roundToTwoDecimals(item.costo_insumos_total + item.costo_mano_de_obra_total + gastos_totales_fila);
        item.ganancia = this.roundToTwoDecimals(item.pago_total - item.costo_total);
      });

      if (!dataToProcess) {
        this.filteredReportData = [...this.reportData];
      }
    },

    combineReportDataWithTintas(dataToProcess = null) {
      const data = dataToProcess || this.reportData;
      const tintasMap = {};
      this.tintasResumen.forEach(tinta => {
        tintasMap[tinta.id_orden] = tinta;
      });

      data.forEach(item => {
        const tintaData = tintasMap[item.id_orden];
        if (tintaData) {
          item.total_tinta_consumo_ml = tintaData.total_tinta_consumo_ml || 0;
          item.total_tinta_costo = tintaData.total_tinta_costo || 0;
        } else {
          item.total_tinta_consumo_ml = 0;
          item.total_tinta_costo = 0;
        }
      });

      if (!dataToProcess) {
        this.filteredReportData = [...this.reportData];
      }
    },

    combineReportDataWithInsumos(dataToProcess = null) {
      const data = dataToProcess || this.reportData;
      const insumosMap = {};
      this.insumosResumen.forEach(insumo => {
        insumosMap[insumo.id_orden] = insumo;
      });

      data.forEach(item => {
        const insumoData = insumosMap[item.id_orden];
        if (insumoData) {
          item.eficiencia_insumos = insumoData.eficiencia || 0;
        } else {
          item.eficiencia_insumos = 0;
        }
      });

      if (!dataToProcess) {
        this.filteredReportData = [...this.reportData];
      }
    },

    setDefaultDates() {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      this.filters.inicio = monday.toISOString().split("T")[0];
      this.filters.fin = new Date().toISOString().split("T")[0];
    },

    async getReport() {
      this.overlay = true;
      this.tableFilter = "";
      if (!this.filters.inicio || !this.filters.fin) {
        this.$bvToast.toast("Por favor, seleccione un rango de fechas.", {
          title: "Faltan Datos",
          variant: "warning",
          solid: true,
        });
        this.overlay = false;
        return;
      }

      const url = `${this.$config.API}/reportes/costos-produccion/${this.filters.inicio}/${this.filters.fin}`;

      try {
        const { data } = await this.$axios.get(url);
        
        this.horaEmpleadosPrecios = data.costo_hora_empleado || [];
        this.horaEmpleadosTiempos = data.tareas_data || [];
        this.salariosEmpleados = data.salarios_data || [];
        this.tintasResumen = data.tintas_resumen || [];
        this.insumosResumen = data.insumos_resumen || [];
        this.insumosDetalles = data.insumos_detalles || [];
        this.costosOperativos = data.costos_operativos || {};

        const tintasMap = {};
        this.tintasResumen.forEach(t => tintasMap[t.id_orden] = t);
        const insumosMap = {};
        this.insumosResumen.forEach(i => insumosMap[i.id_orden] = i);

        const horarioRaw = this.$store.state.login.dataEmpresa.horario_laboral;
        const horarioLaboral = typeof horarioRaw === 'string' ? JSON.parse(horarioRaw || '{}') : (horarioRaw || {});

        const processedData = data.reporte_data.map(item => {
          const id = item.id_orden;
          const salario_invertido = this.calcularCostoSalariosOrden(
            id,
            item.empleados_asignados,
            this.horaEmpleadosPrecios,
            horarioLaboral,
            this.horaEmpleadosTiempos
          );

          const tinta_consumo = tintasMap[id]?.total_tinta_consumo_ml || 0;
          const tinta_costo = tintasMap[id]?.total_tinta_costo || 0;
          const eficiencia = insumosMap[id]?.eficiencia || 0;
          const insumos_costo = Number(item.costos_de_insumos || 0);

          return {
            ...item,
            salario_invertido,
            total_tinta_consumo_ml: tinta_consumo,
            total_tinta_costo: tinta_costo,
            eficiencia_insumos: eficiencia,
            costos_de_insumos: insumos_costo
          };
        });

        this.reportData = processedData;
        this.updateUnifiedColumns(this.reportData);
      } catch (error) {
        console.error("Error al obtener el reporte:", error);
        this.$bvToast.toast("No se pudo cargar el reporte.", {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      } finally {
        this.overlay = false;
      }
    },
  },
  mounted() {
    this.setDefaultDates();
    this.getReport();
  },
};
</script>

