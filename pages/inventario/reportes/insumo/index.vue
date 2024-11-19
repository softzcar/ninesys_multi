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
                Reporte del insumo {{ nombreInsumo }}
              </h2>
              <!-- <pre>

                {{ selectInsumo }}
              </pre> -->
            </b-col>
          </b-row>          
          <b-row>
            <b-col>
              <p>
                <b-form-select
                class="mb-4 pb-4"
                v-model="selected"
                :options="options"
                @change="loadTable"
                ></b-form-select>
              </p>

            </b-col>
          </b-row>          
          <b-row>
            <b-col>
              <b-overlay :show="overlay" spinner-small>
                <!-- <pre>{{ dataTable }} <hr /> </pre> -->
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

              <!-- <pre>
                {{ dataTable }}
              </pre> -->
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
      overlay: true,
      dataTable: [],
      products: [],      
      selectInsumo: [], 
      selected: ''     
    }
  },

  computed: {
    ...mapState('login', ['dataUser', 'access']),
    myTable() {
      return this.dataTable.items
    },

    nombreInsumo() {

      let insumo = this.selectInsumo.filter(item => item._id === this.selected).map((item) => {return item.insumo})
      let resp = insumo[0]

      if (typeof resp === undefined) resp = ""

        return resp
    }, 

    options() {
      let items = this.selectInsumo.map(function (insumo) {
        return {
          value: insumo._id,
          text: `${insumo._id} - ${insumo.insumo}`,
        }
      })
      return items
    },
  },

  methods: {
    async loadTable() {
      this.overlay = true
      await axios
      .get(`${this.$config.API}/insumos/reporte/insumos/${this.selected}`)
      .then((resp) => {
        this.dataTable = resp.data
        this.overlay = false
      })        
    }, 

    async getInsumos() {
      await axios
      .get(`${this.$config.API}/inventario/corte`)
      .then((resp) => {
        this.selectInsumo = resp.data.items
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

  created() {
    // this.getProducts().then(() => this.getReport())
    // this.getReport()
  },

  mounted() {
    this.getInsumos()
    // this.getProducts()
  },
}
</script>
