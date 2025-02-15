<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div v-if="
                dataUser.departamento === 'Administración' ||
                dataUser.departamento === 'Producción'
            ">
                <b-container>
                    <b-overlay :show="overlay" spinner-small>

                        <b-row>
                            <b-col>
                                <h2 class="mb-4">Reporte de insumos</h2>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col>
                                <b-alert variant="light" show>
                                    <div v-html="msg"></div>
                                </b-alert>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col cols="8"></b-col>

                            <b-col cols="4">
                                <b-form>
                                    <b-form>
                                        <b-form-group id="input-group-1" label="Fecha inicio:" label-for="fecha-1">
                                            <b-form-datepicker id="fecha-1" v-model="form.fechaConsultaInicio"
                                                class="mb-2"></b-form-datepicker>
                                        </b-form-group>

                                        <b-form-group id="input-group-2" label="Fecha fin:" label-for="fecha-2">
                                            <b-form-datepicker v-model="form.fechaConsultaFin"
                                                class="mb-2"></b-form-datepicker>
                                        </b-form-group>

                                        <b-form-group id="input-group-3" label="Número de orden"
                                            label-for="numero-orden">
                                            <b-form-input id="numero-orden" autocomplete="off" type="search"
                                                v-model="form.idOrden" placeholder="Número de orden" align-v="righr"
                                                style="width: 10rem"></b-form-input>
                                        </b-form-group>

                                        <b-button @click="getReport" variant="primary">
                                            Generar Reporte
                                        </b-button>
                                        <b-button @click="resetForm" variant="danger">Limpiar</b-button>
                                    </b-form>
                                </b-form>
                            </b-col>
                        </b-row>

                        <b-row v-if="showReport">
                            <b-col>
                                <h3>Tintas</h3>
                                <b-table responsive :fields="fieldsTinta" :items="this.dataTable.tintas">
                                    <template #cell(id_orden)="data">
                                        <linkSearch :id="data.item.id_orden" />
                                    </template>

                                    <template #cell(id_producto)="data">
                                        <linkSearch :id="data.item.id_orden" />
                                    </template>

                                    <!-- <template #foot(total_tintas)="data">
                                        {{ totales.tinta }} {{ data.item }}
                                    </template> -->
                                </b-table>
                                <p class="text-right total-table" style="padding-right: 160px;">TOTAL {{ totales.tinta
                                    }}</p>
                            </b-col>
                        </b-row>

                        <b-row v-if="showReport">
                            <b-col>
                                <h3>Insumos</h3>
                                <b-table responsive :fields="fieldsInsumos" :items="this.dataTable.insumos_consumidos">
                                    <template #cell(id_orden)="data">
                                        <linkSearch :id="data.item.id_orden" />
                                    </template>

                                    <template #cell(total_insumo)="data">
                                        $ {{ data.item.total_insumo }}
                                    </template>

                                    <template #cell(cantidad_utilizada)="data">
                                        {{ data.item.cantidad_utilizada }} {{ data.item.unidad }}
                                    </template>

                                    <template #cell(cantidad_restante)="data">
                                        {{ data.item.cantidad_restante }} {{ data.item.unidad }}
                                    </template>
                                </b-table>
                                <p class="text-right total-table" style="padding-right: 40px;">TOTAL {{ totales.insumo
                                    }}</p>
                            </b-col>
                        </b-row>
                    </b-overlay>
                </b-container>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixins.js"

