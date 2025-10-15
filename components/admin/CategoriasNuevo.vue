<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="plus-lg"></b-icon> Nueva Categoría
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit">
                                <b-form-group
                                    id="input-group-1"
                                    label="Categoría:"
                                    label-for="input-categoria"
                                >
                                    <b-form-input
                                        id="input-categoria"
                                        v-model="form.name"
                                        placeholder="Ingrese el nombre de la categoría"
                                        required
                                    ></b-form-input>
                                </b-form-group>
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
        </b-modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                name: "",
            },
            size: "md",
            title: "Nueva Categoría",
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
        },
        async guardarCategoria() {
            if (this.form.name.trim().length === 0) {
                this.$fire({
                    title: "Dato Requerido",
                    html: "<p>Ingrese el nombre de la categoría</p>",
                    type: "info",
                })
            } else {
                this.overlay = true

                const data = new URLSearchParams()
                data.set("name", this.form.name)

                await this.$axios
                    .post(`${this.$config.API}/categories`, data)
                    .then((res) => {
                        this.resetForm()
                        this.$bvModal.hide(this.modal)
                    })
                    .catch(err => {
                        this.overlay = false;
                        console.error("Error guardando la categoría:", err);
                        this.$bvToast.toast("No se pudo guardar la categoría", {
                          variant: "danger",
                        });
                    })
            }
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarCategoria().then(() => this.$emit("reload"))
        }
    },
}
</script>
