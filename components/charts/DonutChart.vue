<template>
  <div :class="flat ? 'flat-chart' : 'donut-chart-container'">
    <client-only>
      <apexchart
        type="donut"
        :height="height"
        :options="chartOptions"
        :series="series"
      />
    </client-only>
  </div>
</template>

<script>
export default {
  name: 'DonutChart',
  props: {
    // Array de valores numéricos
    values: {
      type: Array,
      default: () => [10, 15, 3, 8]
    },
    // Array de etiquetas
    labels: {
      type: Array,
      default: () => ['En espera', 'Activas', 'Pausadas', 'Terminadas']
    },
    // Array de colores
    colors: {
      type: Array,
      default: () => ['#FEB019', '#00E396', '#FF4560', '#008FFB']
    },
    // Título del gráfico
    title: {
      type: String,
      default: 'Estado de Órdenes'
    },
    // Altura del gráfico
    height: {
      type: Number,
      default: 320
    },
    // Mostrar leyenda
    showLegend: {
      type: Boolean,
      default: true
    },
    // Valor personalizado para el centro (opcional)
    centerValue: {
      type: [String, Number],
      default: null
    },
    // Etiqueta personalizada para el centro (opcional)
    centerLabel: {
      type: String,
      default: 'Total'
    },
    // Sufijo para el tooltip (ej: "unidades", "órdenes")
    valueSuffix: {
      type: String,
      default: 'órdenes'
    },
    // Si es flat, no aplica estilo de tarjeta (sombra y fondo)
    flat: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    series() {
      return this.values
    },
    chartOptions() {
      return {
        chart: {
          type: 'donut',
          toolbar: { show: false }
        },
        colors: this.colors,
        labels: this.labels,
        legend: {
          show: this.showLegend,
          position: 'bottom',
          horizontalAlign: 'center',
          fontSize: '13px',
          markers: {
            width: 12,
            height: 12,
            radius: 6
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333'
                },
                value: {
                  show: true,
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#333',
                  formatter: (val) => val
                },
                total: {
                  show: true,
                  label: this.centerLabel,
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#666',
                  formatter: (w) => {
                    return this.centerValue !== null 
                      ? this.centerValue 
                      : w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                  }
                }
              }
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: 2,
          colors: ['#fff']
        },
        title: {
          text: this.title,
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#333'
          }
        },
        tooltip: {
          y: {
            formatter: (val) => `${val} ${this.valueSuffix}`
          }
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 280
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.donut-chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.flat-chart {
  background: transparent;
  padding: 0;
  box-shadow: none;
}
</style>
