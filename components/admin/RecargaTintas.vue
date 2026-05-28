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

                <b-col md="6" lg="8">
                  <b-form-group
                    label="Insumo (Tinta):"
                    label-for="supplyAutocomplete"
                  >
                    <!-- Chip de selección activa -->
                    <div v-if="selectedSupply" class="supply-chip mb-2">
                      <span
                        class="ink-badge mr-2"
                        :class="'ink-' + (selectedSupply.color ? selectedSupply.color.toLowerCase() : 'k')"
                      >
                        {{ selectedSupply.color || '?' }}
                      </span>
                      <span class="supply-chip-text">
                        <strong>ID {{ selectedSupply.id_insumo }}</strong>
                        · SKU: {{ selectedSupply.sku || 'N/A' }}
                        · {{ selectedSupply.insumo }}
                        · <em>Stock: {{ selectedSupply.cantidad }} ml</em>
                      </span>
                      <button
                        type="button"
                        class="supply-chip-clear"
                        @click="clearSupplySelection"
                        title="Limpiar selección"
                      >
                        ✕
                      </button>
                    </div>

                    <!-- Input de búsqueda con autocomplete -->
                    <div v-else class="supply-autocomplete" ref="autocompleteWrapper">
                      <div class="supply-search-box">
                        <span class="supply-search-icon">🔍</span>
                        <input
                          id="supplyAutocomplete"
                          ref="supplyInput"
                          v-model="supplyFilterText"
                          type="text"
                          class="supply-search-input"
                          placeholder="Escribe ID, SKU o Nombre para buscar tinta..."
                          autocomplete="off"
                          @focus="showDropdown = true"
                          @blur="onInputBlur"
                          @keydown.down.prevent="moveHighlight(1)"
                          @keydown.up.prevent="moveHighlight(-1)"
                          @keydown.enter.prevent="selectHighlighted"
                          @keydown.esc="closeDropdown"
                        />
                        <span
                          v-if="supplyFilterText"
                          class="supply-search-clear"
                          @mousedown.prevent="supplyFilterText = ''"
                        >
                          &times;
                        </span>
                      </div>

                      <!-- Dropdown de resultados -->
                      <div v-if="showDropdown && supplyFilterText.trim().length > 0" class="supply-dropdown">
                        <template v-if="filteredSupplies.length > 0">
                          <div
                            v-for="(item, idx) in filteredSupplies"
                            :key="item.id_insumo"
                            class="supply-dropdown-item"
                            :class="{ 'is-highlighted': idx === highlightIndex }"
                            @mousedown.prevent="selectSupply(item)"
                          >
                            <span
                              class="ink-badge flex-shrink-0"
                              :class="'ink-' + (item.color ? item.color.toLowerCase() : 'k')"
                            >
                              {{ item.color || '?' }}
                            </span>
                            <div class="supply-dropdown-info">
                              <span class="supply-dropdown-name">{{ item.insumo }}</span>
                              <span class="supply-dropdown-meta">
                                ID: {{ item.id_insumo }} · SKU: {{ item.sku || 'N/A' }} · Stock: {{ item.cantidad }} ml
                              </span>
                            </div>
                          </div>
                        </template>
                        <div v-else class="supply-dropdown-empty">
                          Sin resultados para "{{ supplyFilterText }}"
                        </div>
                      </div>
                    </div>

                    <!-- Campo oculto para validación del formulario -->
                    <input type="hidden" :value="selectedSupplyId" required />
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
                              class="ink-badge mx-auto"
                              :class="'ink-' + color.toLowerCase()"
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
                        v-if="selectedSupplyColor"
                        class="ink-badge font-weight-bold"
                        :class="'ink-' + selectedSupplyColor.value.toLowerCase()"
                        style="min-width: 100px; padding: 0.5rem 1rem;"
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
                    label-for="prevLevel"
                    description="Nivel físico observado antes de la recarga"
                  >
                    <template #label>
                      <span>Nivel actual en tanque (ml):</span>
                      <b-button
                        v-b-modal.modal-ayuda-medicion
                        variant="link"
                        class="p-0 ml-1 text-info"
                        title="Ver guía de medición"
                      >
                        <b-icon-question-circle-fill></b-icon-question-circle-fill>
                      </b-button>
                    </template>
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
    <!-- Modal de Ayuda para Medición -->
    <b-modal
      id="modal-ayuda-medicion"
      title="Guía de Medición de Tinta"
      ok-only
      ok-title="Entendido"
      centered
      size="md"
    >
      <div class="text-center">
        <p class="text-left mb-3">
          Utiliza una cinta métrica pegada al lateral del tanque para determinar el nivel actual en mililitros (ml) según la escala visual.
        </p>
        <img
          src="/img/guia-medicion-tinta.jpg"
          alt="Guía de Medición"
          class="img-fluid rounded border shadow-sm"
          style="max-height: 500px;"
        />
        <p class="mt-3 text-muted small">
          * Asegúrate de tomar la medida en una superficie plana para mayor precisión.
        </p>
      </div>
    </b-modal>
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
      supplyFilterText: "", // Buscador reactivo para el autocomplete
      showDropdown: false,
      highlightIndex: -1,
      selectedPrinterId: "",
      selectedSupplyId: "",
      selectedColor: "",
      selectedPrinterTechnology: null, // Nuevo: para almacenar el tipo de tecnología de la impresora
      milliliters: null,
      prevLevel: null,
      inkLevels: [], // Niveles de tinta de la impresora seleccionada
      colorOptions: [
        { name: "Cyan", value: "C" },
        { name: "Magenta", value: "M" },
        { name: "Yellow", value: "Y" },
        { name: "Black", value: "K" },
        { name: "White", value: "W" },
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
    filteredSupplies() {
      if (!this.supplies || this.supplies.length === 0) return [];
      const query = this.supplyFilterText.toLowerCase().trim();
      if (!query) return [];
      return this.supplies.filter(s => {
        const idStr = s.id_insumo ? String(s.id_insumo).toLowerCase() : "";
        const skuStr = s.sku ? String(s.sku).toLowerCase() : "";
        const insumoStr = s.insumo ? String(s.insumo).toLowerCase() : "";
        const colorStr = s.color ? String(s.color).toLowerCase() : "";
        
        return idStr.includes(query) || 
               skuStr.includes(query) || 
               insumoStr.includes(query) || 
               colorStr === query;
      }).slice(0, 10); // Límite de 10 resultados para que no sea inmenso
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
    },
    supplyFilterText(newVal) {
      this.highlightIndex = -1;
      this.showDropdown = true;
    }
  },
  methods: {
    selectSupply(item) {
      this.selectedSupplyId = item.id_insumo;
      this.supplyFilterText = "";
      this.showDropdown = false;
      this.highlightIndex = -1;
    },
    clearSupplySelection() {
      this.selectedSupplyId = "";
      this.selectedColor = "";
      this.supplyFilterText = "";
      this.showDropdown = false;
      this.$nextTick(() => {
        if (this.$refs.supplyInput) this.$refs.supplyInput.focus();
      });
    },
    onInputBlur() {
      // Usar setTimeout para permitir que el evento mousedown del item se ejecute antes de cerrar
      setTimeout(() => {
        this.showDropdown = false;
      }, 200);
    },
    closeDropdown() {
      this.showDropdown = false;
      this.highlightIndex = -1;
    },
    moveHighlight(direction) {
      const len = this.filteredSupplies.length;
      if (len === 0) return;
      this.highlightIndex = (this.highlightIndex + direction + len) % len;
    },
    selectHighlighted() {
      if (this.highlightIndex >= 0 && this.filteredSupplies[this.highlightIndex]) {
        this.selectSupply(this.filteredSupplies[this.highlightIndex]);
      }
    },
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

/* ===== Autocomplete de Insumos ===== */
.supply-autocomplete {
  position: relative;
  width: 100%;
}

.supply-search-box {
  display: flex;
  align-items: center;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: #fff;
  padding: 0 10px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
.supply-search-box:focus-within {
  border-color: #80bdff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}
.supply-search-icon {
  font-size: 14px;
  margin-right: 6px;
  color: #6c757d;
  pointer-events: none;
}
.supply-search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px 0;
  font-size: 14px;
  background: transparent;
  min-width: 0;
  color: #495057;
}
.supply-search-clear {
  cursor: pointer;
  font-size: 18px;
  color: #adb5bd;
  line-height: 1;
  padding: 0 2px;
  user-select: none;
  transition: color 0.15s;
}
.supply-search-clear:hover {
  color: #495057;
}

.supply-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1050;
  max-height: 320px;
  overflow-y: auto;
}

.supply-dropdown-hint,
.supply-dropdown-empty {
  padding: 14px 16px;
  color: #6c757d;
  font-size: 13px;
  text-align: center;
}

.supply-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s ease-in-out;
  border-bottom: 1px solid #f1f3f5;
}
.supply-dropdown-item:last-child {
  border-bottom: none;
}
.supply-dropdown-item:hover,
.supply-dropdown-item.is-highlighted {
  background: #e9f3ff;
}

.supply-dropdown-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.supply-dropdown-name {
  font-weight: 600;
  font-size: 14px;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.supply-dropdown-meta {
  font-size: 12px;
  color: #6c757d;
  margin-top: 2px;
}

/* Chip de selección activa */
.supply-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f7ff;
  border: 1px solid #cce3fd;
  border-radius: 8px;
  padding: 10px 14px;
  transition: all 0.2s ease-in-out;
}
.supply-chip-text {
  flex: 1;
  font-size: 13px;
  color: #212529;
  min-width: 0;
  line-height: 1.4;
}
.supply-chip-clear {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6c757d;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
}
.supply-chip-clear:hover {
  background: #fce4e4;
  color: #dc3545;
}
</style>
