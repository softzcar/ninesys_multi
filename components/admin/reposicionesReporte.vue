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

              <template #cell(estatus_orden)="data">
                <badge-estatus-orden :estatus="data.value" />
              </template>

              <template #cell(material_consumido)="data">
                <b-button variant="outline-primary" size="sm" @click="getDetallesReposicion(data.item)">
                  {{ parseFloat(data.item.material_consumido).toFixed(2) }} $
                </b-button>
              </template>

              <template #cell(fecha_creacion)="data">
                {{ data.item.fecha_creacion }} {{ data.item.hora_creacion }}
              </template>

              <template #cell(ver_detalle)="data">
                <b-button variant="outline-secondary" size="sm" @click="verDetalleReposicion(data.item)">
                  <b-icon icon="eye"></b-icon> Ver
                </b-button>
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

    <!-- Modal Detalle de la Reposición (solo lectura, sin acciones) -->
    <b-modal id="modal-detalle-reposicion-info" title="Detalle de la Reposición" size="lg" hide-footer>
      <div v-if="repoDetalle">
        <b-container fluid class="p-0">
          <b-row class="mb-3">
            <b-col md="6">
              <div class="card h-100 shadow-sm border-light">
                <div class="card-header bg-dark text-white font-weight-bold d-flex align-items-center justify-content-between py-2">
                  <span><b-icon icon="info-square" class="mr-1"></b-icon> Información Básica</span>
                  <b-badge variant="light">ID: #{{ repoDetalle.id_reposicion }}</b-badge>
                </div>
                <b-list-group flush>
                  <b-list-group-item>
                    <strong>Orden Vinculada:</strong> <linkSearch :id="repoDetalle.id_orden" :key="repoDetalle.id_orden" class="ml-1" />
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Estado de la Orden:</strong> <badge-estatus-orden :estatus="repoDetalle.estatus_orden" />
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Unidades a Reponer:</strong> <b-badge variant="info" pill class="px-2 font-weight-bold">{{ repoDetalle.unidades }}</b-badge>
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Fecha de Solicitud:</strong> <small class="text-muted"><b-icon icon="calendar3" class="mr-1"></b-icon>{{ repoDetalle.fecha_creacion }} {{ repoDetalle.hora_creacion }}</small>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </b-col>

            <b-col md="6">
              <div class="card h-100 shadow-sm border-light">
                <div class="card-header bg-primary text-white font-weight-bold py-2">
                  <b-icon icon="person-badge" class="mr-1"></b-icon> Personas Involucradas
                </div>
                <b-list-group flush>
                  <b-list-group-item class="d-flex align-items-center justify-content-between">
                    <strong>Emisor:</strong>
                    <b-badge variant="light" class="text-dark border font-weight-bold">
                      <b-icon icon="person-fill" class="mr-1"></b-icon>{{ repoDetalle.empleado_emisor || 'N/D' }}
                    </b-badge>
                  </b-list-group-item>
                  <b-list-group-item class="d-flex align-items-center justify-content-between">
                    <strong>Empleado Asignado:</strong>
                    <b-badge v-if="repoDetalle.empleado_asignado" variant="light" class="text-dark border font-weight-bold">
                      <b-icon icon="person-fill" class="mr-1"></b-icon>{{ repoDetalle.empleado_asignado }}
                    </b-badge>
                    <b-badge v-else variant="warning" class="font-weight-bold">
                      <b-icon icon="person-dash-fill" class="mr-1"></b-icon>Sin asignar
                    </b-badge>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </b-col>
          </b-row>

          <b-row class="mb-3">
            <b-col>
              <div class="card shadow-sm border-light">
                <div class="card-header bg-light font-weight-bold py-2">
                  <b-icon icon="tag" class="mr-1 text-secondary"></b-icon> Detalles del Producto
                </div>
                <div class="card-body py-3">
                  <h6 class="font-weight-bold text-dark mb-1">{{ repoDetalle.producto }}</h6>
                  <p class="mb-0 text-muted small">
                    <strong>Talla:</strong> {{ repoDetalle.talla }} &nbsp;&nbsp;|&nbsp;&nbsp;
                    <strong>Corte:</strong> {{ repoDetalle.corte }} &nbsp;&nbsp;|&nbsp;&nbsp;
                    <strong>Tela:</strong> {{ repoDetalle.tela }}
                  </p>
                </div>
              </div>
            </b-col>
          </b-row>

          <b-row class="mb-3">
            <b-col md="6">
              <div class="card shadow-sm border-light">
                <div class="card-header font-weight-bold py-2" style="background-color: rgba(255,193,7,0.1); border-bottom: 1px solid rgba(255,193,7,0.2);">
                  <b-icon icon="exclamation-circle" class="mr-1 text-warning"></b-icon> Detalle de Solicitud (Emisor)
                </div>
                <div class="card-body p-3 bg-light text-dark" style="min-height: 80px; font-size: 0.95em; white-space: pre-line;">
                  {{ repoDetalle.detalle_emisor || 'Ninguno proporcionado.' }}
                </div>
              </div>
            </b-col>
            <b-col md="6">
              <div class="card shadow-sm border-light">
                <div class="card-header font-weight-bold py-2" style="background-color: rgba(40,167,69,0.1); border-bottom: 1px solid rgba(40,167,69,0.2);">
                  <b-icon icon="check2-circle" class="mr-1 text-success"></b-icon> Detalle de Aprobación (Jefe de Producción)
                </div>
                <div class="card-body p-3 bg-light text-dark" style="min-height: 80px; font-size: 0.95em; white-space: pre-line;">
                  {{ repoDetalle.detalle_encargado || 'Ninguno proporcionado.' }}
                </div>
              </div>
            </b-col>
          </b-row>
        </b-container>
      </div>
      <div class="text-right mt-3 border-top pt-2">
        <b-button variant="secondary" size="sm" @click="$bvModal.hide('modal-detalle-reposicion-info')">Cerrar</b-button>
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
      repoDetalle: null,
      fields: [
        {
          key: "id_orden",
          label: "Orden",
        },
        {
          key: "estatus_orden",
          label: "Estado",
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
        {
          key: "ver_detalle",
          label: "Detalle",
        },
      ],
    };
  },


  methods: {
    filterDataEmpleado(id_empleado) {
      return this.itemsDetallado.filter((el) => el.id_empleado === id_empleado);
    },

    prepareDate(dateString) {
      const date = DateTime.fromJSDate(new Date(dateString));
      return date.toFormat("dd/LL/yyyy");
    },

    verDetalleReposicion(item) {
      this.repoDetalle = item;
      this.$bvModal.show("modal-detalle-reposicion-info");
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

      // La fecha es un filtro OPCIONAL, no un requisito: una reposición "activa"
      // puede llevar abierta mucho tiempo y no debería desaparecer del reporte
      // solo por no caer dentro de un rango de fechas. Solo se valida si el
      // usuario llenó una fecha sin la otra (combinación ambigua).
      if ((fechaConsultaInicio && !fechaConsultaFin) || (!fechaConsultaInicio && fechaConsultaFin)) {
        this.$fire({
          title: "Datos incompletos",
          html: `<p>Si va a filtrar por fecha, seleccione ambas (inicio y fin)</p>`,
          type: "warning",
        });
        this.overlay = false;
        return;
      }

      if (fechaConsultaInicio && fechaConsultaFin && new Date(fechaConsultaInicio) > new Date(fechaConsultaFin)) {
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
    // Sin fechas por defecto: la vista inicial (estatusOrden="activa") debe
    // mostrar TODAS las reposiciones activas sin importar cuánto tiempo llevan
    // abiertas -- limitar por fecha aquí escondería reposiciones viejas que
    // siguen pendientes (antes esto dejaba el reporte vacío la mayoría del
    // tiempo, al filtrar por defecto solo el día de hoy).
    this.form.fechaConsultaInicio = "";
    this.form.fechaConsultaFin = "";
  },

  async mounted() {
    await this.getReposiciones();
    this.$nextTick(() => {
      this.isReady = true;
    });
  },
};
</script>
