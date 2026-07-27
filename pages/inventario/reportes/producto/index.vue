<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="
                    dataUser.departamento === 'Administración' ||
                    dataUser.departamento === 'Producción'
                ">
        <b-overlay
          :show="overlay"
          spinner-small
        >
          <b-container>
            <b-row>
              <b-col>
                <h2 class="mb-4">
                  Reporte del producto
                  {{ getSelectedProd(selected_prod) }}
                </h2>
              </b-col>
            </b-row>
            <b-row>
              <b-col md="6">
                <label class="font-weight-bold text-secondary text-uppercase small">Buscar producto</label>
                <vue-typeahead-bootstrap
                  v-model="queryProducto"
                  :data="productsTypeaheadData"
                  @hit="onProductSelected"
                  placeholder="Escriba el nombre o código del producto..."
                  class="mb-4"
                ></vue-typeahead-bootstrap>
              </b-col>
              <b-col md="6">
                <label class="font-weight-bold text-secondary text-uppercase small">Filtrar por número de orden</label>
                <b-form-input
                  v-model="filtroOrden"
                  type="search"
                  placeholder="Ej: 6301"
                  class="mb-4"
                ></b-form-input>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-overlay
                  :show="overlay"
                  spinner-small
                >
                  <b-table
                    responsive
                    :fields="dataTable.fields"
                    :items="itemsFiltrados"
                  >
                    <template #cell(id_orden)="data">
                      <linkSearch :id="data.item.id_orden" />
                    </template>
                  </b-table>

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
import { mapState } from "vuex";
import axios from "axios";

export default {
  data() {
    return {
      selected_prod: "",
      queryProducto: "",
      filtroOrden: "",
      overlay: true,
      dataTable: [],
      products: [],
    };
  },

  computed: {
    ...mapState("login", ["dataUser", "access"]),
    myTable() {
      return this.dataTable.items;
    },
    productsTypeaheadData() {
      return this.products.map((prod) => prod.text);
    },
    itemsFiltrados() {
      const items = (this.dataTable && this.dataTable.items) || [];
      if (!this.filtroOrden.trim()) return items;
      return items.filter((item) =>
        String(item.id_orden).includes(this.filtroOrden.trim())
      );
    },
  },

  methods: {
    getSelectedProd(idProd) {
      return this.products
        .filter((prod) => prod.value === idProd)
        .map((prod) => {
          return `"${prod.text}"`;
        })[0];
    },

    onProductSelected(hit) {
      const found = this.products.find((prod) => prod.text === hit);
      if (found) {
        this.selected_prod = found.value;
        this.queryProducto = hit;
        this.loadTable();
      }
    },

    async loadTable() {
      this.overlay = true;
      await this.$axios
        .get(
          `${this.$config.API}/insumos/reporte/insumos/producto/${this.selected_prod}`
        )
        .then((resp) => {
          this.dataTable = resp.data;
          this.overlay = false;
        });
    },

    filterCategories(categories) {
      return categories.some((category) => category.id == 17);
    },

    async getProducts() {
      await this.$axios.get(`${this.$config.API}/products`).then((resp) => {
        this.products = resp.data
          .map((product) => {
            if (!this.filterCategories(product.categories)) {
              return {
                value: product.cod,
                text: `${product.cod} - ${product.name}`,
              };
            } else {
              return false;
            }
          })
          .filter((item) => item);
        this.overlay = false;
      });
    },
  },

  mounted() {
    this.getProducts();
  },
};
</script>
