<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="
                    dataUser.departamento === 'Administración' ||
                    dataUser.departamento === 'Comercialización'
                ">
        <b-overlay :show="loading" spinner-small>
          <b-container fluid class="py-3">
            
            <!-- Encabezado y Navegación -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 class="h3 mb-1 text-dark">Informes y Dashboard de Ventas</h1>
                <p class="text-muted small mb-0">Analiza el rendimiento de tu equipo de comercialización y la efectividad del embudo.</p>
              </div>
              <div>
                <b-button to="/crm" variant="outline-primary" size="sm" class="mr-2">
                  <b-icon icon="kanban" class="mr-1"></b-icon> Tablero Kanban
                </b-button>
                <b-button to="/crm/campanas" variant="outline-secondary" size="sm">
                  <b-icon icon="telegram" class="mr-1"></b-icon> Campañas
                </b-button>
              </div>
            </div>

            <!-- Métricas Clave (Tarjetas) -->
            <b-row class="mb-4" v-if="stats">
              <b-col md="4" class="mb-3">
                <b-card class="shadow-sm border-0 text-center py-2 bg-light">
                  <h6 class="text-uppercase text-muted small mb-1">Tasa de Conversión General</h6>
                  <h2 class="font-weight-bold text-success mb-0">{{ stats.conversion.tasa_conversion }}%</h2>
                  <div class="small text-muted mt-1">
                    {{ stats.conversion.ganados }} Ganados | {{ stats.conversion.perdidos }} Perdidos
                  </div>
                </b-card>
              </b-col>
              <b-col md="4" class="mb-3">
                <b-card class="shadow-sm border-0 text-center py-2 bg-light">
                  <h6 class="text-uppercase text-muted small mb-1">Monto Total Cerrado (Ganado)</h6>
                  <h2 class="font-weight-bold text-primary mb-0">${{ totalMontoGanado.toFixed(2) }}</h2>
                  <div class="small text-muted mt-1">
                    Tratos cerrados de forma exitosa
                  </div>
                </b-card>
              </b-col>
              <b-col md="4" class="mb-3">
                <b-card class="shadow-sm border-0 text-center py-2 bg-light">
                  <h6 class="text-uppercase text-muted small mb-1">Campaña Más Efectiva</h6>
                  <h2 class="font-weight-bold text-info mb-0">{{ campanaMasEfectivaName }}</h2>
                  <div class="small text-muted mt-1" v-if="campanaMasEfectiva">
                    Efectividad: {{ campanaMasEfectiva.efectividad }}% ({{ campanaMasEfectiva.ganadas }} clientes ganados)
                  </div>
                </b-card>
              </b-col>
            </b-row>

            <!-- Gráficos -->
            <b-row class="mb-4" v-if="stats && !loading">
              
              <!-- Gráfico 1: Oportunidades por Estado (Funnel) -->
              <b-col lg="6" class="mb-4">
                <b-card header="Oportunidades por Estado (Embudo)" class="shadow-sm border-0 h-100">
                  <apexchart
                    type="bar"
                    height="320"
                    :options="funnelChartOptions"
                    :series="funnelChartSeries"
                  ></apexchart>
                </b-card>
              </b-col>

              <!-- Gráfico 2: Tasa de Conversión (Dona) -->
              <b-col lg="6" class="mb-4">
                <b-card header="Proporción Ganados vs Perdidos" class="shadow-sm border-0 h-100">
                  <div v-if="stats.conversion.ganados === 0 && stats.conversion.perdidos === 0" class="text-center py-5 text-muted">
                    No hay suficientes datos de cierres para graficar la proporción.
                  </div>
                  <apexchart
                    v-else
                    type="donut"
                    height="320"
                    :options="donutChartOptions"
                    :series="donutChartSeries"
                  ></apexchart>
                </b-card>
              </b-col>

              <!-- Gráfico 3: Ventas por Vendedor -->
              <b-col lg="6" class="mb-4">
                <b-card header="Monto Ganado por Vendedor ($)" class="shadow-sm border-0 h-100">
                  <div v-if="stats.ventas_por_vendedor.length === 0" class="text-center py-5 text-muted">
                    Aún no hay registros de ventas ganadas para mostrar rendimiento por vendedor.
                  </div>
                  <apexchart
                    v-else
                    type="bar"
                    height="320"
                    :options="sellersChartOptions"
                    :series="sellersChartSeries"
                  ></apexchart>
                </b-card>
              </b-col>

              <!-- Tabla 4: ROI y Efectividad de Campañas -->
              <b-col lg="6" class="mb-4">
                <b-card header="Efectividad e Impacto de Campañas de WhatsApp" class="shadow-sm border-0 h-100">
                  <div v-if="stats.campanas_efectividad.length === 0" class="text-center py-5 text-muted">
                    No hay campañas registradas para mostrar efectividad.
                  </div>
                  <div v-else>
                    <b-table
                      small
                      striped
                      hover
                      :items="stats.campanas_efectividad"
                      :fields="campanaFields"
                    >
                      <template #cell(fecha)="data">
                        {{ formatDate(data.item.fecha) }}
                      </template>
                      
                      <template #cell(efectividad)="data">
                        <div class="d-flex align-items-center">
                          <span class="font-weight-bold mr-2">{{ data.item.efectividad }}%</span>
                          <b-progress
                            :value="data.item.efectividad"
                            max="100"
                            height="6px"
                            variant="success"
                            class="flex-grow-1"
                          ></b-progress>
                        </div>
                      </template>
                    </b-table>
                  </div>
                </b-card>
              </b-col>
            </b-row>

          </b-container>
        </b-overlay>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

