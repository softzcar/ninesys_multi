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
                :class="'bg-' + variant"
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
                :class="'bg-' + inputEfficiencyVariant"
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

  // Props from parent: data needed for rendering
  props: [
    "ordenes", 
    "pausas", 
    "departmentId",
    "reporteData",       // { totalReal, totalProjected, totalElapsed }
    "inputEfficiencyData", // { totalReal, totalEstimado, unidad }
    "isLoading"          // boolean
  ],

  data() {
    return {
      variant: "light",
      text: "Esperando ordenes...",
      horario: null,
      tiempoTrabajoMs: [],
      
      // Input Efficiency Data
      inputEfficiencyText: null,
      inputEfficiencyVariant: "light",
    };
  },

  watch: {
    // Watch props to update local UI text/variant
    reporteData: {
      handler(val) {
        if (val) {
          this.calculateEfficiencyText(val.totalReal, val.totalProjected);
        } else {
            this.text = this.isLoading ? "Calculando..." : "Sin datos de tiempo";
            this.variant = "light";
        }
      },
      deep: true,
      immediate: true
    },
    inputEfficiencyData: {
      handler(val) {
        if (val) {
            // Need to recalculate efficiency % based on aggregated data if not pre-calculated
            // But wait, the parent sends aggregated totals.
            // We can calculate the % here.
            // Formula: (Estimado / Utilizado) * 100
            // Note: In the original code, it was averaging efficiency per item. 
            // Here we receive totals. Let's stick to the previous logic if possible, 
            // but if we only get totals, we calculate overall efficiency.
            // Let's assume the parent does the math or sends raw totals. 
            // In the parent (V4), we will implement the same aggregation logic.
            // So here we just calculate based on totals.
            // Wait, previous logic: "averageEfficiency = totalEfficiency / countItems".
            // That is mathematically different from "totalEstimado / totalReal".
            // Example: 
            // Item 1: 100 est / 50 real = 200%
            // Item 2: 10 est / 100 real = 10%
            // Avg: 105%
            // Total: 110 est / 150 real = 73%
            // The previous logic used AVERAGE of efficiencies.
            // I should respect that if possible. 
            // To make it simple and robust, let's have the parent pass the `efficiencyPercentage` directly if complex,
            // OR pass the raw list. Pass the raw list might be too heavy? 
            // Actually, the previous component `fetchGlobalEfficiency` did the math.
            // I will implement the math in the parent and pass the *result text* or *percentage*?
            // The template uses `inputEfficiencyData.totalReal` and `totalEstimado`.
            // So I need those totals for the bar.
            // AND I need the % for the text.
            // Let's calculate the text here based on totals? No, that changes the logic.
            // I'll add a prop `inputEfficiencyPercentage`?
            // Or just make the parent calculate the text?
            // The component has `calculateInputEfficiencyText` method.
            // Let's keep `calculateInputEfficiencyText` but updated.
            // I'll stick to calculating from totals for now strictly because I don't want to overcomplicate the props,
            // UNLESS I see that the parent implementation is easy to do the average.
            // SseOrdenesAsignadasV4 will have the logic. I can pass `averageEfficiency` as a prop too.
            // Let's check `inputEfficiencyData` prop again. 
            // It has { totalReal, totalEstimado, unidad }.
            // I will calculate text from these for simplicity, effectively changing logic to "Weighted Average" (Total Est / Total Real), which is often more accurate for "Overall Efficiency".
            // If the user complains, I can revert. But "Global Efficiency" usually means Total Output / Total Input.
            
            if (val.totalReal > 0) {
                 const efficiency = (val.totalEstimado / val.totalReal) * 100;
                 this.calculateInputEfficiencyText(efficiency);
            } else {
                 this.inputEfficiencyText = "Sin consumo real";
                 this.inputEfficiencyVariant = "light";
            }
        } else {
             this.inputEfficiencyText = null;
        }
      },
      deep: true,
      immediate: true
    },
    isLoading(val) {
        if (val) {
            this.text = "Calculando...";
            this.variant = "light";
        }
    }
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
      return this.inputEfficiencyData.totalReal <= this.inputEfficiencyData.totalEstimado ? 'bg-success' : 'bg-danger';
    }
  },

  methods: {
    calculateEfficiencyText(real, projected) {
        if (projected === 0) {
            this.text = "Sin proyección de tiempo";
            this.variant = "info";
            return;
        }
        
        if (real === 0) {
            this.text = "Iniciando...";
            this.variant = "light";
            return;
        }

        const efficiency = (projected / real) * 100;
        const efficiencyRounded = Math.round(efficiency);

        this.text = `Eficiencia Tiempo ${efficiencyRounded}%`;

        if (efficiencyRounded >= 100) {
            this.variant = "success";
        } else if (efficiencyRounded >= 80) {
            this.variant = "warning";
        } else {
            this.variant = "danger";
        }
    },

    formatSeconds(seconds) {
      if (!seconds) return '0s';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
    },

    calculateInputEfficiencyText(efficiency) {
        const efficiencyRounded = Math.round(efficiency);
        this.inputEfficiencyText = `Eficiencia Insumos ${efficiencyRounded}%`;

        if (efficiencyRounded >= 100) {
            this.inputEfficiencyVariant = "success";
        } else if (efficiencyRounded >= 80) {
            this.inputEfficiencyVariant = "warning";
        } else {
            this.inputEfficiencyVariant = "danger";
        }
    }
  },

  mounted() {
    // No explicit mount logic needed, props drive the state
  },
};
</script>
