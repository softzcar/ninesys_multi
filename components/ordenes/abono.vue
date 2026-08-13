<template>
  <div>
    <div>
      <span class="floatme">
        <b-button variant="primary" @click="$bvModal.show(modal)">
          <b-icon icon="credit-card"></b-icon>
        </b-button>
        <!-- {{ this.successMsg }} -->
      </span>
      <span v-if="showCalculatingBadge" class="floatme">
        <span class="floatme">
          <b-badge variant="light">CALCULANDO...</b-badge>
        </span>
      </span>
      <span v-else-if="parseFloat(calculated) === 0" class="floatme">
        <span class="floatme">
          <b-badge variant="success">PAGADO: {{ moneyFormatter(dataCalc.abono) }}</b-badge>
        </span>
      </span>
      <span v-else-if="parseFloat(calculated) > 0" class="floatme">
        <span class="floatme">
          <b-badge variant="info">RESTA: {{ moneyFormatter(calculated) }}</b-badge>
        </span>
      </span>
      <span v-else-if="parseFloat(calculated) < 0" class="floatme">
        <span class="floatme">
          <b-badge variant="warning">SOBREPAGO: {{ moneyFormatter(parseFloat(calculated) * -1) }}</b-badge>
        </span>
      </span>
      <span v-if="moneyFormatter(dataCalc.descuento) != '$0.00'" class="floatme">
        <strong>DESC: </strong>{{ moneyFormatter(dataCalc.descuento) }}
      </span>
      <!-- <span
        v-if="
          moneyFormatter(calculated) != '$0.00' &&
          moneyFormatter(dataCalc.descuento) != '$0.00'
        "
      >
        <b-badge variant="success">PAGADO</b-badge>
      </span> -->

      <b-modal :id="modal" :title="title" hide-footer size="xl">
        <b-overlay :show="overlay" spinner-small>
          <b-container>
            <b-row>
              <b-col>
                <!-- Ancho completo, alineado a la derecha por flex -- sin
                     reservar columnas vacías como antes (offset-6, 2026-08-04) -->
                <div class="d-flex justify-content-end">
                  <form-monedas />
                </div>
              </b-col>
            </b-row>
          </b-container>

          <b-container v-if="tasasCargadas">
            <b-row>
              <b-col class="mb-4">
                <p class="mt-4 mb-4">
                  <b-alert :show="showError" variant="danger">{{
                    errorMsg
                    }}</b-alert>
                  <b-alert :show="showSuccess" class="text-center" variant="success">{{ successMsg }}</b-alert>
                </p>
                <p>
                  <b-button :disabled="inputDisabled" class="mt-4" variant="success" block @click="enviarSaldo"><b-icon
                      icon="whatsapp" variant="light" size="sm"></b-icon>
                    Enviar saldo al cliente</b-button>
                </p>
                <h4 class="mt-4">Histórico</h4>
                <b-table sort-icon-left ref="table" responsive small :fields="campos" :items="dataTable.items">
                  <template #cell(orden)="data">
                    <linkSearch :key="data.item._id" :id="data.item.orden" />
                  </template>


                  <template #cell(_id)="data">
                    <span v-if="data.item.abono > 0">
                      {{ convertirAMonedaBase(data.item.moneda, data.item.abono, data.item.tasa) }}
                    </span>
                    <span v-else-if="data.item.nota_credito > 0" class="text-danger">
                      +{{ parseFloat(data.item.nota_credito || 0).toFixed(2) }}
                    </span>
                    <span v-else-if="data.item.descuento > 0" class="text-info">
                      -{{ parseFloat(data.item.descuento || 0).toFixed(2) }}
                    </span>
                    <span v-else>
                      {{ convertirAMonedaBase(data.item.moneda, data.item.monto, data.item.tasa) }}
                    </span>
                  </template>
                </b-table>
                <!-- <b-table
                                    ref="table"
                                    responsive
                                    small
                                    :items="dataTable.items"
                                    :fields="dataTable.fields"
                                    class="mb-4"
                                >
                                    <template #cell(moment)="data">
                                        {{ formatTimestamp(data.item.moment) }}
                                    </template>

                                    <template #cell(abono)="data">
                                        {{ moneyFormatter(data.item.abono) }}
                                    </template>

                                    <template #cell(descuento)="data">
                                        {{
                                            moneyFormatter(data.item.descuento)
                                        }}
                                    </template>
                                </b-table> -->

                <h4 class="mt-4">Estado actual</h4>
                <b-list-group>
                  <b-list-group-item>
                    <strong>Total orden: </strong>{{ moneyFormatter(dataCalc.total) }}
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Abonado: </strong>{{ moneyFormatter(dataCalc.abono) }}
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Descuentos: </strong>{{ moneyFormatter(dataCalc.descuento) }}
                  </b-list-group-item>
                  <b-list-group-item v-if="parseFloat(dataCalc.nota_credito) > 0">
                    <strong>Notas de Crédito: </strong>
                    <span class="text-danger">+{{ moneyFormatter(dataCalc.nota_credito) }}</span>
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Total: </strong>{{ moneyFormatter(dataCalc.total_abono_descuento) }}
                  </b-list-group-item>
                   <b-list-group-item :variant="parseFloat(calculated) < 0 ? 'warning' : (parseFloat(calculated) === 0 ? 'success' : 'info')">
                    <strong v-if="parseFloat(calculated) < 0">Sobrepago:</strong>
                    <strong v-else-if="parseFloat(calculated) === 0">Pagado:</strong>
                    <strong v-else>Resta:</strong>
                    <span>
                      {{ parseFloat(calculated) < 0 ? moneyFormatter(parseFloat(calculated) * -1) :
                        moneyFormatter(calculated) }} </span>
                  </b-list-group-item>
                </b-list-group>
              </b-col>
            </b-row>

            <b-row>
              <b-col xl="8" lg="8" md="12" sm="12">
                <hr />
                <ordenes-metodos-pago-dinamico ref="metodosPago" @change="onPagosChange" />
              </b-col>

              <b-col xl="4" lg="4" md="12" sm="12" class="mb-4">
                <b-row>
                  <b-col>
                    <div v-if="
                      this.$store.state.login.dataUser.departamento ===
                      'Administración'
                    ">
                      <hr />
                      <h4>Descuento</h4>
                    </div>
                  </b-col>
                </b-row>
                <b-row align-h="start">
                  <!-- <b-form-input min="0" :disabled="inputDisabled" v-model="value" type="number"
                  placeholder="Abono"></b-form-input>-->
                  <div v-if="
                    this.$store.state.login.dataUser.departamento ===
                    'Administración'
                  ">
                    <campo-decimal :disabled="inputDisabled" v-model="valueDescuento"
                      placeholder="Descuento" class="mt-4 mb-2"></campo-decimal>
                    <b-form-input :disabled="inputDisabled" v-model="valueDescuentoDetalle" type="text"
                      placeholder="Detalle del descuento (Obligatorio)" class="mb-4"></b-form-input>

                    <hr />
                    <h4>Nota de Crédito</h4>
                    <campo-decimal :disabled="inputDisabled" v-model="valueNotaCredito"
                      placeholder="Monto Nota de Crédito" class="mt-4 mb-2"></campo-decimal>
                    <b-form-input :disabled="inputDisabled" v-model="valueNotaCreditoDetalle" type="text"
                      placeholder="Detalle de la nota de crédito (Obligatorio)" class="mb-4"></b-form-input>
                  </div>
                  <b-button :disabled="inputDisabled || isSubmitting" class="mt-4" variant="success" block
                    @click="hacerAbono">
                    <span v-if="!isSubmitting">Abonar</span>
                    <span v-else><b-spinner small></b-spinner> Procesando...</span>
                  </b-button>
                </b-row>
              </b-col>
            </b-row>
          </b-container>
          <b-container v-else>
            <b-row>
              <b-col>
                <b-alert show variant="warning">Por favor indique las Tasas del día</b-alert>
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>
      </b-modal>
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import { mapState } from "vuex";
import FormMonedas from "~/components/formMonedas.vue";
import MetodosPagoDinamico from "~/components/ordenes/MetodosPagoDinamico.vue";

