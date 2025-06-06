<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div
        v-if="
           accessModule.accessData.id_modulo === 2 ||
          accessModule.accessData.id_modulo === 1
        "
      >
        <b-container
          fluid
          v-if="
            accessModule.accessData.id_modulo === 2 ||
            accessModule.accessData.id_modulo === 1
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
import mixinLogin from '~/mixins/mixin-login.js'
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
  mixins: [mixin, mixinLogin],
}
</script>
