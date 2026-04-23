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
          accessModule.accessData.id_modulo === 2
        "
      >
        <b-container fluid>
          <b-row>
            <b-col>
              <whatsapp-WaInbox />
            </b-col>
          </b-row>
        </b-container>
      </div>
      <div v-else><accessDenied /></div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixin-login.js";

export default {
  mixins: [mixin],
  computed: {
    ...mapState("login", ["dataUser", "access"]),
  },
};
</script>
