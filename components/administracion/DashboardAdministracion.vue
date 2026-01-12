<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-container fluid>
        <h2 class="mb-4">Dashboard de Administración</h2>
        
        <b-row class="mb-4">
          <!-- Gráfico 1: Resumen Semanal -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Resumen Semanal de Órdenes">
              <charts-WeeklyOrdersChart :data="stats.resumen_semanal" />
            </b-card>
          </b-col>

          <!-- Gráfico 2: Estado de Órdenes -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Estado de Órdenes">
              <charts-OrdersStatusChart
                :finished="stats.estado_ordenes.terminadas"
                :actives="stats.estado_ordenes.activas"
                :pending="stats.estado_ordenes.en_espera"
                :paused="stats.estado_ordenes.pausadas"
              />
            </b-card>
          </b-col>

          <!-- Gráfico 3: Progreso de Órdenes Activas -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Progreso de Órdenes Activas">
              <charts-ActiveOrdersProgressChart :data="stats.progreso_activas" />
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
              <charts-TrafficLightChart
                :por-iniciar="stats.tiempos_entrega.por_iniciar"
                :retrasado="stats.tiempos_entrega.retrasado"
                :en-el-dia="stats.tiempos_entrega.en_el_dia"
                :a-tiempo="stats.tiempos_entrega.a_tiempo"
                :pausadas="stats.tiempos_entrega.pausadas"
              />
            </b-card>
          </b-col>

          <!-- Gráfico 7: Órdenes por Departamento -->
          <b-col lg="3" md="6" sm="12" class="mb-4">
            <b-card title="Órdenes por Departamento">
              <charts-DepartmentBarChart
                :data="stats.ordenes_por_departamento"
                :height="350"
              />
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>
  </div>
</template>

<script>
// Variables estáticas compartidas entre todas las instancias
let statsAlreadyLoaded = false;
let sharedStats = {
  resumen_semanal: [],
  estado_ordenes: {
    en_espera: 0,
    pausadas: 0,
    activas: 0,
    terminadas: 0
  },
  progreso_activas: [],
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
};

export default {
  name: 'DashboardAdministracion',
  
  data() {
    return {
      overlay: false,
      isLoading: false, // Flag para evitar llamadas duplicadas
      // Usar referencia a stats compartidos
      stats: sharedStats
    };
  },

  created() {
    // Solo ejecutar en el cliente y solo si no se han cargado ya los datos
    if (process.client && !statsAlreadyLoaded && !this.isLoading) {
      console.log('[DashboardAdministracion] Primera carga - obteniendo datos');
      this.fetchStats();
    } else {
      console.log('[DashboardAdministracion] Skip - statsAlreadyLoaded:', statsAlreadyLoaded, 'isLoading:', this.isLoading);
    }
  },

  beforeDestroy() {
    // Resetear la bandera después de un delay
    // Si el componente se vuelve a crear inmediatamente (doble montaje),
    // el timeout se cancelará y la bandera no se reseteará
    console.log('[DashboardAdministracion] beforeDestroy - programando reset en 100ms');
    setTimeout(() => {
      console.log('[DashboardAdministracion] Reseteando statsAlreadyLoaded (timeout completado)');
      statsAlreadyLoaded = false;
    }, 100);
  },

  methods: {
    async fetchStats() {
      // Evitar llamadas duplicadas
      if (this.isLoading || statsAlreadyLoaded) {
        console.log('[DashboardAdministracion] fetchStats() bloqueado');
        return;
      }

      console.log('[DashboardAdministracion] fetchStats() iniciando...');
      this.isLoading = true;
      statsAlreadyLoaded = true; // Marcar como cargado ANTES de la petición
      this.overlay = true;

      try {
        const response = await this.$axios.get(
          `${this.$config.API}/administracion/dashboard-stats`
        );

        console.log('[DashboardAdministracion] Respuesta de API:', response.data);
        
        // Actualizar stats compartidos para que TODAS las instancias vean los datos
        Object.assign(sharedStats, response.data);
        
        console.log('[DashboardAdministracion] Stats actualizados:', sharedStats);
        console.log('[DashboardAdministracion] Progreso activas:', sharedStats.progreso_activas);
      } catch (error) {
        console.error('[DashboardAdministracion] Error al obtener estadísticas:', error);
        statsAlreadyLoaded = false; // Permitir reintentar en caso de error
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
