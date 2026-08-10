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
      @hide="handleHide"
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
              v-for="rev in misRevisiones"
              v-bind:key="rev.localKey || rev.id_revision"
              deck
            >
              <diseno-uploadPropuesta
                ref="proposalCards"
                :key="rev.localKey || rev.id_revision"
                :id="rev.localKey || rev.id_revision"
                :revision="rev.id_revision"
                :item="rev"
                :localKey="rev.localKey"
                @reload="reloadData"
                @closemodal="hideMe"
                @revision-creada="onRevisionCreada"
                @borrador-descartado="onBorradorDescartado"
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
      closingConfirmed: false,
      borradores: [],
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
      const serverRevisiones =
        this.revisiones.length > 0
          ? this.revisiones.filter(
              (el) => parseInt(el.id_orden, 10) === parseInt(this.item.id_orden, 10)
            )
          : [];

      // Un borrador cuya revisión ya se resolvió y ya llegó del servidor se
      // excluye para no duplicar la tarjeta -- una vez confirmado por el
      // servidor, el borrador local queda redundante. Se normaliza a Number
      // antes de comparar: un id_revision como string ("1091") nunca
      // coincide con el mismo id numérico (1091) dentro de un Set.
      const idsDelServidor = new Set(
        serverRevisiones.map((r) => Number(r.id_revision))
      );
      const borradoresVisibles = this.borradores.filter(
        (b) =>
          b.id_revision === null || !idsDelServidor.has(Number(b.id_revision))
      );

      return [...borradoresVisibles, ...serverRevisiones];
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

    handleHide(bvModalEvt) {
      if (this.closingConfirmed) {
        this.closingConfirmed = false;
        this.limpiarTodosLosBorradores();
        return;
      }

      const tarjetas = this.$refs.proposalCards;
      const tieneImagenSinSubir = Array.isArray(tarjetas)
        ? tarjetas.some((c) => c && c.newImage)
        : false;

      if (tieneImagenSinSubir) {
        bvModalEvt.preventDefault();
        this.$confirm(
          "Seleccionaste una imagen que todavía no se subió. Si cierras ahora, se perderá.",
          "¿Cerrar sin subir la imagen?",
          "warning"
        )
          .then(() => {
            this.closingConfirmed = true;
            this.$nextTick(() => {
              this.$bvModal.hide(this.modal);
            });
          })
          .catch(() => {});
        return;
      }

      this.limpiarTodosLosBorradores();
    },

    enableButton() {
      this.disableButton = false;
    },

    reloadData() {
      this.overlay = true;
      this.$emit("reload", true);
      this.overlay = false;
    },

    // "+ Nuevo Diseño" ya no escribe en la base de datos -- solo agrega un
    // formulario local. El registro real (disenos + revisiones) se crea
    // recién cuando el diseñador realmente sube una imagen (ver
    // crearRevisionReal() en diseno/uploadPropuesta.vue). Si el formulario
    // no se usa, desaparece solo al cerrar el modal, sin dejar rastro.
    addReview() {
      const rand = Math.random().toString(36).substring(2, 9);
      this.borradores.push({
        localKey: `local-${Date.now()}-${rand}`,
        id_revision: null,
        id_diseno: null,
        id_orden: this.item.id_orden,
        id_empleado: this.$store.state.login.dataUser.id_empleado,
        id_product: null,
        revision: null,
        estatus: "Esperando Respuesta",
        tipo: "Diseño por definir",
        detalles: null,
      });
    },

    onRevisionCreada({ localKey, id_diseno, id_revision }) {
      const borrador = this.borradores.find((b) => b.localKey === localKey);
      if (borrador) {
        borrador.id_diseno = id_diseno;
        borrador.id_revision = id_revision;
      }
    },

    onBorradorDescartado({ localKey }) {
      this.borradores = this.borradores.filter(
        (b) => b.localKey !== localKey
      );
    },

    limpiarTodosLosBorradores() {
      this.borradores = [];
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
  