export default {
    data() {
        return {
            mixins: [mixin],
            totalTinta: 0,
            form: {
                idOrden: '',
                fechaConsultaInicio: '',
                fechaConsultaFin: '',
            },
            fieldsTinta: [
                {
                    key: 'id_orden',
                    label: 'Orden',
                },
                {
                    key: 'cyan',
                    label: 'Cyan',
                },
                {
                    key: 'magenta',
                    label: 'Magenta',
                },
                {
                    key: 'yellow',
                    label: 'Yellow',
                },
                {
                    key: 'black',
                    label: 'Black',
                },
                {
                    key: 'total_tinta',
                    label: 'Total Tinta',
                },
            ],
            fieldsInsumos: [
                {
                    key: 'id_orden',
                    label: 'Orden',
                },
                {
                    key: 'id_insumo',
                    label: 'ID Insumo',
                },
                {
                    key: 'nombre_insumo',
                    label: 'Insumo',
                },
                {
                    key: 'costo',
                    label: 'Costo',
                },
                {
                    key: 'rendimiento',
                    label: 'Rendimiento',
                },
                {
                    key: 'colo',
                    label: 'Color',
                },
                {
                    key: 'cantidad_utilizada',
                    label: 'Cantidad Utilizada',
                },
                {
                    key: 'cantidad_restante',
                    label: 'Cantidad Restante',
                },
                {
                    key: 'departamento',
                    label: 'Cantidad Restante',
                },
                {
                    key: 'total_insumo',
                    label: 'Total Insumo',
                },
            ],
            msg: '',
            overlay: false,
            dataTable: [],
            products: [],
        };
    },

    computed: {
        ...mapState("login", ["dataUser", "access"]),

        myTable() {
            return this.dataTable.items;
        },

        showReport() {
            if (this.dataTable.length === 0) {
                return false
            } else {
                return true
            }
        },

        totales() {
            const tinta = this.dataTable.tintas.reduce((sum, item) => sum + item.total_tinta, 0)
            const insumos = this.dataTable.insumos_consumidos.reduce((sum, item) => sum + item.total_insumo, 0)
            return {
                tinta: tinta.toFixed(2),
                insumo: insumos.toFixed(2)
            }
        },
    },

    methods: {
        resetForm() {
            this.form = {
                idOrden: '',
                fechaConsultaInicio: '',
                fechaConsultaFin: '',
            }
        },

        async getReport() {
            this.msg = '<p>Generado reporte...</p>'
            console.log('datos de solicitud del reporte de insumos', this.form);
            let id_orden = ''

            const { idOrden, fechaConsultaInicio, fechaConsultaFin } = this.form;

            // Si no se envía ningún filtro
            if (idOrden.trim() === '' && fechaConsultaInicio.trim() === '' && fechaConsultaFin.trim() === '') {
                this.msg = '<p>Esta consulta contiene todos los registros existentes. Puede generar el reporte proporcionando un rango de fechas o indicando un número de orden.</p>';
            }

            // Si se envía solo el número de orden
            else if (idOrden.trim() !== '' && fechaConsultaInicio.trim() === '' && fechaConsultaFin.trim() === '') {
                this.msg = `<p>Resultados de los insumos utilizados en la orden número ${idOrden}.</p>`;
                id_orden = `/${idOrden}`; // Asignar el valor a id_orden si es necesario
            }

            // Si se envían la fecha de inicio y la fecha de fin
            else if (fechaConsultaInicio.trim() !== '' && fechaConsultaFin.trim() !== '') {
                if (new Date(fechaConsultaInicio) > new Date(fechaConsultaFin)) {
                    this.$fire({
                        title: "Datos requeridos",
                        html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
                        type: "warning",
                    })
                    return
                }

                this.form.idOrden = ''

                id_orden = `/0/${fechaConsultaInicio}/${fechaConsultaFin}`; // Asignar el valor a id_orden si es necesario
                this.msg = `<p>El reporte por fechas omite el numero de orden y se mostrarán todas las ordenes en el rango de fechas proporcionado</p><p>Resultado de los insumos utilizados desde ${fechaConsultaInicio} hasta ${fechaConsultaFin}.</p>`;
            }

            // Si se envía solo la fecha de inicio sin la fecha de fin
            else if (fechaConsultaInicio.trim() !== '' && fechaConsultaFin.trim() === '') {
                this.msg = ``;
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>Por favor seleccione ambas fechas</p>`,
                    type: "warning",
                })
                return
            }

            // Si se envía solo la fecha de fin sin la fecha de inicio
            else if (fechaConsultaInicio.trim() === '' && fechaConsultaFin.trim() !== '') {
                this.msg = ``;
                this.msg = `<p>Debe indicar ambas fechas, el reporte por fechas omite el numero de orden y se mostrarán todas las ordenes en el rango de fechas proporcionado</p>`;
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>Por favor seleccione ambas fechas</p>`,
                    type: "warning",
                })
                return
            }

            // Si se envían el número de orden y alguna fecha (inicio o fin)
            else if (idOrden.trim() !== '' && (fechaConsultaInicio.trim() !== '' || fechaConsultaFin.trim() !== '')) {
                this.msg = ``;
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>Debe indicar ambas fechas, el reporte por fechas omite el numero de orden y se mostrarán todas las ordenes en el rango de fechas proporcionado</p>`,
                    type: "warning",
                })
                return
            }

            else if (idOrden.trim() !== '' && (fechaConsultaInicio.trim() !== '' && fechaConsultaFin.trim() !== '')) {
                if (new Date(fechaConsultaInicio) > new Date(fechaConsultaFin)) {
                    this.$fire({
                        title: "Datos requeridos",
                        html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
                        type: "warning",
                    })
                    return
                }
                this.msg = `<p>Resultado de los insumos utilizados desde ${fechaConsultaInicio} hasta ${fechaConsultaFin}.</p>`;
                this.$fire({
                    title: "Reorte de Insumos",
                    html: `<p>El reporte por fechas omite el numero de orden, se mostrarán todas las ordenes en el rango de fechas proporcionado</p>`,
                    type: "info",
                })
            }

            await this.$axios
                .get(
                    // `${this.$config.API}/insumos/reporte/orden/${this.form.idOrden}`
                    // `${this.$config.API}/reporte/insumos-cosumidos-por-orden${this.form.idOrden}[/{fecha_inicio}[/{fecha_fin}]]]`
                    `${this.$config.API}/reporte/insumos-cosumidos-por-orden${id_orden}`
                )
                .then((resp) => {
                    this.dataTable = resp.data;
                    if (resp.data.tintas.length === 0 && resp.data.insumos_consumidos.length === 0) {
                        this.$fire({
                            title: "Reporte de Insumos",
                            html: `<p>No se encontraron registros.</p>`,
                            type: "info",
                        })
                    }
                    this.overlay = false;
                });
        },
    },
};
</script>
