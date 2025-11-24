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
          <b-col md="4">
            <b-form-group label="Fecha de Inicio:">
              <b-form-datepicker
                v-model="filters.inicio"
                locale="es"
              ></b-form-datepicker>
            </b-form-group>
          </b-col>
          <b-col md="4">
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
              :fields="fields"
              :filter="tableFilter"
              :filter-included-fields="['id_orden']"
              @filtered="onFiltered"
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
              <template #cell(costos_de_insumos)="data">
                <reporte-costos-produccion-insumos
                  :id_orden="data.item.id_orden"
                  :valor="data.item.costos_de_insumos"
                />
              </template>
              <template #cell(costo_mano_de_obra)="data">
                <reporte-costos-produccion-mano-obra
                  :id_orden="data.item.id_orden"
                  :valor="data.item.costo_mano_de_obra"
                />
              </template>
              <template #cell(salario_invertido)="data">
                <reporte-costos-produccion-salarios
                  :id_orden="data.item.id_orden"
                  :valor="data.item.salario_invertido"
                  :empleados-asignados="data.item.empleados_asignados"
                  :hora-empleados-precios="horaEmpleadosPrecios"
                  :hora-empleados-tiempos="horaEmpleadosTiempos"
                  :horario-laboral="$store.state.login.dataEmpresa.horario_laboral"
                />
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
                <strong :class="
                    (data.item.pago_total - data.item.costo_total - data.item.salario_invertido - data.item.total_tinta_costo) > 0 ? 'text-success' : 'text-danger'
                  ">
                  $ {{ (data.item.pago_total - data.item.costo_total - data.item.salario_invertido - data.item.total_tinta_costo).toFixed(2) }}
                </strong>
              </template>
              <template #cell(total_tinta_costo)="data">
                <reporte-costos-produccion-tintas
                  :id_orden="data.item.id_orden"
                  :valor="data.item.total_tinta_costo"
                />
              </template>
              <template #cell(costo_total)="data">
                <strong>$ {{ (data.item.costo_total + data.item.salario_invertido + data.item.total_tinta_costo).toFixed(2) }}</strong>
              </template>

              <!-- Footer Slots for Totals -->
              <template #foot(id_orden)>
                <strong>Totales:</strong>
              </template>
              <template #foot(vendedor)>
                <span>&nbsp;</span>
                <!-- Celda vacía para la columna del vendedor -->
              </template>
              <template #foot(total_productos)>
                <strong>{{ reportTotals.total_productos }}</strong>
              </template>
              <template #foot(costos_de_insumos)>
                <strong>$ {{ reportTotals.costos_de_insumos.toFixed(2) }}</strong>
              </template>
              <template #foot(costo_mano_de_obra)>
                <strong>$ {{ reportTotals.costo_mano_de_obra.toFixed(2) }}</strong>
              </template>
              <template #foot(salario_invertido)>
                <strong>$ {{ reportTotals.salario_invertido.toFixed(2) }}</strong>
              </template>
              <template #foot(total_tinta_costo)>
                <strong>$ {{ reportTotals.total_tinta_costo.toFixed(2) }}</strong>
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
          v-if="costosOperativos.total_gastos_semanales"
        >
          <b-col>
            <h4>Costos Operativos Semanales</h4>
            <b-card
              no-body
              class="mt-3"
            >
              <b-list-group flush>
                <b-list-group-item class="d-flex justify-content-between align-items-center">
                  Total Gastos Fijos Semanales:
                  <b-badge
                    variant="info"
                    pill
                  >$
                    {{
                      costosOperativos.total_gastos_semanales.toFixed(2)
                    }}</b-badge>
                </b-list-group-item>
                <b-list-group-item class="d-flex justify-content-between align-items-center">
                  Costo Operativo por Producto (en este período):
                  <b-badge
                    variant="success"
                    pill
                  >$
                    {{
                      costosOperativos.costo_operativo_por_producto.toFixed(2)
                    }}</b-badge>
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
import ReporteCostosProduccionManoObra from "./ReporteCostosProduccionManoObra.vue";
import ReporteCostosProduccionMaterial from "./ReporteCostosProduccionMaterial.vue";
import ReporteCostosProduccionSalarios from "./ReporteCostosProduccionSalarios.vue";
import ReporteCostosProduccionTintas from "./ReporteCostosProduccionTintas.vue";
import ReporteCostosProduccionInsumosEficiencia from "./ReporteCostosProduccionInsumos.vue";

