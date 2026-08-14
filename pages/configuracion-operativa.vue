<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>
    <div v-else>
      <operativa-wizard />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import OperativaWizard from "~/components/empresa/OperativaWizard.vue";

export default {
  name: "ConfiguracionOperativaPage",
  components: { OperativaWizard },
  computed: {
    ...mapState("login", ["access"]),
  },
};
</script>
