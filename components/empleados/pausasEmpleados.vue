<template>
    <div>
        <b-button @click="$bvModal.show(modal)" variant="primary">{{
            btnText
        }}</b-button>

        <b-modal :id="modal" title="Rendimiento" hide-footer size="md">
            <b-row v-if="lengthPausa">
                <b-col>
                    <h3>Reanudar Tarea</h3>
                    <p v-if="lengthPausa">
                        Inicio de la pausa:
                        {{ formatTimestamp(pausas[0].pausa_inicio) }}
                    </p>
                    <p v-if="lengthPausa">Motivo: {{ pausas[0].motivo }}</p>
                    <b-form>
                        <b-button @click="reanudarPausa" variant="primary"
                            >Reanudar</b-button
                        >
                    </b-form>
                </b-col>
            </b-row>

            <b-row v-else>
                <b-col>
                    <h3>Iniciar Pausa</h3>
                    <b-form>
                        <b-form-group
                            id="input-group-1"
                            label="Motivo:"
                            label-for="textarea-small"
                            description="Indique el motivo de la pausa"
                        >
                            <b-form-textarea
                                id="textarea-small"
                                size="sm"
                                v-model="form.motivo"
                            ></b-form-textarea>
                        </b-form-group>

                        <b-button @click="iniciarPausa" variant="primary"
                            >Iniciar</b-button
                        >
                    </b-form>
                </b-col>
            </b-row>

            <pre class="force">
                {{ $props }}
            </pre>
        </b-modal>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
export default {
    mixins: [mixin],
    data() {
        return {
            variant: "secondary",
            btnText: "PAUSA",
            hayPausas: false,
            form: {
                motivo: "",
            },
        };
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-${rand}`;
        },

        lengthPausa() {
            return this.pausas.length;
        },
    },

    methods: {
        validarPausa(idLote) {
            return this.pausas.filter(
                (el) => el.id_lotes_detalles_empleados_asignados == idLote
            );
        },

        async iniciarPausa() {
            let ok = true;
            let msg = "";

            if (this.form.motivo.trim() === "") {
                ok = false;
                msg += "<p>Debe incuir el motivo de la pausa</p>";
            }

            if (ok) {
                this.overlay = true;
                const data = new URLSearchParams();
                data.set(
                    "id_lote_detalles_empleados",
                    this.item.lotes_detalles_empleados_asignados
                );
                data.set("motivo", this.form.motivo);
                data.set("accion", "iniciar");

                await this.$axios
                    .post(`${this.$config.API}/pausas`, data)
                    .then((res) => {
                        this.form.motivo = "";
                        this.$emit("reload", "true");
                        this.$emit("disBtnTodo", true);

                        this.hayPausas = true;

                        this.$fire({
                            title: "Pausa Creada",
                            html: `<p>La pausa ha sido creada</p>`,
                            type: "success",
                        });
                    })
                    .catch((err) => {
                        this.$fire({
                            title: "Error",
                            html: `<p>Ocurrió un error al ejectar la solicitud, es posible que la pausa no se haya creado</p><p>${err}</p>`,
                            type: "error",
                        });
                    })
                    .finally(() => {
                        this.overlay = false;
                    });
            } else {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>${msg}</p>`,
                    type: "info",
                });
            }
        },
        async postReanudar() {
            this.overlay = true;
            const data = new URLSearchParams();
            data.set(
                "id_lote_detalles_empleados",
                this.item.lotes_detalles_empleados_asignados
            );
            data.set("id_pausa", this.pausas[0].id_pausa);
            data.set("accion", "reanudar");

            await this.$axios
                .post(`${this.$config.API}/pausas`, data)
                .then((res) => {
                    this.$emit("disBtnTodo", false);

                    this.hayPausas = true;

                    this.$fire({
                        title: "Pausa Reanudada",
                        html: `<p>La pausa ha sido reanudada ya puede continnuar trabajando en la orden</p>`,
                        type: "success",
                    });

                    this.$emit("reload", "true");
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>Ocurrió un error al ejectar la solicitud, es posible que la reanucadión no se haya ejecutado</p><p>${err}</p>`,
                        type: "error",
                    });
                })
                .finally(() => {
                    this.overlay = false;
                });
        },

        async reanudarPausa() {
            this.$confirm(``, `¿Desea reanudar la tarea?`, "question").then(
                () => {
                    this.postReanudar();
                }
            );
        },
    },

    mounted() {
        if (this.pausas.length) {
            this.hayPausas = true;
            this.variant = "success";
            this.$emit("disBtnTodo", true);
        } else {
            this.hayPausas = false;
            this.variant = "seconcdary";
            this.$emit("disBtnTodo", false);
        }
        this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
            if (modalId === this.modal) {
                // Acciones al abrir modal
            }
        });
    },

    props: ["item", "pausas", "reload", "disBtnTodo"],
};
</script>
