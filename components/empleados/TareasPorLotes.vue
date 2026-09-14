<template>
  <div>
    <b-card
      v-if="
        this.$store.getters['login/currentDepartamentTipo'] === 'corte' ||
        this.accessModule.accessData.id_modulo === 1
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
import accessModuleMixin from "~/mixins/mixin-login.js"

export default {
  name: 'NinesysTareasPorLotes',

  mixins: [accessModuleMixin],

  data() {
    return {}
  },

  mounted() {},

  methods: {},
}
</script>

<style lang="scss" scoped></style>
