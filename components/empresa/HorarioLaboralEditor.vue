<template>
  <div>
    <b-form-group label="Días Laborales:">
      <b-form-checkbox-group
        v-model="horario.diasLaborales"
        :options="diasOptions"
        buttons
        button-variant="outline-primary"
        size="md"
      ></b-form-checkbox-group>
    </b-form-group>

    <hr />

    <b-row>
      <b-col md="6">
        <h5>Turno Mañana</h5>
        <b-form-group label="Hora de Inicio:">
          <b-form-input v-model="horaInicioMananaFormatted" type="time"></b-form-input>
        </b-form-group>
        <b-form-group label="Hora de Fin:">
          <b-form-input v-model="horaFinMananaFormatted" type="time"></b-form-input>
        </b-form-group>
      </b-col>
      <b-col md="6">
        <h5>Turno Tarde</h5>
        <b-form-group label="Hora de Inicio:">
          <b-form-input v-model="horaInicioTardeFormatted" type="time"></b-form-input>
        </b-form-group>
        <b-form-group label="Hora de Fin:">
          <b-form-input v-model="horaFinTardeFormatted" type="time"></b-form-input>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: "HorarioLaboralEditor",
  props: {
    initialHorario: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      horario: this.initialHorario ? JSON.parse(JSON.stringify(this.initialHorario)) : {
        horaInicioManana: 8.5,
        horaFinManana: 12,
        horaInicioTarde: 13,
        horaFinTarde: 17.5,
        diasLaborales: [1, 2, 3, 4, 5], // L-V por defecto
      },
      diasOptions: [
        { text: "Lun", value: 1 },
        { text: "Mar", value: 2 },
        { text: "Mié", value: 3 },
        { text: "Jue", value: 4 },
        { text: "Vie", value: 5 },
        { text: "Sáb", value: 6 },
        { text: "Dom", value: 0 },
      ],
    };
  },
  computed: {
    // Propiedades computadas con getter y setter para la conversión de tiempo
    horaInicioMananaFormatted: {
      get() { return this.decimalToTime(this.horario.horaInicioManana); },
      set(newValue) { this.horario.horaInicioManana = this.timeToDecimal(newValue); },
    },
    horaFinMananaFormatted: {
      get() { return this.decimalToTime(this.horario.horaFinManana); },
      set(newValue) { this.horario.horaFinManana = this.timeToDecimal(newValue); },
    },
    horaInicioTardeFormatted: {
      get() { return this.decimalToTime(this.horario.horaInicioTarde); },
      set(newValue) { this.horario.horaInicioTarde = this.timeToDecimal(newValue); },
    },
    horaFinTardeFormatted: {
      get() { return this.decimalToTime(this.horario.horaFinTarde); },
      set(newValue) { this.horario.horaFinTarde = this.timeToDecimal(newValue); },
    },
  },
    watch: {
      horario: {
        handler(newValue) {
          // Ordenar siempre el array de días para mantener la consistencia
          newValue.diasLaborales.sort((a, b) => a - b);
          console.log("JSON de horario actualizado:", JSON.stringify(newValue, null, 2));
          this.$emit("change", newValue);
        },
        deep: true,
      },
    },  methods: {
    timeToDecimal(time) {
      if (!time) return 0;
      const [hours, minutes] = time.split(":").map(Number);
      return hours + minutes / 60;
    },
    decimalToTime(decimal) {
      if (decimal === null || decimal === undefined) return "00:00";
      const hours = Math.floor(decimal);
      const minutes = Math.round((decimal % 1) * 60);
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    },
  },
  mounted() {
    // Emitir el estado inicial al cargar
    this.$emit("change", this.horario);
  },
};
</script>
