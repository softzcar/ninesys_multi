<template>
    <div>
        <b-container>
            <div v-for="employee in processedData" :key="employee.nombre">
                <b-row>
                    <b-col>
                        <h3 style="text-transform: capitalize">
                            <!-- <pre>
                    {{ employee }}
                </pre
              > -->
                            {{ employee.nombre }}
                            <!-- <small>Horas Trabajadas: {{ employee.horasTrabajadas }}</small> -->
                            <small>
                                <strong
                                    >{{
                                        sumarHoras(totalHoras(employee.nombre))
                                    }}
                                    Horas</strong
                                >
                                <!-- <pre>{{ totalHoras(employee.nombre) }}</pre> -->
                            </small>
                        </h3>
                        <!-- <pre>Horas Trabajadas: {{ totalHoras(employee.nombre) }}</pre> -->
                        <!-- <pre>
                items: {{ items }}
            </pre> -->
                    </b-col>
                </b-row>

                <b-row class="mb-4">
                    <b-col class="col-calendario">
                        <p class="text-center">
                            <strong
                                >LUNES<br />
                                {{ employee.dias.L.fecha }}</strong
                            >
                        </p>
                        <!-- <pre>
                filterDia('L', employee.nombre) ::: {{
                filterDia('L', employee.nombre)
              }}</pre
            > -->
                        <div
                            class="text-center"
                            v-for="emp in filterDia('L', employee.nombre)"
                        >
                            {{ formatRegistro(emp.registro) }}:
                            {{ convertHour(emp.hora) }}
                        </div>
                    </b-col>

                    <b-col>
                        <p class="text-center">
                            <strong
                                >MARTES <br />
                                {{ employee.dias.M.fecha }}</strong
                            >
                        </p>
                        <div
                            class="text-center"
                            v-for="emp in filterDia('M', employee.nombre)"
                        >
                            {{ formatRegistro(emp.registro) }}:
                            {{ convertHour(emp.hora) }}
                        </div>
                    </b-col>

                    <b-col>
                        <p class="text-center">
                            <strong
                                >MIERCOLES <br />
                                {{ employee.dias.X.fecha }}</strong
                            >
                        </p>
                        <div
                            class="text-center"
                            v-for="emp in filterDia('X', employee.nombre)"
                        >
                            {{ formatRegistro(emp.registro) }}:
                            {{ convertHour(emp.hora) }}
                        </div>
                    </b-col>

                    <b-col>
                        <p class="text-center">
                            <strong
                                >JUEVES <br />
                                {{ employee.dias.J.fecha }}</strong
                            >
                        </p>
                        <div
                            class="text-center"
                            v-for="emp in filterDia('J', employee.nombre)"
                        >
                            {{ formatRegistro(emp.registro) }}:
                            {{ convertHour(emp.hora) }}
                        </div>
                    </b-col>

                    <b-col>
                        <p class="text-center">
                            <strong
                                >VIERNES <br />
                                {{ employee.dias.V.fecha }}</strong
                            >
                        </p>
                        <div
                            class="text-center"
                            v-for="emp in filterDia('V', employee.nombre)"
                        >
                            {{ formatRegistro(emp.registro) }}:
                            {{ convertHour(emp.hora) }}
                        </div>
                    </b-col>

                    <b-col>
                        <p class="text-center">
                            <strong
                                >SABADO <br />
                                {{ employee.dias.S.fecha }}</strong
                            >
                        </p>
                        <div
                            class="text-center"
                            v-for="emp in filterDia('S', employee.nombre)"
                        >
                            {{ formatRegistro(emp.registro) }}:
                            {{ convertHour(emp.hora) }}
                        </div>
                    </b-col>
                </b-row>
                <hr class="mb-4" />
            </div>
        </b-container>
        <!-- <pre>
            items: {{ items }}
        </pre
    > -->
    </div>
</template>

