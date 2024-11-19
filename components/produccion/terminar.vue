<template>
  <div>
    <b-button variant="success" id="show-btn" @click="$bvModal.show(modal)"
      ><b-icon-check2-all></b-icon-check2-all
    ></b-button>

    <b-modal :id="modal" hide-footer>
      <template #modal-title> Terminar Proceso De Producción </template>
      <b-form @submit="onSubmit" v-if="show" class="text-center">
        <h3 class="mb-4">
          Va a terminar el proceso de fabricación de la orden Nro {{ id }}.
        </h3>
        <b-alert show :variant="variant" v-if="showMsg">{{ msg }}</b-alert>

        <b-button type="submit" variant="success" class="mt-4, mb-3"
          >TERMINAR</b-button
        >
        <!-- <b-button type="reset" variant="danger">Reset</b-button> -->
      </b-form>
      <!-- <b-button class="mt-3" block @click="$bvModal.hide('bv-modal-example')"
        >Cerrar</b-button
      > -->
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      variant: '',
      showPriceError: false,
      show: true,
      showMsg: false,
      msg: '',
      form: {
        product: '',
        price: 0.0,
      },
    }
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)

      return `modal-${rand}`
    },
  },

  methods: {
    onSubmit(event) {
      event.preventDefault()
      this.finish()
    },

    async finish() {
      await fetch(`${this.$config.API}/produccion/terminar/${this.id}`, {
        method: 'POST',
      })
        .then((res) => {
          // recargar tabla
          this.$nuxt.$emit('reloadPorcentaje')
          this.variant = 'success'
          this.msg = `la orden ha sido terminada.`
        })
        .catch((err) => {
          this.variant = 'danger'
          this.msg = `Algo salió mal en la terminación de la orden ${err}`
          console.log(err)
        })
        .finally(() => {
          console.log(`orden terminada`)
          this.showMsg = true
          return true
        })
    },
  },

  props: ['id', 'reload'],
}
</script>
