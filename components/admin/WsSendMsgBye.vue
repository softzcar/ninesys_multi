<template>
    <div>
        <b-button @click="$bvModal.show(modal)">Terminar Orden</b-button>

        <b-modal :id="modal" :title="title" hide-footer size="lg">
            <b-overlay :show="overlay" spinner-small>
                <div class="text-center mb-4 mt-2">
                    <b-button
                        @click="sendMsgCustom(idorden, 'fin')"
                        variant="success"
                        >Eviar Mensaje</b-button
                    >
                </div>

                <b-alert show variant="info" class="mb-4">
                    <strong>Variables Dinámicas Disponibles:</strong>
                    <p class="mb-0">
                        Haz click sobre una variable para insertarla en el
                        mensaje, en la posición donde esté el cursor. Serán
                        reemplazadas automáticamente con los datos de la orden
                        y el cliente al enviar el mensaje:
                    </p>
                    <ul>
                        <li><code class="ws-var-insertable" role="button" tabindex="0" @click="insertVariable('[CLIENTE]')">[CLIENTE]</code>: Nombre del cliente.</li>
                        <li><code class="ws-var-insertable" role="button" tabindex="0" @click="insertVariable('[ORDEN_ID]')">[ORDEN_ID]</code>: Número de la orden.</li>
                        <li>
                            <code class="ws-var-insertable" role="button" tabindex="0" @click="insertVariable('[FECHA_ENTREGA]')">[FECHA_ENTREGA]</code>: Fecha de entrega de la
                            orden.
                        </li>
                        <li>
                            <code class="ws-var-insertable" role="button" tabindex="0" @click="insertVariable('[PRODUCTOS]')">[PRODUCTOS]</code>: Lista de productos de la
                            orden.
                        </li>
                        <li>
                            <code class="ws-var-insertable" role="button" tabindex="0" @click="insertVariable('[TOTAL_ORDEN]')">[TOTAL_ORDEN]</code>: Monto total de la orden.
                        </li>
                    </ul>
                </b-alert>

                <b-form>
                    <b-form-group
                        id="group-1"
                        label="Mensaje de fin de la Orden"
                        label-for="imput-mensaje"
                    >
                        <b-form-textarea
                            id="input-mensaje"
                            ref="mensajeTextarea"
                            v-model="mensaje"
                            placeholder="Escribe el mensaje de fin de la orden..."
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
            title: "Termiar Orden",
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
        // Mismo patron ya usado en pages/crm/campanas.vue -- inserta la
        // variable en la posicion del cursor dentro del textarea, en vez de
        // solo mostrarla como referencia estatica.
        insertVariable(variable) {
            const textarea = this.$refs.mensajeTextarea.$el;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = this.mensaje || "";

            this.mensaje = text.substring(0, start) + variable + text.substring(end);

            this.$nextTick(() => {
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = start + variable.length;
            });
        },

        /**
         * Actualizar plantilla del mensaje
         */
        async updateMsg() {
            this.overlay = true;
            const data = new URLSearchParams();
            data.set("id_orden", this.idorden);
            data.set("mensaje", this.mensaje);
            data.set("tipo", "bye");

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
            this.$store.state.login.dataEmpresa.config_empresa.msg_bye;
    },

    props: ["idorden"],
};
</script>

<style scoped>
.ws-var-insertable {
    cursor: pointer;
    user-select: none;
}
.ws-var-insertable:hover {
    background-color: #d1ecf1;
    text-decoration: underline;
}
</style>