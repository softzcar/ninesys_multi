<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div v-if="
                accessModule.accessData.id_modulo === 2 ||
                accessModule.accessData.id_modulo === 1
            ">
                <b-container>
                    <b-row>
                        <b-col>
                            <h1 class="mb-4">{{ titulo }}</h1>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col offset-lg="8" offset-xl="8">
                            <b-input-group class="mb-4" size="sm">
                                <b-form-input id="filter-input" v-model="filter" type="search"
                                    placeholder="Filtrar Resultados"></b-form-input>

                                <b-input-group-append>
                                    <b-button :disabled="!filter" @click="filter = ''">
                                        Limpiar
                                    </b-button>
                                </b-input-group-append>
                            </b-input-group>
                        </b-col>
                    </b-row>

                    <b-row>
                        <b-col>
                            <b-form class="mb-4" @submit="onSubmit">
                                <b-row>
                                    <b-col>
                                        <h3>Fecha Inicio</h3>
                                        <b-form-datepicker class="mb-4" v-model="fechaConsultaInicio" />
                                    </b-col>
                                    <b-col>
                                        <h3>Fecha Fin</h3>
                                        <b-form-datepicker class="mb-4" v-model="fechaConsultaFin" />
                                    </b-col>
                                    <b-col>
                                        <h3>Vendedor</h3>
                                        <b-form-select v-model="selectedVendedor" :options="vendedores" />
                                    </b-col>
                                </b-row>

                                <b-row>
                                    <b-col class="text-center">
                                        <b-button type="submit" variant="primary">BUSCAR</b-button>
                                    </b-col>
                                </b-row>
                            </b-form>
                        </b-col>
                    </b-row>

                    <b-row>
                        <b-col>
                            <!-- <b-table :items="resumen"></b-table> -->
                            <!-- <h2>Total pagos semana ${{ totalPagos }}</h2>
              <h2>Total descuentos semana ${{ totalDescuentos }}</h2> -->
                        </b-col>
                    </b-row>

                    <b-row>
                        <b-col>
                            <b-overlay :show="overlay" spinner-small>
                                <b-pagination v-model="currentPage" :total-rows="totalRows"
                                    :per-page="perPage"></b-pagination>

                                <p class="mt-3">
                                    Página actual: {{ currentPage }}
                                </p>

                                <h4 v-for="pago in this.totales.porMetodoPago" :key="pago.metodoPago"
                                    class="text-right">
                                    {{ pago.metodoPago }}: {{ pago.total }}
                                </h4>

                                <h3 class="text-right mb-2">
                                    TOTAL: {{ this.totales.totalGeneral }}
                                </h3>

                                <b-table sort-icon-left :per-page="perPage" :current-page="currentPage" ref="table"
                                    responsive small :fields="campos" :items="pagos" @filtered="onFiltered"
                                    :filter="filter" :filter-included-fields="includedFields">
                                    <template #cell(orden)="data">
                                        <linkSearch :key="data.item._id" :id="data.item.orden" />
                                    </template>

                                    <template #cell(monto)="data">
                                        {{ data.item.monto.toFixed(2) }}
                                    </template>

                                    <template #cell(tasa)="data">
                                        {{ data.item.tasa.toFixed(2) }}
                                    </template>

                                    <template #cell(_id)="data">
                                        {{
                                            usdConverter(
                                                data.item.moneda,
                                                data.item.monto,
                                                data.item.tasa
                                            )
                                        }}
                                    </template>
                                </b-table>
                            </b-overlay>
                        </b-col>
                    </b-row>
                </b-container>
            </div>

            <div v-else>
                <accessDenied />
            </div>
        </div>
        <pre>
    PAGOS::: {{ pagos }}
</pre>
    </div>
</template>

<script>
import { mapState } from "vuex"
import mixinLogin from "~/mixins/mixin-login.js";
import mixin from "~/mixins/mixins.js"

