<template>
  <div>
    <b-row v-if="accessModule.accessData.id_modulo === 5" class="mb-4">
      <b-col cols="12">
        <h2 class="mb-4">Dashboard de Producción</h2>
      </b-col>
    </b-row>

    <b-overlay :show="overlay" spinner-small>
      <b-container v-if="accessModule.accessData.id_modulo === 5" fluid>
        <!-- Estadísticas y Gráficos -->
        <b-row class="mb-4">
          <!-- Gráfico 1: Estatus de Órdenes -->
          <b-col md="4" sm="12" class="mb-4">
            <b-card title="Estatus de Órdenes">
              <charts-OrdersStatusChart
                :finished="0"
                :actives="stats.estatus_ordenes.activas"
                :pending="stats.estatus_ordenes.en_espera"
                :paused="stats.estatus_ordenes.pausadas"
              />
            </b-card>
          </b-col>

          <!-- Gráfico 2: Tiempos de Entrega (Semáforo) -->
          <b-col md="4" sm="12" class="mb-4">
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

          <!-- Gráfico 3: Órdenes por Departamento -->
          <b-col md="4" sm="12" class="mb-4">
            <b-card title="Órdenes por Departamento">
              <charts-DepartmentBarChart
                :data="stats.ordenes_por_departamento"
                :height="350"
              />
            </b-card>
          </b-col>
        </b-row>
      </b-container>

      <div v-else>
        <accessDenied />
      </div>
    </b-overlay>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixin-login.js";

export default {
  name: "DashboardProduccion",
  mixins: [mixin],

  data() {
    return {
      overlay: true,
      stats: {
        estatus_ordenes: {
          en_espera: 0,
          pausadas: 0,
          activas: 0
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
    ...mapState("login", ["dataUser", "access"]),
  },

  mounted() {
    this.fetchStats();
  },

  methods: {
    async fetchStats() {
      try {
        this.overlay = true;
        
        const response = await this.$axios.get(
          `${this.$config.API}/produccion/dashboard-stats`
        );

        if (response.data) {
          this.stats = {
            estatus_ordenes: response.data.estatus_ordenes || this.stats.estatus_ordenes,
            tiempos_entrega: response.data.tiempos_entrega || this.stats.tiempos_entrega,
            ordenes_por_departamento: response.data.ordenes_por_departamento || []
          };
        }

        this.overlay = false;
      } catch (error) {
        console.error('Error fetching production stats:', error);
        this.$bvToast.toast('Error al cargar estadísticas de producción', {
          title: 'Error',
          variant: 'danger',
          solid: true
        });
        this.overlay = false;
      }
    }
  }
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
