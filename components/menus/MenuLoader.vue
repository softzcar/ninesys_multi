
<template>
  <div>
    <!-- <div class="p-6 text-center">
            <div class="flex justify-center space-x-4 mb-6">
                <button @click="showComponent('menus/menuAdmin')"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg">Open
                    Admin</button>
                <button @click="showComponent('menus/menuEmpleado')"
                    class="px-4 py-2 bg-green-500 text-white rounded-lg">Open Empleados</button>
            </div>

        </div> -->

    <b-container
      style="padding: 0px"
      class="mb-4"
      fluid
    >
      <b-row>
        <b-col>
          <component
            :is="asyncComponent"
            v-if="currentComponent"
          />
        </b-col>

        <!-- <b-col v-if="dataUser.departamento === 'Comercialización'">
                    <menus-menuComercializacion />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Diseño'">
                    <menus-menuDisenador />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Producción'">
                    <menus-menuProduccion />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Empleado'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Corte'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Impresión'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Estampado'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Costura'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Limpieza'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Revisión'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Revisión'">
                    <menus-menu-revision />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Administración'">
                    <menus-menu-admin />
                </b-col> -->
      </b-row>

      <b-row>
        <b-col class="mt-3 mb-3 mr-4 pt-2">
          <b-row>
            <b-col>
              <div class="text-right nombre-empresa">
                <span class="tit-departament">{{ currentDepartament }}</span>
                {{ $store.state.login.dataEmpresa.nombre }}
              </div>
              <div v-if="
                  $store.state.login.currentDepartament === 'Administración'
                ">
                <div class="text-right">
                  <checkConnection style="float: right; margin-left: 12px" />
                </div>
              </div>

              <div v-else>
                <div class="text-right">
                  <admin-WsSendMsgCustomInterno style="float: right; margin-left: 12px" />
                </div>
              </div>

              <div class="user-info text-right">
                <b-icon icon="person" />
                {{ dataUser.nombre }} |
                {{ dataUser.departamento }}
                <!-- <div class="mt-3"> -->
                <div class="mt-3">
                  <b-button-group size="lg">
                    <b-button
                      @click="
                        showComponent(
                          departamento.modulo,
                          departamento.text,
                          departamento.value,
                          departamento.orden_proceso,
                          currentMinOrdenProcesoId //
                        )
                      "
                      v-for="(
                        departamento, index
                      ) in getDepartamentosEmpleadoSelect"
                      :key="index"
                      variant="info"
                    >{{ departamento.text }}</b-button>

                    <b-button
                      variant="info"
                      @click="goOut()"
                    >Salir</b-button>
                  </b-button-group>
                </div>
              </div>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div v-if="getDepartamentosEmpleadoSelect.length === 0">
            <b-alert
              variant="warning"
              show
            >
              <h4 class="text-center alert-heading">
                No se encontraron modulos asignados
              </h4>
            </b-alert>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col
          v-if="currentComponent"
          class="mr-4 text-right"
        >
          <buscar-BarraDeBusqueda />
        </b-col>
      </b-row>
    </b-container>

    <!-- Modal para forzar el ingreso de tasas -->
    <b-modal
      id="modal-tasas-iniciales"
      title="Configuración Inicial de Tasas"
      centered
      no-close-on-backdrop
      no-close-on-esc
      hide-header-close
    >
      <b-alert
        show
        variant="info"
      >
        <h4 class="alert-heading">¡Atención!</h4>
        <p>
          Para continuar, es necesario que establezca las tasas de cambio para
          el día de hoy. El sistema se desbloqueará automáticamente una vez que
          todas las tasas requeridas sean mayores a cero.
        </p>
      </b-alert>
      <form-monedas />
      <template #modal-footer>
        <b-button
          variant="primary"
          :disabled="!tasasEstanConfiguradas"
          @click="aceptarTasas"
        >
          Aceptar
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import mixin from "~/mixins/mixin-login.js";
import FormMonedas from "~/components/formMonedas.vue";

