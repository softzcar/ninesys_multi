<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="
                    dataUser.departamento === 'Comercialización' ||
                    dataUser.departamento === 'Administración'
                "
            >
                <b-overlay :show="overlay" spinner-small>
                    <b-container
                        v-if="
                            this.dataUser.departamento === 'Comercialización' ||
                            dataUser.departamento === 'Administración'
                        "
                    >
                        <b-row>
                            <b-col>
                                <h1 class="mb-4">{{ titulo }}</h1>
                            </b-col>
                        </b-row>

                        <b-form class="mb-4" @submit="onSubmit">
                            <b-row>
                                <b-col>
                                    <h3>Fecha Inicio</h3>
                                    <b-form-datepicker
                                        class="mb-4"
                                        v-model="fechaConsultaInicio"
                                    />
                                </b-col>
                                <b-col>
                                    <h3>Fecha Fin</h3>
                                    <b-form-datepicker
                                        class="mb-4"
                                        v-model="fechaConsultaFin"
                                    />
                                </b-col>
                            </b-row>
                            <b-row>
                                <b-col class="text-center">
                                    <b-button type="submit" variant="primary"
                                        >BUSCAR</b-button
                                    >
                                </b-col>
                            </b-row>
                        </b-form>

                        <b-row>
                            <b-col>
                                <h3 class="mt-4">Efectivo</h3>

                                <b-table
                                    striped
                                    small
                                    :items="dataReport.efectivo"
                                    :fields="fields"
                                    foot-clone
                                >
                                    <template #cell(moneda)="data">
                                        {{ data.item.moneda }}
                                        {{ data.item.metodo_pago }}
                                    </template>

                                    <template #cell(monto)="data">
                                        <div class="text-right">
                                            {{ formatNumber(data.item.monto) }}
                                        </div>
                                    </template>

                                    <template #cell(tasa)="data">
                                        <div class="text-right">
                                            {{ formatNumber(data.item.tasa) }}
                                        </div>
                                    </template>

                                    <template #cell(dolares)="data">
                                        <div class="text-right">
                                            {{
                                                formatNumber(data.item.dolares)
                                            }}
                                        </div>
                                    </template>

                                    <template #foot(tasa)="data">
                                        <div>&nbsp;</div>
                                    </template>

                                    <template #foot(moneda)="data">
                                        <div>&nbsp;</div>
                                    </template>

                                    <template #foot(monto)="data">
                                        <div>&nbsp;</div>
                                    </template>
                                    <template #foot(dolares)="data">
                                        <!-- <span class="text-danger">{{ data.label }}</span> -->
                                        <!-- {{ dataReport.efectivo }} -->
                                        {{ getTotal("efectivo", "USD") }}
                                    </template>
                                </b-table>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col>
                                <h3>Retiros</h3>

                                <b-table
                                    striped
                                    small
                                    :items="dataReport.retiros"
                                    :fields="fields"
                                    foot-clone
                                >
                                    <template #cell(moneda)="data">
                                        {{ data.item.moneda }}
                                        {{ data.item.metodo_pago }}
                                    </template>

                                    <template #cell(monto)="data">
                                        <div class="text-right">
                                            {{ formatNumber(data.item.monto) }}
                                        </div>
                                    </template>

                                    <template #cell(tasa)="data">
                                        <div class="text-right">
                                            {{ formatNumber(data.item.tasa) }}
                                        </div>
                                    </template>

                                    <template #cell(dolares)="data">
                                        <div class="text-right">
                                            {{
                                                formatNumber(data.item.dolares)
                                            }}
                                        </div>
                                    </template>

                                    <template #foot(tasa)="data">
                                        <div>&nbsp;</div>
                                    </template>

                                    <template #foot(moneda)="data">
                                        <div>&nbsp;</div>
                                    </template>

                                    <template #foot(monto)="data">
                                        <div>&nbsp;</div>
                                    </template>
                                    <template #foot(dolares)="data">
                                        <!-- <span class="text-danger">{{ data.label }}</span> -->
                                        <!-- {{ dataReport.efectivo }} -->
                                        {{ getTotal("retiros", "USD") }}
                                    </template>
                                </b-table>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col>
                                <h4 class="text-right mb-4">
                                    Total Efectivo
                                    <span class="money-result"
                                        >$
                                        {{
                                            getTotal("efectivo", "num") -
                                            getTotal("retiros", "num")
                                        }}</span
                                    >
                                </h4>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col>
                                <h3>Transferencias</h3>

                                <b-table
                                    striped
                                    small
                                    :items="dataReport.digital"
                                    :fields="fields"
                                    foot-clone
                                >
                                    <template #cell(moneda)="data">
                                        {{ data.item.moneda }}
                                        {{ data.item.metodo_pago }}
                                    </template>

                                    <template #cell(monto)="data">
                                        <div class="text-right">
                                            {{ formatNumber(data.item.monto) }}
                                        </div>
                                    </template>

                                    <template #cell(tasa)="data">
                                        <div class="text-right">
                                            {{ formatNumber(data.item.tasa) }}
                                        </div>
                                    </template>

                                    <template #cell(dolares)="data">
                                        <div class="text-right">
                                            {{
                                                formatNumber(data.item.dolares)
                                            }}
                                        </div>
                                    </template>

                                    <template #foot(tasa)="data">
                                        <div>&nbsp;</div>
                                    </template>

                                    <template #foot(moneda)="data">
                                        <div>&nbsp;</div>
                                    </template>

                                    <template #foot(monto)="data">
                                        <div>&nbsp;</div>
                                    </template>
                                    <template #foot(dolares)="data">
                                        <!-- <span class="text-danger">{{ data.label }}</span> -->
                                        <!-- {{ dataReport.efectivo }} -->
                                        {{ getTotal("digital", "USD") }}
                                    </template>
                                </b-table>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col>
                                <hr />
                                <h4 class="text-right mb-4 mt-4 pb-4">
                                    Total General
                                    <span class="money-result"
                                        >$
                                        {{
                                            totalGeneral(
                                                getTotal("efectivo", "num"),
                                                getTotal("digital", "num"),
                                                getTotal("retiros", "num")
                                            )
                                        }}</span
                                    >
                                </h4>
                            </b-col>
                        </b-row>

                        <!-- <pre>
            {{ sumPagos }}
          </pre> -->
                    </b-container>
                </b-overlay>
            </div>

            <div v-else>
                <accessDenied />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
