<template>
  <div class="line-chart-container">
    <client-only>
      <apexchart
        type="line"
        :height="height"
        :options="chartOptions"
        :series="series"
      />
    </client-only>
  </div>
</template>

<script>
export default {
  name: 'LineChart',
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
      default: '#FF4560'
    },
    title: {
      type: String,
      default: ''
    },
    height: {
      type: Number,
      default: 350
    },
    unit: {
      type: String,
      default: ''
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
          height: this.height,
          type: 'line',
          dropShadow: {
            enabled: true,
            color: '#000',
            top: 18,
            left: 7,
            blur: 10,
            opacity: 0.2
          },
          toolbar: {
            show: false
          }
        },
        colors: [this.color],
        dataLabels: {
          enabled: true,
          formatter: (val) => {
            return val + " " + this.unit;
          }
        },
        stroke: {
          curve: 'smooth'
        },
        title: {
          text: this.title,
          align: 'left'
        },
        grid: {
          borderColor: '#e7e7e7',
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
          },
        },
        markers: {
          size: 1
        },
        xaxis: {
          categories: this.categories,
          title: {
            text: 'Semana'
          }
        },
        yaxis: {
          title: {
            text: this.unit
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          floating: true,
          offsetY: -25,
          offsetX: -5
        }
      }
    }
  }
}
</script>

<style scoped>
.line-chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
