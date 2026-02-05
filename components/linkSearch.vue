<template>
  <div>
    <b-button @click="$bvModal.show(modal)" :variant="statusbutton"
      >{{ id }}
    </b-button>

    <b-modal :id="modal" :title="title" hide-footer size="xl" @show="onModalShow" @hidden="onModalHidden">
      <div class="table-wrapper">
        <b-overlay :show="overlay" spinner-small>
          <buscar-resultado v-if="showResultado" :id="id" />
        </b-overlay>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Resultado from "~/components/buscar/resultado.vue";

export default {
  components: { "buscar-resultado": Resultado },

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
