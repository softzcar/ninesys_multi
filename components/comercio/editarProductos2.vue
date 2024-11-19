<template>
  <div>
    <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
      <b-icon icon="check2-circle"></b-icon>
    </b-button>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-overlay :show="overlay" spinner-small>
        <b-container>
          <b-row>
            <b-col lg="6">
              <b-row>
                <b-col lg="6" class="mt-4">
                  <products-new @r="getResponseNewProduct" />
                </b-col>
              </b-row>
              <br />
              <vue-typeahead-bootstrap
                @hit="loadProduct"
                :data="productsSelect"
                v-model="query"
                placeholder="Seleccione los productos"
              />
            </b-col>
          </b-row>

          <b-row>
            <b-col lg="12" class="mt-4">
              <b-table
                responsive
                ::primary-key="form.productos.item"
                :fields="campos"
                :items="form.productos"
              >
                <template #cell(nombre)="data">
                  <a :href="`#${data.item.producto}`">{{
                    data.item.item.producto
                  }}</a>
                </template>

                <template #cell(item)="data">
                  {{ data.index + 1 }}
                </template>

                <template #cell(cantidad)="data">
                  <b-form-input
                    v-model="form.productos[data.index].cantidad"
                    min="0"
                    type="number"
                    @change="setCantidad"
                  ></b-form-input>
                </template>

                <template #cell(corte)="data">
                  <b-form-select
                    v-model="form.productos[data.index].corte"
                    :options="cortes"
                  ></b-form-select>
                </template>

                <template #cell(talla)="data">
                  <b-form-select
                    v-model="form.productos[data.index].talla"
                    :options="mySizes"
                  ></b-form-select>
                </template>

                <template #cell(tela)="data">
                  <b-form-select
                    v-model="form.productos[data.index].tela"
                    :options="myTelas"
                  ></b-form-select>
                </template>

                <template #cell(acciones)="data">
                  <div>
                    <span>
                      <b-button
                        variant="primary"
                        icon="ti-check"
                        @click="duplicateItem(data.index, data.item)"
                      >
                        <b-icon-box-arrow-in-left></b-icon-box-arrow-in-left>
                      </b-button>
                    </span>
                    <span>
                      <b-button
                        variant="danger"
                        icon="ti-check"
                        @click="removeItem(data.index)"
                      >
                        <b-icon-trash></b-icon-trash>
                      </b-button>
                    </span>
                  </div>
                </template>
              </b-table>
            </b-col>

            <b-col lg="12">
              <h3 class="mb-4 mt-4">Observaciones</h3>
              <quill-editor
                v-model="form.obs"
                @change="onEditorChange($event)"
              ></quill-editor>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
      <!-- <pre>{{ $data.form }}</pre> -->
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      overlay: false,
      size: 'xl',
      title: 'Editar productos de la orden ' + this.item.orden,
      productsSelect: [],
      form: {
        id: this.item.orden,
        products: [], // Datos para la tabla de productos
        obs: '',
      },
      campos: [
        { key: 'item', label: 'Item' },
        { key: 'cod', label: 'cod' },
        { key: 'producto', label: 'producto' },
        { key: 'precio', label: 'precio' },
        { key: 'existencia', label: 'existencia' },
        { key: 'cantidad', label: 'cantidad' },
        { key: 'talla', label: 'talla', tdClass: 'min-width' },
        { key: 'corte', label: 'corte' },
        { key: 'tela', label: 'tela' },
        { key: 'acciones', label: 'acciones' },
      ],
      mySizes: [], // TODO cargar desde api2
      myTelas: [], // TODO cargar desde api2
      cortes: [
        {
          value: 'No aplica',
          text: 'No aplica',
        },
        {
          value: 'Damas',
          text: 'Damas',
        },
        {
          value: 'Caballeros',
          text: 'Caballeros',
        },
        {
          value: 'Niños',
          text: 'Niños',
        },
      ],
    }
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)
      return `modal-${rand}`
    },
  },

  methods: {
    setCantidad(val) {
      console.log('setCantidad', val)
    },
    getMySizes(val) {
      console.log('mySizes', val)
    },
    getCortes(val) {
      console.log('cortes', val)
    },
    getMyTelas(val) {
      console.log('myTelas', val)
    },
    /* *** */
    async getProducts() {
      await fetch(`${this.$config.API}/products`)
        .then((res) => res.json())
        .then((res) => {
          this.productsSelect = res
          this.overlay = false
        })
    },

    async getProductsOrder() {
      await axios
        .get(`${this.$config.API}/productos-asignados/${this.item.orden}`)
        .then((resp) => {
          this.form.products = resp.data.data
          // this.overlay = false
        })
    },
  },

  mounted() {
    this.overlay = true
    this.getProductsOrder().then(() =>
      this.getProducts().then(() => (this.overlay = false))
    )
  },

  props: ['item'],
}
</script>
