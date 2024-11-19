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
            dataUser.departamento === 'Administración'
          "
        >
          <b-row>
            <b-col>
              <h1 class="mb-4">{{ titulo }}</h1>
            </b-col>
          </b-row>
          <produccionsse-control-de-produccion />
        </b-container>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      titulo: 'Control de producción',
    }
  },

  methods: {
    ...mapActions('empleados', ['updateDataTable2']),
  },

  computed: {
    ...mapState('login', ['dataUser', 'access']),
    ...mapState('empleados', ['dataTable2']),
    ...mapGetters('empleados', ['getDataTable2']),
  },

  mounted() {
    let obj = {
      id: 9,
      peso: 12.45,
    }
    console.log('mounted ready', obj)
    this.updateDataTable2(obj)
  },
}
</script>
