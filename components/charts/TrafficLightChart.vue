<template>
  <div class="traffic-light-chart">
    <apexchart
      type="bar"
      height="300"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script>
export default {
  name: 'TrafficLightChart',
  props: {
    porIniciar: {
      type: Number,
      default: 0
    },
    retrasado: {
      type: Number,
      default: 0
    },
    enElDia: {
      type: Number,
      default: 0
    },
    aTiempo: {
      type: Number,
      default: 0
    },
    pausadas: {
      type: Number,
      default: 0
    }
  },
  computed: {
    series() {
      return [{
        name: 'Órdenes',
        data: [
          this.porIniciar,
          this.aTiempo,
          this.enElDia,
          this.retrasado,
          this.pausadas
        ]
      }]
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
            horizontal: true,
            distributed: true,
            barHeight: '70%'
          }
        },
        colors: [
          '#6c757d', // Gris - Por Iniciar
          '#28a745', // Verde - A Tiempo
          '#ffc107', // Amarillo - En el Día
          '#dc3545', // Rojo - Retrasado
          '#6c757d'  // Gris - Pausadas
        ],
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '14px',
            fontWeight: 'bold'
          }
        },
        xaxis: {
          categories: [
            'Por Iniciar',
            'A Tiempo',
            'En el Día',
            'Retrasado',
            'Pausadas'
          ],
          title: {
            text: 'Cantidad de Órdenes'
          }
        },
        yaxis: {
          title: {
            text: 'Estado'
          }
        },
        legend: {
          show: false
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + ' orden' + (val !== 1 ? 'es' : '')
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.traffic-light-chart {
  width: 100%;
}
</style>
