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

    <b-container style="padding: 0px" class="mb-4" fluid>
      <b-row>
        <b-col>
          <!-- Los menús ahora se cargan desde el AppSidebar en el layout -->
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

      <!-- Alerta de Entorno -->
      <b-alert
        v-if="environmentInfo.show"
        :variant="environmentInfo.variant"
        show
        class="text-center font-weight-bold mb-2 shadow-sm"
      >
        <b-icon :icon="environmentInfo.icon" class="mr-2"></b-icon>
        {{ environmentInfo.label }}
      </b-alert>

      <!-- Navbar superior con buscador y WhatsApp -->
      <b-navbar type="light" variant="light" class="shadow-sm mb-3">
        <b-navbar-nav class="ml-auto">
          <!-- Buscador de órdenes -->
          <b-nav-form v-if="currentComponent" class="mr-3">
            <buscar-BarraDeBusqueda />
          </b-nav-form>

          <!-- Búsqueda histórica -->
          <b-nav-item v-if="currentComponent" class="mr-2">
            <buscar-BusquedaHistoricoModal />
          </b-nav-item>

          <!-- Botón WhatsApp (solo si no es Administración) -->
          <b-nav-item v-if="$store.state.login.currentDepartament !== 'Administración'">
            <admin-WsSendMsgCustomInterno />
          </b-nav-item>

          <!-- Check Connection (solo para Administración) -->
          <b-nav-item v-if="$store.state.login.currentDepartament === 'Administración'">
            <checkConnection />
          </b-nav-item>
        </b-navbar-nav>
      </b-navbar>

      <!-- Alerta si no hay módulos asignados -->
      <b-row>
        <b-col>
          <div v-if="getDepartamentosEmpleadoSelect.length === 0">
            <b-alert variant="warning" show>
              <h4 class="text-center alert-heading">
                No se encontraron modulos asignados
              </h4>
            </b-alert>
          </div>
        </b-col>
      </b-row>
    </b-container>

    <!-- Modal para forzar el ingreso de tasas -->
    <b-modal id="modal-tasas-iniciales" title="Configuración Inicial de Tasas" centered no-close-on-backdrop
      no-close-on-esc hide-header-close>
      <b-alert show variant="info">
        <h4 class="alert-heading">¡Atención!</h4>
        <p>
          Para continuar, es necesario que establezca las tasas de cambio para
          el día de hoy. El sistema se desbloqueará automáticamente una vez que
          todas las tasas requeridas sean mayores a cero.
        </p>
      </b-alert>
      <form-monedas />
      <template #modal-footer>
        <b-button variant="primary" :disabled="!tasasEstanConfiguradas" @click="aceptarTasas">
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
import BusquedaHistoricoModal from "~/components/buscar/BusquedaHistoricoModal.vue";

export default {
  mixins: [mixin],
  components: { FormMonedas, BusquedaHistoricoModal },
  computed: {
    tasasEstanConfiguradas() {
      const depto = this.$store.state.login.dataUser.departamento;
      if (depto !== "Administración") {
        return true; // Solo Administración valida y carga tasas automáticamente si faltan.
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
    environmentInfo() {
      if (process.server) return { show: false };
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return {
          show: true,
          variant: "warning",
          icon: "exclamation-triangle-fill",
          label: "⚠️ ENTORNO LOCAL - DESARROLLO",
        };
      } else if (host.includes("nineteengreen.com")) {
        return {
          show: true,
          variant: "info",
          icon: "tools",
          label: "🔧 ENTORNO DE PRUEBAS - NINETEENGREEN.COM",
        };
      }
      return { show: false };
    },
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

  async mounted() {
    // El token JWT se obtiene automáticamente cuando es necesario
    // gracias al interceptor de axios configurado específicamente para WhatsApp

    // Auto-cargar el menú del primer departamento (por orden de proceso)
    // Los departamentos ya vienen ordenados por orden_proceso en getDepartamentosEmpleadoSelect
    if (
      this.getDepartamentosEmpleadoSelect.length >= 1 &&
      !this.currentComponent
    ) {
      const depto = this.getDepartamentosEmpleadoSelect[0]; // Primer depto por orden_proceso
      this.showComponent(
        depto.modulo,           // component
        depto.text,             // departamento (nombre)
        depto.value,            // id_departamento
        depto.orden_proceso,    // orden_proceso
        depto.orden_proceso_min // orden_proceso_min
      );
    }

    // 🔄 CARGA AUTOMÁTICA DE TASAS - COMENTADO PARA USAR SOLO TASA MANUAL
    // NOTA: Las tasas ahora se cargan ÚNICAMENTE desde la base de datos (tipos_de_monedas)
    // en el mutation setDataEmpresa del store (login.js líneas 75-91).
    // Esto evita que la tasa BCV de la API sobrescriba la tasa manual configurada.
    // La tasa BCV se sigue mostrando en formMonedas.vue como referencia, 
    // pero los cálculos usarán la tasa manual.

    /* CÓDIGO ORIGINAL COMENTADO:
    const isAdmin = this.$store.state.login.dataUser.departamento === 'Administración';

    if (isAdmin || !this.tasasEstanConfiguradas) {
      try {
        // Intentar cargar automáticamente las tasas
        const resultado = await this.$store.dispatch('login/cargarTasasAutomaticas');

        if (resultado.success) {
          // Tasas cargadas correctamente, no mostrar el modal
          console.log('✅ Tasas cargadas automáticamente:', resultado.fallback ? 'desde caché' : 'desde APIs');
        } else {
          // Falló la carga automática, mostrar modal para ingreso manual
          console.warn('⚠️ No se pudieron cargar las tasas automáticamente. Mostrando modal.');
          this.$bvModal.show("modal-tasas-iniciales");
        }
      } catch (error) {
        // Error inesperado, mostrar modal para ingreso manual
        console.error('❌ Error al cargar tasas automáticamente:', error);
        this.$bvModal.show("modal-tasas-iniciales");
      }
    }
    */
  },
};
</script>

<style scoped>
.user-info {
  padding-top: 8px;
}
</style>
