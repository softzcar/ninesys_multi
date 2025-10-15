<template>
  <div>
    <h5>Tasas del día</h5>
    <b-form v-if="currencyConfigState === 'SHOW_FORM'">
      <b-form-group
        v-for="moneda in additionalActiveMonedas"
        :key="moneda.moneda"
        :label="moneda.mondeda_nombre"
      >
        <b-form-input
          type="number"
          step="0.01"
          :value="tasas[moneda.moneda]"
          @input="updateTasa(moneda.moneda, $event)"
          class="mb-2"
        />
      </b-form-group>
    </b-form>
    <div v-else-if="currencyConfigState === 'ONLY_BASE_CURRENCY'">
      <p><strong>No hay monedas adicionales configuradas, los precios se manejan solamente en dólares.</strong></p>
    </div>
    <div v-else>
      <p>Debe configurar las monedas para poder continuar.</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  name: "FormMonedas",
  computed: {
    ...mapState("login", ["tasas"]),
    ...mapGetters("login", ["additionalActiveMonedas", "currencyConfigState"]),
  },
  methods: {
    updateTasa(moneda, valor) {
      const valorNumerico = parseFloat(valor) || 0;
      this.$store.commit("login/setTasa", { moneda, valor: valorNumerico });
    },
  },
};
</script>