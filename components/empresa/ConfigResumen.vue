<template>
  <b-card header-tag="header">
    <template #header>
      <h4 class="mb-0">Resumen de Configuración</h4>
    </template>

    <b-row>
      <b-col md="6">
        <h5 class="mb-3">👤 Datos del Administrador</h5>
        <b-list-group flush>
          <b-list-group-item><strong>Nombre:</strong> {{ adminData.nombre }}</b-list-group-item>
          <b-list-group-item><strong>Teléfono:</strong> {{ adminData.telefono }}</b-list-group-item>
        </b-list-group>

        <h5 class="mt-4 mb-3">🏢 Datos de la Empresa</h5>
        <b-list-group flush>
          <b-list-group-item><strong>Nombre:</strong> {{ empresaData.nombre }}</b-list-group-item>
          <b-list-group-item><strong>Registro Legal:</strong> {{ empresaData.numero_registro_legal }}</b-list-group-item>
          <b-list-group-item><strong>País:</strong> {{ empresaData.pais }}</b-list-group-item>
          <b-list-group-item><strong>Dirección:</strong> {{ empresaData.direccion }}</b-list-group-item>
          <b-list-group-item><strong>Teléfono:</strong> {{ empresaData.telefono }}</b-list-group-item>
          <b-list-group-item><strong>Email:</strong> {{ empresaData.email }}</b-list-group-item>
        </b-list-group>
      </b-col>

      <b-col md="6">
        <h5 class="mb-3">💵 Monedas Activas</h5>
        <b-table small :items="monedasData" :fields="[{key: 'mondeda_nombre', label: 'Nombre'}]" striped></b-table>

        <h5 class="mt-4 mb-3">🧾 Gastos Fijos</h5>
        <b-table small :items="gastosData" :fields="['nombre', 'monto', 'moneda']" striped></b-table>
      </b-col>
    </b-row>

    <hr />

    <b-row>
      <b-col>
        <h5 class="mt-2 mb-3">⏰ Horario Laboral</h5>
        <p v-if="horarioData.diasLaborales && horarioData.diasLaborales.length > 0">
          <strong>Días:</strong> {{ formatDiasLaborales(horarioData.diasLaborales) }} <br />
          <strong>Mañana:</strong> de {{ decimalToTime(horarioData.horaInicioManana) }} a {{ decimalToTime(horarioData.horaFinManana) }} <br />
          <strong>Tarde:</strong> de {{ decimalToTime(horarioData.horaInicioTarde) }} a {{ decimalToTime(horarioData.horaFinTarde) }}
        </p>
         <p v-else>No se ha definido un horario laboral.</p>
      </b-col>
    </b-row>

     <b-row>
      <b-col>
        <h5 class="mt-2 mb-3">🎨 Personalización</h5>
         <p>Opciones de visualización configuradas.</p>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
export default {
  name: "ConfigResumen",
  props: {
    adminData: { type: Object, required: true },
    empresaData: { type: Object, required: true },
    monedasData: { type: Array, required: true },
    gastosData: { type: Array, required: true },
    horarioData: { type: Object, required: true },
    personalizacionData: { type: Object, required: true }
  },
  methods: {
    decimalToTime(decimal) {
      if (decimal === null || decimal === undefined) return "00:00";
      const hours = Math.floor(decimal);
      const minutes = Math.round((decimal % 1) * 60);
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    },
    formatDiasLaborales(dias) {
      const diaMap = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb' };
      return dias.map(d => diaMap[d]).join(', ');
    }
  }
};
</script>
