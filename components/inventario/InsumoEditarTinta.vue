<template>
    <div>
        <b-button variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="pencil"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" cancel-disabled ok-disabled footerClass="d-none">
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit" @reset="onReset">
                                <!-- SECCIÓN 1: Identificación -->
                                <h6 class="text-primary border-bottom pb-2 mb-3">1. Identificación</h6>
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
                                                :id="'color-edit-' + colorOption.value"
                                                :value="colorOption.value"
                                                v-model="selectedColor"
                                                required
                                            />
                                            <label
                                                class="form-check-label"
                                                :for="'color-edit-' + colorOption.value"
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

                                <b-form-group id="input-group-3-cant" label="Cantidad (Mililitros):"
                                    label-for="input-cantidad">
                                    <b-form-input id="input-cantidad" v-model="form.cantidad"
                                        placeholder="Ingrese la cantidad en mililitros" required></b-form-input>
                                </b-form-group>

                                <b-form-group id="input-group-3-rend" label="Rendimiento:"
                                    label-for="input-rendimiento">
                                    <campo-decimal id="input-rendimiento" v-model="form.rendimiento"
                                        placeholder="0.00"></campo-decimal>
                                </b-form-group>

                                <b-form-group id="input-group-4-costo" label="Costo Total:" label-for="input-costo">
                                    <campo-decimal id="input-costo" v-model="form.costo"
                                        placeholder="0.00"></campo-decimal>
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
                                    <b-button type="submit" variant="primary">Guardar Cambios</b-button>
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
                cantidad: "", // represents mililitros for inks
                rendimiento: 0,
                costo: 0,
                departamento: "Impresión",
            },
            catalogoProductos: [],
            catalogoTintas: [],
            selectedProduct: null,
            selectedTintaType: null,
            selectedColor: "",    // almacena el _id del color (para enviar al backend)
            colorOptions: [], // Se carga dinámicamente desde /catalogo-colores-tintas
            size: "md",
            title: "Editar Tinta",
            overlay: false,
        }
    },

    watch: {
        data: {
            immediate: true,
            handler(newData) {
                if (newData) {
                    this.form = {
                        insumo: newData.insumo,
                        sku: newData.sku,
                        cantidad: newData.cantidad,
                        rendimiento: newData.rendimiento,
                        costo: newData.costo,
                        departamento: newData.departamento || "Impresion",
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
            return `modal-tinta-${rand}`
        },
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
                        value: c._id,        // ID numérico para enviar al backend
                        codigo: c.codigo,    // Código para display
                        hex: c.color_hex || '#cccccc',
                        textColor: lum > 0.5 ? '#000000' : '#ffffff',
                    };
                });
                // Reasignar selectedColor por si el watch ya corrió con id_color_tinta
                if (this.data && this.data.id_color_tinta) {
                    this.selectedColor = parseInt(this.data.id_color_tinta);
                }
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

            this.overlay = true

            const data = new URLSearchParams()
            data.set("_id", this.data._id)
            data.set("insumo", this.form.insumo)
            data.set("sku", this.form.sku)
            data.set("unidad", 'Ml')
            data.set("cantidad", this.form.cantidad)
            data.set("rendimiento", this.form.rendimiento)
            data.set("costo", this.form.costo)
            data.set("departamento", this.form.departamento)
            data.set("tipo_insumo", 'tinta')
            data.set("id_catalogo_producto", this.selectedProduct)
            data.set("id_catalogo_tintas", this.selectedTintaType)
            data.set("id_color_tinta", this.selectedColor)  // ID numérico

            try {
                const res = await this.$axios.post(`${this.$config.API}/insumos/editar`, data);
                console.log("resultado editar tinta", res)
                this.$emit("reload")
                this.$bvModal.hide(this.modal)
            } catch (error) {
                console.error("Error al editar la tinta:", error);
                this.$fire({
                    title: "Error al Editar",
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
            this.form = {
                insumo: this.data.insumo,
                sku: this.data.sku,
                cantidad: this.data.cantidad,
                rendimiento: this.data.rendimiento,
                costo: this.data.costo,
                departamento: this.data.departamento || "Impresión",
            }
            this.selectedColor = this.data.id_color_tinta ? parseInt(this.data.id_color_tinta) : ""
            this.selectedProduct = this.data.id_catalogo_producto || this.data.id_catalogo || null
            this.selectedTintaType = this.data.id_catalogo_tintas || null
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
