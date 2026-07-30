<template>
  <div>
    <monedas-manager @loaded="onLoaded" />

    <div class="text-right mt-4" v-if="showSaveButton">
      <b-button type="button" variant="primary" @click="save">Confirmar</b-button>
    </div>
  </div>
</template>

<script>
import MonedasManager from "./MonedasManager.vue";

export default {
  name: "ConfigMonedasForm",
  components: {
    MonedasManager
  },
  props: {
    showSaveButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      monedasActuales: []
    };
  },
  methods: {
    onLoaded(monedas) {
      this.monedasActuales = monedas || [];
    },
    // MonedasManager persiste cada alta/baja directamente contra la API (Fase 5
    // del rediseño de monedas) -- este método ya no guarda nada, solo valida
    // que la empresa tenga al menos una moneda configurada antes de avanzar.
    async save() {
      if (!this.monedasActuales || this.monedasActuales.length === 0) {
        this.$fire({
          title: "Datos Incompletos",
          html: "Debe tener al menos una moneda configurada.",
          type: "warning",
        });
        return false;
      }

      this.$emit('saved', this.monedasActuales);
      return true;
    }
  }
};
</script>
