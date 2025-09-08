<template>
  <div>
    <div class="float-badget">
      <b-button
        variant="primary"
        @click="$bvModal.show(modal)"
      >
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
          <b-button
            v-if="tmpImage"
            variant="danger"
            @click="confirmDeleteImage"
            class="mb-4 mt-2"
          >
            <b-icon icon="trash"></b-icon> Eliminar Imagen
          </b-button>

          <b-img
            v-if="tmpImage.length > 0"
            :src="tmpImage"
            fluid-grow
          ></b-img>

          <b-alert show v-if="tmpImage.length == 0" variant="info">No se encontró imagen aprobada </b-alert>

          <b-card-text
            v-if="showCard"
            class="mt-4 mb-4"
          >
            <div class="mt-4 pt-3">
              <b-form-file
                :disabled="disableForm"
                v-model="newImage"
                :state="Boolean(newImage)"
                placeholder="Escoja o arrastre un archivo aquí..."
                drop-placeholder="Arrasre la propuesta aquí..."
                @input="postImage()"
              ></b-form-file>
            </div>
          </b-card-text>
        </b-card>
        <template #overlay>
          <h3 class="text-center">{{ overlayText }}</h3>
        </template>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import axios from "axios";

export default {
  mixins: [mixin],

  data() {
    return {
      title: "Subir Diseño Aprobado",
      disableForm: false,
      variantAlert: "secondary",
      newImage: null,
      overlay: false,
      overlayText: "",
      tmpImage: "",
      id_orden: "",
      showCard: true,
      miRevision: "",
      miDetalle: "",
      size: "lg",
    };
  },

  computed: {
    myTitle() {
      return "DISEÑO APROBADO PARA LA ORDEN " + this.item.id_orden;
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);

      return `modal-${rand}`;
    },
  },

  methods: {
    confirmDeleteImage() {
      this.$confirm(
        "¿Está seguro de que desea eliminar esta imagen? Esta acción no se puede deshacer.",
        "Confirmar Eliminación",
        "warning"
      ).then(() => {
        this.deleteImage();
      });
    },

    async deleteImage() {
      this.overlay = true;
      await this.$axios.delete(`${this.$config.CDN}/?id_orden=${this.item.id_orden}&id_empresa=${this.$store.state.login.dataEmpresa.id}`)
        .then(res => {
          this.$fire({
            title: "Imagen Eliminada",
            html: "<p>La imagen ha sido eliminada correctamente.</p>",
            type: "success",
          });
          this.tmpImage = ""; // Clear the image from the view
          this.$emit("reload", "true");
        })
        .catch(err => {
          console.error("Error al eliminar la imagen:", err);
          this.$fire({
            title: "Error",
            html: "<p>No se pudo eliminar la imagen.</p>",
            type: "error",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    async postImage() {
      this.overlay = true;
      let formData = new FormData();

      formData.append("file", this.newImage);

      await this.$axios
        .post(
          `${this.$config.CDN}/?id_orden=${this.item.id_orden}&id_empresa=${this.$store.state.login.dataEmpresa.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          if (res.data.uploaded) {
            this.$fire({
              title: "Imagen Guardada",
              html: `<p>La imagen se ha subido correctamente.</p>`,
              type: "success",
            });
            this.tmpImage = res.data.url;

            this.$emit("reload", "true");
            this.$emit("button", false);
          } else {
            this.$fire({
              title: "Error",
              html: `<p>La imagen no se guardó.</p><p>${res.data.msg}</p>`,
              type: "error",
            });
          }
        })
        .catch((err) => {
          console.error("Fallo en la subida de imagen:", err);
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    async getImages() {
      this.$axios
        .get(
          `${this.$config.CDN}/?id_orden=${this.item.id_orden}&id_empresa=${this.$store.state.login.dataEmpresa.id}`
        )
        .then((res) => {
          if (res.data.url === 'images/no-image.png') {
            this.tmpImage = ''
          } else {
            let token = this.token();
            this.tmpImage = `${this.$config.CDN}/${res.data.url}?_=${token}`;
          }
        })
        .catch((err) => {
          console.error("error al traer la imagen", err);
          this.tmpImage = "";
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

    findImage() {
      let token = this.token();
      axios
        .get(
          `${this.$config.CDN}/?id_orden=${this.id}&id_empresa=${this.$store.state.login.dataEmpresa.id}`
        )
        .then((res) => {
          let token = this.token();
          this.tmpImage = `${this.$config.CDN}/${res.data.url}?_=${token}`;
        })
        .catch((err) => {
          this.tmpImage = `${this.$config.CDN}/images/no-image.png`;
        });
    },
  },

  mounted() {
    this.overlayText = "Procesando imágen...";
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (this.modal == modalId) {
        this.getImages();
      }
    });
  },

  props: ["item", "reload"],
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