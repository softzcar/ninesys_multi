<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="plus-lg"></b-icon> Nueva Talla
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit">
                                <b-form-group id="input-group-1" label="Talla:" label-for="input-talla">
                                    <b-form-input id="input-talla" v-model="form.name"
                                        placeholder="Ingrese el nombre de la talla" required></b-form-input>
                                </b-form-group>
                                <b-form-group id="input-group-2" label="Porcentaje de Variación:"
                                    label-for="input-variation"
                                    description="Eje: 5 para +5%, -5 para -5%. 0 para sin variación.">
                                    <b-form-input id="input-variation" v-model.number="form.variation_percentage"
                                        type="number" step="0.01" placeholder="0.00"></b-form-input>
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
                variation_percentage: 0,
            },
            size: "md",
            title: "Nueva Talla",
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
            this.form.variation_percentage = 0;
        },
        async guardarTalla(reactivarId = null) {
            if (this.form.name.trim().length === 0) {
                this.$fire({
                    title: "Dato Requerido",
                    html: "<p>Ingrese el nombre de la talla</p>",
                    type: "info",
                })
            } else {
                this.overlay = true

                const data = new URLSearchParams()
                data.set("name", this.form.name)
                data.set("variation_percentage", this.form.variation_percentage)
                if (reactivarId) {
                    data.set("reactivar_id", reactivarId)
                }

                try {
                    await this.$axios.post(`${this.$config.API}/sizes`, data)
                    this.resetForm()
                    this.$bvModal.hide(this.modal)
                } catch (err) {
                    // Ya existe una talla eliminada con este mismo nombre: ofrecer
                    // reactivarla en vez de crear una duplicada.
                    const errData = err.response && err.response.data;
                    if (err.response && err.response.status === 409 && errData && errData.eliminado_existente) {
                        this.overlay = false;
                        // Recuperar el porcentaje de variación que tenía la talla antes
                        // de eliminarse, en vez de pisarlo con el valor del formulario
                        // (que suele quedar en 0 por defecto si el usuario no lo tocó).
                        const variacionPrevia = parseFloat(errData.variation_percentage || 0);
                        this.form.variation_percentage = variacionPrevia;
                        try {
                            await this.$confirm(
                                `Ya existe una talla eliminada llamada "${errData.name}" (con un ${variacionPrevia}% de variación guardado). ¿Desea reactivarla conservando ese porcentaje?`,
                                "Talla ya existe",
                                "question"
                            );
                            await this.guardarTalla(errData.id);
                        } catch (e) {
                            // El usuario canceló la reactivación
                        }
                        return;
                    }

                    console.error("Error guardando la talla:", err);
                    this.$bvToast.toast((errData && errData.error) || "No se pudo guardar la talla", {
                        variant: "danger",
                    });
                } finally {
                    this.overlay = false;
                }
            }
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarTalla().then(() => this.$emit("reload"))
        }
    },
}
</script>
