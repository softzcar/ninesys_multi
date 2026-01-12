<template>
  <div class="dashboard-comercializacion">
    <b-container fluid>
      <!-- Encabezado -->
      <b-row class="mb-4">
        <b-col>
          <h2 class="dashboard-title">
            <b-icon icon="graph-up" class="mr-2" />
            Dashboard de Ventas
          </h2>
          <p class="dashboard-subtitle">
            Bienvenido, {{ dataUser.nombre }}. Aquí tienes un resumen de tu actividad.
          </p>
        </b-col>
      </b-row>

      <!-- Tarjetas de Acciones Rápidas -->
      <b-row class="mt-2">
        <b-col>
          <h5 class="section-title mb-3">Acciones Rápidas</h5>
        </b-col>
      </b-row>
      <b-row class="mb-4">
        <b-col md="3" sm="6" class="mb-3">
          <b-card class="action-card" @click="$router.push('/comercializacion/ordenes')">
            <b-icon icon="plus-circle-fill" class="action-icon text-primary" />
            <h6>Nueva Orden</h6>
            <small class="text-muted">Crear una nueva orden</small>
          </b-card>
        </b-col>
        <b-col md="3" sm="6" class="mb-3">
          <b-card class="action-card" @click="$router.push('/comercializacion/ordenes/activas')">
            <b-icon icon="list-check" class="action-icon text-success" />
            <h6>Órdenes En Curso</h6>
            <small class="text-muted">{{ estadoOrdenes.valores[1] }} activas</small>
          </b-card>
        </b-col>
        <b-col md="3" sm="6" class="mb-3">
          <b-card class="action-card" @click="$router.push('/relacion-de-pagos')">
            <b-icon icon="cash-stack" class="action-icon text-info" />
            <h6>Relación de Pagos</h6>
            <small class="text-muted">Ver pagos recibidos</small>
          </b-card>
        </b-col>
        <b-col md="3" sm="6" class="mb-3">
          <b-card class="action-card" @click="$router.push('/clientes/gestion')">
            <b-icon icon="people-fill" class="action-icon text-warning" />
            <h6>Gestión de Clientes</h6>
            <small class="text-muted">Administrar clientes</small>
          </b-card>
        </b-col>
      </b-row>

      <!-- Gráficos -->
      <b-row>
        <!-- Gráfico Radial - Resumen de Órdenes -->
        <b-col lg="4" md="6" class="mb-4">
          <charts-RadialProgress
            title="Resumen Semanal"
            :values="resumenOrdenes.porcentajes"
            :labels="resumenOrdenes.labels"
            :colors="resumenOrdenes.colors"
            :absoluteValues="resumenOrdenes.valores"
            :height="300"
          />
        </b-col>

        <!-- Gráfico Donut - Estado de Órdenes -->
        <b-col lg="4" md="6" class="mb-4">
          <charts-DonutChart
            title="Estado de Órdenes"
            :values="estadoOrdenes.valores"
            :labels="estadoOrdenes.labels"
            :colors="estadoOrdenes.colors"
            :height="300"
          />
        </b-col>

        <!-- Gráfico de Barras - Pagos de la Semana -->
        <b-col lg="4" md="12" class="mb-4">
          <charts-BarChart
            title="Pagos Recibidos (Semana)"
            :seriesData="pagosSemana.valores"
            :categories="pagosSemana.dias"
            seriesName="Monto"
            color="#00E396"
            valuePrefix="$"
            :height="300"
          />
        </b-col>
      </b-row>

      <!-- Fila nueva: Progreso de Órdenes y Cuentas por Cobrar -->
      <b-row>
        <b-col lg="8" md="12" class="mb-4">
          <charts-OrderProgressChart
            :orders="ordenesProgreso"
          />
        </b-col>
        <b-col lg="4" md="12" class="mb-4">
             <charts-ReceivableChart
                :sold="finanzas.total_vendido"
                :collected="finanzas.total_cobrado"
             />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DashboardComercializacion',
  data() {
    return {
      // ==========================================
      // DATOS DE PRUEBA (Reemplazar por API)
      // ==========================================
      
      // Resumen de órdenes del vendedor
      resumenOrdenes: {
        labels: ['Creadas', 'Terminadas', 'Entregadas'],
        valores: [0, 0, 0],  // Valores absolutos
        porcentajes: [0, 0, 0],  // Porcentajes basados en creadas
        colors: ['#008FFB', '#00E396', '#FEB019']
      },
      
      // Estado actual de órdenes
      estadoOrdenes: {
        labels: ['En espera', 'Activas', 'Pausadas', 'Terminadas'],
        valores: [0, 0, 0, 0],
        colors: ['#FEB019', '#00E396', '#FF4560', '#008FFB']
      },
      
      // Pagos recibidos por día
      pagosSemana: {
        dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        valores: [0, 0, 0, 0, 0, 0, 0]
      },
      
      // Progreso de Ordenes
      ordenesProgreso: [],

      // Finanzas (Cuentas por cobrar)
      finanzas: {
          total_vendido: 0,
          total_cobrado: 0
      }
    }
  },
  computed: {
    ...mapState('login', ['dataUser', 'currentDepartamentId'])
  },
  mounted() {
    this.cargarDatosDashboard()
  },
  methods: {
    async cargarDatosDashboard() {
      try {
        const idEmpleado = this.dataUser.id_empleado || this.dataUser._id
        const idDepartamento = this.currentDepartamentId
        const response = await this.$axios.get(`${this.$config.API}/comercializacion/dashboard/${idEmpleado}/${idDepartamento}`)
        
        if (response.data) {
           const data = response.data
           
           // 1. Resumen de Órdenes
           if (data.resumen_ordenes) {
             const r = data.resumen_ordenes
             const total = r.creadas
             
             this.resumenOrdenes.valores = [r.creadas, r.terminadas, r.entregadas]
             this.resumenOrdenes.porcentajes = [
               100,
               total > 0 ? Math.round((r.terminadas / total) * 100) : 0,
               total > 0 ? Math.round((r.entregadas / total) * 100) : 0
             ]
           }
           
           // 2. Estado de Órdenes
           if (data.estado_ordenes) {
             const e = data.estado_ordenes
             this.estadoOrdenes.valores = [e.en_espera, e.activa, e.pausada, e.terminada]
           }
           
           // 3. Pagos de la Semana
           if (data.pagos_semana) {
             this.pagosSemana.valores = data.pagos_semana
           }

           // 4. Progreso de Ordenes
           if (data.ordenes_progreso) {
             this.ordenesProgreso = data.ordenes_progreso
           }

           // 5. Finanzas
           if (data.finanzas) {
               this.finanzas = data.finanzas
           }
        }
      } catch (error) {
        console.error('Error cargando dashboard:', error)
      }
    }
  }
}
</script>

<style scoped>
.dashboard-comercializacion {
  padding: 20px 0;
}

.dashboard-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 4px;
}

.dashboard-subtitle {
  color: #666;
  font-size: 14px;
  margin-bottom: 0;
}

.section-title {
  color: #333;
  font-weight: 600;
}

.action-card {
  cursor: pointer;
  text-align: center;
  padding: 20px;
  transition: all 0.2s ease;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #007bff;
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.action-card h6 {
  margin-bottom: 4px;
  font-weight: 600;
  color: #333;
}

.action-card small {
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-comercializacion {
    padding: 10px 0;
  }
  
  .dashboard-title {
    font-size: 1.3rem;
  }
}
</style>
