<template>
  <div>
    <div class="float-badget">
      <b-button
        variant="primary"
        @click="$bvModal.show(modal)"
      >
        <b-badge
          v-if="showBadge"
          :variant="variantAlert"
        ><b-icon :icon="iconBadge"></b-icon></b-badge>
        <b-icon icon="cloud-upload"></b-icon>
      </b-button>
    </div>

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
        <b-container class="mb-4">
          <b-row>
            <b-col>
              <b-button
                :disabled="disableButton"
                @click="addReview()"
                variant="success"
              >
                <b-icon icon="plus"></b-icon> Nuevo Diseño
              </b-button>
            </b-col>
          </b-row>
        </b-container>
        <b-row>
          <b-col>
            <b-card-group
              v-for="(rev, index) in misRevisiones"
              v-bind:key="index"
              deck
            >
              <diseno-uploadPropuesta
                :key="index"
                :id="rev.id_revision"
                :revision="rev.id_revision"
                :item="rev"
                @reload="reloadData"
                @closemodal="hideMe"
                :nextReview="nextReview"
                :button="enableButton"
                :productos="productos"
                :idorden="item.id_orden"
              />
            </b-card-group>
          </b-col>
        </b-row>
      </b-overlay>
    </b-modal>
  </div>
</template>
  
  <script>
export default {
  data() {
    return {
      iconBadge: "clock-history",
      showBadge: false,
      variantAlert: "secondary",
      newImage: null,
      size: "md",
      title: "Imágenes del diseño orden Nro. " + this.item.id,
      overlay: false,
      nextReview: null,
      disableButton: false,
      tabs: [],
      tabCounter: 0,
      banReload: false,
    };
  },

  watch: {
    item() {
      if (this.item.estatus === "Rechazado") {
        this.variantAlert = "danger";
        this.iconBadge = "arrow-counterclockwise";
        this.showBadge = true;
      }
      if (this.item.estatus === "Aprobado") {
        this.variantAlert = "success";
        this.iconBadge = "check";
        this.showBadge = true;
      }
      if (this.item.estatus === "Esperando Respuesta") {
        this.variantAlert = "info";
      }
    },
  },

  computed: {
    misRevisiones() {
      if (this.revisiones.length > 0) {
        return this.revisiones.filter(
          (el) => parseInt(el.id_orden) === this.item.id_orden
        );
      } else {
        return [];
      }
    },

    buttonTitle() {
      return "Revisión " + this.nextReview;
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },

  methods: {
    hideMe() {
      this.$bvModal.hide(this.modal);
    },

    enableButton() {
      this.disableButton = false;
    },

    reloadData() {
      this.overlay = true;
      this.$emit("reload", true);
      this.overlay = false;
    },

    addReview() {
      this.disableButton = true;
      this.overlay = true;
      this.$confirm(
        `Se creará un nuevo proyecto de diseño para esta orden, el cual podrá especificar y cargar posteriormente.`,
        "¿Desea agregar un nuevo diseño?",
        "question"
      )
        .then(() => {
          this.overlay = true;
          const data = new URLSearchParams();
          data.set("id_orden", this.item.id_orden);
          data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);

          this.$axios
            .post(`${this.$config.API}/disenos/nuevo-con-revision`, data)
            .then((res) => {
              this.$fire({
                title: "Éxito",
                html: `<p>${res.data.message}</p>`,
                type: "success",
              });
              this.$emit("reload", true);
            })
            .catch((err) => {
              this.$fire({
                title: "Error",
                html: `<p>El nuevo diseño no se pudo crear.</p><p>${err}</p>`,
                type: "error",
              });
            })
            .finally(() => {
              this.overlay = false;
              this.disableButton = false;
            });
        })
        .catch(() => {
          this.overlay = false;
          this.disableButton = false;
          return false;
        });
    },

    token() {
      const length = 8;
      var a =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
          ""
        );
      var b = [];
      for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
      }
      return b.join("");
    },
  },

  mounted() {
    this.overlay = true;
    if (this.item.estatus === "Rechazado") {
      this.variantAlert = "danger";
      this.iconBadge = "arrow-counterclockwise";
      this.showBadge = true;
    }
    if (this.item.estatus === "Aprobado") {
      this.variantAlert = "success";
      this.iconBadge = "check";
      this.showBadge = true;
    }
    if (this.item.estatus === "Esperando Respuesta") {
      this.variantAlert = "info";
    }
    this.overlay = false;
  },

  props: ["item", "revisiones", "estatus", "reload", "productos"],
};
</script>
  
  <style scoped>
.card-deck {
  display: block;
}

.float-button {
  width: 100%;
  float: left;
  margin-bottom: 40px;
  margin-top: 1rem;
}

.float-pill {
  float: left;
  margin-right: 0.2rem;
}

.image img {
  width: auto;
}
</style>
  