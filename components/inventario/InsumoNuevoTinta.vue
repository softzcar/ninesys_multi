<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <b-container>
                <b-row>
                    <b-col>
                        <h2 class="mb-4">Nueva Tinta</h2>
                        <b-form @submit="onSubmit" @reset="onReset" novalidate>
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

                            <div class="form-group mt-3">
                                <label>Color de la Tinta:</label>
                                <div class="d-flex flex-wrap">
                                    <div class="form-check form-check-inline" v-for="colorOption in colorOptions" :key="colorOption.value">
                                        <input
                                            class="form-check-input"
                                            type="radio"
                                            :id="'color-' + colorOption.value"
                                            :value="colorOption.value"
                                            v-model="selectedColor"
                                            required
                                        />
                                        <label
                                            class="form-check-label px-2 py-1 rounded"
                                            :for="'color-' + colorOption.value"
                                            :style="{ backgroundColor: colorOption.bgColor, color: colorOption.textColor, border: colorOption.border || '' }"
                                        >
                                            {{ colorOption.name }}
                                        </label>
                                    </div>
                                </div>
                            </div>

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

                            <!-- <b-form-group
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
                            </b-form-group> -->

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

                            <!-- <b-form-group
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
                            </b-form-group> -->
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
                color: "",
            },
            selectedColor: '',
            colorOptions: [
                { name: 'Cyan', value: 'C', bgColor: '#00FFFF', textColor: '#000000' },
                { name: 'Magenta', value: 'M', bgColor: '#FF00FF', textColor: '#000000' },
                { name: 'Yellow', value: 'Y', bgColor: '#FFFF00', textColor: '#000000' },
                { name: 'Black', value: 'K', bgColor: '#000000', textColor: '#FFFFFF' },
                { name: 'White', value: 'W', bgColor: '#FFFFFF', textColor: '#000000', border: '1px solid #ccc' },
            ],
            unidadesOptions: [
                { value: "Mts", text: "Metros" },
                { value: "Kg", text: "Kilos" },
                { value: "Und", text: "Unidades" },
            ],
            departamentOptions: this.$config.DEPARTAMENT_OPTIONS,
            size: "md",
            title: "Nueva Tinta",
            overlay: false,
        }
    },

    

    methods: {
        resetForm() {
            this.form = {
                insumo: "",
                unidad: "",
                cantidad: "",
                rendimiento: 1,
                costo: 0,
                departamento: "",
                color: "",
            }
            this.selectedColor = ''
        },
        async guardarInsumo() {
            const requiredFields = {
                insumo: 'Insumo',
                selectedColor: 'Color de la Tinta',
                cantidad: 'Cantidad',
                costo: 'Costo',
                rendimiento: 'Rendimiento',
            };

            for (const fieldKey in requiredFields) {
                let fieldValue;
                if (fieldKey === 'selectedColor') {
                    fieldValue = this.selectedColor;
                } else {
                    fieldValue = this.form[fieldKey];
                }

                if (!fieldValue) {
                    this.$fire({
                        title: "Campo Requerido",
                        html: `<p>Por favor, complete el campo: <strong>${requiredFields[fieldKey]}</strong></p>`,
                        type: "warning",
                    });
                    return;
                }
            }

            if (parseFloat(this.form.rendimiento) === 0) {
                this.$fire({
                    title: "Valor Inválido",
                    html: `<p>El campo <strong>Rendimiento</strong> no puede ser cero.</p>`,
                    type: "warning",
                });
                return;
            }

            this.overlay = true

            const data = new URLSearchParams()
            data.set("insumo", this.form.insumo)
            data.set("unidad", 'Und')
            data.set("cantidad", this.form.cantidad)
            data.set("rendimiento", this.form.rendimiento)
            data.set("costo", this.form.costo)
            data.set("departamento", 'Impresión')
            data.set("es_tinta", 1)
            data.set("color", this.selectedColor)

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
                costo: 0,
                departamento: "",
                color: "",
            }
            this.selectedColor = ''
            // Trick to reset/clear native browser form validation state
            this.show = false
            this.$nextTick(() => {
                this.show = true
            })
        },
    },
}
</script>
