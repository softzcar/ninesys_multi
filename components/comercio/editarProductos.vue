<template>
  <div>
    <b-button
      class="mb-4"
      variant="primary"
      @click="$bvModal.show(modal)"
    >
      <b-icon icon="check2-circle"></b-icon>
    </b-button>

    <b-modal
      :size="size"
      :title="title"
      :id="modal"
      hide-footer
    >
      <div v-if="editable">
        <b-overlay
          :show="overlay"
          spinner-small
        >
          <b-container>
            <b-row>
              <b-col lg="6">
                <b-row>
                  <b-col
                    lg="6"
                    class="mt-4"
                  >
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
              <b-col
                lg="12"
                class="mt-4"
              >
                <b-table
                  responsive
                  :fields="campos"
                  :items="form.products"
                >
                  <template #cell(name)="data">
                    <a :href="`#${data.item.name}`">{{
                                            data.item.item.name
                                        }}</a>
                  </template>

                  <template #cell(item)="data">
                    {{ data.index + 1 }}
                  </template>

                  <template #cell(cantidad)="data">
                    <b-form-input
                      v-model="
                                                form.products[data.index]
                                                    .cantidad
                                            "
                      min="0"
                      type="number"
                      @change="
                                                updateMonto(
                                                    form.products[data.index]
                                                )
                                            "
                    ></b-form-input>
                  </template>

                  <template #cell(corte)="data">
                    <b-form-select
                      v-model="
                                                form.products[data.index].corte
                                            "
                      :options="cortes"
                      @change="
                                                updateCorte(
                                                    form.products[data.index]
                                                )
                                            "
                    ></b-form-select>
                  </template>

                  <template #cell(talla)="data">
                    <b-form-select
                      v-model="
                                                form.products[data.index].talla
                                            "
                      :options="mySizes"
                      @change="
                                                updateTalla(
                                                    data.index,
                                                    form.products[data.index]
                                                )
                                            "
                    ></b-form-select>
                  </template>

                  <template #cell(tela)="data">
                    <b-form-select
                      v-model="
                                                form.products[data.index].tela
                                            "
                      :options="myTelas"
                      @change="
                                                updateTela(
                                                    form.products[data.index]
                                                )
                                            "
                    ></b-form-select>
                  </template>

                  <template #cell(acciones)="data">
                    <div>
                      <span style="
                                                    float: left;
                                                    margin-left: 4px;
                                                ">
                        <b-button
                          variant="primary"
                          icon="ti-check"
                          @click="
                                                        duplicateItem(
                                                            data.index,
                                                            data.item
                                                        )
                                                    "
                        >
                          <b-icon-box-arrow-in-left></b-icon-box-arrow-in-left>
                        </b-button>
                      </span>
                      <span style="
                                                    float: left;
                                                    margin-left: 4px;
                                                ">
                        <b-button
                          variant="danger"
                          icon="ti-check"
                          @click="
                                                        removeItem(
                                                            data.index,
                                                            data.item
                                                        )
                                                    "
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
                  :options="quillOptions"
                ></quill-editor>
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>
      </div>

      <div v-else>
        <b-alert
          show
          variant="warning"
        >
          <h4 class="alert-heading">
            El lote {{ item.orden }} se encuentra en producción
          </h4>
          <p>Ya no es posible hacer cambios a esta orden.</p>
          <p class="mb-0">
            Para añadir productos,
            <NuxtLink to="/comercializacion/ordenes">
              cree una orden nueva</NuxtLink>
            y
            <strong>vinculela la Orden número {{ item.orden }}.</strong>
          </p>
        </b-alert>
      </div>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import mixins from "~/mixins/mixins.js";
import { log } from "console";

