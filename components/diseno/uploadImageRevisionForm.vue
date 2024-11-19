<template>
  <div :id="id">
    <b-row>
      <b-col>
        <div class="float-pill">
          <!-- Using modifiers -->
          <!-- <b-button v-b-toggle.collapse-2 class="m-1">Toggle Collapse</b-button> -->

          <!-- Using value -->
          <b-button v-b-toggle="idGenKey()" variant="primary" class="m-1">
            Revisión {{ idRevision }}
          </b-button>

          <!-- Element to collapse -->
          <b-collapse>
            <b-overlay :show="overlay" spinner-small>
              <b-container fluid>
                <b-row>
                  <b-col>
                    IMAGEN:
                    <b-img :src="srcImag" fluid-grow></b-img>
                    <!-- <b-img
              fluid
              :src="imageUrl"
              :width="imageWidth"
              :height="imageHeight"
            ></b-img> -->
                  </b-col>
                </b-row>

                <b-row>
                  <b-col>
                    <!-- <pre>
                      {{ $props }}
                    </pre> -->
                    <div class="float-button">
                      <h5 class="mb-4">Seleccione la imagen</h5>
                      <!-- <div>
                        <b-form @submit.prevent="sendNewImage">
                          <b-form-file v-model="newImage" @change="validateFile" accept=".jpg, .png"></b-form-file>
                          ::: {{ newImage }}
                          <b-button type="submit">Enviar</b-button>
                        </b-form>
                      </div> -->

                      <b-form-file
                        :id="idGenKey()"
                        v-model="newImage"
                        :state="Boolean(newImage)"
                        placeholder="Seleccione el diseño"
                        drop-placeholder="Arrastre el diseño aquí"
                        accept="image/jpeg, image/png"
                      ></b-form-file>
                      <div class="mt-3">
                        {{ newImage ? newImage.name : '' }}
                      </div>
                      <div class="mt-3 text-right">
                        <b-button variant="primary" @click="sendNewImage()"
                          >Enviar Diseño</b-button
                        >
                      </div>
                    </div>
                  </b-col>
                </b-row>
              </b-container>
            </b-overlay>
          </b-collapse>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      newImage: null,
      size: 'lg',
      title: 'Imágenes del diseño orden' + this.id,
      overlay: false,
      imageWidth: '100%',
      imageHeight: 'auto',
      imageUrl: '',
      revisiones: [],
      actionURL: '',
      lastId: 0,
      currReview: 0,
      idGen: '',
    }
  },

  computed: {
    idRevision() {
      let exp1 = []
      // let exp2 = []
      let resp = []
      exp1 = this.item.split('-')
      if (!exp1.length) {
        resp.push(0)
      } else {
        resp = exp1[1].split('.')
      }

      return resp[0]
    },
    nextReview() {
      let last
      if (this.revision.length === 0) {
        last = 1
      } else {
        last = this.revision
          .map((el) => {
            let rev = parseInt(el.revision)
            return rev
          })
          .reduce(function (a, b) {
            return Math.max(a, b)
          }, 0)
      }
      return last + 1
    },

    lastReview() {
      const last = this.revision
        .map((el) => {
          let rev = parseInt(el.revision)
          return rev
        })
        .reduce(function (a, b) {
          return Math.max(a, b)
        }, 0)
      return last
    },

    srcImag() {
      let token = this.token()
      return `${this.$config.CDN}/` + this.item + '?_=' + token
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)

      return `modal-${rand}`
    },
  },

  methods: {
    validateFile(event) {
      let file = event.target.files[0]
      let allowedTypes = ['image/jpeg', 'image/png']

      if (!allowedTypes.includes(file.type)) {
        this.selectedFile = null
        alert('Sólo se permiten imágenes en formato JPG o PNG')
      }
    },

    async imageReview(rev) {
      const token = this.token()
      const noImage = `${this.$config.CDN}/images/no-image.png?t=` + token
      let myImg
      await axios.get(`${this.$config.CDN}/?id=${this.id}`).then((res) => {
        console.log('res image', res.data)
        if (res.data.length > 0) {
          // FILTRAR AQUI POR NOMBRE DE LA IMAGEN EJM: `1-3.*` DE LO CONTRARIO RETORNAR `noImg`
          //this.imageUrl = `${this.$config.CDN}/` + res.data + '?t=' + this.token()
          console.log('data para crear la url de la imagen ', res.data)
        } else {
          myImg = noImage
        }
      })
      return myImg
    },
    idGenKey() {
      const rand = Math.random().toString(36).substring(2, 7)
      const generated = `idgen-${rand}`
      this.idGen = generated
      return generated
    },

    sendNewImage() {
      if (this.newImage === null) {
        this.$fire({
          title: 'Imagen',
          html: '<p>Seleccione una imagen.</p>',
          type: 'warning',
        })
      } else {
        // this.overlay = true
        this.nuevaRevision().then(() => {
          this.postImage().then(() => {
            // this.getRevisiones().then(() => (this.overlay = false))
          })
        })
      }
    },

    // subir imagen
    async postImage() {
      let formData = new FormData()
      formData.append('file', this.newImage)
      await axios
        .post(
          `${this.$config.CDN}/?id=${this.id}&review=${this.item.revision}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        .catch((err) => {
          this.$fire({
            title: 'Error',
            html: `<p>La imagen no se guardó.</p><p>${err}</p>`,
            type: 'error',
          })
        })
    },
    // nueva revision
    async nuevaRevision() {
      const data = new URLSearchParams()
      data.set('id_diseno', this.id)
      data.set('revision', this.nextReview)

      await axios
        .post(`${this.$config.API}/revision/nuevo`, data)
        .then((res) => {
          this.lastId = res.data.last_id
        })
    },

    token() {
      const length = 8
      var a =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split(
          ''
        )
      var b = []
      for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0)
        b[i] = a[j]
      }
      return b.join('')
    },
  },

  props: ['id', 'revision', 'item'],

  mounted() {
    this.titulo = `Imagen de la orden ${this.id}`
    this.overlay = false

    // this.imageUrl(this.item)

    /* this.getRevisiones().then(() => {
      this.overlay = false
      this.actionURL = `${this.$config.CDN}/?id=${this.id}`
      this.overlay = false
    }).catch((er) => {
      console.error('Error recibiendo la imagen', er);
    }).finally(() => { this.overlay = false })*/
  },
}
</script>

<style>
.float-button {
  width: 100%;
  float: left;
  margin-bottom: 40px;
  margin-top: 1rem;
}

.image img {
  width: auto;

  text-align: center !important;
}
</style>
