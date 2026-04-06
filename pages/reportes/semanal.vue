<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="accessModule.accessData.id_modulo === 5 || accessModule.accessData.id_modulo === 1 || dataUser.departamento === 'Administración'">
        <b-overlay :show="loading" rounded="sm" opacity="0.6" spinner-variant="primary">
          <b-container fluid>
            <b-row class="mt-4 align-items-center mb-4">
              <b-col md="12">
                <h1 class="mb-0">Reporte General de Eficiencia</h1>
                <p class="text-muted mb-0">Periodo: {{ formatRange(fechaInicio, fechaFin) }}</p>
              </b-col>
            </b-row>

            <!-- SECCIÓN DE GRÁFICOS (SUPERIOR) -->
            <b-row class="mb-4">
              <b-col lg="12">
                <b-card class="shadow-sm border-0">
                  <b-row v-if="items.length > 0">
                    <!-- Ranking de Productos (Izquierda) -->
                    <b-col lg="5" class="border-right">
                      <h6 class="font-weight-bold text-muted mb-4 d-flex align-items-center">
                        <b-icon icon="trophy" class="mr-2 text-warning"></b-icon> Top 10 Productos más Solicitados
                      </h6>
                      <div v-if="topProducts && topProducts.length > 0">
                        <charts-DonutChart 
                          :values="topProductsSeries" 
                          :labels="topProductsCategories" 
                          :colors="topProductsColors"
                          :height="300" 
                          :showLegend="true"
                          title="Top 10 Productos"
                          valueSuffix="unidades"
                        />
                      </div>
                      <div v-else class="text-center py-5 text-muted small">
                        Sin datos de productos en este rango.
                      </div>
                    </b-col>

                    <!-- Volumen de Productos (Centro) -->
                    <b-col lg="4" class="border-right">
                      <h6 class="font-weight-bold text-muted mb-4 d-flex align-items-center">
                        <b-icon icon="layers" class="mr-2 text-primary"></b-icon> Productos por Día
                      </h6>
                      <charts-WeeklyOrdersChart 
                        :data="chartOrdersData" 
                        :height="300" 
                        seriesName="Productos"
                        yDataTitle="Cantidad de Productos"
                        valueSuffix="unidades"
                      />
                    </b-col>
                    
                    <!-- Eficiencias (Derecha) -->
                    <b-col lg="3">
                      <b-row>
                        <b-col cols="12" class="text-center mb-4">
                          <h6 class="font-weight-bold text-muted mb-2 small text-uppercase">Eficiencia Tiempo</h6>
                          <charts-DonutChart 
                            :values="chartTimeEfficiencyData.values" 
                            :labels="chartTimeEfficiencyData.labels"
                            :colors="chartTimeEfficiencyData.colors"
                            title=""
                            :height="130"
                            :showLegend="false"
                            :centerValue="avgTimeEfficiency + '%'"
                          />
                        </b-col>
                        <b-col cols="12" class="text-center">
                          <h6 class="font-weight-bold text-muted mb-2 small text-uppercase">Eficiencia Material</h6>
                          <charts-DonutChart 
                            :values="chartMaterialEfficiencyData.values" 
                            :labels="chartMaterialEfficiencyData.labels"
                            :colors="chartMaterialEfficiencyData.colors"
                            title=""
                            :height="130"
                            :showLegend="false"
                            :centerValue="avgMaterialEfficiency + '%'"
                          />
                        </b-col>
                      </b-row>
                    </b-col>
                  </b-row>
                  <div v-else class="text-center py-5 text-muted">
                    <b-icon icon="bar-chart" font-scale="3" class="mb-3 opacity-50"></b-icon>
                    <h5>Seleccione un rango de fechas para visualizar los indicadores de rendimiento.</h5>
                  </div>
                </b-card>
              </b-col>
            </b-row>

            <!-- NUEVO: GRAFICO DE EFICIENCIA DE EMPLEADOS (CENTRO) -->
            <b-row class="mb-4">
              <b-col lg="12">
                <b-card class="shadow-sm border-0">
                  <h5 class="font-weight-bold mb-3 d-flex align-items-center">
                    <b-icon icon="person-bounding-box" class="mr-2 text-info"></b-icon> Eficiencia del Período por Empleado
                  </h5>
                  <div v-if="employeeEfficiencyData.length > 0">
                    <charts-EmployeeEfficiencyChart :dataMap="employeeEfficiencyData" :height="350" />
                  </div>
                  <div v-else class="text-center py-5 text-muted small">
                    <b-spinner v-if="loadingEfficiency" small class="mr-2"></b-spinner>
                    <span v-if="loadingEfficiency">Cargando eficiencia...</span>
                    <span v-else>No hay datos de eficiencia de empleados para este periodo.</span>
                  </div>
                </b-card>
              </b-col>
            </b-row>
            
            <!-- RESUMEN DE PRODUCTOS FABRICADOS (BANNER CENTRAL) -->
            <b-row class="mb-4 justify-content-center" v-if="items.length > 0">
              <b-col md="6" lg="4" class="text-center">
                <div 
                  class="p-3 bg-white shadow-sm rounded border-left border-primary cursor-pointer hover-card" 
                  style="border-left-width: 5px !important; transition: all 0.3s;"
                  v-b-modal.modal-resumen-productos
                  title="Click para ver el resumen detallado"
                >
                  <h2 class="h4 mb-0 text-primary font-weight-bold">{{ Number(totalManufactured).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}</h2>
                  <p class="text-muted small mb-0">Total Productos Fabricados <b-icon icon="search" class="ml-1"></b-icon></p>
                </div>
              </b-col>
            </b-row>

            <!-- SELECTOR DE RANGO DE FECHAS DINÁMICO -->
            <b-row class="mb-5 justify-content-center">
              <b-col md="10" lg="8">
                <b-card class="shadow-sm border-0">
                  <b-row align-v="center">
                    <b-col md="5">
                      <label class="small font-weight-bold text-muted text-uppercase">Fecha Inicio</label>
                      <b-form-datepicker
                        v-model="fechaInicio"
                        @input="fetchData"
                        :max="today"
                        locale="es-VE"
                        size="sm"
                        placeholder="Inicio"
                        class="border-light"
                      ></b-form-datepicker>
                    </b-col>
                    <b-col md="2" class="text-center pt-3">
                      <b-icon icon="arrow-right" variant="primary" font-scale="1.5"></b-icon>
                    </b-col>
                    <b-col md="5">
                      <label class="small font-weight-bold text-muted text-uppercase">Fecha Fin</label>
                      <b-form-datepicker
                        v-model="fechaFin"
                        @input="fetchData"
                        :max="today"
                        locale="es-VE"
                        size="sm"
                        placeholder="Fin"
                        class="border-light"
                      ></b-form-datepicker>
                    </b-col>
                  </b-row>
                  
                  <b-alert
                    v-if="dateError"
                    show
                    variant="danger"
                    class="mt-3 mb-0 small py-2 px-3 border-0 shadow-sm"
                  >
                    <b-icon icon="exclamation-triangle-fill" class="mr-2"></b-icon>
                    {{ dateError }}
                  </b-alert>
                </b-card>
              </b-col>
            </b-row>

            <b-card class="shadow-sm border-0 mb-5">
              <b-card-body>
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h5 class="font-weight-bold mb-0">Órdenes Finalizadas y Entregadas</h5>
                  <b-button variant="outline-primary" size="sm" @click="fetchData" :disabled="loading">
                    <b-icon icon="arrow-clockwise" :animation="loading ? 'spin' : ''"></b-icon> Actualizar Datos
                  </b-button>
                </div>

                <b-table
                  hover
                  responsive
                  :items="items"
                  :fields="fields"
                  :busy="loading"
                  class="reports-table"
                  show-empty
                >
                  <template #empty>
                    <div class="text-center my-5 py-5 border rounded bg-light">
                      <b-icon icon="inbox" font-scale="3" class="text-muted mb-3"></b-icon>
                      <h5 class="text-muted">No se encontraron órdenes para esta semana.</h5>
                    </div>
                  </template>

                  <template #table-busy>
                    <div class="text-center text-primary my-5">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong class="ml-2">Cargando reporte de eficiencia consolidado...</strong>
                    </div>
                  </template>

                  <template #cell(_id)="data">
                    <div class="d-flex align-items-center">
                      <link-search :id="data.item._id" :progreso="data.item.status" />
                    </div>
                  </template>

                  <template #cell(entrega)="data">
                    <div class="small">
                      {{ formatTimestampDate(data.item.moment) }}
                    </div>
                  </template>

                  <template #cell(eficiencia_tiempo)="data">
                    <div class="text-center">
                      <b-badge :variant="getBadgeVariant(data.item.eficiencia_tiempo)" class="eff-badge">
                        {{ data.item.eficiencia_tiempo }}{{ data.item.eficiencia_tiempo !== 'N/A' ? '%' : '' }}
                      </b-badge>
                    </div>
                  </template>

                  <template #cell(eficiencia_material)="data">
                    <div class="text-center">
                       <b-badge :variant="getBadgeVariant(data.item.eficiencia_material)" class="eff-badge">
                        {{ data.item.eficiencia_material }}{{ data.item.eficiencia_material !== 'N/A' ? '%' : '' }}
                      </b-badge>
                    </div>
                  </template>

                  <template #cell(status)="data">
                    <div class="d-flex justify-content-center">
                      <progreso-tiempo-semaforo :ordenesProyectadas2="items" :id_orden="data.item._id" />
                    </div>
                  </template>
                </b-table>
              </b-card-body>
            </b-card>

            <!-- MODAL RESUMEN DE PRODUCTOS -->
            <b-modal id="modal-resumen-productos" title="Resumen de Productos Fabricados" hide-footer size="lg" body-class="p-0" centered scrollable>
              <div class="p-4 bg-light border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 class="mb-0 font-weight-bold text-dark">Nineteen Custom</h4>
                    <p class="mb-0 text-muted small text-uppercase letter-spacing-1">Resumen de Productos Fabricados</p>
                  </div>
                  <div class="text-right">
                    <div class="small text-muted mb-1">
                      <strong>Emisión:</strong> {{ new Date().toLocaleDateString('es-VE') }}
                    </div>
                    <div class="small text-muted">
                      <strong>Período:</strong> {{ formatRange(fechaInicio, fechaFin) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="p-4">
                <div class="table-responsive border rounded shadow-sm bg-white">
                  <b-table 
                    :items="allProducts" 
                    :fields="allProductsFields" 
                    hover 
                    striped 
                    responsive 
                    class="mb-0 table-resumen border-0"
                    head-variant="light"
                    fixed
                    no-border-collapse
                    :sort-by="'value'"
                    :sort-desc="true"
                  >
                    <!-- Personalización de la columna Producto -->
                    <template #cell(name)="data">
                      <div class="pl-2 font-weight-medium text-dark py-1">
                        {{ data.value }}
                      </div>
                    </template>

                    <!-- Personalización de la columna Cantidad -->
                    <template #cell(value)="data">
                      <div class="pr-2 py-1">
                        <span class="badge badge-light px-3 py-2 border font-weight-bold text-primary shadow-sm" style="font-size: 0.9rem; min-width: 65px;">
                          {{ (parseFloat(data.value) || 0).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}
                        </span>
                      </div>
                    </template>

                    <!-- Mensaje si no hay datos -->
                    <template #empty>
                      <div class="text-center py-5 text-muted small italic">
                        <b-icon icon="info-circle" class="mr-2"></b-icon>
                        No hay productos detallados para este periodo.
                      </div>
                    </template>

                    <!-- Pie de tabla (Total General) integrado -->
                    <template #custom-foot>
                      <b-tr class="bg-primary text-white font-weight-bold" style="font-size: 1.1rem;">
                        <b-td class="pl-4 py-3 text-uppercase border-top-0">Total General</b-td>
                        <b-td class="text-right pr-4 py-3 border-top-0">
                          {{ Number(totalManufactured).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }} Uds.
                        </b-td>
                      </b-tr>
                    </template>
                  </b-table>
                </div>
              </div>
              <div class="p-3 text-center border-top bg-light">
                  <b-button variant="secondary" size="sm" @click="$bvModal.hide('modal-resumen-productos')">Cerrar Detalle</b-button>
              </div>
            </b-modal>
          </b-container>
        </b-overlay>
      </div>
      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import mixin from "~/mixins/mixins.js";
import mixintime from "~/mixins/mixin-time.js";
import mixinLogin from "~/mixins/mixin-login.js";
import WeeklyOrdersChart from "~/components/charts/WeeklyOrdersChart.vue";
import DonutChart from "~/components/charts/DonutChart.vue";
import BarChart from "~/components/charts/BarChart.vue";
import EmployeeEfficiencyChart from "~/components/charts/EmployeeEfficiencyChart.vue";

export default {
  mixins: [mixin, mixinLogin, mixintime],
  components: {
    'charts-WeeklyOrdersChart': WeeklyOrdersChart,
    'charts-DonutChart': DonutChart,
    'charts-BarChart': BarChart,
    'charts-EmployeeEfficiencyChart': EmployeeEfficiencyChart
  },
  data() {
    return {
      fechaInicio: "",
      fechaFin: "",
      today: new Date().toISOString().substring(0, 10),
      dateError: null,
      loading: false,
      loadingEfficiency: false,
      items: [],
      topProducts: [],
      allProducts: [],
      employeeEfficiencyData: [],
      totalManufactured: 0,
      allProductsFields: [
        { key: "name", label: "Producto", sortable: true },
        { key: "value", label: "Cantidad (Uds.)", sortable: true, class: "text-right font-weight-bold" },
      ],
      fields: [
        { key: "_id", label: "Orden", sortable: true },
        { key: "cliente_nombre", label: "Cliente", sortable: true },
        { key: "total_unidades", label: "Und.", sortable: true, class: "text-center" },
        { key: "entrega", label: "Fecha", sortable: true },
        { key: "status", label: "Estatus", sortable: true, class: "text-center" },
        { key: "eficiencia_tiempo", label: "Eficiencia Tiempo", class: "text-right" },
        { key: "eficiencia_material", label: "Eficiencia Material", class: "text-right" },
      ],
    };
  },
  computed: {
    ...mapState('login', ['access', 'dataUser']),
    avgTimeEfficiency() {
      const valid = this.items.filter(i => i.eficiencia_tiempo !== null && i.eficiencia_tiempo !== 'N/A' && !isNaN(i.eficiencia_tiempo));
      if (!valid.length) return 0;
      const sum = valid.reduce((acc, curr) => acc + parseFloat(curr.eficiencia_tiempo), 0);
      return (sum / valid.length).toFixed(1);
    },
    avgMaterialEfficiency() {
      const valid = this.items.filter(i => i.eficiencia_material !== null && i.eficiencia_material !== 'N/A' && !isNaN(i.eficiencia_material));
      if (!valid.length) return 0;
      const sum = valid.reduce((acc, curr) => acc + parseFloat(curr.eficiencia_material), 0);
      return (sum / valid.length).toFixed(1);
    },

    // --- DATOS PARA TOP 10 ---
    topProductsSeries() {
      return this.topProducts.map(p => parseFloat(p.value) || 0);
    },
    topProductsCategories() {
      return this.topProducts.map(p => p.name || 'Sin nombre');
    },
    topProductsColors() {
      return [
        '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', 
        '#3F51B5', '#03A9F4', '#4CAF50', '#F9CE1D', '#FF9800'
      ];
    },

    // --- DATOS PARA GRÁFICOS ---
    chartOrdersData() {
      const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const data = dias.map(d => ({ dia: d, total_ordenes: 0 }));
      
      this.items.forEach(item => {
        const d = new Date(item.moment);
        const dayIdx = (d.getDay() + 6) % 7; // Ajustar a Lunes=0
        if (data[dayIdx]) {
          data[dayIdx].total_ordenes += (parseFloat(item.total_unidades) || 0);
        }
      });
      return data;
    },

    chartTimeEfficiencyData() {
      let alta = 0, media = 0, baja = 0;
      this.items.forEach(item => {
        const val = parseFloat(item.eficiencia_tiempo);
        if (isNaN(val)) return;
        if (val >= 90) alta++;
        else if (val >= 70) media++;
        else baja++;
      });
      return {
        values: [alta, media, baja],
        labels: ['Alta (>=90%)', 'Media (70-89%)', 'Baja (<70%)'],
        colors: ['#28a745', '#007bff', '#dc3545']
      };
    },

    chartMaterialEfficiencyData() {
      let alta = 0, media = 0, baja = 0;
      this.items.forEach(item => {
        const val = parseFloat(item.eficiencia_material);
        if (isNaN(val)) return;
        if (val >= 90) alta++;
        else if (val >= 70) media++;
        else baja++;
      });
      return {
        values: [alta, media, baja],
        labels: ['Alta (>=90%)', 'Media (70-89%)', 'Baja (<70%)'],
        colors: ['#28a745', '#007bff', '#dc3545']
      };
    }
  },
  mounted() {
    this.initCurrentWeek();
    this.fetchData();
  },
  methods: {
    initCurrentWeek() {
      const d = new Date();
      const day = d.getDay(); // 0 (Dom) a 6 (Sab)
      const diff = day === 0 ? -6 : 1 - day; // Lunes
      
      const lunes = new Date(d);
      lunes.setDate(d.getDate() + diff);
      
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);

      this.fechaInicio = lunes.toISOString().substring(0, 10);
      this.fechaFin = domingo.toISOString().substring(0, 10);
    },

    async fetchData() {
      if (!this.fechaInicio || !this.fechaFin) return;

      // Validación de rango de fechas
      if (this.fechaInicio > this.fechaFin) {
        this.dateError = "La fecha de inicio no puede ser posterior a la fecha fin.";
        return;
      }

      this.dateError = null; // Limpiar error si todo está ok
      this.loading = true;
      this.items = [];
      this.totalManufactured = 0;

      try {
        const res = await this.$axios.get(`${this.$config.API}/reportes/semanal-detallado`, {
          params: {
            inicio: this.fechaInicio,
            fin: this.fechaFin
          }
        });

        if (res.data.items) {
          this.items = res.data.items;
          this.topProducts = res.data.topProducts || [];
          this.allProducts = res.data.allProducts || [];
          console.log("Resumen de productos cargado:", this.allProducts.length, "items");
          this.calculateManufacturedTotal();
        }
        
        // Cargar gráfica de eficiencia global en paralelo
        this.fetchEmployeeEfficiency();

      } catch (error) {
        console.error("Error fetching report data:", error);
        this.$bvToast.toast("Error al cargar los datos del reporte", {
          variant: "danger",
          solid: true
        });
      } finally {
        this.loading = false;
      }
    },

    calculateManufacturedTotal() {
      this.totalManufactured = this.items.reduce((acc, curr) => acc + (parseFloat(curr.total_unidades) || 0), 0);
    },

    async fetchEmployeeEfficiency() {
      if (!this.fechaInicio || !this.fechaFin) return;
      this.loadingEfficiency = true;
      try {
        const res = await this.$axios.get(`${this.$config.API}/reportes/employee-efficiency-global`, {
          params: { inicio: this.fechaInicio, fin: this.fechaFin }
        });

        if (res.data && res.data.tareas) {
          const tareas_crudo = res.data.tareas;
          const horarioLaboral = this.$store.state.login.dataEmpresa.horario_laboral;
          let agrupacion_empleados = {};

          tareas_crudo.forEach(row => {
            const nom = row.empleado_nombre;
            if (!agrupacion_empleados[nom]) {
              agrupacion_empleados[nom] = { proyectado: 0, real: 0 };
            }

            agrupacion_empleados[nom].proyectado += parseFloat(row.projected_seconds);

            let rawFin = row.fecha_terminado;
            // Si la tarea sigue en curso, usamos la fecha contemporánea (como lo hace el panel)
            if (!rawFin) {
              const dObj = new Date();
              rawFin = new Date(dObj.getTime() - (dObj.getTimezoneOffset() * 60000))
                .toISOString().replace('T', ' ').substring(0, 19);
            }

            // Normalización para navegadores estrictos
            let strIni = row.fecha_inicio.replace(' ', 'T');
            let strFin = rawFin.replace(' ', 'T');

            const tareaParseada = {
              fecha_inicio: new Date(strIni),
              fecha_fin: new Date(strFin)
            };

            const tiempoEfectivoMs = this.calcularTiempoTrabajoIndividual(tareaParseada, [], horarioLaboral);
            agrupacion_empleados[nom].real += (tiempoEfectivoMs / 1000); 
          });

          // Compilar el Array para el Chart
          let finalData = [];
          for (const [empleado, vals] of Object.entries(agrupacion_empleados)) {
            let eff = 100;
            if (vals.real > 0) {
              eff = (vals.proyectado / vals.real) * 100;
            } else if (vals.proyectado > 0 && vals.real === 0) {
               // Si tienen proyectado pero no gastaron tiempo (!?) raro en mixin
               eff = 100;
            }
            finalData.push({
               name: empleado,
               efficiency: parseFloat(eff).toFixed(1)
            });
          }

          // Ordenarlos alfabéticamente
          finalData.sort((a,b) => a.name.localeCompare(b.name));
          this.employeeEfficiencyData = finalData;
        }

      } catch (err) {
        console.error("Error cargando eficiencia empleados:", err);
      } finally {
        this.loadingEfficiency = false;
      }
    },

    getEfficiencyClass(value) {
      const val = parseFloat(value);
      if (isNaN(val)) return "";
      if (val >= 90) return "eff-high";
      if (val >= 70) return "eff-mid";
      return "eff-low";
    },

    getBadgeVariant(value) {
      const val = parseFloat(value);
      if (isNaN(val)) return "secondary";
      if (val >= 90) return "success";
      if (val >= 70) return "primary";
      if (val >= 50) return "warning";
      return "danger";
    },

    formatRange(start, end) {
      if (!start || !end) return "";
      const s = new Date(start + 'T00:00:00').toLocaleDateString("es-ES", { day: 'numeric', month: 'short' });
      const e = new Date(end + 'T00:00:00').toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' });
      return `${s} - ${e}`;
    },

    // Mantenemos este helper por si se quiere seguir mostrando el nro de semana informativa
    obtenerNumeroSemana(fechaStr) {
      if (!fechaStr) return "";
      const fecha = new Date(fechaStr + 'T00:00:00');
      if (isNaN(fecha.getTime())) return "";
      const inicioAño = new Date(fecha.getFullYear(), 0, 1);
      const diferenciaTiempo = fecha - inicioAño;
      const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));
      return Math.ceil((diferenciaDias + inicioAño.getDay() + 1) / 7);
    }
  }
};
</script>

<style scoped>
.efficiency-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 5px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 auto;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.eff-high { border-color: #28a745; color: #28a745; background-color: rgba(40, 167, 69, 0.05); }
.eff-mid { border-color: #ffc107; color: #ffc107; background-color: rgba(255, 193, 7, 0.05); }
.eff-low { border-color: #dc3545; color: #dc3545; background-color: rgba(220, 53, 69, 0.05); }

.reports-table >>> th {
  background-color: #f8f9fa;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.03rem;
  color: #555;
  border-top: none;
  font-weight: 700;
  padding: 12px 8px;
}

.reports-table >>> td {
  vertical-align: middle;
  padding: 10px 8px;
}

.eff-badge {
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 60px;
}

.italic { font-style: italic; }

.cursor-pointer { cursor: pointer; }
.hover-card:hover {
  transform: translateY(-5px);
  background-color: #fcfcfc !important;
  box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important;
}

.table-resumen th {
  background-color: #f8f9fa;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
  color: #666;
}
</style>
