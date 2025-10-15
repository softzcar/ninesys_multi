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
          <b-row v-if="showNoImageAlert">
            <b-col>
              <b-alert variant="info" show>
                <b-icon icon="info-circle"></b-icon>
                No se ha encontrado una imagen aprobada para esta orden.
              </b-alert>
            </b-col>
          </b-row>
          <b-row v-else>
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
      title: "Imágen aprobada",
      imageWidth: "100%",
      imageHeight: "auto",
      imageUrl: `${this.$config.CDN}/images/no-image.png`,
      actionURL: "",
      msgAprobacion: "",
      showNoImageAlert: false,

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
    async findImage() {
      this.$axios
        .get(`${this.$config.API}/revision/image/${this.id}`)
        .then((res) => {
          if (res.data.url_image == null) {
            this.showNoImageAlert = true;
            this.imageUrl = `${this.$config.CDN}/images/no-image.png`;
          } else {
            this.showNoImageAlert = false;
            this.imageUrl = res.data.url_image;
          }

          // this.imageUrl = `${this.$config.API}/${res.data.url_image}`;
          console.log("imgen de revision recibida", this.imageUrl);
        })
        .catch((err) => {
          console.error(`El cdn respondio con un error`, err);
          this.showNoImageAlert = true;
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
    this.showNoImageAlert = false;
    this.titulo = `Imagen de la orden ${this.id}`;
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (this.modalView === modalId) {
        this.findImage().then(() => {
          this.overlay = false;
        });
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
