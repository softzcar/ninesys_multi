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
                <b-icon icon="plus"></b-icon> Nueva Revisión
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
                :id="item.id"
                :revision="rev.revision"
                :item="rev"
                @reload="getRevisiones"
                :nextReview="nextReview"
                :button="enableButton"
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
import axios from "axios";

export default {
  data() {
    return {
      iconBadge: "clock-history",
      showBadge: false,
      variantAlert: "secondary",
      newImage: null,
      size: "md",
      title: "Imágenes del diseño orden " + this.item.id,
      overlay: false,
      nextReview: null,
      disableButton: false,
      // TABS
      tabs: [],
      tabCounter: 0,
      misRevisiones: [],
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

    banReload(flag) {
      if (flag) {
        this.overlay = true;
        this.reloadData().then(() => {
          this.overlay = false;
          this.banReload = false;
        });
      }
    },
  },

  computed: {
    buttonTitle() {
      return "Revisión " + this.nextReview;
    },

    /* nextReview() {
      let last = this.misRevisiones
        .map((el) => {
          let rev = parseInt(el.revision)
          return rev
        })
        .reduce(function (a, b) {
          return Math.max(a, b)
        }, 0)
      return last + 1
    }, */

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);

      return `modal-${rand}`;
    },
  },

  methods: {
    enableButton() {
      this.disableButton = false;
    },

    reloadData() {
      this.overlay = true;
      this.misRevisiones = [];
      this.getRevisiones().then(() => (this.overlay = false));
    },

    addReview() {
      this.disableButton = true;
      this.overlay = true;
      this.$confirm(``, "¿Desea crear una nueva revisión?", "question")
        .then(() => {
          this.overlay = true;
          const data = new URLSearchParams();
          data.set("id_diseno", this.item.id_diseno);
          data.set("id_orden", this.item.id_orden);

          axios
            .post(`${this.$config.API}/revision/nuevo`, data)
            .then((res) => {
              this.lastId = res.data.last_id;
              this.id_orden = res.data;
              this.getRevisiones().then(() => this.$emit("reload", true));
            })
            .catch((err) => {
              this.$fire({
                title: "Error",
                html: `<p>La revisión no se creó.</p><p>${err}</p>`,
                type: "error",
              });
            })
            .finally(() => {
              this.overlay = false;
              this.disableButton = false;
            });

          // -> ANTIGUO
          /* this.nextReview = this.misRevisiones.length + 1
          let revItem = {
            detalles_revision: '',
            id_diseno: `${this.id}`,
            revision: `${this.nextReview}`,
          }
          this.misRevisiones.push(revItem)
          this.initComponent()
          this.$forceUpdate() */
        })
        .catch(() => {
          this.disableButton = false;
          return false;
        });
    },

    // tabs
    closeTab(x) {
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i] === x) {
          this.tabs.splice(i, 1);
        }
      }
    },
    newTab() {
      this.tabs.push(this.tabCounter++);
    },
    // fin tabs

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

    initComponent() {
      if (this.misRevisiones.length > 0) {
        console.log(`'revision SI tiena datos'`, this.misRevisiones);
        for (let index = 0; index < this.misRevisiones.length; index++) {
          let curr = parseInt(this.misRevisiones[index].revision);
          this.tabs.push(curr);
        }
      } else {
        console.log(`'misRevisiones NO tiena datos'`, this.misRevisiones);
      }
    },

    async getRevisiones() {
      await this.$axios
        .get(`${this.$config.API}/revision/diseno/${this.item.id}`)
        .then((res) => {
          console.log(`revision/diseno/${this.item.id}`, res.data);
          this.misRevisiones = res.data;
        });
    },
  },

  mounted() {
    this.overlay = true;
    this.getRevisiones().then(() => (this.overlay = false));
    /* this.$root.$on('bv::modal::show', (bvEvent, modalId) => {
      alert('hola vamos a cargar las imágenes de revisiones!!!!')
      console.log('hola vamos a cargar las imágenes de revisiones!!!!', this.modal)
    }) */

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

    // this.misRevisiones = this.item.revision
    this.misRevisiones = this.revisiones;
    this.initComponent();
    this.overlay = false;
  },

  props: ["item", "revisiones", "estatus", "reload"],
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
