<template>
  <div>
    <b-overlay spinner-small>
      <b-button :variant="variant">
        <b-icon-hdd-rack-fill></b-icon-hdd-rack-fill>
        <!-- <pre>{{ item }}</pre>
                <pre>{{ datos }}</pre> -->
      </b-button>
    </b-overlay>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      variant: 'secondary',
      response: [],
    }
  },

  methods: {
    async getInfo() {
      this.overlay = true
      await axios
        .get(`${this.$config.API}/inventario/historial/${this.item.id_orden}`)
        .then((resp) => {
          this.response = resp.data
          console.log('response', resp.data.items)
          this.overlay = false
        })
    },
  },

  mounted() {
    this.getInfo().then(() => {
      // let exist = this.response.filter( item => item.)
    })
  },

  props: ['item', 'datos'],
}
</script>
