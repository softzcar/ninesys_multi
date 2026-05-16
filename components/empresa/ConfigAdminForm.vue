<template>
  <b-form @submit.prevent="save">
    <b-overlay :show="overlay">
      <b-row class="justify-content-center">
        <b-col md="12">
          <b-form-group
            label="Nombre Completo del Administrador:"
            label-for="admin-nombre"
          >
            <b-form-input
              id="admin-nombre"
              v-model="data.nombre"
              placeholder="Ingrese su nombre y apellido"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label="Teléfono de Contacto (WhatsApp):"
            label-for="admin-telefono"
          >
            <b-input-group>
              <b-form-select
                v-model="data.countryCode"
                :options="countryCodes"
                style="max-width: 150px"
              ></b-form-select>
              <b-form-input
                id="admin-telefono"
                v-model="data.phoneNumber"
                type="number"
                placeholder="Ej: 4141234567"
                required
                @input="data.phoneNumber = cleanPhoneInput($event)"
                @blur="handleBlur"
              ></b-form-input>
            </b-input-group>
          </b-form-group>

          <hr class="my-4" />
          <h5>Cambiar Contraseña</h5>

          <b-form-group label="Nueva Contraseña:" label-for="admin-new-password">
            <b-input-group>
              <b-form-input
                id="admin-new-password"
                v-model="data.newPassword"
                :type="data.newPasswordType"
                placeholder="Ingrese la nueva contraseña"
              ></b-form-input>
              <b-input-group-append>
                <b-button @click="togglePasswordVisibility('new')">
                  <b-icon :icon="data.newPasswordType === 'password' ? 'eye-slash' : 'eye'"></b-icon>
                </b-button>
              </b-input-group-append>
            </b-input-group>
            <b-form-text>
              La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial (ej: !@#$%).
            </b-form-text>
          </b-form-group>

          <b-form-group
            label="Confirmar Nueva Contraseña:"
            label-for="admin-confirm-password"
          >
            <b-input-group>
              <b-form-input
                id="admin-confirm-password"
                v-model="data.confirmPassword"
                :type="data.confirmPasswordType"
                placeholder="Repita la nueva contraseña"
              ></b-form-input>
              <b-input-group-append>
                <b-button @click="togglePasswordVisibility('confirm')">
                  <b-icon :icon="data.confirmPasswordType === 'password' ? 'eye-slash' : 'eye'"></b-icon>
                </b-button>
              </b-input-group-append>
            </b-input-group>
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
  name: "ConfigAdminForm",
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
    togglePasswordVisibility(field) {
      if (field === 'new') {
        this.data.newPasswordType = this.data.newPasswordType === 'password' ? 'text' : 'password';
      } else if (field === 'confirm') {
        this.data.confirmPasswordType = this.data.confirmPasswordType === 'password' ? 'text' : 'password';
      }
    },
    handleBlur() {
      this.$emit('phone-blur', { type: 'admin', data: this.data });
    },
    async validate() {
      const errors = [];
      const data = this.data;

      if (!data.nombre.trim()) errors.push("El nombre completo es obligatorio.");

      if (!data.phoneNumber.trim()) {
        errors.push("El número de teléfono es obligatorio.");
      } else {
        const countryCodeData = this.countryCodes.find(c => c.value === data.countryCode);
        const phoneCode = countryCodeData ? countryCodeData.text.match(/\+(\d+)/)[1] : '';
        const fullPhoneNumber = `+${phoneCode}${data.phoneNumber}`;
        const result = this.validateAndFormatPhone(fullPhoneNumber, data.countryCode);
        
        if (!result.isValid) {
           errors.push("El número de teléfono no es válido.");
        }
      }

      let passwordPayload = null;
      if (data.newPassword !== "" || data.confirmPassword !== "") {
        const pass = data.newPassword;
        if (pass.length < 8) errors.push("La contraseña debe tener al menos 8 caracteres.");
        if (!/[a-z]/.test(pass)) errors.push("La contraseña debe contener al menos una letra minúscula.");
        if (!/[A-Z]/.test(pass)) errors.push("La contraseña debe contener al menos una letra mayúscula.");
        if (!/\d/.test(pass)) errors.push("La contraseña debe contener al menos un número.");
        if (!/[!@#$%^&*]/.test(pass)) errors.push("La contraseña debe contener al menos un carácter especial (ej: !@#$%).");
        if (pass !== data.confirmPassword) errors.push("Las contraseñas no coinciden.");
        
        if (errors.filter(e => e.includes("contraseña") || e.includes("contraseñas")).length === 0) {
          passwordPayload = pass;
        }
      }

      if (errors.length > 0) {
        this.$fire({
          title: "Datos Incompletos o Inválidos",
          html: `<div class="text-left"><ul>${errors.map((e) => `<li>${e}</li>`).join("")}</ul></div>`,
          type: "warning",
        });
        return false;
      }
      return { isValid: true, passwordPayload };
    },
    async save() {
      const validation = await this.validate();
      if (!validation.isValid) return;

      this.overlay = true;
      try {
        const countryCodeData = this.countryCodes.find(c => c.value === this.data.countryCode);
        const phoneCode = countryCodeData ? countryCodeData.text.match(/\+(\d+)/)[1] : '';
        const fullPhoneNumber = `${phoneCode}${this.data.phoneNumber}`;

        const payload = new URLSearchParams();
        payload.set("nombre", this.data.nombre);
        payload.set("telefono", fullPhoneNumber);
        payload.set("password", validation.passwordPayload);

        const adminUserId = this.$store.state.login.dataUser.id_empleado;
        await this.$axios.post(`${this.$config.API}/configuracion/admin/${adminUserId}`, payload);

        this.$store.commit("login/removeConfiguracionFaltante", ["Teléfono del usuario"]);
        
        this.$emit('saved', this.data);
        if (this.showSaveButton) {
            this.$fire({
                title: "Éxito",
                text: "Datos del administrador actualizados correctamente.",
                type: "success",
            });
        }
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudieron guardar los datos del administrador. <p>${err.response?.data?.message || err.message}</p>`,
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
