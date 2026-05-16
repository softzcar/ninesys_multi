<template>
  <b-form @submit.prevent="save">
    <b-overlay :show="overlay">
      <b-row class="justify-content-center">
        <b-col md="12">
          <div
            v-for="(item, index) in personalizacionItems"
            :key="item.key"
            class="mb-4"
          >
            <b-form-group
              :label="item.label"
              class="d-flex justify-content-between align-items-center"
            >
              <b-form-checkbox
                v-model="data[item.key]"
                switch
                size="lg"
              ></b-form-checkbox>
            </b-form-group>

            <hr v-if="index < personalizacionItems.length - 1" class="my-3" />
          </div>

          <div class="text-right mt-4" v-if="showSaveButton">
            <b-button type="submit" variant="primary">Guardar Cambios</b-button>
          </div>
        </b-col>
      </b-row>
    </b-overlay>
  </b-form>
</template>

<script>
export default {
  name: "ConfigPersonalizacionForm",
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
      data: { ...this.initialData }
    };
  },
  computed: {
    personalizacionItems() {
      return Object.keys(this.data).map(key => ({
        key,
        value: this.data[key],
        label: this.formatSwitchLabel(key)
      }));
    }
  },
  methods: {
    formatSwitchLabel(key) {
      const labelMap = {
        'sys_mostrar_detalle_terminar_indicidual': 'Muestra el formulario de ingresar detalle de la terminación del item individual en el módulo de empleados al momento de terminar una tarea individual',
        'sys_comision_de_costura': 'Define si a costura se le calcula comisión por el porcentaje en la tabla empleados o el porcentaje en la tabla productos'
      };

      if (labelMap[key]) {
        return labelMap[key];
      }

      let text = key.replace(/_/g, " ").replace("sys ", "");
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    async save() {
      this.overlay = true;
      try {
        const employeeId = this.$store.state.login.dataUser.id_empleado;
        await this.$axios.post(`${this.$config.API}/configuracion/personalizacion`, {
          id_empleado: employeeId,
          personalizacion: this.data
        });

        this.$emit('saved', this.data);
        if (this.showSaveButton) {
            this.$fire({
                title: "Éxito",
                text: "Opciones de personalización actualizadas correctamente.",
                type: "success",
            });
        }
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudieron guardar las opciones de personalización. <p>${err.response?.data?.message || err.message}</p>`,
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
