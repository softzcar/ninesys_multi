<template>
    <div>
        <b-button @click="$bvModal.show(modal)">Personalizado</b-button>

        <b-modal :id="modal" :title="title" hide-footer size="lg">
            <b-overlay :show="overlay" spinner-small>
                <div class="text-center mb-4 mt-2">
                    <b-button @click="validateMsg(idorden)" variant="success"
                        >Eviar Mensaje</b-button
                    >
                </div>

                <b-form>
                    <b-form-group
                        id="group-dep-1)"
                        :label="`Enviar un mensaje al cliente: ${nombre_cliente} referente a la ordden Nro: ${idorden}`"
                        label-for="input-mensaje-1)"
                    >
                        <b-form-textarea
                            id="input-mensaje1"
                            v-model="mensaje"
                            placeholder="Escribe el mensaje para el cliente..."
                            rows="3"
                            max-rows="6"
                            class="mb-2"
                            maxlength="65536"
                        ></b-form-textarea>

                        <div class="text-right mt-2">
                            <b-button
                                variant="primary"
                                size="sm"
                                @click="validateMsg"
                                :disabled="overlay"
                            >
                                <b-spinner small v-if="overlay"></b-spinner>
                                Enviar Mensaje
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
            title: "Mensaje Personalizado",
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
        async getEmpleados() {
            await this.$axios
                .get(`${this.$config.API}/empleados`)
                .then((res) => {
                    this.empleados = res.data.items.map((el) => {
                        return {
                            value: el._id,
                            text: el.nombre,
                        };
                    });

                    this.empleados.unshift({
                        value: null,
                        text: "Seleccione un atributo",
                    });
                });
        },

        validateMsg() {
            let ok = true;
            let msg = "";

            if (this.mensaje.trim() === "") {
                ok = false;
                msg += "<p>Debe escrbir un mensaje</p>";
            }

            if (!ok) {
                this.$fire({
                    title: "Faltan Datos",
                    html: msg,
                    type: "info",
                });
            } else {
                this.sendMsgCustom(this.idorden, "custom", 0, this.mensaje);
            }
        },
    },

    props: ["idorden", "nombre_cliente"],
};
</script>