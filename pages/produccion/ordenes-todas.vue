<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div
        v-if="
          dataUser.departamento === 'Producción' ||
          dataUser.departamento === 'Administración'
        "
      >
        <b-container
          fluid
          v-if="
            this.dataUser.departamento === 'Producción' ||
            this.dataUser.departamento === 'Comercialización' ||
            dataUser.departamento === 'Administración'
          "
        >
          <b-row>
            <b-col>
              <h1 class="mb-4">{{ titulo }}</h1>
              <produccionsse-ordenesTodas />
            </b-col>
          </b-row>
        </b-container>
      </div>

      <div v-else><accessDenied /></div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      titulo: 'Todas las Ordenes',
    }
  },
  computed: {
    ...mapState('login', ['dataUser', 'access']),
  },
}
</script>
