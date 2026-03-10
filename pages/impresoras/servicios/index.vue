<template>
  <div>
    <b-card>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3>Servicio Técnico de Máquinas</h3>
        <b-button variant="primary" @click="$bvModal.show('modal-servicio-nuevo')">
          <b-icon icon="plus" /> Nuevo Servicio
        </b-button>
      </div>

      <b-row class="mb-3">
        <b-col md="4">
          <b-form-group label="Buscar">
            <b-form-input
              v-model="filter.search"
              placeholder="Tipo, descripción o técnico..."
              @keyup.enter="getServicios"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col md="3">
          <b-form-group label="Estado">
            <b-form-select v-model="filter.estado" :options="estados" @change="getServicios" />
          </b-form-group>
        </b-col>
        <b-col md="5" class="d-flex align-items-end pb-3">
          <b-button variant="secondary" @click="getServicios">Procesar Filtros</b-button>
        </b-col>
      </b-row>

      <b-table
        :items="servicios"
        :fields="fields"
        responsive
        striped
        hover
        show-empty
        empty-text="No hay servicios registrados"
      >
        <template #cell(tipo_servicio)="data">
          <strong>{{ data.value }}</strong>
        </template>

        <template #cell(fecha_servicio)="data">
          {{ formatDate(data.value) }}
        </template>

        <template #cell(proxima_fecha)="data">
          <span v-if="data.value" class="text-info">
            {{ formatDate(data.value) }}
          </span>
          <span v-else class="text-muted text-sm">N/A</span>
        </template>

        <template #cell(costo)="data">
          {{ formatNumber(data.value) }} $
        </template>

        <template #cell(estado)="data">
          <b-badge :variant="data.value === 'completado' ? 'success' : 'warning'">
            {{ data.value.toUpperCase() }}
          </b-badge>
        </template>

        <template #cell(acciones)="data">
          <div class="d-flex gap-2">
            <b-button
              variant="info"
              size="sm"
              @click="editServicio(data.item)"
            >
              <b-icon icon="pencil" />
            </b-button>
            <b-button
              variant="danger"
              size="sm"
              @click="deleteServicio(data.item._id)"
            >
              <b-icon icon="trash" />
            </b-button>
          </div>
        </template>
      </b-table>
    </b-card>

    <servicio-nuevo @reload="getServicios" />
    <servicio-editar :servicio="selectedServicio" @reload="getServicios" />
  </div>
</template>

<script>
import ServicioNuevo from "~/components/impresoras/ServicioNuevo.vue";
import ServicioEditar from "~/components/impresoras/ServicioEditar.vue";
import mixins from "~/mixins/mixins";

export default {
  mixins: [mixins],
  components: {
    ServicioNuevo,
    ServicioEditar
  },
  data() {
    return {
      servicios: [],
      selectedServicio: null,
      filter: {
        search: '',
        estado: '',
        id_maquina: ''
      },
      estados: [
        { text: 'Todos los estados', value: '' },
        { text: 'Completado', value: 'completado' },
        { text: 'Pendiente', value: 'pendiente' }
      ],
      fields: [
        { key: '_id', label: 'ID', sortable: true },
        { key: 'maquina_nombre', label: 'Máquina', sortable: true },
        { key: 'tipo_servicio', label: 'Servicio', sortable: true },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'tecnico', label: 'Técnico' },
        { key: 'costo', label: 'Costo' },
        { key: 'fecha_servicio', label: 'Fecha', sortable: true },
        { key: 'proxima_fecha', label: 'Próxima Ref.', sortable: true },
        { key: 'estado', label: 'Estado' },
        { key: 'acciones', label: 'Acciones' }
      ]
    };
  },
  mounted() {
    this.getServicios();
  },
  methods: {
    async getServicios() {
      try {
        const res = await this.$axios.get(`${this.$config.API}/servicios-maquinas`, {
          params: this.filter
        });
        this.servicios = res.data;
      } catch (e) {
        this.$fire({
          title: "Error",
          text: "Error al cargar servicios",
          type: "error"
        });
      }
    },
    editServicio(item) {
      this.selectedServicio = JSON.parse(JSON.stringify(item));
      this.$bvModal.show('modal-servicio-editar');
    },
    async deleteServicio(id) {
      if (confirm("¿Seguro que deseas eliminar este registro de servicio?")) {
        try {
          await this.$axios.delete(`${this.$config.API}/servicios-maquinas/${id}`);
          this.$fire({
            title: "Éxito",
            text: "Servicio eliminado",
            type: "success"
          });
          this.getServicios();
        } catch (e) {
          this.$fire({
            title: "Error",
            text: "Error al eliminar",
            type: "error"
          });
        }
      }
    }
  }
};
</script>
