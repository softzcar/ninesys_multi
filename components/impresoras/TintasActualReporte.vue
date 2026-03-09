<template>
  <div>
    <div v-for="(printerData, printerName) in groupedInkData" :key="printerName" class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>Impresora: {{ printerName }}</h3>
        <b-button size="sm" variant="primary" @click="showHistory(printerName, printerData)">
          <b-icon icon="clock-history" class="mr-1"></b-icon> Histórico
        </b-button>
      </div>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th class="text-center">Color</th>
              <th>Capacidad Tanque</th>
              <th>Fecha Última Recarga</th>
              <th>Cant. Recargada</th>
              <th>Consumo Actual</th>
              <th>Tinta en Tanque (Actual)</th>
              <th>Desperdicio (Ciclo Ant.)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ink, index) in printerData" :key="index">
              <td class="text-center">
                <div class="color-badge" :class="'color-' + ink.color.toLowerCase()">
                  {{ ink.color }}
                </div>
              </td>
              <td>{{ ink.capacidad_tanque_ml }} ml</td>
              <td>{{ formatTimestamp(ink.fecha_ultima_recarga) }}</td>
              <td><strong>{{ ink.ultima_cantidad_recargada_ml }} ml</strong></td>
              <td>{{ ink.consumo_desde_ultima_recarga_ml }} ml</td>
              <td>
                <b-badge :variant="getBadgeVariant(ink.tinta_restante_ultima_recarga_ml)">
                  {{ ink.tinta_restante_ultima_recarga_ml }} ml
                </b-badge>
              </td>
              <td>
                <span :class="ink.desperdicio_ciclo_pasado_ml > 0 ? 'text-danger fw-bold' : 'text-muted'">
                  {{ formatNumber(ink.desperdicio_ciclo_pasado_ml) }} ml
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Histórico -->
    <b-modal v-model="historyModal.show" :title="'Histórico: ' + historyModal.printerName" hide-footer size="lg">
      <div class="table-responsive">
        <table class="table table-bordered table-striped">
          <thead class="thead-dark">
            <tr>
              <th class="text-center">Color</th>
              <th>Total Recargado</th>
              <th>Total Consumido</th>
              <th>Ajuste / Desperdicio</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ink, index) in historyModal.data" :key="index">
              <td class="text-center">
                <div class="color-badge" :class="'color-' + ink.color.toLowerCase()">
                  {{ ink.color }}
                </div>
              </td>
              <td>{{ formatNumber(ink.total_recargado_historico_ml) }} ml</td>
              <td>{{ formatNumber(ink.consumo_total_historico_ml) }} ml</td>
              <td>
                <span :class="ink.desperdicio_ciclo_pasado_ml > 0 ? 'text-danger fw-bold' : 'text-muted'">
                  {{ formatNumber(ink.desperdicio_ciclo_pasado_ml) }} ml
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-right mt-3">
        <b-button variant="secondary" @click="historyModal.show = false">Cerrar</b-button>
      </div>
    </b-modal>

    <div v-if="inkData.length === 0">
      <p>No hay datos de tintas disponibles.</p>
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"

export default {
  mixins: [mixin],
  props: {
    inkData: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  computed: {
    groupedInkData() {
      const order = { 'C': 1, 'M': 2, 'Y': 3, 'K': 4, 'W': 5 };
      return this.inkData.reduce((acc, item) => {
        if (!acc[item.impresora]) {
          acc[item.impresora] = [];
        }
        acc[item.impresora].push(item);
        // Sort the inks within each printer group
        acc[item.impresora].sort((a, b) => {
          return order[a.color] - order[b.color];
        });
        return acc;
      }, {});
    },
  },
  data() {
    return {
      historyModal: {
        show: false,
        printerName: '',
        data: []
      }
    };
  },
  methods: {
    showHistory(printerName, printerData) {
      this.historyModal.printerName = printerName;
      this.historyModal.data = printerData;
      this.historyModal.show = true;
    },
    getBadgeVariant(value) {
      const val = parseFloat(value);
      if (val <= 0) return 'danger';
      if (val < 100) return 'warning';
      return 'success';
    },
    // getInkRowStyle removed as we now use badges
  },
};
</script>

<style scoped>
.color-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  font-weight: bold;
  margin: 0 auto;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.color-c { background-color: #00FFFF; color: black; text-shadow: none; border: 1px solid #00CCCC; }
.color-m { background-color: #FF00FF; border: 1px solid #CC00CC; }
.color-y { background-color: #FFFF00; color: black; text-shadow: none; border: 1px solid #CCCC00; }
.color-k { background-color: #000000; border: 1px solid #333; }
.color-w { background-color: #FFFFFF; color: black; text-shadow: none; border: 1px solid #CCCCCC; }

.table-responsive {
  width: 100%;
  overflow-x: auto;
}
.table {
  width: 100%;
  margin-bottom: 1rem;
  color: #212529;
  border-collapse: collapse;
}
.table th,
.table td {
  padding: 0.75rem;
  vertical-align: middle;
  border-top: 1px solid #dee2e6;
}
.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
}
.table tbody + tbody {
  border-top: 2px solid #dee2e6;
}
.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}
.table-hover tbody tr:hover {
  color: #212529;
  background-color: rgba(0, 0, 0, 0.075);
}
</style>