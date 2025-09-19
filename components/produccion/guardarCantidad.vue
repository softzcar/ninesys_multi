<template>
  <div style="width: 85px">
    <!-- <h5>Cantidad a producir {{ cantidadProduccion }} para el registo id: {{ id }}</h5> -->
    <b-overlay :show="overlay" spinner-small>
      <b-input v-model="cantidad" type="number" @change="changeCantidad" />
    </b-overlay>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      // cantidad: this.cantidadProduccion,
      overlay: false,
      cantidad: 0,
    }
  },

  methods: {
    changeCantidad() {
      this.overlay = true
      const data = new URLSearchParams()
      data.set('cantidad', this.cantidad)
      data.set('id', this.id)

      axios
        .post(`${this.$config.API}/lotes/update/cantidad`, data)
        .then((res) => {
          this.$emit('reload', true)
          this.overlay = false
        })
        .catch((err) => {
          this.$fire({
            title: 'Error',
            type: 'error',
            html: `Error al actaulizar la cantidad del lote: ${err}`,
          })
        })
      }
  },


  mounted() {
    this.cantidad = this.cantidadLote
  },

  props: ['id', 'cantidadLote'],
}
</script>
