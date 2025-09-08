<template>
  <div>
    <b-button
      variant="primary"
      @click="$bvModal.show(modalView)"
    >
      <b-icon icon="file-image"></b-icon>
    </b-button>

    <b-modal
      :size="size"
      :title="title"
      :id="modalView"
      hide-footer
    >
      <p style="color: white; font-size: 0.01rem">URL: {{ imageUrl }}</p>

      <b-overlay
        :show="overlay"
        spinner-small
      >
        <b-container>
          <b-row>
            <b-col>
              <div v-if="
                this.$store.state.login.dataUser.acceso ||
                this.$store.state.login.dataUser.departamento === 'Comercialización'
              ">
                <b-button class="mb-4" :disabled="disableButton" variant="info" @click="copiarAlPortapapeles">
                  <b-icon icon="image"></b-icon> Copiar Imagen
                </b-button>
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <div
                v-if="imageUrl.length > 0"
                class="image-container mb-4"
              >
                <img
                  :src="imageUrl"
                  :width="imageWidth"
                  :height="imageHeight"
                />
              </div>

              <div v-else>
                <b-alert
                  show
                  variant="info"
                >No hay imagen aprobada</b-alert>
              </div>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],

  data() {
    return {
      overlay: false,
      size: "lg",
      title: "Imagen de la orden",
      imageWidth: "100%",
      imageHeight: "auto",
      imageUrl: "",
    };
  },

  computed: {
    disableButton() {
      return this.imageUrl.length === 0;
    },
    modalView: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },

  methods: {
    async copiarAlPortapapeles() {
      if (!navigator.clipboard || !navigator.clipboard.write) {
        this.$fire({ title: "Error", html: "Tu navegador no soporta esta funcionalidad.", type: "error" });
        return;
      }

      try {
        this.overlay = true;

        const response = await fetch(this.imageUrl);
        if (!response.ok) {
          throw new Error('No se pudo descargar la imagen.');
        }

        const blob = await response.blob();

        const clipboardItem = new ClipboardItem({
          [blob.type]: blob,
        });

        await navigator.clipboard.write([clipboardItem]);

        this.$fire({
          title: "¡Éxito!",
          html: "La imagen ha sido copiada al portapapeles.",
          type: "success",
        });

      } catch (err) {
        console.error("Error al copiar la imagen: ", err);
        this.$fire({
          title: "Error",
          html: "No se pudo copiar la imagen. Esto puede deberse a un problema de CORS o del navegador.",
          type: "error",
        });
      } finally {
        this.overlay = false;
      }
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

    async getImages() {
      this.overlay = true;
      // Primero obtenemos la RUTA de la imagen desde nuestro endpoint original
      this.$axios
        .get(
          `${this.$config.CDN}/?id_orden=${this.id}&id_empresa=${this.$store.state.login.dataEmpresa.id}`
        )
        .then((res) => {
          // Si no hay una URL válida, dejamos el campo vacío
          if (res.data.url === "images/no-image.png" || !res.data.url) {
            this.imageUrl = "";
          } else {
            // Si hay una URL, construimos el enlace a nuestro nuevo script get_image.php
            const imagePath = res.data.url;
            this.imageUrl = `${this.$config.CDN}/get_image.php?path=${imagePath}`;
          }
        })
        .catch((err) => {
          console.error("Error al obtener la ruta de la imagen:", err);
          this.imageUrl = "";
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  props: ["id"],

  mounted() {
    this.title = `Imagen de la orden ${this.id}`;
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId === this.modalView) {
        this.getImages();
      }
    });
  },
};
</script>

<style>
.image img {
  width: auto;
}
</style>
