<template>
  <div>
    <apexchart
      v-if="chartOptions.xaxis.categories.length > 0"
      type="bar"
      :height="height"
      :options="chartOptions"
      :series="series"
    />
    <b-alert v-else show variant="info" class="text-center">
      No hay datos para mostrar
    </b-alert>
  </div>
</template>

<script>
export default {
  name: 'DepartmentBarChart',
  
  props: {
    data: {
      type: Array,
      default: () => []
    },
    height: {
      type: [String, Number],
      default: 350
    }
  },

  computed: {
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
            horizontal: true,
            borderRadius: 4,
            barHeight: '70%',
            distributed: false
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '12px',
            colors: ['#fff']
          }
        },
        colors: ['#17a2b8'], // Color info de Bootstrap
        xaxis: {
          categories: this.categories,
          title: {
            text: 'Cantidad de Órdenes'
          }
        },
        yaxis: {
          title: {
            text: 'Departamento'
          }
        },
        tooltip: {
          y: {
            formatter: (val) => `${val} órdenes`
          }
        },
        responsive: [{
          breakpoint: 768,
          options: {
            chart: {
              height: 300
            },
            plotOptions: {
              bar: {
                barHeight: '60%'
              }
            },
            dataLabels: {
              style: {
                fontSize: '10px'
              }
            }
          }
        }, {
          breakpoint: 480,
          options: {
            chart: {
              height: 250
            },
            plotOptions: {
              bar: {
                barHeight: '50%'
              }
            },
            dataLabels: {
              style: {
                fontSize: '9px'
              }
            }
          }
        }]
      };
    },

    categories() {
      return this.data.map(item => item.departamento || 'Sin departamento');
    },

    series() {
      return [{
        name: 'Órdenes',
        data: this.data.map(item => item.cantidad || 0)
      }];
    }
  }
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
