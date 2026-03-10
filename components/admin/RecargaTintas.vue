<template>
  <div class="container mt-4">
    <b-overlay :show="loading" spinner-variant="primary" rounded="sm">
      <div v-if="isFormReady">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recarga de Tintas</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitForm">
              <b-row>
                <b-col md="6" lg="4">
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

                <b-col md="6" lg="4">
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

              <!-- Tabla de Niveles de Tinta Actuales -->
              <b-row class="mt-4" v-if="selectedPrinterId">
                <b-col>
                  <label class="font-weight-bold">Estado Actual de Tanques:</label>
                  <div class="table-responsive">
                    <table class="table table-sm table-bordered text-center">
                      <thead class="bg-light">
                        <tr>
                          <th>Color</th>
                          <th>Nivel Actual (ml)</th>
                          <th>Consumo Estimado (ml)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="color in ['C', 'M', 'Y', 'K', 'W']" :key="color" v-if="isColorSupported(color)">
                          <td>
                            <div
                              class="px-2 py-1 rounded font-weight-bold mx-auto"
                              :style="getColorBadgeStyle(color)"
                            >
                              {{ color }}
                            </div>
                          </td>
                          <td class="align-middle font-weight-bold text-info">
                            {{ getInkLevelValue(color, 'tinta_restante_ultima_recarga_ml') }}
                          </td>
                          <td class="align-middle text-muted">
                            {{ getInkLevelValue(color, 'consumo_desde_ultima_recarga_ml') }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </b-col>
              </b-row>

              <!-- Color Detectado (ayuda visual) -->
              <b-row class="mt-3" v-if="selectedSupplyColor">
                <b-col>
                  <div class="form-group">
                    <label>Color Detectado:</label>
                    <div class="d-flex align-items-center">
                      <div
                        class="px-3 py-2 rounded font-weight-bold"
                        :style="{
                          backgroundColor: selectedSupplyColor.bgColor,
                          color: selectedSupplyColor.textColor,
                          border: selectedSupplyColor.border || '1px solid #ccc',
                          minWidth: '100px',
                          textAlign: 'center'
                        }"
                      >
                        {{ selectedSupplyColor.name }}
                      </div>
                      <small class="ml-3 text-muted" v-if="selectedSupply">
                        Stock disponible: <strong>{{ selectedSupply.cantidad }} ml</strong>
                      </small>
                    </div>
                  </div>
                </b-col>
              </b-row>

              <b-row class="mt-3">
                <b-col md="4" lg="3">
                  <b-form-group
                    label="Nivel actual en tanque (ml):"
                    label-for="prevLevel"
                    description="Nivel físico observado antes de la recarga"
                  >
                    <b-form-input
                      id="prevLevel"
                      v-model.number="prevLevel"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>

                <b-col md="4" lg="3">
                  <b-form-group
                    label="Mililitros Recargados:"
                    label-for="milliliters"
                    :state="isQuantityValid"
                    :invalid-feedback="quantityFeedback"
                  >
                    <b-form-input
                      id="milliliters"
                      v-model.number="milliliters"
                      type="number"
                      step="0.1"
                      min="0"
                      :state="isQuantityValid"
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>

              <button type="submit" class="btn btn-primary mt-4" :disabled="!isQuantityValid || !selectedSupplyId">
                Registrar Recarga
              </button>
            </form>
          </div>
        </div>
      </div>
      <div v-else-if="!loading">
        <b-alert show variant="info">
          <h4>Faltan datos de configuración</h4>
          <p>Para continuar, primero debe configurar lo siguiente:</p>
          <ul>
            <li v-if="!impresorasDisponibles">
              No hay impresoras configuradas.
              <router-link to="/impresoras/gestion" class="alert-link"
                >Crear Impresoras</router-link
              >
            </li>
            <li v-if="!tintasDisponibles">
              No hay tintas en el inventario.
              <router-link
                to="/inventario/nueva-tinta"
                custom
                v-slot="{ navigate }"
              >
                <span
                  @click="navigate"
                  @keypress.enter="navigate"
                  role="link"
                  class="alert-link"
                  style="cursor: pointer;"
                >
                  Crear Tintas
                </span>
              </router-link>
            </li>
          </ul>
        </b-alert>
      </div>
    </b-overlay>
  </div>
</template>

