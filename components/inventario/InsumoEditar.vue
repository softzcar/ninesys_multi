<template>
    <div>
        <b-button variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="pencil"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" cancel-disabled ok-disabled footerClass="d-none">
            <b-container>
                <b-row>
                    <b-col>
                        <p>
                            <b-overlay :show="overlay" spinner-small>
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

                                    <!-- SECCIÓN 2: Atributos y Costos -->
                                    <h6 class="text-primary border-bottom pb-2 mt-4 mb-3">2. Atributos y Costos</h6>
                                    <b-form-group id="input-group-tipo-insumo" label="Tipo de Insumo:"
                                        label-for="input-tipo-insumo">
                                        <b-form-select id="input-tipo-insumo" v-model="form.tipo_insumo"
                                            :options="tipoInsumoOptions" required>
                                        </b-form-select>
                                    </b-form-group>

                                    <b-form-group id="input-group-2-uni" label="Tipo de unidad:"
                                        label-for="input-unidad">
                                        <b-form-select id="input-unidad" v-model="form.unidad"
                                            :options="unidadesOptions" required>
                                        </b-form-select>
                                    </b-form-group>

                                    <b-row v-if="form.tipo_insumo === 'tela'">
                                        <b-col>
                                            <b-form-group label="Modo de ingreso de costo:">
                                                <b-form-radio-group v-model="costoInputMode" :options="[
                                                    { text: 'Costo Total', value: 'total' },
                                                    { text: 'Precio por Metro', value: 'metro' }
                                                ]" name="costo-mode-edit" buttons button-variant="outline-primary"
                                                    size="sm"></b-form-radio-group>
                                            </b-form-group>
                                        </b-col>
                                    </b-row>

                                    <b-form-group v-if="costoInputMode === 'metro' && form.tipo_insumo === 'tela'"
                                        label="Precio por Metro:" label-for="input-costo-metro-edit">
                                        <b-form-input id="input-costo-metro-edit" v-model="costoMetro"
                                            placeholder="0.00" type="number" min="0" step="0.01"></b-form-input>
                                    </b-form-group>

                                    <b-form-group id="input-group-3-rend" label="Rendimiento (Mts/Kg):"
                                        label-for="input-rendimiento">
                                        <b-form-input id="input-rendimiento" v-model="form.rendimiento"
                                            placeholder="0.00" type="number" min="0" step="0.10"></b-form-input>
                                    </b-form-group>

                                    <b-form-group id="input-group-3-cant" label="Cantidad (Kg, Mts, Ml, etc):"
                                        label-for="input-cantidad">
                                        <b-form-input id="input-cantidad" v-model="form.cantidad"
                                            placeholder="Ingrese la cantidad" required></b-form-input>
                                    </b-form-group>

                                    <b-form-group id="input-group-4-costo"
                                        :label="costoInputMode === 'metro' && form.tipo_insumo === 'tela' ? 'Costo Total (Calculado):' : 'Costo Total del Lote/Rollo:'"
                                        label-for="input-costo">
                                        <b-form-input id="input-costo" v-model="form.costo"
                                            :readonly="costoInputMode === 'metro' && form.tipo_insumo === 'tela'"
                                            placeholder="0.00" type="number" min="0" step="0.10"></b-form-input>
                                    </b-form-group>

                                    <!-- SECCIÓN 3: Clasificación -->
                                    <h6 class="text-primary border-bottom pb-2 mt-4 mb-3">3. Clasificación y Catálogo
                                    </h6>
                                    <b-form-group id="input-group-4-dep" label="Departamento:"
                                        label-for="input-departamento">
                                        <b-form-select id="input-departamento" v-model="form.departamento"
                                            :options="departamentOptions" required>
                                        </b-form-select>
                                    </b-form-group>

                                    <b-form-group id="input-group-product-catalog" label="Producto del Catálogo:"
                                        label-for="input-product-catalog">
                                        <b-input-group>
                                            <b-form-select id="input-product-catalog" v-model="selectedProduct"
                                                :options="catalogoProductosOptions" required></b-form-select>
                                            <b-input-group-append>
                                                <inventario-CatalogoInsumosProductosModal :products="products"
                                                    :departamentos="departamentos" @reload="reloadCatalogo" />
                                            </b-input-group-append>
                                        </b-input-group>
                                    </b-form-group>

                                    <div class="mt-4 pt-3 border-top text-right">
                                        <b-button type="submit" variant="primary">Guardar Cambios</b-button>
                                    </div>
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
                tipo_insumo: "general",
            },
            costoMetro: 0,
            costoInputMode: "total",
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
            tipoInsumoOptions: [
                { value: "general", text: "General" },
                { value: "tela", text: "Tela (Metros -> Kg)" },
                { value: "tinta", text: "Tinta" },
            ],
            size: "md",
            title: "Editar Insumo",
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
                        unidad: newData.unidad,
                        cantidad: newData.cantidad,
                        rendimiento: newData.rendimiento,
                        costo: newData.costo,
                        departamento: newData.departamento,
                        tipo_insumo: newData.tipo_insumo || "general",
                    };
                    this.selectedProduct = newData.id_catalogo_producto || newData.id_catalogo || null;
                    this.costoInputMode = "total"; // Default to total on load
                    this.costoMetro = 0;
                }
            },
        },
        calculatedCostoTotal(newVal) {
            if (this.form.tipo_insumo === 'tela' && this.costoInputMode === 'metro') {
                this.form.costo = newVal;
            }
        },
        'form.tipo_insumo'(newVal) {
            if (newVal !== 'tela') {
                this.costoInputMode = 'total';
            }
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
        calculatedCostoTotal() {
            if (this.form.tipo_insumo !== 'tela' || this.costoInputMode !== 'metro') return this.form.costo;
            const cant = parseFloat(this.form.cantidad) || 0;
            const rend = parseFloat(this.form.rendimiento) || 0;
            const metro = parseFloat(this.costoMetro) || 0;
            return (cant * rend * metro).toFixed(2);
        }
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
            data.set("tipo_insumo", this.form.tipo_insumo)
            data.set("id_catalogo_producto", this.selectedProduct)

            try {
                const res = await this.$axios.post(`${this.$config.API}/insumos/editar`, data);
                console.log("resultado insumo editar", res)
                this.$emit("reload")
                this.$bvModal.hide(this.modal)
            } catch (error) {
                console.error("Error al editar el insumo:", error);
                this.$fire({
                    title: "Error al Editar",
                    html: `<p>Hubo un problema al conectar con el servidor.</p>`,
                    type: "error",
                });
            } finally {
                this.overlay = false;
            }
        },
        reloadCatalogo() {
            this.$emit('reloadCatalogo');
        },

        onSubmit(event) {
            event.preventDefault()
            this.guardarInsumo()
        },

        onReset(event) {
            event.preventDefault()
            this.resetForm();
            // Trick to reset/clear native browser form validation state
            this.show = false
            this.$nextTick(() => {
                this.show = true
            })
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
                tipo_insumo: "general",
            }
            this.costoMetro = 0;
            this.costoInputMode = "total";
            this.overlay = false
            this.selectedProduct = null
        },
    },

    props: ["data", "catalogoProductosData"],
    mounted() {
        this.fetchData();
    },
}
</script>
