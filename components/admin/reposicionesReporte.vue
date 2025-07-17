<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <b-container>
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
            <b-form>
              <!-- <b-form-group id="input-group-1" label="Fecha inicio:" label-for="fecha-1">
                                <b-form-datepicker id="fecha-1" v-model="form.fechaConsultaInicio"
                                    class="mb-2"></b-form-datepicker>
                            </b-form-group>

                            <b-form-group id="input-group-2" label="Fecha fin:" label-for="fecha-2">
                                <b-form-datepicker v-model="form.fechaConsultaFin" class="mb-2"></b-form-datepicker>
                            </b-form-group> -->
              <b-form-select
                class="mb-4"
                @change="buscarReposiciones"
                :disabled="overlay"
                v-model="estatusOrden"
                :options="optStatus"
                :value="estatusOrden"
              ></b-form-select>
              <!-- <b-button @click="buscarReposiciones" :disabled="overlay" class="mb-4 mt-2" type="submit"
                                variant="primary">Buscar Reposiciones
                            </b-button> -->
            </b-form>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-table
              striped
              :fields="fields"
              :items="dataReporte"
              class="mb-4"
            >
              <template #cell(id_orden)="data">
                <linkSearch :id="data.item.id_orden" />
              </template>

              <template #cell(material_consumido)="data">
                {{ data.item.material_consumido }} {{ data.item.unidad }}
              </template>

              <template #cell(fecha_creacion)="data">
                {{ data.item.fecha_creacion }} {{ data.item.hora_creacion }}
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import { DateTime } from "luxon";

export default {
  name: "NinesysAsistenciasReporte",

  mixins: [mixin],

  data() {
    return {
      dataReporte: [],
      optStatus: [
        { value: "activa", text: "Activas, en espera, pausadas y terminadas" },
        { value: "cancelada", text: "Canceladas" },
        { value: "entregada", text: "Entregadas" },
        { value: "todas", text: "Todas" },
      ],
      estatusOrden: "activa",
      form: {
        fechaConsultaInicio: "",
        fechaConsultaFin: "",
      },
      overlay: true,
      fields_resumen: null,
      fields_detallado: null,
      itemsResumen: null,
      itemsDetallado: null,
      fields: [
        {
          key: "id_orden",
          label: "Orden",
        },
        {
          key: "id_reposicion",
          label: "Reposición",
        },
        {
          key: "producto",
          label: "Producto",
        },
        {
          key: "unidades",
          label: "Unidades",
        },
        {
          key: "talla",
          label: "Talla",
        },
        {
          key: "tela",
          label: "Tela",
        },
        {
          key: "material_consumido",
          label: "Consumido",
        },
        {
          key: "empleado_emisor",
          label: "Emisor",
        },
        {
          key: "empleado_asignado",
          label: "Asignado",
        },
        {
          key: "fecha_creacion",
          label: "Fecha",
          sortable: true,
        },
      ],
    };
  },

  computed: {
    hoy() {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const day = today.getDate().toString().padStart(2, "0");

      return `${year}-${month}-${day}`;
    },
  },

  methods: {
    filterDataEmpleado(id_empleado) {
      return this.itemsDetallado.filter((el) => el.id_empleado === id_empleado);
    },

    prepareDate(dateString) {
      const date = DateTime.fromJSDate(new Date(dateString));
      return date.toFormat("dd/LL/yyyy");
    },

    buscarReposiciones() {
      this.overlay = true;
      const fechaConsultaInicio = this.form.fechaConsultaInicio;
      const fechaConsultaFin = this.form.fechaConsultaFin;

      if (!fechaConsultaInicio || !fechaConsultaFin) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>Por favor seleccione ambas fechas</p>`,
          type: "warning",
        });
        return;
      }

      if (new Date(fechaConsultaInicio) > new Date(fechaConsultaFin)) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
          type: "warning",
        });
        return;
      }
      this.getReposiciones();
    },

    async getReposiciones(estatus = null, fechaInicio = null, fechaFin = null) {
      this.overlay = true;

      let URLRep = "";

      if (estatus === null) {
        // Solcitamos las  reposiciones de las oredenes activas
        URLRep = `${this.$config.API}/reposiciones-reporte/${this.estatusOrden}`;
      } else if (
        estatus !== null &&
        fechaInicio === null &&
        fechaFin === null
      ) {
        // Solicitamos las reposiciones con el estatus indicado
        URLRep = `${this.$config.API}/reposiciones-reporte/${estatus}`;
      }

      await this.$axios
        .get(URLRep)
        .then((res) => {
          this.dataReporte = res.data;
          /* this.fields_resumen = res.data.fields_resumen
                    this.fields_detallado = res.data.fields_detallado
                    this.itemsResumen = res.data.resumen
                    this.itemsDetallado = res.data.detallado */
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<P>No se cargaron los datos correctamente</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  beforeMount() {
    this.form.fechaConsultaInicio = this.hoy;
    this.form.fechaConsultaFin = this.hoy;
  },

  mounted() {
    this.getReposiciones();
  },
};
</script>
