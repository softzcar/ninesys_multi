<template>
  <div class="chart-container">
    <client-only>
      <div v-if="series && series.length > 0">
        <apexchart
          type="bar"
          height="350"
          :options="chartOptions"
          :series="series"
        />
      </div>
      <div v-else class="text-center text-muted py-5">
        No hay órdenes activas para mostrar progreso.
      </div>
    </client-only>
  </div>
</template>

<script>
export default {
  name: "OrderProgressChart",
  props: {
    orders: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A']
    };
  },
  computed: {
    series() {
      // Mapear el progreso (paso) de cada orden
      // Suponemos que 'paso' va de 1 a N.
      // Para ApexCharts bar chart, la data es un array de objetos con x (categoria) y y (valor)
      const data = this.orders.map(order => {
        return {
          x: `#${order.id_orden}`, // Eje Y (Categoría)
          y: order.paso,          // Valor (Longitud barra)
          goals: [
            {
              name: 'Meta',
              value: 6, // Meta fija o basada en total de pasos
              strokeHeight: 5,
              strokeColor: '#775DD0'
            }
          ]
        };
      });

      return [{
        name: 'Progreso',
        data: data
      }];
    },
    chartOptions() {
      const self = this;
      return {
        chart: {
          type: 'bar',
          height: 350,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            barHeight: '100%',
            distributed: true,
            horizontal: true,
            dataLabels: {
              position: 'bottom'
            },
          }
        },
        colors: this.colors,
        dataLabels: {
          enabled: true,
          textAnchor: 'start',
          style: {
            colors: ['#fff']
          },
          formatter: function (val, opt) {
            // Mostrar nombre del departamento dentro de la barra
            const orderIndex = opt.dataPointIndex;
            const order = self.orders[orderIndex];
            return order ? `${order.departamento} (${order.cliente})` : val;
          },
          offsetX: 0,
          dropShadow: {
            enabled: true
          }
        },
        stroke: {
          width: 1,
          colors: ['#fff']
        },
        xaxis: {
          categories: this.orders.map(o => `#${o.id_orden}`),
          min: 0,
          max: 7, // Ajustar según total de pasos máx
          tickAmount: 7,
          labels: {
            formatter: function(val) {
              return parseInt(val);
            }
          }
        },
        yaxis: {
          labels: {
            show: true
          }
        },
        title: {
          text: 'Progreso de Órdenes Activas',
          align: 'center',
          floating: true
        },
        tooltip: {
          theme: 'dark',
          x: {
            show: true
          },
          y: {
            title: {
              formatter: function () {
                return 'Paso Actual';
              }
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
  min-height: 350px;
}
</style>
