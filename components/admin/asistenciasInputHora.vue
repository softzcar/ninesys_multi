<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <div class="floatme">
                <b-form-input
                    lang="en"
                    :disabled="disabledControl"
                    v-model="horaEmpleado"
                    type="time"
                    @input="guardarAsistencia"
                ></b-form-input>
            </div>
            <div class="floatme">
                <!-- <h2>{{ myNewMoment }}</h2> -->
                <!-- <b-button
            :disabled="disabledControl"
            variant="light"
            @click="guardarAsistencia"
          >
            <b-icon icon="check-lg"></b-icon>
          </b-button> -->
                <!-- <pre>
        {{ $props }}
      </pre
        > -->
            </div>
        </b-overlay>
    </div>
</template>

<script>
import { DateTime } from "luxon"
import axios from "axios"

export default {
    //   name: 'NinesysAsistenciasInputHora',

    data() {
        return {
            overlay: false,
            disabledControl: true,
            horaEmpleado: null,
        }
    },

    computed: {
        myNewMoment() {
            if (this.horaEmpleado === null) {
                return null
            } else {
                return `${this.fecha} ${this.horaEmpleado}:00`
            }
        },
        generateDataEmp() {
            /* const empleado = this.item.find((item) => item.value === this.selected)

        if (!empleado) {
            return null // Si el ID no existe en el array, retornar null o manejar el error según tu lógica
        } */

            let dataEmp
            // Obtener la fecha y hora actual en la zona horaria "America/Caracas" (Venezuela)
            const now = new Date()
            const options = {
                timeZone: "America/Caracas",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            }

            // Formatear la hora en formato 12 horas con AM/PM en la zona horaria de Venezuela
            const hora = now.toLocaleString("es-VE", options)

            // Formatear la fecha en formato dd/mm/yyyy
            const fecha = `${now.getDate().toString().padStart(2, "0")}/${(
                now.getMonth() + 1
            )
                .toString()
                .padStart(2, "0")}/${now.getFullYear()}`

            // Construir el objeto con los datos formateados
            dataEmp = {
                id: this.item.id_empleado,
                nombre: this.item.nombre,
                timestamp: now.toISOString(), // Fecha en formato ISO8601
                hora,
                fecha,
            }
            /* if (this.item.length) {
      } else {
        dataEmp = {
          id: null,
          nombre: 'No ha seleccionado al empleado',
          timestamp: null, // Fecha en formato ISO8601
          hora: null,
          fecha: null,
        }
      } */

            return dataEmp
        },
    },

    methods: {
        convertToFullDateTime(time) {
            // Obtener la hora actual en Venezuela
            const nowVenezuela = DateTime.now().setZone("America/Caracas")

            const [hours, minutes] = time.split(":") // Separar la hora y los minutos

            // Establecer la hora y los minutos en la fecha actual en Venezuela
            const dateTimeVenezuela = nowVenezuela.set({
                hour: hours,
                minute: minutes,
                second: 0,
            })

            // Formatear la fecha y hora en el formato deseado
            const formattedDateTime = dateTimeVenezuela.toFormat(
                "yyyy-MM-dd HH:mm:ss"
            )

            return formattedDateTime
        },
        getCurrentFormattedDate() {
            const currentDate = DateTime.local() // Obtener la fecha y hora actual
            const formattedDate = currentDate.toFormat("yyyy-MM-dd") // Formatear la fecha
            return formattedDate
        },

        formatTimeTo12Hours(time24) {
            const [hours, minutes] = time24.split(":")
            const dateTime = DateTime.fromObject({
                hour: parseInt(hours),
                minute: parseInt(minutes),
            })
            return dateTime.toFormat("hh:mm a")
        },

        formatTimeTo24Hours(hour) {
            if (typeof hour !== "string") {
                return null
            }

            try {
                // Parse the input time string
                const parsedTime = DateTime.fromFormat(hour, "hh:mm a")

                // Format the parsed time in 24-hour format
                const formattedTime = parsedTime.toFormat("HH:mm")

                return formattedTime
            } catch (error) {
                console.error(
                    "Error parsing or formatting time:",
                    error.message
                )
                return null
            }
        },

        formatTimeToSQLTimestamp(time24) {
            const now = DateTime.now()
            const [hours, minutes] = time24.split(":")

            const timestamp = now.set({
                hour: parseInt(hours),
                minute: parseInt(minutes),
                second: 0,
            })

            const formattedTimestamp = timestamp.toFormat("yyyy-MM-dd HH:mm:ss")
            return formattedTimestamp
        },

        async enviarHora(id_empleado, registro, hora) {
            this.overlay = true
            const data = new URLSearchParams()
            data.set("id_empleado", id_empleado)
            data.set("registro", registro)
            // data.set('moment', this.formatTimeToSQLTimestamp(hora))
            data.set("moment", this.myNewMoment)

            await this.$axios
                .post(`${this.$config.API}/asistencias`, data)
                .then((res) => {
                    this.disabledControl = true
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>No se guardó el registro</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        guardarAsistencia() {
            if (this.horaEmpleado === null) {
                this.$fire({
                    title: "Ingrese la haora completa",
                    html: ``,
                    type: "info",
                })
            } else {
                const timestamp = this.convertToFullDateTime(this.horaEmpleado) // esto lo vamos a enviar al servidor para guardar;lo en el campo `moment`
                this.$confirm(
                    `¿Registrar a ${
                        this.generateDataEmp.nombre
                    } a las ${this.formatTimeTo12Hours(this.horaEmpleado)}`,
                    "Guardar Asistencia",
                    "question"
                )
                    .then(() => {
                        this.enviarHora(
                            this.item.id_empleado,
                            this.tipo,
                            this.horaEmpleado
                        )
                        /* alert(
              'enviar datos al servidor, si todo OKOK reiniciar todo para procesar u nuevo registro'
            ) */
                    })
                    .catch(() => {
                        this.horaEmpleado = null
                        return false
                    })
            }
        },
    },

    mounted() {
        // this.horaEmpleado = this.item.hora
        this.horaEmpleado = this.formatTimeTo24Hours(this.item[this.tipo][0])
        if (this.horaEmpleado === null) {
            this.disabledControl = false
        }
    },

    props: ["item", "tipo", "fecha"],
}
</script>
