<template>
  <div class="container mt-4">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Recarga de Tintas</h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitForm">
          <b-row>
            <b-col
              md="6"
              lg="4"
            >
              <b-form-group
                label="Seleccionar Impresora:"
                label-for="printerSelect"
              >
                <b-form-select
                  id="printerSelect"
                  v-model="selectedPrinterId"
                  :options="impresorasOptions"
                  required
                ></b-form-select>
              </b-form-group>
            </b-col>

            <b-col
              md="6"
              lg="4"
            >
              <b-form-group
                label="Seleccionar Insumo (Tinta):"
                label-for="supplySelect"
              >
                <b-form-select
                  id="supplySelect"
                  v-model="selectedSupplyId"
                  :options="suppliesOptions"
                  required
                ></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row class="mt-3">
            <b-col>
              <div class="form-group">
                <label>Color de la Tinta:</label>
                <div class="d-flex flex-wrap">
                  <div
                    class="form-check form-check-inline"
                    v-for="colorOption in filteredColorOptions"
                    :key="colorOption.value"
                  >
                    <input
                      class="form-check-input"
                      type="radio"
                      :id="'color-' + colorOption.value"
                      :value="colorOption.value"
                      v-model="selectedColor"
                      :disabled="colorOption.disabled"
                      required
                    />
                    <label
                      class="form-check-label px-2 py-1 rounded"
                      :for="'color-' + colorOption.value"
                      :style="{ backgroundColor: colorOption.bgColor, color: colorOption.textColor, border: colorOption.border || '' }"
                    >
                      {{ colorOption.name }}
                    </label>
                  </div>
                </div>
              </div>
            </b-col>
          </b-row>

          <b-row class="mt-3">
            <b-col
              md="4"
              lg="3"
            >
              <b-form-group
                label="Mililitros Recargados:"
                label-for="milliliters"
              >
                <b-form-input
                  id="milliliters"
                  v-model.number="milliliters"
                  type="number"
                  step="0.1"
                  min="0"
                  required
                ></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>

          <button
            type="submit"
            class="btn btn-primary mt-4"
          >Registrar Recarga</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RecargaTintas",
  data() {
    return {
      impresoras: [], // Aquí se cargarán las impresoras desde la API
      supplies: [], // Aquí se cargarán los insumos (tintas) desde la API
      selectedPrinterId: "",
      selectedSupplyId: "",
      selectedColor: "",
      selectedPrinterTechnology: null, // Nuevo: para almacenar el tipo de tecnología de la impresora
      milliliters: null,
      colorOptions: [
        {
          name: "Cyan",
          text: "Cyan",
          value: "C",
          bgColor: "#00FFFF",
          textColor: "#000000",
        },
        {
          name: "Magenta",
          text: "Magenta",
          value: "M",
          bgColor: "#FF00FF",
          textColor: "#000000",
        },
        {
          name: "Yellow",
          text: "Yellow",
          value: "Y",
          bgColor: "#FFFF00",
          textColor: "#000000",
        },
        {
          name: "Black",
          text: "Black",
          value: "K",
          bgColor: "#000000",
          textColor: "#FFFFFF",
        },
        {
          name: "White",
          text: "White",
          value: "W",
          bgColor: "#FFFFFF",
          textColor: "#000000",
          border: "1px solid #ccc",
        }, // Añadir borde para visibilidad
      ],
    };
  },
  computed: {
    impresorasOptions() {
      console.log("impresoras prop in impresorasOptions:", this.impresoras);
      if (!this.impresoras || this.impresoras.length === 0) {
        return [{ value: null, text: "No hay impresoras disponibles" }];
      }
      let options = this.impresoras.map((imp) => {
        return {
          value: imp._id,
          text: `${imp.codigo_interno} - ${imp.marca} ${imp.modelo}`,
          tipo_tecnologia: imp.tipo_tecnologia, // Añadir tipo_tecnologia aquí
        };
      });
      options.unshift({ value: null, text: "Seleccione una impresora" });
      return options;
    },
    suppliesOptions() {
      if (!this.supplies || this.supplies.length === 0) {
        return [{ value: null, text: "No hay insumos disponibles" }];
      }
      let options = this.supplies.map((supply) => {
        return {
          value: supply.id_insumo,
          text: `ID: ${supply.id_insumo} - Color: ${supply.color}`,
        };
      });
      options.unshift({ value: null, text: "Seleccione un insumo" });
      return options;
    },
    filteredColorOptions() {
      // Si no hay impresora seleccionada o la tecnología es CMYK, deshabilitar 'White'
      if (!this.selectedPrinterId || this.selectedPrinterTechnology === 'CMYK') {
        return this.colorOptions.map(option => ({
          ...option,
          disabled: option.value === 'W' || !this.selectedPrinterId // Deshabilitar 'W' o todos si no hay impresora seleccionada
        }));
      } else if (this.selectedPrinterTechnology === 'CMYK+W') {
        // Si la tecnología es CMYK+W, habilitar todos los colores
        return this.colorOptions.map(option => ({ ...option, disabled: false }));
      }
      // Por defecto, si no hay tecnología definida o no se cumple ninguna condición, deshabilitar todos
      return this.colorOptions.map(option => ({ ...option, disabled: true }));
    }
  },
  watch: {
    selectedPrinterId(newVal) {
      if (newVal) {
        const selectedPrinter = this.impresoras.find(imp => imp._id === newVal);
        this.selectedPrinterTechnology = selectedPrinter ? selectedPrinter.tipo_tecnologia : null;
      } else {
        this.selectedPrinterTechnology = null;
      }
      this.selectedColor = ""; // Limpiar la selección de color al cambiar la impresora
    }
  },
  methods: {
    async getImpresoras() {
      await this.$axios.get(`${this.$config.API}/impresoras`).then((resp) => {
        console.log("respuesta de impresoras", resp);
        this.impresoras = resp.data;
      });
    },
    async fetchSupplies() {
      await this.$axios.get(`${this.$config.API}/inventario-tintas`).then((resp) => {
        console.log('respuesta de insumos de tinta', resp);
        this.supplies = resp.data;
      });
    },
    submitForm() {
      this.postRecargaTinta();
    },
    async postRecargaTinta() {
      try {
        const data = new URLSearchParams();
        data.set("id_impresora", this.selectedPrinterId);
        data.set("id_insumo", this.selectedSupplyId);
        data.set("color", this.selectedColor);
        data.set("mililitros", this.milliliters);
        data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);

        const response = await this.$axios.post(`${this.$config.API}/inventario-tintas`, data);
        
        console.log('Respuesta de la API:', response.data);
        this.$emit('recarga-exitosa');
        this.$fire({
          title: "Recarga Exitosa",
          html: `<p>La recarga de tinta ha sido registrada con éxito.</p>`,
          type: "success",
        });
        
        this.fetchSupplies();
        
        // Reset form
        this.selectedPrinterId = null;
        this.selectedSupplyId = null;
        this.selectedColor = "";
        this.milliliters = null;

      } catch (error) {
        console.error("Error al registrar la recarga:", error);
        this.$fire({
          title: "Error al Registrar",
          html: `<p>Hubo un problema al registrar la recarga. Revise la consola para más detalles.</p>`,
          type: "error",
        });
      }
    },
  },
  created() {
    this.getImpresoras();
    this.fetchSupplies();
  },
};
</script>

<style scoped>
/* Estilos específicos para este componente */
.form-check-label {
  min-width: 60px; /* Asegura un ancho mínimo para los labels de color */
  text-align: center;
  border: 1px solid transparent; /* Borde por defecto para todos los colores */
}
/* Estilo específico para el color blanco para que sea visible */
.form-check-label[for="color-W"] {
  border: 1px solid #ccc;
}
</style>
