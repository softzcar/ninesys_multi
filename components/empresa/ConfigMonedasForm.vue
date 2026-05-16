<template>
  <b-form @submit.prevent="save">
    <b-overlay :show="overlay">
      <monedas-manager :initial-currencies="data" @change="updateData" />
      
      <div class="text-right mt-4" v-if="showSaveButton">
        <b-button type="submit" variant="primary">Guardar Cambios</b-button>
      </div>
    </b-overlay>
  </b-form>
</template>

<script>
import MonedasManager from "./MonedasManager.vue";

export default {
  name: "ConfigMonedasForm",
  components: {
    MonedasManager
  },
  props: {
    initialData: {
      type: Array,
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
      data: [...this.initialData]
    };
  },
  methods: {
    updateData(newData) {
      this.data = newData;
    },
    async save() {
      if (!this.data || this.data.length === 0) {
        this.$fire({
          title: "Datos Incompletos",
          html: "Debe seleccionar al menos una moneda.",
          type: "warning",
        });
        return false;
      }

      this.overlay = true;
      try {
        const employeeId = this.$store.state.login.dataUser.id_empleado;
        await this.$axios.post(`${this.$config.API}/configuracion/monedas`, {
          id_empleado: employeeId,
          monedas: this.data
        });

        this.$emit('saved', this.data);
        if (this.showSaveButton) {
            this.$fire({
                title: "Éxito",
                text: "Monedas actualizadas correctamente.",
                type: "success",
            });
        }
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudieron guardar las monedas. <p>${err.response?.data?.message || err.message}</p>`,
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
        this.data = [...newVal];
      },
      deep: true
    }
  }
};
</script>