// Importar ApexCharts de forma compatible con SSR/Nuxt
let VueApexCharts;
if (process.client) {
  VueApexCharts = require("vue-apexcharts");
}

export default {
  components: {
    apexchart: process.client ? VueApexCharts : { render: h => h("div") },
  },
  data() {
    return {
      loading: true,
      stats: null,
      campanaFields: [
        { key: "nombre", label: "Campaña" },
        { key: "fecha", label: "Lanzamiento" },
        { key: "total_envios", label: "Clientes", class: "text-center" },
        { key: "ganadas", label: "Won ROI", class: "text-center" },
        { key: "efectividad", label: "Conversión %" },
      ],
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),

    totalMontoGanado() {
      if (!this.stats || !this.stats.oportunidades_por_estado) return 0;
      const ganado = this.stats.oportunidades_por_estado.find(el => el.estado === "cliente_ganado");
      return ganado ? parseFloat(ganado.total_monto || 0) : 0;
    },
    
    campanaMasEfectiva() {
      if (!this.stats || !this.stats.campanas_efectividad || this.stats.campanas_efectividad.length === 0) return null;
      // Clonar y ordenar por efectividad descendente
      const list = [...this.stats.campanas_efectividad];
      list.sort((a, b) => b.efectividad - a.efectividad);
      return list[0];
    },

    campanaMasEfectivaName() {
      return this.campanaMasEfectiva ? this.campanaMasEfectiva.nombre : "N/A";
    },

    // 1. Configuraciones de Gráfico de Barras: Oportunidades por Estado (Funnel)
    funnelChartSeries() {
      if (!this.stats) return [];
      const data = this.getOrderedStatesData();
      return [{
        name: "Monto Proyectado ($)",
        data: data.map(el => parseFloat(el.monto).toFixed(2))
      }];
    },
    funnelChartOptions() {
      if (!this.stats) return {};
      const data = this.getOrderedStatesData();
      return {
        chart: { type: "bar", toolbar: { show: false } },
        colors: ["#17a2b8"],
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
            distributed: true,
          }
        },
        dataLabels: { enabled: true },
        xaxis: {
          categories: data.map(el => el.label),
        },
        legend: { show: false }
      };
    },

    // 2. Configuraciones de Gráfico de Dona: Conversión Ganados vs Perdidos
    donutChartSeries() {
      if (!this.stats) return [];
      return [
        parseInt(this.stats.conversion.ganados),
        parseInt(this.stats.conversion.perdidos)
      ];
    },
    donutChartOptions() {
      return {
        chart: { type: "donut" },
        labels: ["Clientes Ganados", "Clientes Perdidos"],
        colors: ["#28a745", "#dc3545"],
        responsive: [{
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: "bottom" }
          }
        }],
        legend: { position: "bottom" }
      };
    },

    // 3. Configuraciones de Gráfico de Vendedores
    sellersChartSeries() {
      if (!this.stats) return [];
      return [{
        name: "Total Facturado ($)",
        data: this.stats.ventas_por_vendedor.map(v => parseFloat(v.total_ganado).toFixed(2))
      }];
    },
    sellersChartOptions() {
      if (!this.stats) return {};
      return {
        chart: { type: "bar", toolbar: { show: false } },
        colors: ["#007bff"],
        plotOptions: {
          bar: {
            columnWidth: "45%",
            distributed: false,
          }
        },
        xaxis: {
          categories: this.stats.ventas_por_vendedor.map(v => v.nombre),
        },
        dataLabels: { enabled: true }
      };
    }
  },
  methods: {
    fetchStats() {
      this.loading = true;
      axios.get(`${this.$config.API}/crm/reports/dashboard`)
        .then(res => {
          this.stats = res.data;
        })
        .catch(err => {
          console.error("Error cargando dashboard:", err);
        })
        .finally(() => { this.loading = false; });
    },
    getOrderedStatesData() {
      if (!this.stats) return [];
      
      const statesMap = {
        nuevo_lead: { label: "Nuevo Lead", monto: 0 },
        en_negociacion: { label: "En Negociación", monto: 0 },
        propuesta_enviada: { label: "Propuesta Enviada", monto: 0 },
        cliente_ganado: { label: "Cliente Ganado", monto: 0 },
        cliente_perdido: { label: "Cliente Perdido", monto: 0 },
      };

      this.stats.oportunidades_por_estado.forEach(el => {
        if (statesMap[el.estado]) {
          statesMap[el.estado].monto = el.total_monto;
        }
      });

      return Object.values(statesMap);
    },
    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      try {
        return new Date(dateStr).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
      } catch (e) {
        return dateStr;
      }
    }
  },
  mounted() {
    this.fetchStats();
  }
};
</script>

<style scoped>
.flex-grow-1 {
  flex-grow: 1 !important;
}
</style>