export default {
    mixins: [mixin, mixinLogin],

    data() {
        return {
            includedFields: ["orden", "empleado"],
            fechaConsultaInicio: '',
            fechaConsultaFin: '',
            vendedores: [],
            filter: null,
            perPage: 25,
            currentPage: 1,
            ordenesLength: 0,
            overlay: true,
            titulo: "Pagos y Abonos",
            pagos: [],
            selectedVendedor: 0,
            campos: [
                {
                    key: "orden",
                    label: "Orden",
                    sortable: true,
                },
                {
                    key: "empleado",
                    label: "Vendedor",
                    sortable: true,
                },
                {
                    key: "metodo_pago",
                    label: "Método",
                    sortable: true,
                },
                {
                    key: "_id",
                    label: "Total $",
                },
                {
                    key: "detalle",
                    label: "Detalles",
                },
                {
                    key: "moneda",
                    label: "Moneda",
                    sortable: true,
                },
                {
                    key: "monto",
                    label: "Monto",
                    sortable: true,
                },
                {
                    key: "tasa",
                    label: "Tasa",
                    sortable: true,
                },
                {
                    key: "fecha",
                    label: "Fecha",
                    sortable: true,
                },
                {
                    key: "hora",
                    label: "Hora",
                },
            ],
            ordenes: [],
        }
    },

    computed: {
        ...mapState("login", ["dataUser", "access"]),
        totales() {
            // Crear un objeto para almacenar los totales por método de pago y el total general
            const totales = {
                porMetodoPago: {},
                totalGeneral: 0,
            }

            // Iterar sobre cada elemento del arreglo de datos
            this.pagos.forEach((item) => {
                const { metodo_pago, monto, tasa } = item

                // Calcular el monto ajustado
                const montoAjustado = monto / tasa

                // Sumar al total general
                totales.totalGeneral += montoAjustado

                // Sumar al total del método de pago
                if (!totales.porMetodoPago[metodo_pago]) {
                    totales.porMetodoPago[metodo_pago] = 0
                }
                totales.porMetodoPago[metodo_pago] += montoAjustado
            })

            // Convertir el objeto de totales por método de pago en un arreglo de objetos
            const resultadoPorMetodoPago = Object.entries(
                totales.porMetodoPago
            ).map(([metodoPago, total]) => ({
                metodoPago,
                total: total.toFixed(2),
            }))

            // Agregar un console.log para verificar el resultado antes de retornarlo
            console.log("Resultado final:", {
                porMetodoPago: resultadoPorMetodoPago,
                totalGeneral: totales.totalGeneral.toFixed(2),
            })

            return {
                porMetodoPago: resultadoPorMetodoPago,
                totalGeneral: totales.totalGeneral.toFixed(2),
            }
        },

        totalRows() {
            return this.ordenesLength
        },
    },

    methods: {
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },

        async getPagos() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/reporte-de-pagos`)
                .then((resp) => {
                    this.pagos = resp.data.pagos

                    // Prevenir recarga de empleados
                    this.vendedores = []
                    this.vendedores = resp.data.vendedores.map((el) => {
                        return {
                            value: el._id,
                            text: el.nombre,
                        }
                    })
                    this.vendedores.unshift({ value: 0, text: "Todos" })

                    this.ordenesLength = this.pagos.length
                    console.log("Pagos y abonos cargados", this.pagos)
                    console.log("Totales", this.totales)
                    this.overlay = false
                })
        },

        onSubmit(event) {
            event.preventDefault()
            const fechaInicio = this.fechaConsultaInicio
            const fechaFin = this.fechaConsultaFin
            console.log("inicio", fechaInicio)
            console.log("fin", fechaFin)

            if (!fechaInicio.length || !fechaFin.length) {
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

        async realizarConsulta() {
            this.overlay = true
            await this.$axios
                .get(
                    `${this.$config.API}/reporte-de-pagos/${this.fechaConsultaInicio}/${this.fechaConsultaFin}/${this.selectedVendedor}`
                )
                .then((resp) => {
                    this.pagos = resp.data.pagos
                    /* this.vendedores = resp.data.vendedores
                    this.vendedores.unshift({ value: 0, text: "Todos" }) */
                    this.vendedores = resp.data.vendedores.map((el) => {
                        return {
                            value: el._id,
                            text: el.nombre,
                        }
                    })
                    this.vendedores.unshift({ value: 0, text: "Todos" })

                    this.ordenesLength = this.pagos.length
                    console.log("Pagos y abonos cargados", this.pagos)
                    console.log("Totales", this.totales)
                    this.overlay = false
                })
        },

        usdConverter(moneda, monto, tasa) {
            // Validación de datos de entrada
            if (!isNaN(monto) && !isNaN(tasa)) {
                let tot

                if (moneda === "Bolívares" || moneda === "Pesos") {
                    tot = parseFloat(monto) / parseFloat(tasa)
                } else {
                    tot = parseFloat(monto)
                }

                // Validación de NaN y división por cero
                if (isNaN(tot)) {
                    return "Error en el cálculo" // O cualquier otro mensaje de error
                } else {
                    return tot.toFixed(2)
                }
            } else {
                return "Monto o tasa no válidos"
            }
        },
    },

    mounted() {
        // this.getOrdenes()
        this.getPagos()
    },
}
</script>
