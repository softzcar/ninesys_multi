<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="dataUser.departamento === 'Administración' ||
      dataUser.departamento === 'Producción'
      ">
        <b-overlay :show="overlay" spinner-small>
          <b-container fluid v-if="dataUser.departamento === 'Administración' ||
      dataUser.departamento === 'Producción'
      ">

            <b-row>
              <b-col>
                <h2>{{ titulo }}</h2>
                <b-list-group>
                  <b-list-group-item>Buscar por orden y mostrar detalles del uso del insumo</b-list-group-item>
                  <b-list-group-item>Buscar por insumo y ver que ordenes estan vinculadas al insumo</b-list-group-item>
                  <b-list-group-item>Buscar por insumo y mostrar el rendimiento</b-list-group-item>

                </b-list-group>
              </b-col>
            </b-row>


          </b-container>
        </b-overlay>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  data() {
    return {
      titulo: 'Gestión de Inventario',
      overlay: true,
      filter: null,
      dataTableDyn: [],
      dataTable: [],
      sortBy: 'departamento',
      sortDesc: false,
      perPage: 25,
      currentPage: 1,
      selectedRadio: 'todas',
      optionsRadio: [],
      optionsRadio1: [
        { text: 'Todas', value: 'todas' },
        { text: 'Pagadas', value: 'pagadas' },
        { text: 'Pendientes', value: 'pendientes' },
      ],
      fields: [
        {
          key: 'rollo',
          label: 'ROLLO',
          sortable: false,
        },
        {
          key: 'insumo',
          label: 'NOMBRE',
          sortable: false,
        },
        {
          key: 'departamento',
          label: 'DEPARTAMENTO',
          sortable: true,
        },
        {
          key: 'rendimiento',
          label: 'RENDIMIENTO',
          sortable: false,
        },
        {
          key: 'unidad',
          label: 'UNIAD',
          sortable: false,
        },
        {
          key: 'cantidad',
          label: 'CANTIDAD',
          sortable: false,
        },
        {
          label: 'ACCIONES',
          key: '_id',
          sortable: false,
        },
      ],
    }
  },

  computed: {
    ...mapState('login', ['dataUser', 'access']),
    myTable() {
      return this.dataTable.items
    },
  },

  methods: {
    deleteInsumo(id_emp) {
      this.$confirm(
        `¿Desea Elimiar el insumo ${id_emp} ?`,
        'Eliminar Imsumo',
        'warning'
      )
        .then(() => {
          this.overlay = true
          const data = new URLSearchParams()
          data.set('id', id_emp)

          axios
            .post(`${this.$config.API}/insumos/eliminar`, data)
            .then((res) => {
              this.getInsumos().then(() => (this.overlay = false))
            })
        })
        .catch((err) => {
          console.log('CATCH!!!', err)
          return false
        })
    },

    reloadData() {
      this.overlay = true
      alert('probando recusrsividad ')
      this.overlay = false
    },

    async getInsumos() {
      await axios.get(`${this.$config.API}/inventario/todos`).then((resp) => {
        this.dataTable = []
        this.dataTable = resp.data
        this.dataTableDyn = resp.data.items

        const departamentosUnicos = new Set(
          resp.data.items.map((item) => item.departamento)
        )
        this.optionsRadio = Array.from(departamentosUnicos).map(
          (departamento) => ({
            text: departamento,
            value: departamento,
          })
        )
        this.optionsRadio.unshift({ text: 'Todos', value: 'Todos' })
        this.overlay = false
      })
    },

    showResultRadio() {
      if (this.selectedRadio === 'Todos') {
        this.dataTableDyn = this.dataTable.items
      } else {
        this.dataTableDyn = this.dataTable.items.filter(
          (el) => el.departamento === this.selectedRadio
        )
        console.log(
          `Acciones al aplicar el filtro a los insumos filtrer 
            ${this.selectedRadio}`,
          this.dataTableDyn
        )
      }
    },

    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
  },

  mounted() {
    this.getInsumos().then(() => {
      this.overlay = false
    })
  },
}
</script>

<style scoped>
.floatme {
  float: left;
  margin-right: 0.4rem;
}
</style>
