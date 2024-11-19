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
      <b-container>
        <b-row>
          <b-col>
            <h2 class="mb-4">
              Reporte de insumos por orden "{{ searchMe }}"
            </h2>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-row class="mb-4">
              <b-col sm="9">
                <b-form-input autocomplete="off" type="search" v-model="searchMe" placeholder="Buscar por orden" @change="searchThis" align-v="righr" style="width:10rem"></b-form-input>
              </b-col>
            </b-row>              
          </b-col>
        </b-row>
        
        <b-row>
          <b-col>
            <b-overlay :show="overlay" spinner-small>
              <pre>{{ dataTable }} <hr /> </pre>
              <b-table
              responsive
              :fields="dataTable.fields"
              :items="dataTable.items"
              >
              <template #cell(id_orden)="data">
                <linkSearch :id="data.item.id_orden" />
              </template>
              <template #cell(id_producto)="data">
                <linkSearch :id="data.item.id_orden" />
              </template>
            </b-table>
          </b-overlay>
        </b-col>
      </b-row>
    </b-container>
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
      overlay: false,
      dataTable: [],
      products: [],    
      searchMe: ''  
    }
  },

  computed: {
    ...mapState('login', ['dataUser', 'access']),
    myTable() {
      return this.dataTable.items
    },
  },

  methods: {
    async searchThis() {
      this.overlay =true
      let id_orden = this.searchMe.trim()
      if(id_orden.length > 0) {

        console.log('vamos a buscar', this.searchMe)
        await this.getProducts().then(() => this.getReport())

      } else {
        console.log('el cuadro de busqueda está vacio')
      }
    },

    async getReport() {
      await axios
      .get(
           `${this.$config.API}/insumos/reporte/orden/${this.searchMe}`
           )
      .then((resp) => {
        this.dataTable = resp.data
        this.overlay = false
      })
    },

    async getProducts() {
      await axios.get(`${this.$config.API}/products`).then((resp) => {
        this.products = resp.data
        // this.overlay = false
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
    this.searchMe = ''
    console.log('listos')
  }
}
</script>
