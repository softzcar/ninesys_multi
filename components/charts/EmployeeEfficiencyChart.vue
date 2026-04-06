<template>
  <div class="chart-container">
    <div v-if="loading" class="text-center py-5 text-muted">
      <b-spinner variant="primary" small class="mr-2"></b-spinner> Cargando...
    </div>
    <div v-else-if="series[0].data.length === 0" class="text-center py-5 text-muted">
      Sin datos para graficar en este periodo.
    </div>
    <div v-else>
      <client-only>
        <apexchart type="bar" :height="height" :options="chartOptions" :series="series"></apexchart>
      </client-only>
    </div>
  </div>
</template>

<script>
export default {
  name: "EmployeeEfficiencyChart",
  props: {
    dataMap: {
      type: Array, // Array of { name: 'Danuil', efficiency: 85 }
      default: () => []
    },
    height: {
      type: Number,
      default: 350
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    series() {
      // Formato esperado de dataMap: [{name: 'Juan', efficiency: 110}, ...]
      const dataPoints = this.dataMap.map(emp => {
        return {
          x: emp.name,
          y: parseFloat(emp.efficiency),
          goals: [
            {
              name: 'Expectativa',
              value: 100,
              strokeWidth: 5,
              strokeHeight: 15,
              strokeColor: '#775DD0'
            }
          ]
        };
      });
      return [{
        name: 'Eficiencia %',
        data: dataPoints
      }];
    },
    chartOptions() {
      return {
        chart: {
          type: 'bar',
          fontFamily: "'Inter', sans-serif"
        },
        plotOptions: {
          bar: {
            distributed: true,
            horizontal: false,
            borderRadius: 4,
            columnWidth: '50%'
          }
        },
        colors: [
          '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
          '#3F51B5', '#03A9F4', '#4CAF50', '#F9CE1D', '#FF9800',
          '#8D6E63', '#1DE9B6', '#E040FB', '#00B0FF', '#FF6E40'
        ],
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val + "%";
          },
          style: {
            colors: ['#fff']
          }
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          title: {
            text: 'Eficiencia (%)'
          },
          labels: {
            formatter: function (val) {
              return parseInt(val) + "%";
            }
          }
        },
        legend: {
          show: true,
          position: 'bottom',
          horizontalAlign: 'center'
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      };
    }
  }
};
</script>

<style scoped>
.chart-container {
  min-height: 200px;
}
</style>
