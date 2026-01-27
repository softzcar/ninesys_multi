<template>
  <div>
    <!-- El botón ahora se alimenta de las propiedades computadas reactivas -->
    <b-button :variant="variant" @click="$bvModal.show(modal)">
      {{ textButton }}
    </b-button>

    <b-modal :id="modal" :title="title" hide-footer size="xl" @show="handleModalShowInternal"
      @hide="$emit('modal-hidden')">
      <b-overlay :show="isLoading" spinner-small>
        <!-- El contenido del modal ahora depende de 'ordenReactiva' y 'textList' -->
        <div v-if="ordenReactiva">
          <div class="d-flex align-items-center mb-4 mt-2">
            <link-search :id="textList.idOrden" :progreso="textList.status" class="mr-3" />
            <h3>
              <b-badge :variant="ordenReactiva.variant">
                LA ORDEN {{ textList.idOrden }} ESTÁ
                {{ ordenReactiva.variant_text }}
              </b-badge>
            </h3>
          </div>

          <!-- BULLET GRAPH SECTION -->
          <div v-if="reporteData" class="mb-4 p-3 border rounded bg-light">
            <h5 class="mb-3">Eficiencia de Producción (Tiempo Real vs Proyectado)</h5>

            <div class="d-flex justify-content-between mb-1">
              <span><strong>Tiempo Real:</strong> {{ formatSeconds(reporteData.tiempo_total_segundos) }}</span>
              <span><strong>Meta (Proyectado):</strong> {{ formatSeconds(reporteData.tiempo_proyectado_segundos)
                }}</span>
            </div>

            <!-- Bullet Graph Container -->
            <div class="position-relative" style="height: 40px; background-color: #e9ecef; border-radius: 4px;">

              <!-- Background Zones (Optional, simplified to just grey for now) -->

              <!-- Actual Value Bar -->
              <div class="position-absolute h-100" :class="bulletGraphColor"
                :style="{ width: bulletGraphBarWidth + '%' }"
                style="border-radius: 4px 0 0 4px; transition: width 0.5s ease;"></div>

              <!-- Projected Value Marker -->
              <div class="position-absolute h-100" style="width: 4px; background-color: #000; z-index: 10;"
                :style="{ left: bulletGraphMarkerPosition + '%' }"></div>

            </div>

            <div class="d-flex justify-content-between mt-1 text-muted small">
              <span>0s</span>
              <span v-if="bulletGraphMax > 0">{{ formatSeconds(bulletGraphMax) }}</span>
            </div>
          </div>
          <div v-else-if="isLoadingReport" class="text-center mb-4">
            <b-spinner small label="Cargando reporte..."></b-spinner> Calculando eficiencia...
          </div>
          <!-- END BULLET GRAPH SECTION -->

          <!-- INPUT EFFICIENCY SECTION -->
          <div v-if="inputEfficiencyData && inputEfficiencyData.length > 0" class="mb-4 p-3 border rounded bg-light">
            <h5 class="mb-3">Eficiencia de Insumos</h5>
            <b-table-lite small striped hover :items="inputEfficiencyData" :fields="[
              { key: 'nombre_insumo', label: 'Insumo' },
              { key: 'cantidad_estandar', label: 'Meta', formatter: (val, key, item) => `${parseFloat(val).toFixed(2)} ${item.unidad}` },
              {
                key: 'cantidad_real',
                label: 'Real',
                formatter: (val, key, item) => {
                  let value = parseFloat(val);
                  const yieldVal = parseFloat(item.rendimiento || 0);
                  // Convertir Kilos a Metros si aplica rendimiento y la unidad destino es Metros
                  if (yieldVal > 0 && ['Mt', 'Mts', 'mts', 'mt'].includes(item.unidad)) {
                    value = value * yieldVal;
                  }
                  return `${value.toFixed(2)} ${item.unidad}`;
                }
              },
              {
                key: 'eficiencia', label: 'Eficiencia', formatter: (val, key, item) => {
                  const est = parseFloat(item.cantidad_estandar);
                  let real = parseFloat(item.cantidad_real);
                  const yieldVal = parseFloat(item.rendimiento || 0);

                  // Misma lógica de conversión para el cálculo de eficiencia
                  if (yieldVal > 0 && ['Mt', 'Mts', 'mts', 'mt'].includes(item.unidad)) {
                    real = real * yieldVal;
                  }

                  if (est === 0) return 'N/A';
                  if (real === 0) return '0.0%';
                  const eff = ((est / real) * 100).toFixed(1);
                  return `${eff}%`;
                }
              }
            ]">
              <template #cell(eficiencia)="data">
                <div class="d-flex align-items-center justify-content-between">
                  <b-badge
                    :variant="(parseFloat(data.item.cantidad_real) * ((parseFloat(data.item.rendimiento || 0) > 0 && ['Mt', 'Mts', 'mts', 'mt'].includes(data.item.unidad)) ? parseFloat(data.item.rendimiento) : 1)) > parseFloat(data.item.cantidad_estandar) ? 'danger' : 'success'">
                    {{ data.value }}
                  </b-badge>

                  <div class="d-flex">
                    <!-- Componente Asignación Insumos (Botón incluido + Modal Interno) -->
                    <div v-if="productInfo && catalogsLoaded" class="mr-1">
                      <admin-AsignacionDeInsumosAProductos :item="productInfo" :departamentos="departamentos"
                        :selectinsumos="selectInsumos" :insumosasignados="insumosAsignados"
                        :tiemposprod="tiemposProduccion" :idprod="productInfo.cod" @reload="handleAsignacionReload" />
                    </div>
                    <!-- Spinner mientras cargan catálogos (opcional, o solo ocultar botón) -->

                    <!-- Integración del modal de consumo -->
                    <inventario-ConsumoMaterialModal v-if="data.item.id_insumo" :idInsumo="data.item.id_insumo"
                      :nombreInsumo="data.item.nombre_insumo" @reload="fetchManufacturingReport" size="sm" />
                  </div>
                </div>
              </template>
            </b-table-lite>
          </div>
          <!-- END INPUT EFFICIENCY SECTION -->

          <b-list-group>
            <b-list-group-item :variant="ordenReactiva.variant">
              <strong>Fecha Entrega Original:</strong>
              <!-- Etiqueta cambiada para mayor claridad -->
              <span v-html="textList.fechaEntrega"></span>
            </b-list-group-item>

            <b-list-group-item :variant="ordenReactiva.variant">
              <strong>Entrega Estimada (Final):</strong>
              <!-- Etiqueta cambiada para mayor claridad -->
              {{ textList.fechaEntregaEstimada }}
            </b-list-group-item>

            <b-list-group-item :variant="ordenReactiva.variant">
              <strong>Tiempo Total Estimado:</strong>
              {{ textList.tiempoEstimado }}
            </b-list-group-item>

            <b-list-group-item :variant="ordenReactiva.variant">
              <strong>Tiempo Restante:</strong>
              {{ textList.tiempoRestante }}
            </b-list-group-item>
          </b-list-group>

          <h3 class="mt-4">Resumen de Tareas</h3>

          <!-- La tabla ahora usa 'ordenReactiva.tareas' -->
          <b-table-lite bordered responsive small striped :items="ordenReactiva.tareas" :fields="fieldsTareas">
          </b-table-lite>
        </div>

        <div v-else>
          <b-alert show>La orden aún no tiene personal asignado o no se encuentra.</b-alert>
        </div>
      </b-overlay>

    </b-modal>
  </div>
