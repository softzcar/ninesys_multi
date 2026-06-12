<template>
    <div>
        <b-button variant="warning" @click="$bvModal.show(modal)" title="Clonar Tinta" class="btn-clone text-dark">
            <b-icon icon="files"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit" @reset="onReset" novalidate>
                                <!-- SECCIÓN 1: Identificación -->
                                <h6 class="text-primary border-bottom pb-2 mb-3">1. Identificación (Clonando Tinta)</h6>
                                <b-form-group id="input-group-1" label="Insumo:" label-for="input-insumo">
                                    <b-form-input id="input-insumo" v-model="form.insumo"
                                        placeholder="Ingrese el insumo" required></b-form-input>
                                </b-form-group>

                                <b-form-group id="input-group-sku" label="SKU:" label-for="input-sku">
                                    <b-form-input id="input-sku" v-model="form.sku" placeholder="Ingrese el SKU"
                                        required></b-form-input>
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
                                                :id="'clone-color-' + colorOption.value"
                                                :value="colorOption.value"
                                                v-model="selectedColor"
                                                required
                                            />
                                            <label
                                                class="form-check-label"
                                                :for="'clone-color-' + colorOption.value"
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

                                <!-- SECCIÓN 2: Atributos y Costos -->
                                <h6 class="text-primary border-bottom pb-2 mt-4 mb-3">2. Atributos y Costos</h6>

                                <b-form-group id="input-group-3" label="Cantidad de Botellas/Lotes: *"
                                    label-for="input-cantidad">
                                    <b-form-input id="input-cantidad" v-model="form.cantidad"
                                        placeholder="Ingrese la cantidad de botellas a ingresar (Obligatorio)" required></b-form-input>
                                </b-form-group>

                                <b-form-group id="input-group-mililitros" label="Mililitros por Botella: *"
                                    label-for="input-mililitros">
                                    <b-form-input id="input-mililitros" v-model="form.mililitros"
                                        placeholder="Ingrese los mililitros por botella (Obligatorio)" type="number" min="0" step="0.01" required></b-form-input>
                                </b-form-group>

                                <b-form-group id="input-group-3-rend" label="Rendimiento:"
                                    label-for="input-rendimiento">
                                    <b-form-input id="input-rendimiento" v-model="form.rendimiento"
                                        placeholder="0.00" type="number" min="0" step="0.10"></b-form-input>
                                </b-form-group>

                                <b-form-group id="input-group-4-costo" label="Costo por Botella: *" label-for="input-costo">
                                    <b-form-input id="input-costo" v-model="form.costo"
                                        placeholder="0.00 (Obligatorio)" type="number" min="0" step="0.10" required></b-form-input>
                                </b-form-group>

                                <!-- SECCIÓN 3: Clasificación -->
                                <h6 class="text-primary border-bottom pb-2 mt-4 mb-3">3. Clasificación y Catálogo</h6>
                                <b-form-group id="input-group-4-dep" label="Departamento:"
                                    label-for="input-departamento">
                                    <b-form-select id="input-departamento" v-model="form.departamento"
                                        :options="[{value: 'Impresión', text: 'Impresión'}]" disabled required>
                                    </b-form-select>
                                </b-form-group>

                                <div class="mt-4 pt-3 border-top text-right">
                                    <b-button @click="resetForm" variant="outline-danger"
                                        class="mr-2">Limpiar</b-button>
                                    <b-button type="submit" variant="primary">Guardar Clon</b-button>
                                </div>
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
                cantidad: "", // amount of bottles
                mililitros: "", // ml per bottle
                rendimiento: 0,
                costo: "",
                departamento: "Impresión",
            },
            catalogoProductos: [],
            catalogoTintas: [],
            selectedProduct: null,
            selectedTintaType: null,
            selectedColor: "",    // almacena el _id del color
            colorOptions: [], // Se carga dinámicamente desde /catalogo-colores-tintas
            size: "md",
            title: "Clonar Tinta",
            overlay: false,
        }
    },

    watch: {
        data: {
            immediate: true,
            handler(newData) {
                if (newData) {
                    this.form = {
                        insumo: newData.insumo + " (Clon)",
                        sku: newData.sku,
                        cantidad: "", // Blank for user input
                        mililitros: newData.cantidad, // Prefill from original quantity
                        rendimiento: newData.rendimiento,
                        costo: "", // Blank for user input
                        departamento: "Impresión",
                    };
                    this.selectedProduct = newData.id_catalogo_producto || newData.id_catalogo || null;
                    // Preseleccionar por id_color_tinta (ID numérico)
                    this.selectedColor = newData.id_color_tinta ? parseInt(newData.id_color_tinta) : "";
                    this.selectedTintaType = newData.id_catalogo_tintas || null;
                }
            },
        },
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-clone-tinta-${rand}`
        },
        catalogoProductosOptions() {
            if (!this.catalogoProductos || this.catalogoProductos.length === 0) {
                return [{ value: null, text: "Cargando catálogo..." }];
            }
            let options = this.catalogoProductos.map(prod => {
                return { value: prod._id, text: prod.nombre };
            });
            options.unshift({ value: null, text: "Seleccione un product" });
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
                    const hex = (c.color_hex || '#cccccc').replace('#', '');
                    const r = parseInt(hex.substring(0, 2), 16) || 0;
                    const g = parseInt(hex.substring(2, 4), 16) || 0;
                    const b = parseInt(hex.substring(4, 6), 16) || 0;
                    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    return {
                        name: c.nombre,
                        value: c._id,
                        hex: c.color_hex || '#cccccc',
                        textColor: lum > 0.5 ? '#000000' : '#ffffff',
                    };
                });
                // Reasignar por si el watch ya corrió antes del fetch
                if (this.data && this.data.id_color_tinta) {
                    this.selectedColor = parseInt(this.data.id_color_tinta);
                }
            } catch (error) {
                console.error("Error al obtener los colores de tinta:", error);
            }
        },
        resetForm() {
            this.form = {
                insumo: this.data ? this.data.insumo + " (Clon)" : "",
                sku: this.data ? this.data.sku : "",
                cantidad: "",
                mililitros: this.data ? this.data.cantidad : "",
                rendimiento: this.data ? this.data.rendimiento : 1,
                costo: "",
                departamento: "Impresión",
            }
            this.selectedColor = this.data ? (this.data.id_color_tinta ? parseInt(this.data.id_color_tinta) : "") : ""
            this.selectedProduct = this.data ? (this.data.id_catalogo_producto || this.data.id_catalogo || null) : null
            this.selectedTintaType = this.data ? this.data.id_catalogo_tintas : null
        },
        async guardarInsumo() {
            const requiredFields = {
                insumo: 'Insumo',
                sku: 'SKU',
                selectedColor: 'Color de la Tinta',
                selectedTintaType: 'Tipo de Tinta',
                cantidad: 'Cantidad de Botellas',
                mililitros: 'Mililitros por Botella',
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

                if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
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
            data.set("cantidad", this.form.cantidad) // Loops amount of times
            data.set("mililitros", this.form.mililitros) // sets quantity of each bottle
            data.set("id_catalogo_producto", this.selectedProduct)
            data.set("id_catalogo_tintas", this.selectedTintaType)
            data.set("rendimiento", this.form.rendimiento)
            data.set("costo", this.form.costo)
            data.set("departamento", 'Impresión')
            data.set("tipo_insumo", "tinta")
            data.set("es_tinta", 1)
            data.set("id_color_tinta", this.selectedColor)  // ID numérico del color

            try {
                const response = await this.$axios.post(`${this.$config.API}/insumos/nuevo`, data);
                if (response.data && !response.data.error) {
                    this.$fire({
                        title: "Tinta Clonada",
                        html: `<p>El clon de tinta ha sido guardado exitosamente.</p>`,
                        type: "success",
                    });
                    this.resetForm();
                    this.$bvModal.hide(this.modal);
                    this.$emit("reload");
                } else {
                    this.$fire({
                        title: "Error al Clonar",
                        html: `<p>${response.data.message}</p>`,
                        type: "error",
                    });
                }
            } catch (error) {
                console.error("Error al clonar la tinta:", error);
                this.$fire({
                    title: "Error de Conexión",
                    html: `<p>Hubo un problema al conectar con el servidor.</p>`,
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
            this.resetForm();
        },
    },

    props: ["data"],
    mounted() {
        this.fetchCatalogoProductos();
        this.fetchCatalogoTintas();
        this.fetchColoresTintas();
    },
}
</script>

<style scoped>
.btn-clone {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
