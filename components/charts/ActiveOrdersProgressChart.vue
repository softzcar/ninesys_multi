<template>
  <div>
    <apexchart
      :key="`progress-${data.length}`"
      type="bar"
      :height="height"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script>
export default {
  name: 'ActiveOrdersProgressChart',
  props: {
    data: {
      type: Array,
      required: true,
      default: () => []
    },
    height: {
      type: Number,
      default: 350
    }
  },
  mounted() {
    console.log('[ActiveOrdersProgressChart] mounted - data:', this.data);
  },
  watch: {
    data: {
      handler(newData) {
        console.log('[ActiveOrdersProgressChart] data changed:', newData);
      },
      deep: true
    }
  },
  computed: {
    chartSeries() {
      console.log('[ActiveOrdersProgressChart] chartSeries computed - data:', this.data);
      const series = [{
        name: 'Progreso',
        data: this.data.map(item => item.porcentaje)
      }];
      console.log('[ActiveOrdersProgressChart] chartSeries RESULT:', series);
      return series;
    },
    chartOptions() {
      const categories = this.data.map(item => `#${item.numero_orden || item.id_orden} - ${item.cliente_nombre || 'Sin nombre'}`);
      console.log('[ActiveOrdersProgressChart] chartOptions categories:', categories);
      
      return {
        chart: {
          type: 'bar',
          toolbar: {
            show: false
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '70%'
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val.toFixed(1) + '%';
          }
        },
        xaxis: {
          categories: this.data.map(item => `#${item.numero_orden || item.id_orden} - ${item.cliente_nombre || 'Sin nombre'}`),
          max: 100,
          title: {
            text: 'Porcentaje Completado'
          }
        },
        yaxis: {
          title: {
            text: 'Órdenes'
          }
        },
        colors: ['#FEB019'],
        tooltip: {
          y: {
            formatter: function (val) {
              return val.toFixed(1) + "% completado";
            }
          }
        }
      };
    }
  }
};
</script>
