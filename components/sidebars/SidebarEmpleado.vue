<template>
  <div>
    <!-- Órdenes Asignadas -->
    <li class="nav-item">
      <router-link class="nav-link" to="/empleados/dashboard">
        <b-icon icon="list-task" />
        <span>Órdenes Asignadas</span>
      </router-link>
    </li>

    <!-- Resumen (solo para Corte) -->
    <li class="nav-item" v-if="isCorte">
      <router-link class="nav-link" to="/empleados/resumen">
        <b-icon icon="clipboard-data" />
        <span>Resumen</span>
      </router-link>
    </li>

    <!-- Relación de Trabajos -->
    <li class="nav-item">
      <router-link class="nav-link" to="/empleados/pagos">
        <b-icon icon="receipt" />
        <span>Relación de Trabajos</span>
      </router-link>
    </li>

    <!-- Reporte de Borradores -->
    <li class="nav-item">
      <empleados-reporte-semanal-de-borradores />
    </li>
  </div>
</template>

<script>
import { mapState } from "vuex";
import EmpleadosReporteSemanalDeBorradores from "~/components/empleados/reporteSemanalDeBorradores.vue";

export default {
  name: "SidebarEmpleado",
  components: {
    EmpleadosReporteSemanalDeBorradores,
  },
  computed: {
    ...mapState("login", ["dataUser"]),
    isCorte() {
      return this.dataUser?.departamento === "Corte";
    },
  },
};
</script>
