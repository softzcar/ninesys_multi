<template>
  <div>
    <b-button
      variant="primary"
      @click="$bvModal.show(modal)"
    >
      DETALLES
    </b-button>

    <b-modal
      :size="size"
      :title="title"
      :id="modal"
      hide-footer
    >
      <b-overlay
        :show="overlay"
        spinner-small
      >
        <b-container>
          <b-row>
            <b-col lg="12">
              <b-alert
                v-if="detalleReposicion != ''"
                show
                variant="danger"
              >
                <h1>REPOSICIÓN</h1>
                <b-table
                  striped
                  hover
                  :items="repos"
                ></b-table>
                <!-- {{ detalleReposicion }} -->
              </b-alert>

              <div v-html="detalle"></div>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      detalle: "",
      overlay: false,
      size: "xl",
      title: "Detalles",
      repos: [],
    };
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    detalleReposicion() {
      let miDetalle = "";

      if (this.repos.length > 0) {
        miDetalle = this.repos[0].detalle;
      }

      return miDetalle;
    },
  },

  methods: {
    async getRepositions() {
      await this.$axios
        .get(
          `${this.$config.API}/reposiciones/${this.id_ordenes_productos}/${this.idorden}`
        )
        .then((res) => {
          this.repos = res.data.data;
        });
    },

    async getDetalles() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/ordenes/detalles/${this.idorden}`)
        .then((resp) => {
          this.detalle = resp.data.detalle[0].observaciones;
          this.overlay = false;
        });
    },
  },

  props: ["idorden", "detalles_revision", "id_ordenes_productos"],

  mounted() {
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if ((this, this.modal === modalId)) {
        this.getDetalles();
        this.getRepositions(this.id_ordenes_productos, this.idorden);
        /* if (this.detalles_revision === null) {
          } else {
            this.detalle = this.detalles_revision
            this.overlay = false
          } */
      }
    });
  },
};
</script>

<style lang="scss" scoped></style>
