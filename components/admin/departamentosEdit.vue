<template>
    <div>
        <b-button
            size="sm"
            class="mb-4"
            @click="$bvModal.show(modal)"
            variant="primary"
        >
            <b-icon icon="pencil"></b-icon
        ></b-button>

        <b-modal
            :id="modal"
            :title="title"
            @hidden="onModalHidden"
            hide-footer
            size="md"
        >
            <b-overlay :show="overlay" spinner-small>
                <!-- <div>
                    <span class="floatme">
                        <b-form-input style="width: 250px" type="text" v-model="newDep" :disabled="overlay" />
                    </span>
                    <span class="floatme">
                        <b-form-checkbox id="checkbox-1" v-model="asiganr_numero_de_paso" name="checkbox-1" value="1"
                            unchecked-value="0">
                            Asiganr número de paso
                        </b-form-checkbox>
                    </span>
                </div>
                <div>
                    <b-button class="floatme" @click="guardarOrdenDepartamento()" variant="success" :disabled="overlay">
                        <b-icon icon="check-lg"></b-icon>
                    </b-button>
                </div> -->
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
                            :disabled="overlay || isDefaultDepartment"
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
                        @click="guardarOrdenDepartamento()"
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
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            title: "Editar Departamento",
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

        isDefaultDepartment() {
            // Los IDs 1-7 son departamentos por defecto del sistema
            return this.item && this.item._id >= 1 && this.item._id <= 7;
        }
    },

    methods: {
        onModalHidden() {
            // this.newDep = ''
            // this.asiganr_numero_de_paso = 0
        },

        async guardarOrdenDepartamento() {
            let ok = true;
            let msg = "";
            let icon = "success";

            if (this.newDep.trim() === "") {
                ok = false;
                msg += "<p>Debe indicar el nuevo nombre del departamento</p>";
                icon = "info";
            }

            if (this.modulo === null) {
                ok = false;
                msg +=
                    "<p>Debe indicar el módulo asociado al depaartamento</p>";
            }

            if (!ok) {
                this.$fire({
                    title: "Editar Departamento",
                    html: msg,
                    type: icon,
                });
            } else {
                this.overlay = true;
                const data = new URLSearchParams();
                data.set("id_departamento", this.item._id);
                data.set("departamento", this.newDep);
                data.set("asignar_paso", this.asiganr_numero_de_paso);
                data.set("enviar_mensaje", this.enviarMensaje);

                await this.$axios
                    .post(
                        // `${this.$config.API}/departamentos/orden-paso`, data)
                        `${this.$config.API}/departamentos/editar`,
                        data
                    )
                    .then((res) => {
                        this.$emit("reload", "true");
                        this.$fire({
                            title: "Editar Departamento",
                            html: "<p>El nuevo nombre del departamento se actualizó correctamente</p>",
                            type: "success",
                        });
                        this.$bvModal.hide(this.modal);
                    })
                    .catch((err) => {
                        this.$fire({
                            title: "Editar Departamento",
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

    mounted() {
        this.newDep = this.item.departamento;
        this.modulo = this.item.id_modulo;
        this.asiganr_numero_de_paso = this.item.asignar_numero_de_paso;
        this.enviarMensaje = this.item.enviar_mensaje;
    },

    props: ["item", "reload"],
};
</script>