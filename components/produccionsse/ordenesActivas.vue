<template>
  <div>
    <b-container fluid>
      <b-row>
        <b-col>
          <b-table striped small :items="dataTable">
            <template #cell(ordenes)="data">
              <div v-for="orden in data.item.ordenes" class="floatme">
                <linkSearch class="floatme" :id="orden" />
              </div>
            </template>
            <template #cell(detalles)="data">
              <produccionsse-ordenesActivasDetalles
                :items="data.item.detalles"
              />
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      empleados: [],
      overlay: false,
    }
  },

  computed: {
    dataTable() {
      return this.items.reduce((result, obj) => {
        const {
          empleado,
          orden,
          producto,
          cantidad,
          talla,
          corte,
          tela,
          hora,
          fecha,
        } = obj

        // Verificar si ya existe una entrada para el empleado en el resultado
        const employeeEntry = result.find(
          (entry) => entry.empleado === empleado
        )

        if (employeeEntry) {
          // Verificar si la orden ya existe en el vector de órdenes del empleado
          if (!employeeEntry.ordenes.includes(orden)) {
            // Si la orden no existe, agregarla al vector de órdenes
            employeeEntry.ordenes.push(orden)
          }

          // Crear el detalle con los campos requeridos
          const detalle = {
            orden,
            producto,
            cantidad,
            talla,
            corte,
            tela,
            hora: `${hora} ${fecha}`,
          }

          // Agregar el detalle al vector de detalles
          employeeEntry.detalles.push(detalle)
        } else {
          // Si el empleado no existe, crear una nueva entrada
          const newEntry = {
            empleado,
            ordenes: [orden],
            detalles: [
              {
                orden,
                producto,
                cantidad,
                talla,
                corte,
                tela,
                hora: `${hora} ${fecha}`,
              },
            ],
          }

          // Agregar la nueva entrada al resultado
          result.push(newEntry)
        }

        return result
      }, [])
    },
  },
  methods: {
    // El endpoint /sse/produccion/ordenes-activas dejó de transmitir Server-Sent
    // Events reales hace tiempo (el backend solo devuelve un JSON normal,
    // Content-Type: application/json) -- EventSource exige el formato/encabezado
    // text/event-stream, así que la conexión se cancelaba sola en el navegador
    // sin ningún dato (reportado 2026-08-13: "(canceled)" en el panel de red,
    // la página solo mostraba el título). El resto de componentes de este mismo
    // patrón que sí funcionan (ej. controlDeProduccionPro.vue, contra el
    // endpoint hermano /sse/produccion) ya usan axios normal, no EventSource.
    async loadOrdersProduction() {
      this.overlay = true
      try {
        const { data } = await this.$axios.get(
          `${this.$config.API}/sse/produccion/ordenes-activas`
        )
        this.items = data.items || []
      } catch (error) {
        console.error('Error al cargar órdenes activas:', error)
      } finally {
        this.overlay = false
      }
    },
  },
  mounted() {
    this.loadOrdersProduction()
  },
}
</script>
