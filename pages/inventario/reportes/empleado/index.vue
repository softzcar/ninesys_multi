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
                Reporte del empleado {{ nombreEmpleado }}
              </h2>
              <!-- <pre>

                {{ selectEmpleado }}
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

              <pre>
                {{ dataTable }}
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
      overlay: true,
      dataTable: [],
      products: [],      
      selectEmpleado: [], 
      selected: ''     
    }
  },

  computed: {
    ...mapState('login', ['dataUser', 'access']),
    myTable() {
      return this.dataTable.items
    },

    

    options() {
      let items = this.selectEmpleado.map(function (empleado) {
        return {
          value: empleado._id,
          text: empleado.nombre,
        }
      })
      return items
    },
  },

  methods: {
    async loadTable() {
      this.overlay = true
      await axios
      .get(`${this.$config.API}/insumos/reporte/empleado/${this.selected}`)
      .then((resp) => {
        this.dataTable = resp.data
        this.overlay = false
      })        
    }, 
    
    async loadTable2() {
      this.overlay = true
      await axios
      .get(`${this.$config.API}/insumos/reporte/insumos/${this.selected}`)
      .then((resp) => {
        this.dataTable = resp.data
        this.overlay = false
      })        
    }, 

    async getEmpleados() {
      await axios
      .get(`${this.$config.API}/empleados`)
      .then((resp) => {
        this.selectEmpleado = resp.data.items
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
    this.getEmpleados()
    this.getProducts()
  },
}
</script>
