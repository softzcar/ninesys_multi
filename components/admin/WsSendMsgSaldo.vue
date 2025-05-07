<template>
    <div>
        <b-button @click="$bvModal.show(modal)">Saldo</b-button>

        <b-modal :id="modal" :title="title" hide-footer size="lg">
            <b-overlay :show="overlay" spinner-small>
                <div class="text-center mb-4 mt-2">
                    <b-button
                        @click="sendMsgCustom(idorden, 'cobro')"
                        variant="success"
                        >Eviar Mensaje</b-button
                    >
                </div>

                <b-alert show variant="info" class="mb-4">
                    <strong>Variables Dinámicas Disponibles:</strong>
                    <p class="mb-0">
                        Puedes usar las siguientes variables entre corchetes
                        <code>[]</code> en tus mensajes. Serán reemplazadas
                        automáticamente con los datos de la orden y el cliente
                        al enviar el mensaje:
                    </p>
                    <ul>
                        <li><code>[CLIENTE]</code>: Nombre del cliente.</li>
                        <li><code>[ORDEN_ID]</code>: Número de la orden.</li>
                        <li>
                            <code>[FECHA_ENTREGA]</code>: Fecha de entrega de la
                            orden.
                        </li>
                        <li>
                            <code>[PRODUCTOS]</code>: Lista de productos de la
                            orden.
                        </li>
                        <li>
                            <code>[TOTAL_ORDEN]</code>: Monto total de la orden,
                            descuentos y saldo pendiente.
                        </li>
                        <li>
                            <code>[TOTAL_ABONOS]</code>: Total de los abonos
                            hechos a la orden.
                        </li>
                        <li>
                            <code>[TOTAL_DESCUENTOS]</code>: Total de los
                            descuentos hechos a la orden.
                        </li>
                        <li>
                            <code>[TOTAL_DEUDA]</code>: Total de la deuda
                            pendiente.
                        </li>
                    </ul>
                </b-alert>

                <b-form>
                    <b-form-group
                        id="group-1"
                        label="Mensaje se saldo pendiente"
                        label-for="imput-mensaje"
                    >
                        <b-form-textarea
                            id="input-mensaje"
                            v-model="mensaje"
                            placeholder="Escribe el mensaje de saldo pendiente..."
                            rows="3"
                            max-rows="6"
                            class="mb-2"
                            maxlength="65536"
                        ></b-form-textarea>

                        <div class="text-right mt-2">
                            <b-button
                                variant="primary"
                                size="sm"
                                @click="updateMsg()"
                                :disabled="overlay"
                            >
                                <b-spinner small v-if="overlay"></b-spinner>
                                Guardar Cambios
                            </b-button>
                        </div>
                    </b-form-group>
                </b-form>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

export default {
    mixins: [mixin],

    data() {
        return {
            title: "Saldo Pendiente",
            mensaje: "",
            overlay: false,
        };
    },
    computed: {
        // Genera un ID único para el modal (tu implementación existente)
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-ws-deps-${rand}`; // Usar un prefijo más específico
        },
    },

    methods: {
        /**
         * Actualizar palntilla de mensaje
         */
        async updateMsg() {
            this.overlay = true;
            const data = new URLSearchParams();
            data.set("id_orden", this.idorden);
            data.set("mensaje", this.mensaje);
            data.set("tipo", "saldo");

            await this.$axios
                .post(`${this.$config.API}/update-message`, data)
                .then((res) => {
                    this.$fire({
                        title: "Mensajes",
                        html: `<p>El mensaje ha sido actualizado</p>`,
                        type: "success",
                    });
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>No se pudo actualizar el mensaje</p><p>${err}</p>`,
                        type: "warning",
                    });
                })
                .finally(() => {
                    this.overlay = false;
                });
        },
    },

    mounted() {
        this.mensaje =
            this.$store.state.login.dataEmpresa.config_empresa.msg_saldo;
    },

    props: ["idorden"],
};
</script>