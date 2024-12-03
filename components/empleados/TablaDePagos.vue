<template>
    <div>
        <!-- <h1 class="mb-4">{{ this.$store.state.login.dataUser.departamento }}</h1> -->
        <b-overlay :show="overlay" spinner-small>
            <pre>
        totalPendiente {{ totalPendiente }}
        <hr>
       ordenses_semana: {{ ordenesSemana }}
      </pre>
            <b-list-group class="mb-4">
                <b-list-group-item>
                    <h3 v-if="departamento != 'Comercialización'">
                        RELACIÓN DE PAGOS
                    </h3>
                    <!-- <pre>{{ ordenes }}</pre> -->
                </b-list-group-item>
                <b-list-group-item variant="info"
                    ><h3>{{ horasTrabajadas }} HORAS</h3>
                </b-list-group-item>
                <b-list-group-item variant="success"
                    ><strong>TERMINADO</strong> $
                    {{ totalTerminado }}</b-list-group-item
                >
                <b-list-group-item variant="danger"
                    ><strong>PENDIENTE</strong> $
                    {{ totalPendiente }}</b-list-group-item
                >
                <b-list-group-item variant="primary"
                    ><strong>TOTAL</strong> $ {{ total }}</b-list-group-item
                >
            </b-list-group>
            <div class="mt-4">
                <!-- <pre>
         {{ this.departamento }} ::: {{ fields }}
        </pre> -->
                <b-tabs>
                    <b-tab
                        v-if="departamento != 'Comercialización'"
                        title="PENDIENTES"
                        active
                    >
                        <b-table-lite
                            bordered
                            responsive
                            small
                            striped
                            :items="trabajosPendientes()"
                            :fields="fields.pendientes"
                        >
                            <template #cell(id_orden)="data">
                                <linkSearch :id="data.item.id_orden" />
                            </template>
                            <template #cell(cantidad)="data">
                                <!-- {{ data.item.unidades_solicitadas }} -->
                                {{ data.item.cantidad }}
                            </template>
                            <template #cell(calculo_pago)="data">
                                ${{
                                    parseFloat(data.item.calculo_pago).toFixed(
                                        2
                                    )
                                }}
                            </template>
                        </b-table-lite>
                    </b-tab>

                    <b-tab title="TERMINADOS">
                        <b-table-lite
                            bordered
                            responsive
                            small
                            striped
                            hover
                            :items="trabajosTerminados()"
                            :fields="fields.terminadas"
                        >
                            <template #cell(id_orden)="data">
                                <linkSearch :id="data.item.id_orden" />
                            </template>
                            <template #cell(calculo_pago)="data">
                                ${{ data.item.monto_pago }}
                            </template>
                            <template #cell(producto)="data">
                                <span style="text-transform: capitalize">
                                    {{ data.item.producto }}
                                </span>
                            </template>
                        </b-table-lite>
                    </b-tab>
                </b-tabs>
            </div>
        </b-overlay>
    </div>
</template>

<script>
import axios from "axios"