export default {
  mixins: [mixin],
  components: { FormMonedas, MetodosPagoDinamico },
  data() {
    return {
      inputDisabled: false,
      isSubmitting: false, // Prevenir múltiples clics
      showSuccess: false,
      showError: false,
      errorMsg: `ERROR`,
      successMsg: "OK",
      dataTable: { items: [] },
      showCalculatingBadge: true,
      dataCalc: {
        id_orden: this.idorden,
        abono: 0,
        descuento: 0,
        nota_credito: 0,
        total: 0,
        moment: null,
      },
      valueDescuento: 0,
      valueDescuentoDetalle: "",
      valueNotaCredito: 0,
      valueNotaCreditoDetalle: "",
      size: "md",
      title: `Abono a la Orden ${this.idorden}`,
      overlay: false,
      form: {
        abono: 0,
      },
      // Fase 7 del rediseño de monedas: payload `pagos` armado por
      // MetodosPagoDinamico.vue, listo para enviar a POST /orden/abono.
      pagosDinamicos: [],
      campos: [
        { key: "orden", label: "Orden", sortable: true },
        { key: "empleado", label: "Vendedor", sortable: true },
        { key: "moneda", label: "Moneda", sortable: true },
        { key: "metodo_pago", label: "Método", sortable: true },
        { key: "_id", label: "Total $" },
        { key: "detalle", label: "Detalles" },
        { key: "fecha", label: "Fecha" },
        { key: "hora", label: "Hora" },
      ],
    };
  },

  computed: {
    ...mapState("login", ["tasas"]),
    monedaBaseNombre() {
      return this.$store.state.login.dataEmpresa?.moneda_base?.nombre || "Dólares";
    },
    msgWhatsAppAbono() {
      let msg = "";
      const calculatedNum = parseFloat(this.calculated);
      if (calculatedNum <= 0) {
        msg = `Ha hecho un abono de ${parseFloat(this.form.abono).toFixed(2)} a la orden ${this.idorden}, ha cancelado el total de su deuda`;
      } else {
        //Cliente queda debiendo
        msg = `Ha hecho un abono de ${parseFloat(this.form.abono).toFixed(2)} a la orden ${this.idorden}, le queda un saldo pendiente de ${this.calculated} USD`;
      }
      return msg;
    },

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

    calculated() {
      const total = parseFloat(this.dataCalc.total) || 0;
      const abonado = parseFloat(this.dataCalc.abono) || 0;
      const descuento = parseFloat(this.dataCalc.descuento) || 0;
      const nuevoAbono = parseFloat(this.form.abono) || 0;
      const nuevoDescuento = parseFloat(this.valueDescuento) || 0;
      const notaCredito = parseFloat(this.dataCalc.nota_credito) || 0;
      const nuevaNotaCredito = parseFloat(this.valueNotaCredito) || 0;

      const resultado = (total - abonado - descuento - nuevoAbono - nuevoDescuento) + (notaCredito + nuevaNotaCredito);

      if (isNaN(resultado)) {
        return "0.00";
      }
      return resultado.toFixed(2);
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);

      return `modal-${rand}`;
    },
  },
  methods: {
    enviarSaldo() {
      if (parseFloat(this.calculated) === 0) {
        this.$fire({
          title: "El cliente no tiene saldo pendiente",
          html: ``,
          type: "info",
        });
      } else {
        this.$confirm(
          `¿Desea enviar un mensaje de WhatsApp al cliente?`,
          `Saldo Pendiente ${this.calculated} USD`,
          "question"
        )
          .then(() => {
            // this.overlay = true
            this.sendMessageClient(this.idorden, "cobrar", this.calculated);
          })
          .catch(() => {
            return false;
          });
      }
    },
    convertirAMonedaBase(moneda, monto, tasa) {
      const n_monto = parseFloat(monto) || 0;
      const n_tasa = parseFloat(tasa) || 1;

      let tot;
      if (moneda !== this.monedaBaseNombre) {
        tot = n_monto / n_tasa;
      } else {
        tot = n_monto;
      }

      return tot.toFixed(2);
    },

    // Fase 7 del rediseño de monedas: reemplaza updateMontoAbono() (que sumaba
    // campos hardcodeados montoDolaresEfectivo, etc.). MetodosPagoDinamico.vue
    // emite el total ya convertido a la moneda base de la empresa cada vez que
    // cambia cualquier monto/referencia.
    onPagosChange({ pagos, totalEnBase }) {
      this.pagosDinamicos = pagos;
      this.form.abono = totalEnBase.toFixed(2);
    },

    hacerAbono() {
      // Prevenir múltiples ejecuciones
      if (this.isSubmitting) {
        return;
      }

      // Validar referencia obligatoria de los métodos de pago -- antes de
      // mostrar el resumen de confirmación, no después (comportamiento
      // confuso reportado: se mostraba "Verifique los datos..." y solo al
      // confirmar aparecía el error de referencia faltante).
      if (this.$refs.metodosPago && !this.$refs.metodosPago.validar()) {
        this.$fire({
          title: "Falta la referencia de un pago",
          html: `<p>Hay un método de pago que requiere número de referencia y quedó vacío.</p>`,
          type: "warning",
        });
        return;
      }

      // Validar detalle de descuento
      if (parseFloat(this.valueDescuento) > 0 && !this.valueDescuentoDetalle) {
        this.$fire({
          title: "Falta detalle del descuento",
          html: `<p>El detalle del descuento es obligatorio cuando se aplica un monto.</p>`,
          type: "warning",
        });
        return;
      }

      // Validar detalle de nota de crédito
      if (parseFloat(this.valueNotaCredito) > 0 && !this.valueNotaCreditoDetalle) {
        this.$fire({
          title: "Falta detalle de la nota de crédito",
          html: `<p>El detalle de la nota de crédito es obligatorio cuando se aplica un monto.</p>`,
          type: "warning",
        });
        return;
      }

      let tmpAbono = parseFloat(this.form.abono); // Antiguamente se enviava un solo vaor ahora tenen=mos que envuar todo por semparado...
      let tmpDescuento = parseFloat(this.valueDescuento);
      let tmpNotaCredito = parseFloat(this.valueNotaCredito);

      // if (isNaN(tmpAbono) || this.form.abono.trim() === '' || !this.form.abono) {
      if (isNaN(tmpAbono) || !this.form.abono) {
        tmpAbono = 0;
      }

      if (isNaN(tmpDescuento) || !this.valueDescuento) {
        tmpDescuento = 0;
      }

      if (isNaN(tmpNotaCredito) || !this.valueNotaCredito) {
        tmpNotaCredito = 0;
      }

      if (!tmpAbono && !tmpDescuento && !tmpNotaCredito) {
        this.$fire({
          title: "Error en el monto",
          html: "<p>Ingrese el monto del abono, descuento o nota de crédito</p>",
          type: "warning",
        });
      } else if (this.calculated < 0) {
        // PERMITIR SI ES UNA NOTA DE CRÉDITO (Refund)
        const esNotaCredito = tmpNotaCredito > 0;

        // Calcular el saldo ANTES de los cambios actuales en el formulario
        const saldoInicial = (parseFloat(this.dataCalc.total) -
          parseFloat(this.dataCalc.abono) -
          parseFloat(this.dataCalc.descuento)) +
          parseFloat(this.dataCalc.nota_credito);

        // Si NO es nota de crédito Y el nuevo saldo es "más negativo" que el inicial, bloqueamos
        if (!esNotaCredito && parseFloat(this.calculated) < saldoInicial) {
          this.$fire({
            title: "Error en el monto",
            html: "<p>El monto ingresado excede el total de la orden</p>",
            type: "warning",
          });
          return;
        }

        // Si llegamos aquí con calculated < 0 pero es nota de crédito o reduce el sobrepago, permitimos continuar
      }
      let confirmMsg = `Verifique los datos: abono: ${tmpAbono}, descuento: ${tmpDescuento}`;
      if (tmpNotaCredito > 0) {
        confirmMsg += `, nota de crédito: ${tmpNotaCredito}`;
      }

      this.isSubmitting = true; // Bloquear botón

      this.$confirm(
        confirmMsg,
        "Abono",
        "info"
      ).then(() => {
        this.abonar().then(() => {
          this.sendMessage(this.idorden, this.msgWhatsAppAbono);
          this.valueDescuento = 0;
          this.valueNotaCredito = 0;
          this.valueNotaCreditoDetalle = "";
          this.getDataAbonos();
          this.$emit("reload");
          this.isSubmitting = false; // Desbloquear botón
        }).catch(() => {
          this.isSubmitting = false; // Desbloquear botón en caso de error
        });
      }).catch(() => {
        this.isSubmitting = false; // Desbloquear si cancela
      });
    },

    async abonar() {
      this.showError = false;
      this.showSuccess = false;

      if (this.$refs.metodosPago && !this.$refs.metodosPago.validar()) {
        this.errorMsg = "Hay un método de pago que requiere número de referencia y quedó vacío.";
        this.showError = true;
        return;
      }

      this.overlay = true;
      this.inputDisabled = true;
      const data = new URLSearchParams();
      data.set("id", this.idorden);
      data.set("empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("responsable", this.$store.state.login.dataUser.id_empleado);
      data.set("pagos", JSON.stringify(this.pagosDinamicos));
      data.set("abono", this.form.abono);
      data.set("tipoAbono", "Abono a Orden");

      // Descuento y Detalle
      if (!this.valueDescuento) {
        data.set("descuento", 0);
      } else {
        data.set("descuento", this.valueDescuento);
        data.set("descuentoDetalle", this.valueDescuentoDetalle);
      }

      // Nota de Crédito y Detalle
      if (!this.valueNotaCredito) {
        data.set("notaCredito", 0);
      } else {
        data.set("notaCredito", this.valueNotaCredito);
        data.set("notaCreditoDetalle", this.valueNotaCreditoDetalle);
      }

      console.log(`Data abono: ${data}`);

      await this.$axios
        .post(`${this.$config.API}/orden/abono`, data)
        .then((res) => {
          this.getData().then((res) => {
            this.overlay = false;
            this.valueDescuento = 0;
            this.valueDescuentoDetalle = "";
            this.valueNotaCredito = 0;
            this.valueNotaCreditoDetalle = "";
            this.form.abono = 0;
            this.pagosDinamicos = [];
            this.$refs.metodosPago?.resetear();

            if (this.calculated === 0) {
              this.showError = false;
              this.inputDisabled = true;
              this.successMsg = "La orden no tiene deuda pendiente";
              this.showSuccess = true;
            } else {
              this.showError = false;
              this.inputDisabled = false;
              this.successMsg = "El monto ha sido abonado";
              this.showSuccess = true;
            }

            this.overlay = false;
          });
          this.getData();
        })
        .catch((error) => {
          this.showSuccess = false;
          this.showError = true;
          this.inputDisabled = false;

          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            this.successMsg =
              "No se hizo el abono, el servidor no respondió: " +
              error.response.data;
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            this.successMsg =
              "No se hizo el abono, el servidor no respondió: " + error.request;
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            this.successMsg =
              "No se hizo el abono, el servidor no respondió: " + error.message;
          }
        });
    },

    async getDataAbonos() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/ordenes/abono-detale/${this.idorden}`)
        .then((resp) => {
          this.dataTable = resp.data;
          this.overlay = false;
        });
    },

    async getData() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/ordenes/abono/${this.idorden}`)
        .then((resp) => {
          this.dataCalc = resp.data.data;
          /* console.log(
            `Datos cargados respuesta para la orden ${this.idorden}`,
            this.dataCalc
          ) */
          if (this.calculated === 0) {
            this.showError = false;
            this.inputDisabled = true;
            this.successMsg = "La orden no tiene deuda pendiente";
            this.showSuccess = true;
          }
          this.overlay = false;
        });
    },
  },

  mounted() {
    Promise.all([this.getData(), this.getDataAbonos()]).then(() => {
      this.showCalculatingBadge = false;
    });
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => { });
  },
  props: ["idorden", "item", "reload"],
};
</script>
