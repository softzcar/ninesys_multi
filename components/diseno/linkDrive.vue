<template>
  <div>
    <b-button variant="primary" @click="$bvModal.show(modal)">
      <b-icon icon="link45deg"></b-icon>
    </b-button>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-overlay :show="overlay" spinner-small>
        <p>
          <!-- <pre>{{ item }}</pre> -->
        </p>
        <b-container>
          <b-row>
            <b-col>
              <b-form-input class="mb-3" type="url" v-model="urlLink" @change="updateLink"></b-form-input>
              <div class="text-center">
                <a :href="urlLink" target="_blank">Abrir documentos</a>
              </div>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      size: 'lg',
      title: 'Link a archivos',
      overlay: true,
      imageWidth: '100%',
      urlLink: '',
    }
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)
      return `modal-${rand}`
    },
  },

  methods: {
    async getLink() {
      this.overlay = true
      await axios
        .get(`${this.$config.API}/disenos/link/${this.item.linkdrive}`)
        .then((resp) => {
          this.urlLink = resp.data.linkdrive
          this.overlay = false
        })
    },

    async updateLink() {
      this.overlay = true
      const data = new URLSearchParams()
      data.set('url', this.urlLink)
      data.set('id', this.item.linkdrive)

      await axios.post(`${this.$config.API}/disenos/link`, data).then((res) => {
        this.overlay = false
        // this.urlLink = res.data.linkdrive
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

  props: ['item'],

  mounted() {
    this.getLink()
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
}
</style>
