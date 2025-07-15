<template>
  <div>
    <div class="floatme">
      <b-button
        variant="light"
        @click="$bvModal.show(modal)"
        :disabled="disableBtnOnIdDep"
      >
        <span style="margin-right: 10px">
          <b-icon
            icon="whatsapp"
            variant="success"
            font-scale="1.2"
          ></b-icon>
        </span>

        <span v-if="$nuxt.isOffline">
          <b-icon
            icon="wifi-off"
            variant="danger"
          ></b-icon>
        </span>

        <span v-else>
          <b-icon
            icon="wifi"
            variant="success"
          ></b-icon>
        </span>
      </b-button>

      <b-modal
        :id="modal"
        :title="title"
        hide-footer
        size="lg"
      >
        <b-overlay
          :show="overlay"
          spinner-small
        >
          <!-- <div class="text-center mb-4 mt-2">
                        <b-button @click="validateMsg()" variant="success"
                            >Eviar Mensaje</b-button
                        >
                    </div> -->

          <b-form>
            <b-form-group
              id="group-dep-1)"
              :label="`Departamento: ${$store.state.login.dataUser.departamento}`"
              label-for="input-mensaje-1)"
            >
              <b-form-textarea
                id="input-mensaje1"
                v-model="mensaje"
                placeholder="Escribe el mensaje para este departamento..."
                rows="3"
                max-rows="6"
                class="mb-2"
                maxlength="65536"
              ></b-form-textarea>

              <b-form-select
                id="select-modulo"
                :disabled="overlay"
                v-model="destinatario"
                :options="empleados"
                class="floatme mb-4 mt-2"
              ></b-form-select>

              <div class="text-right mt-2">
                <b-button
                  variant="success"
                  size="xl"
                  @click="validateMsg"
                  :disabled="overlay"
                >
                  <b-spinner
                    small
                    v-if="overlay"
                  ></b-spinner>
                  Enviar Mensaje
                </b-button>
              </div>
            </b-form-group>
          </b-form>
        </b-overlay>
      </b-modal>
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],

  data() {
    return {
      title: "Enviar WhatsApp a Empleados",
      empleados: [],
      mensaje: "",
      destinatario: null,
      overlay: true,
    };
  },
  computed: {
    // Genera un ID único para el modal (tu implementación existente)
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-ws-deps-${rand}`; // Usar un prefijo más específico
    },

    disableBtnOnIdDep() {
      if (this.$store.state.login.currentDepartamentId === null) {
        return true;
      } else {
        return false;
      }
    },
  },

  methods: {
    async getEmpleados() {
      await this.$axios.get(`${this.$config.API}/empleados`).then((res) => {
        this.empleados = res.data.items.map((el) => {
          // Validación mejorada: no es null, no es undefined y no es una cadena vacía (después de quitar espacios)
          const hasPhone = el.telefono && String(el.telefono).trim() !== "";
          return {
            value: el._id,
            text: hasPhone ? el.nombre : `${el.nombre} (sin teléfono)`, // Añade un texto visual para indicar por qué está deshabilitado
            disabled: !hasPhone, // La propiedad 'disabled' es reconocida por b-form-select
          };
        });

        this.empleados.unshift({
          value: null,
          text: "Seleccione un empleado",
        });
      });
    },

    validateMsg() {
      let ok = true;
      let msg = "";

      if (this.mensaje.trim() === "") {
        ok = false;
        msg += "<p>Debe escrbir un mensaje</p>";
      }

      if (this.destinatario === null || !this.destinatario) {
        ok = false;
        msg += "<p>Debe seleccionar un destinatario</p>";
      }

      if (!ok) {
        this.$fire({
          title: "Faltan Datos",
          html: msg,
          type: "info",
        });
      } else {
        this.sendMsgCustomIneterno(
          this.destinatario,
          this.$store.state.login.dataUser.id_empleado,
          this.$store.state.login.currentDepartamentId,
          this.mensaje
        );
      }
    },
  },

  mounted() {
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId === this.modal) {
        this.getEmpleados().then(() => (this.overlay = false));
      }
    });
  },
};
</script>