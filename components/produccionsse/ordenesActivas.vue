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
    // El backend ya no puede vincular una asignación activa a un producto/talla/
    // corte/tela específico (2026-08-13: el modelo de datos actual, LDEA, ya no
    // guarda ese vínculo) -- se agrupa por empleado con las órdenes y el
    // departamento en el que está trabajando cada una.
    dataTable() {
      return this.items.reduce((result, obj) => {
        const { empleado, orden, departamento, hora, fecha } = obj

        const employeeEntry = result.find(
          (entry) => entry.empleado === empleado
        )

        if (employeeEntry) {
          if (!employeeEntry.ordenes.includes(orden)) {
            employeeEntry.ordenes.push(orden)
          }

          employeeEntry.detalles.push({
            orden,
            departamento,
            hora: `${hora} ${fecha}`,
          })
        } else {
          result.push({
            empleado,
            ordenes: [orden],
            detalles: [
              {
                orden,
                departamento,
                hora: `${hora} ${fecha}`,
              },
            ],
          })
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
