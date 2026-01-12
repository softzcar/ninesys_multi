<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <!-- Si es Administración (1) o Comercialización (2) -->
      <div v-if="accessModule.accessData.id_modulo === 2 ||
        accessModule.accessData.id_modulo === 1
        ">
        <!-- Dashboard con gráficos -->
        <comercializacion-DashboardComercializacion />
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import mixin from '~/mixins/mixins.js'
import mixinLogin from '~/mixins/mixin-login.js'
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('login', ['access', 'dataUser']),
  },
  mixins: [mixin, mixinLogin],
}
</script>