<script>
export default {
  name: "RecargaTintas",
  data() {
    return {
      impresoras: [], // Aquí se cargarán las impresoras desde la API
      supplies: [], // Aquí se cargarán los insumos (tintas) desde la API
      loading: true, // Nuevo: para el b-overlay
      selectedPrinterId: "",
      selectedSupplyId: "",
      selectedColor: "",
      selectedPrinterTechnology: null, // Nuevo: para almacenar el tipo de tecnología de la impresora
      milliliters: null,
      prevLevel: null,
      inkLevels: [], // Niveles de tinta de la impresora seleccionada
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
    impresorasDisponibles() {
      return this.impresoras && this.impresoras.length > 0;
    },
    tintasDisponibles() {
      return this.supplies && this.supplies.length > 0;
    },
    isFormReady() {
      return this.impresorasDisponibles && this.tintasDisponibles;
    },
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
          text: `ID: ${supply.id_insumo} - Color: ${supply.color} - ${supply.insumo}`,
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
      } else if (this.selectedPrinterTechnology === 'CMYKW') {
        // Si la tecnología es CMYKW, habilitar todos los colores
        return this.colorOptions.map(option => ({ ...option, disabled: false }));
      }
      // Por defecto, si no hay tecnología definida o no se cumple ninguna condición, deshabilitar todos
      return this.colorOptions.map(option => ({ ...option, disabled: true }));
    },
    selectedSupply() {
      if (!this.selectedSupplyId) return null;
      return this.supplies.find(s => s.id_insumo === this.selectedSupplyId);
    },
    selectedSupplyColor() {
      if (!this.selectedSupply) return null;
      return this.colorOptions.find(c => c.value === this.selectedSupply.color);
    },
    isQuantityValid() {
      if (!this.milliliters) return null;
      if (!this.selectedSupply) return true;
      return this.milliliters <= this.selectedSupply.cantidad;
    },
    quantityFeedback() {
      if (!this.selectedSupply) return "";
      if (this.milliliters > this.selectedSupply.cantidad) {
        return `La cantidad excede el stock disponible (${this.selectedSupply.cantidad} ml).`;
      }
      return "";
    }
  },
  watch: {
    selectedPrinterId(newVal) {
      if (newVal) {
        const selectedPrinter = this.impresoras.find(imp => imp._id === newVal);
        this.selectedPrinterTechnology = selectedPrinter ? selectedPrinter.tipo_tecnologia : null;
        this.fetchInkLevels(newVal);
      } else {
        this.selectedPrinterTechnology = null;
        this.inkLevels = [];
      }
      this.selectedColor = ""; // Limpiar la selección de color al cambiar la impresora
    },
    selectedSupplyId(newVal) {
      if (newVal && this.selectedSupply) {
        this.selectedColor = this.selectedSupply.color;
      } else {
        this.selectedColor = "";
      }
    }
  },
  methods: {
    async getImpresoras() {
      try {
        const resp = await this.$axios.get(`${this.$config.API}/impresoras`);
        this.impresoras = resp.data;
      } catch (error) {
        console.error("Error al obtener impresoras", error);
      }
    },
    async fetchSupplies() {
      try {
        const resp = await this.$axios.get(`${this.$config.API}/inventario-tintas`);
        this.supplies = resp.data;
      } catch (error) {
        console.error('Error al obtener insumos de tinta', error);
      }
    },
    async fetchInkLevels(printerId) {
      try {
        const resp = await this.$axios.get(`${this.$config.API}/impresoras-tintas-actual/${printerId}`);
        this.inkLevels = resp.data;
      } catch (error) {
        console.error('Error al obtener niveles de tinta', error);
      }
    },
    isColorSupported(color) {
      if (color === 'W') return this.selectedPrinterTechnology === 'CMYKW';
      return true;
    },
    getColorBadgeStyle(colorCode) {
      const color = this.colorOptions.find(c => c.value === colorCode);
      if (!color) return {};
      return {
        backgroundColor: color.bgColor,
        color: color.textColor,
        border: color.border || '1px solid transparent',
        width: '40px'
      };
    },
    getInkLevelValue(color, key) {
      const level = this.inkLevels.find(l => l.color === color);
      if (!level) return "0.00";
      return parseFloat(level[key]).toFixed(2);
    },
    async loadInitialData() {
      this.loading = true;
      await Promise.all([this.getImpresoras(), this.fetchSupplies()]);
      this.loading = false;
    },
    submitForm() {
      if (!this.isQuantityValid) return;
      this.postRecargaTinta();
    },
    async postRecargaTinta() {
      try {
        const data = new URLSearchParams();
        data.set("id_impresora", this.selectedPrinterId);
        data.set("id_insumo", this.selectedSupplyId);
        data.set("color", this.selectedColor);
        data.set("mililitros", this.milliliters);
        data.set("nivel_tanque_previo", this.prevLevel);
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
        this.prevLevel = null;

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
    this.loadInitialData();
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
