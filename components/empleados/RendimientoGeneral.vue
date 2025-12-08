<template>
  <div>
    <b-alert
      class="text-center"
      show
      :variant="variant"
    >
      <h2
        class="alert-heading"
        style="margin: 2rem"
      >
        {{ text }}
      </h2>
      
      <!-- Global Bullet Graph -->
      <div v-if="reporteData" class="mt-3 mb-2 px-4">
         <div class="d-flex justify-content-between mb-1 small">
            <span>Real: {{ formatSeconds(reporteData.totalReal) }}</span>
            <span>Meta: {{ formatSeconds(reporteData.totalProjected) }}</span>
            <span v-if="reporteData.totalElapsed" class="text-muted" style="font-size: 0.9em;">
               (Muerto: {{ formatSeconds(Math.max(0, reporteData.totalElapsed - reporteData.totalReal)) }})
            </span>
         </div>
         <div class="position-relative" style="height: 20px; background-color: rgba(255,255,255,0.5); border-radius: 4px;">
            <div 
                class="position-absolute h-100" 
                :class="bulletGraphColor"
                :style="{ width: bulletGraphBarWidth + '%' }"
                style="border-radius: 4px 0 0 4px; transition: width 0.5s ease;"
            ></div>
            <div 
                class="position-absolute h-100"
                style="width: 2px; background-color: #000; z-index: 10;"
                :style="{ left: bulletGraphMarkerPosition + '%' }"
            ></div>
         </div>
      </div>
      <div v-else-if="isLoading" class="mt-2">
         <b-spinner small></b-spinner>
      </div>

    </b-alert>

    <!-- Input Efficiency Alert -->
    <b-alert
      v-if="inputEfficiencyText"
      class="text-center mt-2"
      show
      :variant="inputEfficiencyVariant"
    >
      <h2 class="alert-heading" style="margin: 2rem">
        {{ inputEfficiencyText }}
      </h2>

      <!-- Input Efficiency Bullet Graph -->
      <div v-if="inputEfficiencyData" class="mt-3 mb-2 px-4">
         <div class="d-flex justify-content-between mb-1 small">
            <span>Utilizado: {{ inputEfficiencyData.totalReal.toFixed(2) }} {{ inputEfficiencyData.unidad }}</span>
            <span>Estimado: {{ inputEfficiencyData.totalEstimado.toFixed(2) }} {{ inputEfficiencyData.unidad }}</span>
         </div>
         <div class="position-relative" style="height: 20px; background-color: rgba(255,255,255,0.5); border-radius: 4px;">
            <div 
                class="position-absolute h-100" 
                :class="inputBulletGraphColor"
                :style="{ width: inputBulletGraphBarWidth + '%' }"
                style="border-radius: 4px 0 0 4px; transition: width 0.5s ease;"
            ></div>
            <div 
                class="position-absolute h-100"
                style="width: 2px; background-color: #000; z-index: 10;"
                :style="{ left: inputBulletGraphMarkerPosition + '%' }"
            ></div>
         </div>
      </div>
    </b-alert>
  </div>
</template>

<script>
import { log } from "console";
import mixintime from "~/mixins/mixin-time.js";

