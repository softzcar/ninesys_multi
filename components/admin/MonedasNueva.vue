<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="abrir">
            <b-icon icon="plus-lg"></b-icon> Nueva Moneda
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit" @reset="onReset">
                                <b-form-group
                                    id="input-group-moneda"
                                    label="Moneda:"
                                    label-for="input-moneda"
                                    description="Solo se listan las monedas soportadas para el país de la empresa"
                                >
                                    <b-form-select
                                        id="input-moneda"
                                        v-model="idMonedaSoportadaSeleccionada"
                                        :options="opcionesMonedas"
                                        required
                                    ></b-form-select>
                                </b-form-group>
                                <b-button type="submit" variant="primary" :disabled="!idMonedaSoportadaSeleccionada"
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
            monedasSoportadas: [],
            idMonedaSoportadaSeleccionada: null,
            size: "md",
            title: "Nueva Moneda",
            overlay: false,
        };
    },

    computed: {
        modal() {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-${rand}`;
        },
        opcionesMonedas() {
            const opciones = this.monedasSoportadas.map((m) => ({
                value: m.id_moneda_soportada,
                text: `${m.nombre} (${m.codigo})`,
            }));
            return [{ value: null, text: "Seleccione una moneda" }, ...opciones];
        },
    },

    methods: {
        resetForm() {
            this.idMonedaSoportadaSeleccionada = null;
        },
        async abrir() {
            await this.cargarMonedasSoportadas();
            this.$bvModal.show(this.modal);
        },
        async cargarMonedasSoportadas() {
            const idPais = this.$store.state.login.dataEmpresa?.id_pais;
            if (!idPais) {
                this.monedasSoportadas = [];
                return;
            }
            try {
                const { data } = await this.$axios.get(
                    `${this.$config.API}/monedas-soportadas/${idPais}`
                );
                this.monedasSoportadas = data?.data || [];
            } catch (err) {
                console.error("Error al cargar monedas soportadas:", err);
                this.monedasSoportadas = [];
            }
        },
        async guardarMoneda(reactivarId = null) {
            const moneda = this.monedasSoportadas.find(
                (m) => m.id_moneda_soportada === this.idMonedaSoportadaSeleccionada
            );

            if (!moneda) {
                this.$fire({
                    title: "Dato Requerido",
                    html: "<p>Seleccione una moneda</p>",
                    type: "info",
                });
                return;
            }

            this.overlay = true;

            const data = new URLSearchParams();
            data.set("id_moneda_soportada", moneda.id_moneda_soportada);
            data.set("codigo", moneda.codigo);
            data.set("nombre", moneda.nombre);
            data.set("simbolo", moneda.simbolo || "");
            if (reactivarId) {
                data.set("reactivar_id", reactivarId);
            }

            try {
                await this.$axios.post(`${this.$config.API}/monedas`, data);
                this.resetForm();
                this.$bvModal.hide(this.modal);
            } catch (err) {
                // Ya existe una moneda eliminada con este mismo código: ofrecer
                // reactivarla en vez de crear una duplicada.
                const errData = err.response && err.response.data;
                if (err.response && err.response.status === 409 && errData && errData.eliminado_existente) {
                    this.overlay = false;
                    try {
                        await this.$confirm(
                            `Ya existe una moneda eliminada llamada "${errData.nombre}". ¿Desea reactivarla?`,
                            "Moneda ya existe",
                            "question"
                        );
                        await this.guardarMoneda(errData.id);
                    } catch (e) {
                        // El usuario canceló la reactivación
                    }
                    return;
                }

                console.error("Error guardando la moneda:", err);
                this.$bvToast.toast((errData && errData.error) || "No se pudo guardar la moneda", {
                    variant: "danger",
                });
            } finally {
                this.overlay = false;
            }
        },
        onSubmit(event) {
            event.preventDefault();
            this.guardarMoneda().then(() => this.$emit("reload"));
        },
        onReset(event) {
            event.preventDefault();
            this.resetForm();
        },
    },
};
</script>
