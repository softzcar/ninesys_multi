<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="plus-lg"></b-icon> Nuevo Insumo del Catálogo
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
            },
            size: "md",
            title: "Nuevo Insumo del Catálogo de Productos",
            overlay: false,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        resetForm() {
            this.form.nombre = "";
        },
        async guardarCatalogoInsumoProducto() {
            if (this.form.nombre.trim().length === 0) {
                this.$fire({
                    title: "Dato Requerido",
                    html: "<p>Ingrese el nombre del insumo</p>",
                    type: "info",
                })
            } else {
                this.overlay = true

                const data = new URLSearchParams()
                data.set("nombre", this.form.nombre)

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
                        const message = err?.response?.data?.message || "No se pudo guardar el insumo del catálogo";
                        this.$bvToast.toast(message, {
                          title: "Error",
                          variant: "danger",
                          solid: true,
                        });
                    })
            }
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarCatalogoInsumoProducto()
        }
    },
}
</script>