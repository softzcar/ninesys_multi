<template>
  <div>
    <apexchart
      type="radialBar"
      height="300"
      :options="chartOptions"
      :series="seriesComputed"
    ></apexchart>
    <div class="text-center mt-2">
      <h4 :class="efficiencyClass">{{ efficiencyText }}</h4>
      <p class="text-muted">Tiempo Real vs Estimado</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    realTime: {
      type: Number,
      required: true,
      default: 0
    },
    estimatedTime: {
      type: Number,
      required: true,
      default: 0
    }
  },
  computed: {
    efficiencyPercentage() {
      if (!this.realTime || this.realTime === 0) return 0;
      // Eficiencia = (Tiempo Estimado / Tiempo Real) * 100
      // Si real es menor que estimado, eficiencia > 100% (bueno)
      // Si real es mayor que estimado, eficiencia < 100% (malo)
      return Math.round((this.estimatedTime / this.realTime) * 100);
    },
    seriesComputed() {
      // Limitamos visualmente a 100%? O mostramos excedente?
      // RadialBar de Apex suele ser 0-100.
      // Si eficiencia > 100, llenamos todo.
      let val = this.efficiencyPercentage;
      if (val > 100) val = 100; 
      return [val];
    },
    efficiencyText() {
        return `${this.efficiencyPercentage}% Eficiencia`;
    },
    efficiencyClass() {
        if (this.efficiencyPercentage >= 100) return 'text-success';
        if (this.efficiencyPercentage >= 80) return 'text-primary';
        if (this.efficiencyPercentage >= 60) return 'text-warning';
        return 'text-danger';
    },
    chartOptions() {
      return {
        chart: {
          height: 300,
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: '70%',
            },
            dataLabels: {
                show: true,
                name: {
                    show: false,
                },
                value: {
                    show: true,
                    fontSize: '36px',
                    fontWeight: 'bold',
                    formatter: function (val) {
                        return val + "%";
                    }
                }
            }
          },
        },
        colors: [this.getColor(this.efficiencyPercentage)],
        labels: ['Eficiencia'],
      };
    }
  },
  methods: {
      getColor(percent) {
          if (percent >= 100) return '#00E396'; // Green
          if (percent >= 80) return '#008FFB'; // Blue
          if (percent >= 60) return '#FEB019'; // Yellow
          return '#FF4560'; // Red
      }
  }
};
</script>
