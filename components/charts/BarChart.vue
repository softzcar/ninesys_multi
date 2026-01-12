<template>
  <div class="bar-chart-container">
    <client-only>
      <apexchart
        type="bar"
        :height="height"
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
      default: () => [1500, 2300, 1800, 2100, 2800, 1900, 0]
    },
    // Nombre de la serie
    seriesName: {
      type: String,
      default: 'Pagos'
    },
    // Categorías (eje X)
    categories: {
      type: Array,
      default: () => ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    },
    // Color de las barras
    color: {
      type: String,
      default: '#008FFB'
    },
    // Título del gráfico
    title: {
      type: String,
      default: 'Pagos de la Semana'
    },
    // Altura del gráfico
    height: {
      type: Number,
      default: 320
    },
    // Prefijo para valores (ej: "$")
    valuePrefix: {
      type: String,
      default: '$'
    },
    // Orientación horizontal
    horizontal: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    series() {
      return [{
        name: this.seriesName,
        data: this.seriesData
      }]
    },
    chartOptions() {
      return {
        chart: {
          type: 'bar',
          toolbar: { show: false }
        },
        colors: [this.color],
        plotOptions: {
          bar: {
            horizontal: this.horizontal,
            columnWidth: '55%',
            borderRadius: 6,
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => {
            if (val === 0) return ''
            return `${this.valuePrefix}${this.formatNumber(val)}`
          },
          offsetY: -20,
          style: {
            fontSize: '11px',
            fontWeight: 600,
            colors: ['#333']
          }
        },
        xaxis: {
          categories: this.categories,
          labels: {
            style: {
              fontSize: '12px',
              colors: '#666'
            }
          },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: {
          labels: {
            formatter: (val) => `${this.valuePrefix}${this.formatNumber(val)}`,
            style: {
              fontSize: '12px',
              colors: '#666'
            }
          }
        },
        grid: {
          borderColor: '#f1f1f1',
          strokeDashArray: 4
        },
        title: {
          text: this.title,
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#333'
          }
        },
        tooltip: {
          y: {
            formatter: (val) => `${this.valuePrefix}${this.formatNumber(val)}`
          }
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 280
              },
              dataLabels: {
                enabled: false
              }
            }
          }
        ]
      }
    }
  },
  methods: {
    formatNumber(num) {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toLocaleString()
    }
  }
}
</script>

<style scoped>
.bar-chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
