<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="
          accessModule.accessData.id_modulo === 5 ||
          accessModule.accessData.id_modulo === 2 ||
          accessModule.accessData.id_modulo === 1
        ">
        <b-container
          fluid
          v-if="
            accessModule.accessData.id_modulo === 5 ||
            accessModule.accessData.id_modulo === 2 ||
            accessModule.accessData.id_modulo === 1
          "
        >
          <b-row>
            <b-col>
              <h1 class="mb-4">{{ titulo }}</h1>
              <produccionsse-ordenesTodas />
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
import { mapState } from "vuex";
import mixin from "~/mixins/mixin-login.js";

export default {
  mixins: [mixin],

  data() {
    return {
      titulo: "Todas las Ordenes",
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),
  },
};
</script>
