<template>
  <div>
    <!-- Verificación de Acceso del Usuario -->
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      
      <!-- Restricción por Departamento -->
      <div v-if="dataUser.departamento === 'Administración' || dataUser.departamento === 'Producción'">
        <b-overlay :show="overlay" spinner-variant="info" rounded="sm">
          <b-container fluid class="mt-4 px-md-5 pb-5">
            
            <!-- Encabezado de la Página con Diseño Premium -->
            <b-row class="mb-4 align-items-center">
              <b-col md="8">
                <h2 class="text-info font-weight-bold mb-1 d-flex align-items-center">
                  <b-icon icon="droplet-fill" class="mr-2 text-info animate-pulse" />
                  Reporte de Tintas en Inventario
                </h2>
                <p class="text-muted mb-0">Consulte el estado físico, clasificaciones de catálogo, nivel volumétrico y valorizado de las tintas disponibles.</p>
              </b-col>
              <b-col md="4" class="text-md-right mt-3 mt-md-0">
                <b-button variant="outline-info" class="shadow-sm font-weight-bold px-3 mr-2" @click="fetchData">
                  <b-icon icon="arrow-clockwise" class="mr-1" /> Actualizar
                </b-button>
              </b-col>
            </b-row>

            <!-- Tarjetas KPI de Métricas Consolidadas (Estilo Glassmorphism) -->
            <b-row class="mb-4">
              <!-- Litros en Stock -->
              <b-col sm="12" md="4" class="mb-3 mb-md-0">
                <b-card class="border-0 shadow-sm bg-gradient-info text-white h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 class="text-white-50 font-weight-bold text-uppercase mb-1" style="font-size: 0.8rem;">Volumen Total en Stock</h6>
                      <h3 class="mb-0 font-weight-bold">{{ totalLiters }} Lts</h3>
                    </div>
                    <b-icon icon="funnel-fill" size="lg" class="text-white-50" />
                  </div>
                  <div class="mt-3 text-white-50 small">
                    Basado en botellas físicas activas
                  </div>
                </b-card>
              </b-col>

              <!-- Inversión Total -->
              <b-col sm="12" md="4" class="mb-3 mb-md-0">
                <b-card class="border-0 shadow-sm bg-gradient-success text-white h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 class="text-white-50 font-weight-bold text-uppercase mb-1" style="font-size: 0.8rem;">Inversión en Inventario</h6>
                      <h3 class="mb-0 font-weight-bold">{{ moneyFormatter(totalInvestment) }}</h3>
                    </div>
                    <b-icon icon="cash" size="lg" class="text-white-50" />
                  </div>
                  <div class="mt-3 text-white-50 small">
                    Valor total de botellas registradas
                  </div>
                </b-card>
              </b-col>

              <!-- Tipos de Tinta -->
              <b-col sm="12" md="4">
                <b-card class="border-0 shadow-sm bg-gradient-dark text-white h-100" style="background-color: #2b3035;">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 class="text-white-50 font-weight-bold text-uppercase mb-1" style="font-size: 0.8rem;">Categorías Activas</h6>
                      <h3 class="mb-0 font-weight-bold">{{ activeCategoriesCount }} Tipos</h3>
                    </div>
                    <b-icon icon="tags-fill" size="lg" class="text-white-50" />
                  </div>
                  <div class="mt-3 text-white-50 small">
                    Clasificaciones únicas presentes
                  </div>
                </b-card>
              </b-col>
            </b-row>

            <!-- Panel de Búsqueda y Filtros de Catálogo -->
            <b-card class="shadow-sm border-0 mb-4 bg-light">
              <b-row class="align-items-center">
                <!-- Buscador de Texto -->
                <b-col md="8" class="mb-3 mb-md-0">
                  <label for="search-input" class="font-weight-bold text-muted small text-uppercase mb-2 d-block">Búsqueda Rápida de Tintas</label>
                  <b-input-group>
                    <b-input-group-prepend is-text class="bg-white border-right-0 text-muted">
                      <b-icon icon="search" />
                    </b-input-group-prepend>
                    <b-form-input
                      id="search-input"
                      v-model="filterText"
                      placeholder="Buscar por insumo, SKU o ID..."
                      class="border-left-0 bg-white"
                    />
                    <b-input-group-append v-if="filterText">
                      <b-button @click="filterText = ''" variant="outline-secondary">Limpiar</b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-col>

                <!-- Botones de Acción de Filtro -->
                <b-col md="4" class="text-md-right mt-md-4">
                  <b-button
                    variant="outline-secondary"
                    class="font-weight-bold px-3 w-100"
                    :disabled="!filterText && !selectedTintaCatalog"
                    @click="resetFilters"
                  >
                    <b-icon icon="x-circle" class="mr-1" /> Reestablecer Filtros
                  </b-button>
                </b-col>
              </b-row>

              <!-- Filtro de Categorías con Botones Horizontales Segmentados -->
              <b-row class="mt-3">
                <b-col cols="12">
                  <hr class="my-3" style="border-top: 1px solid #e2e8f0;" />
                  <label class="font-weight-bold text-muted small text-uppercase mb-2 d-block">Filtrar por Categoría de Tinta:</label>
                  <div class="d-flex flex-wrap">
                    <b-form-radio-group
                      id="btn-radios-categories"
                      v-model="selectedTintaCatalog"
                      :options="catalogOptions"
                      button-variant="outline-info"
                      size="md"
                      name="radio-btn-categories"
                      buttons
                      class="segmented-buttons flex-wrap"
                    />
                  </div>
                </b-col>
              </b-row>
            </b-card>

            <!-- Alerta informativa si no hay datos -->
            <b-alert v-if="filteredInks.length === 0 && !overlay" show variant="warning" class="border-0 shadow-sm">
              <h5 class="alert-heading font-weight-bold mb-1">
                <b-icon icon="exclamation-triangle-fill" class="mr-2" />
                Sin resultados
              </h5>
              <p class="mb-0">No se encontraron botellas de tintas activas que coincidan con los filtros seleccionados.</p>
            </b-alert>

            <!-- Tabla de Reporte de Tintas -->
            <b-row v-else>
              <b-col>
                <div class="table-responsive bg-white shadow-sm rounded border overflow-hidden">
                  <b-table
                    hover
                    striped
                    show-empty
                    :items="filteredInks"
                    :fields="fields"
                    class="mb-0"
                    empty-text="No hay registros de tintas disponibles"
                  >
                    <!-- Columna: Insumo -->
                    <template #cell(insumo)="row">
                      <div>
                        <span class="font-weight-bold text-dark d-block mb-0">{{ row.item.insumo }}</span>
                        <small class="text-muted font-weight-bold">ID Insumo: #{{ row.item.id_insumo }}</small>
                      </div>
                    </template>

                    <!-- Columna: SKU -->
                    <template #cell(sku)="row">
                      <span class="badge badge-light p-2 font-mono font-weight-bold text-secondary border">
                        {{ row.item.sku }}
                      </span>
                    </template>

                    <!-- Columna: Color -->
                    <template #cell(color)="row">
                      <div class="d-flex justify-content-center">
                        <div
                          class="ink-badge font-weight-bold shadow-sm"
                          :class="'ink-' + (row.item.color ? row.item.color.toLowerCase() : 'w')"
                          style="min-width: 85px; padding: 0.35rem 0.6rem; border-radius: 4px;"
                        >
                          {{ getColorName(row.item.color) }}
                        </div>
                      </div>
                    </template>

                    <!-- Columna: Tipo de Tinta (Catálogo) -->
                    <template #cell(tipo_tinta)="row">
                      <span class="text-dark font-weight-bold">
                        {{ row.item.tipo_tinta || 'Sin Clasificar' }}
                      </span>
                    </template>

                    <!-- Columna: Cantidad (Volumen) con Barra de Progreso Dinámica -->
                    <template #cell(cantidad)="row">
                      <div style="min-width: 140px;">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <span class="font-weight-bold text-info" style="font-size: 0.9rem;">
                            {{ formatNumber(row.item.cantidad) }} ml
                          </span>
                          <span class="text-muted small">Max: 1000ml</span>
                        </div>
                        <b-progress
                          height="10px"
                          :value="row.item.cantidad"
                          :max="1000"
                          class="shadow-sm border rounded bg-light"
                          :style="getProgressStyle(row.item.color)"
                        />
                      </div>
                    </template>

                    <!-- Columna: Costo -->
                    <template #cell(costo)="row">
                      <span class="font-weight-bold text-success" style="font-size: 0.95rem;">
                        {{ moneyFormatter(row.item.costo) }}
                      </span>
                    </template>
                  </b-table>
                </div>

                <!-- Footer del reporte con conteo dinámico -->
                <div class="mt-3 text-right text-muted small px-2">
                  Mostrando <strong>{{ filteredInks.length }}</strong> de <strong>{{ inkList.length }}</strong> botellas de tintas cargadas.
                </div>
              </b-col>
            </b-row>

          </b-container>
        </b-overlay>
      </div>

      <!-- Denegación de Acceso -->
      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixins.js";

