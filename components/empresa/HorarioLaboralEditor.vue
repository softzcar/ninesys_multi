<template>
  <div>
    <b-form-group label="Días Laborales:">
      <div>
        <b-badge
          v-for="opt in diasLaboralesResumen"
          :key="opt.value"
          variant="primary"
          class="mr-1"
        >{{ opt.text }}</b-badge>
        <span v-if="diasLaboralesResumen.length === 0" class="text-muted">Sin días activos en ningún turno.</span>
      </div>
      <small class="text-muted">Resumen de los días en que la empresa abre en al menos un turno (se calcula solo, según lo que marque en cada turno abajo).</small>
    </b-form-group>

    <b-alert :show="!!errorValidacion" variant="danger">
      {{ errorValidacion }}
    </b-alert>

    <hr />

    <b-row>
      <b-col md="4">
        <h5>Turno Mañana</h5>
        <b-form-group label="Horario General:">
          <b-row>
            <b-col>
              <small class="text-muted">Hora de Inicio</small>
              <b-form-input v-model="horaInicioMananaFormatted" type="time"></b-form-input>
            </b-col>
            <b-col>
              <small class="text-muted">Hora de Fin</small>
              <b-form-input v-model="horaFinMananaFormatted" type="time"></b-form-input>
            </b-col>
          </b-row>
          <small class="text-muted">Aplica a todo día activo que no tenga un horario propio abajo.</small>
        </b-form-group>

        <b-form-group label="Días de este turno:">
          <table class="table table-sm table-borderless mb-1">
            <tbody>
              <tr v-for="opt in diasOptions" :key="opt.value">
                <td class="align-middle" style="width: 4.5rem;">
                  <b-form-checkbox
                    :checked="diaActivo('Manana', opt.value)"
                    @change="toggleDiaActivo('Manana', opt.value)"
                  >{{ opt.text }}</b-form-checkbox>
                </td>
                <td>
                  <b-form-input
                    type="time"
                    size="sm"
                    :disabled="!diaActivo('Manana', opt.value)"
                    :value="decimalToTime(horaEfectivaDia('Manana', opt.value, 'Inicio'))"
                    @change="actualizarOverride('Manana', opt.value, 'Inicio', $event)"
                  ></b-form-input>
                </td>
                <td>
                  <b-form-input
                    type="time"
                    size="sm"
                    :disabled="!diaActivo('Manana', opt.value)"
                    :value="decimalToTime(horaEfectivaDia('Manana', opt.value, 'Fin'))"
                    @change="actualizarOverride('Manana', opt.value, 'Fin', $event)"
                  ></b-form-input>
                </td>
                <td class="align-middle">
                  <small v-if="tieneOverride('Manana', opt.value)" class="text-warning">excepción</small>
                </td>
              </tr>
            </tbody>
          </table>
          <b-button size="sm" variant="outline-secondary" @click="aplicarHorarioGeneralATodos('Manana')">
            Aplicar horario general a todos los días
          </b-button>
        </b-form-group>
      </b-col>

      <b-col md="4">
        <h5>Turno Tarde</h5>
        <b-form-group label="Horario General:">
          <b-row>
            <b-col>
              <small class="text-muted">Hora de Inicio</small>
              <b-form-input v-model="horaInicioTardeFormatted" type="time"></b-form-input>
            </b-col>
            <b-col>
              <small class="text-muted">Hora de Fin</small>
              <b-form-input v-model="horaFinTardeFormatted" type="time"></b-form-input>
            </b-col>
          </b-row>
          <small class="text-muted">Aplica a todo día activo que no tenga un horario propio abajo.</small>
        </b-form-group>

        <b-form-group label="Días de este turno:">
          <table class="table table-sm table-borderless mb-1">
            <tbody>
              <tr v-for="opt in diasOptions" :key="opt.value">
                <td class="align-middle" style="width: 4.5rem;">
                  <b-form-checkbox
                    :checked="diaActivo('Tarde', opt.value)"
                    @change="toggleDiaActivo('Tarde', opt.value)"
                  >{{ opt.text }}</b-form-checkbox>
                </td>
                <td>
                  <b-form-input
                    type="time"
                    size="sm"
                    :disabled="!diaActivo('Tarde', opt.value)"
                    :value="decimalToTime(horaEfectivaDia('Tarde', opt.value, 'Inicio'))"
                    @change="actualizarOverride('Tarde', opt.value, 'Inicio', $event)"
                  ></b-form-input>
                </td>
                <td>
                  <b-form-input
                    type="time"
                    size="sm"
                    :disabled="!diaActivo('Tarde', opt.value)"
                    :value="decimalToTime(horaEfectivaDia('Tarde', opt.value, 'Fin'))"
                    @change="actualizarOverride('Tarde', opt.value, 'Fin', $event)"
                  ></b-form-input>
                </td>
                <td class="align-middle">
                  <small v-if="tieneOverride('Tarde', opt.value)" class="text-warning">excepción</small>
                </td>
              </tr>
            </tbody>
          </table>
          <b-button size="sm" variant="outline-secondary" @click="aplicarHorarioGeneralATodos('Tarde')">
            Aplicar horario general a todos los días
          </b-button>
        </b-form-group>
      </b-col>

      <b-col md="4">
        <h5>Turno Noche</h5>
        <small class="text-muted d-block mb-2">Opcional. Deje vacío si la empresa no maneja turno nocturno.</small>
        <b-form-group label="Horario General:">
          <b-row>
            <b-col>
              <small class="text-muted">Hora de Inicio</small>
              <b-form-input v-model="horaInicioNocheFormatted" type="time"></b-form-input>
            </b-col>
            <b-col>
              <small class="text-muted">Hora de Fin</small>
              <b-form-input v-model="horaFinNocheFormatted" type="time"></b-form-input>
            </b-col>
          </b-row>
          <small class="text-muted">Aplica a todo día activo que no tenga un horario propio abajo.</small>
        </b-form-group>

        <b-form-group label="Días de este turno:">
          <table class="table table-sm table-borderless mb-1">
            <tbody>
              <tr v-for="opt in diasOptions" :key="opt.value">
                <td class="align-middle" style="width: 4.5rem;">
                  <b-form-checkbox
                    :checked="diaActivo('Noche', opt.value)"
                    :disabled="horario.horaInicioNoche === null || horario.horaFinNoche === null"
                    @change="toggleDiaActivo('Noche', opt.value)"
                  >{{ opt.text }}</b-form-checkbox>
                </td>
                <td>
                  <b-form-input
                    type="time"
                    size="sm"
                    :disabled="!diaActivo('Noche', opt.value)"
                    :value="decimalToTime(horaEfectivaDia('Noche', opt.value, 'Inicio'))"
                    @change="actualizarOverride('Noche', opt.value, 'Inicio', $event)"
                  ></b-form-input>
                </td>
                <td>
                  <b-form-input
                    type="time"
                    size="sm"
                    :disabled="!diaActivo('Noche', opt.value)"
                    :value="decimalToTime(horaEfectivaDia('Noche', opt.value, 'Fin'))"
                    @change="actualizarOverride('Noche', opt.value, 'Fin', $event)"
                  ></b-form-input>
                </td>
                <td class="align-middle">
                  <small v-if="tieneOverride('Noche', opt.value)" class="text-warning">excepción</small>
                </td>
              </tr>
            </tbody>
          </table>
          <b-button size="sm" variant="outline-secondary" @click="aplicarHorarioGeneralATodos('Noche')">
            Aplicar horario general a todos los días
          </b-button>
        </b-form-group>
      </b-col>
    </b-row>

    <b-alert show variant="warning" class="py-2 px-3 small mt-3 mb-0">
      El turno Noche solo admite horarios <strong>hasta la medianoche</strong> (ej. 06:00 p.m. a 11:30 p.m.). No es posible configurar un horario que cruce hacia la madrugada del día siguiente (ej. 10:00 p.m. a 06:00 a.m.).
    </b-alert>
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
    // días por turno, el turno Noche, o las excepciones por día no trae
    // estas claves. Mañana/Tarde heredan diasLaborales (así refleja el
    // comportamiento actualmente vigente para ese horario); Noche arranca
    // vacío/sin horas; overridesX arranca vacío (ningún horario viejo pudo
    // haber tenido excepciones, es una funcionalidad nueva).
    if (!Array.isArray(base.diasManana)) base.diasManana = [...base.diasLaborales];
    if (!Array.isArray(base.diasTarde)) base.diasTarde = [...base.diasLaborales];
    if (!Array.isArray(base.diasNoche)) base.diasNoche = [];
    if (base.horaInicioNoche === undefined) base.horaInicioNoche = null;
    if (base.horaFinNoche === undefined) base.horaFinNoche = null;
    if (!base.overridesManana || typeof base.overridesManana !== "object") base.overridesManana = {};
    if (!base.overridesTarde || typeof base.overridesTarde !== "object") base.overridesTarde = {};
    if (!base.overridesNoche || typeof base.overridesNoche !== "object") base.overridesNoche = {};

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
      nombresDiasSemana: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
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
    // "Días Laborales" ya no se edita directo -- es la unión de los días
    // activos en cualquiera de los 3 turnos, para que el usuario no tenga
    // que mantener sincronizados 4 selectores de días distintos (el general
    // + 3 por turno); solo queda uno editable por turno, la tabla de abajo.
    diasLaboralesResumen() {
      const activos = new Set([
        ...(this.horario.diasManana || []),
        ...(this.horario.diasTarde || []),
        ...(this.horario.diasNoche || []),
      ]);
      return this.diasOptions.filter((opt) => activos.has(opt.value));
    },
    // Mismo algoritmo que el backend (validarHorarioLaboral en config.php),
    // pero corrido día por día: desde que un turno puede tener horas
    // distintas en un día puntual (overridesX), el solapamiento entre
    // turnos también puede ocurrir solo un día específico, sin afectar el
    // resto de la semana. El backend sigue siendo la autoridad final --
    // esto es solo para feedback inmediato al usuario.
    errorValidacion() {
      const nombresTurno = { Manana: "Mañana", Tarde: "Tarde", Noche: "Noche" };

      for (let dia = 0; dia <= 6; dia++) {
        const activos = [];
        for (const turno of ["Manana", "Tarde", "Noche"]) {
          const rango = this.resolverHorasEfectivasDia(turno, dia);
          if (!rango) continue;
          if (rango.fin <= rango.inicio) {
            return `El turno "${nombresTurno[turno]}" el ${this.nombresDiasSemana[dia]} tiene la hora de fin (${this.formatearHoraAmPm(rango.fin)}) antes o igual a la hora de inicio (${this.formatearHoraAmPm(rango.inicio)}). Revise si seleccionó a.m./p.m. correctamente.`;
          }
          activos.push({ nombre: nombresTurno[turno], ...rango });
        }

        activos.sort((a, b) => a.inicio - b.inicio);
        for (let i = 0; i < activos.length - 1; i++) {
          const anterior = activos[i];
          const siguiente = activos[i + 1];
          if (siguiente.inicio < anterior.fin) {
            return `El turno "${siguiente.nombre}" (${this.formatearHoraAmPm(siguiente.inicio)} - ${this.formatearHoraAmPm(siguiente.fin)}) se solapa con el turno "${anterior.nombre}" (${this.formatearHoraAmPm(anterior.inicio)} - ${this.formatearHoraAmPm(anterior.fin)}) el ${this.nombresDiasSemana[dia]}. Revise si seleccionó a.m./p.m. correctamente.`;
          }
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
          // realmente cambió.
          const ordenarSiCambio = (arr) => {
            const ordenado = [...arr].sort((a, b) => a - b);
            const yaOrdenado = arr.length === ordenado.length && arr.every((v, i) => v === ordenado[i]);
            return yaOrdenado ? arr : ordenado;
          };
          newValue.diasManana = ordenarSiCambio(newValue.diasManana);
          newValue.diasTarde = ordenarSiCambio(newValue.diasTarde);
          newValue.diasNoche = ordenarSiCambio(newValue.diasNoche);

          // diasLaborales ya no se edita directo -- se deriva de los 3
          // anteriores en cada cambio, para que el backend (que todavía la
          // usa como respaldo de horarios sin diasManana/Tarde/Noche
          // propios) siempre reciba un valor consistente con lo que
          // realmente se configuró en la tabla de cada turno.
          const union = [...new Set([...newValue.diasManana, ...newValue.diasTarde, ...newValue.diasNoche])].sort((a, b) => a - b);
          newValue.diasLaborales = union;

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
    diaActivo(turno, dia) {
      return (this.horario[`dias${turno}`] || []).includes(dia);
    },
    toggleDiaActivo(turno, dia) {
      const clave = `dias${turno}`;
      const actuales = this.horario[clave] || [];
      if (actuales.includes(dia)) {
        this.horario[clave] = actuales.filter((d) => d !== dia);
        // Al desactivar el día se descarta cualquier excepción propia -- si
        // se reactiva luego, vuelve a mostrar el horario general en vez de
        // resucitar una excepción vieja que el usuario ya no recuerda haber
        // configurado.
        this.eliminarOverride(turno, dia);
      } else {
        this.horario[clave] = [...actuales, dia];
      }
    },
    tieneOverride(turno, dia) {
      const overrides = this.horario[`overrides${turno}`] || {};
      return !!overrides[dia];
    },
    // Horas efectivas de un turno en un día: si ese día tiene una excepción
    // (overridesX), se usan esas horas; si no, la hora general del turno.
    // Misma regla que resolverHorasEfectivasDia() en config.php (backend).
    horaEfectivaDia(turno, dia, campo) {
      const overrides = this.horario[`overrides${turno}`] || {};
      const ov = overrides[dia];
      if (ov && ov[`hora${campo}`] !== undefined && ov[`hora${campo}`] !== null) {
        return ov[`hora${campo}`];
      }
      return this.horario[`hora${campo}${turno}`];
    },
    // Versión completa (inicio + fin) usada por la validación -- devuelve
    // null si el turno no aplica ese día (día no activo, o turno sin horas
    // generales configuradas y sin excepción propia).
    resolverHorasEfectivasDia(turno, dia) {
      if (!this.diaActivo(turno, dia)) return null;
      const inicio = this.horaEfectivaDia(turno, dia, "Inicio");
      const fin = this.horaEfectivaDia(turno, dia, "Fin");
      if (inicio === null || inicio === undefined || fin === null || fin === undefined) return null;
      return { inicio, fin };
    },
    actualizarOverride(turno, dia, campo, timeStr) {
      const decimal = this.timeToDecimal(timeStr);
      const clave = `overrides${turno}`;
      const actuales = this.horario[clave] || {};
      const actual = actuales[dia] || {
        horaInicio: this.horario[`horaInicio${turno}`],
        horaFin: this.horario[`horaFin${turno}`],
      };
      const nuevo = { ...actual, [`hora${campo}`]: decimal };
      this.horario[clave] = { ...actuales, [dia]: nuevo };
    },
    eliminarOverride(turno, dia) {
      const clave = `overrides${turno}`;
      const actuales = this.horario[clave] || {};
      if (actuales[dia] === undefined) return;
      const copia = { ...actuales };
      delete copia[dia];
      this.horario[clave] = copia;
    },
    aplicarHorarioGeneralATodos(turno) {
      this.horario[`overrides${turno}`] = {};
    },
  },
  mounted() {
    // Emitir el estado inicial al cargar
    this.$emit("change", this.horario);
    this.$emit("validacion", { valido: !this.errorValidacion, mensaje: this.errorValidacion });
  },
};
</script>
