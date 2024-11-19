<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div
        v-if="
          dataUser.departamento === 'Administración' ||
          dataUser.departamento === 'Producción'
        "
      >
        <b-overlay :show="overlay" spinner-small>
          <b-container
            v-if="
              dataUser.departamento === 'Administración' ||
              dataUser.departamento === 'Comercialización' ||
              dataUser.departamento === 'Producción'
            "
          >
            <b-row>
              <b-col>
                <h2 class="mb-4">{{ titulo }}</h2>
              </b-col>
            </b-row>
            <b-row class="text-right mb-4">
              <b-col xl="3" lg="3" sm="12" md="6" align-self="end">
                <b-form @submit="onSubmit">
                  <b-form-group
                    id="input-group"
                    label="Fecha inicio:"
                    label-for="fecha"
                  >
                    <b-form-datepicker
                      id="fecha"
                      v-model="fecha"
                      :max="minDate"
                      class="mb-2"
                      @input="onSubmit"
                    ></b-form-datepicker>
                    <!-- <h1>{{ fecha }}</h1> -->
                    <!-- <b-form-datepicker
                      id="fecha"
                      v-model="fecha"
                      :max="minDate"
                      class="mb-2"                      
                    ></b-form-datepicker> -->
                  </b-form-group>

                  <!-- <b-button type="submit" variant="primary"
                    >Buscar Asistencias</b-button
                  > -->
                </b-form>
              </b-col></b-row
            >
            <b-row>
              <b-col>
                <b-table
                  striped
                  responsive
                  :fields="fields"
                  :items="dataAsistencias"
                >
                  <template #cell(entrada_manana)="data">
                    <admin-asistenciasInputHora
                      tipo="entrada_manana"
                      :item="data.item"
                      :fecha="fecha"
                    />
                  </template>

                  <template #cell(salida_manana)="data">
                    <admin-asistenciasInputHora
                      tipo="salida_manana"
                      :item="data.item"
                      :fecha="fecha"
                    />
                  </template>

                  <template #cell(entrada_tarde)="data">
                    <admin-asistenciasInputHora
                      tipo="entrada_tarde"
                      :item="data.item"
                      :fecha="fecha"
                    />
                  </template>

                  <template #cell(salida_tarde)="data">
                    <admin-asistenciasInputHora
                      tipo="salida_tarde"
                      :item="data.item"
                      :fecha="fecha"
                    />
                  </template>
                </b-table>

                <!-- <b-table
                  responsive
                  :fields="dataTable.fields"
                  :items="dataTable.items"
                >
                  <template #cell(moment)="data">
                    <admin-EntradaSalida
                      :moment="data.moment"
                      :registros="dataTable.diarias"
                    />
                  </template>
                </b-table> -->
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>
      </div>

      <div v-else><accessDenied /></div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import mixin from '~/mixins/mixins.js'

export default {
  mixins: [mixin],

  data() {
    return {
      fecha: null,
      titulo: 'Asistencia de empleados',
      overlay: true,
      dataTable: [],
      dataAsistencias: [],
      fields: [
        {
          key: 'nombre',
          label: 'Empleado',
        },
        {
          key: 'entrada_manana',
          label: 'Entrada Ma\u00f1ana',
        },
        {
          key: 'salida_manana',
          label: 'Salida Ma\u00f1ana',
        },
        {
          key: 'entrada_tarde',
          label: 'Entrada Tarde',
        },
        {
          key: 'salida_tarde',
          label: 'Salida Tarde',
        },
      ],
    }
  },

  computed: {
    minDate() {
      const currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0)

      return currentDate.toISOString().split('T')[0]
    },
    ...mapState('login', ['dataUser', 'access']),
  },

  methods: {
    getCurrentDate() {
      const today = new Date()
      const year = today.getFullYear()
      const month = (today.getMonth() + 1).toString().padStart(2, '0')
      const day = today.getDate().toString().padStart(2, '0')

      return `${year}-${month}-${day}`
    },
    disableFutureDates(date) {
      return date > this.currentDate
    },
    onSubmit(event) {
      // event.preventDefault()
      // const fechaConsultaInicio = this.form.fechaConsultaInicio
      // const fechaConsultaFin = this.form.fechaConsultaFin

      if (!this.fecha) {
        this.$fire({
          title: 'Datos requeridos',
          html: `<p>Por favor seleccione una fecha</p>`,
          type: 'warning',
        })
        return
      }

      this.getTablaAsistencias()
    },

    filterItem(id_empleado, tipo_registro, data) {
      /* console.log(
        'datos para el filtro de hora',
        id_empleado,
        tipo_registro,
        data
      ) */
      const result = data
        .filter(
          (el) =>
            el.id_empleado === id_empleado && el.registro === tipo_registro
        )
        .map((el) => {
          let hour = el.hora
          // console.log(
          //   `vefificamos la fecha el.fecha === fecha`,
          //   el.fecha,
          //   this.fecha
          // )
          if (el.hora != null) {
            // if (el.fecha === this.fecha) {
            hour = el.hora
            console.log('las fechas comiciden asignemos la hora ', el.hora)
          }

          return hour
        })
      console.log('result', result)
      return result
    },

    async getTablaAsistencias() {
      this.overlay = true
      this.dataAsistencias = []
      await axios
        .get(`${this.$config.API}/asistencias/tabla/${this.fecha}`)
        .then((resp) => {
          this.dataTable = resp.data
          this.dataAsistencias = resp.data.empleados.map((emp) => {
            // this.dataAsistencias = resp.data.diarias.map((emp) => {
            let myHour = {
              hora_entrada_manana: this.filterItem(
                emp._id,
                'entrada_manana',
                resp.data.diarias
              ),
              hora_salida_manana: this.filterItem(
                emp._id,
                'salida_manana',
                resp.data.diarias
              ),
              hora_entrada_tarde: this.filterItem(
                emp._id,
                'entrada_tarde',
                resp.data.diarias
              ),
              hora_salida_tarde: this.filterItem(
                emp._id,
                'salida_tarde',
                resp.data.diarias
              ),
            }

            return {
              id_empleado: emp._id,
              nombre: emp.nombre,
              // fecha: emp.fecha,
              registro: emp.registro,
              entrada_manana: myHour.hora_entrada_manana,
              salida_manana: myHour.hora_salida_manana,
              entrada_tarde: myHour.hora_entrada_tarde,
              salida_tarde: myHour.hora_salida_tarde,
            }
          })
          this.overlay = false
        })
    },
  },

  mounted() {
    this.fecha = this.getCurrentDate()
    this.getTablaAsistencias()
  },
}
</script>
