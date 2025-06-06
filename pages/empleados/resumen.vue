<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div
        v-if="
          accessModule.accessData.id_modulo === 1 ||
          accessModule.accessData.id_modulo === 3 ||
          accessModule.accessData.id_modulo === 4 ||
          accessModule.accessData.id_modulo === 6 
        "
      >
        <b-overlay :show="overlay" spinner-small>
          <b-container fluid>
            <b-row>
              <b-col>
                <!-- <h3>aqui estoy</h3> -->
                <h2 class="mb-4 mt-4 text-center">{{ titulo }}</h2>
                <produccionsse-asignacionDeCorteGrupal />
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      titulo: 'Resumen',
      overlay: true,
    }
  },
  computed: {
    ...mapState('login', ['dataUser', 'access']),
  },

  mounted() {
    this.overlay = false

    /* this.getEmpleados().then(() => {
      console.log('data', this.dataTable)
      this.overlay = false
    }) */
  },
}
</script>
