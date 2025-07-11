<template>
  <b-overlay
    :show="overlay"
    rounded="sm"
  >
    <b-card
      :title="myTitle"
      img-alt="Image"
      tag="article"
      style="max-width: 100% !important"
      class="m-4 p-3 text-center"
      img-bottom
      bg-variant="default"
      text-variant="red"
    >
      <b-card-img-lazy
        class="mt-4"
        :src="tmpImage"
      ></b-card-img-lazy>

      <b-alert
        class="text-center"
        show
        style="text-transform: uppercase; font-size: 1.2rem; font-weight: bold"
        :variant="variantAlert"
      >{{ miRevision }}</b-alert>
      <b-form-group
        id="input-group-1"
        label="Detalle:"
        label-for="input-1"
      >
        <p>
          {{ miDetalle }}
        </p>
        <hr v-if="miDetalle" />
      </b-form-group>

      <b-card-text
        v-if="showUploadForm"
        class="mt-4 mb-4"
      >
        <b-form-group
          id="input-group-2"
          label="Tipo de diseño:"
          label-for="select-diseno"
        >
          <b-form-select
            id="select-diseno"
            v-model="tipoDiseno"
            :options="disenoOptions"
            required
          >
          </b-form-select>
        </b-form-group>

        <!-- Styled -->
        <div class="mt-4 pt-3">
          <b-form-group
            id="input-group-3"
            label="Imagen"
            :label-for="inputId"
          >
            <b-form-file
              :id="inputId"
              :disabled="disableForm"
              v-model="newImage"
              :state="Boolean(newImage)"
              placeholder="Escoja o arrastre un archivo aquí..."
              drop-placeholder="Arrasre la propuesta aquí..."
            ></b-form-file>
          </b-form-group>
        </div>

        <div class="text-center">
          <b-button
            :disabled="disableForm"
            variant="primary"
            @click="postImage()"
          >Enviar Diseño</b-button>
        </div>
      </b-card-text>
    </b-card>
    <template #overlay>
      <h3 class="text-center">{{ overlayText }}</h3>
    </template>
  </b-overlay>
</template>
  
  <script>
import mixin from "~/mixins/mixins.js";
import axios from "axios";

export default {
  mixins: [mixin],

  data() {
    return {
      disableForm: false,
      variantAlert: "secondary",
      newImage: null,
      overlay: false,
      overlayText: "",
      tmpImage: "",
      tipoDiseno: null,
      id_orden: "",
      showCard: true,
      miRevision: "",
      miDetalle: "",
    };
  },

  watch: {
    miRevision(val) {
      if (val === "Rechazado") {
        this.showCard = false;
        this.variantAlert = "warning";
      }
      if (val === "Aprobado") {
        this.showCard = false;
        this.variantAlert = "success";
      }
      if (val === "Esperando Respuesta") this.variantAlert = "info";
    },

    item(val) {
      if (val.id_product === null) {
        this.tmpImage = `${this.$config.CDN}/images/no-image.png`;
      }
    },
  },

  computed: {
    inputId() {
      return `input-imagen-${this.id}`;
    },

    myTitle() {
      return "PROPUESTA " + this.revision;
    },

    urlCDN() {
      return `${this.$config.CDN}/?id_orden=${this.idorden}&review=${this.item.id_revision}&id_empresa=${this.$store.state.login.dataEmpresa.id}&id_empleado=${this.$store.state.login.dataUser.id_empleado}`;
    },

    disenoOptions() {
      let tmpOptions = this.productos.map((el) => {
        return {
          value: el.id_producto,
          text: `${el.product}`,
        };
      });

      tmpOptions.unshift({
        value: null,
        text: "Seleccione un diseño",
      });

      return tmpOptions;
    },

    showUploadForm() {
      // La única fuente de verdad para mostrar el formulario es si la revisión no tiene un producto asignado.
      return this.item.id_product === null && this.showCard;
    },
  },

  methods: {
    hideMe() {
      this.$bvModal.hide(this.modal);
    },

    sendNewImage() {
      this.overlay = true;

      if (this.newImage === null) {
        this.$fire({
          title: "Imagen",
          html: "<p>Seleccione una imagen...</p>",
          type: "warning",
        });
      } else {
        this.postImage().then((res) => {
          this.overlay = false;
          this.tmpImage = res.data.url;
        });
      }
    },

    async enviarTipoDiseno() {
      this.$emit("closemodal");

      const data = new URLSearchParams();
      data.set("id_diseno", this.item.id_diseno);
      data.set("url_imagen", this.tmpImage);
      data.set("id_revision", this.item.id_diseno);
      data.set("id_revision", this.item.id_revision);
      data.set("id_product", this.tipoDiseno);

      await this.$axios
        .post(`${this.$config.API}/diseno/update-tipo`, data, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
        .then((res) => {
          this.$fire({
            title: "Diseño Creado",
            html: `<p>El tipo de diseño se guardó correctamente.</p>`,
            type: "success",
          });
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se pudo guardar el tipo de diseño.</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    async postImage() {
      this.overlay = true;

      let ok = true;
      let msg = "";

      if (this.tipoDiseno === null) {
        ok = false;
        msg += "<p>Seleccione una tipo de diseño</p>";
      }

      if (!this.newImage) {
        ok = false;
        msg += "<p>Seleccione una imagen</p>";
      }

      if (ok) {
        let formData = new FormData();
        formData.append("file", this.newImage);
        this.overlay = true;
        await axios
          .post(this.urlCDN, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            if (res.data.uploaded) {
              this.tmpImage = res.data.url + "?_=" + this.token();
              this.$emit("reload", "true");
              this.$emit("button", false);
              this.enviarTipoDiseno();
              this.overlay = false;
            } else {
              this.$fire({
                title: "Error",
                html: `<p>La imagen no se guardó.</p><p>${res.data.msg}</p>`,
                type: "error",
              });
            }
          })
          .catch((err) => {
            this.$fire({
              title: "Error",
              html: `No se guardó la imágen ${err}`,
              type: "danger",
            });
          })
          .finally(() => {
            this.overlay = false;
          });
      } else {
        this.$fire({
          title: "Faltan Datos",
          html: msg,
          type: "warniing",
        });
        this.overlay = false;
      }
    },

    findImage() {
      let token = this.token();
      fetch(this.urlCDN)
        .then((response) => response.json())
        .then((res) => {
          this.tmpImage = `${this.$config.CDN}/${res.url}?_=${token}`;
        })
        .catch((err) => {
          this.tmpImage = `${this.$config.CDN}/images/no-image.png`;
        });
    },
  },

  mounted() {
    this.overlayText = "Procesando imágen...";
    this.miRevision = this.item.estatus;
    if (this.item.id_product) {
      this.tipoDiseno = this.item.id_product;
    }
    this.findImage();
    if (this.miRevision === "Rechazado") {
      this.showCard = false;
      this.variantAlert = "warning";
    }
    if (this.miRevision === "Aprobado") {
      this.showCard = false;
      this.variantAlert = "success";
    }
    if (this.miRevision === "Esperando Respuesta") this.variantAlert = "info";
  },

  props: [
    "id",
    "revision",
    "item",
    "reload",
    "nextReview",
    "button",
    "idorden",
    "productos",
    "closemodal",
  ],
};
</script>
  
  <style scoped>
.card {
  border-top-width: 2px;
  border-right-width: 2px;
  border-bottom-width: 2px;
  border-left-width: 2px;
}
</style>
  