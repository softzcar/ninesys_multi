<template>
  <div>
    <b-table striped hover :fields="fields" :items="ajustes">
      <template #cell(id_orden)="data">
        <linkSearch :id="data.item.id_orden" />
      </template>
      <template #cell(tallas_personalizacion)="data">
        <!-- <pre>
          {{ ajustes }}
        </pre> -->
        <disenosse-tallasPersoalizacion :item="data.item" :ajustes="ajustes" />
      </template>
    </b-table>
    <pre>
      {{ $data }}
    </pre>
  </div>
</template>

<script>
export default {
  data() {
    return {
      overlay: false,
      events: [],
      items: [],
      revisiones: [],
      ajustes: [],
      fields: [
        {
          key: 'id_orden',
          label: 'Orden',
        },
        {
          key: 'tallas_personalizacion',
          label: 'Tallas y personalizacion',
        },
      ],
    }
  },

  mounted() {
    this.loadDisenos()
  },

  methods: {
    loadDisenos() {
      this.source = new EventSource(`${this.$config.API}/sse/disenos-todo`)

      this.source.addEventListener('message', (event) => {
        const eventData = JSON.parse(event.data)
        const eventType = event.type

        if (eventType === 'chat') {
          this.events.push(eventData)
        }

        if (eventType === 'message') {
          this.events = eventData
          this.items = eventData.items.reduce((acumulador, objeto) => {
            const idOrden = objeto.id_orden
            const objetoExistente = acumulador.find(
              (item) => item.id_orden === idOrden
            )

            if (!objetoExistente) {
              acumulador.push(objeto)
            }

            return acumulador
          }, [])
          // this.revisiones = eventData.revisiones
          this.ajustes = eventData.ajustes
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
  },
}
</script>
