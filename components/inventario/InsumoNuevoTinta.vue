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
                                <div v-if="colorOptions.length === 0" class="text-muted small py-2">
                                    <b-spinner small></b-spinner> Cargando colores...
                                </div>
                                <div v-else class="d-flex flex-wrap" style="gap: 0.5rem;">
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
                                            class="form-check-label"
                                            :for="'color-' + colorOption.value"
                                            :style="{
                                                backgroundColor: colorOption.hex || '#cccccc',
                                                color: colorOption.textColor || '#000000',
                                                padding: '2px 10px',
                                                borderRadius: '12px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                border: selectedColor === colorOption.value ? '2px solid #333' : '2px solid transparent',
                                            }"
                                        >
                                            {{ colorOption.name }}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <b-form-group
                                id="input-group-tinta-type"
                                label="Tipo de Tinta:"
                                label-for="input-tinta-type"
                                class="mt-3"
                            >
                                <b-form-select
                                    id="input-tinta-type"
                                    v-model="selectedTintaType"
                                    :options="catalogoTintasOptions"
                                    required
                                ></b-form-select>
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
            catalogoTintas: [],
            selectedProduct: null,
            selectedTintaType: null,
            selectedColor: '',
            colorOptions: [], // Se carga dinámicamente desde /catalogo-colores-tintas
            unidadesOptions: [
                { value: "Mts", text: "Metros" },
                { value: "Kg", text: "Kilos" },
                { value: "Und", text: "Unidades" },
            ],
            departamentOptions: this.$config.DEPARTAMENT_OPTIONS,
            size: "md",
            title: "Nueva Tinta",
            modal: "modal-nueva-tinta",
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
        catalogoTintasOptions() {
            if (!this.catalogoTintas || this.catalogoTintas.length === 0) {
                return [{ value: null, text: "Cargando catálogo de tintas..." }];
            }
            let options = this.catalogoTintas.map(t => {
                return { value: t._id, text: t.nombre };
            });
            options.unshift({ value: null, text: "Seleccione un tipo de tinta" });
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
            const tintaProduct = this.catalogoProductos.find(p => p.nombre.toLowerCase() === 'tinta');
            this.selectedProduct = tintaProduct ? tintaProduct._id : null
            this.selectedTintaType = null
        },
        async fetchCatalogoProductos() {
            try {
                const response = await this.$axios.get(`${this.$config.API}/catalogo-insumos-productos`);
                this.catalogoProductos = response.data.data;
                const tintaProduct = this.catalogoProductos.find(p => p.nombre.toLowerCase() === 'tinta');
                if (tintaProduct) {
                    this.selectedProduct = tintaProduct._id;
                }
            } catch (error) {
                console.error("Error al obtener el catálogo de productos:", error);
            }
        },
        async fetchCatalogoTintas() {
            try {
                const response = await this.$axios.get(`${this.$config.API}/catalogo-tintas`);
                this.catalogoTintas = response.data.data;
            } catch (error) {
                console.error("Error al obtener el catálogo de tintas:", error);
            }
        },
        async fetchColoresTintas() {
            try {
                const response = await this.$axios.get(`${this.$config.API}/catalogo-colores-tintas`);
                const colores = response.data.data || [];
                this.colorOptions = colores.map(c => {
                    // Calcular color de texto (blanco/negro) según luminosidad del fondo
                    const hex = (c.color_hex || '#cccccc').replace('#', '');
                    const r = parseInt(hex.substring(0, 2), 16) || 0;
                    const g = parseInt(hex.substring(2, 4), 16) || 0;
                    const b = parseInt(hex.substring(4, 6), 16) || 0;
                    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    return {
                        name: c.nombre,
                        value: c._id,        // ID numérico para enviar al backend
                        codigo: c.codigo,    // Código para display
                        hex: c.color_hex || '#cccccc',
                        textColor: lum > 0.5 ? '#000000' : '#ffffff',
                    };
                });
            } catch (error) {
                console.error("Error al obtener los colores de tinta:", error);
            }
        },
        async guardarInsumo() {
            const requiredFields = {
                insumo: 'Insumo',
                sku: 'SKU',
                selectedColor: 'Color de la Tinta',
                selectedTintaType: 'Tipo de Tinta',
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
                } else if (fieldKey === 'selectedTintaType') {
                    fieldValue = this.selectedTintaType;
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
            data.set("id_catalogo_tintas", this.selectedTintaType)
            data.set("rendimiento", this.form.rendimiento)
            data.set("costo", this.form.costo)
            data.set("departamento", 'Impresión')
            data.set("tipo_insumo", "tinta")
            data.set("es_tinta", 1)
            data.set("id_color_tinta", this.selectedColor)  // ID numérico del color

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
            this.selectedTintaType = null
            // Trick to reset/clear native browser form validation state
            this.show = false
            this.$nextTick(() => {
                this.show = true
            })
        },
    },
    created() {
        this.fetchCatalogoProductos();
        this.fetchCatalogoTintas();
        this.fetchColoresTintas();
    },
}
</script>
