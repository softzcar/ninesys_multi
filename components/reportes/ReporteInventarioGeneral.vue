<template>
  <div class="report-container">
    <div class="report-header">
      <h1>Reporte de Inventario</h1>
      <h2>{{ nombreEmpresa }}</h2>
      <div class="report-info">
        <p><strong>Departamento:</strong> {{ datosReporte.departamento || 'Todas' }}</p>
        <p><strong>Fecha:</strong> {{ fechaReporte }}</p>
        <p><strong>Ítems:</strong> {{ datosReporte.items.length }}</p>
        <p><strong>Valor Actual:</strong> ${{ formatoDinero(valorActualGlobal) }}</p>
        <p><strong>Valor Consumido:</strong> ${{ formatoDinero(valorConsumidoGlobal) }}</p>
        <p><strong>Valor Total:</strong> ${{ formatoDinero(valorTotalGlobal) }}</p>
      </div>
    </div>

    <table class="report-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>SKU</th>
          <th>Insumo</th>
          <th>Unidad</th>
          <th>Stock</th>
          <th>Costo</th>
          <th>Departamento</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in datosReporte.items" :key="index">
          <td>{{ item._id }}</td>
          <td>{{ item.sku }}</td>
          <td>{{ item.insumo }}</td>
          <td>{{ item.unidad }}</td>
          <td>{{ calcularStockIndividual(item) }}</td>
          <td>${{ calcularValorIndividual(item) }}</td>
          <td>{{ item.departamento }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    datosReporte: {
      type: Object,
      required: true,
    },
  },
  computed: {
    nombreEmpresa() {
      return this.$store.state.login.dataEmpresa?.nombre || 'NineSys';
    },
    fechaReporte() {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}/${month}/${year}`;
    },
    valorTotalGlobal() {
      return this.datosReporte.items.reduce((acc, item) => {
        return acc + parseFloat(item.costo || 0);
      }, 0);
    },
    valorActualGlobal() {
      return this.datosReporte.items.reduce((acc, item) => {
        const cant = parseFloat(item.cantidad || 0);
        const cantIni = parseFloat(item.cantidad_inicial) || cant || 1;
        const costTotal = parseFloat(item.costo || 0);
        return acc + ((cant / cantIni) * costTotal);
      }, 0);
    },
    valorConsumidoGlobal() {
      return this.valorTotalGlobal - this.valorActualGlobal;
    }
  },
  methods: {
    formatoDinero(valor) {
      return parseFloat(valor).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    calcularStockIndividual(item) {
      const cant = parseFloat(item.cantidad || 0);
      const rend = parseFloat(item.rendimiento || 1);
      // Nueva regla: división por rendimiento/eficiencia
      return (cant / rend).toFixed(2);
    },
    calcularValorIndividual(item) {
      const cant = parseFloat(item.cantidad || 0);
      const cantIni = parseFloat(item.cantidad_inicial) || cant || 1;
      const costTotal = parseFloat(item.costo || 0);
      return ((cant / cantIni) * costTotal).toFixed(2);
    }
  }
};
</script>

<style scoped>
.report-container {
  font-family: 'Verdana', sans-serif;
  color: #000;
  padding: 20px;
}
.report-header {
  text-align: center;
  margin-bottom: 2rem;
}
.report-header h1 {
  font-size: 18pt;
  margin: 0;
}
.report-header h2 {
  font-size: 14pt;
  margin: 5px 0 0 0;
  color: #444;
}
.report-info {
  text-align: left;
  margin-top: 1.5rem;
  display: inline-block;
  font-size: 10pt;
}
.report-info p {
  margin: 0.2rem 0;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.report-table th, .report-table td {
  border: 1px solid #ccc;
  padding: 6px;
  text-align: left;
  font-size: 9pt;
}
.report-table th {
  background-color: #f2f2f2;
}
</style>