</template>

<script>
// Importa el mixin
import procesamientoOrdenesMixin from "~/mixins/procesamientoOrdenes.js"; // Asegúrate de que la ruta sea correcta
import linkSearch from "~/components/linkSearch.vue";

export default {
  components: {
    "link-search": linkSearch,
  },
  // Registra el mixin
  mixins: [procesamientoOrdenesMixin],

  props: {
    // <-- MODIFICACIÓN: 'obj' ya no es necesario y se ha eliminado. -->
    ordenesProyectadas2: {
      type: Array,
      default: () => [],
    },
    id_orden: {
      type: [Number, String],
      required: true,
    },
    reload: {
      type: Function,
      default: () => { },
    },
  },

  data() {
    return {
      // El "reloj" reactivo
      ahora: new Date(),
      intervaloReloj: null,
      isLoading: true, // Nueva propiedad para el estado de carga

      // Reporte Data
      reporteData: null,
      inputEfficiencyData: null,
      isLoadingReport: false,

      fieldsTareas: [
        { key: "nombre_departamento", label: "Departamento" },
        { key: "fecha_inicio_formateada", label: "Inicio Real" },
        { key: "fecha_terminado_formateada", label: "Terminado Real" },
        { key: "fecha_estimada_inicio_formateada", label: "Inicio Estimado" },
        { key: "fecha_estimada_fin_formateada", label: "Fin Estimado" },
        {
          key: "tiempo_total_orden_depto_formateado",
          label: "Tiempo Estimado",
        },
        { key: "tiempo_real_empleado_formateado", label: "Tiempo Real" },
      ],

      // Variables para AsignacionDeInsumosAProductos
      showAsignacionModal: false,
      catalogsLoaded: false,
      isLoadingCatalogs: false,

      departamentos: [],
      catalogoInsumos: [],
      tiemposProduccion: [],
      insumosAsignados: [],
      selectInsumos: [],
      currentProductForAsignacion: {},
      sizes: [],
    };
  },

  computed: {
    modal() {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    // Bullet Graph Computed Properties
    bulletGraphMax() {
      if (!this.reporteData) return 100;
      const real = this.reporteData.tiempo_total_segundos || 0;
      const projected = this.reporteData.tiempo_proyectado_segundos || 0;
      // Scale max is slightly larger than the biggest value
      return Math.max(real, projected) * 1.2 || 100; // Default to 100 if both are 0
    },

    bulletGraphBarWidth() {
      if (!this.reporteData) return 0;
      const real = this.reporteData.tiempo_total_segundos || 0;
      return (real / this.bulletGraphMax) * 100;
    },

    bulletGraphMarkerPosition() {
      if (!this.reporteData) return 0;
      const projected = this.reporteData.tiempo_proyectado_segundos || 0;
      return (projected / this.bulletGraphMax) * 100;
    },

    bulletGraphColor() {
      if (!this.reporteData) return 'bg-secondary';
      const real = this.reporteData.tiempo_total_segundos || 0;
      const projected = this.reporteData.tiempo_proyectado_segundos || 0;

      if (projected === 0) return 'bg-warning'; // No projection available
      return real <= projected ? 'bg-success' : 'bg-danger';
    },

    ordenReactiva() {
      if (!this.ordenesProyectadas2 || !this.ordenesProyectadas2.length) {
        return null;
      }
      const ordenBase = this.ordenesProyectadas2.find(
        (o) => o.id_orden === this.id_orden
      );

      if (!ordenBase) {
        this.isLoading = false; // Set isLoading to false if no order is found
        return null;
      }

      const { variant, variant_text } = this._determinarVarianteOrden(
        ordenBase,
        this.ahora
      );

      const tareasActualizadas = ordenBase.tareas.map((tarea) => {
        const { variant: tareaVariant, variant_text: tareaVariantText } =
          this._determinarVarianteTarea(tarea, this.ahora);
        return {
          ...tarea,
          variant: tareaVariant,
          variant_text: tareaVariantText,
        };
      });

      this.isLoading = false; // Set isLoading to false once data is processed
      return {
        ...ordenBase,
        variant,
        variant_text,
        tareas: tareasActualizadas,
      };
    },

    title() {
      return this.ordenReactiva
        ? `Orden ${this.ordenReactiva.id_orden}`
        : `Orden sin asignaciones`;
    },

    variant() {
      // Si está cargando, el botón es 'light'.
      if (this.isLoading) {
        return 'light';
      }
      // Si ordenReactiva existe (no es null), usamos su 'variant'.
      // Si no existe, usamos 'light' como valor por defecto.
      return this.ordenReactiva ? this.ordenReactiva.variant : 'light';
    },

    textButton() {
      if (this.isLoading) return "Calculando fecha...";
      if (this.ordenReactiva && this.ordenReactiva.variant_text === "PAUSADA")
        return "PAUSADA";
      if (!this.ordenReactiva) return "POR ASIGNAR";
      if (this.ordenReactiva.variant === "light")
        return this.ordenReactiva.variant_text;

      const ultimaTarea =
        this.ordenReactiva.tareas[this.ordenReactiva.tareas.length - 1];
      return ultimaTarea
        ? ultimaTarea.fecha_estimada_fin_formateada
        : "Ver detalles";
    },

    textList() {
      if (!this.ordenReactiva) return {};

      // La fecha estimada de entrega final es la fecha de fin de la última tarea.
      const fechaEntregaEstimadaFinal =
        this.ordenReactiva.tareas.length > 0
          ? this.ordenReactiva.tareas[this.ordenReactiva.tareas.length - 1]
            .fecha_estimada_fin_formateada
          : "N/D";

      return {
        idOrden: this.ordenReactiva.id_orden,
        status: this.ordenReactiva.variant_text,
        tiempoEstimado: this.ordenReactiva.tiempo_neto_orden_formateado,
        tiempoRestante: this.ordenReactiva.tiempo_pendiente_orden_formateado,
        // <-- MODIFICACIÓN CLAVE: Ahora usamos la propiedad del objeto reactivo. -->
        fechaEntrega: this.ordenReactiva.fecha_entrega_orden || "N/D",
        fechaEntregaEstimada: fechaEntregaEstimadaFinal,
      };
    },

    // Computar información del producto para el componente de asignación
    productInfo() {
      if (this.reporteData && this.reporteData.id_product) {
        return {
          cod: this.reporteData.id_product,
          name: this.reporteData.product_name
        };
      }

      // Fallback: Buscar en ordenesProyectadas2 si el reporte aún no carga o falla
      const orden = this.ordenesProyectadas2.find(o => o.id_orden === this.id_orden);
      if (orden && orden.id_woo) {
        return {
          cod: orden.id_woo,
          name: orden.producto
        };
      }

      return null;
    },
  },

  methods: {
    handleModalShowInternal() {
      this.$emit('modal-shown');
      this.fetchManufacturingReport();
    },

    async loadAsignacionData() {
      if (this.catalogsLoaded) return;

      this.isLoadingCatalogs = true;
      try {
        const [depsRes, insumosRes, tiemposRes, insumosAsigRes, sizesRes] = await Promise.all([
          this.$axios.get(`${this.$config.API}/departamentos`),
          this.$axios.get(`${this.$config.API}/catalogo-insumos-productos`),
          this.$axios.get(`${this.$config.API}/tiempos-de-produccion`),
          this.$axios.get(`${this.$config.API}/insumos-productos-asignados`),
          this.$axios.get(`${this.$config.API}/sizes`),
        ]);

        this.departamentos = depsRes.data;
        this.catalogoInsumos = insumosRes.data.data; // Ajustar según estructura respuesta
        this.tiemposProduccion = tiemposRes.data;
        this.insumosAsignados = insumosAsigRes.data;
        this.sizes = sizesRes.data.data || []; // Ajustar estructura

        // Formatear insumos para select
        this.selectInsumos = this.catalogoInsumos.map(insumo => ({
          value: insumo._id,
          text: insumo.nombre,
        }));
        this.selectInsumos.unshift({ value: null, text: "Seleccione un insumo" });

        this.catalogsLoaded = true;
      } catch (error) {
        console.error("Error loading catalogs:", error);
        this.$bvToast.toast("Error al cargar datos de asignación", {
          variant: "danger",
          solid: true
        });
      } finally {
        this.isLoadingCatalogs = false;
      }
    },

    async fetchManufacturingReport() {
      this.isLoadingReport = true;
      this.reporteData = null;
      this.inputEfficiencyData = null; // Reset input efficiency data

      try {
        const [timeResponse, inputResponse] = await Promise.all([
          this.$axios.get(`${this.$config.API}/reports/manufacturing-time`, { params: { id_orden: this.id_orden } }),
          this.$axios.get(`${this.$config.API}/reports/input-efficiency/${this.id_orden}`)
        ]);

        // Process Time Report
        if (timeResponse.data && timeResponse.data.length > 0) {
          const totalReal = timeResponse.data.reduce((acc, item) => acc + (item.tiempo_total_segundos || 0), 0);
          const totalProjected = timeResponse.data.reduce((acc, item) => acc + (item.tiempo_proyectado_segundos || 0), 0);

          // Extraer info de producto del primer item (asumiendo 1 orden = 1 tipo producto principal)
          const firstItem = timeResponse.data[0];

          this.reporteData = {
            tiempo_total_segundos: totalReal,
            tiempo_proyectado_segundos: totalProjected,
            id_product: firstItem ? firstItem.id_product_woo : null,
            product_name: firstItem ? firstItem.producto : ''
          };
        } else {
          this.reporteData = {
            tiempo_total_segundos: 0,
            tiempo_proyectado_segundos: 0
          };
        }

        // Process Input Efficiency Report
        if (inputResponse.data) {
          this.inputEfficiencyData = inputResponse.data;
        }

        // Cargar datos de asignación automáticamente
        await this.loadAsignacionData();

      } catch (error) {
        console.error("Error fetching reports:", error);
        this.$bvToast.toast("Error al cargar reportes de eficiencia", {
          variant: "warning",
          solid: true
        });
      } finally {
        this.isLoadingReport = false;
      }
    },

    handleAsignacionReload() {
      // Recargar datos de insumos asignados y reporte
      this.catalogsLoaded = false; // Forzar recarga de catálogos la próxima vez por si cambios
      this.fetchManufacturingReport();
      // Recargar la data de asignación actualizada
      this.loadAsignacionData();
    },

    formatSeconds(seconds) {
      if (!seconds) return '0s';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);

      let res = '';
      if (h > 0) res += `${h}h `;
      if (m > 0) res += `${m}m `;
      res += `${s}s`;
      return res;
    }
  },

  mounted() {
    this.intervaloReloj = setInterval(() => {
      //   this.$emit("reload");
      this.ahora = new Date();
    }, 60000);
  },

  beforeDestroy() {
    clearInterval(this.intervaloReloj);
  },
};
</script>