<template>
  <b-form @submit.prevent="save">
    <b-overlay :show="overlay">
      <b-row class="justify-content-center">
        <b-col md="12">
          <b-form-group label="Nombre de la Empresa:" label-for="empresa-nombre">
            <b-form-input
              id="empresa-nombre"
              v-model="data.nombre"
              placeholder="Ingrese el nombre comercial"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label="Número de Registro Legal (RIF/NIT/RUT):"
            label-for="empresa-registro"
          >
            <b-form-input
              id="empresa-registro"
              v-model="data.numero_registro_legal"
              placeholder="Ingrese el identificador fiscal"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="País:" label-for="empresa-pais">
            <b-form-select
              id="empresa-pais"
              v-model="data.pais"
              :options="countryOptions"
              required
            ></b-form-select>
          </b-form-group>

          <b-form-group label="Dirección Fiscal:" label-for="empresa-direccion">
            <b-form-textarea
              id="empresa-direccion"
              v-model="data.direccion"
              placeholder="Ingrese la dirección completa"
              rows="3"
              required
            ></b-form-textarea>
          </b-form-group>

          <b-form-group label="Teléfono de la Empresa:" label-for="empresa-telefono">
            <b-input-group>
              <b-form-select
                v-model="data.countryCode"
                :options="countryCodes"
                style="max-width: 150px"
              ></b-form-select>
              <b-form-input
                id="empresa-telefono"
                v-model="data.phoneNumber"
                type="number"
                placeholder="Ej: 2121234567"
                required
                @input="data.phoneNumber = cleanPhoneInput($event)"
                @blur="handleBlur"
              ></b-form-input>
            </b-input-group>
          </b-form-group>

          <b-form-group label="Email de la Empresa:" label-for="empresa-email">
            <b-form-input
              id="empresa-email"
              v-model="data.email"
              type="email"
              placeholder="Ingrese un correo electrónico"
              required
            ></b-form-input>
          </b-form-group>

          <div class="text-right mt-4" v-if="showSaveButton">
            <b-button type="submit" variant="primary">Guardar Cambios</b-button>
          </div>
        </b-col>
      </b-row>
    </b-overlay>
  </b-form>
</template>

<script>
import phoneValidation from "~/mixins/phoneValidation.js";

export default {
  name: "ConfigEmpresaForm",
  mixins: [phoneValidation],
  props: {
    initialData: {
      type: Object,
      required: true
    },
    countryCodes: {
      type: Array,
      required: true
    },
    countryOptions: {
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
      data: { ...this.initialData }
    };
  },
  methods: {
    handleBlur() {
      this.$emit('phone-blur', { type: 'empresa', data: this.data });
    },
    async validate() {
      const errors = [];
      const data = this.data;

      if (!data.nombre.trim()) errors.push("El nombre de la empresa es obligatorio.");
      if (!data.numero_registro_legal || !String(data.numero_registro_legal).trim()) errors.push("El número de registro legal es obligatorio.");
      if (!data.pais) errors.push("Debe seleccionar un país.");
      if (!data.direccion || !data.direccion.trim()) errors.push("La dirección es obligatoria.");

      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!data.email.trim()) {
        errors.push("El email de la empresa es obligatorio.");
      } else if (!emailRegex.test(data.email.trim())) {
        errors.push("El formato del email no es válido.");
      }

      if (!data.phoneNumber || !String(data.phoneNumber).trim()) {
        errors.push("El número de teléfono de la empresa es obligatorio.");
      } else {
        const countryCodeData = this.countryCodes.find(c => c.value === data.countryCode);
        const phoneCode = countryCodeData ? countryCodeData.text.match(/\+(\d+)/)[1] : '';
        const fullPhoneNumber = `+${phoneCode}${data.phoneNumber}`;
        const result = this.validateAndFormatPhone(fullPhoneNumber, data.countryCode);
        
        if (!result.isValid) {
           errors.push("El número de teléfono de la empresa no es válido.");
        }
      }

      if (errors.length > 0) {
        this.$fire({
          title: "Datos Incompletos o Inválidos",
          html: `<div class="text-left"><ul>${errors.map(e => `<li>${e}</li>`).join("")}</ul></div>`,
          type: "warning",
        });
        return false;
      }
      return true;
    },
    async save() {
      const isValid = await this.validate();
      if (!isValid) return;

      this.overlay = true;
      try {
        const countryCodeData = this.countryCodes.find(c => c.value === this.data.countryCode);
        const phoneCode = countryCodeData ? countryCodeData.text.match(/\+(\d+)/)[1] : '';
        const fullPhoneNumber = `${phoneCode}${this.data.phoneNumber}`;

        const payload = new URLSearchParams();
        payload.set("nombre", this.data.nombre);
        payload.set("numero_registro_legal", this.data.numero_registro_legal);
        payload.set("pais", this.data.pais);
        payload.set("direccion", this.data.direccion);
        payload.set("telefono", fullPhoneNumber);
        payload.set("email", this.data.email);

        const employeeId = this.$store.state.login.dataUser?.id_empleado;
        if (!employeeId) {
          throw new Error("ID de empleado no disponible.");
        }

        await this.$axios.post(`${this.$config.API}/configuracion/empresa/${employeeId}`, payload);

        const errorsToRemove = [
          "Número de registro legal de la empresa",
          "Dirección de la empresa (en empresas)",
          "Teléfono de la empresa"
        ];
        this.$store.commit("login/removeConfiguracionFaltante", errorsToRemove);

        this.$emit('saved', this.data);
        if (this.showSaveButton) {
            this.$fire({
                title: "Éxito",
                text: "Datos de la empresa actualizados correctamente.",
                type: "success",
            });
        }
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudieron guardar los datos de la empresa. <p>${err.response?.data?.message || err.message}</p>`,
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
