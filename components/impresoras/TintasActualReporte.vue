<template>
  <div>
    <div v-for="(printerData, printerName) in groupedInkData" :key="printerName" class="mb-5">
      <h3>Impresora: {{ printerName }}</h3>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Color</th>
              <th>Capacidad Tanque</th>
              <th>Fecha Última Recarga</th>
              <th>Consumo Desde Última Recarga</th>
              <th>Tinta Restante Estimada</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ink, index) in printerData" :key="index" :style="getInkRowStyle(ink.color)">
              <td>{{ ink.color }}</td>
              <td>{{ ink.capacidad_tanque_ml }} ml</td>
              <td>{{ formatTimestamp(ink.fecha_ultima_recarga) }}</td>
              <td>{{ ink.consumo_desde_ultima_recarga_ml }} ml</td>
              <td>{{ ink.tinta_restante_estimada_ml }} ml</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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
      // fields property removed
    };
  },
  methods: {
    getInkRowStyle(color) {
      switch (color) {
        case 'C': return { backgroundColor: '#00FFFF', color: '#000000' };
        case 'M': return { backgroundColor: '#FF00FF', color: '#000000' };
        case 'Y': return { backgroundColor: '#FFFF00', color: '#000000' };
        case 'K': return { backgroundColor: '#000000', color: '#FFFFFF' };
        case 'W': return { backgroundColor: '#FFFFFF', color: '#000000', border: '1px solid #ccc' };
        default: return {};
      }
    },
  },
};
</script>

<style scoped>
/* No specific styles needed for rows as they are styled inline */
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
  vertical-align: top;
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