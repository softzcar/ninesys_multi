<template>
  <div>
    <!-- <pre>{{ item }}</pre> -->
    <b-overlay :show="overlay" spinner-small>
      <b-form-input
        type="number"
        v-model="value"
        @change="updateCantidad"
      ></b-form-input>
    </b-overlay>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      value: this.item.cantidad,
      idInsumo: this.item._id,
      overlay: false,
    }
  },

  methods: {
    async updateCantidad() {
      this.overlay = true

      const data = new URLSearchParams()
      data.set('cantidad', this.value)
      data.set('id_insumo', this.idInsumo)
      data.set('id_orden', this.item.id_orden)
      data.set('empleado', this.empleado)
      // TODO cargar id del registro para la tabla inventario_movimientos

      await axios
        .post(`${this.$config.API}/inventario-movimientos/update-insumo`, data)
        .then((res) => {
          this.overlay = false
        })
    },
  },

  props: ['cantidad', 'item', 'empleado', 'lock'],
}
</script>
