<template>
  <div>
    <b-container>
      <b-row>
        <b-col>
          <h2 class="mb-4">
            Reporte de insumos y productos orden
            {{ $route.params.index }}
          </h2>
          <b-overlay
            :show="overlay"
            spinner-small
          >
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
          </b-overlay>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      overlay: true,
      dataTable: [],
      products: [],
    };
  },

  methods: {
    async getReport() {
      await this.$axios
        .get(
          `${this.$config.API}/insumos/reporte/orden/${this.$route.params.index}`
        )
        .then((resp) => {
          this.dataTable = resp.data;
          this.overlay = false;
        });
    },

    async getProducts() {
      await this.$axios.get(`${this.$config.API}/products`).then((resp) => {
        this.products = resp.data;
        // this.overlay = false
      });
    },

    filterProduct(id_product) {
      let product = this.products
        .filter((prod) => prod.id == id_product)
        .map((item) => {
          return item.name;
        });
      return product[0];
    },
  },
  created() {
    this.getProducts().then(() => this.getReport());
    // this.getReport()
  },
};
</script>
