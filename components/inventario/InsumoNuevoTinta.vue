<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <b-container>
                <b-row>
                    <b-col>
                        <h2 class="mb-4">Nueva Tinta</h2>
                        <b-form @submit="onSubmit" @reset="onReset" novalidate>
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

                            <div class="form-group mt-3">
                                <label>Color de la Tinta:</label>
                                <div class="d-flex flex-wrap">
                                    <div class="form-check form-check-inline" v-for="colorOption in colorOptions" :key="colorOption.value">
                                        <input
                                            class="form-check-input"
                                            type="radio"
                                            :id="'color-' + colorOption.value"
                                            :value="colorOption.value"
                                            v-model="selectedColor"
                                            required
                                        />
                                        <label
                                            class="form-check-label px-2 py-1 rounded"
                                            :for="'color-' + colorOption.value"
                                            :style="{ backgroundColor: colorOption.bgColor, color: colorOption.textColor, border: colorOption.border || '' }"
                                        >
                                            {{ colorOption.name }}
                                        </label>
                                    </div>
                                </div>
                            </div>

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
                                id="input-group-mililitros"
                                label="Mililitros:"
                                label-for="input-mililitros"
                            >
                                <b-form-input
                                    id="input-mililitros"
                                    v-model="form.mililitros"
                                    placeholder="Ingrese los mililitros"
                                    type="number"
                                    min="0"
                                    step="0.01"
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

                            <!-- <b-form-group
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
                            </b-form-group> -->

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

                            <!-- <b-form-group
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
                            </b-form-group> -->
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
                mililitros: 0, // New data property
                rendimiento: 0,
                costo: 0,
                departamento: "",
                color: "",
            },
            catalogoProductos: [],
            selectedProduct: null,
            selectedColor: '',
            colorOptions: [
                { name: 'Cyan', value: 'C', bgColor: '#00FFFF', textColor: '#000000' },
                { name: 'Magenta', value: 'M', bgColor: '#FF00FF', textColor: '#000000' },
                { name: 'Yellow', value: 'Y', bgColor: '#FFFF00', textColor: '#000000' },
                { name: 'Black', value: 'K', bgColor: '#000000', textColor: '#FFFFFF' },
                { name: 'White', value: 'W', bgColor: '#FFFFFF', textColor: '#000000', border: '1px solid #ccc' },
            ],
            unidadesOptions: [
                { value: "Mts", text: "Metros" },
                { value: "Kg", text: "Kilos" },
                { value: "Und", text: "Unidades" },
            ],
            departamentOptions: this.$config.DEPARTAMENT_OPTIONS,
            size: "md",
            title: "Nueva Tinta",
            overlay: false,
        }
    },

    computed: {
        catalogoProductosOptions() {
            if (!this.catalogoProductos || this.catalogoProductos.length === 0) {
                return [{ value: null, text: "Cargando catálogo..." }];
            }
            let options = this.catalogoProductos.map(prod => {
                return { value: prod._id, text: prod.nombre };
            });
            options.unshift({ value: null, text: "Seleccione un producto" });
            return options;
        },
    },

    methods: {
        resetForm() {
            this.form = {
                insumo: "",
                sku: "",
                unidad: "",
                cantidad: "",
                mililitros: 0, // New data property
                rendimiento: 1,
                costo: 0,
                departamento: "",
                color: "",
            }
            this.selectedColor = ''
            this.selectedProduct = null
        },
        async fetchCatalogoProductos() {
            try {
                const response = await this.$axios.get(`${this.$config.API}/catalogo-insumos-productos`);
                this.catalogoProductos = response.data;
            } catch (error) {
                console.error("Error al obtener el catálogo de productos:", error);
            }
        },
        async guardarInsumo() {
            const requiredFields = {
                insumo: 'Insumo',
                sku: 'SKU',
                selectedColor: 'Color de la Tinta',
                cantidad: 'Cantidad',
                mililitros: 'Mililitros', // New required field
                selectedProduct: 'Producto del Catálogo',
                costo: 'Costo',
                rendimiento: 'Rendimiento',
            };

            for (const fieldKey in requiredFields) {
                let fieldValue;
                if (fieldKey === 'selectedColor') {
                    fieldValue = this.selectedColor;
                } else if (fieldKey === 'selectedProduct') {
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

            const data = new URLSearchParams()
            data.set("insumo", this.form.insumo)
            data.set("sku", this.form.sku)
            data.set("unidad", 'Und')
            data.set("cantidad", this.form.cantidad)
            data.set("mililitros", this.form.mililitros) // New data to send
            data.set("id_catalogo_producto", this.selectedProduct)
            data.set("rendimiento", this.form.rendimiento)
            data.set("costo", this.form.costo)
            data.set("departamento", 'Impresión')
            data.set("es_tinta", 1)
            data.set("color", this.selectedColor)

            await this.$axios
                .post(`${this.$config.API}/insumos/nuevo`, data)
                .then((res) => {
                    console.log("resultado insumo nuevo", res)

                    if (res.data && res.data && res.data.error == false) {
                        this.$fire({
                            title: "Tinta Guardada",
                            html: `<p>La tinta ha sido guardada exitosamente con.</p><p>${res.data.message}</p>`,
                            type: "success",
                        }).then(() => {
                            this.resetForm()
                            this.$bvModal.hide(this.modal) // Close modal on success
                        })
                    } else {
                        this.$fire({
                            title: "Error al Guardar",
                            html: `<p>No se pudo obtener el ID del nuevo insumo.</p><p>${res.data.message}</p>`,
                            type: "error",
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error al guardar el insumo:", error);
                    this.$fire({
                        title: "Error de Conexión",
                        html: `<p>Hubo un problema al conectar con el servidor. Intente de nuevo más tarde.</p>`,
                        type: "error",
                    });
                })
                .finally(() => {
                    this.overlay = false; // Always set overlay to false
                })
        },

        onSubmit(event) {
            event.preventDefault()
            this.guardarInsumo().then(() => this.$emit("reload"))
        },

        onReset(event) {
            event.preventDefault()
            // Reset our form values
            this.form = {
                insumo: "",
                sku: "",
                unidad: "",
                cantidad: "",
                mililitros: 0, // New data property
                rendimiento: 0,
                costo: 0,
                departamento: "",
                color: "",
            }
            this.selectedColor = ''
            this.selectedProduct = null
            // Trick to reset/clear native browser form validation state
            this.show = false
            this.$nextTick(() => {
                this.show = true
            })
        },
    },
    created() {
        this.fetchCatalogoProductos();
    },
}
</script>
