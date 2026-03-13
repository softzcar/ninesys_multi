<template>
  <div class="container mt-4">
    <b-overlay :show="overlay" rounded="sm">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Reporte de Impresoras</h2>
        </div>
        <div class="card-body">
          <b-table striped hover :items="impresoras" :fields="fields">
            <template #cell(tintas_recargas)="row">
              <b-button size="sm" variant="primary" @click="row.toggleDetails" class="mr-2" :disabled="!row.item.tintas_recargas || row.item.tintas_recargas.length === 0 || (row.item.tintas_recargas.length === 1 && row.item.tintas_recargas[0].id === null)">
                {{ row.detailsShowing ? 'Ocultar' : 'Mostrar' }} Recargas
              </b-button>
            </template>
            <template #row-details="row">
              <b-card>
                <p><strong>Recargas de Tinta:</strong></p>
                <b-table striped hover :items="row.item.tintas_recargas" :fields="tintaRecargasFields">
                  <template #cell(color)="data">
                    <div
                      class="ink-badge mx-auto"
                      :class="'ink-' + data.value.toLowerCase()"
                    >
                      {{ data.value }}
                    </div>
                  </template>
                  <template #cell(restante_post_recarga)="data">
                    <span class="font-weight-bold text-info">
                      {{ formatNumber(data.value) }}
                    </span>
                  </template>
                  <template #cell(desperdicio_ajuste)="data">
                    <span v-if="data.value !== null" :class="data.value > 1 ? 'text-danger font-weight-bold' : (data.value < -1 ? 'text-success' : 'text-muted')">
                      {{ formatNumber(data.value) }} ml
                    </span>
                    <span v-else class="text-muted italic">Abierto</span>
                  </template>
                  <template #cell(fecha_recarga)="data">
                    {{ formatDate(data.value ? data.value.split(' ')[0] : '') }}
                  </template>
                </b-table>
              </b-card>
            </template>
          </b-table>
        </div>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
export default {
  mixins: [mixin],
  name: "ReporteImpresoras",
  data() {
    return {
      impresoras: [],
      overlay: false,
      fields: [
        { key: "codigo_interno", label: "Código Interno", sortable: true },
        { key: "marca", label: "Marca", sortable: true },
        { key: "modelo", label: "Modelo", sortable: true },
        { key: "ubicacion", label: "Ubicación", sortable: true },
        { key: "tipo_tecnologia", label: "Tipo Tecnología", sortable: true },
        { key: "estado", label: "Estado", sortable: true },
        { key: "notas", label: "Notas" },
        { key: "tintas_recargas", label: "Recargas", class: "text-center" },
      ],
      tintaRecargasFields: [
        { key: "id_insumo", label: "ID Insumo", sortable: true },
        { key: "color", label: "Color", class: "text-center", sortable: true },
        { key: "cantidad", label: "Cantidad Insumo (ml)", formatter: "formatNumber", sortable: true },
        { key: "nivel_tanque_previo", label: "Restante Previo (ml)", formatter: "formatNumber", sortable: true },
        { key: "restante_post_recarga", label: "Total en Tanque (ml)", formatter: "formatNumber", sortable: true },
        { key: "consumido_en_ciclo", label: "Consumido Ciclo (ml)", formatter: "formatNumber", sortable: true },
        { key: "desperdicio_ajuste", label: "Ajuste / Desperdicio", sortable: true },
        { key: "fecha_recarga", label: "Fecha Recarga", sortable: true },
      ],
    };
  },
  methods: {
    async fetchImpresoras() {
      this.overlay = true;
      try {
        const response = await this.$axios.get(`${this.$config.API}/impresoras`);
        this.impresoras = response.data;
      } catch (error) {
        console.error("Error al obtener las impresoras:", error);
        this.$fire({
          title: "Error",
          html: `<p>No se pudieron cargar las impresoras. ${error.message}</p>`,
          type: "error",
        });
      } finally {
        this.overlay = false;
      }
    },
  },
  created() {
    this.fetchImpresoras();
  },
};
</script>

.table {
  margin-bottom: 0;
}
</style>
