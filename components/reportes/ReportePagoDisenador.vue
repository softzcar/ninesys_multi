<template>
  <div class="report-container">
    <div class="report-header">
      <h1>Reporte de Pagos</h1>
      <h2>{{ nombreEmpresa }}</h2>
      <div class="report-info">
        <p><strong>Diseñador:</strong> {{ datosReporte.nombreEmpleado }}</p>
        <p><strong>Fecha del Reporte:</strong> {{ fechaReporte }}</p>
        <p><strong>Total a Pagar:</strong> {{ datosReporte.totalPagar }}</p>
      </div>
    </div>

    <table class="report-table">
      <thead>
        <tr>
          <th>Orden</th>
          <th>Revisión</th>
          <th>Producto</th>
          <th>Empleado</th>
          <th>Departamento</th>
          <th>Pago</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(detalle, index) in datosReporte.detalles" :key="index">
          <td>{{ detalle.id_orden }}</td>
          <td>{{ detalle.id_revision }}</td>
          <td>{{ detalle.producto }}</td>
          <td>{{ detalle.nombre }}</td>
          <td>{{ detalle.departamento }}</td>
          <td>{{ detalle.monto_pago }}</td>
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
      return this.$store.state.login.dataEmpresa.nombre || 'Nombre de Empresa no definido';
    },
    fechaReporte() {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}/${month}/${year}`;
    },
  },
};
</script>

<style scoped>
.report-container {
  font-family: Arial, sans-serif;
  color: #000;
}
.report-header {
  text-align: center;
  margin-bottom: 2rem;
}
.report-header h1, .report-header h2 {
  margin: 0;
}
.report-info {
  text-align: left;
  margin-top: 1.5rem;
  display: inline-block;
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
  padding: 8px;
  text-align: left;
}
.report-table th {
  background-color: #f2f2f2;
}
</style>
