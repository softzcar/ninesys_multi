<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="accessModule.accessData.id_modulo === 1 || accessModule.accessData.id_modulo === 5">
        <InventarioInsumoNuevoTinta />
      </div>
      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import accessModuleMixin from '~/mixins/mixin-login.js';

export default {
  name: 'NuevaTintaPage',
  mixins: [accessModuleMixin],
  computed: {
    ...mapState('login', ['dataUser', 'access']),
  },
};
</script>
