<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <b-modal
        :id="modal"
        title="Asistencia"
        hide-footer
        size="sm"
      >
        <!-- <buscar-resultadoModal :id="id" /> -->
        <p>
          <b-list-group class="text-center">
            <b-list-group-item :variant="listVariant">
              <strong>{{ generateDataEmp.nombre }}</strong>
            </b-list-group-item>
            <b-list-group-item>
              Hora actual
              <strong> {{ generateDataEmp.hora }} </strong>
            </b-list-group-item>
          </b-list-group>
        </p>
        <!-- <p class="text-center">Ingrese la hora ({{ horaEmpleado }})</p> -->
        <p>
          <b-form-timepicker
            v-model="horaEmpleado"
            locale="en"
            :disabled="disableControl"
            ampm="true"
          ></b-form-timepicker>
          <!-- <b-form-input
            v-model="horaEmpleado"
            :disabled="disableControl"
            type="time"
            lang="en"
          ></b-form-input> -->
        </p>
        <!-- <p class="text-center">Ingrese la fecha ({{ fechaEmpleado }})</p> -->
        <p>
          <b-form-datepicker
            :disabled="disableControl"
            v-model="fechaEmpleado"
          ></b-form-datepicker>
          <!-- <b-form-input
            v-model="fechaEmpleado"
            :disabled="disableControl"
            type="date"
          ></b-form-input> -->
        </p>
        <p class="text-center">
          <b-button
            :disabled="disableControl"
            @click="guardarAsistencia"
            variant="success"
          >
            Guardar Asistencia
          </b-button>
        </p>
      </b-modal>
      <b-container>
        <b-row>
          <b-col
            lg="6"
            sm="12"
            md="4"
            class="mb-4"
          >
            <span class="floatme">
              <b-form-select
                v-model="selected"
                :options="empleados"
              ></b-form-select>
            </span>
            <span class="floatme">
              <b-button
                @click="$bvModal.show(modal)"
                variant="success"
              >
                Guardar Asistencia
              </b-button>
              <!-- <b-button @click="guardarAsistencia()" variant="success"
                >Guardar Asistencia</b-button
              > -->
            </span>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <!-- <b-table striped :items="productsOrdered" :fields="fields">
              <template #cell(attributes)="data">
                <admin-ComisionesProductosInputGeneral
                  :idprod="data.item.cod"
                  :attributes="data.item.attributes"
                  :categories="data.item.categories"
                />
              </template>
            </b-table> -->
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>
  </div>
</template>

<script>
import axios from "axios";
import { DateTime } from "luxon";

