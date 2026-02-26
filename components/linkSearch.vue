<template>
  <div>
    <b-button @click="$bvModal.show(modal)" :variant="statusbutton"
      >{{ id }}
    </b-button>

    <b-modal :id="modal" :title="title" hide-footer size="xl" @show="onModalShow" @hidden="onModalHidden">
      <div>
        <!-- Inyección para Corte: Se muestra si el empleado activo pertenece a Corte (ID 3) -->
        <b-overlay :show="overlay" spinner-small>
          <div v-if="showResultado && isCorteDepartamento" class="mb-4">
            <h5 class="text-primary border-bottom pb-2"><b-icon icon="scissors" class="mr-2"></b-icon>Cantidades Asignadas de Corte</h5>
            <CorteItemView :idOrden="id" :embedded="true" />
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
import CorteItemView from "~/components/produccion/CorteItemView.vue";

export default {
  components: { 
    "buscar-resultado": Resultado,
    CorteItemView
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
    isCorteDepartamento() {
      if(this.$store.state.login && this.$store.state.login.currentDepartamentId) {
        return parseInt(this.$store.state.login.currentDepartamentId) === 3;
      }
      return false;
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

  props: ["id", "progreso"],
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
