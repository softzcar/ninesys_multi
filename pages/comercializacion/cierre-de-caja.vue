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
              <h1 class="mb-4">Cierre de Caja</h1>
            </b-col>
          </b-row>
          <b-row>
            <b-col
              xs="12"
              sm="12"
              md="3"
              lg="3"
              xl="3"
              offset-md="9"
              offset-lg="9"
              offset-xl="9"
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
                  El cierre de caja implica el retiro del efectivo por parte de
                  la empresa,
                  <strong>Si va a hacer un retiro de efectivo para algun gasto,
                    hagalo desde el siguiente link:
                    <router-link
                      class="nav-link"
                      to="/comercializacion/retiros"
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
                        Retiros
                      </span>
                    </router-link></strong>
                </b-alert>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <h2 class="mb-4">
                  MONTO DEL CIERRE {{ form.abono }}
                  <b-button
                    size="lg"
                    class="ml-4"
                    variant="success"
                    @click="enviarCierre"
                  >Cerrar Caja</b-button>
                </h2>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <H2>TABLA DE MONTOS EN CAJA POR TIPO DE MONEDA</H2>
              </b-col>
            </b-row>

            <b-row>
              <b-col
                xl="4"
                lg="4"
                md="4"
                sm="12"
                xs="12"
              >
                <b-row>
                  <b-col>
                    <hr />
                    <h4>
                      Dólares Max
                      {{ formatNumber(totDolares) }}
                    </h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-1"
                      label-for="input-dolares-efectivo"
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-dolares-efectivo"
                        type="number"
                        step="0.10"
                        min="0"
                        :max="totDolares"
                        @change="updateMontoAbono"
                        v-model="form.montoDolaresEfectivo"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-col>
              <b-col
                xl="4"
                lg="4"
                md="4"
                sm="12"
                xs="12"
              >
                <b-row>
                  <b-col>
                    <hr />
                    <h4>
                      Pesos Max
                      {{ formatNumber(totPesos) }}
                    </h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-4"
                      label-for="input-dolares-efectivo"
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-pesos-efectivo"
                        type="number"
                        step="0.10"
                        min="0"
                        :max="totPesos"
                        v-model="form.montoPesosEfectivo"
                        @change="updateMontoAbono"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-col>
              <b-col
                xl="4"
                lg="4"
                md="4"
                sm="12"
                xs="12"
              >
                <b-row>
                  <b-col>
                    <hr />
                    <h4>
                      Bolívares Max
                      {{ formatNumber(totBolivares) }}
                    </h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-6"
                      label-for="input-bolivares-efectivo "
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-bolivares-efectivo"
                        type="number"
                        step="0.10"
                        min="0"
                        :max="totBolivares"
                        v-model="form.montoBolivaresEfectivo"
                        @change="updateMontoAbono"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
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
import axios from "axios";
import mixins from "~/mixins/mixins.js";
import mixinLogin from "~/mixins/mixin-login.js";
import FormMonedas from "~/components/formMonedas.vue";

