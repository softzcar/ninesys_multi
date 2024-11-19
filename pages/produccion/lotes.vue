<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div
        v-if="
          dataUser.departamento === 'Administración' ||
          dataUser.departamento === 'Producción'
        "
      >
        <b-overlay :show="overlay" spinner-small>
          <b-container>
            <b-row>
              <b-col>
                <h2 class="mb-4">{{ titulo }}</h2>
                <!-- <admin-TelasNuevo @reload="getLotes" /> -->
              </b-col>
            </b-row>

            <b-row>
              <b-col class="pb-4 pt-2">
                <span class="floatme">
                  <b-form-select
                    v-model="selected"
                    :options="options"
                  ></b-form-select>
                </span>
                <span class="floatme">
                  <b-button @click="loadData" variant="default">
                    <b-icon icon="search"></b-icon>
                  </b-button>
                </span>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <b-table responsive :items="dataTable">
                  <template #cell(acciones)="data">
                    <admin-updateInsumo :item="data.item" />
                    <admin-resumenLotes
                      :name="data.item.name"
                      :curritem="data.item"
                    />
                    <!-- <pre>{{ data.item }}</pre> -->
                  </template>
                  <template #cell(eliminar)="data">
                    <span class="floatme">
                      <b-button
                        variant="danger"
                        v-on:click="
                          deleteLote(data.item.tela, data.item.eliminar)
                        "
                      >
                        <b-icon icon="trash"></b-icon>
                      </b-button>
                    </span>
                  </template>
                </b-table>
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>
      </div>

      <div v-else><accessDenied /></div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import { urlToHttpOptions } from 'http'

export default {
  data() {
    return {
      titulo: 'Gestión de Lotes',
      overlay: true,
      selected: null,
      options: [],
      dataTable: [],
      /* fields: [
        {
          key: 'tela',
          label: 'Tela',
        },
        {
          key: '_id',
          label: 'Acciones',
        },
      ], */
    }
  },
  computed: {
    ...mapState('login', ['dataUser', 'access']),
  },
  methods: {
    loadData() {
      if (this.selected === null) {
        this.$fire({
          title: 'Seleccione una tela',
          html: ``,
          type: 'info',
        })
      } else {
        this.detallesItem()
      }
    },

    filterItem(id) {
      return this.dataTable.filter((el) => el.id === id)
    },

    prepareOptionsTelas(telas) {
      let options = telas.map((el) => {
        return {
          value: el.tela,
          text: el.tela,
        }
      })
      options.unshift({ value: 'all', text: 'Todas las telas' })
      options.unshift({ value: null, text: 'Seleccione una tela' })
      return options
    },

    async getLotes() {
      await axios
        .get(`${this.$config.API}/lotes-fisicos/tabla-editar`)
        .then((resp) => {
          this.dataTable = this.joinData(resp.data.categories, resp.data.items)
          this.options = this.prepareOptionsTelas(resp.data.telas)
          // this.dataTable = resp.data

          // this.overlay = false
        })
    },

    loadData() {
      if (this.selected === null) {
        this.$fire({
          title: 'Seleccione una tela',
          html: ``,
          type: 'info',
        })
      } else {
        this.getLotesFilter()
      }
    },

    async getLotesFilter() {
      this.overlay = true
      const data = new URLSearchParams()
      data.set('tela', this.selected)

      await axios
        .post(`${this.$config.API}/lotes-fisicos/tabla-editar-filter`, data)
        .then((resp) => {
          this.dataTable = this.joinData(resp.data.categories, resp.data.items)
          this.telas = resp.data.telas
        })
        .finally(() => {
          this.overlay = false
        })
    },

    joinData(categories, items) {
      // Crear un mapa (diccionario) de categorías para facilitar la búsqueda por ID
      const categoriesMap = {}
      categories.forEach((category) => {
        categoriesMap[category.id] = category.name
      })

      // Usar map para reemplazar el campo "categoria_tienda" por el nombre de la categoría
      const itemsWithCategoryNames = items.map((item) => {
        const categoryId = item.categoria_tienda
        const categoryName = categoriesMap[categoryId]

        // Crear un nuevo objeto con el mismo contenido y el campo "categoria_tienda" reemplazado
        return {
          ...item,
          categoria_tienda: categoryName,
        }
      })

      return itemsWithCategoryNames
    },

    deleteLote(tela, idLote) {
      this.$confirm(
        `¿Desea Elimiar el lote ${idLote} ${tela} ?`,
        'Eliminar Lote',
        'warning'
      )
        .then(() => {
          this.overlay = true
          const data = new URLSearchParams()
          data.set('id', idLote)

          axios
            .post(`${this.$config.API}/lotes-fisicos/eliminar`, data)
            .then((res) => {
              this.getLotes().then(() => (this.overlay = false))
            })
        })
        .catch((err) => {
          this.$fire({
            title: `No se eliminó el lote`,
            html: err,
            type: 'warning',
          })
          console.log('CATCH!!!', err)
          return false
        })
    },
  },
  mounted() {
    this.getLotes().then(() => {
      this.overlay = false
    })
  },
}
</script>
