<template>
  <div class="chart-container">
    <client-only>
      <div v-if="hasData">
        <apexchart
          type="bar"
          height="300"
          :options="chartOptions"
          :series="series"
        />
        <div class="financial-summary mt-2 text-center">
            <b-badge variant="success" class="mr-2" style="background-color: #00E396; border: none;">Cobrado: ${{ formatCurrency(collected) }}</b-badge>
            <b-badge variant="danger" style="background-color: #FF4560; border: none;">Pendiente: ${{ formatCurrency(pending) }}</b-badge>
        </div>
      </div>
      <div v-else class="text-center text-muted py-5">
        No hay datos financieros disponibles.
      </div>
    </client-only>
  </div>
</template>

<script>
export default {
  name: "ReceivableChart",
  props: {
    sold: {
      type: Number,
      default: 0
    },
    collected: {
        type: Number,
        default: 0
    }
  },
  computed: {
    hasData() {
        return this.sold > 0 || this.collected > 0;
    },
    pending() {
        return Math.max(0, this.sold - this.collected);
    },
    series() {
      return [{
        name: 'Monto',
        data: [this.sold, this.collected, this.pending]
      }];
    },
    chartOptions() {
      return {
        chart: {
          type: 'bar',
          height: 300,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            distributed: true, // Colores distintos por barra
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          }
        },
        colors: ['#008FFB', '#00E396', '#FF4560'], // Azul (Vendido), Verde (Cobrado), Rojo (Pendiente)
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return "$" + val.toFixed(2);
          },
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ["#304758"]
          }
        },
        xaxis: {
          categories: ['Total Vendido', 'Cobrado', 'Pendiente'],
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          title: {
            text: 'Monto ($)'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return "$ " + val.toFixed(2)
            }
          }
        },
        legend: {
            show: false
        }
      };
    },
  },
  methods: {
      formatCurrency(val) {
          return val.toFixed(2);
      }
  }
};
</script>

<style scoped>
.chart-container {
  min-height: 300px;
}
.financial-summary {
    display: flex;
    justify-content: center;
    gap: 10px;
    font-size: 1.1rem;
}
</style>
