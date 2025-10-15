<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <configuracion-wizard :is-full-config-mode="true" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import ConfiguracionWizard from '~/components/empresa/configuracionWizard.vue'

export default {
  name: 'ConfiguracionEmpresa',
  components: {
    ConfiguracionWizard
  },
  computed: {
    ...mapState("login", ["access"]),
  },
  head() {
    return {
      title: 'Configuración de Empresa - Ninesys'
    }
  }
}
</script>

<style scoped>
/* Estilos específicos para la página si son necesarios */
</style>