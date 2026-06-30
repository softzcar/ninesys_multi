<template>
  <div>
    <b-button @click="$bvModal.show(modal)" :variant="statusbutton"
      >{{ id }}
    </b-button>

    <b-modal :id="modal" hide-footer size="xl" @show="onModalShow" @hidden="onModalHidden">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <span class="mr-2">Orden {{ id }}</span>
          <span v-if="orderStatus" :class="['status-badge', 'status-' + orderStatus.toLowerCase().replace(/\s+/g, '-')]">
            {{ orderStatus }}
          </span>
        </div>
      </template>
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
    orderStatus() {
      if (this.showResultado && this.$store.state.buscar.orden?.orden?.[0]?._id == this.id) {
        return this.$store.state.buscar.orden?.orden?.[0]?.status || '';
      }
      return '';
    },

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

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  vertical-align: middle;
  margin-left: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-badge::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.status-activa {
  background-color: rgba(40, 167, 69, 0.15);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}
.status-badge.status-activa::before {
  background-color: #28a745;
  box-shadow: 0 0 6px #28a745;
  animation: pulse-green 2s infinite;
}

.status-badge.status-en-espera,
.status-badge.status-espera {
  background-color: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}
.status-badge.status-en-espera::before,
.status-badge.status-espera::before {
  background-color: #ffc107;
  box-shadow: 0 0 6px #ffc107;
  animation: pulse-yellow 2s infinite;
}

.status-badge.status-pausada {
  background-color: rgba(108, 117, 125, 0.15);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}
.status-badge.status-pausada::before {
  background-color: #6c757d;
}

.status-badge.status-cancelada {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}
.status-badge.status-cancelada::before {
  background-color: #dc3545;
}

.status-badge.status-terminada {
  background-color: rgba(23, 162, 184, 0.15);
  color: #17a2b8;
  border: 1px solid rgba(23, 162, 184, 0.3);
}
.status-badge.status-terminada::before {
  background-color: #17a2b8;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(40, 167, 69, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}

@keyframes pulse-yellow {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(255, 193, 7, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}
</style>
