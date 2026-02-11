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
      
      <!-- Barra 1: Tareas Terminadas (Eficiencia Real) -->
      <div v-if="reporteData && reporteData.totalProjectedTerminadas > 0" class="mt-3 mb-2 px-4">
         <div class="d-flex justify-content-between mb-1 small">
            <strong style="color: #000; font-size: 14px;">✓ Tareas Completadas - Eficiencia Real:</strong>
            <span>Tiempo Real: {{ formatSeconds(reporteData.totalRealTerminadas) }}</span>
            <span>Meta Esperada: {{ formatSeconds(reporteData.totalProjectedTerminadas) }}</span>
         </div>
         <div class="position-relative" style="height: 20px; background-color: rgba(255,255,255,0.5); border-radius: 4px;">
            <div 
                class="position-absolute h-100" 
                :class="'bg-' + variantTerminadas"
                :style="{ width: bulletGraphBarWidthTerminadas + '%' }"
                style="border-radius: 4px 0 0 4px; transition: width 0.5s ease;"
            ></div>
            <div 
                class="position-absolute h-100"
                style="width: 2px; background-color: #000; z-index: 10;"
                :style="{ left: bulletGraphMarkerPositionTerminadas + '%' }"
            ></div>
         </div>
      </div>

      <!-- Barra 2: Tareas En Curso (Progreso) -->
      <div v-if="reporteData && reporteData.totalProjectedEnCurso > 0" class="mt-3 mb-2 px-4">
         <div class="d-flex justify-content-between mb-1 small">
            <strong style="color: #000; font-size: 14px;">⏳ Tareas En Progreso - Avance Actual:</strong>
            <span>Tiempo Usado: {{ formatSeconds(reporteData.totalRealEnCurso) }}</span>
            <span>Tiempo Total Disponible: {{ formatSeconds(reporteData.totalProjectedEnCurso) }}</span>
         </div>
         <div class="position-relative" style="height: 20px; background-color: rgba(255,255,255,0.5); border-radius: 4px;">
            <div 
                class="position-absolute h-100" 
                :class="'bg-' + variantEnCurso"
                :style="{ width: bulletGraphBarWidthEnCurso + '%' }"
                style="border-radius: 4px 0 0 4px; transition: width 0.5s ease;"
            ></div>
            <div 
                class="position-absolute h-100"
                style="width: 2px; background-color: #000; z-index: 10;"
                :style="{ left: bulletGraphMarkerPositionEnCurso + '%' }"
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
      variantTerminadas: "light",
      variantEnCurso: "light",
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
          let eficienciaTitulo = "";
          let progresoTitulo = "";
          let vTerm = "success";
          let vEnc = "success";

          // 1. Calcular Eficiencia (Tareas Terminadas)
          if (val.totalProjectedTerminadas > 0 && val.totalRealTerminadas > 0) {
            const eficiencia = (val.totalProjectedTerminadas / val.totalRealTerminadas) * 100;
            const eficienciaRedondeada = Math.round(eficiencia);
            eficienciaTitulo = `Eficiencia: ${eficienciaRedondeada}%`;
            
            if (eficiencia >= 100) vTerm = "success";
            else if (eficiencia >= 80) vTerm = "warning";
            else vTerm = "danger";
            
            this.variantTerminadas = vTerm;
          }

          // 2. Calcular Avance (Tareas En Curso)
          if (val.totalProjectedEnCurso > 0 && val.totalRealEnCurso > 0) {
            const progreso = (val.totalRealEnCurso / val.totalProjectedEnCurso) * 100;
            const progresoRedondeado = Math.round(progreso);
            progresoTitulo = `Avance: ${progresoRedondeado}%`;
            
            if (progreso <= 80) vEnc = "success";
            else if (progreso <= 100) vEnc = "warning";
            else vEnc = "danger";
            
            this.variantEnCurso = vEnc;
          }

          // 3. Determinar Variant General (Prioridad al estado más crítico)
          const allVariants = [];
          if (eficienciaTitulo) allVariants.push(vTerm);
          if (progresoTitulo) allVariants.push(vEnc);

          if (allVariants.includes("danger")) this.variant = "danger";
          else if (allVariants.includes("warning")) this.variant = "warning";
          else if (allVariants.includes("success")) this.variant = "success";
          else this.variant = "light";

          if (eficienciaTitulo && progresoTitulo) {
            this.text = `✓ ${eficienciaTitulo} | ⏳ ${progresoTitulo}`;
          } else if (eficienciaTitulo) {
            this.text = `✓ Eficiencia Tareas Completadas: ${eficienciaTitulo.split(': ')[1]}`;
          } else if (progresoTitulo) {
            this.text = `⏳ Progreso Tareas En Curso: ${progresoTitulo.split(': ')[1]}`;
          } else {
            this.text = "Sin datos de tiempo";
            this.variant = "light";
          }

          // Calcular variant para TAREAS TERMINADAS (eficiencia) - para la barra específica
          if (val.totalProjectedTerminadas > 0 && val.totalRealTerminadas > 0) {
            const eficiencia = (val.totalProjectedTerminadas / val.totalRealTerminadas) * 100;
            if (eficiencia >= 100) {
              this.variantTerminadas = "success";
            } else if (eficiencia >= 80) {
              this.variantTerminadas = "warning";
            } else {
              this.variantTerminadas = "danger";
            }
          }

          // Calcular variant para TAREAS EN CURSO (progreso) - para la barra específica
          if (val.totalProjectedEnCurso > 0 && val.totalRealEnCurso > 0) {
            const progreso = (val.totalRealEnCurso / val.totalProjectedEnCurso) * 100;
            if (progreso <= 80) {
              this.variantEnCurso = "success";
            } else if (progreso <= 100) {
              this.variantEnCurso = "warning";
            } else {
              this.variantEnCurso = "danger";
            }
          }
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
    },

    // Computed properties para Barra 1: Tareas Terminadas
    bulletGraphMaxTerminadas() {
      if (!this.reporteData || !this.reporteData.totalProjectedTerminadas) return 100;
      return Math.max(this.reporteData.totalRealTerminadas, this.reporteData.totalProjectedTerminadas) * 1.2 || 100;
    },
    bulletGraphBarWidthTerminadas() {
      if (!this.reporteData || !this.reporteData.totalProjectedTerminadas) return 0;
      return (this.reporteData.totalRealTerminadas / this.bulletGraphMaxTerminadas) * 100;
    },
    bulletGraphMarkerPositionTerminadas() {
      if (!this.reporteData || !this.reporteData.totalProjectedTerminadas) return 0;
      return (this.reporteData.totalProjectedTerminadas / this.bulletGraphMaxTerminadas) * 100;
    },

    // Computed properties para Barra 2: Tareas En Curso
    bulletGraphMaxEnCurso() {
      if (!this.reporteData || !this.reporteData.totalProjectedEnCurso) return 100;
      return Math.max(this.reporteData.totalRealEnCurso, this.reporteData.totalProjectedEnCurso) * 1.2 || 100;
    },
    bulletGraphBarWidthEnCurso() {
      if (!this.reporteData || !this.reporteData.totalProjectedEnCurso) return 0;
      return (this.reporteData.totalRealEnCurso / this.bulletGraphMaxEnCurso) * 100;
    },
    bulletGraphMarkerPositionEnCurso() {
      if (!this.reporteData || !this.reporteData.totalProjectedEnCurso) return 0;
      return (this.reporteData.totalProjectedEnCurso / this.bulletGraphMaxEnCurso) * 100;
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