export default {
  name: "NinesysAsistenciasRegistro",

  data() {
    return {
      overlay: true,
      horaEmpleado: null,
      fechaEmpleado: this.getCurrentFormattedDate(),
      disableControl: true,
      listVariant: "danger",
      selected: null,
      empleados: [],
      options: [
        { value: null, text: "Please select an option" },
        { value: "a", text: "This is First option" },
        { value: "b", text: "Selected Option" },
        {
          value: { C: "3PO" },
          text: "This is an option with object value",
        },
        { value: "d", text: "This one is disabled", disabled: true },
      ],
      fields: [
        {
          key: "empleado",
          label: "Empleado",
        },
        {
          key: "actividad",
          label: "Actividad",
        },
      ],
    };
  },

  watch: {
    selected(val) {
      if (val === null) {
        this.disableControl = true;
        this.listVariant = "danger";
      } else {
        this.disableControl = false;
        this.listVariant = "success";
      }
    },
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    generateDataEmp() {
      let dataEmp;
      if (this.empleados.length) {
        const empleado = this.empleados.find(
          (item) => item.value === this.selected
        );

        if (!empleado) {
          return null; // Si el ID no existe en el array, retornar null o manejar el error según tu lógica
        }

        // Obtener la fecha y hora actual en la zona horaria "America/Caracas" (Venezuela)
        const now = new Date();
        const options = {
          timeZone: "America/Caracas",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        };

        // Formatear la hora en formato 12 horas con AM/PM en la zona horaria de Venezuela
        const hora = now.toLocaleString("es-VE", options);

        // Formatear la fecha en formato dd/mm/yyyy
        const fecha = `${now.getDate().toString().padStart(2, "0")}/${(
          now.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${now.getFullYear()}`;

        // Construir el objeto con los datos formateados
        dataEmp = {
          id: empleado.value,
          nombre: empleado.text,
          timestamp: now.toISOString(), // Fecha en formato ISO8601
          hora,
          fecha,
        };
      } else {
        dataEmp = {
          id: null,
          nombre: "No ha seleccionado al empleado",
          timestamp: null, // Fecha en formato ISO8601
          hora: null,
          fecha: null,
        };
      }

      return dataEmp;
    },
  },

  methods: {
    getCurrentFormattedDate() {
      const currentDate = DateTime.local(); // Obtener la fecha y hora actual
      const formattedDate = currentDate.toFormat("yyyy-MM-dd"); // Formatear la fecha
      return formattedDate;
    },

    formatTimeTo12Hours(time24) {
      const [hours, minutes] = time24.split(":");
      const dateTime = DateTime.fromObject({
        hour: parseInt(hours),
        minute: parseInt(minutes),
      });
      return dateTime.toFormat("hh:mm a");
    },

    guardarAsistencia() {
      if (this.horaEmpleado === null) {
        this.$fire({
          title: "Ingrese la haora completa",
          html: ``,
          type: "info",
        });
      } else {
        const timestamp = this.convertToFullDateTime(this.horaEmpleado); // esto lo vamos a enviar al servidor para guardar;lo en el campo `moment`
        this.$confirm(
          `¿Registrar a ${
            this.generateDataEmp.nombre
          } a las ${this.formatTimeTo12Hours(this.horaEmpleado)}`,
          "Guardar Asistencia",
          "question"
        )
          .then(() => {
            alert(
              "enviar datos al servidor, si todo OKOK reiniciar todo para procesar u nuevo registro"
            );
          })
          .catch(() => {
            return false;
          });
      }
    },

    convertToFullDateTime(time) {
      // Obtener la hora actual en Venezuela
      const nowVenezuela = DateTime.now().setZone("America/Caracas");

      const [hours, minutes] = time.split(":"); // Separar la hora y los minutos

      // Establecer la hora y los minutos en la fecha actual en Venezuela
      const dateTimeVenezuela = nowVenezuela.set({
        hour: hours,
        minute: minutes,
        second: 0,
      });

      // Formatear la fecha y hora en el formato deseado
      const formattedDateTime = dateTimeVenezuela.toFormat(
        "yyyy-MM-dd HH:mm:ss"
      );

      return formattedDateTime;
    },

    /* convertToFullDateTime(time) {
      const now = new Date() // Fecha y hora actual
      const [hours, minutes] = time.split(':') // Separar la hora y los minutos

      // Establecer la hora y los minutos en la fecha actual
      now.setHours(hours)
      now.setMinutes(minutes)
      now.setSeconds(0) // Establecer los segundos a cero

      // Formatear la fecha y hora en el formato deseado
      const formattedDateTime = now
        .toISOString()
        .replace('T', ' ')
        .substr(0, 19)

      return formattedDateTime
    }, */

    async getEmpleados() {
      await this.$axios.get(`${this.$config.API}/empleados`).then((resp) => {
        // this.empleados = resp.data
        this.empleados = resp.data.items.map((el) => {
          return { value: el._id, text: el.nombre };
        });
        this.empleados.unshift({
          value: null,
          text: "Seleccione un empleado",
        });
        this.overlay = false;
      });
    },

    guardarAsistencia_fire() {
      if (this.selected === null) {
        this.$fire({
          title: "Por favor seleccione un empelado",
          html: "<p></p>",
          type: "info",
        });
      } else {
        console.log("myEmp", myEmp);
        this.$confirm(
          "",
          `¿Desea guardar el registro para ${generateDataEmp.nombre} a las ${generateDataEmp.hora}?`,
          "question"
        )
          .then(() => {
            this.overlay = true;
            // this.enviarEstatus('Aprobado').then(() => (this.overlay = false))
            alert("enviamos los datos para el empleado id " + this.selected);
          })
          .catch(() => {
            return false;
          })
          .finally(() => (this.overlay = false));
      }
    },
  },

  mounted() {
    this.getEmpleados().then(() => (this.overlay = false));
  },
};
</script>
