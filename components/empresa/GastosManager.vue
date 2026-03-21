<template>
  <div>
    <h5>Gastos Fijos de la Empresa</h5>
    <b-table :items="gastos" :fields="fields" striped responsive small>
      <template #cell(monto)="row">
        {{ row.item.monto }} {{ row.item.moneda }}
      </template>
      <template #cell(actions)="row">
         <b-button size="sm" variant="primary" class="mr-1" @click="editGasto(row.index)">
          <b-icon icon="pencil"></b-icon>
        </b-button>
        <b-button size="sm" variant="danger" @click="deleteGasto(row.index)">
          <b-icon icon="trash"></b-icon>
        </b-button>
      </template>
    </b-table>

    <hr />

    <h5>{{ isEditing ? 'Editar Gasto' : 'Añadir Nuevo Gasto' }}</h5>
    <b-form @submit.prevent="saveGasto">
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
      <b-button type="submit" :variant="isEditing ? 'success' : 'primary'">
         {{ isEditing ? 'Actualizar Gasto' : 'Añadir Gasto' }}
      </b-button>
      <b-button v-if="isEditing" variant="secondary" @click="cancelEdit">Cancelar</b-button>
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
      isEditing: false,
      editIndex: null,
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
    async saveGasto() {
      // Simple validation
      if (this.newGasto.nombre && this.newGasto.monto > 0 && this.newGasto.moneda) {
        try {
          const payload = new URLSearchParams();
          for (const key in this.newGasto) {
            if (this.newGasto[key] !== null && key !== '_id') {
              payload.append(key, this.newGasto[key]);
            }
          }

          if (this.isEditing) {
            // Update
            await this.$axios.put(`${this.$config.API}/gastos/${this.newGasto._id}`, payload);
            this.$set(this.gastos, this.editIndex, { ...this.newGasto });
          } else {
            // Create
            const { data } = await this.$axios.post(`${this.$config.API}/gastos`, payload);
            // Si la API devuelve el objeto con el ID (_id), lo usamos.
            this.gastos.push({ ...this.newGasto, _id: data._id || data.id });
          }
          
          this.resetForm();
          this.emitUpdate();
        } catch (error) {
          console.error("Error al guardar el gasto:", error);
          alert("No se pudo guardar el gasto. Por favor intente de nuevo.");
        }
      }
    },
    editGasto(index) {
      this.isEditing = true;
      this.editIndex = index;
      this.newGasto = { ...this.gastos[index] };
    },
    cancelEdit() {
      this.resetForm();
    },
    resetForm() {
       this.newGasto = {
        nombre: "",
        descripcion: "",
        monto: 0,
        moneda: null,
        periodicidad: "mensual",
        estatus: "activo",
      };
      this.isEditing = false;
      this.editIndex = null;
    },
    async deleteGasto(index) {
      const gasto = this.gastos[index];
      if (!gasto._id && !gasto.id) {
          this.gastos.splice(index, 1);
          this.emitUpdate();
          return;
      }
      
      try {
        await this.$axios.delete(`${this.$config.API}/gastos/${gasto._id || gasto.id}`);
        this.gastos.splice(index, 1);
        this.emitUpdate();
      } catch (error) {
        console.error("Error al eliminar el gasto:", error);
        alert("No se pudo eliminar el gasto.");
      }
    },
    emitUpdate() {
      this.$emit("change", this.gastos);
    },
  },
  mounted() {
    // Cargar datos iniciales si existen
    if (this.initialGastos) {
      this.gastos = [...this.initialGastos];
    }
    this.emitUpdate(); // Emit initial state
  },
  watch: {
    initialGastos: {
      handler(newVal) {
        if (newVal) {
          this.gastos = [...newVal];
        }
      },
      deep: true
    }
  }
};
</script>
