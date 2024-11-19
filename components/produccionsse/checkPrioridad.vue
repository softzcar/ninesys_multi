<template>
  <b-form-checkbox
    v-model="checked"
    name="check-button"
    @change="changeProridad"
    switch
  >
    <b>{{ prTxt }}</b>
  </b-form-checkbox>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      overlay: true,
      pr: 0,
      prTxt: 'normal',
      checked: false, // false => Mormal | true => Prioridad Alta
    }
  },

  methods: {
    checkPrioridad() {
      if (this.checked === true) {
        this.pr = 1
        this.prTxt = 'Urgente'
      } else {
        this.pr = 0
        this.prTxt = 'Normal'
      }
    },

    changeProridad() {
      this.overlay = true
      this.checkPrioridad()

      const data = new URLSearchParams()
      data.set('prioridad', this.pr)
      data.set('id', this.id)

      console.log('pr', this.checked)

      axios
        .post(`${this.$config.API}/lotes/update/prioridad`, data)
        .then((res) => {
          this.overlay = false
        })
        .catch((err) => {
          tshi.$fire({
            type: 'error',
            title: 'Error',
            html: `Error al actualizar la prioridad del lote: ${err}`,
          })
          this.overlay = false
        })
    },
  },

  mounted() {
    this.pr = parseInt(this.prioridad)

    if (this.pr) {
      ;(this.checked = true), (this.prTxt = 'Urgente')
    } else {
      ;(this.checked = false), (this.prTxt = 'Normal')
    }
    this.overlay = false
  },

  props: ['id', 'prioridad'],
}
</script>
