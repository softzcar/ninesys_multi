<template>
    <div>
        <b-button
            size="sm"
            class="mb-4"
            @click="$bvModal.show(modal)"
            variant="primary"
        >
            <b-icon icon="plus-lg"></b-icon> Nuevo Departamento</b-button
        >

        <b-modal
            :id="modal"
            :title="title"
            @hidden="onModalHidden"
            hide-footer
            size="md"
        >
            <b-overlay :show="overlay" spinner-small>
                <b-form>
                    <b-form-group
                        id="input-group-1"
                        label="Nombre del departamento:"
                        label-for="input-1"
                    >
                        <b-form-input
                            style="width: 250px"
                            type="text"
                            v-model="newDep"
                            :disabled="overlay"
                        />
                    </b-form-group>

                    <b-form-group
                        id="input-group-2"
                        label="Asignar número de paso:"
                        description="Indica si este departamento forma parte de el orden de la cadena de producción"
                        label-for="input-1"
                    >
                        <b-form-checkbox
                            id="checkbox-1"
                            v-model="asiganr_numero_de_paso"
                            name="checkbox-1"
                            value="1"
                            unchecked-value="0"
                            switch
                        >
                        </b-form-checkbox>
                    </b-form-group>

                    <b-form-group
                        id="input-group-6"
                        label="Enviar mensaje:"
                        description="Activa envio de mensaje a clietnes"
                        label-for="input-1"
                    >
                        <b-form-checkbox
                            v-model="enviarMensaje"
                            name="check-button"
                            switch
                            value="1"
                            unchecked-value="0"
                        >
                        </b-form-checkbox>
                    </b-form-group>

                    <b-form-group
                        id="input-group-3"
                        label="Seleccione un módulo"
                        label-for="select-atributo"
                        description="Seleccione el módulo vinculado al departamento."
                    >
                        <b-form-select
                            id="select-modulo"
                            :disabled="overlay"
                            v-model="modulo"
                            :options="getModulosSelect"
                            :value="modulo"
                            class="floatme"
                        ></b-form-select>
                    </b-form-group>

                    <b-button
                        class="floatme"
                        @click="crearDepartamento()"
                        variant="success"
                        :disabled="overlay"
                    >
                        <b-icon icon="check-lg"></b-icon>
                    </b-button>
                </b-form>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import { mapGetters } from "vuex";
export default {
    mixins: [mixin],

    data() {
        return {
            title: "Nuevo Departamento",
            overlay: false,
            newDep: "",
            modulo: null,
            asiganr_numero_de_paso: 0,
            enviarMensaje: 0,
        };
    },

    computed: {
        ...mapGetters("login", ["getModulosSelect"]),
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-${rand}`;
        },
    },

    methods: {
        onModalHidden() {
            this.newDep = "";
            this.asiganr_numero_de_paso = 0;
        },
        async crearDepartamento() {
            let ok = true;
            let msg = "";
            let icon = "success";

            if (this.newDep.trim() === "") {
                ok = false;
                msg += "<p>Debe indicar el nuevo nombre del departamento</p>";
            }

            if (this.modulo === null) {
                ok = false;
                msg +=
                    "<p>Debe indicar el módulo asociado al depaartamento</p>";
            }

            if (!ok) {
                icon = "info";
                this.$fire({
                    title: "Nuevo Departamento",
                    html: msg,
                    type: icon,
                });
            } else {
                this.overlay = true;
                const data = new URLSearchParams();
                data.set("departamento", this.newDep);
                data.set("asignar_paso", this.asiganr_numero_de_paso);
                data.set("modulo", this.modulo);
                data.set("enviar_mensaje", this.enviarMensaje);

                await this.$axios
                    .post(
                        // `${this.$config.API}/departamentos/orden-paso`, data)
                        `${this.$config.API}/departamentos/nuevo`,
                        data
                    )
                    .then((res) => {
                        // PRONBAR checkResponse
                        const checkMe = this.checkResponse(res);
                        console.log("checkResponse", checkMe);

                        if (checkMe) {
                            this.$store.commit(
                                "login/setDepartamentos",
                                res.data
                            );
                            this.$emit("reload", "true");
                            this.$fire({
                                title: "Nuevo Departamento",
                                html: "<p>El nuevo departamento se creó correctamente</p>",
                                type: "success",
                            });
                            this.$bvModal.hide(this.modal);
                        }
                    })
                    .catch((err) => {
                        this.$fire({
                            title: "Nuevo Departamento",
                            html: `<p>Ocurrió un error al conectarse a internet</p> <p>${err}</p> `,
                            type: "error",
                        });
                    })
                    .finally(() => {
                        this.overlay = false;
                    });
            }
        },
    },

    props: ["item", "reload"],
};
</script>