import axios from "axios"
import mixin from "~/mixins/mixins.js"
import { isNull } from "util"

export default {
    mixins: [mixin],

    data() {
        return {
            titulo: "Reporte de caja",
            overlay: true,
            fechaConsultaInicio: [],
            fechaConsultaFin: [],
            dataReport: [],
            retiros: [],
            pagos: [],
            total: 0,
            fields: [
                { key: "moneda", label: "Moneda" },
                {
                    key: "tasa",
                    label: "Tasa",
                    thClass: "text-right",
                    tdClass: "text-right",
                },
                {
                    key: "monto",
                    label: "Monto",
                    thClass: "text-right",
                    tdClass: "text-right",
                },
                {
                    key: "dolares",
                    label: "Dólares",
                    thClass: "text-right",
                    tdClass: "text-right",
                },
            ],
            fields_transferencias: [
                { key: "moneda", label: "Moneda" },
                { key: "tasa", label: "Tasa" },
                {
                    key: "dolares",
                    label: "Dólares",
                    thClass: "text-right",
                    tdClass: "text-right",
                },
                {
                    key: "monto",
                    label: "Monto",
                    thClass: "text-right",
                    tdClass: "text-right",
                },
            ],
            fieldsRetiros: [
                { key: "moneda", label: "Moneda" },
                {
                    key: "monto",
                    label: "Monto",
                    thClass: "text-right",
                    tdClass: "text-right",
                },
                { key: "detalle_retiro", label: "Detalle" },
            ],
        }
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),

        sumPagos() {
            var result = []
            this.pagos.forEach(function (item) {
                var key = item.metodo_pago + "-" + item.moneda
                var found = result.find((el) => el.key === key)
                if (found) {
                    found.monto =
                        parseFloat(found.monto) + parseFloat(item.monto)
                } else {
                    result.push({
                        key,
                        monto: item.monto,
                        moneda: item.moneda,
                        metodo_pago: item.metodo_pago,
                    })
                }
            })
            return result
        },

        sumRetiros() {
            var result = []
            this.retiros.forEach(function (item) {
                var key = item.metodo_pago + "-" + item.moneda
                var found = result.find((el) => el.key === key)
                if (found) {
                    found.monto =
                        parseFloat(found.monto) + parseFloat(item.monto)
                } else {
                    result.push({
                        key,
                        monto: item.monto,
                        moneda: item.moneda,
                        metodo_pago: item.metodo_pago,
                        detalle_retiro: item.detalle_retiro,
                    })
                }
            })
            return result
        },
    },

    methods: {
        getTotal(campo, curr) {
            let accumulatedDollars = 0
            let result
            if (this.dataReport[campo] === undefined) {
                return 0
            } else {
                this.dataReport[campo].forEach((item) => {
                    if (item.dolares !== null) {
                        accumulatedDollars += parseFloat(item.dolares)
                    }
                })

                if (curr === "num") {
                    result = accumulatedDollars.toFixed(2)
                } else {
                    result = curr + " " + accumulatedDollars.toFixed(2)
                }

                return result
            }
        },

        onSubmit(event) {
            event.preventDefault()
            const fechaInicio = this.fechaConsultaInicio
            const fechaFin = this.fechaConsultaFin

            if (!fechaInicio || !fechaFin) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>Por favor seleccione ambas fechas</p>`,
                    type: "warning",
                })
                return
            }

            if (new Date(fechaInicio) > new Date(fechaFin)) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
                    type: "warning",
                })
                return
            }
            this.realizarConsulta()
        },

        realizarConsulta() {
            this.overlay = true
            this.getCierre(
                this.fechaConsultaInicio,
                this.fechaConsultaFin
            ).then(() => (this.overlay = false))
            // this.getPagos(val)
            // this.getDataReport(val)
        },

        async getCierre(inicio, fin) {
            // Tipos de cierre de caja: diario, semanal, yyyy-mm-dd
            await this.$axios
                .get(
                    `${this.$config.API}/reporte-de-caja/${inicio}/${fin}/${this.$store.state.login.dataUser.id_empleado}`
                )
                .then((res) => {
                    this.dataReport = res.data.data
                    console.log("dataReport:", this.dataReport)
                })
        },

        fechaActual() {
            let date = new Date()
            let day = `${date.getDate()}`.padStart(2, "0")
            let month = `${date.getMonth() + 1}`.padStart(2, "0")
            let year = date.getFullYear()

            return `${year}-${month}-${day}`
        },

        totalGeneral(efectivo, transferencias, retiros) {
            let result =
                parseFloat(efectivo) +
                parseFloat(transferencias) -
                parseFloat(retiros)
            return result.toFixed(2)
        },

        async getDataReport(fecha) {
            await this.$axios
                .get(`${this.$config.API}/retiros/${fecha}`)
                .then((res) => {
                    this.retiros = res.data.data
                    /* this.report.forEach(item => {
          this.sumatoriaDescuento += Number(item.pago_descuento)
          this.sumatoriaTotal += Number(item.pago_total)
          this.sumatoriaAbono += Number(item.pago_abono)
        }) */
                })
        },

        async getPagos(fecha) {
            await this.$axios
                .get(`${this.$config.API}/pagos-ordenes/${fecha}`)
                .then((res) => {
                    this.pagos = res.data.data
                    /* this.report.forEach(item => {
          this.sumatoriaDescuento += Number(item.pago_descuento)
          this.sumatoriaTotal += Number(item.pago_total)
          this.sumatoriaAbono += Number(item.pago_abono)
        }) */
                })
        },
    },

    beforeMount() {
        this.fechaConsulta = this.fechaActual()
        this.fechaConsultaFin = this.fechaActual()
        console.log("fechaConsulta", this.fechaConsulta)
        console.log("fechaConsultaFin", this.fechaConsultaFin)
        this.getCierre(this.fechaConsulta, this.fechaConsultaFin).then(
            () => (this.overlay = false)
        )
    },

    mounted() {},
}
</script>