export default {
  mixins: [mixins, mixinLogin],
  data() {
    return {
      titulo: "Cierre de Caja",
      overlay: false,
      tipoAbono: null,
      efectivo: [],
      totDolares: 0,
      totPesos: 0,
      totBolivares: 0,
      fondo: [],
      form: {
        abono: 0,
        montoDolaresEfectivo: 0,
        montoPesosEfectivo: 0,
        montoBolivaresEfectivo: 0,
      },
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

    montoEnDolares() {
      let val = 0;
      if (this.efectivo[0].monto === undefined) {
        val = 99;
      } else {
        val = this.efectivo[0].monto;
      }
      return val;
    },

    totalDolares() {
      let totalDolares = 0;
      let dolaresEfectivo = parseFloat(this.form.montoDolaresEfectivo);
      let dolaresZelle = parseFloat(this.form.montoDolaresZelle);
      let dolaresPanama = parseFloat(this.form.montoDolaresPanama);

      if (!dolaresEfectivo) {
        dolaresEfectivo = 0.0;
      }
      if (!dolaresPanama) {
        dolaresPanama = 0.0;
      }
      if (!dolaresZelle) {
        dolaresZelle = 0.0;
      }

      totalDolares = dolaresEfectivo + dolaresPanama + dolaresZelle;
      this.updateMontoAbono();
      return totalDolares.toFixed(2);
    },

    totalPesos() {
      let totalPesos = 0;
      let pesosEfectivo = parseFloat(this.form.montoPesosEfectivo);
      let pesosTransferencia = parseFloat(this.form.montoPesosTransferencia);

      if (!pesosEfectivo) {
        pesosEfectivo = 0.0;
      }
      if (!pesosTransferencia) {
        pesosTransferencia = 0.0;
      }

      totalPesos = pesosEfectivo + pesosTransferencia;
      return totalPesos.toFixed(2);
    },

    totalBolivares() {
      let totalBolivares = 0;
      let bolivaresEfectivo = parseFloat(this.form.montoBolivaresEfectivo);
      let bolivaresPagomovil = parseFloat(this.form.montoBolivaresPagomovil);
      let bolivaresPunto = parseFloat(this.form.montoBolivaresPunto);
      let bolivaresTransferencia = parseFloat(
        this.form.montoBolivaresTransferencia
      );

      if (!bolivaresEfectivo) {
        bolivaresEfectivo = 0.0;
      }

      if (!bolivaresPagomovil) {
        bolivaresPagomovil = 0.0;
      }

      if (!bolivaresPunto) {
        bolivaresPunto = 0.0;
      }

      if (!bolivaresTransferencia) {
        bolivaresTransferencia = 0.0;
      }

      totalBolivares =
        bolivaresEfectivo +
        bolivaresPagomovil +
        bolivaresTransferencia +
        bolivaresPunto;
      return totalBolivares.toFixed(2);
    },

    totalAbono() {
      // CALCULO DOLARES
      const montoDolares =
        parseFloat(this.form.montoDolaresEfectivo) +
        parseFloat(this.form.montoDolaresPanama) +
        parseFloat(this.form.montoDolaresZelle);

      // CALCULO EN PESOS
      const montoPesos =
        (parseFloat(this.form.montoPesosEfectivo) +
          parseFloat(this.form.montoPesosTransferencia)) /
        parseFloat(this.tasas.peso_colombiano);

      // CALCULO EN BOLIVARES
      const montoBolivares =
        (parseFloat(this.form.montoBolivaresEfectivo) +
          parseFloat(this.form.montoBolivaresPagomovil) +
          parseFloat(this.form.montoBolivaresPunto) +
          parseFloat(this.form.montoBolivaresTransferencia)) /
        parseFloat(this.tasas.bolivar);

      let total = montoDolares + montoPesos + montoBolivares;

      if (isNaN(total)) total = 0;
      return total.toFixed(2);
    },
  },

  components: { FormMonedas },
  methods: {
    fechaActual() {
      let date = new Date();
      let day = `${date.getDate()}`.padStart(2, "0");
      let month = `${date.getMonth() + 1}`.padStart(2, "0");
      let year = date.getFullYear();

      return `${year}-${month}-${day}`;
    },

    async enviarCierre() {
      let ok = true;
      let msg = "";

      if (parseFloat(this.form.abono) === 0) {
        ok = false;
        msg = msg + "<p>El Total del cierre no puede ser Cero</p>";
      }

      if (ok) {
        this.$confirm(
          `DESEA EJECUTAR EL CIERRE DE CAJA? Dólares: ${this.form.montoDolaresEfectivo}, Pesos: ${this.form.montoPesosEfectivo}, Bolívares: ${this.form.montoBolivaresEfectivo}`,
          "CIERRE DE CAJA",
          "question"
        )
          .then(() => {
            this.overlay = true;
            let fondoDolares;
            let fondoPesos;
            let fondoBolivares;

            if (this.efectivo[0].monto == null) {
              fondoDolares = 0;
            } else {
              fondoDolares =
                parseFloat(this.efectivo[0].monto) -
                parseFloat(this.form.montoDolaresEfectivo);
            }

            if (this.efectivo[1].monto == null) {
              fondoPesos = 0;
            } else {
              fondoPesos =
                parseFloat(this.efectivo[1].monto) -
                parseFloat(this.form.montoPesosEfectivo);
            }

            if (this.efectivo[1].monto == null) {
              fondoBolivares = 0;
            } else {
              fondoBolivares =
                parseFloat(this.efectivo[2].monto) -
                parseFloat(this.form.montoBolivaresEfectivo);
            }

            // Verificamos que tengamos un valor mumérico de lo contrario asignamos 0
            if (isNaN(fondoDolares)) fondoDolares = 0;
            if (isNaN(fondoPesos)) fondoPesos = 0;
            if (isNaN(fondoBolivares)) fondoBolivares = 0;

            const data = new URLSearchParams();
            data.set(
              "id_empleado",
              this.$store.state.login.dataUser.id_empleado
            );
            data.set("tasa_dolar", this.tasas.bolivar);
            data.set("tasa_peso", this.tasas.peso_colombiano);
            data.set("cierreDolaresEfectivo", this.form.montoDolaresEfectivo);
            data.set("cierrePesosEfectivo", this.form.montoPesosEfectivo);
            data.set(
              "cierreBolivaresEfectivo",
              this.form.montoBolivaresEfectivo
            );
            data.set("fondoDolares", fondoDolares);
            data.set("fondoPesos", fondoPesos);
            data.set("fondoBolivares", fondoBolivares);

            console.log("data:", data);

            this.$axios
              .post(`${this.$config.API}/cierre-de-caja-vendedor`, data)
              .then((res) => {
                this.form = {
                  detalle: "",
                  montoDolaresEfectivo: 0,
                  montoPesosEfectivo: 0,
                  montoBolivaresEfectivo: 0,
                  abono: 0, // Pago total o parcial
                };
                // this.overlay = false;
                // this.getDataReport(this.fechaActual()).then(() => {
                // })
                this.getDataCierre().then(() => (this.overlay = false));
              });
          })
          /* .then(() => {
            this.overlay = true;
            this.getDataCierre().then(() => (this.overlay = false));
          }) */
          .catch(() => {
            return false;
          });
      } else {
        this.$fire({
          title: "Se requieren datos",
          type: "error",
          html: msg,
        });
      }
    },

    updateMontoAbono() {
      // VAlidar montos máximos
      let ban = true;
      // LIMPIAR VALORES ERRONEOS
      if (this.form.montoBolivaresEfectivo === "")
        this.form.montoBolivaresEfectivo = 0;
      if (this.form.montoDolaresEfectivo === "")
        this.form.montoDolaresEfectivo = 0;
      if (this.form.montoPesosEfectivo === "") this.form.montoPesosEfectivo = 0;

      if (this.form.montoDolaresEfectivo > parseFloat(this.efectivo[0].monto)) {
        ban = false;
        this.form.montoDolaresEfectivo = 0;
        this.$fire({
          title: "Error en el monto",
          html: `<p>El monto ingresado excede el máximo en caja USD ${this.efectivo[0].monto}</p>`,
          type: "warning",
        });
      }

      if (this.form.montoPesosEfectivo > parseFloat(this.efectivo[1].monto)) {
        ban = false;
        this.form.montoPesosEfectivo = 0;
        this.$fire({
          title: "Error en el monto",
          html: `<p>El monto ingresado excede el máximo en caja COP ${this.efectivo[1].monto}</p>`,
          type: "warning",
        });
      }

      if (
        this.form.montoBolivaresEfectivo > parseFloat(this.efectivo[2].monto)
      ) {
        ban = false;
        this.form.montoBolivaresEfectivo = 0;
        this.$fire({
          title: "Error en el monto",
          html: `<p>El monto ingresado excede el máximo en caja Bs ${this.efectivo[2].monto}</p>`,
          type: "warning",
        });
      }

      if (ban) {
        let newVal;
        let montoBolivares;
        let montoDolares;
        let montoPesos;

        // RESET MONTO ABONO
        this.form.abono = 0;

        // CALCULO DOLARES
        montoDolares = parseFloat(this.form.montoDolaresEfectivo);

        // CALCULO EN PESOS
        montoPesos =
          parseFloat(this.form.montoPesosEfectivo) /
          parseFloat(this.tasas.peso_colombiano);

        // CALCULO EN BOLIVARES
        montoBolivares =
          parseFloat(this.form.montoBolivaresEfectivo) /
          parseFloat(this.tasas.bolivar);

        // SUMATOORIA DE TODAS LAS MONEDAS
        newVal = (montoDolares + montoPesos + montoBolivares).toFixed(2);
        this.form.abono = newVal;
        return newVal;
      }

      return false;
    },

    async getDataCierre() {
      await this.$axios
        .get(
          `${this.$config.API}/cierre-de-caja/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          const apiData = res.data.data;

          // The API now returns the total amount (cash + fund) directly.
          // We no longer need to sum the fund on the frontend.

          // Safely get the total for each currency, defaulting to 0.
          this.totDolares =
            apiData.dolares && apiData.dolares.length > 0
              ? parseFloat(apiData.dolares[0].monto) || 0
              : 0;
          this.totPesos =
            apiData.pesos && apiData.pesos.length > 0
              ? parseFloat(apiData.pesos[0].monto) || 0
              : 0;
          this.totBolivares =
            apiData.bolivares && apiData.bolivares.length > 0
              ? parseFloat(apiData.bolivares[0].monto) || 0
              : 0;

          // Update the `efectivo` array which is used by other parts of the component
          this.efectivo = [
            { moneda: "Dólares", monto: this.totDolares, tasa: 1 },
            {
              moneda: "Pesos",
              monto: this.totPesos,
              tasa: this.tasas.peso_colombiano,
            },
            {
              moneda: "Bolívares",
              monto: this.totBolivares,
              tasa: this.tasas.bolivar,
            },
          ];
        })
        .catch((err) => {
          console.error("Error al obtener datos de cierre de caja:", err);
          this.$fire({
            title: "Error de Conexión",
            html: "<p>No se pudieron cargar los datos de la caja. Por favor, intente de nuevo.</p>",
            type: "error",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  created() {
    this.overlay = true;
    this.getDataCierre().then(() => (this.overlay = false));
  },
};
</script>
