<template>
  <div>
    <apexchart
      type="donut"
      :height="height"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script>
export default {
  name: 'DesignsStatusChart',
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({ asignados: 0, propuestas_enviadas: 0, aprobados_pagados: 0 })
    },
    height: {
      type: Number,
      default: 350
    }
  },
  computed: {
    chartSeries() {
      const series = [];
      const values = [
        this.data.asignados,
        this.data.propuestas_enviadas,
        this.data.aprobados_pagados
      ];
      
      // Solo incluir valores > 0 para evitar gráfico vacío
      if (values.some(v => v > 0)) {
        return values;
      }
      
      // Si todos son 0, mostrar mensaje
      return [1]; // Placeholder para mostrar "Sin datos"
    },
    chartOptions() {
      const hasData = [this.data.asignados, this.data.propuestas_enviadas, this.data.aprobados_pagados].some(v => v > 0);
      
      return {
        chart: {
          type: 'donut'
        },
        labels: hasData 
          ? ['Asignados', 'Propuestas Enviadas', 'Aprobados/Pagados']
          : ['Sin datos'],
        colors: hasData
          ? ['#FEB019', '#008FFB', '#00E396'] // Naranja, Azul, Verde
          : ['#E0E0E0'], // Gris para sin datos
        legend: {
          position: 'bottom'
        },
        dataLabels: {
          enabled: true
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total',
                  formatter: () => {
                    const total = this.data.asignados + this.data.propuestas_enviadas + this.data.aprobados_pagados;
                    return hasData ? total : 'Sin datos';
                  }
                }
              }
            }
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return hasData ? val + ' diseños' : '';
            }
          }
        }
      };
    }
  }
};
</script>
