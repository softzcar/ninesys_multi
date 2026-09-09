<template>
  <b-modal
    :id="id"
    title="Cambiar clave"
    ok-title="Guardar"
    cancel-title="Cancelar"
    :ok-disabled="guardando"
    @ok="guardarClave"
    @hidden="resetForm"
  >
    <b-form-group label="Clave actual:" label-for="clave-actual">
      <b-form-input
        id="clave-actual"
        v-model="claveActual"
        type="password"
        autocomplete="current-password"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Clave nueva:" label-for="clave-nueva">
      <b-form-input
        id="clave-nueva"
        v-model="claveNueva"
        type="password"
        autocomplete="new-password"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Confirmar clave nueva:" label-for="clave-nueva-confirmar">
      <b-form-input
        id="clave-nueva-confirmar"
        v-model="claveNuevaConfirmar"
        type="password"
        autocomplete="new-password"
      ></b-form-input>
    </b-form-group>
  </b-modal>
</template>

<script>
export default {
  name: "ModalCambiarClave",
  props: {
    id: {
      type: String,
      default: "modal-cambiar-clave",
    },
  },
  data() {
    return {
      claveActual: "",
      claveNueva: "",
      claveNuevaConfirmar: "",
      guardando: false,
    };
  },
  methods: {
    resetForm() {
      this.claveActual = "";
      this.claveNueva = "";
      this.claveNuevaConfirmar = "";
    },

    async guardarClave(bvModalEvt) {
      bvModalEvt.preventDefault();

      if (!this.claveActual || !this.claveNueva || !this.claveNuevaConfirmar) {
        this.$fire({
          type: "error",
          title: "Dato requerido",
          html: "Complete los 3 campos.",
        });
        return;
      }

      if (this.claveNueva !== this.claveNuevaConfirmar) {
        this.$fire({
          type: "error",
          title: "Las claves no coinciden",
          html: "La clave nueva y su confirmación deben ser iguales.",
        });
        return;
      }

      const idUsuario =
        this.$store.state.login.dataUser?.id_empleado ||
        this.$store.state.login?.empleado?.id_empleado ||
        this.$store.state.login?.empleado?.id ||
        null;

      if (!idUsuario) {
        this.$fire({
          type: "error",
          title: "No se pudo identificar al usuario",
          html: "Vuelva a iniciar sesión e intente de nuevo.",
        });
        return;
      }

      this.guardando = true;
      const data = new URLSearchParams();
      data.set("id_usuario", idUsuario);
      data.set("clave_actual", this.claveActual);
      data.set("clave_nueva", this.claveNueva);

      await this.$axios
        .post(`${this.$config.API}/empleados/cambiar-clave`, data)
        .then((res) => {
          this.$bvModal.hide(this.id);
          this.$fire({
            type: "success",
            title: "Clave actualizada",
            html: res.data.message || "Su clave fue actualizada correctamente.",
          });
        })
        .catch((err) => {
          const msg =
            (err.response && err.response.data && err.response.data.error) ||
            "No se pudo actualizar la clave. Intente de nuevo.";
          this.$fire({ type: "error", title: "No se pudo actualizar", html: msg });
        })
        .finally(() => {
          this.guardando = false;
        });
    },
  },
};
</script>
