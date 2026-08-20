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
      <small class="text-muted">Días en que la empresa abre, en cualquier turno. Cada turno abajo puede tener sus propios días activos (ej. Tarde sin Sábado).</small>
    </b-form-group>

    <b-alert :show="!!errorValidacion" variant="danger">
      {{ errorValidacion }}
    </b-alert>

    <hr />

    <b-row>
      <b-col md="4">
        <h5>Turno Mañana</h5>
        <b-form-group label="Hora de Inicio:">
          <b-form-input v-model="horaInicioMananaFormatted" type="time"></b-form-input>
        </b-form-group>
        <b-form-group label="Hora de Fin:">
          <b-form-input v-model="horaFinMananaFormatted" type="time"></b-form-input>
        </b-form-group>
        <b-form-group label="Días de este turno:">
          <b-form-checkbox-group
            v-model="horario.diasManana"
            :options="diasOptions"
            buttons
            button-variant="outline-secondary"
            size="sm"
          ></b-form-checkbox-group>
        </b-form-group>
      </b-col>
      <b-col md="4">
        <h5>Turno Tarde</h5>
        <b-form-group label="Hora de Inicio:">
          <b-form-input v-model="horaInicioTardeFormatted" type="time"></b-form-input>
        </b-form-group>
        <b-form-group label="Hora de Fin:">
          <b-form-input v-model="horaFinTardeFormatted" type="time"></b-form-input>
        </b-form-group>
        <b-form-group label="Días de este turno:">
          <b-form-checkbox-group
            v-model="horario.diasTarde"
            :options="diasOptions"
            buttons
            button-variant="outline-secondary"
            size="sm"
          ></b-form-checkbox-group>
        </b-form-group>
      </b-col>
      <b-col md="4">
        <h5>Turno Noche</h5>
        <small class="text-muted d-block mb-2">Opcional. Deje vacío si la empresa no maneja turno nocturno.</small>
        <b-form-group label="Hora de Inicio:">
          <b-form-input v-model="horaInicioNocheFormatted" type="time"></b-form-input>
        </b-form-group>
        <b-form-group label="Hora de Fin:">
          <b-form-input v-model="horaFinNocheFormatted" type="time"></b-form-input>
        </b-form-group>
        <b-form-group label="Días de este turno:">
          <b-form-checkbox-group
            v-model="horario.diasNoche"
            :options="diasOptions"
            buttons
            button-variant="outline-secondary"
            size="sm"
          ></b-form-checkbox-group>
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
    const base = this.initialHorario ? JSON.parse(JSON.stringify(this.initialHorario)) : {
      horaInicioManana: 8.5,
      horaFinManana: 12,
      horaInicioTarde: 13,
      horaFinTarde: 17.5,
      diasLaborales: [1, 2, 3, 4, 5], // L-V por defecto
    };

    // Retrocompatibilidad: un horario guardado antes de que existieran los
    // días por turno y el turno Noche no trae estas claves. Mañana/Tarde
    // heredan diasLaborales (así refleja el comportamiento actualmente
    // vigente para ese horario); Noche arranca vacío/sin horas, ya que es
    // un turno nuevo que nadie configuró todavía.
    if (!Array.isArray(base.diasManana)) base.diasManana = [...base.diasLaborales];
    if (!Array.isArray(base.diasTarde)) base.diasTarde = [...base.diasLaborales];
    if (!Array.isArray(base.diasNoche)) base.diasNoche = [];
    if (base.horaInicioNoche === undefined) base.horaInicioNoche = null;
    if (base.horaFinNoche === undefined) base.horaFinNoche = null;

    return {
      horario: base,
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
    horaInicioNocheFormatted: {
      // Turno opcional: string vacío ("") -> null, no 0 (que sería 00:00).
      get() { return this.horario.horaInicioNoche === null ? "" : this.decimalToTime(this.horario.horaInicioNoche); },
      set(newValue) { this.horario.horaInicioNoche = newValue ? this.timeToDecimal(newValue) : null; },
    },
    horaFinNocheFormatted: {
      get() { return this.horario.horaFinNoche === null ? "" : this.decimalToTime(this.horario.horaFinNoche); },
      set(newValue) { this.horario.horaFinNoche = newValue ? this.timeToDecimal(newValue) : null; },
    },
    // Mismo algoritmo que el backend (validarHorarioLaboral en config.php):
    // cada turno con horas definidas debe tener fin > inicio, y ningún par
    // de turnos activos puede solaparse en su rango horario. El backend
    // sigue siendo la autoridad final -- esto es solo para feedback
    // inmediato al usuario, sin esperar el viaje de ida y vuelta al servidor.
    errorValidacion() {
      const turnos = [
        { nombre: "Mañana", inicio: this.horario.horaInicioManana, fin: this.horario.horaFinManana },
        { nombre: "Tarde", inicio: this.horario.horaInicioTarde, fin: this.horario.horaFinTarde },
        { nombre: "Noche", inicio: this.horario.horaInicioNoche, fin: this.horario.horaFinNoche },
      ];

      const activos = [];
      for (const turno of turnos) {
        if (turno.inicio === null || turno.inicio === undefined || turno.fin === null || turno.fin === undefined) {
          continue; // turno no configurado, no participa en la validación
        }
        if (turno.fin <= turno.inicio) {
          return `El turno "${turno.nombre}" tiene la hora de fin (${this.formatearHoraAmPm(turno.fin)}) antes o igual a la hora de inicio (${this.formatearHoraAmPm(turno.inicio)}). Revise si seleccionó a.m./p.m. correctamente.`;
        }
        activos.push(turno);
      }

      activos.sort((a, b) => a.inicio - b.inicio);
      for (let i = 0; i < activos.length - 1; i++) {
        const anterior = activos[i];
        const siguiente = activos[i + 1];
        if (siguiente.inicio < anterior.fin) {
          return `El turno "${siguiente.nombre}" (${this.formatearHoraAmPm(siguiente.inicio)} - ${this.formatearHoraAmPm(siguiente.fin)}) se solapa con el turno "${anterior.nombre}" (${this.formatearHoraAmPm(anterior.inicio)} - ${this.formatearHoraAmPm(anterior.fin)}). Revise si seleccionó a.m./p.m. correctamente.`;
        }
      }

      return null;
    },
  },
    watch: {
      horario: {
        handler(newValue) {
          // Ordenar los arrays de días para mantener la consistencia -- sin
          // mutar en el sitio: .sort() en el propio array observado siempre
          // notifica a Vue 2 (aunque el orden no cambie), así que sobre un
          // watcher "deep" en el mismo objeto esto provocaba un bucle
          // infinito (bug real 2026-08-06, confirmado en consola con
          // decenas de miles de disparos). Solo reasignar si el orden
          // realmente cambió. Mismo criterio aplicado a los 3 arrays nuevos
          // de días por turno.
          const ordenarSiCambio = (arr) => {
            const ordenado = [...arr].sort((a, b) => a - b);
            const yaOrdenado = arr.length === ordenado.length && arr.every((v, i) => v === ordenado[i]);
            return yaOrdenado ? arr : ordenado;
          };
          newValue.diasLaborales = ordenarSiCambio(newValue.diasLaborales);
          newValue.diasManana = ordenarSiCambio(newValue.diasManana);
          newValue.diasTarde = ordenarSiCambio(newValue.diasTarde);
          newValue.diasNoche = ordenarSiCambio(newValue.diasNoche);

          this.$emit("change", newValue);
          this.$emit("validacion", { valido: !this.errorValidacion, mensaje: this.errorValidacion });
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
    formatearHoraAmPm(decimal) {
      let horas24 = Math.floor(decimal);
      let minutos = Math.round((decimal % 1) * 60);
      if (minutos === 60) { minutos = 0; horas24++; }
      const periodo = horas24 >= 12 ? "p.m." : "a.m.";
      let horas12 = horas24 % 12;
      if (horas12 === 0) horas12 = 12;
      return `${String(horas12).padStart(2, "0")}:${String(minutos).padStart(2, "0")} ${periodo}`;
    },
  },
  mounted() {
    // Emitir el estado inicial al cargar
    this.$emit("change", this.horario);
    this.$emit("validacion", { valido: !this.errorValidacion, mensaje: this.errorValidacion });
  },
};
</script>
