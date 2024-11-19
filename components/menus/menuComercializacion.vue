<template>
  <div>
    <b-row>
      <b-col style="padding-right: 0 !important">
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
                to="/comercializacion/ordenes"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Nueva Orden
                </span>
              </router-link>

              <router-link
                class="nav-link"
                to="/comercializacion/presupuesto"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Nuevo Presupuesto
                </span>
              </router-link>

              <router-link
                class="nav-link"
                to="/comercializacion/ordenes/activas"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Ordenes En Curso
                </span>
              </router-link>

              <router-link
                class="nav-link"
                to="/produccion/ordenes-todas"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Todas las ordenes
                </span>
              </router-link>

              <router-link
                class="nav-link"
                to="/diseno/asignacion"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Asignación de Diseños
                </span>
              </router-link>

              <router-link
                class="nav-link"
                to="/relacion-de-pagos"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Relacion de pagos
                </span>
              </router-link>

              <b-nav-item-dropdown text="Caja" right>
                <router-link
                  class="nav-link"
                  to="/comercializacion/retiros"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Retiros
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/comercializacion/abonos"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Otros Abonos
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/comercializacion/cierre-de-caja"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Cierre de Caja
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/comercializacion/reporte-de-caja"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Reporte de Caja
                  </span>
                </router-link>
              </b-nav-item-dropdown>

              <router-link
                class="nav-link"
                to="/clientes/gestion"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Gestión de clientes
                </span>
              </router-link>

              <b-nav-item-dropdown text="Reportes" right>
                <router-link
                  class="nav-link"
                  to="/comercializacion/reportes/terminadas"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Ordenes Terminadas
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/comercializacion/reportes/entregadas"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Ordenes Entregadas
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/comercializacion/reportes/general"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Reporte General de Ordenes
                  </span>
                </router-link>
              </b-nav-item-dropdown>

              <router-link
                class="nav-link"
                to="/logout"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Salir
                </span>
              </router-link>
            </b-navbar-nav>

            <!-- Right aligned nav items -->
            <b-navbar-nav class="ml-auto">
              <!-- <b-nav-item to="/">
                <b-icon-house-fill></b-icon-house-fill>
              </b-nav-item> -->
            </b-navbar-nav>
          </b-collapse>
        </b-navbar>
      </b-col>
    </b-row>
    <b-row>
      <b-container fluid>
        <b-col class="text-right mt-4 pr-4 pt-2">
          <span class="floatme">
            <comercio-revisiones-activas />
          </span>
          <span class="floatme">
            <comercio-revisiones-espera />
          </span>
        </b-col>
      </b-container>
    </b-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import buscar from '~/components/buscar/BarraDeBusqueda.vue'

export default {
  computed: {
    ...mapState('login', ['dataUser']),
  },
  components: {
    buscar,
  },

  props: ['user', 'departamento'],
}
</script>

<style scoped>
.user-info {
  font-size: 1.2rem;
}

.buscar {
  margin-top: 2rem;
}
</style>