export default {
  data() {
    return {
      editable: false,
      overlay: false,
      size: "xl",
      title: "Editar productos de la orden " + this.item.orden,
      productsSelect: [],
      products: [],
      query: "",
      form: {
        id: this.item.orden,
        products: [], // Datos para la tabla de productos
        obs: "",
      },
      campos: [
        // { key: 'item', label: 'Item' },
        { key: "cod", label: "ID" },
        { key: "producto", label: "producto" },
        { key: "precio", label: "precio" },
        { key: "existencia", label: "existencia" },
        { key: "cantidad", label: "cantidad" },
        { key: "talla", label: "talla", tdClass: "min-width" },
        { key: "corte", label: "corte" },
        { key: "tela", label: "tela" },
        { key: "acciones", label: "acciones" },
      ],
      mySizes: [],
      myTelas: [],
      cortes: [
        {
          value: "No aplica",
          text: "No aplica",
        },
        {
          value: "Damas",
          text: "Damas",
        },
        {
          value: "Caballeros",
          text: "Caballeros",
        },
        {
          value: "Niños",
          text: "Niños",
        },
      ],
    };
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },

  methods: {
    recalcularSegunTalla(index, item) {
      // verificar si la talla es XL
      console.log("recacultar talla index", index);
      console.log("recacultar talla item", item);
      let miTalla = item.talla.split("XL");
      let montoXL = 0;
      let finlaPrice = 0;

      if (miTalla.length === 2) {
        if (!miTalla[0]) {
          montoXL = 1; // Un dolar adiconal por la talla XL
        } else {
          montoXL = parseInt(miTalla[0]);
        }
        // this.form.productos[index].xl = montoXL
        finlaPrice = (
          parseFloat(this.form.products[index].precioWoo) + montoXL
        ).toFixed(0);
      } else {
        finlaPrice = this.form.products[index].precioWoo;
      }

      this.form.products[index].precio = finlaPrice;
      // this.montoTotalOrden()
    },

    async saveObs() {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("obs", this.form.obs);
      data.set("id", this.item.orden);
      data.set("empleado", this.$store.state.login.dataUser.username);

      await this.$axios
        .post(`${this.$config.API}/orden/edit/obs`, data)
        .then((res) => {
          this.overlay = false;
          // this.$emit('reload', 'true')
        });
    },

    async verificarEdicion() {
      // /ordenes/verificar-edición
      await this.$axios
        .get(`${this.$config.API}/ordenes/verificar-edición/${this.item.orden}`)
        .then((resp) => {
          let paso = resp.data.paso;
          console.log(" paso para vetrificar si es editable", paso);
          if (paso === "diseno" || paso === "produccion") {
            this.editable = true;
          } else {
            this.editable = false;
          }
          // this.overlay = false
        });
    },
    onEditorChange({ editor, html, text }) {
      console.log("editor change!", editor, html, text);
      this.form.obs = html;
    },

    async updateMonto(item) {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id", item._id);
      data.set("id_orden", item.id_orden);
      data.set("cantidad", item.cantidad);
      data.set("accion", "editar-cantidad");

      await this.$axios
        .post(`${this.$config.API}/orden/editar`, data)
        .then((res) => {
          this.overlay = false;
          // this.urlLink = res.data.linkdrive
        });
    },

    async deleteProduct(item) {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id", item._id);
      data.set("accion", "eliminar-producto");

      await this.$axios
        .post(`${this.$config.API}/orden/editar`, data)
        .then((res) => {
          this.overlay = false;
          // this.urlLink = res.data.linkdrive
        });
    },

    async insertProducto(item) {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id", item._id);
      data.set("id_orden", item.id_orden);
      data.set("id_woo", item.cod);
      data.set("name", item.producto);
      data.set("cantidad", item.cantidad);
      data.set("cantidad_lote", 0);
      data.set("talla", item.talla);
      data.set("corte", item.corte);
      data.set("tela", item.tela);
      data.set("precio_unitario", item.precio);
      data.set("precio_woo", item.precioWoo);
      data.set("accion", "nuevo-producto");

      await this.$axios
        .post(`${this.$config.API}/orden/editar`, data)
        .then((res) => {
          this.overlay = false;
          // this.urlLink = res.data.linkdrive
        });
    },

    async addProduct(item) {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id", item._id);
      data.set("cantidad", item.cantidad);
      data.set("accion", "editar-cantidad");

      await this.$axios
        .post(`${this.$config.API}/orden/editar`, data)
        .then((res) => {
          this.overlay = false;
          // this.urlLink = res.data.linkdrive
        });
    },

    async updateTalla(index, item) {
      this.recalcularSegunTalla(index, item);
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id", item._id);
      data.set("id_orden", item.id_orden);
      data.set("cantidad", item.talla);
      data.set("precio", item.precio);
      data.set("accion", "editar-talla");

      await this.$axios
        .post(`${this.$config.API}/orden/editar`, data)
        .then((res) => {
          this.overlay = false;
          // this.urlLink = res.data.linkdrive
        });
    },

    async updateCorte(item) {
      console.log("item recibido", item);
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id", item._id);
      data.set("cantidad", item.corte);
      data.set("accion", "editar-corte");

      await this.$axios
        .post(`${this.$config.API}/orden/editar`, data)
        .then((res) => {
          this.overlay = false;
          // this.urlLink = res.data.linkdrive
        });
    },

    async updateTela(item) {
      console.log("item recibido", item);
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id", item._id);
      data.set("id_orden", item.id_orden);
      data.set("cantidad", item.tela);
      data.set("accion", "editar-tela");

      await this.$axios
        .post(`${this.$config.API}/orden/editar`, data)
        .then((res) => {
          this.overlay = false;
          // this.urlLink = res.data.linkdrive
        });
    },

    getMySizes(val) {
      console.log("mySizes", val);
    },
    getCortes(val) {
      console.log("cortes", val);
    },
    getMyTelas(val) {
      console.log("myTelas", val);
    },
    /* *** */
    async getProducts() {
      await this.$axios(`${this.$config.API}/products`)
        .then((res) => res.json())
        .then((res) => {
          this.products = res;
          this.productsSelect = res.map((prod) => {
            return `${prod.id} | ${prod.name}`;
          });
          this.overlay = false;
        })
        .catch((err) => {
          console.log("Error en getPtroducts", err);
          // this.alert({
          //   type: 'error',
          //   titile: 'Error',
          //   html: 'Error en la conexión',
          // })
        })
        .finally(() => {
          return true;
        });
    },

    async getProductsOrder() {
      await this.$axios
        .get(`${this.$config.API}/productos-asignados/${this.item.orden}`)
        .then((resp) => {
          this.form.products = resp.data.data;
          // this.overlay = false
        });
    },

    dynamicSort(property) {
      var sortOrder = 1;
      if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
      }
      return function (a, b) {
        /* next line works with strings and numbers,
         * and you may want to customize it to your needs
         */
        var result =
          a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
        return result * sortOrder;
      };
    },

    getResponseNewProduct(res) {
      this.overlay = true;

      this.insertProducto();

      this.getProducts().then(() => {
        this.overlay = false;
      });
    },

    // TODO Al presioanr e insertar un nuevo producto presionando enter envia dos llamadas al servidor creando elproducto dos veces...
    async loadProduct(val) {
      let exploited = val.split("|");

      let prodSelected = this.products
        .filter((prod) => prod.id === parseInt(exploited[0]))
        .map((item) => {
          let resp = {
            id_woo: item.id,
            name: item.name,
            regular_price: item.regular_price,
          };
          return resp;
        });

      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id_orden", this.item.orden);
      data.set("id_woo", prodSelected[0].id_woo);
      data.set("name", prodSelected[0].name);
      data.set("cantidad", 0);
      data.set("cantidad_lote", 0);
      data.set("talla", null);
      data.set("corte", "No aplica");
      data.set("tela", null);
      data.set("precio_unitario", prodSelected[0].regular_price);
      data.set("accion", "nuevo-producto");

      await this.$axios
        .post(`${this.$config.API}/orden/editar`, data)
        .then((res) => {
          let count = 0;
          let dataProd = this.products
            .map((product) => {
              return {
                item: count++,
                cod: product.id,
                producto: product.name,
                existencia: product.stock_quantity,
                cantidad: 0,
                talla: null,
                tela: null,
                corte: "No aplica",
                precio: product.regular_price,
                precioWoo: product.precio_woo,
              };
            })
            .find((product) => product.cod == exploited[0]);

          this.query = "";

          this.form.products.push(dataProd);
          this.form.products.sort(this.dynamicSort("producto"));
          this.overlay = false;
        });

      return dataProd;
    },

    duplicateItem(index, item) {
      console.log("vamos a duplicar es item", item);

      this.insertProducto(item)
        .then(() => {
          let last = this.form.products.length - 1;
          let copy = {
            item: last,
            cod: item.cod,
            producto: item.producto,
            existencia: item.existencia,
            cantidad: item.cantidad,
            talla: item.talla,
            tela: item.tela,
            corte: item.corte,
            precio: item.precio,
            precioWoo: item.precioWoo,
          };

          console.log("item original", item);
          console.log("copia del producto a duplicar", copy);

          // this.form.products.push(copy)
          this.form.products.push(copy);

          let mySort = this.form.products.sort(function (a, b) {
            if (a.producto > b.producto) {
              return 1;
            }
            if (a.producto < b.producto) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });

          this.form.products = mySort;
          // recalcular monto total
          // this.updateMonto()
        })
        .then(() => {
          this.getProductsOrder();
        });
    },

    removeItem(index, item) {
      console.log("item para ramover", item);
      this.deleteProduct(item).then(() => {
        this.form.products.splice(index, 1);
      });
    },
    async getTelas() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/telas`)
        .then((res) => {
          this.myTelas = res.data.data.map((item) => {
            return {
              value: item.tela,
              text: item.tela,
            };
          });
        })
        .catch((err) => {
          console.error("Error consultando telas", err);
        })
        .finally(() => {
          this.overlay = false;
        });
    },
    async getTallas() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/sizes`)
        .then((res) => {
          this.mySizes = res.data.data.map((item) => {
            return {
              value: item.tela,
              text: item.tela,
            };
          });
        })
        .catch((err) => {
          console.error("Error consultando tallas", err);
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  mounted() {
    this.overlay = true;

    this.verificarEdicion()
      .then(() => {
        if (this.editable) {
          this.getProductsOrder();
          thia.getTelas();
          thia.getTallas();
          this.getProducts();

          this.form.obs = this.item.obs;
        }
      })
      .then(() => (this.overlay = false));

    // modal hide
    this.$root.$on("bv::modal::hide", (bvEvent, modal) => {
      this.saveObs();
      // console.log('Modal is about to be shown', bvEvent, modal)
    });
  },

  props: ["item"],

  mixins: [mixins],
};
</script>
