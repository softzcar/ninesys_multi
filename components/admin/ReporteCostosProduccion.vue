<template>
  <div>
    <b-overlay :show="overlay" spinner-variant="primary">
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
            <b-button variant="primary" @click="getReport" class="w-100">
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
              <template #cell(material_consumido)="data">
                <reporte-costos-produccion-material
                  :id_orden="data.item.id_orden"
                  :valor="data.item.material_consumido"
                />
              </template>
              <template #cell(eficiencia)="data">
                {{ data.item.eficiencia.toFixed(2) }} %
              </template>
              <template #cell(tiempo_de_produccion)="data">
                {{ data.item.tiempo_de_produccion.toFixed(2) }} hrs
              </template>
              <template #cell(pago_total)="data">
                $ {{ data.item.pago_total.toFixed(2) }}
              </template>
              <template #cell(ganancia)="data">
                <strong
                  :class="
                    data.item.ganancia > 0 ? 'text-success' : 'text-danger'
                  "
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
                <!-- Celda vacía para la columna del vendedor -->
              </template>
              <template #foot(total_productos)>
                <strong>{{ reportTotals.total_productos }}</strong>
              </template>
              <template #foot(costos_de_insumos)>
                <strong
                  >$ {{ reportTotals.costos_de_insumos.toFixed(2) }}</strong
                >
              </template>
              <template #foot(costo_mano_de_obra)>
                <strong
                  >$ {{ reportTotals.costo_mano_de_obra.toFixed(2) }}</strong
                >
              </template>
              <template #foot(material_consumido)>
                <strong
                  >{{ reportTotals.material_consumido.toFixed(2) }} m</strong
                >
              </template>
              <template #foot(eficiencia)>
                <strong>{{ reportTotals.eficiencia.toFixed(2) }} %</strong>
              </template>
              <template #foot(reposiciones)>
                <strong>{{ reportTotals.reposiciones }}</strong>
              </template>
              <template #foot(tiempo_de_produccion)>
                <strong
                  >{{
                    reportTotals.tiempo_de_produccion.toFixed(2)
                  }}
                  hrs</strong
                >
              </template>
              <template #foot(pago_total)>
                <strong>$ {{ reportTotals.pago_total.toFixed(2) }}</strong>
              </template>
              <template #foot(ganancia)>
                <strong
                  :class="
                    reportTotals.ganancia > 0 ? 'text-success' : 'text-danger'
                  "
                >
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
        <b-row class="mt-4" v-if="costosOperativos.total_gastos_semanales">
          <b-col>
            <h4>Costos Operativos Semanales</h4>
            <b-card no-body class="mt-3">
              <b-list-group flush>
                <b-list-group-item
                  class="d-flex justify-content-between align-items-center"
                >
                  Total Gastos Fijos Semanales:
                  <b-badge variant="info" pill
                    >$
                    {{
                      costosOperativos.total_gastos_semanales.toFixed(2)
                    }}</b-badge
                  >
                </b-list-group-item>
                <b-list-group-item
                  class="d-flex justify-content-between align-items-center"
                >
                  Costo Operativo por Producto (en este período):
                  <b-badge variant="success" pill
                    >$
                    {{
                      costosOperativos.costo_operativo_por_producto.toFixed(2)
                    }}</b-badge
                  >
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

export default {
  components: {
    ReporteCostosProduccionProductos,
    ReporteCostosProduccionInsumos,
    ReporteCostosProduccionManoObra,
    ReporteCostosProduccionMaterial,
  },
  data() {
    return {
      overlay: true,
      reportData: [],
      filteredReportData: [],
      costosOperativos: {},
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
          key: "material_consumido",
          label: "Material Consumido",
          sortable: true,
        },
        { key: "eficiencia", label: "Eficiencia", sortable: true },
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
          material_consumido: 0,
          eficiencia: 0,
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
        material_consumido: 0,
        eficiencia: 0,
        reposiciones: 0,
        tiempo_de_produccion: 0,
        pago_total: 0,
        ganancia: 0,
        costo_total: 0,
      };

      dataToProcess.forEach((item) => {
        totals.total_productos += item.total_productos;
        totals.costos_de_insumos += item.costos_de_insumos;
        totals.costo_mano_de_obra += item.costo_mano_de_obra;
        totals.material_consumido += item.material_consumido;
        totals.eficiencia += item.eficiencia;
        totals.reposiciones += item.reposiciones;
        totals.tiempo_de_produccion += item.tiempo_de_produccion;
        totals.pago_total += parseFloat(item.pago_total);
        totals.ganancia += item.ganancia;
        totals.costo_total += item.costo_total;
      });

      // La eficiencia total es el promedio del período
      if (dataToProcess.length > 0) {
        totals.eficiencia = totals.eficiencia / dataToProcess.length;
      } else {
        totals.eficiencia = 0;
      }

      return totals;
    },
  },
  methods: {
    onFiltered(filteredItems) {
      this.filteredReportData = filteredItems;
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