<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-form-select
        v-model="emp"
        :options="options"
        @change="saveChange(idorden, emp)"
        :value="emp"
      ></b-form-select>
    </b-overlay>
  </div>
</template>

<script>
export default {
  data() {
    return {
      overlay: false,
      emp: this.idempleado,
    }
  },

  methods: {
    empleadoSelected() {
      return this.empleado
    },

    saveChange(id_orden, emp) {
      this.overlay = true
      this.putDisenador(id_orden, emp).then(() => {
        this.overlay = false
      })
    },

    async putDisenador(id_orden, empleado) {
      this.loading = true
      await fetch(`${this.$config.API}/disenos/asign/${id_orden}/${empleado}`, {
        method: 'PUT',
      })
        .then((res) => res.json())
        .then((res) => {
          this.$store.dispatch('disenos/getDisenos')
          console.log(`Hemos asignado el diseñador`, res)
        })
        .catch((err) => {
          this.$store.dispatch('disenos/getDisenos')
          alert(`El diseñador nno se ha podido actualizar ${err}`)
          console.log(err)
        })
        .finally(() => {
          this.loading = false
          console.log(`Terminada la asignación del diseñador`)
          return true
        })
    },
  },

  props: ['idorden', 'options', 'idempleado'],
}
</script>
