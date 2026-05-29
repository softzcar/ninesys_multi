<template>
  <div class="kpi-panel">
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <!-- 1. Total Productos -->
      <div class="kpi-card kpi-blue">
        <div class="kpi-icon">
          <b-icon icon="box-seam" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Total Productos</span>
          <span class="kpi-value">{{ formatNumber(totals.total_productos) }}</span>
          <span class="kpi-sub">unidades fabricadas</span>
        </div>
      </div>

      <!-- 2. Total Ventas -->
      <div class="kpi-card kpi-green">
        <div class="kpi-icon">
          <b-icon icon="cash-stack" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Total Ventas</span>
          <span class="kpi-value">$ {{ formatMoney(totals.pago_total) }}</span>
          <span class="kpi-sub">ingresos del período</span>
        </div>
      </div>

      <!-- 3. Total Costos -->
      <div class="kpi-card kpi-orange">
        <div class="kpi-icon">
          <b-icon icon="receipt-cutoff" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Total Costos</span>
          <span class="kpi-value">$ {{ formatMoney(totals.costo_total) }}</span>
          <span class="kpi-sub">egresos del período</span>
        </div>
      </div>

      <!-- 4. Margen de Utilidad -->
      <div class="kpi-card" :class="margenClass">
        <div class="kpi-icon">
          <b-icon :icon="totals.ganancia >= 0 ? 'graph-up-arrow' : 'graph-down-arrow'" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Utilidad Neta</span>
          <span class="kpi-value">$ {{ formatMoney(totals.ganancia) }}</span>
          <span class="kpi-sub">{{ margenPorcentaje }}% de margen</span>
        </div>
      </div>

      <!-- 5. Horas de Producción -->
      <div class="kpi-card kpi-purple">
        <div class="kpi-icon">
          <b-icon icon="clock-history" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Horas Producción</span>
          <span class="kpi-value">{{ formatDecimal(totals.tiempo_de_produccion) }}</span>
          <span class="kpi-sub">horas trabajadas</span>
        </div>
      </div>

      <!-- 6. Total Reposiciones -->
      <div class="kpi-card kpi-yellow">
        <div class="kpi-icon">
          <b-icon icon="arrow-repeat" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Reposiciones</span>
          <span class="kpi-value">{{ totals.reposiciones || 0 }}</span>
          <span class="kpi-sub">durante el período</span>
        </div>
      </div>
    </div>

    <!-- Barra de eficiencia promedio -->
    <div class="kpi-efficiency-bar" v-if="totals.eficiencia_insumos > 0">
      <div class="kpi-eff-label">
        <b-icon icon="speedometer2" />
        Eficiencia Promedio de Insumos:
        <strong :style="{ color: eficienciaColor }">{{ formatDecimal(totals.eficiencia_insumos) }}%</strong>
      </div>
      <div class="kpi-progress-track">
        <div
          class="kpi-progress-fill"
          :style="{ width: Math.min(totals.eficiencia_insumos, 100) + '%', backgroundColor: eficienciaColor }"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReporteCostosKpis',
  props: {
    totals: {
      type: Object,
      required: true,
    },
  },
  computed: {
    margenPorcentaje() {
      if (!this.totals.pago_total || this.totals.pago_total === 0) return '0.00';
      return ((this.totals.ganancia / this.totals.pago_total) * 100).toFixed(2);
    },
    margenClass() {
      return this.totals.ganancia >= 0 ? 'kpi-green-dark' : 'kpi-red';
    },
    eficienciaColor() {
      const e = this.totals.eficiencia_insumos || 0;
      if (e >= 80) return '#28a745';
      if (e >= 60) return '#ffc107';
      return '#dc3545';
    },
  },
  methods: {
    formatNumber(val) {
      return Number(val || 0).toLocaleString('es-VE');
    },
    formatMoney(val) {
      return Number(val || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatDecimal(val) {
      return Number(val || 0).toFixed(2);
    },
  },
};
</script>

<style scoped>
.kpi-panel {
  margin-bottom: 1.5rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}

/* === BASE CARD === */
.kpi-card {
  border-radius: 12px;
  padding: 1rem 1rem 0.75rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border: none;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 12px 12px 0 0;
}

/* === THEMES === */
.kpi-blue   { background: #e8f4fd; } .kpi-blue::before   { background: #1a73e8; }
.kpi-blue   .kpi-icon { color: #1a73e8; background: #cce3fb; }

.kpi-green  { background: #e6f9ed; } .kpi-green::before  { background: #28a745; }
.kpi-green  .kpi-icon { color: #28a745; background: #c3f0d3; }

.kpi-green-dark { background: #e6f9ed; } .kpi-green-dark::before { background: #1e8449; }
.kpi-green-dark .kpi-icon { color: #1e8449; background: #c3f0d3; }

.kpi-red    { background: #fdecea; } .kpi-red::before    { background: #dc3545; }
.kpi-red    .kpi-icon { color: #dc3545; background: #fad4d8; }

.kpi-orange { background: #fff4e6; } .kpi-orange::before { background: #fd7e14; }
.kpi-orange .kpi-icon { color: #fd7e14; background: #ffe2c0; }

.kpi-purple { background: #f0eaff; } .kpi-purple::before { background: #6f42c1; }
.kpi-purple .kpi-icon { color: #6f42c1; background: #dfd3ff; }

.kpi-yellow { background: #fffbea; } .kpi-yellow::before { background: #e6b800; }
.kpi-yellow .kpi-icon { color: #d4a000; background: #fff2b0; }

/* === ICON === */
.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* === BODY === */
.kpi-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.kpi-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6c757d;
  white-space: nowrap;
}
.kpi-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kpi-sub {
  font-size: 0.65rem;
  color: #9aacb8;
  margin-top: 1px;
}

/* === EFFICIENCY BAR === */
.kpi-efficiency-bar {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  border: 1px solid #e9ecef;
}
.kpi-eff-label {
  font-size: 0.8rem;
  color: #495057;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.kpi-progress-track {
  height: 8px;
  background: #dee2e6;
  border-radius: 99px;
  overflow: hidden;
}
.kpi-progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s ease;
}
</style>
