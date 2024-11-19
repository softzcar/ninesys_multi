<template>
  <div>
    <span class="floatme"
      ><b-form-input
        :id="item.eliminar"
        type="number"
        min="0"
        step="1"
        v-model="cantidad"
        style="width: 70px"
      ></b-form-input>
    </span>
    <span class="floatme">
      <b-button
        variant="success"
        v-on:click="setCantidad(cantidad, item.id_lote)"
      >
        <b-icon icon="check-lg"></b-icon>
      </b-button>
    </span>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'NinesysEliminarInsumo',

  data() {
    return {
      overlay: true,
      cantidad: null,
    }
  },

  methods: {
    async setCantidad(cantidad, idLote) {
      this.overlay = true

      const data = new URLSearchParams()
      data.set('cantidad', cantidad)
      data.set('id_lote', idLote)

      await axios
        .post(`${this.$config.API}/lotes-fisicos/update`, data)
        .then((res) => {
          // this.urlLink = res.data.linkdrive
        })
        .finally(() => {
          this.overlay = false
        })
    },
  },

  mounted() {
    this.cantidad = this.item.piezas_actuales
    this.overlay = false
  },

  props: ['item'],
}
</script>
