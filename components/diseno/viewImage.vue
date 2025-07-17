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

      <!-- <b-button
        :disabled="disableButton"
        variant="primary"
        class="mt-4"
        @click="copiarAlPortapapeles"
        >Copiar link de aprobación</b-button
      > -->
      <div v-if="
                    this.$store.state.login.dataUser.acceso ||
                    this.$store.state.login.dataUser.departamento ===
                        'Comercialización'
                ">
        Enviar aprobación
        <span v-html="whatsAppMe('584147307169', true, msgAprobacion)"></span>
        <p
          style="color: #fff"
          id="parrafoParaCopiar"
        >{{ url }}</p>
      </div>
      <b-overlay
        :show="overlay"
        spinner-small
      >
        <b-container>
          <b-row>
            <b-col> </b-col>
          </b-row>
          <b-row>
            <b-col>
              <div class="image-container">
                <img
                  :src="imageUrl"
                  :width="imageWidth"
                  :height="imageHeight"
                />
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
      url: "zzz",
      aprobado: null,
      revision: null,
      id_diseno: null,
      newImage: null,
      overlay: false,
      size: "lg",
      title: "Imágen del diseño",
      imageWidth: "100%",
      imageHeight: "auto",
      imageUrl: `${this.$config.CDN}/images/no-image.png`,
      actionURL: "",
      msgAprobacion: "",

      // ANTIGUO
      titulo: "",
      fileList: [],
    };
  },

  computed: {
    disableButton() {
      if (this.aprobado) {
        return false;
      } else {
        return true;
      }
    },
    srcImag() {
      let token = this.token();
      return this.imageUrl + "&_=" + token;
    },
    modalView: function () {
      const rand = Math.random().toString(36).substring(2, 7);

      return `modal-${rand}`;
    },
  },

  methods: {
    copiarAlPortapapeles() {
      // Obtén el párrafo por su ID
      const parrafo = document.getElementById("parrafoParaCopiar");

      // Crea un rango de selección
      const range = document.createRange();
      range.selectNode(parrafo);

      // Selecciona el contenido del rango
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);

      try {
        // Copia el contenido seleccionado al portapapeles
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
        this.$fire({
          title: "URL copiada al portapapeles",
          html: ``,
          type: "info",
        });
      } catch (err) {
        console.error("No se pudo copiar al portapapeles: ", err);
      }
    },

    mostrarNotificacion() {
      this.$fire({
        title: "URL Copiada",
        html: `La URL de la aprobación del cliente ha sido copiada al portapapeles`,
        type: "info",
      });
    },

    async verificarAprobacion() {
      await this.$axios
        .get(`${this.$config.API}/diseno/aprobado/${this.id}`)
        .then((res) => {
          console.log(`En verificar aprobacion recibimos en data`, res.data);
          this.aprobado = res.data.aprobado;
          if (this.aprobado == true) {
            this.revision = res.data.data.revision;
            this.id_diseno = res.data.data.id_diseno;
            this.imageUrl = this.findImage();
          } else {
            // this.imageUrl = this.findImage()
            this.imageUrl = `${this.$config.CDN}/images/no-image.png`;
          }
        })
        .catch((err) => {
          alert(err + "RRR: " + res.data);
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    async findImage() {
      this.$axios
        .get(`${this.$config.API}/disenos/images/${this.id}`)
        .then((res) => {
          this.imageUrl = `${this.$config.API}/${res.data[0]}`;
        })
        .catch((err) => {
          console.error(`El cdn respondio con un error`, err);
          this.imageUrl = [`${this.$config.API}/images/no-image.png`];
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

  props: ["id"],

  mounted() {
    this.overlay = true;
    this.titulo = `Imagen de la orden ${this.id}`;
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      this.findImage().then(() => {
        this.overlay = false;
      });
    });
  },
};
</script>

<style>
.image img {
  width: auto;
}
</style>
