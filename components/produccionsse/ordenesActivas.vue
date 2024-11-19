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
import { prependListener } from 'process'

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
    loadOrdersProduction() {
      this.source = new EventSource(
        `${this.$config.API}/sse/produccion/ordenes-activas`
      )
      this.source.addEventListener('message', (event) => {
        const eventData = JSON.parse(event.data)
        const eventType = event.type
        if (eventType === 'chat') {
          this.events.push(eventData)
        }
        if (eventType === 'message') {
          this.events = eventData
          this.items = eventData.items
          this.overlay = false
        }
      })
      this.source.addEventListener('error', (error) => {
        console.error('Error in SSE connection:', error)
        // alert(error)
        this.source.close() // Cerrar la conexión actual
        // Intentar reconectar después de un cierto período de tiempo
        /* setTimeout(() => {
          this.connectToServer()
        }, 120000) // Puedes ajustar el tiempo de espera según tus necesidades */
      })
    },
    connectToServer() {
      this.loadOrdersProduction()
    },
    closeConnection() {
      if (this.source) {
        this.source.close()
        this.source = null
      }
    },
  },
  mounted() {
    this.connectToServer()

    // Eliminar el evento 'beforeunload' para evitar cierres de conexión innecesarios
    window.removeEventListener('beforeunload', this.closeConnection)
  },

  beforeDestroy() {
    // Cerrar la conexión SSE antes de que el componente se destruya
    this.closeConnection()

    // Eliminar el evento 'beforeunload' para evitar cierres de conexión innecesarios
    window.removeEventListener('beforeunload', this.closeConnection)
  },

  components: { prependListener },
}
</script>
