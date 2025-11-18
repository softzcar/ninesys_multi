<template>
    <div>
        <b-button @click="$bvModal.show(modal)" variant="outline-primary">
            <b-icon icon="plus"></b-icon> Nuevo
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit">
                                <b-form-group
                                    id="input-group-1"
                                    label="Nombre del Insumo:"
                                    label-for="input-nombre"
                                >
                                    <b-form-input
                                        id="input-nombre"
                                        v-model="form.nombre"
                                        placeholder="Ingrese el nombre del insumo"
                                        required
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-2"
                                    label="Producto:"
                                    label-for="select-producto"
                                >
                                    <b-form-select
                                        id="select-producto"
                                        v-model="form.id_product"
                                        :options="productOptions"
                                        required
                                    ></b-form-select>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-3"
                                    label="Departamento:"
                                    label-for="select-departamento"
                                >
                                    <b-form-select
                                        id="select-departamento"
                                        v-model="form.id_departamento"
                                        :options="departamentoOptions"
                                        required
                                    ></b-form-select>
                                </b-form-group>

                                <b-button type="submit" variant="primary">Guardar</b-button>
                                <b-button @click="resetForm" variant="danger">Limpiar</b-button>
                            </b-form>
                        </b-col>
                    </b-row>
                </b-container>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    props: ["products", "departamentos"],
    data() {
        return {
            form: {
                nombre: "",
                id_product: null,
                id_departamento: null,
            },
            size: "md",
            title: "Nuevo Insumo del Catálogo de Productos",
            overlay: false,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-catalogo-${rand}`
        },
        productOptions() {
            const options = this.products.map(product => ({
                value: product.cod,
                text: product.name,
            }));
            options.unshift({ value: null, text: "Seleccione un producto" });
            return options;
        },
        departamentoOptions() {
            const options = this.departamentos.map(dep => ({
                value: dep._id,
                text: dep.departamento,
            }));
            options.unshift({ value: null, text: "Seleccione un departamento" });
            return options;
        },
    },

    methods: {
        resetForm() {
            this.form.nombre = "";
            this.form.id_product = null;
            this.form.id_departamento = null;
        },
        async guardarCatalogoInsumoProducto() {
            if (this.form.nombre.trim().length === 0) {
                this.$fire({
                    title: "Dato Requerido",
                    html: "<p>Ingrese el nombre del insumo</p>",
                    type: "info",
                })
            } else if (!this.form.id_product) {
                this.$fire({
                    title: "Dato Requerido",
                    html: "<p>Seleccione un producto</p>",
                    type: "info",
                })
            } else if (!this.form.id_departamento) {
                this.$fire({
                    title: "Dato Requerido",
                    html: "<p>Seleccione un departamento</p>",
                    type: "info",
                })
            } else {
                this.overlay = true

                const data = new URLSearchParams()
                data.set("insumo", this.form.nombre)
                data.set("id_product", this.form.id_product)
                data.set("id_departamento", this.form.id_departamento)

                try {
                    await this.$axios
                        .post(`${this.$config.API}/catalogo-insumos-productos`, data)
                        .then((res) => {
                            this.overlay = false;
                            this.resetForm()
                            this.$bvModal.hide(this.modal)
                            this.$emit("reload")
                        })
                        .catch(err => {
                            this.overlay = false;
                            console.error("Error guardando el insumo del catálogo:", err);
                            this.$bvToast.toast("No se pudo guardar el insumo del catálogo", {
                              variant: "danger",
                            });
                        })
                } catch (error) {
                    this.overlay = false;
                    console.error("Error guardando el insumo del catálogo:", error);
                    this.$bvToast.toast("No se pudo guardar el insumo del catálogo", {
                      variant: "danger",
                    });
                }
            }
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarCatalogoInsumoProducto()
        }
    },
}
</script>