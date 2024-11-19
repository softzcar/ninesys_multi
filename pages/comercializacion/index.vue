<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="dataUser.departamento === 'Comercialización' ||
        dataUser.departamento === 'Administración'
        ">
        <div v-if="this.dataUser.departamento === 'Comercialización'">
          <b-container>
            <b-row>
              <b-col>
                <h1 class="mb-4">{{ titulo }}</h1>
              </b-col>
            </b-row>
          </b-container>

          <ordenes-nueva />
        </div>
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
      titulo: 'Nueva Orden',
    }
  },
  computed: {
    ...mapState('login', ['dataUser', 'access']),
  },
}
</script>
