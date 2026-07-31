<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="
          accessModule.accessData.id_modulo === 2 ||
          accessModule.accessData.id_modulo === 1
        ">
        <b-container>
          <b-row>
            <b-col>
              <h1 class="mb-4">Otros Abonos</h1>
            </b-col>
          </b-row>
          <b-row>
            <b-col
              xs="12"
              sm="12"
              md="6"
              lg="4"
              xl="4"
              offset-md="6"
              offset-lg="8"
              offset-xl="8"
            >
              <form-monedas />
            </b-col>
          </b-row>
        </b-container>

        <b-container v-if="tasasCargadas">
          <b-overlay
            :show="overlay"
            spinner-small
          >
            <b-row class="mb-4">
              <b-col>
                <b-alert
                  show
                  class="mb-4"
                  variant="warning"
                >
                  Desde aqui puede hacer abonos adicionales a los pagos de las
                  ordenes.
                  <strong>si va a hacer un abono a una orden, hagalo desde el
                    siguiente link:
                    <router-link
                      class="nav-link"
                      to="/comercializacion/ordenes/activas"
                      custom
                      v-slot="{ navigate }"
                    >
                      <span
                        @click="navigate"
                        @keypress.enter="navigate"
                        style="display: inline; padding: 0"
                        class="blue-link"
                        role="link"
                      >
                        Ordenes En Curso
                      </span>
                    </router-link></strong>
                </b-alert>
              </b-col>
            </b-row>
            <b-row>
              <b-col
                xl="3"
                lg="3"
                md="3"
                sm="12"
              >
                <b-row>
                  <b-col>
                    <hr />
                    <h4>Tipo de abono</h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-select
                      v-model="tipoAbono"
                      :options="options"
                      size="sm"
                      class="mt-3"
                      @change="handleTipoAbonoChange"
                    ></b-form-select>
                  </b-col>
                </b-row>
              </b-col>

            </b-row>

            <!-- Modal para Abono a Órdenes -->
            <b-modal
              id="orderAbonoModal"
              v-model="showOrderAbonoModal"
              title="Abono a Orden Específica"
              size="lg"
              hide-footer
              @hide="onModalHide"
            >
              <b-form @submit.prevent="searchOrderForAbono">
                <b-form-group
                  label="Número de Orden:"
                  label-for="input-order-number"
                >
                  <b-form-input
                    id="input-order-number"
                    v-model="orderNumberToAbono"
                    type="number"
                    required
                    placeholder="Ingrese el número de la orden"
                  ></b-form-input>
                </b-form-group>
                <b-button
                  type="submit"
                  variant="primary"
                >Buscar Orden</b-button>
              </b-form>

              <div
                v-if="foundOrderDetails"
                class="mt-4"
              >
                <h5>Detalles de la Orden:</h5>
                <p><strong>Número de Orden:</strong> {{ foundOrderDetails.orderNumber }}</p>
                <p><strong>Cliente:</strong> {{ foundOrderDetails.clientName }}</p>
                <p><strong>Monto Total Actual:</strong> ${{ foundOrderDetails.currentTotal }}</p>
                <p><strong>Abonado Previamente:</strong> ${{ foundOrderDetails.previouslyAbonado }}</p>
                <p><strong>Saldo Pendiente:</strong> ${{ (parseFloat(foundOrderDetails.currentTotal) - parseFloat(foundOrderDetails.previouslyAbonado)).toFixed(2) }}</p>

                <hr />
                <h6>Realizar Abono Adicional:</h6>
                <ordenes-metodos-pago-dinamico ref="metodosPagoModal" @change="onPagosModalChange" />
                    <b-form-group label="Detalle del Abono:">
                      <b-form-textarea v-model="abonoOrderForm.detalle"></b-form-textarea>
                    </b-form-group>

                    <div class="mt-3 mb-4 p-3 bg-light rounded">
                      <h6>Total <b-badge variant="success">{{ totalEnBaseModal.toFixed(2) }}</b-badge></h6>
                    </div>
                <b-button
                  variant="success"
                  @click="sendOrderAbono"
                >Registrar Abono</b-button>
              </div>
            </b-modal>

            <b-row>
              <b-col
                xl="8"
                lg="8"
                md="12"
                sm="12"
              >
                <hr />
                <ordenes-metodos-pago-dinamico ref="metodosPago" @change="onPagosChange" />
              </b-col>
            </b-row>

            <b-row class="mt-4">
              <b-col>
                <h4>Detalle del abono</h4>
                <b-form-textarea v-model="form.detalle"></b-form-textarea>
              </b-col>
            </b-row>

            <b-row class="mt-4">
              <b-col>
                <hr />
                <h2 class="mb-4">
                  MONTO DEL ABONO {{ form.abono }}
                  <b-button
                    size="lg"
                    class="ml-4"
                    variant="success"
                    @click="enviarAbono"
                  >ABONAR</b-button>
                </h2>
              </b-col>
            </b-row>
          </b-overlay>
        </b-container>

        <b-container v-else>
          <b-row>
            <b-col>
              <b-alert
                show
                variant="warning"
              >Por favor indique las Tasas del día</b-alert>
            </b-col>
          </b-row>
        </b-container>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixin-login.js";
