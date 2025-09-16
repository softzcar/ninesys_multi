<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <!-- Check for 'Administración' module ID (assuming id_modulo === 1) -->
      <div v-if="accessModule.accessData.id_modulo === 1">
        <b-container>
          <b-row>
            <b-col>
              <LazyEmpleadosReporteEficienciaEmpleados />
            </b-col>
          </b-row>
        </b-container>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import mixinLogin from '~/mixins/mixin-login.js'
import { mapState } from 'vuex'
import LoginForm from '~/components/login/form.vue'
import AccessDenied from '~/components/accessDenied.vue'
import MenuLoader from '~/components/menus/MenuLoader.vue'

export default {
  middleware: 'auth',
  mixins: [mixinLogin],
  computed: {
    ...mapState('login', ['access', 'dataUser']),
  },
  components: {
    LoginForm,
    AccessDenied,
    MenuLoader,
  },
  head() {
    return {
      title: 'Reporte de Eficiencia de Empleados'
    }
  }
}
</script>
