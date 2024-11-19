<template>
  <div>
    <h2>{{ title }}</h2>
    <b-overlay :show="overlay" spinner-small>
      <b-row v-if="error.show" class="mt-4">
        <b-col>
          <b-alert show variant="danger">Danger Alert: {{ error.msg }}</b-alert>
        </b-col>
      </b-row>

      <b-row class="mt-4">
        <b-col>
          <b-table
            responsive
            :fields="dataTable.fields"
            :items="dataTable.items"
          >
            <template #cell(id)="data">
              <linkSearch :id="data.item.id" />
            </template>

            <template #cell(imagen)="data">
              <diseno-viewImage :id="data.item.imagen" />
            </template>

            <template #cell(terminar)="data">
              <diseno-terminar :id="data.item.terminar" />
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      title: 'Diseños terminados',
      error: {
        show: false,
        msg: '',
      },
      search: '',
      result: [],
      type: 'number',
      selectedType: 'orden', // orden ó cliente
      optionsSearchType: [
        { text: 'Orden', value: 'orden' },
        { text: 'Cliente', value: 'cliente' },
      ],
      placeholder: 'Buscar orden',
      overlay: true,
      items: [],
      fields: [],
    }
  },

  computed: {
    dataTable() {
      return this.$store.state.disenos.disenosTerminados
    },
  },

  methods: {
    searchThis() {
      this.error.show = false
      let id = this.search
      let filter = this.dataTable.items.filter(
        (item) => item.orden === this.search
      )
      this.result = filter
      this.search = ''
      if (filter.length === 0) {
        this.error.show = true
        this.error.msg = `No se encontró la orden ${id}`
      }
    },

    setType(type) {
      console.log(`type selected: ${type}`)
      this.selectedType = type
      if (type == 'orden') {
        this.type = 'number'
        this.placeholder = 'Buscar por número de orden'
      } else {
        this.type = 'text'
        this.placeholder = 'Buscar por nombre del cliente'
      }
    },

    terminarTarea(orden) {
      if (confirm(`¿Ha terminado el diseño de la orden ${orden}?`)) {
        console.log(`Diseño terminado`)
      } else {
        console.log(`cancelado ${orden}`)
      }
    },
  },

  mounted() {
    // this.getDisenos()
    this.$store
      .dispatch('disenos/getDisenosTerminados')
      .then(() => (this.overlay = false))
  },
}
</script>

<style scoped>
.floarme {
  float: left;
}
.floatme:first-child {
  margin-right: 20px;
}
</style>
