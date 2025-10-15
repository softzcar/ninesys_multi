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
          <b-container>
            <b-row>
              <b-col>
                <h1 class="mb-4">Retiro de efectivo</h1>
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
          <div v-if="tasasCargadas">
            <b-overlay
              :show="overlay"
              spinner-small
            >
              <div v-if="totalEnCaja > 0">
                <b-row>
                  <b-col>
                    <h2 class="mb-4">DINERO EN EFECTIVO:</h2>
                    <b-list-group class="mb-4">
                      <b-list-group-item>DOLARES: {{ caja[0].monto }}</b-list-group-item>
                      <b-list-group-item>PESOS: {{ caja[1]["monto"] }}</b-list-group-item>
                      <b-list-group-item>BOLIVARES: {{ caja[2]["monto"] }}</b-list-group-item>
                    </b-list-group>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <h2 class="mb-4">
                      TOTAL RETIRO: {{ totalRetiro }}
                      <b-button
                        size="lg"
                        class="ml-4"
                        variant="success"
                        @click="enviarRetiro"
                      >RETIRAR</b-button>
                    </h2>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <h4>Detalle del retiro</h4>
                    <b-form-textarea v-model="form.detalle"></b-form-textarea>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col
                    xl="3"
                    lg="3"
                    md="3"
                    sm="12"
                    xs="12"
                  >
                    <b-row>
                      <b-col>
                        <hr />
                        <h4 class="mb-4">Dólares {{ totalDolares }}</h4>
                      </b-col>
                    </b-row>

                    <b-row align-h="start">
                      <b-col>
                        <b-form-group
                          id="input-group-1"
                          label="EFECTIVO"
                          label-for="input-dolares-efectivo"
                          class="pl-2"
                        >
                          <b-form-input
                            id="input-dolares-efectivo"
                            type="number"
                            step="0.10"
                            min="0"
                            @change="updateMontoRetiro"
                            v-model="form.montoDolaresEfectivo"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                    </b-row>

                    <b-row>
                      <b-col>
                        <hr />
                        <h4 class="mb-4">Pesos {{ totalPesos }}</h4>
                      </b-col>
                    </b-row>

                    <b-row align-h="start">
                      <b-col>
                        <b-form-group
                          id="input-group-4"
                          label="EFECTIVO"
                          label-for="input-dolares-efectivo"
                          class="pl-2"
                        >
                          <b-form-input
                            id="input-pesos-efectivo"
                            type="number"
                            step="0.10"
                            min="0"
                            v-model="form.montoPesosEfectivo"
                            @change="updateMontoRetiro"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                    </b-row>

                    <b-row>
                      <b-col>
                        <hr />
                        <h4 class="mb-4">Bolívares {{ totalBolivares }}</h4>
                      </b-col>
                    </b-row>
                    <b-row align-h="start">
                      <b-col>
                        <b-form-group
                          id="input-group-6"
                          label="EFECTIVO"
                          label-for="input-bolivares-efectivo "
                          class="pl-2"
                        >
                          <b-form-input
                            id="input-bolivares-efectivo"
                            type="number"
                            step="0.10"
                            min="0"
                            v-model="form.montoBolivaresEfectivo"
                            @change="updateMontoRetiro"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                    </b-row>
                  </b-col>

                  <b-col
                    xl="9"
                    lg="9"
                    md="9"
                    sm="12"
                  >
                    <b-row>
                      <b-col>
                        <hr />
                        <h4 class="mb-4">Reporte de retiros</h4>
                      </b-col>
                    </b-row>

                    <b-row align-h="start">
                      <b-col>
                        <b-form-group label="Fecha de consulta">
                          <b-form-datepicker
                            v-model="fechaConsulta"
                            @input="realizarConsulta"
                          />
                          <b-table
                            striped
                            hover
                            :items="report"
                            :fields="fields"
                          >
                            <template #cell(moneda)="data">
                              {{ data.item.moneda }}
                              {{ data.item.metodo_pago }}
                            </template>

                            <template #cell(detalle_retiro)="data">
                              {{ data.item.detalle_retiro }}
                            </template>

                            <!-- <template v-slot:tfoot>
                            <tr>
                              <th></th>
                              <th>{{ sumatoriaDescuento }}</th>
                              <th>{{ sumatoriaTotal }}</th>
                              <th>{{ sumatoriaAbono }}</th>
                              <th></th>
                            </tr>
                          </template>-->
                          </b-table>
                        </b-form-group>
                      </b-col>
                    </b-row>
                  </b-col>
                </b-row>
              </div>
              <div v-else>
                <b-alert
                  show
                  variant="info"
                  class="mt-4"
                  >No hay fondos en efectivo disponibles para retirar.</b-alert
                >
              </div>
            </b-overlay>
          </div>

          <div v-else>
            <b-alert
              show
              variant="warning"
            >Por favor indique las Tasas del día</b-alert>
          </div>
        </b-container>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import mixinLogin from "~/mixins/mixin-login.js";
