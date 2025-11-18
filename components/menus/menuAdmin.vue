<template>
  <div>
    <b-row>
      <b-col class="pr-0">
        <b-navbar
          toggleable="lg"
          type="dark"
          variant="primary"
        >
          <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

          <b-collapse
            id="nav-collapse"
            is-nav
          >
            <b-navbar-nav>
              <b-nav-item to="/"> </b-nav-item>
              <router-link
                class="nav-link"
                to="/"
                custom
                v-slot="{ navigate }"
              >
                <span
                  @click="navigate"
                  @keypress.enter="navigate"
                  role="link"
                >
                  <b-icon-house-fill></b-icon-house-fill>
                </span>
              </router-link>

              <b-nav-item-dropdown
                text="Ordenes y Lotes"
                right
              >
                <router-link
                  class="nav-link"
                  to="/comercializacion/ordenes"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Nueva Orden
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/relacion-de-pagos"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Relacion de pagos
                  </span>
                </router-link>

                <!-- <router-link
                  class="nav-link"
                  to="/comercializacion/presupuesto"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Nuevo Presupuesto
                  </span>
                </router-link> -->
                <router-link
                  class="nav-link"
                  to="/comercializacion/ordenes/activas"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Ordenes En Curso
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/produccion/ordenes-todas"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Todas las ordenes
                  </span>
                </router-link>

                <!-- <router-link class="nav-link" to="/produccion/ordenes-con-deuda" custom v-slot="{ navigate }">
                                <span @click="navigate" @keypress.enter="navigate" role="link">
                                    Ordenes con deuda
                                </span>
                                </router-link> 
                                -->

                <!-- <router-link
                  class="nav-link"
                  to="/comercializacion/ordenes/semana"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Ordenes de la semana
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/produccion/lotes"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Lotes
                  </span>
                </router-link> -->
              </b-nav-item-dropdown>

              <!-- <router-link
                class="nav-link"
                to="/ordenes-fechas-entrega"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Ordenes fechas de entrega
                </span>
              </router-link> -->

              <b-nav-item-dropdown
                text="Caja"
                right
              >
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

                <router-link
                  class="nav-link"
                  to="/comercializacion/reportes/pagos-abonos"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Reporte de Pagos y Abonos
                  </span>
                </router-link>
              </b-nav-item-dropdown>

              <b-nav-item-dropdown
                text="Diseños"
                right
              >
                <router-link
                  class="nav-link"
                  to="/diseno/asignacion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Asignación
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/diseno/terminados"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Terminados
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/diseno/aprobacion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Aprobación
                  </span>
                </router-link>
              </b-nav-item-dropdown>

              <router-link
                class="nav-link"
                to="/test"
                custom
                v-slot="{ navigate }"
              >
                <span
                  @click="navigate"
                  @keypress.enter="navigate"
                  role="link"
                >
                  Control de Producción
                </span>
              </router-link>

              <!-- <router-link class="nav-link" to="/produccion/asistencias" custom v-slot="{ navigate }">
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Asistencias
                </span>
              </router-link> -->

              <!-- <router-link
                class="nav-link"
                to="/produccion/cortar"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Cortar
                </span>
              </router-link> -->

              <!-- <router-link class="nav-link" to="/produccion/control" custom v-slot="{ navigate }">
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Control de Producción
                </span>
              </router-link> -->

              <b-nav-item-dropdown
                text="Inventario"
                right
              >
                <router-link
                  class="nav-link"
                  to="/inventario/gestion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Inventario
                  </span>
                </router-link>
                <router-link
                  class="nav-link"
                  to="/impresoras/gestion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Gestión de Impresoras
                  </span>
                </router-link>
                <router-link
                  class="nav-link"
                  to="/inventario/recarga-tintas"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Recarga de Tintas
                  </span>
                </router-link>
                <router-link
                  class="nav-link"
                  to="/inventario/nueva-tinta"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Nueva Tinta
                  </span>
                </router-link>
                <router-link
                  class="nav-link"
                  to="/catalogo-insumos-productos"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Catálogo de Insumos de Productos
                  </span>
                </router-link>
              </b-nav-item-dropdown>

              <!-- <b-nav-item-dropdown
                text="Inventario"
                right
              >

                <hr />
                <b-dropdown-item to="/inventario/reportes/general">
                  Reporte general de invetario
                </b-dropdown-item>

                <router-link class="nav-link" to="/inventario/reportes/semana" custom
                                    v-slot="{ navigate }">
                                    <span @click="navigate" @keypress.enter="navigate" role="link">
                                        Reporte por semana
                                    </span>
                                </router-link> -->

              <!-- <router-link class="nav-link" to="/inventario/reportes/empleado" custom v-slot="{ navigate }">
                  <span @click="navigate" @keypress.enter="navigate" role="link">
                    Reporte por empleado
                  </span>
                </router-link>
              </b-nav-item-dropdown>

               -->
              <b-nav-item-dropdown
                text="Empleados"
                right
              >
                <router-link
                  class="nav-link"
                  to="/empleados/gestion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Gestión de empleados
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/departamentos/gestion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Gestión de Departamentos
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/empleados/activacion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Activación de Empleados
                  </span>
                </router-link>

                <!-- <router-link
                  class="nav-link"
                  to="/asistencias"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Asistencias
                  </span>
                </router-link> 
               <router-link
                  class="nav-link"
                  to="/asistencias/reporte-semanal"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Asistencias reporte semanal
                  </span>
                </router-link> 

               <router-link
                  class="nav-link"
                  to="/asistencias/reporte"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Asistencias reporte por fechas
                  </span>
                </router-link>  -->
              </b-nav-item-dropdown>

              <b-nav-item-dropdown
                text="Clientes"
                right
              >
                <router-link
                  class="nav-link"
                  to="/clientes/gestion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Gestión de clientes
                  </span>
                </router-link>
              </b-nav-item-dropdown>

              <b-nav-item-dropdown
                text="Productos"
                right
              >
                <router-link
                  class="nav-link"
                  to="/productos/gestion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Gestión de Productos
                  </span>
                </router-link>

                <!-- <router-link
                  class="nav-link"
                  to="/insumos"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Insumos
                  </span>
                </router-link> -->

                <router-link
                  class="nav-link"
                  to="/insumos-productos"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Insumos de Productos
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/comisiones-productos"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Comisiones de Productos
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/atributos-productos"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Atributos de Productos
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/categorias/gestion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Categorías
                  </span>
                </router-link>
              </b-nav-item-dropdown>

              <b-nav-item-dropdown
                text="Pagos"
                right
              >
                <router-link
                  class="nav-link"
                  to="/empleados/planilla-de-pagos"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Planilla De Pagos
                  </span>
                </router-link>
                <router-link
                  class="nav-link"
                  to="/empleados/historico-de-pagos"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Histórico De Pagos
                  </span>
                </router-link>
              </b-nav-item-dropdown>

              <b-nav-item-dropdown
                text="Reportes"
                right
              >
                <router-link
                  class="nav-link"
                  to="/inventario/rendimiento"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Rendimiento
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/reporte-eficiencia-empleados"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Reporte de Eficiencia de Empleados
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/inventario/reportes/orden"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Insumos consumidos por orden
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/inventario/reportes/insumo"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Insumos
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/inventario/reportes/producto"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Productos
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/reporte-impresoras"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Reporte de Impresoras
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/impresoras/tintas-actual"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Reporte de Tintas Actuales
                  </span>
                </router-link>
              </b-nav-item-dropdown>

              <b-nav-item-dropdown
                text="Varios"
                right
              >

                <router-link
                  class="nav-link"
                  to="/empresa/configuracion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Configuración de Empresa
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/produccion/reporte-reposiciones"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Reporte reposiciones
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/tallas"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Tallas
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/telas"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Telas
                  </span>
                </router-link>

                <router-link
                  class="nav-link"
                  to="/reporte-costos-produccion"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Reporte de Costos
                  </span>
                </router-link>

                <b-dropdown-item to="/"> </b-dropdown-item>
                <!-- <router-link
                  class="nav-link"
                  to="/ayuda"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                  >
                    Ayuda
                  </span>
                </router-link> -->
              </b-nav-item-dropdown>

              <!-- <router-link class="nav-link" to="/logout" custom v-slot="{ navigate }">
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
    <!-- <b-row>
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
    </b-row> -->
  </div>
</template>

<script>
import { mapState } from "vuex";
import buscar from "~/components/buscar/BarraDeBusqueda.vue";

export default {
  computed: {
    ...mapState("login", ["dataUser"]),
  },
  components: {
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

.nav-link {
  color: black;
}
</style>
