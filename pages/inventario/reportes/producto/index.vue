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
              <h2 class="mb-4">
                Reporte del producto {{ getSelectedProd(selected_prod) }}
              </h2>
            </b-col>
          </b-row>          
          <b-row>
            <b-col>
              <p>
                <b-form-select
                class="mb-4 pb-4"
                v-model="selected_prod"
                :options="products"
                @change="loadTable"
                ></b-form-select>
              </p>

            </b-col>
          </b-row>          
          <b-row>
            <b-col>
              <b-overlay :show="overlay" spinner-small>
                <b-table
                responsive
                :fields="dataTable.fields"
                :items="dataTable.items"
                >
                <template #cell(id_orden)="data">
                  <linkSearch :id="data.item.id_orden" />
                </template>

                <template #cell(id_producto)="data">
                  {{ filterProduct(data.item.id_producto) }}
                </template>
              </b-table>

              <pre>
                {{ $data }}
              </pre>
            </b-overlay>
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
      selected_prod: '',     
      overlay: true,
      dataTable: [],
      products: []      
    }
  },

  computed: {
    ...mapState('login', ['dataUser', 'access']),
    myTable() {
      return this.dataTable.items
    },
  },

  methods: {
    getSelectedProd(idProd) {
      return this.products.filter(prod => prod.value === idProd).map((prod) => {
        return `"${prod.text}"`
      })[0]
    },

    async loadTable() {
      this.overlay = true
      await axios
      .get(`${this.$config.API}/insumos/reporte/insumos/producto/${this.selected_prod}`)
      .then((resp) => {
        this.dataTable = resp.data
        this.overlay = false
      })        
    }, 

    filterCategories(categories) {
      return categories.some((category) => category.id == 17);
    },

    async getProducts() {
      await axios.get(`${this.$config.API}/products`).then((resp) => {
        this.products = resp.data.map((product) => {
          if (!this.filterCategories(product.categories)) {
            return {
              value: product.cod, 
              text: `${product.cod} - ${product.name}`
            }
          } else {
            return false
          }
        }).filter(item => item)
        this.overlay = false
      })
    },

    filterProduct(id_product) {
      let product = this.products
      .filter((prod) => prod.id == id_product)
      .map((item) => {
        return item.name
      })
      return product[0]
    },
  },


  mounted() {
    this.getProducts()
  },
}
</script>
