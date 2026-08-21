<template>
    <div class="d-inline-block">
        <b-button
            v-if="iconOnly"
            variant="primary"
            size="sm"
            v-b-tooltip.hover
            title="Nueva Categoría"
            aria-label="Nueva Categoría"
            @click="$bvModal.show(modal)"
        >
            <b-icon icon="plus-lg"></b-icon>
        </b-button>
        <b-button v-else class="mb-4" variant="primary" @click="$bvModal.show(modal)">
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
    props: {
        iconOnly: {
            type: Boolean,
            default: false,
        },
    },
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
        async guardarCategoria(reactivarId = null) {
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
                if (reactivarId) {
                    data.set("reactivar_id", reactivarId)
                }

                try {
                    await this.$axios.post(`${this.$config.API}/categories`, data)
                    this.resetForm()
                    this.$bvModal.hide(this.modal)
                    this.$emit("reload")
                } catch (err) {
                    // Ya existe una categoría eliminada con este mismo nombre: ofrecer
                    // reactivarla en vez de crear una duplicada.
                    const errData = err.response && err.response.data;
                    if (err.response && err.response.status === 409 && errData && errData.eliminado_existente) {
                        this.overlay = false;
                        try {
                            await this.$confirm(
                                `Ya existe una categoría eliminada llamada "${errData.name}". ¿Desea reactivarla?`,
                                "Categoría ya existe",
                                "question"
                            );
                            await this.guardarCategoria(errData.id);
                        } catch (e) {
                            // El usuario canceló la reactivación
                        }
                        return;
                    }

                    console.error("Error guardando la categoría:", err);
                    this.$bvToast.toast((errData && errData.error) || "No se pudo guardar la categoría", {
                      variant: "danger",
                    });
                } finally {
                    this.overlay = false;
                }
            }
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarCategoria()
        }
    },
}
</script>
