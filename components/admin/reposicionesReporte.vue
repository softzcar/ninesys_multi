<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <b-container>
                <b-row>
                    <b-col>
                        <h2 class="mb-4">Reporte de asistencias</h2>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col
                        xs="12"
                        sm="12"
                        md="6"
                        lg="4"
                        xl="4"
                        offset-md="6"
                        offset-lg="8"
                        offset-xl="8"
                    >
                        <b-form @submit="onSubmit">
                            <b-form-group
                                id="input-group-1"
                                label="Fecha inicio:"
                                label-for="fecha-1"
                            >
                                <b-form-datepicker
                                    id="fecha-1"
                                    v-model="form.fechaConsultaInicio"
                                    class="mb-2"
                                ></b-form-datepicker>
                                <!-- <pre>{{ form.fechaConsultaInicio }}</pre> -->
                            </b-form-group>

                            <b-form-group
                                id="input-group-2"
                                label="Fecha fin:"
                                label-for="fecha-2"
                            >
                                <b-form-datepicker
                                    v-model="form.fechaConsultaFin"
                                    class="mb-2"
                                ></b-form-datepicker>
                            </b-form-group>
                            <b-button
                                class="mb-4"
                                type="submit"
                                variant="primary"
                                >Buscar Asistencias
                            </b-button>
                        </b-form>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <h3 class="mt-4">
                            Reporte Resumen del
                            {{ formatDate(form.fechaConsultaInicio) }} al
                            {{ formatDate(form.fechaConsultaFin) }}
                        </h3>
                        <b-table
                            striped
                            :fields="fields_resumen"
                            :items="itemsResumen"
                            class="mb-4"
                        >
                            <template #cell(acciones)="data">
                                <admin-asistenciasReporteDetalles
                                    :data_empleado="
                                        filterDataEmpleado(
                                            data.item.id_empleado
                                        )
                                    "
                                />
                            </template>
                        </b-table>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <h3 class="mt-4">
                            Reporte Detallado del
                            {{ formatDate(form.fechaConsultaInicio) }} al
                            {{ formatDate(form.fechaConsultaFin) }}
                        </h3>
                        <b-table
                            striped
                            :fields="fields_detallado"
                            :items="itemsDetallado"
                        >
                            <!-- <template #cell(categories)="data">
            <b-badge
                  v-for="(prod, index) in showCategories(data.item.categories)"
                  :key="index"
                  pill
                  variant="info"
                  class="mr-1 mb-1 p-2"
                  >{{ prod }}</b-badge
                >
              </template> -->
                        </b-table>
                    </b-col>
                </b-row>
            </b-container>
        </b-overlay>
    </div>
</template>

<script>
import axios from "axios"
import mixin from "~/mixins/mixins.js"
import { DateTime } from "luxon"

export default {
    name: "NinesysAsistenciasReporte",

    mixins: [mixin],

    data() {
        return {
            form: {
                fechaConsultaInicio: "",
                fechaConsultaFin: "",
            },
            overlay: true,
            fields_resumen: null,
            fields_detallado: null,
            itemsResumen: null,
            itemsDetallado: null,
        }
    },

    computed: {
        hoy() {
            const today = new Date()
            const year = today.getFullYear()
            const month = (today.getMonth() + 1).toString().padStart(2, "0")
            const day = today.getDate().toString().padStart(2, "0")

            return `${year}-${month}-${day}`
        },
    },

    methods: {
        filterDataEmpleado(id_empleado) {
            return this.itemsDetallado.filter(
                (el) => el.id_empleado === id_empleado
            )
        },

        prepareDate(dateString) {
            const date = DateTime.fromJSDate(new Date(dateString))
            return date.toFormat("dd/LL/yyyy")
        },

        onSubmit(event) {
            event.preventDefault()
            const fechaConsultaInicio = this.form.fechaConsultaInicio
            const fechaConsultaFin = this.form.fechaConsultaFin

            if (!fechaConsultaInicio || !fechaConsultaFin) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>Por favor seleccione ambas fechas</p>`,
                    type: "warning",
                })
                return
            }

            if (new Date(fechaConsultaInicio) > new Date(fechaConsultaFin)) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
                    type: "warning",
                })
                return
            }
            this.getAsistencias()
        },

        async getAsistencias() {
            this.overlay = true
            await this.$axios
                .get(
                    `${this.$config.API}/asistencias/reporte/resumen/${this.form.fechaConsultaInicio}/${this.form.fechaConsultaFin}`
                )
                .then((res) => {
                    this.fields_resumen = res.data.fields_resumen
                    this.fields_detallado = res.data.fields_detallado
                    this.itemsResumen = res.data.resumen
                    this.itemsDetallado = res.data.detallado
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<P>No se cargaron los datos correctamente</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },
    },

    beforeMount() {
        this.form.fechaConsultaInicio = this.hoy
        this.form.fechaConsultaFin = this.hoy
    },

    mounted() {
        this.getAsistencias()
    },
}
</script>

<style lang="scss" scoped></style>
