<template>
  <div>
    <h5>Tasas del día</h5>
    <b-form v-if="activeMonedas.length">
      <b-form-group
        v-for="moneda in activeMonedas"
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
    <div v-else>
      <p>No hay monedas activas configuradas.</p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "FormMonedas",
  computed: {
    ...mapState("login", ["tasas"]),
    activeMonedas() {
      const tipos = this.$store.state.login.dataEmpresa.tipos_de_monedas || [];
      // Filtramos las monedas activas y excluimos el dólar para que no se muestre en el formulario
      return tipos.filter((m) => m.activo && m.moneda !== "dolar");
    },
  },
  methods: {
    updateTasa(moneda, valor) {
      const valorNumerico = parseFloat(valor) || 0;
      this.$store.commit("login/setTasa", { moneda, valor: valorNumerico });
    },
  },
};
</script>