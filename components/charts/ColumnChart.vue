<template>
  <div class="column-chart-container">
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
  name: 'ColumnChart',
  props: {
    seriesData: {
      type: Array,
      default: () => []
    },
    seriesName: {
      type: String,
      default: 'Cantidad'
    },
    categories: {
      type: Array,
      default: () => []
    },
    color: {
      type: String,
      default: '#008FFB'
    },
    title: {
      type: String,
      default: ''
    },
    height: {
      type: Number,
      default: 350
    },
    units: {
      type: Array,
      default: () => []
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
          height: this.height,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            distributed: true, // Esto habilita colores diferentes y leyendas por categoría
            borderRadius: 8,
            columnWidth: '50%', // Menor porcentaje = más espacio entre barras
            dataLabels: {
              position: 'top',
            },
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val, opt) => {
            const unit = this.units[opt.dataPointIndex] || '';
            return val + " " + unit;
          },
          offsetY: -20,
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            colors: ["#304758"]
          }
        },
        xaxis: {
          categories: this.categories,
          labels: {
            show: false // Ocultamos las etiquetas del eje porque los nombres son muy largos
          },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: {
          labels: {
            show: true,
            formatter: (val) => val + " " + this.unit
          }
        },
        legend: {
          show: true,
          position: 'bottom',
          horizontalAlign: 'center',
          fontSize: '12px',
          markers: {
            radius: 12
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5
          }
        },
        title: {
          text: this.title,
          align: 'center',
          style: {
            fontSize: '16px',
            color: '#444'
          }
        },
        tooltip: {
          y: {
            formatter: (val) => val + " " + this.unit
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.column-chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
