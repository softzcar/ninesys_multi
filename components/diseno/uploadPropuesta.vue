<template>
  <b-overlay :show="overlay" rounded="sm">
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
      <b-card-img-lazy class="mt-4" :src="tmpImage"></b-card-img-lazy>
      <b-alert
        class="text-center"
        show
        style="text-transform: uppercase; font-size: 1.2rem; font-weight: bold"
        :variant="variantAlert"
        >{{ miRevision }}</b-alert
      >
      <b-form-group id="input-group-1" label="Detalle:" label-for="input-1">
        <p>
          {{ miDetalle }}
        </p>
        <hr />
      </b-form-group>

      <b-card-text v-if="showCard" class="mt-4 mb-4">
        <!-- Styled -->
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

        <!-- <div class="mt-4 mb-4 text-center">
          Archivo seleccionado: {{ newImage ? newImage.name : '' }}
        </div> -->

        <!-- <div class="text-center">
          <b-button
            :disabled="disableForm"
            variant="primary"
            @click="sendNewImage()"
            >Enviar Diseño</b-button
          >
        </div> -->
      </b-card-text>
    </b-card>
    <template #overlay>
      <h3 class="text-center">{{ overlayText }}</h3>
    </template>
    <!-- <pre style="background-color: red">
        props->item {{ $props }}
    </pre> -->
  </b-overlay>
</template>

<script>
import mixin from '~/mixins/mixins.js'
import axios from 'axios'

export default {
  mixins: [mixin],

  data() {
    return {
      disableForm: false,
      variantAlert: 'secondary',
      newImage: null,
      overlay: false,
      overlayText: '',
      tmpImage: '',
      id_orden: '',
      showCard: true,
      miRevision: '',
      miDetalle: '',
    }
  },

  watch: {
    miRevision(val) {
      if (val === 'Rechazado') {
        this.showCard = false
        this.variantAlert = 'warning'
        // this.disableForm = true
      }
      if (val === 'Aprobado') {
        this.showCard = false
        this.variantAlert = 'success'
      }
      if (val === 'Esperando Respuesta') this.variantAlert = 'info'
    },
  },

  computed: {
    myTitle() {
      return 'PROPUESTA ' + this.revision
    },
  },

  methods: {
    async getEstatus() {
      await axios
        .get(`${this.$config.API}/revisiones/estatus/${this.item.id_revision}`)
        .then((res) => {
          this.miRevision = res.data.estatus
          this.miDetalle = res.data.detalles
          if (this.item.estatus === 'Rechazado') {
            this.showCard = false
            this.variantAlert = 'warning'
            // this.disableForm = true
          }
          if (this.item.estatus === 'Aprobado') {
            this.showCard = false
            this.variantAlert = 'success'
          }
          if (this.item.estatus === 'Esperando Respuesta')
            this.variantAlert = 'info'
        })
    },
    sendNewImage() {
      this.overlay = true
      this.postImage().then((res) => {
        this.overlay = false
        this.tmpImage = res.data.url
      })
      /* if (this.newImage === null) {
          this.$fire({
            title: 'Imagen',
            html: '<p>Seleccione una imagen...</p>',
            type: 'warning',
          })
        } else {
        } */
    },

    // subir imagen
    async postImage() {
      this.overlay = true
      let formData = new FormData()
      formData.append('file', this.newImage)
      this.overlay = true
      await axios
        .post(
          `https://${this.$config.CDN}/?id_orden=${this.idorden}&id_diseno=${this.item.id_diseno}&review=${this.revision}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        .then((res) => {
          if (res.data.uploaded) {
            this.getEstatus()
            this.tmpImage = res.data.url + '?_=' + this.token()
            this.$emit('reload', 'true')
            this.$emit('button', false)
            this.overlay = false
          } else {
            this.$fire({
              title: 'Error',
              html: `<p>La imagen no se guardó.</p><p>${res.data.msg}</p>`,
              type: 'error',
            })
          }
        })
        .catch((err) => {})
        .finally(() => {
          this.overlay = false
        })
    },

    findImage() {
      let token = this.token()
      console.log('Vamos a buscar la imágen')
      axios
        .get(
          `${this.$config.CDN}/?id_orden=${this.id}&id_diseno=${this.item.id_diseno}&review=${this.revision}`
        )
        .then((res) => {
          console.log(`El cdn respondio con una imagen`, res)
          this.tmpImage = `${this.$config.CDN}/${res.data.url}?_=${token}`
        })
        .catch((err) => {
          console.log(`El cdn respondio con un error`, err)
          this.tmpImage = `${this.$config.CDN}/images/no-image.png`
        })
    },
  },

  mounted() {
    this.overlayText = 'Subiendo imágen...'

    /* this.$root.$on('bv::modal::show', (bvEvent, modalId) => {
      console.log('Modal is about to be shown', bvEvent, modalId)
    }) */
    this.getEstatus()
    // console.log('modal opn says item.estatus', this.item.estatus)
    this.findImage()
    if (this.miRevision === 'Rechazado') {
      this.showCard = false
      this.variantAlert = 'warning'
      // this.disableForm = true
    }
    if (this.miRevision === 'Aprobado') {
      this.showCard = false
      this.variantAlert = 'success'
    }
    if (this.miRevision === 'Esperando Respuesta') this.variantAlert = 'info'

    // this.getEstatus()
  },

  props: [
    'id',
    'revision',
    'item',
    'reload',
    'nextReview',
    'button',
    'idorden',
  ],
}
</script>

<style scoped>
.card {
  border-top-width: 2px;
  border-right-width: 2px;
  border-bottom-width: 2px;
  border-left-width: 2px;
}
</style>