import { mapState } from "vuex";
import FormMonedas from "~/components/formMonedas.vue";

export default {
  components: { FormMonedas },
  data() {
    return {
      titulo: "Retiros",
      overlay: false,
      datosReporte: [],
      fechaConsulta: "",
      caja: [
        { monto: 0, moneda: "Dólares", tasa: 1, dolares: 0 },
        {
          monto: 0,
          moneda: "Pesos",
          tasa: this.$store.state.comerce.peso,
          dolares: 0,
        },
        {
          monto: 0,
          moneda: "Bolívares",
          tasa: this.$store.state.comerce.dolar,
          dolares: 0,
        },
      ],
      form: {
        detalle: "",
        montoDolaresEfectivo: 0,
        montoDolaresZelle: 0,
        montoDolaresPanama: 0,
        montoPesosEfectivo: 0,
        montoPesosTransferencia: 0,
        montoBolivaresEfectivo: 0,
        montoBolivaresPunto: 0,
        montoBolivaresPagomovil: 0,
        montoBolivaresTransferencia: 0,
        abono: 0, // Pago total o parcial
      },
      report: [],
      sumatoriaDescuento: 0,
      sumatoriaTotal: 0,
      sumatoriaAbono: 0,
      fields: [
        { key: "monto", label: "Monto" },
        { key: "moneda", label: `Moneda` },
        { key: "detalle_retiro", label: "Detalle" },
      ],
      /* fields: [
        { key: '_id', label: 'ID' },
        { key: 'pago_descuento', label: 'Descuento' },
        { key: 'pago_total', label: 'Total' },
        { key: 'pago_abono', label: 'Abono' },
        { key: 'moment', label: 'Fecha' }
      ]*/
    };
  },
  computed: {
    ...mapState("login", ["access", "dataUser", "tasas"]),

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
      this.updateMontoRetiro();
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

    totalRetiro() {
      // CALCULO DOLARES
      const montoDolares =
        parseFloat(this.form.montoDolaresEfectivo) +
        parseFloat(this.form.montoDolaresPanama) +
        parseFloat(this.form.montoDolaresZelle);

      // CALCULO EN PESOS (solo si tasa existe y > 0)
      let montoPesos = 0;
      if (this.tasas.peso_colombiano && parseFloat(this.tasas.peso_colombiano) > 0) {
        montoPesos =
          (parseFloat(this.form.montoPesosEfectivo) +
            parseFloat(this.form.montoPesosTransferencia)) /
          parseFloat(this.tasas.peso_colombiano);
      }

      // CALCULO EN BOLIVARES (solo si tasa existe y > 0)
      let montoBolivares = 0;
      if (this.tasas.bolivar && parseFloat(this.tasas.bolivar) > 0) {
        montoBolivares =
          (parseFloat(this.form.montoBolivaresEfectivo) +
            parseFloat(this.form.montoBolivaresPagomovil) +
            parseFloat(this.form.montoBolivaresPunto) +
            parseFloat(this.form.montoBolivaresTransferencia)) /
          parseFloat(this.tasas.bolivar);
      }

      let total = montoDolares + montoPesos + montoBolivares;

      if (isNaN(total)) total = 0;
      return total.toFixed(2);
    },

    totalEnCaja() {
      if (!this.caja || this.caja.length === 0) {
        return 0;
      }
      return this.caja.reduce(
        (total, current) => total + (parseFloat(current.monto) || 0),
        0
      );
    },
  },

  methods: {
    fechaActual() {
      let date = new Date();
      let day = `${date.getDate()}`.padStart(2, "0");
      let month = `${date.getMonth() + 1}`.padStart(2, "0");
      let year = date.getFullYear();

      return `${year}-${month}-${day}`;
    },

    /* totEnCaja(moneda) {
      let totales = []

      if (moneda === 'dolares') {
        if (this.caja[0].monto === undefined) {
          totales['dolares'] = 0
        } else {
          totales['dolares'] = this.caja[0].monto
        }
      }

      if (moneda === 'pesos') {
        if (this.caja[1].monto === undefined) {
          totales['pesos'] = 0
        } else {
          totales['pesos'] = this.caja[1].monto
        }
      }
      if (moneda === 'bolivares') {
        if (this.caja[2].monto === undefined) {
          totales['bolivares'] = 0
        } else {
          totales['bolivares'] = this.caja[2].monto
        }
      }

      return totales
    }, */

    async enviarRetiro() {
      let ok = true;
      let msg = "";

      if (this.form.detalle.trim().length === 0) {
        ok = false;
        msg = msg + "<p>Debe escribir el detalle del retiro</p>";
      }

      if (parseFloat(this.totalRetiro) === 0) {
        ok = false;
        msg = msg + "<p>El Total del retiro no puede ser Cero</p>";
      }

      if (ok) {
        this.overlay = true;
        const data = new URLSearchParams();
        data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
        data.set("form", this.form);
        data.set("tasa_dolar", this.tasas.bolivar);
        data.set("tasa_peso", this.tasas.peso_colombiano);
        data.set("montoDolaresEfectivo", this.form.montoDolaresEfectivo);
        data.set("montoDolaresZelle", this.form.montoDolaresZelle);
        data.set("montoDolaresPanama", this.form.montoDolaresPanama);
        data.set("montoPesosEfectivo", this.form.montoPesosEfectivo);
        data.set("montoPesosTransferencia", this.form.montoPesosTransferencia);
        data.set("montoBolivaresEfectivo", this.form.montoBolivaresEfectivo);
        data.set("montoBolivaresPunto", this.form.montoBolivaresPunto);
        data.set("montoBolivaresPagomovil", this.form.montoBolivaresPagomovil);
        data.set(
          "montoBolivaresTransferencia",
          this.form.montoBolivaresTransferencia
        );
        data.set("abono", this.form.abono);
        data.set("detalle", this.form.detalle);

        console.log("data:", data);

        await this.$axios
          .post(`${this.$config.API}/retiro`, data)
          .then((res) => {
            this.getDataReport(this.fechaActual()).then(() => {
              this.form = {
                detalle: "",
                montoDolaresEfectivo: 0,
                montoDolaresZelle: 0,
                montoDolaresPanama: 0,
                montoPesosEfectivo: 0,
                montoPesosTransferencia: 0,
                montoBolivaresEfectivo: 0,
                montoBolivaresPunto: 0,
                montoBolivaresPagomovil: 0,
                montoBolivaresTransferencia: 0,
                abono: 0, // Pago total o parcial
              };
              this.overlay = false;
            });
          });
      } else {
        this.$fire({
          title: "Se requieren datos",
          type: "error",
          html: msg,
        });
      }
    },

    realizarConsulta(val) {
      this.getDataReport(val);
    },

    updateMontoRetiro() {
      let newVal;
      let montoBolivares;
      let montoDolares;
      let montoPesos;

      // LIMPIAR VALORES ERRONEOS
      if (this.form.montoBolivaresEfectivo === "")
        this.form.montoBolivaresEfectivo = 0;
      if (this.form.montoBolivaresPagomovil === "")
        this.form.montoBolivaresPagomovil = 0;
      if (this.form.montoBolivaresPunto === "")
        this.form.montoBolivaresPunto = 0;
      if (this.form.montoBolivaresTransferencia === "")
        this.form.montoBolivaresTransferencia = 0;
      if (this.form.montoDolaresEfectivo === "")
        this.form.montoDolaresEfectivo = 0;
      if (this.form.montoDolaresPanama === "") this.form.montoDolaresPanama = 0;
      if (this.form.montoDolaresZelle === "") this.form.montoDolaresZelle = 0;
      if (this.form.montoPesosEfectivo === "") this.form.montoPesosEfectivo = 0;
      if (this.form.montoPesosTransferencia === "")
        this.form.montoPesosTransferencia = 0;

      // RESET MONTO ABONO
      this.form.abono = 0;

      // CALCULO DOLARES
      montoDolares =
        parseFloat(this.form.montoDolaresEfectivo) +
        parseFloat(this.form.montoDolaresPanama) +
        parseFloat(this.form.montoDolaresZelle);

      // CALCULO EN PESOS
      montoPesos =
        (parseFloat(this.form.montoPesosEfectivo) +
          parseFloat(this.form.montoPesosTransferencia)) /
        parseFloat(this.tasas.peso_colombiano);

      // CALCULO EN BOLIVARES
      montoBolivares =
        (parseFloat(this.form.montoBolivaresEfectivo) +
          parseFloat(this.form.montoBolivaresPagomovil) +
          parseFloat(this.form.montoBolivaresPunto) +
          parseFloat(this.form.montoBolivaresTransferencia)) /
        parseFloat(this.tasas.bolivar);

      // SUMATOORIA DE TODAS LAS MONEDAS
      console.log("dolares", montoDolares);
      console.log("pesos", montoPesos);
      console.log("bolivares", montoBolivares);
      newVal = (montoDolares + montoPesos + montoBolivares).toFixed(2);
      this.form.abono = newVal;

      if (isNaN(newVal)) newVal = 0;

      console.log("this.form.abono = ", newVal);
      return newVal;
    },

    async getRetiros(fecha) {
      await this.$axios
        .get(
          `${this.$config.API}/retiros/${fecha}/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          this.datosReporte = res.data.data.retiros;
          this.caja = res.data.data.caja;
          console.log("caja", this.caja);
        });
    },

    updateMontoRetiro2() {
      let newVal;
      let montoBolivares;
      let montoDolares;
      let montoPesos;

      // LIMPIAR VALORES ERRONEOS
      if (this.form.montoBolivaresEfectivo === "")
        this.form.montoBolivaresEfectivo = 0;
      if (this.form.montoBolivaresPagomovil === "")
        this.form.montoBolivaresPagomovil = 0;
      if (this.form.montoBolivaresPunto === "")
        this.form.montoBolivaresPunto = 0;
      if (this.form.montoBolivaresTransferencia === "")
        this.form.montoBolivaresTransferencia = 0;
      if (this.form.montoDolaresEfectivo === "")
        this.form.montoDolaresEfectivo = 0;
      if (this.form.montoDolaresPanama === "") this.form.montoDolaresPanama = 0;
      if (this.form.montoDolaresZelle === "") this.form.montoDolaresZelle = 0;
      if (this.form.montoPesosEfectivo === "") this.form.montoPesosEfectivo = 0;
      if (this.form.montoPesosTransferencia === "")
        this.form.montoPesosTransferencia = 0;

      // RESET MONTO ABONO
      this.form.abono = 0;

      // CALCULO DOLARES
      montoDolares =
        parseFloat(this.form.montoDolaresEfectivo) +
        parseFloat(this.form.montoDolaresPanama) +
        parseFloat(this.form.montoDolaresZelle);

      // CALCULO EN PESOS
      montoPesos =
        (parseFloat(this.form.montoPesosEfectivo) +
          parseFloat(this.form.montoPesosTransferencia)) /
        parseFloat(this.peso);

      // CALCULO EN BOLIVARES
      montoBolivares =
        (parseFloat(this.form.montoBolivaresEfectivo) +
          parseFloat(this.form.montoBolivaresPagomovil) +
          parseFloat(this.form.montoBolivaresPunto) +
          parseFloat(this.form.montoBolivaresTransferencia)) /
        parseFloat(this.dolar);

      // SUMATOORIA DE TODAS LAS MONEDAS
      console.log("dolares", montoDolares);
      console.log("pesos", montoPesos);
      console.log("bolivares", montoBolivares);
      newVal = (montoDolares + montoPesos + montoBolivares).toFixed(2);
      this.form.abono = newVal;
      console.log("this.form.abono = ", newVal);
      return newVal;
    },

    async getDataReport(fecha) {
      await this.$axios
        .get(
          `${this.$config.API}/retiros/${fecha}/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          this.report = res.data.data.retiros;
          /* this.report.forEach(item => {
          this.sumatoriaDescuento += Number(item.pago_descuento)
          this.sumatoriaTotal += Number(item.pago_total)
          this.sumatoriaAbono += Number(item.pago_abono)
        }) */
        });
    },
  },

  filters: {
    formatDate(value) {
      // Formatea la fecha en el formato dd-mm-yyyy
      const date = new Date(value);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
  },

  mounted() {
    this.fechaConsulta = this.fechaActual();
    // this.getDataReport(this.fechaConsulta)
    this.getRetiros(this.fechaConsulta);
  },

  mixins: [mixin, mixinLogin],
};
</script>
