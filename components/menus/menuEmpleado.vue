<template>
  <div>
    <b-row>
      <b-col>
        <b-navbar toggleable="lg" type="dark" variant="info">
          <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

          <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav>
              <router-link class="nav-link" to="/" custom v-slot="{ navigate }">
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  <b-icon-house-fill></b-icon-house-fill>
                </span>
              </router-link>

              <router-link
                class="nav-link"
                to="/empleados/dashboard"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Ordenes Asignadas
                </span>
              </router-link>

              <div v-if="$store.state.login.dataUser.departamento === 'Corte'">
                <router-link
                  class="nav-link"
                  to="/empleados/resumen"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Resumen
                  </span>
                </router-link>
              </div>

              <router-link
                class="nav-link"
                to="/empleados/pagos"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Relación de Trabajos
                </span>
              </router-link>

              <!-- <router-link
                class="nav-link"
                to="/empleados/ws"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Websocket
                </span>
              </router-link> -->

              <!-- <router-link
                class="nav-link"
                to="/empleados/eficiencia-insumos"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Test Eficiencia de Insumos
                </span>
              </router-link> -->

              <empleados-reporte-semanal-de-borradores />

              <!-- <router-link
                class="nav-link"
                to="/logout"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Salir
                </span>
              </router-link> -->
            </b-navbar-nav>

            <!-- Right aligned nav items -->
            <!-- <b-navbar-nav class="ml-auto">
              <b-nav-item to="/">
                <b-icon-house-fill></b-icon-house-fill>
              </b-nav-item>
            </b-navbar-nav> -->
          </b-collapse>
        </b-navbar>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import buscar from "~/components/buscar/BarraDeBusqueda.vue";
import EmpleadosReporteSemanalDeBorradores from "~/components/empleados/reporteSemanalDeBorradores.vue";

export default {
  computed: {
    ...mapState("login", ["dataUser"]),
  },
  components: {
    EmpleadosReporteSemanalDeBorradores,
    buscar,
  },
  props: ["user", "departamento"],
};
</script>

<style scoped>
.user-info {
  font-size: 1.2rem;
}

.buscar {
  margin-top: 2rem;
}
</style>
