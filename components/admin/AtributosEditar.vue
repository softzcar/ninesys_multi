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
                                    label="Atributo:"
                                    label-for="input-atributo"
                                >
                                    <b-form-input
                                        id="input-atributo"
                                        v-model="form.name"
                                        placeholder="Ingrese el nombre del atributo"
                                        required
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-2"
                                    label="Precio:"
                                    label-for="input-precio"
                                >
                                    <b-form-input
                                        id="input-precio"
                                        v-model="form.precio"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Ingrese el precio del atributo"
                                        required
                                    ></b-form-input>
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
    data() {
        return {
            form: {
                name: "",
                precio: 0, // Initialize price
            },
            size: "md",
            title: "Editar Atributo de Producto",
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
        async guardarAtributo() {
            if (this.form.name.trim().length === 0) {
                this.$fire({
                    title: "Dato Requerido",
                    html: "<p>Ingrese el nombre del atributo</p>",
                    type: "info",
                })
            } else if (isNaN(parseFloat(this.form.precio)) || parseFloat(this.form.precio) < 0) {
                this.$fire({
                    title: "Dato Requerido",
                    html: "<p>Ingrese un precio válido (número positivo)</p>",
                    type: "info",
                })
            }
            else {
                this.overlay = true
                const data = new URLSearchParams();
                data.set('id', this.item._id);
                data.set('name', this.form.name);
                data.set('precio', parseFloat(this.form.precio)); // Send price

                await this.$axios
                    .post(`${this.$config.API}/products-attributes/editar`, data)
                    .then((res) => {
                        this.$emit("reload", "true")
                        this.$bvModal.hide(this.modal)
                        this.overlay = false
                    })
                    .catch((err) => {
                        this.overlay = false;
                        console.error(`Error al editar el atributo: ${err}`);
                        this.$bvToast.toast('Error al editar el atributo', {
                            title: 'Error',
                            variant: 'danger',
                            solid: true
                        });
                    })
            }
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarAtributo()
        },
    },

    mounted() {
        this.form = {
            name: this.item.name,
            precio: this.item.precio || 0, // Initialize price
        }
    },

    props: ["item"],
}
</script>
