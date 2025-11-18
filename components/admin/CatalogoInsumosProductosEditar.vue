<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="pencil"></b-icon>
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
    props: ["item", "products", "departamentos"],
    data() {
        return {
            form: {
                nombre: "",
                id_product: null,
                id_departamento: null,
            },
            size: "md",
            title: "Editar Insumo del Catálogo de Productos",
            overlay: false,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
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
                const data = new URLSearchParams();
                data.set('id', this.item._id);
                data.set('nombre', this.form.nombre);
                data.set('id_product', this.form.id_product);
                data.set('id_departamento', this.form.id_departamento);

                await this.$axios
                    .post(`${this.$config.API}/catalogo-insumos-productos/editar`, data)
                    .then((res) => {
                        this.$emit("reload", "true")
                        this.$bvModal.hide(this.modal)
                        this.overlay = false
                    })
                    .catch((err) => {
                        this.overlay = false;
                        console.error(`Error al editar el insumo del catálogo: ${err}`);
                        this.$bvToast.toast('Error al editar el insumo del catálogo', {
                            title: 'Error',
                            variant: 'danger',
                            solid: true
                        });
                    })
            }
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarCatalogoInsumoProducto()
        },
    },

    mounted() {
        this.form = {
            nombre: this.item.nombre,
            id_product: this.item.id_product,
            id_departamento: this.item.id_departamento,
        }
    },
}
</script>