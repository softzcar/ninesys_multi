<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="dataUser.departamento === 'Administración'">
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

export default {
  name: 'NuevaTintaPage',
  computed: {
    ...mapState('login', ['dataUser', 'access']),
  },
};
</script>