export default {
  mixins: [mixintime],

  props: ["ordenes", "pausas", "departmentId"],

  data() {
    return {
      variant: "light",
      text: "Calculando eficiencia...",
      horario: null,
      tiempoTrabajoMs: [],
      
      // New Data
      reporteData: null,
      isLoading: false,
      
      // Input Efficiency Data
      inputEfficiencyText: null,
      inputEfficiencyVariant: "light",
      inputEfficiencyData: null,  // { totalReal, totalEstimado, unidad }
    };
  },

  watch: {
    ordenes: {
      handler(val) {
        if (val && val.length > 0) {
          this.fetchGlobalEfficiency();
        } else {
           this.text = "Sin órdenes activas";
           this.variant = "light";
        }
      },
      deep: true,
      immediate: true
    },
  },

  computed: {
    bulletGraphMax() {
      if (!this.reporteData) return 100;
      return Math.max(this.reporteData.totalReal, this.reporteData.totalProjected) * 1.2 || 100;
    },
    bulletGraphBarWidth() {
      if (!this.reporteData) return 0;
      return (this.reporteData.totalReal / this.bulletGraphMax) * 100;
    },
    bulletGraphMarkerPosition() {
      if (!this.reporteData) return 0;
      return (this.reporteData.totalProjected / this.bulletGraphMax) * 100;
    },
    bulletGraphColor() {
      if (!this.reporteData) return 'bg-secondary';
      // If Real <= Projected, it's good (Green). If Real > Projected, it's bad (Red).
      // Note: This logic assumes "Real" is "Time Spent".
      return this.reporteData.totalReal <= this.reporteData.totalProjected ? 'bg-success' : 'bg-danger';
    },

    // Computed properties for Input Efficiency Bullet Graph
    inputBulletGraphMax() {
      if (!this.inputEfficiencyData) return 100;
      return Math.max(this.inputEfficiencyData.totalReal, this.inputEfficiencyData.totalEstimado) * 1.2 || 100;
    },
    inputBulletGraphBarWidth() {
      if (!this.inputEfficiencyData) return 0;
      return (this.inputEfficiencyData.totalReal / this.inputBulletGraphMax) * 100;
    },
    inputBulletGraphMarkerPosition() {
      if (!this.inputEfficiencyData) return 0;
      return (this.inputEfficiencyData.totalEstimado / this.inputBulletGraphMax) * 100;
    },
    inputBulletGraphColor() {
      if (!this.inputEfficiencyData) return 'bg-secondary';
      // If Real <= Estimado, it's good (Green - usaste menos o igual). 
      // If Real > Estimado, it's bad (Red - usaste más del estimado).
      return this.inputEfficiencyData.totalReal <= this.inputEfficiencyData.totalEstimado ? 'bg-success' : 'bg-danger';
    }
  },

  methods: {
    async fetchGlobalEfficiency() {
      if (!this.ordenes || this.ordenes.length === 0) return;
      
      this.isLoading = true;
      // Extract IDs
      const ids = this.ordenes.map(o => o.orden || o.id_orden).filter(id => id).join(',');
      
      if (!ids) {
          this.isLoading = false;
          return;
      }

      try {
        const params = {
          id_ordenes: ids
        };

        // Pass employee ID if available (to filter projected time)
        if (this.$store.state.login && this.$store.state.login.dataUser && this.$store.state.login.dataUser.id_empleado) {
            params.id_empleado = this.$store.state.login.dataUser.id_empleado;
        }

        const response = await this.$axios.get(`${this.$config.API}/reports/manufacturing-time`, {
          params: params
        });

        if (response.data) {
          const totalReal = response.data.reduce((acc, item) => acc + (item.tiempo_total_segundos || 0), 0);
          const totalProjected = response.data.reduce((acc, item) => {
              // Only include projected time if the order has started
              if ((item.tiempo_total_segundos && item.tiempo_total_segundos > 0) || item.fecha_inicio_primer_proceso) {
                  const projected = parseFloat(item.tiempo_proyectado_segundos || 0);
                  const real = parseFloat(item.tiempo_total_segundos || 0);
                  
                  // Safe Meta Logic:
                  // If order is finished, use full projected time.
                  // If order is in progress, cap projected time at real time (assume 100% efficiency until over budget).
                  // This prevents artificial inflation (e.g. 112%) when starting a new task.
                  if (item.status === 'terminado') {
                      return acc + projected;
                  } else {
                      return acc + Math.min(real, projected);
                  }
              }
              return acc;
          }, 0);
          
          this.reporteData = {
            totalReal,
            totalProjected,
            // Calculate total elapsed time from the earliest start date
            totalElapsed: (() => {
                const processedOrders = new Set();
                return response.data.reduce((acc, item) => {
                    if (!item.fecha_inicio_primer_proceso || processedOrders.has(item.id_orden)) return acc;
                    
                    processedOrders.add(item.id_orden);
                    const start = new Date(item.fecha_inicio_primer_proceso).getTime();
                    const now = new Date().getTime();
                    const elapsed = (now - start) / 1000; // seconds
                    return acc + (elapsed > 0 ? elapsed : 0);
                }, 0);
            })()
          };

          this.calculateEfficiencyText(totalReal, totalProjected);
        }

        // --- NEW: Fetch Input Efficiency (Bulk) ---
        const inputResponse = await this.$axios.get(`${this.$config.API}/reports/input-efficiency/${ids}`);
        if (inputResponse.data && inputResponse.data.length > 0) {
            let totalEfficiency = 0;
            let countItems = 0;
            let totalEstimado = 0;
            let totalReal = 0;
            let unidad = 'Mt';

            inputResponse.data.forEach(item => {
                // Filter by Department if provided
                if (this.departmentId && parseInt(item.id_departamento) !== parseInt(this.departmentId)) {
                    return;
                }

                const standard = parseFloat(item.cantidad_estandar) || 0;
                const real = parseFloat(item.cantidad_real) || 0;

                // Acumular totales para la barra
                totalEstimado += standard;
                totalReal += real;
                unidad = item.unidad || 'Mt';

                // Solo calcular eficiencia si hay datos de consumo real
                // Sin datos de consumo, no podemos calcular eficiencia
                if (standard > 0 && real > 0) {
                    // Fórmula: (Estimado / Utilizado) * 100
                    // Igual que en el modal "Datos Extra Impresión"
                    const efficiency = (standard / real) * 100;
                    totalEfficiency += efficiency;
                    countItems++;
                }
                // Si real === 0, no incluimos en el cálculo (falta información)
            });

            // Guardar datos para la barra de eficiencia de insumos
            if (totalEstimado > 0 || totalReal > 0) {
                this.inputEfficiencyData = {
                    totalEstimado,
                    totalReal,
                    unidad
                };
            }

            const averageEfficiency = countItems > 0 ? (totalEfficiency / countItems) : 0;
            this.calculateInputEfficiencyText(averageEfficiency, countItems);
        } else {
            this.inputEfficiencyText = "Sin datos de insumos";
            this.inputEfficiencyVariant = "light";
            this.inputEfficiencyData = null;
        }
        // ------------------------------------------

      } catch (error) {
        console.error("Error fetching global efficiency:", error);
        // Fallback to old mixin logic if API fails?
        // For now, just show error or keep "Calculando..."
        this.text = "Error al calcular";
      } finally {
        this.isLoading = false;
      }
    },

    calculateEfficiencyText(real, projected) {
        if (projected === 0) {
            this.text = "Sin proyección de tiempo";
            this.variant = "info";
            return;
        }
        
        // Efficiency = (Standard / Actual) * 100
        // If I take 0 seconds, efficiency is infinite? Let's cap it or handle 0.
        if (real === 0) {
            this.text = "Iniciando...";
            this.variant = "light";
            return;
        }

        const efficiency = (projected / real) * 100;
        const efficiencyFormatted = efficiency.toFixed(0);

        this.text = `Eficiencia Tiempo ${efficiencyFormatted}%`;

        // Color logic for the banner (based on efficiency)
        // > 100% is excellent (Green)
        // 80-100% is good (Success/Info)
        // < 50% is bad (Danger)
        
        if (efficiency >= 100) {
            this.variant = "success";
        } else if (efficiency >= 80) {
            this.variant = "warning"; // Or a lighter green
        } else {
            this.variant = "danger";
        }
    },

    formatSeconds(seconds) {
      if (!seconds) return '0s';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      // const s = Math.floor(seconds % 60);
      return `${h}h ${m}m`;
    },

    calculateInputEfficiencyText(averageEfficiency, countItems) {
        if (countItems === 0) {
            this.inputEfficiencyText = "Sin datos procesables";
            this.inputEfficiencyVariant = "light";
            return;
        }

        const efficiencyFormatted = averageEfficiency.toFixed(0);
        this.inputEfficiencyText = `Eficiencia Insumos ${efficiencyFormatted}%`;

        if (averageEfficiency >= 100) {
            this.inputEfficiencyVariant = "success";
        } else if (averageEfficiency >= 80) {
            this.inputEfficiencyVariant = "warning";
        } else {
            this.inputEfficiencyVariant = "danger";
        }
    }
  },

  mounted() {
    // Initial fetch handled by immediate watcher
  },
};
</script>
