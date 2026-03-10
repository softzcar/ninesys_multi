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
              <td class="text-center align-middle">
                <div
                  class="px-2 py-1 rounded font-weight-bold mx-auto"
                  :style="getColorBadgeStyle(ink.color)"
                >
                  {{ ink.color }}
                </div>
              </td>
              <td class="align-middle text-muted small">{{ ink.capacidad_tanque_ml }} ml</td>
              <td class="align-middle small">{{ formatTimestamp(ink.fecha_ultima_recarga) }}</td>
              <td class="align-middle"><strong>{{ ink.ultima_cantidad_recargada_ml }} ml</strong></td>
              <td class="align-middle text-muted">{{ formatNumber(ink.consumo_desde_ultima_recarga_ml) }} ml</td>
              <td class="align-middle font-weight-bold text-info">
                {{ formatNumber(ink.tinta_restante_ultima_recarga_ml) }} ml
              </td>
              <td class="align-middle">
                <span :class="ink.desperdicio_ciclo_pasado_ml > 0 ? 'text-danger font-weight-bold' : 'text-muted small'">
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
              <td class="text-center align-middle">
                <div
                  class="px-2 py-1 rounded font-weight-bold mx-auto"
                  :style="getColorBadgeStyle(ink.color)"
                >
                  {{ ink.color }}
                </div>
              </td>
              <td class="align-middle">{{ formatNumber(ink.total_recargado_historico_ml) }} ml</td>
              <td class="align-middle">{{ formatNumber(ink.consumo_total_historico_ml) }} ml</td>
              <td class="align-middle">
                <span :class="ink.desperdicio_ciclo_pasado_ml > 0 ? 'text-danger font-weight-bold' : 'text-muted small'">
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
      },
      colorOptions: [
        {
          name: "Cyan",
          value: "C",
          bgColor: "#E0FBFF",
          textColor: "#00BCD4",
          border: "1px solid #B2EBF2"
        },
        {
          name: "Magenta",
          value: "M",
          bgColor: "#FFF0F5",
          textColor: "#E91E63",
          border: "1px solid #F8BBD0"
        },
        {
          name: "Yellow",
          value: "Y",
          bgColor: "#FFFDE7",
          textColor: "#FBC02D",
          border: "1px solid #FFF9C4"
        },
        {
          name: "Black",
          value: "K",
          bgColor: "#F5F5F5",
          textColor: "#212121",
          border: "1px solid #E0E0E0"
        },
        {
          name: "White",
          value: "W",
          bgColor: "#FFFFFF",
          textColor: "#9E9E9E",
          border: "1px solid #E0E0E0"
        }
      ]
    };
  },
  methods: {
    showHistory(printerName, printerData) {
      this.historyModal.printerName = printerName;
      this.historyModal.data = printerData;
      this.historyModal.show = true;
    },
    getColorBadgeStyle(colorCode) {
      const color = this.colorOptions.find(c => c.value === colorCode);
      if (!color) return {};
      return {
        backgroundColor: color.bgColor,
        color: color.textColor,
        border: color.border || '1px solid transparent',
        width: '40px'
      };
    },
    formatNumber(value) {
      if (value === null || value === undefined) return "0.00";
      return parseFloat(value).toFixed(2);
    }
  },
};
</script>

<style scoped>

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