<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-button :variant="variant" @click="changeStatus()">
        <b-icon-asterisk></b-icon-asterisk>
      </b-button>
    </b-overlay>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      overlay: false,
      variant: '',
      verify: null,
      prioridad: this.item.prioridad,
    }
  },

  watch: {
    verify(val) {
      if (val) {
        this.variant = 'danger'
        this.prioridad = '1'
      } else {
        this.variant = 'secondary'
        this.prioridad = '0'
      }
      /* this.updatePrioridad().then(() => {
        console.log('actualizados los datos a prioridad', this.prioridad)
      }) */
    },
  },

  methods: {
    async updatePrioridad() {
      this.overlay = true

      const data = new URLSearchParams()
      data.set('id', this.item.orden)
      data.set('prioridad', this.prioridad)

      await axios
        .post(
          `${this.$config.API}/inventario-movimientos/update-prioridad`,
          data
        )
        .then((res) => {
          // this.resetForm()
          // this.$bvModal.hide(this.modal)
        })
        .then(() => (this.overlay = false))
    },

    changeStatus() {
      if (this.prioridad == '1') {
        this.prioridad = '0'
        this.variant = 'secondary'
      } else {
        this.prioridad = '1'
        this.variant = 'danger'

      }
      this.updatePrioridad()
      // this.verify = !this.verify
    },
  },

  mounted() {
    if (this.item.prioridad === '0') {
      this.variant = 'secondary'
      this.verify = false
    } else {
      this.variant = 'danger'
      this.verify = true
    }
  },

  props: ['item'],
}
</script>
