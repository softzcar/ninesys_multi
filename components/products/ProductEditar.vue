<template>
  <div>
    <b-button
      variant="primary"
      @click="$bvModal.show(modal)"
    >
      <b-icon icon="pencil"></b-icon>
    </b-button>

    <b-modal
      :size="size"
      :title="title"
      :id="modal"
      cancel-disabled
      ok-disabled
      footerClass="d-none"
    >
      <b-container>
        <b-row>
          <b-col>
            <p>
              <b-overlay
                :show="overlay"
                spinner-small
              >

                <b-alert
                  show
                  variant="warning"
                >
                  <h3>Comisiones de productos</h3>
                  <p>
                    Para que el producto a crerar esté activo en el sistema debe asignar comisiones a los departamentos para este producto.
                  </p>
                  <hr>
                  <p class="mb-0">
                    <router-link
                      class="nav-link"
                      to="/comisiones-productos"
                      custom
                      v-slot="{ navigate }"
                    >
                      <span
                        @click="navigate"
                        @keypress.enter="navigate"
                        role="link"
                      >
                        <strong>Haga Click Aqui para asignar comisiones a productos</strong>
                      </span>
                    </router-link>
                  </p>
                </b-alert>
                <b-form
                  @submit="onSubmit"
                  @reset="onReset"
                >
                  <b-form-group
                    id="input-group-1"
                    label="Producto:"
                    label-for="input-product"
                  >
                    <b-form-input
                      id="input-product"
                      v-model="form.product"
                      type="text"
                      placeholder="Nombre del producto"
                      required
                    ></b-form-input>
                  </b-form-group>

                  <b-form-group
                    v-if="$store.state.login.dataUser.acceso"
                    id="input-group-2"
                    label="SKU:"
                    label-for="input-sku"
                  >
                    <b-form-input
                      id="input-sku"
                      v-model="form.sku"
                      type="text"
                      placeholder="SKU del producto"
                      required
                    ></b-form-input>
                  </b-form-group>

                  <b-form-group
                    id="input-group-3"
                    label="Precios:"
                    label-for="input-price"
                  >
                    <admin-AsignacionDePrecios
                      :precios="form.prices"
                      :product_id="data.cod"
                      @reload="updatePrices($event)"
                    />
                  </b-form-group>

                  <b-list-group>
                    <b-list-group-item
                      v-for="(item, index) in form.prices"
                      :key="index"
                    >
                      {{ item.price }} - {{ item.description }}
                    </b-list-group-item>
                  </b-list-group>
                  <b-form-group
                    id="input-group-5"
                    label="Categoría:"
                    label-for="select-category"
                  >
                    <b-form-select
                      id="select-category"
                      v-model="form.category"
                      :options="catagoriesSelect"
                      size="sm"
                      class="mt-3"
                    ></b-form-select>
                    <b-alert
                      :show="showPriceError"
                      variant="danger"
                    >Seleccione una
                      categoría</b-alert>
                  </b-form-group>

                  <b-form-group>
                    <b-form-checkbox
                      v-model="form.producto_fisico"
                      :value="1"
                      :unchecked-value="0"
                      @change="onProductoFisicoChange"
                    >
                      Producto Físico
                    </b-form-checkbox>
                    <small class="text-muted">
                      Marque esta opción si el producto es un artículo físico que requiere inventario
                    </small>
                  </b-form-group>

                  <b-form-group>
                    <b-form-checkbox
                      v-model="form.es_diseno"
                      :value="1"
                      :unchecked-value="0"
                      :disabled="form.producto_fisico === 1"
                    >
                      Es un Diseño
                    </b-form-checkbox>
                    <small class="text-muted">
                      Marque esta opción si el producto es un diseño (gráfico, logotipo, etc.)
                    </small>
                    <small
                      v-if="form.producto_fisico === 1"
                      class="text-warning"
                    >
                      <br />Los productos físicos no pueden ser diseños
                    </small>
                  </b-form-group>

                  <b-button
                    type="submit"
                    variant="primary"
                  >Guardar</b-button>
                  <!-- <b-button type="reset" variant="danger">Reset</b-button> -->
                </b-form>

                <!-- <b-form @submit="onSubmit" @reset="onReset">
                                    <b-form-group id="input-group-1" label="Producto:" label-for="input-producto">
                                        <b-form-input id="input-producto" v-model="form.product"
                                            placeholder="Ingrese el producto" required></b-form-input>
                                    </b-form-group>

                                    <b-form-group v-if="
                                        $store.state.login.dataUser.acceso
                                    " id="input-group-2" label="SKU:" label-for="input-sku">
                                        <b-form-input id="input-sku" v-model="form.sku" type="text"
                                            placeholder="SKU del producto" required></b-form-input>
                                    </b-form-group>
                                    <b-form-group id="input-group-3" label="Precio:" label-for="input-precio">
                                        <b-form-input id="input-precio" v-model="form.price" type="number" min="0"
                                            step="0.1" placeholder="Ingrese la precio" required></b-form-input>
                                    </b-form-group>

                                    <b-form-group id="input-group-2" label="Unidades:" label-for="input-unidades">
                                        <b-form-input id="input-unidades" v-model="form.unidades" type="number" min="0"
                                            step="1" placeholder="Ingrese las unidades" required></b-form-input>
                                    </b-form-group>

                                    <b-form-group id="input-group-5" label="Categoría:" label-for="select-category">
                                        <b-form-select id="select-category" v-model="form.category"
                                            :options="catagoriesSelect" size="sm" class="mt-3"></b-form-select>
                                        <b-alert :show="showPriceError" variant="danger">Seleccione una
                                            categoría</b-alert>
                                    </b-form-group>
                                    <b-button type="submit" variant="primary">Guardar</b-button>
                                </b-form> -->
              </b-overlay>
            </p>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showPriceError: false,
      form: {
        category: null,
        product: "",
        sku: null,
        prices: [],
        producto_fisico: 0,
        es_diseno: 0,
      },
      form_old: {
        id: null,
        category: null,
        product: "",
        sku: null,
        price: 0.0,
        unidades: 0,
        producto_fisico: 0,
        es_diseno: 0,
      },
      unidadesOptions: [
        { value: "Mts", text: "Metros" },
        { value: "Kg", text: "Kilos" },
        { value: "Und", text: "Unidades" },
      ],
      departamentOptions: this.$config.DEPARTAMENT_OPTIONS,
      size: "md",
      title: "Editar Producto",
      overlay: false,
    };
  },

  watch: {
    data: {
      handler(newData) {
        this.form = {
          product: newData.name,
          sku: newData.sku,
          prices: newData.prices,
          category:
            newData.categories && newData.categories.length > 0
              ? newData.categories[0].id
              : null,
          producto_fisico: newData.producto_fisico || 0,
          es_diseno: newData.es_diseno || 0,
        };
      },
      immediate: true, // Ejecuta el handler inmediatamente al crear el componente
    },
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    catagoriesSelect() {
      return (
        this.$store.state.comerce.dataCategories
          /* .filter((el) => el.parent === 35 || el.id === 38 || el.id === 91) */
          .map((el) => {
            return {
              value: el.id,
              text: el.name,
            };
          })
      );
    },

    /* catagoriesSelect() {
            return this.$store.state.comerce.dataCategories.map((el) => {
                return {
                    value: el.id,
                    text: el.name,
                }
            })
        }, */
  },

  methods: {
    updatePrices(newPrices) {
      this.form = {
        ...this.form,
        prices: newPrices,
      };
      this.$emit("reload"); // Emitir para recargar la tabla principal
    },

    onProductoFisicoChange() {
      // Si se marca como producto físico, deshabilitar "Es un Diseño" y ponerlo en false
      if (this.form.producto_fisico === 1) {
        this.form.es_diseno = 0;
      }
    },

    async postProduct() {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id", this.data.cod);
      data.set("product", this.form.product);

      data.set("category", this.form.category);
      data.set("sku", this.form.sku);
      data.set("producto_fisico", this.form.producto_fisico);
      data.set("es_diseno", this.form.es_diseno);

      await this.$axios
        .post(`${this.$config.API}/editar-producto`, data)
        .then((res) => {
          this.$emit("r", true);
          this.reponse = res;
          this.loading = false;
          /* this.form = {
            id: null,
            category: null,
            product: '',
            sku: null,
            price: 0.0,
            unidades: 0,
          } */
          // this.urlLink = res.data.linkdrive
        })
        .catch((err) => {
          console.log("Error al guardar los cambios dle producto", err);
          this.$fire({
            title: "Error editando el producto",
            html: `<p>${{ err }}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },
    /* async guardarInsumo() {
      this.overlay = true

      const data = new URLSearchParams()
      data.set('_id', this.data._id)
      data.set('insumo', this.form.insumo)
      data.set('unidad', this.form.unidad)
      data.set('cantidad', this.form.cantidad)
      data.set('departamento', this.form.departamento)

      await this.$axios
        .post(`${this.$config.API}/insumos/editar`, data)
        .then((res) => {
          console.log('resultado insumo editar', res)
          this.resetForm()
          this.$emit('reload')
          this.$bvModal.hide(this.modal)
        })
    }, */

    onSubmit(event) {
      event.preventDefault();
      this.postProduct().then(() => {
        this.$emit("reload", true).then(() => {
          this.$bvModal.hide(modal);
        });
      });
    },

    onReset(event) {
      event.preventDefault();
      // Reset our form values
      this.form = {
        category: null,
        product: "",
        sku: null,
        prices: [],
        producto_fisico: 0,
        es_diseno: 0,
      };
      // Trick to reset/clear native browser form validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },

    resetForm() {
      this.overlay = true;
      this.form = {
        category: null,
        product: "",
        sku: null,
        prices: [],
        producto_fisico: 0,
        es_diseno: 0,
      };
      this.overlay = false;
    },
  },

  props: ["data", "reload"],
};
</script>
