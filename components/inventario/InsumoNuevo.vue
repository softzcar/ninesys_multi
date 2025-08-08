<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="person-plus"></b-icon> {{ title }}
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit" @reset="onReset">
                                <b-form-group
                                    id="input-group-1"
                                    label="Insumo:"
                                    label-for="input-insumo"
                                >
                                    <b-form-input
                                        id="input-insumo"
                                        v-model="form.insumo"
                                        placeholder="Ingrese el insumo"
                                        required
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-3"
                                    label="Cantidad:"
                                    label-for="input-cantidad"
                                >
                                    <b-form-input
                                        id="input-cantidad"
                                        v-model="form.cantidad"
                                        placeholder="Ingrese la cantidad"
                                        required
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-2"
                                    label="Tipo de unidad:"
                                    label-for="input-unidad"
                                >
                                    <b-form-select
                                        id="input-unidad"
                                        v-model="form.unidad"
                                        :options="unidadesOptions"
                                        required
                                    >
                                    </b-form-select>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-4"
                                    label="Costo:"
                                    label-for="input-costo"
                                >
                                    <b-form-input
                                        id="input-costo"
                                        v-model="form.costo"
                                        placeholder="Ingrese el costo"
                                        type="number"
                                        min="0"
                                        step="0.10"
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-3"
                                    label="Rendimiento:"
                                    label-for="input-rendimiento"
                                >
                                    <b-form-input
                                        id="input-rendimiento"
                                        v-model="form.rendimiento"
                                        placeholder="Ingrese la cantidad"
                                        type="number"
                                        min="0"
                                        step="0.10"
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-4"
                                    label="Departamento:"
                                    label-for="input-departamento"
                                >
                                    <b-form-select
                                        id="input-departamento"
                                        v-model="form.departamento"
                                        :options="departamentOptions"
                                        required
                                    >
                                    </b-form-select>
                                </b-form-group>
                                <b-button type="submit" variant="primary"
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
import axios from "axios"
export default {
    data() {
        return {
            form: {
                insumo: "",
                unidad: "",
                cantidad: "",
                rendimiento: 0,
                costo: 0,
                departamento: "",
            },
            unidadesOptions: [
                { value: "Mts", text: "Metros" },
                { value: "Kg", text: "Kilos" },
                { value: "Und", text: "Unidades" },
            ],
            departamentOptions: this.$config.DEPARTAMENT_OPTIONS,
            size: "md",
            title: "Nuevo Insumo",
            overlay: false,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        resetForm() {
            this.overlay = true
            this.form = {
                insumo: "",
                unidad: "",
                cantidad: "",
                rendimiento: 0,
                departamento: "",
            }
            this.overlay = false
        },
        async guardarInsumo() {
            this.overlay = true

            const data = new URLSearchParams()
            data.set("insumo", this.form.insumo)
            data.set("unidad", this.form.unidad)
            data.set("cantidad", this.form.cantidad)
            data.set("rendimiento", this.form.rendimiento)
            data.set("costo", this.form.costo)
            data.set("departamento", this.form.departamento)
            data.set("es_tinta", 0)

            await this.$axios
                .post(`${this.$config.API}/insumos/nuevo`, data)
                .then((res) => {
                    console.log("resultado insumo nuevo", res)

                    this.$fire({
                        title: `Insumo ${this.form.insumo} ID: ${res.data[0].last_insert_id}`,
                        html: ` `,
                        type: "info",
                    }).then(() => {
                        this.resetForm()
                        this.$bvModal.hide(this.modal)
                    })
                })
        },

        onSubmit(event) {
            event.preventDefault()
            this.guardarInsumo().then(() => this.$emit("reload"))
        },

        onReset(event) {
            event.preventDefault()
            // Reset our form values
            this.form = {
                insumo: "",
                unidad: "",
                cantidad: "",
                rendimiento: 0,
                departamento: "",
            }
            // Trick to reset/clear native browser form validation state
            this.show = false
            this.$nextTick(() => {
                this.show = true
            })
        },
    },
}
</script>
