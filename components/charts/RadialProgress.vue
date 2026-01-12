<template>
  <div class="radial-progress-container">
    <client-only>
      <apexchart
        type="radialBar"
        :height="height"
        :options="chartOptions"
        :series="series"
      />
    </client-only>
    <div v-if="showLegend" class="radial-legend">
      <div 
        v-for="(item, index) in legendItems" 
        :key="index"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ backgroundColor: colors[index] }"></span>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RadialProgress',
  props: {
    // Array de valores (porcentajes 0-100)
    values: {
      type: Array,
      default: () => [75, 60, 45]
    },
    // Array de etiquetas
    labels: {
      type: Array,
      default: () => ['Creadas', 'Terminadas', 'Entregadas']
    },
    // Array de colores
    colors: {
      type: Array,
      default: () => ['#008FFB', '#00E396', '#FEB019']
    },
    // Título del gráfico
    title: {
      type: String,
      default: 'Resumen de Órdenes'
    },
    // Altura del gráfico
    height: {
      type: Number,
      default: 280
    },
    // Mostrar leyenda
    showLegend: {
      type: Boolean,
      default: true
    },
    // Valores absolutos para la leyenda
    absoluteValues: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    series() {
      return this.values
    },
    legendItems() {
      return this.labels.map((label, index) => ({
        label,
        value: this.absoluteValues[index] !== undefined 
          ? this.absoluteValues[index] 
          : `${this.values[index]}%`
      }))
    },
    chartOptions() {
      return {
        chart: {
          type: 'radialBar',
          toolbar: { show: false }
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 270,
            hollow: {
              margin: 5,
              size: '30%',
              background: 'transparent'
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
                color: '#333'
              },
              value: {
                show: true,
                fontSize: '16px',
                fontWeight: 700,
                formatter: (val) => `${Math.round(val)}%`
              },
              total: {
                show: true,
                label: 'Total',
                formatter: () => {
                  if (this.absoluteValues.length > 0) {
                    const total = this.absoluteValues.reduce((a, b) => a + b, 0)
                    return total
                  }
                  return ''
                }
              }
            },
            track: {
              background: '#e7e7e7',
              strokeWidth: '97%',
              margin: 5
            }
          }
        },
        colors: this.colors,
        labels: this.labels,
        legend: { show: false },
        stroke: {
          lineCap: 'round'
        },
        title: {
          text: this.title,
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#333'
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.radial-progress-container {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.radial-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label {
  color: #666;
}

.legend-value {
  font-weight: 600;
  color: #333;
}
</style>
