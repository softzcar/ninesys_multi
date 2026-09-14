<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="accessModule.accessData.id_modulo === 1">
        <admin-ReporteCostosProductos />
      </div>

      <div v-else>
        <b-container>
          <b-row class="text-center vh-100" align-v="center">
            <b-col>
              <b-alert variant="danger" show>
                <h1>No tienes permisos para acceder a este reporte.</h1>
              </b-alert>
            </b-col>
          </b-row>
        </b-container>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import accessModuleMixin from "~/mixins/mixin-login.js";
export default {
  mixins: [accessModuleMixin],
  computed: { ...mapState("login", ["dataUser", "access"]) },
};
</script>
