<template>
  <div class="pie-chart-container">
    <client-only>
      <apexchart
        type="pie"
        :height="height"
        :options="chartOptions"
        :series="series"
      />
    </client-only>
  </div>
</template>

<script>
export default {
  name: 'PieChart',
  props: {
    values: {
      type: Array,
      default: () => []
    },
    labels: {
      type: Array,
      default: () => []
    },
    colors: {
      type: Array,
      default: () => ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0']
    },
    title: {
      type: String,
      default: ''
    },
    height: {
      type: Number,
      default: 380
    }
  },
  computed: {
    series() {
      return this.values
    },
    chartOptions() {
      return {
        chart: {
          width: 380,
          type: 'pie'
        },
        labels: this.labels,
        colors: this.colors,
        stroke: {
          show: true,
          width: 2,
          colors: ['#eee'] // Borde gris claro para delimitar sectores (especialmente el blanco)
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '14px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'bold',
            colors: ['#fff']
          },
          background: {
            enabled: true,
            foreColor: '#000',
            padding: 4,
            borderRadius: 2,
            borderWidth: 1,
            borderColor: '#fff',
            opacity: 0.9,
            dropShadow: {
              enabled: false
            }
          },
          dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            color: '#000',
            opacity: 0.45
          }
        },
        plotOptions: {
          pie: {
            dataLabels: {
              offset: -10,
              minAngleToShowLabel: 1 // Permitir mostrar etiquetas incluso en sectores muy pequeños
            }
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }],
        title: {
          text: this.title,
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#333'
          }
        },
        legend: {
          position: 'bottom',
          labels: {
            colors: ['#333'] // Forzar color de texto de leyenda a gris oscuro/negro
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.pie-chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
