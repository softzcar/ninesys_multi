<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-button v-on:click="terminar" variant="primary">TERMINAR</b-button>
    </b-overlay>
  </div>
</template>
<script>
export default {
  data() {
    return {
      overlay: false,
      id_empleado: this.$store.state.login.dataUser._id,
    }
  },
  computed: {
    myDesigns() {
      return this.$store.state.disenos.disenosEmpleado
    },
    // ...mapState("login", ["dataUser"]),
  },

  methods: {
    async putTerminar() {
      console.log(`inicio de putTerminar`)
      await fetch(
        `${this.$config.API}/disenos/close/${this.id}/${this.$store.state.login.dataUser.id_empleado}`,
        {
          method: 'PUT',
        }
      )
        .then((res) => res.json())
        .then((res) => {
          console.log(`Hemos terminado...`)
          this.$emit('reload', 'true')
          return res
        })
        .catch((err) => {
          alert(`Ocurrió un error al conectarse a internet: ${err}`)
        })
        .catch(() => {
          return false
        })
        .finally(() => {
          this.laoding = false
          return true
        })
    },
    terminar() {
      this.$confirm(
        `¿Desea terminar el diseño de la orden Nro ${this.id} ?`,
        'Terminar Orden',
        'info'
      )
        .then(() => {
          this.overlay = true
          this.putTerminar().then(() => {
            this.$store
              .dispatch(
                'disenos/getDisenosEmpleado',
                this.$store.state.login.dataUser._id
              )
              .then(() => (this.overlay = false))
          })
        })
        .catch(() => {
          return false
        })

      // return false
      /* if (confirm('¿Desea terminar este Diseño?')) {
        await fetch(
          `${this.$config.API}/disenos/close/${this.id}/${this.dataUser._id}`,
          {
            method: 'PUT',
          }
        )
          .then((res) => res.json())
          .then((res) => {
            this.$store.dispatch(
              'disenos/gerDisenosEmpleado',
              this.id_empleado
            )
            return res
          })
          .catch((err) => {
            alert(`Ocurrió un error al conectarse a internet: ${err}`)
          })
          .finally(() => {
            this.laoding = false
            return true
          })
      } */
    },
  },

  props: ['id'],
}
</script>
