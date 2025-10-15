<template>
  <div>
    <h5>Monedas Activas</h5>
    <b-table :items="currencies" :fields="fields" striped responsive small>
      <template #cell(actions)="row">
        <b-button
          size="sm"
          variant="danger"
          @click="deleteCurrency(row.index)"
          :disabled="row.item.isFixed"
        >
          <b-icon icon="trash"></b-icon>
        </b-button>
      </template>
    </b-table>

    <hr />

    <h5>Añadir Nueva Moneda</h5>
    <b-form @submit.prevent="addCurrency">
      <b-row>
        <b-col md="10">
          <b-form-group label="Nombre Completo (ej: Peso Colombiano):" label-for="new-moneda-nombre">
            <b-form-input
              id="new-moneda-nombre"
              v-model="newCurrency.mondeda_nombre"
              required
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col md="2" class="d-flex align-items-end">
          <b-button type="submit" variant="primary">Añadir</b-button>
        </b-col>
      </b-row>
    </b-form>
  </div>
</template>

<script>
export default {
  name: "MonedasManager",
  props: {
    initialCurrencies: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currencies: [],
      newCurrency: {
        moneda: "",
        mondeda_nombre: "",
      },
      fields: [
        { key: "mondeda_nombre", label: "Nombre" },
        { key: "moneda", label: "Identificador" },
        { key: "actions", label: "Acciones" },
      ],
    };
  },
  methods: {
    addCurrency() {
      if (this.newCurrency.moneda && this.newCurrency.mondeda_nombre) {
        this.currencies.push({
          ...this.newCurrency,
          activo: true,
        });
        // Limpiar el formulario
        this.newCurrency.moneda = "";
        this.newCurrency.mondeda_nombre = "";
        this.emitUpdate();
      }
    },
    deleteCurrency(index) {
      // Doble chequeo para no borrar el item fijo
      if (this.currencies[index] && !this.currencies[index].isFixed) {
        this.currencies.splice(index, 1);
        this.emitUpdate();
      }
    },
    emitUpdate() {
      // Emitir la lista de monedas sin la propiedad interna 'isFixed'
      const currenciesToEmit = this.currencies.map(({ isFixed, ...rest }) => rest);
      this.$emit("change", currenciesToEmit);
    },
  },
  watch: {
    'newCurrency.mondeda_nombre'(newValue) {
      if (newValue) {
        this.newCurrency.moneda = this.generateSlug(newValue);
      } else {
        this.newCurrency.moneda = '';
      }
    }
  },
  methods: {
    generateSlug(text) {
      return text
        .toString()
        .normalize('NFD') // Normalizar a forma descompuesta (para separar acentos de letras)
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
        .replace(/[^\w-]+/g, '') // Eliminar caracteres no alfanuméricos (excepto _)
        .replace(/--+/g, '-'); // Reemplazar múltiples guiones bajos con uno solo
    },
    addCurrency() {
      if (this.newCurrency.moneda && this.newCurrency.mondeda_nombre) {
        this.currencies.push({
          ...this.newCurrency,
          activo: true,
        });
        // Limpiar el formulario
        this.newCurrency.moneda = "";
        this.newCurrency.mondeda_nombre = "";
        this.emitUpdate();
      }
    },
    deleteCurrency(index) {
      // Doble chequeo para no borrar el item fijo
      if (this.currencies[index] && !this.currencies[index].isFixed) {
        this.currencies.splice(index, 1);
        this.emitUpdate();
      }
    },
    emitUpdate() {
      // Emitir la lista de monedas sin la propiedad interna 'isFixed'
      const currenciesToEmit = this.currencies.map(({ isFixed, ...rest }) => rest);
      this.$emit("change", currenciesToEmit);
    },
  },
  mounted() {
    // Inicializar con datos del prop o valores por defecto
    if (this.initialCurrencies && this.initialCurrencies.length > 0) {
      this.currencies = this.initialCurrencies.map(currency => ({
        ...currency,
        isFixed: currency.moneda === 'dolar' // Marcar dólar como fijo si existe
      }));
    } else {
      // Valores por defecto si no hay datos iniciales
      this.currencies = [
        {
          moneda: "dolar",
          mondeda_nombre: "Dólar",
          activo: true,
          isFixed: true,
        },
      ];
    }
    // Emitir el estado inicial al cargar
    this.emitUpdate();
  }
};
</script>
