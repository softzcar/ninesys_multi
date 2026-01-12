<template>
  <div>
    <apexchart
      type="donut"
      height="300"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script>
export default {
  props: {
    finished: {
      type: Number,
      required: true,
      default: 0
    },
    actives: {
      type: Number,
      required: false,
      default: 0
    },
    pending: {
      type: Number,
      required: true,
      default: 0
    },
    paused: {
      type: Number,
      required: false,
      default: 0
    }
  },
  computed: {
    series() {
      const data = [];
      
      if (this.finished > 0) data.push(this.finished);
      data.push(this.actives);
      data.push(this.pending);
      if (this.paused > 0) data.push(this.paused);
      
      return data;
    },
    chartOptions() {
      return {
        chart: {
          type: 'donut',
        },
        labels: this.computedLabels,
        colors: this.computedColors,
        dataLabels: {
          enabled: true
        },
        plotOptions: {
          pie: {
            donut: {
                size: '65%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: 'Total',
                        formatter: function (w) {
                            return w.globals.seriesTotals.reduce((a, b) => {
                                return a + b
                            }, 0)
                        }
                    }
                }
            }
          }
        },
        legend: {
          position: 'bottom'
        }
      };
    },
    computedLabels() {
      const labels = [];
      
      if (this.finished > 0) labels.push('Terminadas');
      labels.push('Activas');
      labels.push('Pendientes');
      if (this.paused > 0) labels.push('Pausadas');
      
      return labels;
    },
    computedColors() {
      const colors = [];
      
      if (this.finished > 0) colors.push('#00E396'); // Verde - Terminadas
      colors.push('#008FFB'); // Azul - Activas
      colors.push('#FEB019'); // Amarillo - Pendientes
      if (this.paused > 0) colors.push('#FF4560'); // Rojo - Pausadas
      
      return colors;
    }
  }
};
</script>