export default {
  mixins: [mixin],
  components: { FormMonedas },
  computed: {
    tasasEstanConfiguradas() {
      const depto = this.$store.state.login.dataUser.departamento;
      if (depto !== "Administración" && depto !== "Comercialización") {
        return true; // Si no es de estos deptos, no requiere la validación.
      }
      const tipos = this.$store.state.login.dataEmpresa.tipos_de_monedas || [];
      // Excluimos el dólar que siempre es 1
      const activeMonedas = tipos.filter(
        (m) => m.activo && m.moneda !== "dolar"
      );
      if (activeMonedas.length === 0) return true; // No hay otras monedas que configurar.

      // Verificamos que todas las monedas activas tengan una tasa > 0
      return activeMonedas.every((moneda) => this.tasas[moneda.moneda] > 0);
    },
    asyncComponent() {
      if (!this.currentComponent) return null;
      return () => import(`@/components/${this.currentComponent}.vue`);
    },
    ...mapState("login", [
      "access",
      "dataUser",
      "empleado",
      "tasas",
      "currentDepartament",
      "currentComponent",
      "currentMinOrdenProcesoId",
    ]),
    ...mapGetters("login", ["getDepartamentosEmpleadoSelect"]),
  },

  methods: {
    aceptarTasas() {
      this.$bvModal.hide("modal-tasas-iniciales");
    },
    goOut() {
      this.$confirm(`¿Desea Salir del sistema?`, "Salir", "question")
        .then(() => {
          this.$router.push(`/logout`);
        })
        .catch(() => {
          return false;
        });
    },

    // El token JWT se obtiene automáticamente cuando es necesario
    // gracias al interceptor de axios configurado específicamente para WhatsApp

    showComponent(
      component,
      departamento,
      id_departamento,
      orden_proceso,
      orden_proceso_min
    ) {
      let verifyOrdenProceso = null;
      if (orden_proceso === null) {
        verifyOrdenProceso = orden_proceso_min;
      } else {
        verifyOrdenProceso = orden_proceso;
      }

      // El token JWT se obtiene automáticamente cuando es necesario
      // gracias al interceptor de axios configurado específicamente para WhatsApp

      if (
        this.currentComponent != null &&
        this.currentDepartament != departamento
      ) {
        this.$confirm(
          `¿Desea cargar el módulo ${departamento}?`,
          "Cargar Módulo",
          "question"
        ).then(() => {
          this.$store.commit("login/scurrentDepartamentId", id_departamento);
          this.$store.commit(
            "login/setCurrentOrdenProceso",
            verifyOrdenProceso
          );
          this.$store.commit(
            "login/setCurrentMinOrdenProcesoId",
            orden_proceso_min
          );
          this.$store.commit("login/scurrentDepartament", departamento);
          this.$store.commit("login/setCurrentComponent", component);
          this.$router.push("/");
        });
      } else {
        this.$store.commit("login/scurrentDepartamentId", id_departamento);
        this.$store.commit("login/setCurrentOrdenProceso", verifyOrdenProceso);
        this.$store.commit(
          "login/setCurrentMinOrdenProcesoId",
          orden_proceso_min
        );
        this.$store.commit("login/scurrentDepartament", departamento);
        this.$store.commit("login/setCurrentComponent", component);
      }
    },
  },

  mounted() {
    // El token JWT se obtiene automáticamente cuando es necesario
    // gracias al interceptor de axios configurado específicamente para WhatsApp

    // VAlidar unicamente si es el modulo de empleados
    /* if (
      this.getDepartamentosEmpleadoSelect.length === 1
    ) {
      this.showComponent(
        this.getDepartamentosEmpleadoSelect[0].modulo,
        this.getDepartamentosEmpleadoSelect[0].text,
        this.getDepartamentosEmpleadoSelect[0].value,
        this.getDepartamentosEmpleadoSelect[0].value,
        this.getDepartamentosEmpleadoSelect[0].orden_proceso,
        this.getDepartamentosEmpleadoSelect[0].orden_proceso_min
      );
    } */

    if (!this.tasasEstanConfiguradas) {
      this.$bvModal.show("modal-tasas-iniciales");
    }
  },
};
</script>

<style scoped>
.user-info {
  padding-top: 8px;
}
</style>
