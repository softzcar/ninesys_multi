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
                                <b-form-group label="Código:" label-for="input-codigo">
                                    <b-form-input id="input-codigo" :value="item.codigo" disabled></b-form-input>
                                </b-form-group>
                                <b-form-group
                                    id="input-group-nombre"
                                    label="Nombre:"
                                    label-for="input-nombre"
                                >
                                    <b-form-input
                                        id="input-nombre"
                                        v-model="form.nombre"
                                        placeholder="Ingrese el nombre de la moneda"
                                        required
                                    ></b-form-input>
                                </b-form-group>
                                <b-form-group
                                    id="input-group-simbolo"
                                    label="Símbolo:"
                                    label-for="input-simbolo"
                                >
                                    <b-form-input
                                        id="input-simbolo"
                                        v-model="form.simbolo"
                                        placeholder="Ej: $"
                                    ></b-form-input>
                                </b-form-group>
                                <b-form-group>
                                    <b-form-checkbox v-model="form.activo" :disabled="item.es_base">
                                        Activa (disponible para nuevos pagos)
                                    </b-form-checkbox>
                                    <small v-if="item.es_base" class="text-muted">
                                        La moneda base de la empresa siempre está activa.
                                    </small>
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
    props: ["item"],
    data() {
        return {
            form: {
                nombre: "",
                simbolo: "",
                activo: true,
            },
            size: "md",
            title: "Editar Moneda",
            overlay: false,
        };
    },

    computed: {
        modal() {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-${rand}`;
        },
    },

    methods: {
        async guardarMoneda() {
            this.overlay = true;
            const data = new URLSearchParams();
            data.set("id", this.item._id);
            data.set("nombre", this.form.nombre);
            data.set("simbolo", this.form.simbolo);
            data.set("activo", this.form.activo);

            await this.$axios
                .post(`${this.$config.API}/monedas/editar`, data)
                .then(() => {
                    this.$emit("reload");
                    this.$bvModal.hide(this.modal);
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>Ocurrió un error guardando los datos</p><p>${err}</p>`,
                        type: "warning",
                    });
                })
                .finally(() => {
                    this.overlay = false;
                });
        },
        onSubmit(event) {
            event.preventDefault();
            this.guardarMoneda();
        },
    },

    mounted() {
        this.form = {
            nombre: this.item.nombre,
            simbolo: this.item.simbolo || "",
            activo: !!this.item.activo,
        };
    },
};
</script>
