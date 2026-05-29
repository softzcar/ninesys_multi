<template>
  <div class="grafico-card" v-if="hasData">
    <div class="grafico-header">
      <b-icon icon="speedometer2" class="grafico-header-icon" />
      <span>Eficiencia de Insumos por Orden</span>
    </div>
    <apexchart
      type="area"
      height="340"
      :options="chartOptions"
      :series="series"
    />
  </div>
  <div class="grafico-card grafico-empty" v-else>
    <b-icon icon="speedometer" font-scale="2.5" class="text-muted" />
    <p class="mt-2 text-muted mb-0">Sin datos para mostrar</p>
  </div>
</template>

<script>
export default {
  name: 'ReporteCostosGraficoEficiencia',
  props: {
    reportData: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    hasData() {
      return this.reportData.some(r => r.eficiencia_insumos !== undefined && r.eficiencia_insumos !== null);
    },
    series() {
      const data = this.reportData.map(r => Number(r.eficiencia_insumos || 0)).reverse();
      return [{ name: 'Eficiencia (%)', data }];
    },
    categories() {
      // Mostrar la orden más reciente arriba (en este caso a la derecha)
      return this.reportData.map(r => `#${r.id_orden}`).reverse();
    },
    chartOptions() {
      return {
        chart: {
          type: 'area',
          toolbar: { show: false },
          fontFamily: 'inherit',
          animations: { enabled: true, easing: 'easeinout', speed: 400 },
        },
        stroke: {
          curve: 'smooth',
          width: 2.5,
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [0, 95, 100],
          },
        },
        colors: ['#6f42c1'],
        dataLabels: {
          enabled: false,
        },
        markers: {
          size: 0,
          hover: {
            size: 5,
          },
        },
        xaxis: {
          categories: this.categories,
          labels: {
            show: true,
            rotate: -45,
            rotateAlways: false,
            hideOverlappingLabels: true,
            style: { fontSize: '10px', colors: '#6c757d' },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
          title: { text: 'Órdenes (Cronológico)', style: { fontSize: '11px', color: '#495057', fontWeight: 500 } },
        },
        yaxis: {
          min: 0,
          max: (maxVal) => Math.max(120, Math.ceil(maxVal / 10) * 10),
          labels: {
            formatter: (val) => `${val.toFixed(0)}%`,
            style: { fontSize: '11px', colors: '#6c757d' },
          },
          title: { text: 'Eficiencia (%)', style: { fontSize: '11px', color: '#495057', fontWeight: 500 } },
        },
        grid: {
          borderColor: '#f0f0f0',
          strokeDashArray: 4,
          xaxis: { lines: { show: false } },
          yaxis: { lines: { show: true } },
        },
        annotations: {
          yaxis: [
            {
              y: 100,
              borderColor: '#28a745',
              strokeDashArray: 4,
              borderWidth: 1.5,
              label: {
                borderColor: '#28a745',
                style: {
                  color: '#fff',
                  background: '#28a745',
                  fontSize: '10px',
                  fontWeight: 600,
                },
                text: 'Objetivo (100%)',
              },
            },
          ],
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: { formatter: (val) => `${val.toFixed(1)}%` },
        },
        legend: { show: false },
        states: { hover: { filter: { type: 'lighten', value: 0.05 } } },
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
