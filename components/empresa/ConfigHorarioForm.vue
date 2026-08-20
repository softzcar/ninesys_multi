<template>
  <b-form @submit.prevent="save">
    <b-overlay :show="overlay">
      <horario-laboral-editor :initial-horario="data" @change="updateData" @validacion="updateValidacion" />
      
      <div class="text-right mt-4" v-if="showSaveButton">
        <b-button type="submit" variant="primary">Guardar Cambios</b-button>
      </div>
    </b-overlay>
  </b-form>
</template>

<script>
import HorarioLaboralEditor from "./HorarioLaboralEditor.vue";

export default {
  name: "ConfigHorarioForm",
  components: {
    HorarioLaboralEditor
  },
  props: {
    initialData: {
      type: Object,
      required: true
    },
    showSaveButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      overlay: false,
      data: { ...this.initialData },
      horarioValido: true,
      horarioMensajeError: null,
    };
  },
  methods: {
    updateData(newData) {
      this.data = newData;
    },
    updateValidacion({ valido, mensaje }) {
      this.horarioValido = valido;
      this.horarioMensajeError = mensaje;
    },
    async save() {
      if (!this.data || !this.data.diasLaborales || this.data.diasLaborales.length === 0) {
        this.$fire({
          title: "Datos Incompletos",
          html: "Debe configurar al menos un día laboral.",
          type: "warning",
        });
        return false;
      }

      if (!this.horarioValido) {
        this.$fire({
          title: "Horario en conflicto",
          html: this.horarioMensajeError || "Revise las horas de los turnos, hay un conflicto entre ellas.",
          type: "warning",
        });
        return false;
      }

      this.overlay = true;
      try {
        const employeeId = this.$store.state.login.dataUser.id_empleado;
        await this.$axios.post(`${this.$config.API}/configuracion/horario`, {
          id_empleado: employeeId,
          ...this.data
        });

        // Refrescar los datos de la store para que no queden desactualizados
        // tras guardar (antes, una recarga de página mostraba los valores
        // viejos aunque el backend ya tenía los nuevos guardados).
        await this.$store.dispatch("login/refreshData");

        this.$emit('saved', this.data);
        if (this.showSaveButton) {
            this.$fire({
                title: "Éxito",
                text: "Horario laboral actualizado correctamente.",
                type: "success",
            });
        }
        return true;
      } catch (err) {
        // Este endpoint responde los errores en la clave "error", no
        // "message" -- sin este fallback, el mensaje claro de conflicto de
        // horario devuelto por el backend nunca llegaba a mostrarse.
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudo guardar el horario laboral. <p>${err.response?.data?.error || err.response?.data?.message || err.message}</p>`,
          type: "error",
        });
        return false;
      } finally {
        this.overlay = false;
      }
    }
  },
  watch: {
    initialData: {
      handler(newVal) {
        this.data = { ...newVal };
      },
      deep: true
    }
  }
};
</script>
