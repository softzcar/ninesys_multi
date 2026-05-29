<template>
  <div class="bar-chart-container">
    <client-only>
      <apexchart
        type="bar"
        :height="computedHeight"
        :options="chartOptions"
        :series="series"
      />
    </client-only>
  </div>
</template>

<script>
export default {
  name: 'BarChart',
  props: {
    // Datos de la serie
    seriesData: {
      type: Array,
      default: () => []
    },
    // Nombre de la serie
    seriesName: {
      type: String,
      default: 'Cantidad'
    },
    // Categorías (eje Y en modo horizontal)
    categories: {
      type: Array,
      default: () => []
    },
    // Unidades por ítem (array paralelo a seriesData)
    units: {
      type: Array,
      default: () => []
    },
    // Color único de las barras (si no se usa distributed)
    color: {
      type: String,
      default: '#008FFB'
    },
    // Título del gráfico
    title: {
      type: String,
      default: ''
    },
    // Altura fija (si se pasa, sobreescribe la altura dinámica)
    height: {
      type: Number,
      default: null
    },
    // Prefijo para valores (ej: "$")
    valuePrefix: {
      type: String,
      default: ''
    },
    // Orientación horizontal (siempre true en este modo)
    horizontal: {
      type: Boolean,
      default: true
    },
    // Colores distribuidos por barra
    distributed: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    // Altura dinámica: mínimo 300px, 38px por ítem para que cada barra sea legible
    computedHeight() {
      if (this.height !== null) return this.height;
      const itemCount = this.seriesData.length;
      return Math.max(300, itemCount * 38 + 60);
    },
    series() {
      return [{
        name: this.seriesName,
        data: this.seriesData
      }];
    },
    chartOptions() {
      const hasUnits = this.units && this.units.length > 0;
      return {
        chart: {
          type: 'bar',
          toolbar: { show: false },
          animations: {
            enabled: true,
            speed: 400
          }
        },
        plotOptions: {
          bar: {
            horizontal: this.horizontal,
            distributed: this.distributed,
            borderRadius: 6,
            barHeight: '70%',
            dataLabels: {
              position: 'right'
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val, opt) => {
            if (val === 0) return '';
            const unit = hasUnits ? (this.units[opt.dataPointIndex] || '') : '';
            return `${this.valuePrefix}${this.formatNumber(val)} ${unit}`.trim();
          },
          offsetX: 8,
          style: {
            fontSize: '11px',
            fontWeight: 600,
            colors: ['#333']
          },
          background: {
            enabled: false
          }
        },
        // En modo horizontal, las categorías van en el eje Y
        xaxis: {
          labels: {
            formatter: (val) => `${this.valuePrefix}${this.formatNumber(val)}`,
            style: {
              fontSize: '11px',
              colors: '#888'
            }
          },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: {
          categories: this.categories,
          labels: {
            show: true,
            maxWidth: 200,
            style: {
              fontSize: '12px',
              colors: '#444',
              fontFamily: 'inherit'
            }
          }
        },
        // ApexCharts necesita 'labels' en xaxis cuando es horizontal=true
        // Las categorías deben ir en el bloque de xaxis cuando se usa distributed
        labels: this.categories,
        legend: {
          show: false  // Con distributed=true la leyenda se vuelve inmanejable con muchos items
        },
        grid: {
          borderColor: '#f1f1f1',
          strokeDashArray: 4,
          xaxis: {
            lines: { show: true }
          },
          yaxis: {
            lines: { show: false }
          }
        },
        title: {
          text: this.title,
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#444'
          }
        },
        tooltip: {
          y: {
            formatter: (val, opt) => {
              const unit = hasUnits ? (this.units[opt.dataPointIndex] || '') : '';
              return `${this.valuePrefix}${val.toLocaleString()} ${unit}`.trim();
            }
          }
        }
      };
    }
  },
  methods: {
    formatNumber(num) {
      if (typeof num !== 'number') return num;
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
      return num.toLocaleString();
    }
  }
};
</script>

<style scoped>
.bar-chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
