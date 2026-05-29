<template>
  <div class="grafico-card" v-if="hasData">
    <div class="grafico-header">
      <b-icon icon="pie-chart-fill" class="grafico-header-icon" />
      <span>Desglose de Costos del Período</span>
    </div>
    <apexchart
      type="donut"
      height="280"
      :options="chartOptions"
      :series="series"
    />
  </div>
  <div class="grafico-card grafico-empty" v-else>
    <b-icon icon="pie-chart" font-scale="2.5" class="text-muted" />
    <p class="mt-2 text-muted mb-0">Sin datos para mostrar</p>
  </div>
</template>

<script>
export default {
  name: 'ReporteCostosGraficoCostos',
  props: {
    totals: {
      type: Object,
      required: true,
    },
    selectedExpenses: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    seriesMap() {
      const map = [];

      const insumos = Number(this.totals.costo_insumos_total || 0);
      const manoObra = Number(this.totals.costo_mano_de_obra_total || 0);

      if (insumos > 0)    map.push({ label: 'Insumos & Tintas',   value: insumos,    color: '#1a73e8' });
      if (manoObra > 0)   map.push({ label: 'Mano de Obra',       value: manoObra,   color: '#6f42c1' });

      if (this.selectedExpenses.includes('fijo') && this.totals.gasto_fijo > 0)
        map.push({ label: 'Gastos Fijos',       value: Number(this.totals.gasto_fijo),         color: '#fd7e14' });
      if (this.selectedExpenses.includes('variable') && this.totals.gasto_variable > 0)
        map.push({ label: 'Gastos Variables',   value: Number(this.totals.gasto_variable),     color: '#ffc107' });
      if (this.selectedExpenses.includes('adicional') && this.totals.gasto_adicional > 0)
        map.push({ label: 'Gastos Adicionales', value: Number(this.totals.gasto_adicional),    color: '#e83e8c' });
      if (this.selectedExpenses.includes('remanente') && this.totals.gasto_remanente > 0)
        map.push({ label: 'Remanentes',         value: Number(this.totals.gasto_remanente),    color: '#dc3545' });
      if (this.selectedExpenses.includes('mantenimiento') && this.totals.gasto_mantenimiento > 0)
        map.push({ label: 'Mantenimiento',      value: Number(this.totals.gasto_mantenimiento),color: '#20c997' });

      return map;
    },
    series() {
      return this.seriesMap.map(s => Math.round(s.value * 100) / 100);
    },
    hasData() {
      return this.series.some(v => v > 0);
    },
    chartOptions() {
      return {
        chart: {
          type: 'donut',
          fontFamily: 'inherit',
          animations: { enabled: true, easing: 'easeinout', speed: 500 },
        },
        labels: this.seriesMap.map(s => s.label),
        colors: this.seriesMap.map(s => s.color),
        legend: {
          position: 'bottom',
          fontSize: '12px',
          markers: { radius: 4 },
          itemMargin: { horizontal: 8, vertical: 4 },
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => val.toFixed(1) + '%',
          style: { fontSize: '11px', fontWeight: '600' },
          dropShadow: { enabled: false },
        },
        plotOptions: {
          pie: {
            donut: {
              size: '60%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Costo Total',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#495057',
                  formatter: (w) => {
                    const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                    return '$ ' + sum.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  },
                },
                value: {
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1a1a2e',
                  formatter: (val) => '$ ' + Number(val).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                },
              },
            },
          },
        },
        tooltip: {
          y: {
            formatter: (val) => '$ ' + val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          },
        },
        stroke: { width: 2 },
        states: {
          hover: { filter: { type: 'lighten', value: 0.05 } },
        },
      };
    },
  },
};
</script>

<style scoped>
.grafico-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  height: 100%;
}
.grafico-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
.grafico-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}
.grafico-header-icon {
  color: #6f42c1;
  font-size: 1rem;
}
</style>
