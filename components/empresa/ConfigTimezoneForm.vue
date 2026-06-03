<template>
  <b-form @submit.prevent="save">
    <b-overlay :show="overlay">
      <b-row class="justify-content-center">
        <b-col md="12">
          <div class="p-3 mb-4 rounded bg-white shadow-sm border border-light">
            <h5 class="text-primary mb-3">
              <i class="ti ti-world mr-2"></i>Zona Horaria del Sistema
            </h5>
            <p class="text-muted small">
              Seleccione la zona horaria correspondiente a la ubicación geográfica de su empresa. Esto asegurará que los cálculos de tiempos de fabricación, la eficiencia laboral y las marcas de tiempo se registren de manera correcta en la base de datos.
            </p>
            
            <b-form-group label="Zona Horaria:" label-for="empresa-timezone">
              <b-form-select
                id="empresa-timezone"
                v-model="data.timezone"
                :options="timezoneOptions"
                required
                class="form-control-lg"
              ></b-form-select>
            </b-form-group>
          </div>

          <div class="text-right mt-4" v-if="showSaveButton">
            <b-button type="submit" variant="primary" size="lg" class="px-4">
              <i class="ti ti-device-floppy mr-2"></i>Guardar Cambios
            </b-button>
          </div>
        </b-col>
      </b-row>
    </b-overlay>
  </b-form>
</template>

<script>
export default {
  name: "ConfigTimezoneForm",
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
      data: {
        timezone: this.initialData?.timezone || "America/Caracas"
      },
      timezoneOptions: [
        { value: "America/Caracas", text: "Venezuela (America/Caracas) [GMT-4]" },
        { value: "America/Bogota", text: "Colombia (America/Bogota) [GMT-5]" },
        { value: "America/Guayaquil", text: "Ecuador (America/Guayaquil) [GMT-5]" },
        { value: "America/Lima", text: "Perú (America/Lima) [GMT-5]" },
        { value: "America/Santiago", text: "Chile (America/Santiago) [GMT-4/GMT-3]" },
        { value: "America/Argentina/Buenos_Aires", text: "Argentina (America/Argentina/Buenos_Aires) [GMT-3]" },
        { value: "Europe/Madrid", text: "España (Europe/Madrid) [GMT+1/GMT+2]" },
        { value: "America/Panama", text: "Panamá (America/Panama) [GMT-5]" },
        { value: "America/Mexico_City", text: "México (America/Mexico_City) [GMT-6]" },
        { value: "America/New_York", text: "EEUU - Nueva York (America/New_York) [GMT-5/GMT-4]" }
      ]
    };
  },
  methods: {
    async save() {
      this.overlay = true;
      try {
        const employeeId = this.$store.state.login.dataUser?.id_empleado;
        if (!employeeId) {
          throw new Error("ID de empleado no disponible.");
        }

        const payload = new URLSearchParams();
        payload.set("timezone", this.data.timezone);

        await this.$axios.post(
          `${this.$config.API}/configuracion/empresa/${employeeId}`,
          payload
        );

        // Refrescar los datos de la store para que la app completa tenga la zona horaria correcta
        await this.$store.dispatch("login/refreshData");

        this.$emit("saved", this.data);
        
        if (this.showSaveButton) {
          this.$fire({
            title: "Éxito",
            text: "Zona horaria actualizada correctamente.",
            type: "success"
          });
        }
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudo guardar la zona horaria. <p>${err.response?.data?.message || err.message}</p>`,
          type: "error"
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
        if (newVal) {
          this.data.timezone = newVal.timezone || "America/Caracas";
        }
      },
      deep: true
    }
  }
};
</script>
