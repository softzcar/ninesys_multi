<template>
  <div>
    <b-card
      v-if="
        this.$store.state.login.dataUser.departamento === 'Corte' ||
        this.$store.state.login.dataUser.departamento === 'Administración'
      "
      bg-variant="default"
      header="Control de Material"
      class="text-center mb-4"
    >
      <b-card-text>
        <empleados-AsignacionDeTelas
          :datos="dataInsumos"
          @reload="getDataTable"
        />
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'NinesysTareasPorLotes',

  data() {
    return {}
  },

  mounted() {},

  methods: {},
}
</script>

<style lang="scss" scoped></style>