import FormMonedas from "~/components/formMonedas.vue";
import MetodosPagoDinamico from "~/components/ordenes/MetodosPagoDinamico.vue";

export default {
  mixins: [mixin],
  components: { FormMonedas, MetodosPagoDinamico },

  data() {
    return {
      titulo: "Otros Abonos",
      overlay: false,
      tipoAbono: null,
      options: [
        { value: null, text: "Seleccione" },
        { value: "abono_orden", text: "Abono a órdenes" }, // Nuevo valor para identificarlo
        { value: "otros", text: "Otro motivo" }, // Cambiado a 'otros' para consistencia
      ],
      showOrderAbonoModal: false, // Nueva propiedad para controlar el modal
      orderNumberToAbono: null, // Para almacenar el número de orden ingresado
      foundOrderDetails: null, // Para almacenar los detalles de la orden encontrada
      abonoOrderForm: {
        detalle: "",
      },
      pagosDinamicosModal: [],
      totalEnBaseModal: 0,
      form: {
        abono: 0,
        detalle: "",
      },
      pagosDinamicos: [],
    };
  },

  computed: {
    ...mapState("login", ["dataUser", "access", "tasas"]),

    tasasCargadas() {
      let cargadas = false;
      const tipos = this.$store.state.login.dataEmpresa.tipos_de_monedas || [];
      const activeMonedas = tipos.filter((m) => m.activo);
      if (activeMonedas.length > 0) {
        // Check if every active currency has a rate > 0
        cargadas = activeMonedas.every(
          (moneda) => this.tasas[moneda.moneda] > 0
        );
      }
      return cargadas;
    },

  },

  methods: {
    onModalHide() {
      // Restablecer el valor del select cuando el modal se cierra
      this.tipoAbono = null;
    },

    fechaActual() {
      let date = new Date();
      let day = `${date.getDate()}`.padStart(2, "0");
      let month = `${date.getMonth() + 1}`.padStart(2, "0");
      let year = date.getFullYear();

      return `${year}-${month}-${day}`;
    },

    async enviarAbono() {
      // Si el tipo de abono es a una orden, abrimos el modal y salimos de esta función
      if (this.tipoAbono === "abono_orden") {
        this.showOrderAbonoModal = true;
        return; // Salir de la función, la lógica de abono a orden se maneja en el modal
      }

      let ok = true;
      let msg = "";

      if (parseFloat(this.form.abono) === 0) {
        ok = false;
        msg = msg + "<p>El Total del abono no puede ser Cero</p>";
      }

      if (this.form.detalle.trim().length === 0) {
        ok = false;
        msg = msg + "<p>Debe escribir el detalle del abono</p>";
      }

      if (this.tipoAbono === null) {
        ok = false;
        msg = msg + "<p>Debe seleccionar el tipo abono</p>";
      }

      if (ok) {
        this.overlay = true;
        const data = new URLSearchParams();
        data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
        data.set("pagos", JSON.stringify(this.pagosDinamicos));
        data.set("abono", this.form.abono);
        data.set("detalle", this.form.detalle);
        data.set("tipoAbono", this.tipoAbono);

        await this.$axios
          .post(`${this.$config.API}/otro-abono`, data)
          .then((res) => {
            this.form.detalle = "";
            this.form.abono = 0;
            this.pagosDinamicos = [];
            this.$refs.metodosPago?.resetear();
            this.overlay = false;
          });
      } else {
        this.$fire({
          title: "Se requieren datos",
          type: "error",
          html: msg,
        });
      }
    },

    onPagosChange({ pagos, totalEnBase }) {
      this.pagosDinamicos = pagos;
      this.form.abono = totalEnBase.toFixed(2);
    },

    handleTipoAbonoChange(value) {
      if (value === "abono_orden") {
        this.showOrderAbonoModal = true;
        this.orderNumberToAbono = null; // Limpiar el campo de número de orden
        this.foundOrderDetails = null; // Limpiar los detalles de la orden encontrada
        // Resetear el formulario de abono del modal
        this.abonoOrderForm = { detalle: "" };
        this.pagosDinamicosModal = [];
        this.totalEnBaseModal = 0;
        this.$refs.metodosPagoModal?.resetear();
      }
    },

    async searchOrderForAbono() {
      if (!this.orderNumberToAbono) {
        this.$fire({
          title: "Error",
          html: "Por favor, ingrese un número de orden.",
          type: "error",
        });
        return;
      }

      this.overlay = true;
      try {
        const response = await this.$axios.get(
          `${this.$config.API}/buscar/${this.orderNumberToAbono}`
        );
        if (response.data && response.data.orden) {
          const order = response.data.orden[0];
          console.log("Orden encontrada:", order.pago_abono);

          this.foundOrderDetails = {
            orderNumber: order._id,
            clientName: order.cliente_nombre,
            currentTotal: order.pago_total,
            previouslyAbonado: order.pago_abono,
            saldoPendiente: order.pago_total - order.abono,
          };
        } else {
          this.$fire({
            title: "Orden no encontrada",
            html: `No se encontró una orden con el número ${this.orderNumberToAbono}.`,
            type: "warning",
          });
          this.foundOrderDetails = null;
        }
      } catch (error) {
        console.error("Error buscando la orden:", error);
        this.$fire({
          title: "Error",
          html: `Hubo un problema al buscar la orden. Intente de nuevo.`,
          type: "error",
        });
        this.foundOrderDetails = null;
      } finally {
        this.overlay = false;
      }
    },

    onPagosModalChange({ pagos, totalEnBase }) {
      this.pagosDinamicosModal = pagos;
      this.totalEnBaseModal = totalEnBase;
    },

    async sendOrderAbono() {
      let ok = true;
      let msg = "";

      if (this.totalEnBaseModal === 0) {
        ok = false;
        msg = msg + "<p>El monto del abono no puede ser Cero.</p>";
      }

      if (this.abonoOrderForm.detalle.trim().length === 0) {
        ok = false;
        msg = msg + "<p>Debe escribir el detalle del abono.</p>";
      }

      if (ok) {
        this.overlay = true;
        const data = new URLSearchParams();
        data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
        // La diferencia clave: enviamos el id_orden
        data.set("id_orden", this.foundOrderDetails.orderNumber);
        data.set("pagos", JSON.stringify(this.pagosDinamicosModal));
        data.set("abono", this.totalEnBaseModal.toFixed(2));
        data.set("detalle", this.abonoOrderForm.detalle);
        data.set("tipoAbono", "Abono Orden"); // Identificador para el backend

        try {
          // Usamos el mismo endpoint que el formulario principal
          await this.$axios.post(`${this.$config.API}/otro-abono`, data);
          this.$fire({
            title: "Éxito",
            html: `Abono de $${this.totalEnBaseModal.toFixed(2)} registrado para la orden ${this.foundOrderDetails.orderNumber}.`,
            type: "success",
          });
          this.showOrderAbonoModal = false;
          // Resetear el formulario principal y el del modal
          this.form.abono = 0;
          this.form.detalle = "";
          this.pagosDinamicos = [];
          this.$refs.metodosPago?.resetear();
          this.abonoOrderForm = { detalle: "" };
          this.pagosDinamicosModal = [];
          this.totalEnBaseModal = 0;
          this.$refs.metodosPagoModal?.resetear();
          this.orderNumberToAbono = null;
          this.foundOrderDetails = null;
        } catch (error) {
          console.error("Error registrando abono a la orden:", error);
          this.$fire({
            title: "Error",
            html: `Hubo un problema al registrar el abono. ${
              error.response?.data?.message || error.message
            }`,
            type: "error",
          });
        } finally {
          this.overlay = false;
        }
      } else {
        this.$fire({
          title: "Se requieren datos",
          type: "error",
          html: msg,
        });
      }
    },
  },
};
</script>
