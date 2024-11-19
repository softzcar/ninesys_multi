<template>
  <div>
    <b-overlay :show="overlay">
      <b-container>
        <b-row>
          <b-col>
            <h1>Asignación de comisiones a productos</h1>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-table striped :items="productsOrdered" :fields="fields">
              <template #cell(attributes)="data">
                <admin-ComisionesProductosInputGeneral
                  :temx="data.item"
                  :idprod="data.item.cod"
                  :attributes="data.item.attributes"
                  :categories="data.item.categories"
                />
              </template>

              <template #cell(categories)="data">
                <b-badge
                  v-for="(prod, index) in showCategories(data.item.categories)"
                  :key="index"
                  pill
                  variant="info"
                  class="mr-1 mb-1 p-2"
                  >{{ prod }}</b-badge
                >
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      overlay: true,
      products: [],
      fields: [
        {
          key: 'name',
          label: 'nombre',
        },
        {
          key: 'attributes',
          label: 'comision',
        },
        {
          key: 'categories',
          label: 'categorias',
        },
      ],
    }
  },

  computed: {
    productsOrdered() {
      return this.products.sort(this.compareNames)
    },
  },

  methods: {
    compareNames(a, b) {
      const nameA = a.name.toUpperCase()
      const nameB = b.name.toUpperCase()

      let comparison = 0
      if (nameA > nameB) {
        comparison = 1
      } else if (nameA < nameB) {
        comparison = -1
      }
      return comparison
    },

    showCategories(dat) {
      const filtered = dat.map((el) => {
        return el.name
      })
      return filtered
    },

    async getAttributes() {
      await axios
        .get(`${this.$config.API}/atributos/comisiones`)
        .then((res) => {
          this.products = res.data.data
        })
    },
  },

  mounted() {
    this.overlay = true
    this.getAttributes().then(() => (this.overlay = false))
  },
}
</script>

<style lang="scss" scoped></style>
