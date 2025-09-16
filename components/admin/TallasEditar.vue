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
                                    label="Talla:"
                                    label-for="input-talla"
                                >
                                    <b-form-input
                                        id="input-talla"
                                        v-model="form.name"
                                        placeholder="Ingrese el nombre de la talla"
                                        required
                                    ></b-form-input>
                                </b-form-group>
                                <b-button type="submit" variant="primary"
                                    >Guardar</b-button
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
            title: "Editar Talla",
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
        async guardarTalla() {
            this.overlay = true
            const data = new URLSearchParams();
            data.set('id', this.item._id);
            data.set('name', this.form.name);

            await this.$axios
                .post(
                    `${this.$config.API}/sizes/editar`, data
                )
                .then((res) => {
                    this.$emit("reload", "true")
                    this.$bvModal.hide(this.modal)
                    this.overlay = false
                })
                .catch((err) => {
                    this.overlay = false;
                    this.$fire({
                        title: "Error",
                        html: `<p>Ocurrió un error guardando los datos</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarTalla().then(() => this.$emit("reload"))
        },
    },

    mounted() {
        this.form = {
            name: this.item.name,
        }
    },

    props: ["item"],
}
</script>
