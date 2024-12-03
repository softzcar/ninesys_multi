<template>
    <div>
        <b-button variant="primary" @click="$bvModal.show(modal)">
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
                        <!-- <p>
              {{ $props }}
              <hr>
              {{ form }}
            </p> -->
                        <p>
                            <b-overlay :show="overlay" spinner-small>
                                <b-form @submit="onSubmit" @reset="onReset">
                                    <b-form-group
                                        id="input-group-1"
                                        label="Producto:"
                                        label-for="input-producto"
                                    >
                                        <b-form-input
                                            id="input-producto"
                                            v-model="form.product"
                                            placeholder="Ingrese el producto"
                                            required
                                        ></b-form-input>
                                    </b-form-group>

                                    <b-form-group
                                        v-if="
                                            $store.state.login.dataUser.acceso
                                        "
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
                                        label="Precio:"
                                        label-for="input-precio"
                                    >
                                        <b-form-input
                                            id="input-precio"
                                            v-model="form.price"
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            placeholder="Ingrese la precio"
                                            required
                                        ></b-form-input>
                                    </b-form-group>

                                    <b-form-group
                                        id="input-group-2"
                                        label="Unidades:"
                                        label-for="input-unidades"
                                    >
                                        <b-form-input
                                            id="input-unidades"
                                            v-model="form.unidades"
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="Ingrese las unidades"
                                            required
                                        ></b-form-input>
                                    </b-form-group>

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
                                            >Seleccione una categoría</b-alert
                                        >
                                    </b-form-group>
                                    <b-button type="submit" variant="primary"
                                        >Guardar</b-button
                                    >
                                </b-form>
                            </b-overlay>
                        </p>
                    </b-col>
                </b-row>
            </b-container>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"

export default {
    data() {
        return {
            showPriceError: false,
            form: {
                id: null,
                category: null,
                product: "",
                sku: null,
                price: 0.0,
                unidades: 0,
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
        }
    },

    watch: {
        /* data() {
      this.form = {
        product: this.data.name,
        sku: this.data.sku,
        price: this.data.price,
        unidades: this.data.stock_quantity,
        category: this.data.catagories[0].id,
      }
    }, */
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },

        catagoriesSelect() {
            return this.$store.state.comerce.dataCategories.map((el) => {
                return {
                    value: el.id,
                    text: el.name,
                }
            })
        },
    },

    methods: {
        async postProduct() {
            this.overlay = true
            const data = new URLSearchParams()
            data.set("id", this.data.cod)
            data.set("product", this.form.product)
            data.set("price", this.form.price)
            data.set("category", this.form.category)
            data.set("sku", this.form.sku)
            data.set("unidades", this.form.unidades)

            await this.$axios
                .post(`${this.$config.API}/editar-producto`, data)
                .then((res) => {
                    this.$emit("r", true)
                    this.reponse = res
                    this.loading = false
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
                    console.log(
                        "Error al guardar los cambios dle producto",
                        err
                    )
                    this.$fire({
                        title: "Error editando el producto",
                        html: `<p>${{ err }}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
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
            event.preventDefault()
            this.postProduct().then(() => {
                this.$emit("reload", true).then(() => {
                    this.$bvModal.hide(modal)
                })
            })
        },

        onReset(event) {
            event.preventDefault()
            // Reset our form values
            this.form = {
                id: null,
                category: null,
                product: "",
                sku: null,
                price: 0.0,
                unidades: 0,
            }
            // Trick to reset/clear native browser form validation state
            this.show = false
            this.$nextTick(() => {
                this.show = true
            })
        },

        resetForm() {
            this.overlay = true
            this.form = {
                id: null,
                category: null,
                product: "",
                sku: null,
                price: 0.0,
                unidades: 0,
            }
            this.overlay = false
        },
    },
    mounted() {
        this.form = {
            product: this.data.name,
            sku: this.data.sku,
            price: this.data.regular_price,
            unidades: this.data.stock_quantity,
            category: this.data.categories[0].id,
        }
    },

    props: ["data", "reload"],
}
</script>
