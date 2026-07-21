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

                    <b-form-group
                        id="input-group-tipo"
                        label="Tipo de Comportamiento:"
                        description="Define las interfaces y reglas especiales de negocio. Solo asignable a departamentos vinculados al módulo 'Empleado'."
                    >
                        <b-form-select
                            id="select-tipo"
                            :disabled="overlay || !isEmpleadoModule"
                            v-model="tipo"
                            :options="tipoOptions"
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
            tipo: "general",
            tipoOptions: [
                { value: "general", text: "General (Comportamiento General)" },
                { value: "corte", text: "Corte (Comportamiento de Corte)" },
                { value: "impresion", text: "Impresión (Comportamiento de Impresión)" },
                { value: "estampado", text: "Estampado (Comportamiento de Estampado)" },
                { value: "costura", text: "Costura (Comportamiento de Costura)" },
            ],
        };
    },

    computed: {
        ...mapGetters("login", ["getModulosSelect"]),
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-${rand}`;
        },
        isEmpleadoModule() {
            if (!this.modulo) return false;
            const selected = this.getModulosSelect.find(m => m.value === this.modulo);
            return selected && selected.text === 'Empleado';
        },
    },

    watch: {
        modulo(newVal) {
            if (!this.isEmpleadoModule) {
                this.tipo = "general";
            }
        }
    },

    methods: {
        onModalHidden() {
            this.newDep = "";
            this.asiganr_numero_de_paso = 0;
            this.tipo = "general";
        },
        async crearDepartamento(reactivarId = null) {
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
                return;
            }

            this.overlay = true;
            const data = new URLSearchParams();
            data.set("departamento", this.newDep.trim());
            data.set("asignar_paso", this.asiganr_numero_de_paso);
            data.set("modulo", this.modulo);
            data.set("enviar_mensaje", this.enviarMensaje);
            data.set("tipo", this.tipo);
            if (reactivarId) {
                data.set("reactivar_id", reactivarId);
            }

            await this.$axios
                .post(`${this.$config.API}/departamentos/nuevo`, data)
                .then((res) => {
                    const checkMe = this.checkResponse(res);

                    if (checkMe) {
                        this.$store.commit(
                            "login/setDepartamentos",
                            res.data
                        );
                        this.$emit("reload", "true");
                        this.$fire({
                            title: "Nuevo Departamento",
                            html: reactivarId
                                ? "<p>El departamento se reactivó correctamente</p>"
                                : "<p>El nuevo departamento se creó correctamente</p>",
                            type: "success",
                        });
                        this.$bvModal.hide(this.modal);
                    }
                })
                .catch(async (err) => {
                    // Ya existe un departamento eliminado con ese mismo nombre
                    // (sin importar mayúsculas/espacios): ofrecer reactivarlo
                    // en vez de crear un duplicado.
                    if (
                        err.response &&
                        err.response.status === 409 &&
                        err.response.data.eliminado_existente
                    ) {
                        this.overlay = false;
                        const { id_departamento, departamento } = err.response.data;
                        try {
                            await this.$confirm(
                                `Ya existe un departamento eliminado llamado "${departamento}". ¿Desea reactivarlo con la configuración indicada?`,
                                "Departamento ya existe",
                                "question"
                            );
                            await this.crearDepartamento(id_departamento);
                        } catch (e) {
                            // El usuario canceló la reactivación
                        }
                        return;
                    }

                    this.$fire({
                        title: "Nuevo Departamento",
                        html: `<p>${
                            err.response && err.response.data && err.response.data.error
                                ? err.response.data.error
                                : "Ocurrió un error al conectarse a internet"
                        }</p>`,
                        type: "error",
                    });
                })
                .finally(() => {
                    this.overlay = false;
                });
        },
    },

    props: ["item", "reload"],
};
</script>
