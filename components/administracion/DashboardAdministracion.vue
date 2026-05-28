<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-container fluid>
        <h2 class="mb-4">Dashboard de Administración</h2>

        <b-row class="mb-4">
          <!-- New: Tasas del Día Component -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Tasas del día">
              <form-monedas />
            </b-card>
          </b-col>

          <!-- Gráfico 1: Resumen Semanal -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Resumen Semanal de Órdenes">
              <charts-WeeklyOrdersChart :data="stats.resumen_semanal" />
            </b-card>
          </b-col>

          <!-- Gráfico 2: Estado de Órdenes -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Estado de Órdenes">
              <charts-OrdersStatusChart :finished="stats.estado_ordenes.terminadas"
                :actives="stats.estado_ordenes.activas" :pending="stats.estado_ordenes.en_espera"
                :paused="stats.estado_ordenes.pausadas" />
            </b-card>
          </b-col>

          <!-- Gráfico 3: Top 10 Productos -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Top 10 Productos (Semana)">
              <div v-if="stats.topProducts === null" class="text-center py-5">
                <b-spinner small variant="primary" class="mb-2"></b-spinner>
                <div class="text-muted small">Cargando datos...</div>
              </div>
              <div v-else-if="stats.topProducts.length > 0">
                <charts-DonutChart
                  :values="topProductsSeries"
                  :labels="topProductsCategories"
                  :colors="topProductsColors"
                  :height="380"
                  :showLegend="true"
                  :showDataLabels="true"
                  :flat="true"
                  title=""
                  valueSuffix="unidades"
                />
              </div>
              <div v-else class="text-center py-5 text-muted small">
                Sin datos de productos en esta semana.
              </div>
            </b-card>
          </b-col>

          <!-- Gráfico 4: Ventas vs Saldo -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Ventas del Mes vs Saldo por Cobrar">
              <charts-SalesVsBalanceChart :data="stats.ventas_vs_saldo" />
            </b-card>
          </b-col>

          <!-- Gráfico 5: Estado de Diseños -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Estado de Diseños">
              <charts-DesignsStatusChart :data="stats.estado_disenos" />
            </b-card>
          </b-col>

          <!-- Gráfico 6: Tiempos de Entrega -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Tiempos de Entrega">
              <charts-TrafficLightChart :por-iniciar="stats.tiempos_entrega.por_iniciar"
                :retrasado="stats.tiempos_entrega.retrasado" :en-el-dia="stats.tiempos_entrega.en_el_dia"
                :a-tiempo="stats.tiempos_entrega.a_tiempo" :pausadas="stats.tiempos_entrega.pausadas" />
            </b-card>
          </b-col>

          <!-- Gráfico 7: Órdenes por Departamento -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Órdenes por Departamento">
              <charts-DepartmentBarChart :data="stats.ordenes_por_departamento" :height="350" />
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>
  </div>
</template>

<script>
export default {
  name: 'DashboardAdministracion',

  data() {
    return {
      overlay: false,
      isLoading: false, // Flag para evitar llamadas duplicadas en la misma instancia
      stats: {
        resumen_semanal: [],
        estado_ordenes: {
          en_espera: 0,
          pausadas: 0,
          activas: 0,
          terminadas: 0
        },
        progreso_activas: [],
        topProducts: null, // null indica que los datos están cargando
        ventas_vs_saldo: {
          ventas_mes: 0,
          cobrado_mes: 0,
          saldo_por_cobrar: 0
        },
        estado_disenos: {
          asignados: 0,
          propuestas_enviadas: 0,
          aprobados_pagados: 0
        },
        tiempos_entrega: {
          por_iniciar: 0,
          retrasado: 0,
          en_el_dia: 0,
          a_tiempo: 0,
          pausadas: 0
        },
        ordenes_por_departamento: []
      }
    };
  },

  computed: {
    topProductsSeries() {
      if(!this.stats.topProducts) return [];
      return this.stats.topProducts.map(p => parseFloat(p.value) || 0);
    },
    topProductsCategories() {
      if(!this.stats.topProducts) return [];
      return this.stats.topProducts.map(p => p.name || 'Sin nombre');
    },
    topProductsColors() {
      return [
        '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', 
        '#3F51B5', '#03A9F4', '#4CAF50', '#F9CE1D', '#FF9800'
      ];
    }
  },

  created() {
    if (process.client) {
      this.fetchStats();
    }
  },

  methods: {
    toLocalDateString(date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    },

    async fetchTopProducts() {
      try {
        const d = new Date();
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const lunes = new Date(d);
        lunes.setDate(d.getDate() + diff);
        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);

        const fechaInicio = this.toLocalDateString(lunes);
        const fechaFin = this.toLocalDateString(domingo);

        console.log('[DashboardAdministracion] consultando top products rango local:', fechaInicio, 'a', fechaFin);

        const res = await this.$axios.get(`${this.$config.API}/reportes/semanal-detallado`, {
          params: { inicio: fechaInicio, fin: fechaFin }
        });
        return res.data.topProducts || [];
      } catch (err) {
        console.error('[DashboardAdministracion] Error get top products:', err);
        return [];
      }
    },

    async fetchStats() {
      // Evitar llamadas duplicadas
      if (this.isLoading) {
        console.log('[DashboardAdministracion] fetchStats() bloqueado (ya cargando)');
        return;
      }

      console.log('[DashboardAdministracion] fetchStats() iniciando...');
      this.isLoading = true;
      this.overlay = true;

      try {
        const [dashboardRes, topProductsData] = await Promise.all([
          this.$axios.get(`${this.$config.API}/administracion/dashboard-stats`),
          this.fetchTopProducts()
        ]);

        const dashboardData = dashboardRes.data;
        dashboardData.topProducts = topProductsData;

        console.log('[DashboardAdministracion] Respuesta de API:', dashboardData);

        // Actualizar stats locales de la instancia
        this.stats = dashboardData;

        console.log('[DashboardAdministracion] Stats actualizados:', this.stats);
      } catch (error) {
        console.error('[DashboardAdministracion] Error al obtener estadísticas:', error);
        this.$fire({
          title: 'Error',
          html: 'No se pudieron cargar las estadísticas del dashboard',
          type: 'error'
        });
      } finally {
        this.overlay = false;
        this.isLoading = false;
      }
    }
  }
};
</script>
