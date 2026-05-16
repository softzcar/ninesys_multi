<template>
  <b-form @submit.prevent="save">
    <b-overlay :show="overlay">
      <gastos-manager :monedas="monedas" :initial-gastos="data" @change="updateData" />
      
      <div class="text-right mt-4" v-if="showSaveButton">
        <b-button type="submit" variant="primary">Guardar Cambios</b-button>
      </div>
    </b-overlay>
  </b-form>
</template>

<script>
import GastosManager from "./GastosManager.vue";

export default {
  name: "ConfigGastosForm",
  components: {
    GastosManager
  },
  props: {
    initialData: {
      type: Array,
      required: true
    },
    monedas: {
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
      this.overlay = true;
      try {
        const employeeId = this.$store.state.login.dataUser.id_empleado;
        await this.$axios.post(`${this.$config.API}/configuracion/gastos`, {
          id_empleado: employeeId,
          gastos: this.data || []
        });

        this.$emit('saved', this.data);
        if (this.showSaveButton) {
            this.$fire({
                title: "Éxito",
                text: "Gastos fijos actualizados correctamente.",
                type: "success",
            });
        }
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudieron guardar los gastos fijos. <p>${err.response?.data?.message || err.message}</p>`,
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
