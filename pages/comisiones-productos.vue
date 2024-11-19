<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="dataUser.departamento === 'Administración'">
        <admin-ComisionesProductos />
      </div>

      <div v-else>
        <b-container>
          <b-row class="text-center vh-100" align-v="center">
            <b-col>
              <b-alert variant="danger" show>
                <h1>Este módulo no existe</h1>
              </b-alert>
            </b-col>
          </b-row>
        </b-container>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('login', ['dataUser', 'access']),
  },
}
</script>
