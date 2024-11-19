<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div
        v-if="
          dataUser.departamento === 'Comercialización' ||
          dataUser.departamento === 'Administración'
        "
      >
        <b-container
          fluid
          v-if="
            this.dataUser.departamento === 'Comercialización' ||
            dataUser.departamento === 'Administración'
          "
        >
          <b-row>
            <b-col>
              <h1 class="mb-4">{{ titulo }}</h1>
              <ordenes-activas />
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
import mixin from '~/mixins/mixins.js'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      titulo: 'Comercialización',
    }
  },
  computed: {
    ...mapState('login', ['access', 'dataUser']),
  },
  mixins: [mixin],
}
</script>