export default {
  name: "ReporteTintasPage",
  mixins: [mixin],
  
  data() {
    return {
      overlay: false,
      inkList: [],
      tintaCatalog: [],
      filterText: "",
      selectedTintaCatalog: null,
      
      fields: [
        { key: "insumo", label: "Insumo / Descripción", sortable: true, thClass: "bg-light text-dark", tdClass: "align-middle" },
        { key: "sku", label: "SKU", sortable: true, thClass: "bg-light text-dark text-center", tdClass: "align-middle text-center" },
        { key: "color", label: "Color de la Tinta", sortable: true, thClass: "bg-light text-dark text-center", tdClass: "align-middle text-center" },
        { key: "tipo_tinta", label: "Tipo de Tinta", sortable: true, thClass: "bg-light text-dark", tdClass: "align-middle" },
        { key: "cantidad", label: "Cantidad Restante", sortable: true, thClass: "bg-light text-dark", tdClass: "align-middle" },
        { key: "costo", label: "Costo Botella", sortable: true, thClass: "bg-light text-dark", tdClass: "align-middle text-right", class: "text-right" }
      ]
    };
  },

  computed: {
    ...mapState("login", ["dataUser", "access"]),

    // Opciones para el selector de tipos de tinta (Catálogo) generadas dinámicamente
    catalogOptions() {
      if (!this.inkList || this.inkList.length === 0) {
        return [{ text: "Todas", value: null }];
      }
      
      const categoriesMap = new Map();
      this.inkList.forEach(ink => {
        if (ink.id_catalogo_tintas && ink.tipo_tinta) {
          categoriesMap.set(ink.id_catalogo_tintas, ink.tipo_tinta);
        }
      });

      const parsedCategories = Array.from(categoriesMap.entries()).map(([id, name]) => {
        return { text: name, value: id };
      });

      // Ordenar alfabéticamente
      parsedCategories.sort((a, b) => a.text.localeCompare(b.text));

      return [
        { text: "Todas", value: null },
        ...parsedCategories
      ];
    },

    // Filtrado reactivo en el frontend por texto de búsqueda y clasificación
    filteredInks() {
      return this.inkList.filter(ink => {
        // Filtro por Catálogo de Tintas
        if (this.selectedTintaCatalog && ink.id_catalogo_tintas !== this.selectedTintaCatalog) {
          return false;
        }

        // Filtro de Búsqueda Textual
        if (this.filterText.trim()) {
          const search = this.filterText.toLowerCase().trim();
          const matchesName = ink.insumo && ink.insumo.toLowerCase().includes(search);
          const matchesSku = ink.sku && ink.sku.toLowerCase().includes(search);
          const matchesId = ink.id_insumo && String(ink.id_insumo).includes(search);
          return matchesName || matchesSku || matchesId;
        }

        return true;
      });
    },

    // KPI: Volumen Total en Stock en Litros
    totalLiters() {
      const sumMl = this.filteredInks.reduce((acc, ink) => acc + (parseFloat(ink.cantidad) || 0), 0);
      return this.formatNumber(sumMl / 1000);
    },

    // KPI: Inversión en Inventario Total
    totalInvestment() {
      return this.filteredInks.reduce((acc, ink) => acc + (parseFloat(ink.costo) || 0), 0);
    },

    // KPI: Conteo de Tipos de Tinta únicos en la lista actual
    activeCategoriesCount() {
      const categories = this.filteredInks.map(ink => ink.id_catalogo_tintas).filter(Boolean);
      return new Set(categories).size;
    }
  },

  methods: {
    // Carga unificada de datos desde la API
    async fetchData() {
      this.overlay = true;
      try {
        const [inksResponse, catalogResponse] = await Promise.all([
          this.$axios.get(`${this.$config.API}/inventario-tintas`),
          this.$axios.get(`${this.$config.API}/catalogo-tintas`)
        ]);

        this.inkList = inksResponse.data || [];
        this.tintaCatalog = catalogResponse.data.data || [];
      } catch (error) {
        console.error("Error al obtener los datos de tintas del inventario:", error);
        this.$fire({
          title: "Error de Conexión",
          html: `<p>No se pudo cargar la información del inventario de tintas.</p><p>${error.message}</p>`,
          type: "error"
        });
      } finally {
        this.overlay = false;
      }
    },

    // Restablece todos los filtros a sus valores predeterminados
    resetFilters() {
      this.filterText = "";
      this.selectedTintaCatalog = null;
    },

    // Nombre completo del color a partir de la inicial estándar
    getColorName(colorKey) {
      if (!colorKey) return "Sin color";
      const names = {
        'C': 'Cyan',
        'M': 'Magenta',
        'Y': 'Yellow',
        'K': 'Black',
        'W': 'White'
      };
      return names[colorKey.toUpperCase()] || colorKey;
    },

    // Retorna estilos de fondo dinámicos personalizados para la barra de progreso
    getProgressStyle(colorKey) {
      if (!colorKey) return '';
      const colors = {
        'C': '#00bcd4', // Cyan
        'M': '#e91e63', // Magenta
        'Y': '#fbc02d', // Yellow
        'K': '#212121', // Black
        'W': '#9e9e9e'  // White (representado en gris suave)
      };
      const color = colors[colorKey.toUpperCase()] || '#17a2b8';
      return {
        '--progress-bar-bg': color
      };
    }
  },

  created() {
    this.fetchData();
  },

  head() {
    return {
      title: "Reporte de Tintas - Gestión de Inventario",
      meta: [
        { hid: "description", name: "description", content: "Consulte el estado volumétrico y clasificaciones del inventario de tintas para los equipos de impresión." }
      ]
    };
  }
};
</script>

<style scoped>
/* Transición elegante para el icono al refrescar */
.animate-pulse {
  transition: transform 0.3s ease;
}
.animate-pulse:hover {
  transform: rotate(30deg) scale(1.1);
}

/* Tipografía de tipo monoespacio para SKU */
.font-mono {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.85rem;
}

/* Gradientes elegantes y premium para las tarjetas KPI */
.bg-gradient-info {
  background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%);
}
.bg-gradient-success {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
}
.bg-gradient-dark {
  background: linear-gradient(135deg, #343a40 0%, #212529 100%);
}

/* Anulamos e inyectamos el color dinámico del CSS variable de Bootstrap en la barra de progreso */
::v-deep .progress-bar {
  background-color: var(--progress-bar-bg, #17a2b8) !important;
  transition: width 0.6s ease;
}
</style>
