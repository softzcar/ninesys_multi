<template>
  <div class="report-container">
    <div class="receipt-box">
      <!-- Encabezado del Recibo -->
      <div class="report-header">
        <h1>RECIBO DE PAGO</h1>
        <h2>{{ nombreEmpresa }}</h2>
        <p class="date">Fecha: {{ datosReporte.fechaPago }}</p>
      </div>

      <!-- Información del Empleado -->
      <div class="employee-info">
        <div class="info-row">
          <span class="label">Empleado:</span>
          <span class="value">{{ datosReporte.nombreEmpleado }}</span>
        </div>
        <!-- <div class="info-row">
          <span class="label">Cargo/Rol:</span>
          <span class="value">{{ datosReporte.tipoEmpleado || 'Vendedor' }}</span>
        </div> -->
      </div>

      <hr class="divider">

      <!-- Resumen de Pagos (Ingresos y Deducciones) -->
      <div class="payment-summary">
        <div class="column earnings">
          <h3>INGRESOS</h3>
          <div class="item-row">
            <span>Salario Base</span>
            <span>$ {{ formatNumber(datosReporte.salarioBase) }}</span>
          </div>
          <div class="item-row">
            <span>Comisiones</span>
             <span>$ {{ formatNumber(datosReporte.comision) }}</span>
          </div>
          
          <!-- Bonos -->
          <div v-for="(bono, i) in datosReporte.bonos" :key="'b'+i" class="item-row">
            <span>{{ bono.descripcion || 'Bono' }}</span>
            <span>$ {{ formatNumber(bono.monto) }}</span>
          </div>

          <div class="item-row total-section">
            <strong>Total Ingresos</strong>
            <strong>$ {{ formatNumber(totalIngresos) }}</strong>
          </div>
        </div>

        <div class="column deductions">
          <h3>DEDUCCIONES</h3>
          <!-- Descuentos -->
          <div v-for="(desc, i) in datosReporte.descuentos" :key="'d'+i" class="item-row">
            <span>{{ desc.descripcion || 'Descuento' }}</span>
            <span>$ {{ formatNumber(desc.monto) }}</span>
          </div>

          <div v-if="(!datosReporte.descuentos || datosReporte.descuentos.length === 0)" class="item-row text-muted">
             <span>Sin deducciones</span>
             <span>$ 0.00</span>
          </div>

          <div class="item-row total-section">
            <strong>Total Deducciones</strong>
            <strong>$ {{ formatNumber(totalDeducciones) }}</strong>
          </div>
        </div>
      </div>

      <hr class="divider">

      <!-- Total Neto -->
      <div class="net-pay">
        <span class="label">TOTAL A PAGAR</span>
        <span class="amount">$ {{ formatNumber(datosReporte.totalPagar) }}</span>
      </div>

      <!-- Firmas -->
      <div class="signatures">
        <div class="sign-box">
          <div class="line"></div>
          <p>Recibí Conforme</p>
          <p class="name">{{ datosReporte.nombreEmpleado }}</p>
        </div>
        <div class="sign-box">
          <div class="line"></div>
          <p>Autorizado Por</p>
          <p class="name">{{ nombreEmpresa }}</p>
        </div>
      </div>
    </div>

    <!-- Salto de página para detalles si es necesario, o mostrar abajo -->
    <!-- <div class="page-break"></div> -->

    <!-- Detalles Adicionales (Tabla de Ordenes) - ELIMINADO POR SOLICITUD DEL USUARIO -->
    <!-- <div class="details-section">
      <h3>Detalle de Comisiones / Ordenes</h3>
      <table class="report-table">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Vendedor</th>
            <th>Comisión</th>
            <th>Monto Pagado</th>
            <th>Fecha Pago</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(detalle, index) in datosReporte.detalles" :key="index">
            <td>{{ detalle.id_orden }}</td>
            <td>{{ detalle.nombre }}</td>
            <td>{{ detalle.comision }}</td>
            <td>{{ formatNumber(detalle.pago) }}</td>
            <td>{{ detalle.fecha_de_pago }}</td>
          </tr>
        </tbody>
      </table>
    </div> -->
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
      return this.$store.state.login.dataEmpresa.nombre || 'Nombre de Empresa';
    },
    totalIngresos() {
       const s = parseFloat(this.datosReporte.salarioBase) || 0;
       const c = parseFloat(this.datosReporte.comision) || 0;
       const b = (this.datosReporte.bonos || []).reduce((acc, el) => acc + (parseFloat(el.monto) || 0), 0);
       return s + c + b;
    },
    totalDeducciones() {
       const d = (this.datosReporte.descuentos || []).reduce((acc, el) => acc + (parseFloat(el.monto) || 0), 0);
       return d;
    }
  },
  methods: {
    formatNumber(value) {
      return parseFloat(value || 0).toFixed(2);
    }
  }
};
</script>

<style scoped>
.report-container {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;
  width: 100%;
  padding: 20px;
  background: white;
}

.receipt-box {
  border: 1px solid #ddd;
  padding: 20px;
  margin-bottom: 20px;
}

.report-header {
  text-align: center;
  margin-bottom: 20px;
}

.report-header h1 {
  font-size: 18px;
  margin: 0;
  text-transform: uppercase;
  color: #444;
}

.report-header h2 {
  font-size: 14px;
  margin: 5px 0;
  font-weight: normal;
}

.date {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.employee-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 5px;
}

.info-row .label {
  width: 100px;
  font-weight: bold;
}

.divider {
  border: 0;
  border-top: 1px solid #eee;
  margin: 15px 0;
}

.payment-summary {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.column {
  flex: 1;
}

.column h3 {
  font-size: 12px;
  text-transform: uppercase;
  background: #f9f9f9;
  padding: 5px;
  margin-top: 0;
  border-bottom: 1px solid #eee;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.text-muted {
  color: #999;
  font-style: italic;
}

.total-section {
  border-top: 1px solid #eee;
  margin-top: 10px;
  padding-top: 10px;
  font-weight: bold;
}

.net-pay {
  background: #f0f0f0;
  padding: 10px;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
}

.net-pay .label {
  margin-right: 20px;
}

.signatures {
  margin-top: 50px;
  display: flex;
  justify-content: space-around;
}

.sign-box {
  text-align: center;
  width: 40%;
}

.sign-box .line {
  border-top: 1px solid #000;
  margin-bottom: 5px;
}

.sign-box p {
  margin: 2px 0;
  font-size: 12px;
}

.sign-box .name {
  font-weight: bold;
}

/* Tabla de detalles */
.details-section {
  margin-top: 30px;
}

.details-section h3 {
  font-size: 14px;
margin-bottom: 10px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.report-table th, .report-table td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: left;
}

.report-table th {
  background-color: #f2f2f2;
}

@media print {
  .receipt-box {
    border: none;
    padding: 0;
  }
  .page-break {
    page-break-before: always;
  }
}
</style>
