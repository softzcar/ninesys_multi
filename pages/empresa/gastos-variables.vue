<template>
  <div>
    <div v-if="!access"><login-form /></div>
    <div v-else>
      <menus-MenuLoader />
      <div v-if="accessModule.accessData.id_modulo === 1">
        <admin-GastosVariables />
      </div>
      <div v-else>
        <b-container>
          <b-row class="text-center vh-100" align-v="center">
            <b-col>
              <b-alert variant="danger" show><h1>No tienes permisos para acceder a este módulo.</h1></b-alert>
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
  name: 'EmpresaGastosVariables',
  mixins: [accessModuleMixin],
  computed: { ...mapState("login", ["dataUser", "access"]) },
  head() { return { title: 'Gastos Variables - Ninesys' } }
};
</script>
