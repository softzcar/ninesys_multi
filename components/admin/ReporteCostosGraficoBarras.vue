<template>
  <div class="grafico-card" v-if="hasData">
    <div class="grafico-header">
      <b-icon icon="bar-chart-fill" class="grafico-header-icon" />
      <span>Venta vs. Costo vs. Ganancia por Orden</span>
      <b-badge v-if="reportData.length > maxBars" variant="secondary" class="ml-auto badge-info-small">
        Mostrando {{ maxBars }} de {{ reportData.length }} órdenes
      </b-badge>
    </div>
    <apexchart
      type="bar"
      height="300"
      :options="chartOptions"
      :series="series"
    />
  </div>
  <div class="grafico-card grafico-empty" v-else>
    <b-icon icon="bar-chart" font-scale="2.5" class="text-muted" />
    <p class="mt-2 text-muted mb-0">Sin datos para mostrar</p>
  </div>
</template>

<script>
export default {
  name: 'ReporteCostosGraficoBarras',
  props: {
    reportData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      maxBars: 20,
    };
  },
  computed: {
    displayData() {
      // Mostrar solo las últimas N órdenes para no saturar el gráfico
      return this.reportData.slice(-this.maxBars);
    },
    categories() {
      return this.displayData.map(d => `#${d.id_orden}`);
    },
    hasData() {
      return this.reportData.length > 0;
    },
    series() {
      return [
        {
          name: 'Venta',
          data: this.displayData.map(d => Math.round((d.pago_total || 0) * 100) / 100),
        },
        {
          name: 'Costo Total',
          data: this.displayData.map(d => Math.round((d.costo_total || 0) * 100) / 100),
        },
        {
          name: 'Ganancia',
          data: this.displayData.map(d => Math.round((d.ganancia || 0) * 100) / 100),
        },
      ];
    },
    chartOptions() {
      return {
        chart: {
          type: 'bar',
          fontFamily: 'inherit',
          toolbar: { show: false },
          animations: { enabled: true, easing: 'easeinout', speed: 400 },
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: '65%',
            dataLabels: { position: 'top' },
          },
        },
        colors: ['#28a745', '#fd7e14', '#1a73e8'],
        dataLabels: { enabled: false },
        xaxis: {
          categories: this.categories,
          labels: {
            style: { fontSize: '11px', colors: '#6c757d' },
            rotate: -45,
          },
          axisBorder: { color: '#dee2e6' },
          axisTicks: { color: '#dee2e6' },
        },
        yaxis: {
          labels: {
            formatter: (val) => '$ ' + val.toFixed(0),
            style: { fontSize: '11px', colors: '#6c757d' },
          },
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          fontSize: '12px',
          markers: { radius: 4 },
        },
        grid: {
          borderColor: '#f0f0f0',
          strokeDashArray: 3,
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: (val) => '$ ' + val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          },
        },
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
  color: #28a745;
  font-size: 1rem;
}
.badge-info-small {
  font-size: 0.65rem;
  font-weight: 400;
}
</style>
