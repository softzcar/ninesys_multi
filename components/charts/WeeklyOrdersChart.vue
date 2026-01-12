<template>
  <div>
    <apexchart
      type="bar"
      :height="height"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script>
export default {
  name: 'WeeklyOrdersChart',
  props: {
    data: {
      type: Array,
      required: true,
      default: () => []
    },
    height: {
      type: Number,
      default: 300
    }
  },
  computed: {
    chartSeries() {
      return [{
        name: 'Órdenes',
        data: this.data.map(item => item.total_ordenes)
      }];
    },
    chartOptions() {
      return {
        chart: {
          type: 'bar',
          toolbar: {
            show: false
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          }
        },
        dataLabels: {
          enabled: true
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: this.data.map(item => item.dia),
          title: {
            text: 'Día de la Semana'
          }
        },
        yaxis: {
          title: {
            text: 'Cantidad de Órdenes'
          }
        },
        fill: {
          opacity: 1
        },
        colors: ['#008FFB'],
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " órdenes";
            }
          }
        }
      };
    }
  }
};
</script>
