<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div
        v-if="
          dataUser.departamento === 'Jefe de diseño' ||
          dataUser.departamento === 'Diseño' ||
          dataUser.departamento === 'Comercialización' ||
          dataUser.departamento === 'Administración'
        "
      >
        <b-container>
          <b-row>
            <b-col>
              <h1 class="mb-4">{{ titulo }}</h1>
              <disenosse-asignados />
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
import { mapState } from 'vuex'

export default {
  data() {
    return {
      titulo: '',
    }
  },
  computed: {
    ...mapState('login', ['dataUser', 'access']),
  },
}
</script>
