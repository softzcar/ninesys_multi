<template>
  <div>
    <pre>itemfather::: {{ itemfather }}</pre>
    <b-overlay class="floatme" :show="overlay" spinner-small>
      <b-row>
        <b-col>
          <div class="my-private-input floatme">
            <b-input-group>
              <!-- <template #prepend>
                <b-input-group-text>Gr</b-input-group-text>
              </template> -->
              <span class="floatme">
                <b-form-input
                  :disabled="disableControl"
                  type="number"
                  step="0.1"
                  v-model="value"
                  style="max-width: 65px !important"
                ></b-form-input>
              </span>
              <span class="floatme">
                <b-button
                  :disabled="disableControl"
                  class="floatme"
                  variant="success"
                  @click="updateCantidad"
                  ><b-icon-check-lg></b-icon-check-lg
                ></b-button>
              </span>
            </b-input-group>
          </div>
          <div class="floatme ml-2"></div>
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      value: null,
      idInsumo: this.item._id,
      overlay: false,
      disableControl: false,
    }
  },

  mounted() {
    this.value = 0
  },

  methods: {
    async guardarPiezasCortadas() {
      this.overlay = true

      const data = new URLSearchParams()
      data.set('id_orden', this.itemfather.id_orden)
      data.set('id_inventario', this.item._id)
      data.set('id_ordenes_productos', this.itemfather.id_ordenes_productos)
      data.set('id_empleado', this.$store.state.login.dataUser.id_empleado)
      data.set('peso', parseFloat(this.value).toFixed(2))

      await axios
        .post(
          `${this.$config.API}/inventario-movimientos/piezas-cortadas`,
          data
        )
        .then((res) => {
          this.disableControl = true
          console.log('Respuesta de crear nuevo movimienot de incventario', res)
        })
        .catch((err) => {
          this.$fire({
            title: 'Error',
            html: `<p>Ocurió un error al guardar el registro.</p><p>${err}</p>`,
            type: 'danger',
          })
        })
        .finally(() => (this.overlay = false))
    },

    updateCantidad() {
      if (this.value == 0) {
        this.$fire({
          title: 'Monto Cero',
          html: `<p>El peso de las piezas no puede ser cero.</p>`,
          type: 'warning',
        })
      } else {
        this.$confirm(
          `Confirme el peso de la piezas: ${this.value} Gramos?`,
          'Insumos',
          'info'
        )
          .then(() => {
            this.guardarPiezasCortadas()
            // alert('enviemos los datos!!!')
          })
          .catch(() => {
            this.value = 0
            return false
          })
      }
    },
  },

  props: ['item', 'itemfather', 'index', 'reload', 'tipo'],
}
</script>

<style scoped>
.my-private-input {
  margin: 0 auto;
  width: 150px !important;
}
</style>
