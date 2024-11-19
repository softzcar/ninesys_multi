<template>
  <div>
    <b-form-group
      id="input-group-6"
      label="Vincular Orden:"
      label-for="input-access"
    >
      <b-form-select
        id="input-access"
        v-model="vincular"
        :options="options"
        @change="setVinculo"
      >
      </b-form-select>
    </b-form-group>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      vincular: '',
      ordenesActivas: [],
    }
  },

  computed: {
    options() {
      let opt = [{ value: 0, text: 'Ninguna' }]
      let items = this.ordenesActivas.map(function (orden) {
        return {
          value: orden.orden,
          text: orden.orden,
        }
      })
      items.unshift(opt[0])
      return items
    },
  },

  methods: {
    setVinculo() {
      console.log('vinculemos', this.vincular)
      this.$emit('reload', this.vincular)
    },

    async getActivas() {
      this.overlay = true
      await axios
        .get(
          `${this.$config.API}/table/ordenes-activas/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((resp) => {
          this.ordenesActivas = resp.data.items
          this.overlay = false
        })
    },
  },

  mounted() {
    this.getActivas()
  },
}
</script>
