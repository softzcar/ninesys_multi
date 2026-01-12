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
  name: 'SalesVsBalanceChart',
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({ ventas_mes: 0, saldo_por_cobrar: 0 })
    },
    height: {
      type: Number,
      default: 300
    }
  },
  computed: {
    chartSeries() {
      return [{
        name: 'Monto ($)',
        data: [
          this.data.ventas_mes,
          this.data.cobrado_mes || 0,
          this.data.saldo_por_cobrar
        ]
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
          enabled: true,
          formatter: function (val) {
            return '$' + val.toFixed(2);
          }
        },
        colors: ['#00E396', '#008FFB', '#FF4560'], // Verde, Azul, Rojo
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            distributed: true, // Habilitar para que cada barra tenga su propio color
            endingShape: 'rounded'
          }
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: ['Ventas del Mes', 'Cobrado', 'Saldo por Cobrar']
        },
        yaxis: {
          title: {
            text: 'Monto ($)'
          },
          labels: {
            formatter: function (val) {
              return '$' + val.toLocaleString('es-MX');
            }
          }
        },
        legend: {
          show: false
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return '$' + val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
          }
        }
      };
    }
  }
};
</script>
