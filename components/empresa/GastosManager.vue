<template>
  <div>
    <h5>Gastos Fijos de la Empresa</h5>
    <b-table :items="gastos" :fields="fields" striped responsive small>
      <template #cell(monto)="row">
        {{ row.item.monto }} {{ row.item.moneda }}
      </template>
      <template #cell(actions)="row">
        <b-button size="sm" variant="danger" @click="deleteGasto(row.index)">
          <b-icon icon="trash"></b-icon>
        </b-button>
      </template>
    </b-table>

    <hr />

    <h5>Añadir Nuevo Gasto</h5>
    <b-form @submit.prevent="addGasto">
      <b-row>
        <b-col md="6">
          <b-form-group label="Nombre del Gasto:" label-for="gasto-nombre">
            <b-form-input id="gasto-nombre" v-model="newGasto.nombre" required></b-form-input>
          </b-form-group>
        </b-col>
        <b-col md="6">
          <b-form-group label="Descripción:" label-for="gasto-descripcion">
            <b-form-input id="gasto-descripcion" v-model="newGasto.descripcion"></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="3">
          <b-form-group label="Monto:" label-for="gasto-monto">
            <b-form-input id="gasto-monto" v-model.number="newGasto.monto" type="number" step="0.01" required></b-form-input>
          </b-form-group>
        </b-col>
        <b-col md="3">
          <b-form-group label="Moneda:" label-for="gasto-moneda">
            <b-form-select id="gasto-moneda" v-model="newGasto.moneda" :options="monedaOptions" required></b-form-select>
          </b-form-group>
        </b-col>
        <b-col md="3">
          <b-form-group label="Periodicidad:" label-for="gasto-periodicidad">
            <b-form-select id="gasto-periodicidad" v-model="newGasto.periodicidad" :options="optionsPeriodicidad" required></b-form-select>
          </b-form-group>
        </b-col>
        <b-col md="3">
          <b-form-group label="Estatus:" label-for="gasto-estatus">
            <b-form-select id="gasto-estatus" v-model="newGasto.estatus" :options="optionsEstatus" required></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      <b-button type="submit" variant="primary">Añadir Gasto</b-button>
    </b-form>
  </div>
</template>

<script>
export default {
  name: "GastosManager",
  props: {
    monedas: {
      type: Array,
      default: () => [],
    },
    initialGastos: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      gastos: [],
      newGasto: {
        nombre: "",
        descripcion: "",
        monto: 0,
        moneda: null,
        periodicidad: "mensual",
        estatus: "activo",
      },
      fields: [
        { key: "nombre", label: "Nombre" },
        { key: "descripcion", label: "Descripción" },
        { key: "monto", label: "Monto" },
        { key: "periodicidad", label: "Periodicidad" },
        { key: "estatus", label: "Estatus" },
        { key: "actions", label: "Acciones" },
      ],
      optionsPeriodicidad: [
        { value: "mensual", text: "Mensual" },
        { value: "trimestral", text: "Trimestral" },
        { value: "semestral", text: "Semestral" },
        { value: "anual", text: "Anual" },
        { value: "único", text: "Único" },
      ],
      optionsEstatus: [
        { value: "activo", text: "Activo" },
        { value: "inactivo", text: "Inactivo" },
      ],
    };
  },
  computed: {
    monedaOptions() {
      if (!this.monedas || this.monedas.length === 0) return [];
      return this.monedas.map(m => ({ value: m.moneda, text: m.mondeda_nombre }));
    }
  },
  methods: {
    addGasto() {
      // Simple validation
      if (this.newGasto.nombre && this.newGasto.monto > 0 && this.newGasto.moneda) {
        this.gastos.push({ ...this.newGasto });
        // Reset form
        this.newGasto = {
          nombre: "",
          descripcion: "",
          monto: 0,
          moneda: null,
          periodicidad: "mensual",
          estatus: "activo",
        };
        this.emitUpdate();
      }
    },
    deleteGasto(index) {
      this.gastos.splice(index, 1);
      this.emitUpdate();
    },
    emitUpdate() {
      this.$emit("change", this.gastos);
    },
  },
  mounted() {
    // Cargar datos iniciales si existen
    if (this.initialGastos && this.initialGastos.length > 0) {
      this.gastos = [...this.initialGastos];
    }
    this.emitUpdate(); // Emit initial state
  },
};
</script>
