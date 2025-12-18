<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="person-plus"></b-icon> {{ title }}
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
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
                                    <b-input-group>
                                        <b-form-select
                                            id="input-product-catalog"
                                            v-model="selectedProduct"
                                            :options="catalogoProductosOptions"
                                            required
                                        ></b-form-select>
                                        <b-input-group-append>
                                            <inventario-CatalogoInsumosProductosModal
                                                :products="products"
                                                :departamentos="departamentos"
                                                @reload="reloadCatalogo"
                                            />
                                        </b-input-group-append>
                                    </b-input-group>
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
                                <b-button type="submit" variant="primary"
                                    >Guardar</b-button
                                >
                                <b-button @click="resetForm" variant="danger"
                                    >Limpiar</b-button
                                >
                            </b-form>
                        </b-col>
                    </b-row>
                </b-container>
            </b-overlay>
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
            products: [],
            departamentos: [],
            unidadesOptions: [
                { value: "Mts", text: "Metros" },
                { value: "Kg", text: "Kilos" },
                { value: "Und", text: "Unidades" },
                { value: "Ml", text: "Mililitros" },
            ],
            size: "md",
            title: "Nuevo Insumo",
            overlay: false,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
        catalogoModal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-catalogo-${rand}`
        },
        catalogoProductosOptions() {
            if (!this.catalogoProductosData || !this.catalogoProductosData.data || this.catalogoProductosData.data.length === 0) {
                return [{ value: null, text: "Cargando catálogo..." }];
            }
            let options = this.catalogoProductosData.data.map(prod => {
                return { value: prod._id, text: prod.nombre };
            });
            options.unshift({ value: null, text: "Seleccione un producto" });
            return options;
        },
        departamentOptions() {
            return [...this.$store.state.login.departamentos]
                .sort((a, b) => a.departamento.localeCompare(b.departamento))
                .map(dep => ({
                    value: dep.departamento,
                    text: dep.departamento
                }));
        },
    },

    methods: {
        async fetchData() {
            try {
                const [productsRes, depsRes] = await Promise.all([
                    this.$axios.get(`${this.$config.API}/products`),
                    this.$axios.get(`${this.$config.API}/departamentos`),
                ]);
                this.products = productsRes.data;
                this.departamentos = depsRes.data;
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        resetForm() {
            this.overlay = true
            this.form = {
                insumo: "",
                sku: "",
                unidad: "",
                cantidad: "",
                rendimiento: 0,
                costo: 0,
                departamento: "",
            }
            this.overlay = false
            this.selectedProduct = null
        },
        reloadCatalogo() {
            this.$emit('reloadCatalogo');
        },
        async guardarInsumo() {
            const requiredFields = {
                insumo: 'Insumo',
                sku: 'SKU',
                unidad: 'Tipo de unidad',
                cantidad: 'Cantidad',
                selectedProduct: 'Producto del Catálogo',
                rendimiento: 'Rendimiento',
                costo: 'Costo',
                departamento: 'Departamento',
            };

            for (const fieldKey in requiredFields) {
                let fieldValue;
                if (fieldKey === 'selectedProduct') {
                    fieldValue = this.selectedProduct;
                } else {
                    fieldValue = this.form[fieldKey];
                }

                if (!fieldValue) {
                    this.$fire({
                        title: "Campo Requerido",
                        html: `<p>Por favor, complete el campo: <strong>${requiredFields[fieldKey]}</strong></p>`,
                        type: "warning",
                    });
                    return;
                }
            }

            if (parseFloat(this.form.rendimiento) === 0) {
                this.$fire({
                    title: "Valor Inválido",
                    html: `<p>El campo <strong>Rendimiento</strong> no puede ser cero.</p>`,
                    type: "warning",
                });
                return;
            }

            this.overlay = true

            const data = new URLSearchParams();
            data.set("insumo", this.form.insumo);
            data.set("sku", this.form.sku);
            data.set("unidad", this.form.unidad);
            data.set("cantidad", this.form.cantidad);
            data.set("rendimiento", this.form.rendimiento);
            data.set("costo", this.form.costo);
            data.set("departamento", this.form.departamento);
            data.set("es_tinta", 0);
            data.set("id_catalogo_producto", this.selectedProduct);

            try {
                const response = await this.$axios.post(`${this.$config.API}/insumos/nuevo`, data);
                if (response.data && !response.data.error) {
                    this.$fire({
                        title: "Insumo Guardado",
                        html: `<p>El insumo <strong>${this.form.insumo}</strong> ha sido guardado exitosamente.</p>`,
                        type: "success",
                    });
                    this.resetForm();
                    this.$bvModal.hide(this.modal);
                    this.$emit("reload");
                } else {
                    this.$fire({
                        title: "Error al Guardar",
                        html: `<p>${response.data.message}</p>`,
                        type: "error",
                    });
                }
            } catch (error) {
                console.error("Error al guardar el insumo:", error);
                this.$fire({
                    title: "Error de Conexión",
                    html: `<p>Hubo un problema al conectar con el servidor. Intente de nuevo más tarde.</p>`,
                    type: "error",
                });
            } finally {
                this.overlay = false;
            }
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
                costo: 0,
                departamento: "",
            }
            // Trick to reset/clear native browser form validation state
            this.show = false
            this.$nextTick(() => {
                this.show = true
            })
            this.selectedProduct = null
        },
    },
    
    props: ["catalogoProductosData"],
    mounted() {
        this.fetchData();
    },
}
</script>
