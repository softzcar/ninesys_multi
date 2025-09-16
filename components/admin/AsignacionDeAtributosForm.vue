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
                        @click="$bvModal.show(modalId)"
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
        
        <b-modal :id="modalId" title="Crear Nuevo Atributo" hide-footer no-enforce-focus>
            <b-overlay :show="overlay" spinner-small>
                <b-form @submit.prevent="crearAtributo">
                    <b-form-group
                        id="input-group-new-attr"
                        label="Nombre del atributo:"
                        label-for="input-new-attr"
                    >
                        <b-form-input
                            id="input-new-attr"
                            v-model="newAttributeName"
                            placeholder="Ingrese el nombre del atributo"
                            required
                        ></b-form-input>
                    </b-form-group>
                    <b-button type="submit" variant="primary">Guardar</b-button>
                </b-form>
            </b-overlay>
        </b-modal>
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
            newAttributeName: "",
        };
    },

    computed: {
        modalId() {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-new-attr-${rand}`;
        },
        dataSave() {
            return {
                id: this.item.id,
                attribute: this.attribute,
                descripcion: this.attributeText,
            };
      },

      options() {
        return this.attributescat
      },
    },

    methods: {
        async crearAtributo() {
            if (!this.newAttributeName || this.newAttributeName.trim() === '') {
                this.$fire({
                    title: 'Dato Requerido',
                    html: '<p>El nombre no puede estar vacío.</p>',
                    type: 'info'
                });
                return;
            }

            this.overlay = true;
            const data = new URLSearchParams();
            data.set("nombre", this.newAttributeName);

            try {
                const response = await this.$axios.post(`${this.$config.API}/products-attributes`, data);

                if (response.data && typeof response.data.response === 'string') {
                    const innerResponse = JSON.parse(response.data.response);
                    if (innerResponse.insert_id) {
                        this.$fire({
                            title: "Atributo Creado",
                            html: `<p>El atributo '${this.newAttributeName}' ha sido creado.</p>`,
                            type: "success",
                        });
                        this.$emit('refresh-list');
                        this.newAttributeName = '';
                        this.$bvModal.hide(this.modalId);
                    } else {
                        throw new Error("La respuesta de la API no contiene 'insert_id'.");
                    }
                } else {
                    throw new Error("La respuesta de la API no tiene el formato esperado.");
                }
            } catch (err) {
                this.$fire({
                    title: "Error",
                    html: `<p>No se pudo crear el atributo.</p><p>${err}</p>`,
                    type: "warning",
                });
            } finally {
                this.overlay = false;
            }
        },

        asignarAtributo() {
            this.asignado = true;
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

    mounted() {
        if (this.item && this.item.attribute) {
            this.attribute = this.item.attribute;
            this.attributeText = this.item.descripcion;
        }
    },

    props: ["attributesval", "item", "attributescat", "reload"],
};
</script>