<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <div class="mb-2" v-if="asignado">
                <b-alert variant="info" show
                    >Atributo asignado {{ attributeText }}</b-alert
                >
            </div>
            <b-form inline>
                <b-form-group
                    id="input-group-1"
                    label=""
                    label-for="select-atributo"
                    description="Seleccione un atributo."
                >
                    <b-form-select
                        id="select-atributo"
                        :disabled="inputDisabled"
                        v-model="attribute"
                        :options="options"
                        :value="attribute"
                        class="floatme"
                    ></b-form-select>
                    <b-button
                        @click="showPrompt"
                        id="add-atributo"
                        variant="light"
                    >
                        <b-icon icon="plus-lg"></b-icon>
                    </b-button>
                    <b-popover
                        target="add-atributo"
                        triggers="hover"
                        placement="top"
                    >
                        <template #title>Crear nuevo atributo</template>
                    </b-popover>
                </b-form-group>
            </b-form>
            <b-form class="mt-2">
                <b-form-group
                    id="input-group-2"
                    label="Valor del atributo"
                    label-for="input-descripción"
                    description="Indique el valor del atributo."
                >
                    <b-form-input
                        id="input-descripción"
                        type="text"
                        v-model="attributeText"
                        :disabled="inputDisabled"
                    />
                </b-form-group>

                <b-button
                    :disabled="inputDisabled"
                    variant="success"
                    @click="saveChange()"
                    size="lg"
                >
                    Asignar
                </b-button>
            </b-form>
            <hr class="mt-4" />
        </b-overlay>
    </div>
</template>

<script>
export default {
    data() {
        return {
            attribute: null,
            attributeText: "",
            asignado: false,
            inputDisabled: false,
            overlay: false,
        };
    },

    computed: {
        dataSave() {
            return {
                id: this.item.id,
                attribute: this.attribute,
                descripcion: this.attributeText,
            };
        },

        options() {
            let tmpOpt = this.attributescat.map((el) => {
                return {
                    value: el._id,
                    text: el.attribute_name,
                };
            });
            tmpOpt.unshift({
                value: null,
                text: "Seleccione un atributo",
            });
            return tmpOpt;
        },
    },

    methods: {
        async showPrompt() {
            try {
                // Llama al método prompt del plugin
                const input = await this.$prompt(
                    "Por favor, escribe tu nombre:"
                );
                if (input && input.trim() !== "") {
                    console.log("Texto ingresado:", input);
                } else {
                    console.log("El campo está vacío o fue cancelado.");
                }
            } catch (error) {
                console.log("El prompt fue cancelado.", error);
            }
        },

        asignarAtributo() {
            this.asignado = true;
            this.inputDisabled = true;
        },

        saveChange() {
            this.overlay = true;

            let ok = true;
            let msg = "";

            if (this.attributeText.trim() === "") {
                ok = false;
                msg += "<p>Debe indicar el valor del atributo</p>";
            }

            if (this.attribute === null) {
                ok = false;
                msg += "<p>Debe Seleccionar un atributo</p>";
            }

            if (ok) {
                this.$emit("reload", this.dataSave);
                this.asignarAtributo();
                alert(
                    "todo OK vamos a guardar el registro en el formularieo para enviarlo posteriormente"
                );
            } else {
                this.$fire({
                    title: "Datos requeridos",
                    html: msg,
                    type: "warning",
                });
            }
            this.overlay = false;
        },

        async putDisenador(id_orden, empleado, tipo_diseno) {
            this.loading = true;
            await this.$axios(
                `${this.$config.API}/disenos/asign/${id_orden}/${empleado}`,
                {
                    method: "PUT",
                }
            )
                .then((res) => {
                    this.$store.dispatch("disenos/getDisenos");
                    this.$fire({
                        title: "Asignado",
                        html: "El diseñador ha sido asignado correctamente",
                        type: "success",
                    }).then(() => {
                        // this.$emit("closemodal")
                    });
                    return true;
                })
                .catch((err) => {
                    this.$store.dispatch("disenos/getDisenos");
                    this.$fire({
                        title: "No asignado",
                        html: `<p>Ocurrió un error ala signar el diseñaador</p><p>${err}</p>`,
                        type: "danger",
                    });
                    return false;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },

    /* mounted() {
        this.attributesVal = this.attributesval
        this.attributesCat = this.attributescat
    }, */

    // props: ["item", "options", "hashtags", "idempleado", "closemodal"],
    props: ["attributesval", "item", "attributescat", "reload"],
};
</script>
