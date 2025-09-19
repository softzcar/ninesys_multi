<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="plus-lg"></b-icon> Nuevo Atributo
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
    data() {
        return {
            form: {
                name: "",
                precio: 0, // Initialize price
            },
            size: "md",
            title: "Nuevo Atributo de Producto",
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
            this.form.name = "";
            this.form.precio = 0; // Reset price
        },
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

                const data = new URLSearchParams()
                data.set("nombre", this.form.name) // Usando 'nombre' como lo espera la API
                data.set("precio", parseFloat(this.form.precio)) // Send price

                await this.$axios
                    .post(`${this.$config.API}/products-attributes`, data)
                    .then((res) => {
                        this.resetForm()
                        this.$bvModal.hide(this.modal)
                        this.$emit("reload")
                    })
                    .catch(err => {
                        this.overlay = false;
                        console.error("Error guardando el atributo:", err);
                        this.$bvToast.toast("No se pudo guardar el atributo", {
                          variant: "danger",
                        });
                    })
            }
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarAtributo()
        }
    },
}
</script>
