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
                            <b-form @submit="onSubmit" @reset="onReset">
                                <b-form-group
                                    id="input-group-1"
                                    label="Tela:"
                                    label-for="input-tela"
                                >
                                    <b-form-input
                                        id="input-tela"
                                        v-model="form.tela"
                                        placeholder="Ingrese el nombre de la tela"
                                        required
                                    ></b-form-input>
                                </b-form-group>
                                <b-button type="submit" variant="primary"
                                    >Guardar</b-button
                                >
                                <!-- <b-button @click="resetForm" variant="danger">Limpiar</b-button> -->
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
                tela: "",
            },
            size: "md",
            title: "Editar Tela",
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
            this.overlay = true
            this.form = {
                tela: "",
            }
            this.overlay = false
        },

        async guardarTela() {
            this.overlay = true
            await this.$axios
                .post(
                    `${this.$config.API}/telas/${this.item._id}/${this.form.tela}`
                )
                .then((res) => {
                    // this.resetForm()
                    this.$emit("reload", "true")
                    this.$bvModal.hide(this.modal)
                    this.overlay = false
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>Ocurrió un error guardando los datos</p><p>${err}</p>`,
                        type: "warning",
                    }).finally(() => {
                        this.form.tela = ""
                        this.overlay = false
                    })
                })
        },
        onSubmit(event) {
            event.preventDefault()
            // alert(JSON.stringify(this.form))
            this.guardarTela().then(() => this.$emit("reload"))
        },
        onReset(event) {
            event.preventDefault()
            // Reset our form values
            this.form.tela = ""
            this.$nextTick(() => {
                this.show = true
            })
        },
    },

    mounted() {
        this.form = {
            tela: this.item.tela,
        }
    },

    props: ["item"],
}
</script>
