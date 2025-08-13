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
                        <p>
                            <b-overlay :show="overlay" spinner-small>
                                <b-form @submit="onSubmit" @reset="onReset">
                                    <b-form-group
                                        id="input-group-1"
                                        label="Insumo:"
                                        label-for="input-insumo"
                                    >
                                        <b-form-input
                                            id="input-insumo"
                                            v-model="form.insumo"
                                            placeholder="Ingrese el insumo"
                                            required
                                        ></b-form-input>
                                    </b-form-group>

                                    <b-form-group
                                        id="input-group-sku"
                                        label="SKU:"
                                        label-for="input-sku"
                                    >
                                        <b-form-input
                                            id="input-sku"
                                            v-model="form.sku"
                                            placeholder="Ingrese el SKU"
                                            required
                                        ></b-form-input>
                                    </b-form-group>

                                    <b-form-group
                                        id="input-group-3"
                                        label="Cantidad:"
                                        label-for="input-cantidad"
                                    >
                                        <b-form-input
                                            id="input-cantidad"
                                            v-model="form.cantidad"
                                            placeholder="Ingrese la cantidad"
                                            required
                                        ></b-form-input>
                                    </b-form-group>

                                    <b-form-group
                                        id="input-group-product-catalog"
                                        label="Producto del Catálogo:"
                                        label-for="input-product-catalog"
                                    >
                                        <b-form-select
                                            id="input-product-catalog"
                                            v-model="selectedProduct"
                                            :options="catalogoProductosOptions"
                                            required
                                        ></b-form-select>
                                    </b-form-group>

                                    <b-form-group
                                        id="input-group-2"
                                        label="Tipo de unidad:"
                                        label-for="input-unidad"
                                    >
                                        <b-form-select
                                            id="input-unidad"
                                            v-model="form.unidad"
                                            :options="unidadesOptions"
                                            required
                                        >
                                        </b-form-select>
                                    </b-form-group>

                                    <b-form-group
                                        id="input-group-4"
                                        label="Costo:"
                                        label-for="input-costo"
                                    >
                                        <b-form-input
                                            id="input-costo"
                                            v-model="form.costo"
                                            placeholder="Ingrese el costo"
                                            type="number"
                                            min="0"
                                            step="0.10"
                                        ></b-form-input>
                                    </b-form-group>

                                    <b-form-group
                                        id="input-group-3"
                                        label="Rendimiento:"
                                        label-for="input-rendimiento"
                                    >
                                        <b-form-input
                                            id="input-rendimiento"
                                            v-model="form.rendimiento"
                                            placeholder="Ingrese la cantidad"
                                            type="number"
                                            min="0"
                                            step="0.10"
                                        ></b-form-input>
                                    </b-form-group>

                                    <b-form-group
                                        id="input-group-4"
                                        label="Departamento:"
                                        label-for="input-departamento"
                                    >
                                        <b-form-select
                                            id="input-departamento"
                                            v-model="form.departamento"
                                            :options="departamentOptions"
                                            required
                                        >
                                        </b-form-select>
                                    </b-form-group>
                                    <!-- <b-button @click="resetForm" variant="danger"
                    >Limpiar</b-button
                    > -->
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
            form: {
                insumo: "",
                sku: "",
                unidad: "",
                cantidad: "",
                rendimiento: 0,
                costo: 0,
                departamento: "",
            },
            catalogoProductos: [],
            selectedProduct: null,
            unidadesOptions: [
                { value: "Mts", text: "Metros" },
                { value: "Kg", text: "Kilos" },
                { value: "Und", text: "Unidades" },
            ],
            departamentOptions: this.$config.DEPARTAMENT_OPTIONS,
            size: "md",
            title: "Editar Insumo",
            overlay: false,
        }
    },

    watch: {
        data: {
            immediate: true,
            handler(newData) {
                this.form = {
                    insumo: newData.insumo,
                    sku: newData.sku,
                    unidad: newData.unidad,
                    cantidad: newData.cantidad,
                    rendimiento: newData.rendimiento,
                    costo: newData.costo,
                    departamento: newData.departamento,
                };
                this.selectedProduct = newData.id_catalogo_producto || null;
            },
        },
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
        catalogoProductosOptions() {
            if (!this.catalogoProductosData || this.catalogoProductosData.length === 0) {
                return [{ value: null, text: "Cargando catálogo..." }];
            }
            let options = this.catalogoProductosData.map(prod => {
                return { value: prod._id, text: prod.nombre };
            });
            options.unshift({ value: null, text: "Seleccione un producto" });
            return options;
        },
    },

    methods: {
        async guardarInsumo() {
            this.overlay = true

            const data = new URLSearchParams()
            data.set("_id", this.data._id)
            data.set("insumo", this.form.insumo)
            data.set("sku", this.form.sku)
            data.set("unidad", this.form.unidad)
            data.set("cantidad", this.form.cantidad)
            data.set("rendimiento", this.form.rendimiento)
            data.set("costo", this.form.costo)
            data.set("departamento", this.form.departamento)
            data.set("id_catalogo_producto", this.selectedProduct) 

            await this.$axios
                .post(`${this.$config.API}/insumos/editar`, data)
                .then((res) => {
                    console.log("resultado insumo editar", res)
                    this.resetForm()
                    this.$emit("reload")
                    this.$bvModal.hide(this.modal)
                })
        },

        onSubmit(event) {
            event.preventDefault()
            this.guardarInsumo()
        },

        onReset(event) {
            event.preventDefault()
            // Reset our form values
            this.form = {
                insumo: "",
                sku: "",
                unidad: "",
                cantidad: "",
                rendimiento: 0,
                departamento: "",
            }
            // Trick to reset/clear native browser form validation state
            this.show = false
            this.$nextTick(() => {
                this.show = true
            })
            this.selectedProduct = null
        },

        resetForm() {
            this.overlay = true
            this.form = {
                insumo: "",
                sku: "",
                unidad: "",
                cantidad: "",
                rendimiento: 0,
                departamento: "",
            }
            this.overlay = false
            this.selectedProduct = null
        },
    },
    
    props: ["data", "catalogoProductosData"],
}
</script>
