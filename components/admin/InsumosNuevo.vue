<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="plus-lg"></b-icon> Nuevo Insumo
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit">
                                <b-form-group
                                    id="input-group-1"
                                    label="Nombre:"
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
                                    label="Departamento:"
                                    label-for="select-departamento"
                                >
                                    <b-form-select
                                        id="select-departamento"
                                        v-model="form.id_departamento"
                                        :options="departamentosOptions"
                                        required
                                    ></b-form-select>
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
                nombre: "",
                id_departamento: null,
            },
            size: "md",
            title: "Nuevo Insumo",
            overlay: false,
            departamentos: [],
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
        departamentosOptions() {
            return this.departamentos.map(dep => ({
                value: dep._id,
                text: dep.departamento
            }))
        }
    },

    methods: {
        resetForm() {
            this.form.nombre = "";
            this.form.id_departamento = null;
        },
        async guardarInsumo() {
            if (this.form.nombre.trim().length === 0) {
                this.$fire({
                    title: "Dato Requerido",
                    html: "<p>Ingrese el nombre del insumo</p>",
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
                data.set("id_departamento", this.form.id_departamento)

                await this.$axios
                    .post(`${this.$config.API}/catalogo-insumos-productos`, data)
                    .then((res) => {
                        this.resetForm()
                        this.$bvModal.hide(this.modal)
                        this.overlay = false;
                    })
                    .catch(err => {
                        this.overlay = false;
                        console.error("Error guardando el insumo:", err);
                        this.$bvToast.toast("No se pudo guardar el insumo", {
                          variant: "danger",
                        });
                    })
            }
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarInsumo().then(() => this.$emit("reload"))
        },
        async loadDepartamentos() {
            try {
                const response = await this.$axios.get(`${this.$config.API}/departamentos`);
                this.departamentos = response.data;
            } catch (error) {
                console.error("Error cargando departamentos:", error);
            }
        }
    },
    mounted() {
        this.loadDepartamentos();
    }
}
</script>