<script>
import axios from "axios"
import { groupEnd } from "console"
export default {
    data() {
        return {
            totalHorasEmpleados: [],
            overlay: true,
            items: [], // Tu array de datos aquí
            myFields: [
                {
                    key: "dia",
                    label: "Dia",
                },
                {
                    key: "hora",
                    label: "Hora",
                },
                {
                    key: "registro",
                    label: "Registro",
                },
            ],
        }
    },

    computed: {
        misDias() {
            return this.processedData[0].dias
        },

        processedData() {
            const employeesData = {}

            this.items.forEach((item) => {
                if (!employeesData[item.empleado]) {
                    employeesData[item.empleado] = {
                        nombre: item.empleado,
                        horasTrabajadas: 0,
                        fecha: item.fecha,
                        dias: {
                            L: { hora: "Ausente", registro: "" },
                            M: { hora: "Ausente", registro: "" },
                            X: { hora: "Ausente", registro: "" },
                            J: { hora: "Ausente", registro: "" },
                            V: { hora: "Ausente", registro: "" },
                            S: { hora: "Ausente", registro: "" },
                            D: { hora: "Ausente", registro: "" },
                        },
                    }
                }

                employeesData[item.empleado].horasTrabajadas += parseFloat(
                    item.hora.split(":")[0]
                )

                if (item.dia in employeesData[item.empleado].dias) {
                    employeesData[item.empleado].dias[item.dia] = {
                        hora: item.hora,
                        registro: item.registro,
                        fecha: item.fecha,
                    }
                }
            })

            return Object.values(employeesData)
        },

        tableFields() {
            const dayLabels = {
                L: "Lunes",
                M: "Martes",
                X: "Miércoles",
                J: "Jueves",
                V: "Viernes",
                S: "Sábado",
                D: "Domingo",
            }

            const fields = Object.keys(dayLabels).map((day) => ({
                key: `dias.${day}`,
                label: dayLabels[day],
            }))

            return fields
        },
    },

    methods: {
        formatRegistro(reg) {
            const txt = reg.split(" ")
            return txt[0] + ":"
        },
        convertHour(time24) {
            const [hours, minutes] = time24.split(":")
            let formattedHours = parseInt(hours, 10)
            let period = "AM"

            if (formattedHours >= 12) {
                period = "PM"
                if (formattedHours > 12) {
                    formattedHours -= 12
                }
            }

            return `${formattedHours}:${minutes} ${period}`
        },
        filterDia(dia, empleado) {
            return this.items
                .filter((el) => el.dia === dia && el.empleado === empleado)
                .map((el) => {
                    return {
                        hora: el.hora,
                        registro: el.registro,
                        fecha: el.fecha,
                    }
                })
        },

        totalH(data) {
            return data
                .filter((el) => el.dia != "Ausente")
                .map((el) => {
                    return {
                        hora: el.hora,
                        registro: el.registro,
                        fecha: el.fecha,
                    }
                })
        },

        transformDias(dias) {
            return Object.keys(dias).map((dia) => {
                const { hora, registro } = dias[dia]
                return {
                    dia,
                    hora,
                    registro,
                }
            })
        },

        async getAsistencias() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/asistencias/semanal`)
                .then((res) => {
                    this.items = res.data.data_semana
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<P>No se recibió la información de las asistencias</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        calculateHoursDifference(start, end) {
            const startTime = new Date(`2000-01-01 ${start}`)
            const endTime = new Date(`2000-01-01 ${end}`)
            const timeDifference = endTime - startTime

            return ((timeDifference / (1000 * 60 * 60)) * -1).toFixed(1) // Convertir de milisegundos a horas
        },
        compararFechas_old(fechaComparar) {
            const fechaActual = new Date()
            const fecha = new Date(fechaComparar)

            // Convierte ambas fechas a marcas de tiempo (timestamps) en milisegundos
            const marcaTiempoActual = fechaActual.getTime()
            const marcaTiempoComparar = fecha.getTime()

            // Compara las marcas de tiempo
            return (
                fecha.getDate() === fechaActual.getDate() &&
                fecha.getMonth() === fechaActual.getMonth() &&
                fecha.getFullYear() === fechaActual.getFullYear()
            )
        },
        compararFechas(cadenaFecha) {
            const partesFecha = cadenaFecha.split("/")
            const fecha = new Date(
                partesFecha[2],
                partesFecha[1] - 1,
                partesFecha[0]
            )
            const fechaActual = new Date()
            const dia = fechaActual.getDate().toString().padStart(2, "0") // Agrega un 0 al principio si es necesario
            const mes = (fechaActual.getMonth() + 1).toString().padStart(2, "0") // El mes comienza desde 0
            const año = fechaActual.getFullYear()
            const miFecha = `${dia}/${mes}/${año}`

            console.log(`$fechaSysy ${cadenaFecha} = ${miFecha}`)
            if (cadenaFecha === miFecha) {
                console.log("La fecha es hoy")

                return true
            } else {
                console.log("La fecha NOOO es hoy")
                return false
            }
        },
        obtenerHoraActual() {
            const fecha = new Date()
            const horas = fecha.getHours().toString().padStart(2, "0") // Agrega un 0 al principio si es necesario
            const minutos = fecha.getMinutes().toString().padStart(2, "0") // Agrega un 0 al principio si es necesario

            return `${horas}:${minutos}`
        },

        sumarHoras(arr) {
            let suma = 0

            for (let i = 0; i < arr.length; i++) {
                if (typeof arr[i] === "number") {
                    suma += arr[i]
                }
            }

            return suma.toFixed(1)
        },

        totalHoras(emp) {
            let semana = []
            let tmpDia = null
            const dataEmpleado = this.items.filter((el) => el.empleado === emp)
            const dias = ["L", "M", "X", "J", "V", "S"]

            dias.forEach((dia) => {
                tmpDia = dataEmpleado
                    .filter((elem) => elem.dia === dia)
                    .filter((el) => Object.keys(el).length > 0)
                    .map((el, index, arr) => {
                        let horaEntradaManana = null
                        let horaSalidaManana = null
                        let horasManana = null
                        let horaEntradaTarde = null
                        let horaSalidaTarde = null
                        let horasTarde = null
                        let tot = {}

                        if (el.registro === "Entrada mañana") {
                            horaEntradaManana = el.hora
                            // Buscar salida mañana y hacer el calculo para las horas trabajadas en la mañana
                            const respManana = arr.find(
                                (asistencia) =>
                                    asistencia.registro === "Salida mañana" &&
                                    asistencia.empleado === el.empleado &&
                                    asistencia.fecha === el.fecha
                            )

                            if (
                                respManana === undefined ||
                                respManana === null
                            ) {
                                // no tiene registro de salida
                                const esHoy = this.compararFechas(el.fecha)
                                if (esHoy) {
                                    horaSalidaManana = this.obtenerHoraActual()
                                    const tmpSplit = horaSalidaManana.split(":")
                                    horaSalidaManana =
                                        parseInt(tmpSplit[0]) -
                                        1 +
                                        ":" +
                                        tmpSplit[1]
                                } else {
                                    horaSalidaManana = "12:00"
                                }
                            } else {
                                const esHoy = this.compararFechas(el.fecha)
                                console.log(`esHoy: ${esHoy}`)

                                if (esHoy) {
                                    const esHoy = this.compararFechas(el.fecha)
                                    if (esHoy) {
                                        horaSalidaManana =
                                            this.obtenerHoraActual()
                                    } else {
                                        horaSalidaManana =
                                            this.obtenerHoraActual()
                                    }
                                } else {
                                    horaSalidaManana = respManana.hora
                                }
                            }
                            horasManana = this.calculateHoursDifference(
                                horaSalidaManana,
                                horaEntradaManana
                            )

                            // horaEntradaTarde = el.hora
                            horaEntradaTarde = arr
                                .filter(
                                    (asistencia) =>
                                        asistencia.registro ===
                                            "Entrada tarde" &&
                                        asistencia.empleado === el.empleado &&
                                        asistencia.fecha === el.fecha
                                )
                                .map((el) => {
                                    return el.hora
                                })

                            if (horaEntradaTarde.length > 0) {
                                const respTarde = arr.find(
                                    (asistencia) =>
                                        asistencia.registro ===
                                            "Salida tarde" &&
                                        asistencia.empleado === el.empleado &&
                                        asistencia.fecha === el.fecha
                                )

                                if (
                                    respTarde === undefined ||
                                    respTarde === null
                                ) {
                                    horaSalidaTarde = "17:00"
                                } else {
                                    // no tiene registro de salida
                                    const esHoy = this.compararFechas(el.fecha)
                                    console.log(`esHoy: ${esHoy}`)

                                    if (esHoy) {
                                        horaSalidaTarde =
                                            this.obtenerHoraActual()
                                    } else {
                                        horaSalidaTarde = respTarde.hora
                                        // horaSalidaTarde = el.hora
                                    }
                                }
                                horasTarde = this.calculateHoursDifference(
                                    horaSalidaTarde,
                                    horaEntradaTarde
                                )
                            } else {
                                horasTarde = 0
                            }
                            // Sumar horas
                            tot =
                                parseFloat(horasManana) + parseFloat(horasTarde)
                            /* console.log(
                `${el.empleado} ${el.dia} (${horasManana} + ${horasTarde} = ${tot}`
              )
              console.log(
                `entrada M: ${horaEntradaManana} salida M: ${horaSalidaManana}`
              )
              console.log(
                `entrada T: ${horaEntradaTarde} salida T: ${horaSalidaTarde}`
              )
              console.log(` - `) */
                        } else if (el.registro === "Entrada tarde") {
                            horaEntradaTarde = el.hora
                            // Veriifcar si existe un registro para la mañana si no `horasManana = 0`
                            const respManana = arr.find(
                                (asistencia) =>
                                    asistencia.registro === "Entrada mañana" &&
                                    asistencia.empleado === el.empleado &&
                                    asistencia.fecha === el.fecha
                            )

                            if (
                                respManana === undefined ||
                                respManana === null
                            ) {
                                // buscar horas en la tarde
                                // ************************
                                // Buscar salida tarde y hacer el calculo para las horas trabajadas en la mañana
                                const respTarde = arr.find(
                                    (asistencia) =>
                                        asistencia.registro ===
                                            "Salida tarde" &&
                                        asistencia.empleado === el.empleado &&
                                        asistencia.fecha === el.fecha
                                )

                                if (
                                    respTarde === undefined ||
                                    respTarde === null
                                ) {
                                    horaSalidaTarde = "17:00"
                                } else {
                                    // no tiene registro de salida
                                    const esHoy = this.compararFechas(el.fecha)
                                    if (esHoy) {
                                        horaSalidaTarde =
                                            this.obtenerHoraActual()
                                    } else {
                                        horaSalidaTarde = respTarde.hora
                                    }
                                }
                                horasTarde = this.calculateHoursDifference(
                                    horaSalidaTarde,
                                    horaEntradaTarde
                                )
                                tot = parseFloat(horasTarde)
                            }

                            // BUSCAR HORAS DE LA TARDE
                        }
                        if (
                            el.registro === "Entrada mañana" ||
                            el.registro === "Entrada tarde"
                        ) {
                            if (!tot) {
                                return null
                            } else {
                                return tot
                            }
                        } else {
                        }
                    })
                    .filter((el) => el != null)

                semana.push(tmpDia[0])
            })
            return semana
        },
    },

    mounted() {
        this.getAsistencias()
    },
}
</script>

<style scoped>
.col-calendario {
    border: solid 1 px grey !important;
}
</style>
