<template>
  <div>
    <b-button @click="$bvModal.show(modal)" :variant="statusbutton"
      >{{ id }}
    </b-button>

    <b-modal :id="modal" :title="title" hide-footer size="xl" @show="onModalShow" @hidden="onModalHidden">
      <div>
        <!-- Inyección para Corte: Se muestra si el empleado activo pertenece a Corte (ID 3) -->
        <b-overlay :show="overlay" spinner-small>
          <div v-if="showResultado && isEmpleadoScope" class="mb-4">
            <h5 class="text-primary border-bottom pb-2"><b-icon icon="list-check" class="mr-2"></b-icon>Asignación de Piezas</h5>
            <MiAsignacionVista :idorden="id" :idempleado="computedIdEmpleado" :embedded="true" />
          </div>
        </b-overlay>

        <b-overlay :show="overlay" spinner-small>
          <buscar-resultado v-if="showResultado" :id="id" />
        </b-overlay>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Resultado from "~/components/buscar/resultado.vue";
import MiAsignacionVista from "~/components/empleados/MiAsignacionVista.vue";

export default {
  components: { 
    "buscar-resultado": Resultado,
    MiAsignacionVista
  },

  data() {
    return {
      overlay: false,
      showResultado: false,
    };
  },

  methods: {
    onModalShow() {
      this.showResultado = true;
    },
    onModalHidden() {
      this.showResultado = false;
    },
  },

  computed: {
    isEmpleadoScope() {
      // Si recibimos un ID forzado (ej: desde panel de admin), queremos ver la vista
      if (this.empleadoIdOpcional) {
        return true;
      }
      // O si somos un empleado estándar logueado
      if(this.$store.state.login && this.$store.state.login.currentComponent) {
        return this.$store.state.login.currentComponent === 'menus/menuEmpleado';
      }
      return false;
    },

    computedIdEmpleado() {
      // Priorizar el prop pasado que el del store.
      if (this.empleadoIdOpcional) {
        return this.empleadoIdOpcional;
      }
      if (this.$store.state.login && this.$store.state.login.dataUser) {
        return this.$store.state.login.dataUser.id_empleado;
      }
      return null;
    },

    title() {
      return `Orden ${this.id}`;
    },

    statusbutton() {
      if (this.progreso === "en curso") {
        return "outline-success";
      }
      return "outline-primary";
    },

    idModal() {
      return `${this.id}`;
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `${this.id}-modal-${rand}`;
    },

    modaliD: function () {
      return `${this.id}`;
      // return `modal-${this.id}`;
    },
  },

  props: ["id", "progreso", "empleadoIdOpcional"],
};
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}
.table-header {
  width: 100%;
}
</style>