import mixintime from "~/mixins/mixin-time.js";

export default {
  mixins: [mixintime],
  components: {
    ReporteCostosProduccionProductos,
    ReporteCostosProduccionInsumos,
    ReporteCostosProduccionManoObra,
    ReporteCostosProduccionMaterial,
    ReporteCostosProduccionSalarios,
    ReporteCostosProduccionTintas,
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
      fields: [
        { key: "id_orden", label: "Orden", sortable: true },
        { key: "vendedor", label: "Vendedor", sortable: true },
        { key: "total_productos", label: "Productos", sortable: true },
        { key: "costos_de_insumos", label: "Costo Insumos", sortable: true },
        { key: "costo_mano_de_obra", label: "Costo M.O.", sortable: true },
        {
          key: "salario_invertido",
          label: "Salario Invertido",
          sortable: true,
        },
        { key: "total_tinta_costo", label: "Costo Tintas", sortable: true },
        { key: "eficiencia_insumos", label: "Eficiencia Insumos (%)", sortable: true },
        { key: "reposiciones", label: "Reposiciones", sortable: true },
        {
          key: "tiempo_de_produccion",
          label: "T. Producción",
          sortable: true,
        },
        { key: "pago_total", label: "Venta", sortable: true },
        { key: "ganancia", label: "Ganancia", sortable: true },
        { key: "costo_total", label: "Costo Total", sortable: true },
      ],
    };
  },
  computed: {
    reportTotals() {
      const dataToProcess = this.filteredReportData;
      if (dataToProcess.length === 0) {
        return {
          total_productos: 0,
          costos_de_insumos: 0,
          costo_mano_de_obra: 0,
          salario_invertido: 0,
          total_tinta_costo: 0,
          material_consumido: 0,
          eficiencia_insumos: 0,
          eficiencia_count: 0,
          reposiciones: 0,
          tiempo_de_produccion: 0,
          pago_total: 0,
          ganancia: 0,
          costo_total: 0,
        };
      }

      const totals = {
        total_productos: 0,
        costos_de_insumos: 0,
        costo_mano_de_obra: 0,
        salario_invertido: 0,
        total_tinta_costo: 0,
        material_consumido: 0,
        eficiencia_insumos: 0,
        eficiencia_count: 0,
        reposiciones: 0,
        tiempo_de_produccion: 0,
        pago_total: 0,
        ganancia: 0,
        costo_total: 0,
      };

      dataToProcess.forEach((item) => {
        totals.total_productos += item.total_productos;
        totals.costos_de_insumos += Number(item.costos_de_insumos || 0);
        totals.costo_mano_de_obra += Number(item.costo_mano_de_obra || 0);
        totals.salario_invertido += Number(item.salario_invertido || 0);
        totals.total_tinta_costo += Number(item.total_tinta_costo || 0);
        totals.material_consumido += Number(item.material_consumido || 0);
        // Para eficiencia_insumos, acumulamos para calcular promedio después
        if (Number(item.eficiencia_insumos || 0) > 0) {
          totals.eficiencia_insumos += Number(item.eficiencia_insumos || 0);
          totals.eficiencia_count = (totals.eficiencia_count || 0) + 1;
        }
        totals.reposiciones += Number(item.reposiciones || 0);
        totals.tiempo_de_produccion += Number(item.tiempo_de_produccion || 0);

        // Calcular los valores EXACTOS que se muestran en las filas (antes del toFixed)
        const pagoTotalFila = Number(item.pago_total || 0);
        const costoTotalFila = Number(item.costo_total || 0) + Number(item.salario_invertido || 0) + Number(item.total_tinta_costo || 0);
        const gananciaFila = pagoTotalFila - costoTotalFila;

        // Acumular los valores redondeados individualmente (como se muestran en la tabla)
        totals.pago_total += this.roundToTwoDecimals(pagoTotalFila);
        totals.costo_total += this.roundToTwoDecimals(costoTotalFila);
        // La ganancia se calcula después, no se acumula por fila
      });

      // Los totales ya están redondeados individualmente, ahora calcular la ganancia total
      // como la suma de las ganancias individuales redondeadas
      let gananciaTotal = 0;
      dataToProcess.forEach((item) => {
        const pagoTotalFila = Number(item.pago_total || 0);
        const costoTotalFila = Number(item.costo_total || 0) + Number(item.salario_invertido || 0) + Number(item.total_tinta_costo || 0);
        const gananciaFila = pagoTotalFila - costoTotalFila;
        gananciaTotal += this.roundToTwoDecimals(gananciaFila);
      });
      totals.ganancia = gananciaTotal;

      // Redondear los otros totales que no se acumularon por fila
      totals.costos_de_insumos = this.roundToTwoDecimals(totals.costos_de_insumos);
      totals.costo_mano_de_obra = this.roundToTwoDecimals(totals.costo_mano_de_obra);
      totals.salario_invertido = this.roundToTwoDecimals(totals.salario_invertido);
      totals.total_tinta_costo = this.roundToTwoDecimals(totals.total_tinta_costo);

      // Calcular promedio de eficiencia_insumos
      if (totals.eficiencia_count > 0) {
        totals.eficiencia_insumos = this.roundToTwoDecimals(totals.eficiencia_insumos / totals.eficiencia_count);
      } else {
        totals.eficiencia_insumos = 0;
      }

      return totals;
    },
  },
  methods: {
    // Función helper para redondear a 2 decimales de manera consistente
    roundToTwoDecimals(value) {
      return Math.round((Number(value) || 0) * 100) / 100;
    },

    // calcularTiempoEmpleados(id_empleado, id_orden, fecha_incio, fecha_fin) {
    calcularTiempoEmpleados(empleados_asignados) {
      // const emp = this.salariosEmpleados.find((e) => e.id_empleado === id_empleado);
      return empleados_asignados;
    },

    getInsumosDetalles() {
      return this.insumosDetalles || [];
    },

    onFiltered(filteredItems) {
      this.filteredReportData = filteredItems;
      // Re-combinar datos después del filtrado con los items filtrados
      this.combineReportDataWithTintas(filteredItems);
      this.combineReportDataWithInsumos(filteredItems);
    },

    combineReportDataWithTintas(dataToProcess = null) {
      const data = dataToProcess || this.reportData;
      // Crear un mapa de tintas por id_orden para acceso rápido
      const tintasMap = {};
      this.tintasResumen.forEach(tinta => {
        tintasMap[tinta.id_orden] = tinta;
      });

      // Combinar los datos de reporte con los datos de tintas
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

      // Si no se pasaron datos específicos, actualizar filteredReportData
      if (!dataToProcess) {
        this.filteredReportData = [...this.reportData];
      }
    },

    combineReportDataWithInsumos(dataToProcess = null) {
      const data = dataToProcess || this.reportData;
      // Crear un mapa de insumos por id_orden para acceso rápido
      const insumosMap = {};
      this.insumosResumen.forEach(insumo => {
        insumosMap[insumo.id_orden] = insumo;
      });

      // Combinar los datos de reporte con los datos de insumos
      data.forEach(item => {
        const insumoData = insumosMap[item.id_orden];
        if (insumoData) {
          item.eficiencia_insumos = insumoData.eficiencia || 0;
        } else {
          item.eficiencia_insumos = 0;
        }
      });

      // Si no se pasaron datos específicos, actualizar filteredReportData
      if (!dataToProcess) {
        this.filteredReportData = [...this.reportData];
      }
    },
    setDefaultDates() {
      const today = new Date();
      // getDay() devuelve 0 para Domingo, 1 para Lunes, etc.
      const dayOfWeek = today.getDay();
      // Ajuste para que la semana comience en Lunes (1)
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));

      // Formato YYYY-MM-DD
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
        this.reportData = data.reporte_data;
        this.filteredReportData = data.reporte_data;
        this.costosOperativos = data.costos_operativos;
        this.tintasResumen = data.tintas_resumen || [];
        this.insumosResumen = data.insumos_resumen || [];
        this.insumosDetalles = data.insumos_detalles || [];

        this.horaEmpleadosPrecios = data.costo_hora_empleado;
        this.horaEmpleadosTiempos = data.tareas_data;
        this.salariosEmpleados = data.salarios_data;

        // Calcular salario invertido para cada orden
        this.reportData.forEach(item => {
          item.salario_invertido = this.calcularCostoSalariosOrden(
            item.id_orden,
            item.empleados_asignados,
            this.horaEmpleadosPrecios,
            this.$store.state.login.dataEmpresa.horario_laboral,
            this.horaEmpleadosTiempos
          );
        });

        // Combinar datos de tintas con los datos del reporte
        this.combineReportDataWithTintas();

        // Combinar datos de insumos con los datos del reporte
        this.combineReportDataWithInsumos();
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