<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-container>
        <b-row class="mb-4 p-3 bg-light border rounded align-items-end">
          <b-col xs="12" sm="6" md="3">
            <b-form-group label="Fecha inicio:" label-for="fecha-1" class="mb-0">
              <b-form-datepicker id="fecha-1" locale="es" @input="buscarReposiciones" v-model="form.fechaConsultaInicio" class="mb-0"></b-form-datepicker>
            </b-form-group>
          </b-col>

          <b-col xs="12" sm="6" md="3">
            <b-form-group label="Fecha fin:" label-for="fecha-2" class="mb-0">
              <b-form-datepicker id="fecha-2" locale="es" @input="buscarReposiciones" v-model="form.fechaConsultaFin" class="mb-0"></b-form-datepicker>
            </b-form-group>
          </b-col>

          <b-col xs="12" sm="6" md="4">
            <b-form-group label="Estatus Orden:" label-for="estatus-select" class="mb-0">
              <b-form-select id="estatus-select" @change="buscarReposiciones" :disabled="overlay" v-model="estatusOrden"
                :options="optStatus" :value="estatusOrden"></b-form-select>
            </b-form-group>
          </b-col>

          <b-col xs="12" sm="6" md="2">
            <b-button @click="buscarReposiciones(true)" :disabled="overlay" variant="primary" class="w-100">
              <b-icon icon="search"></b-icon> Buscar
            </b-button>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-table striped :fields="fields" :items="dataReporte" class="mb-4">
              <template #cell(id_orden)="data">
                <linkSearch :id="data.item.id_orden" />
              </template>

              <template #cell(material_consumido)="data">
                <b-button variant="outline-primary" size="sm" @click="getDetallesReposicion(data.item)">
                  {{ parseFloat(data.item.material_consumido).toFixed(2) }} $
                </b-button>
              </template>

              <template #cell(fecha_creacion)="data">
                {{ data.item.fecha_creacion }} {{ data.item.hora_creacion }}
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>

    <!-- Modal Detalle Costos -->
    <b-modal id="modal-detalle-costos" title="Desglose de Costos de Reposición" size="lg" hide-footer>
      <div v-if="repoSeleccionada">
        <b-alert show variant="info" class="mb-4">
          <h5 class="alert-heading">Resumen</h5>
          <p class="mb-0">
            <strong>Orden:</strong> {{ repoSeleccionada.id_orden }} <br>
            <strong>Producto:</strong> {{ repoSeleccionada.producto }} <br>
            <strong>Costo Total:</strong> <span class="text-danger font-weight-bold">{{
              parseFloat(repoSeleccionada.material_consumido).toFixed(2) }} $</span>
          </p>
        </b-alert>

        <b-table striped hover :items="detallesReposicion" :fields="[
          { key: 'insumo', label: 'Insumo' },
          { key: 'unidad', label: 'Und' },
          { key: 'cantidad_consumida', label: 'Cant.' },
          { key: 'costo_unitario', label: 'Costo Unit.' },
          { key: 'costo_total', label: 'Total ($)' },
          { key: 'fecha', label: 'Fecha' }
        ]">
          <template #cell(cantidad_consumida)="data">
            {{ parseFloat(data.value).toFixed(2) }}
          </template>
          <template #cell(costo_total)="data">
            <strong>{{ parseFloat(data.value).toFixed(2) }} $</strong>
          </template>
        </b-table>
      </div>
    </b-modal>
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
      isReady: false,
      lastFetched: {
        fechaInicio: null,
        fechaFin: null,
        estatus: null,
      },
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
      repoSeleccionada: {},
      totalCosto: 0,
      detallesReposicion: [],
      fields: [
        {
          key: "id_orden",
          label: "Orden",
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
          key: "material_consumido",
          label: "Consumido",
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

    getDetallesReposicion(item) {
      this.overlay = true;
      this.detallesReposicion = [];
      this.totalCosto = item.material_consumido;
      this.repoSeleccionada = item;

      this.$axios
        .get(`${this.$config.API}/reposicion-detalles/${item.id_reposicion}`)
        .then((resp) => {
          this.detallesReposicion = resp.data;
          this.$bvModal.show("modal-detalle-costos");
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se pudieron cargar los detalles</p>`,
            type: "error",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    buscarReposiciones(force = false) {
      if (!this.isReady) return;
      this.overlay = true;
      const fechaConsultaInicio = this.form.fechaConsultaInicio;
      const fechaConsultaFin = this.form.fechaConsultaFin;

      if (!fechaConsultaInicio || !fechaConsultaFin) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>Por favor seleccione ambas fechas</p>`,
          type: "warning",
        });
        this.overlay = false;
        return;
      }

      if (new Date(fechaConsultaInicio) > new Date(fechaConsultaFin)) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
          type: "warning",
        });
        this.overlay = false;
        return;
      }
      this.getReposiciones(force === true);
    },

    async getReposiciones(force = false) {
      const start = this.form.fechaConsultaInicio;
      const end = this.form.fechaConsultaFin;
      const status = this.estatusOrden;

      if (
        !force &&
        this.lastFetched.fechaInicio === start &&
        this.lastFetched.fechaFin === end &&
        this.lastFetched.estatus === status
      ) {
        console.log("[DEBUG-COMPONENT] Evitando petición duplicada con idénticos filtros");
        this.overlay = false;
        return;
      }

      // Guardar valores anteriores para restaurar en caso de fallo
      const prevFetched = { ...this.lastFetched };

      // Establecer inmediatamente para evitar condiciones de carrera (llamadas en vuelo)
      this.lastFetched.fechaInicio = start;
      this.lastFetched.fechaFin = end;
      this.lastFetched.estatus = status;

      this.overlay = true;

      const queryParams = new URLSearchParams({
        fecha_inicio: start,
        fecha_fin: end
      }).toString();

      const URLRep = `${this.$config.API}/reposiciones-reporte/${status}?${queryParams}`;

      await this.$axios
        .get(URLRep)
        .then((res) => {
          this.dataReporte = res.data;
        })
        .catch((err) => {
          // Restaurar valores en caso de error para permitir reintento
          this.lastFetched.fechaInicio = prevFetched.fechaInicio;
          this.lastFetched.fechaFin = prevFetched.fechaFin;
          this.lastFetched.estatus = prevFetched.estatus;

          this.$fire({
            title: "Error",
            html: `<p>No se cargaron los datos correctamente</p><p>${err}</p>`,
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

  async mounted() {
    await this.getReposiciones();
    this.$nextTick(() => {
      this.isReady = true;
    });
  },
};
</script>