export default {
    data() {
        return {
            overlay: true,
            ordenes: [],
            ordenesSemana: [],
            departamento: this.$store.state.login.dataUser.departamento,
        }
    },

    computed: {
        horasTrabajadas() {
            let totalHoras = 0

            if (
                this.$store.state.login.dataUser.departamento !=
                    "Comercialización" ||
                this.$store.state.login.dataUser.departamento !=
                    "Administración"
            ) {
                const horasFiltradas = this.ordenesSemana.filter(
                    (el) => el.tiempo_transcurrido != null
                )
                for (const orden of horasFiltradas) {
                    const fechaInicio = new Date(orden.fecha_inicio_ts)
                    const fechaTerminado = new Date(orden.fecha_terminado_ts)

                    let horasTranscurridas =
                        (fechaTerminado - fechaInicio) / 1000 / 3600 // Diferencia en horas
                    console.group("horas")
                    console.log(
                        `fechaTerminado`,
                        orden.fecha_inicio_ts,
                        fechaTerminado
                    )
                    console.log(
                        `fechaInicio`,
                        orden.fecha_terminado_ts,
                        fechaInicio
                    )
                    console.log(`horasTranscurridas`, horasTranscurridas)
                    console.groupEnd()

                    // Verifica si las fechas son diferentes y calcula las horas según el día de la semana
                    if (
                        fechaInicio.toDateString() !==
                        fechaTerminado.toDateString()
                    ) {
                        // Si la fecha de inicio es un sábado o domingo, resta 24 horas
                        if (
                            fechaInicio.getDay() === 0 ||
                            fechaInicio.getDay() === 6
                        ) {
                            horasTranscurridas -= 24
                        } else {
                            // De lo contrario, resta 16 horas por día de diferencia
                            const diasDiferencia =
                                (fechaTerminado - fechaInicio) /
                                (24 * 3600 * 1000)
                            horasTranscurridas -= 16 * diasDiferencia
                        }
                    }

                    // Agrega las horas calculadas al total
                    totalHoras += horasTranscurridas
                }
            }
            // return horasFiltradas
            return totalHoras.toFixed(2) // Devuelve el total de horas redondeado a 2 decimales
        },

        fields() {
            let fields = {}
            if (this.departamento === "Comercialización") {
                fields.pendientes = [
                    {
                        key: "id_orden",
                        label: "ORD",
                        class: "text-center",
                    },
                    {
                        key: "fecha_de_pago",
                        label: "FECHA",
                        class: "text-center",
                    },
                    {
                        key: "tipo_de_pago",
                        label: "TIPO",
                        class: "text-center",
                    },
                    {
                        key: "calculo_pago",
                        label: "COMISIÓN",
                        class: "text-center",
                    },
                ]
                fields.terminadas = [
                    {
                        key: "id_orden",
                        label: "ORD",
                        class: "text-center",
                    },
                    {
                        key: "fecha_de_pago",
                        label: "FECHA",
                        class: "text-center",
                    },
                    {
                        key: "tipo_de_pago",
                        label: "TIPO",
                        class: "text-center",
                    },
                    {
                        key: "calculo_pago",
                        label: "COMISIÓN",
                        class: "text-center",
                    },
                ]
            } else if (this.departamento === "Diseño") {
                fields.pendientes = [
                    {
                        key: "id_orden",
                        label: "ORD",
                        class: "text-center",
                    },
                    {
                        key: "cantidad",
                        label: "CANTIDAD",
                        class: "text-center",
                    },
                    {
                        key: "producto",
                        label: "PRODUCTO",
                        class: "text-center",
                    },
                    {
                        key: "calculo_pago",
                        label: "COMISIÓN",
                        class: "text-center",
                    },
                ]
                fields.terminadas = [
                    {
                        key: "id_orden",
                        label: "ORD",
                        class: "text-center",
                    },
                    {
                        key: "cantidad",
                        label: "CANTIDAD",
                        class: "text-center",
                    },
                    {
                        key: "producto",
                        label: "PRODUCTO",
                        class: "text-center",
                    },
                    {
                        key: "calculo_pago",
                        label: "COMISIÓN",
                        class: "text-center",
                    },
                ]
            } else {
                fields.pendientes = [
                    {
                        key: "id_orden",
                        label: "ORD",
                        class: "text-center",
                    },
                    {
                        key: "cantidad",
                        label: "UND",
                        class: "text-center",
                    },
                    {
                        key: "producto",
                        label: "PROD",
                    },
                    /* {
            key: 'hora_inicio',
            label: 'INICIO',
          },
          {
            key: 'hora_terminado',
            label: 'FIN',
          },
          {
            key: 'hora_terminado',
            label: 'FIN',
          },
          {
            key: 'tiempo_transcurrido',
            label: 'TIEMPO',
          },*/
                    {
                        key: "calculo_pago",
                        label: "$",
                        class: "text-right",
                        thClass: "text-center",
                        tdClass: "pr-4",
                    },
                ]
                fields.terminadas = [
                    {
                        key: "id_orden",
                        label: "ORD",
                        class: "text-center",
                    },
                    {
                        key: "cantidad",
                        label: "UND",
                        class: "text-center",
                    },
                    {
                        key: "producto",
                        label: "PROD",
                    },
                    {
                        key: "hora_inicio",
                        label: "INICIO",
                    },
                    {
                        key: "hora_terminado",
                        label: "FIN",
                    },
                    {
                        key: "hora_terminado",
                        label: "FIN",
                    },
                    {
                        key: "tiempo_transcurrido",
                        label: "TIEMPO",
                    },
                    {
                        key: "calculo_pago",
                        label: "$",
                        class: "text-right",
                        thClass: "text-center",
                        tdClass: "pr-4",
                    },
                ]
            }

            return fields
        },
        totalTerminado() {
            let comision = 0
            if (this.departamento === "Diseño") {
                comision = this.ordenesSemana.reduce((total, orden) => {
                    if (orden.estatus === "Aprobado") {
                        total += parseFloat(orden.calculo_pago)
                    }
                    return total
                }, 0)
            } else if (
                this.departamento === "Comercialización" ||
                this.departamento === "Administración"
            ) {
                comision = this.ordenesSemana.reduce((total, orden) => {
                    total += parseFloat(orden.calculo_pago)
                    return total
                }, 0)
            } else {
                comision = this.ordenesSemana.reduce((total, orden) => {
                    if (orden.fecha_terminado !== null) {
                        total += parseFloat(orden.calculo_pago)
                    }
                    return total
                }, 0)
            }

            return comision.toFixed(2)
        },

        diferencia() {
            return this.totalTerminado - this.totalPendiente
        },

        totalPendiente() {
            let comision = 0
            if (this.departamento === "Diseño") {
                comision = this.ordenesSemana.reduce((total, orden) => {
                    if (orden.estatus === "Esperando Respuesta") {
                        total += parseFloat(orden.calculo_pago)
                    }
                    return total
                }, 0)
            } else if (
                this.departamento === "Comercialización" ||
                this.departamento === "Administración"
            ) {
                comision = 0
            } else {
                const ordenesCalcular = this.ordenesSemana.filter(
                    (el) =>
                        el.progreso != "terminada" && parseInt(el.cantidad) > 0
                )
                console.log("ordenesCalcular", ordenesCalcular)
                comision = ordenesCalcular.reduce((total, orden) => {
                    total += parseFloat(orden.calculo_pago)
                    return total
                }, 0)
            }

            return comision.toFixed(2)
        },
        total() {
            const tot =
                parseFloat(this.totalPendiente) +
                parseFloat(this.totalTerminado)
            return tot.toFixed(2)
        },
    },

    methods: {
        trabajosTerminados() {
            if (this.departamento === "Diseño") {
                return this.ordenesSemana.filter(
                    (el) => el.estatus === "Aprobado"
                )
            } else if (
                this.departamento === "Comercialización" ||
                this.departamento === "Administración"
            ) {
                // return this.ordenesSemana.filter((el) => el.progreso === 'terminada')
                return this.ordenesSemana
            } else {
                // return this.ordenesSemana
                return this.ordenesSemana
                    .filter(
                        (el) =>
                            el.progreso === "terminada" &&
                            parseInt(el.cantidad) > 0
                    )
                    .map((obj) => ({
                        ...obj,
                        calculo_pago: obj.nomto_pago,
                    }))
            }
        },
        trabajosPendientes() {
            if (this.departamento === "Diseño") {
                return this.ordenesSemana.filter(
                    (el) => el.estatus === "Esperando Respuesta"
                )
            } else {
                return this.ordenesSemana.filter(
                    (el) =>
                        el.progreso != "terminada" && parseInt(el.cantidad) > 0
                )
            }
        },

        async getOrdenesAsignadas() {
            await this.$axios
                .get(
                    `${this.$config.API}/reportes/resumen/empleados/${this.emp}`
                )
                .then((resp) => {
                    this.ordenes = resp.data.ordenes
                    this.ordenesSemana = resp.data.ordenes_semana
                    this.overlay = false
                })
        },
    },

    mounted() {
        this.getOrdenesAsignadas()
    },

    props: ["emp"],
}
</script>
