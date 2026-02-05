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
              <b-col xs="12" sm="12" md="6" lg="6" xl="6" offset-md="6" offset-lg="6" offset-xl="6">
                <form-monedas />
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
                <b-table sort-icon-left ref="table" responsive small :fields="campos" :items="item">
                  <template #cell(orden)="data">
                    <linkSearch :key="data.item._id" :id="data.item.orden" />
                  </template>

                  <template #cell(monto)="data">
                    {{ data.item.monto.toFixed(2) }}
                  </template>

                  <template #cell(tasa)="data">
                    {{ data.item.tasa.toFixed(2) }}
                  </template>

                  <template #cell(_id)="data">
                    {{
                      usdConverter(
                        data.item.moneda,
                        data.item.monto,
                        data.item.tasa
                      )
                    }}
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
                  <b-list-group-item>
                    <strong>Total: </strong>{{ moneyFormatter(dataCalc.total_abono_descuento) }}
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Resta:</strong>
                    {{ moneyFormatter(calculated) }}
                  </b-list-group-item>
                </b-list-group>
              </b-col>
            </b-row>

            <b-row>
              <b-col xl="3" lg="3" md="6" sm="12">
                <b-row>
                  <b-col>
                    <hr />
                    <h4>Dólares {{ totalDolares }}</h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group id="input-group-1" label="EFECTIVO" label-for="input-dolares-efectivo" class="pl-2">
                      <b-form-input id="input-dolares-efectivo" type="number" step="0.10" min="0"
                        @change="updateMontoAbono" v-model="form.montoDolaresEfectivo"></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row align-h="start">
                  <b-col>
                    <b-form-group id="input-group-2" label="ZELLE" label-for="input-dolares-zelle" class="pl-2">
                      <b-form-input id="input-dolares-zelle" type="number" step="0.10" min="0"
                        @change="updateMontoAbono" v-model="form.montoDolaresZelle"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Detalle Zelle">
                      <b-form-input v-model="form.detalleZelle" placeholder="Detalle Zelle"></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group id="input-group-3" label="BANESCO PANAMA" label-for="input-dolares-zelle"
                      class="pl-2">
                      <b-form-input id="input-dolares-zelle" type="number" step="0.10" min="0"
                        @change="updateMontoAbono" v-model="form.montoDolaresPanama"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Detalle Banesco">
                      <b-form-input v-model="form.detallePanama" placeholder="Detalle Banesco"></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-col>

              <b-col xl="3" lg="3" md="6" sm="12">
                <b-row>
                  <b-col>
                    <hr />
                    <h4>Pesos {{ totalPesos }}</h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group id="input-group-4" label="EFECTIVO" label-for="input-dolares-efectivo" class="pl-2">
                      <b-form-input id="input-pesos-efectivo" type="number" step="0.10" min="0"
                        v-model="form.montoPesosEfectivo" @change="updateMontoAbono"></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row align-h="start">
                  <b-col>
                    <b-form-group id="input-group-5" label="TRANSFERENCIA" label-for="input-dolares-zelle" class="pl-2">
                      <b-form-input id="input-pesos-dolares-zelle" type="number" step="0.10" min="0"
                        v-model="form.montoPesosTransferencia" @change="updateMontoAbono"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Detalle Pesos">
                      <b-form-input v-model="form.detallePesosTransferencia" placeholder="Detalle Pesos"></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-col>

              <b-col xl="3" lg="3" md="6" sm="12" xs="12">
                <b-row>
                  <b-col>
                    <hr />
                    <h4>Bolívares {{ totalBolivares }}</h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group id="input-group-6" label="PAGO MOVIL" label-for="input-bolivares-pagomovil "
                      class="pl-2">
                      <b-form-input id="input-bolivares-pagomovil" type="number" step="0.10" min="0"
                        v-model="form.montoBolivaresPagomovil" @change="updateMontoAbono"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Detalle Pagomovil">
                      <b-form-input v-model="form.detallePagomovil" placeholder="Detalle Pagomovil"></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group id="input-group-6" label="PUNTO" label-for="input-bolivares-punto " class="pl-2">
                      <b-form-input id="input-bolivares-punto" type="number" step="0.10" min="0"
                        v-model="form.montoBolivaresPunto" @change="updateMontoAbono"></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group id="input-group-6" label="EFECTIVO" label-for="input-bolivares-efectivo "
                      class="pl-2">
                      <b-form-input id="input-bolivares-efectivo" type="number" step="0.10" min="0"
                        v-model="form.montoBolivaresEfectivo" @change="updateMontoAbono"></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group id="input-group-6" label="TRANSFERENCIA" label-for="input-bolivares-transferencia "
                      class="pl-2">
                      <b-form-input id="input-bolivares-transferencia" type="number" step="0.10" min="0"
                        v-model="form.montoBolivaresTransferencia" @change="updateMontoAbono"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Detalle Transferencia">
                      <b-form-input v-model="form.detalleBolivaresTransferencia"
                        placeholder="Detalle Transferencia"></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-col>

              <b-col xl="3" lg="3" md="6" sm="12" class="mb-4">
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
                    <b-form-input min="0" lab :disabled="inputDisabled" v-model="valueDescuento" type="number"
                      placeholder="Descuento" class="mt-4 mb-2"></b-form-input>
                    <b-form-input :disabled="inputDisabled" v-model="valueDescuentoDetalle" type="text"
                      placeholder="Detalle del descuento (Obligatorio)" class="mb-4"></b-form-input>
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

export default {
  mixins: [mixin],
  components: { FormMonedas },
  data() {
    return {
      inputDisabled: false,
      isSubmitting: false, // Prevenir múltiples clics
      showSuccess: false,
      showError: false,
      errorMsg: `ERROR`,
      successMsg: "OK",
      dataTable: [],
      showCalculatingBadge: true,
      dataCalc: {
        id_orden: this.idorden,
        abono: 0,
        descuento: 0,
        total: 0,
        moment: null,
      },
      valueDescuento: 0,
      valueDescuentoDetalle: "", // <-- Nuevo campo
      size: "md",
      title: `Abono a la Orden ${this.idorden}`,
      overlay: false,
      form: {
        abono: 0,
        montoDolaresEfectivo: 0,
        montoDolaresZelle: 0,
        detalleZelle: "",
        montoDolaresPanama: 0,
        detallePanama: "",
        montoPesosEfectivo: 0,
        montoPesosTransferencia: 0,
        detallePesosTransferencia: "",
        montoBolivaresEfectivo: 0,
        montoBolivaresPunto: 0,
        montoBolivaresPagomovil: 0,
        detallePagomovil: "",
        montoBolivaresTransferencia: 0,
        detalleBolivaresTransferencia: "",
      },
      campos: [
        {
          key: "orden",
          label: "Orden",
          sortable: true,
        },
        {
          key: "empleado",
          label: "Vendedor",
          sortable: true,
        },
        {
          key: "metodo_pago",
          label: "Método",
          sortable: true,
        },
        {
          key: "_id",
          label: "Total $",
        },
        {
          key: "detalle",
          label: "Detalles",
        },
        {
          key: "moneda",
          label: "Moneda",
          sortable: true,
        },
        {
          key: "monto",
          label: "Monto",
          sortable: true,
        },
        {
          key: "tasa",
          label: "Tasa",
          sortable: true,
        },
        {
          key: "fecha",
          label: "Fecha",
          sortable: true,
        },
        {
          key: "hora",
          label: "Hora",
        },
      ],
    };
  },

  computed: {
    ...mapState("login", ["tasas"]),
    msgWhatsAppAbono() {
      let msg = "";
      if (parseFloat(this.calculated) <= 0) {
        msg = `Ha hecho un abono de ${parseFloat(this.form.abono).toFixed(2)} a la orden ${this.idorden}, ha cancelado el total de su deuda`;
      } else {
        //Cliente queda debiendo
        const deuda =
          parseFloat(this.dataCalc.total) - parseFloat(this.dataCalc.abono);

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

    calculated() {
      let total = this.floatMe(this.dataCalc.total);
      let abonado = this.floatMe(this.dataCalc.abono);
      let descuento = this.floatMe(this.dataCalc.descuento);
      let nuevoAbono = 0;
      let nuevoDescuento = 0;

      if (!this.form.abono) {
        nuevoAbono = 0;
      } else {
        nuevoAbono = this.floatMe(this.form.abono);
      }

      // if (this.valueDescuento.trim() === '') {
      if (!this.valueDescuento) {
        nuevoDescuento = 0;
      } else {
        nuevoDescuento = this.floatMe(this.valueDescuento);
      }

      // Asegurar que no haya NaN en los cálculos
      if (isNaN(nuevoAbono)) nuevoAbono = 0;
      if (isNaN(nuevoDescuento)) nuevoDescuento = 0;

      let resultado = total - abonado - descuento - nuevoAbono - nuevoDescuento;

      if (isNaN(resultado)) {
        resultado = 0;
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
    usdConverter(moneda, monto, tasa) {
      // Validación de datos de entrada
      if (!isNaN(monto) && !isNaN(tasa)) {
        let tot;

        if (moneda === "Bolívares" || moneda === "Pesos") {
          tot = parseFloat(monto) / parseFloat(tasa);
        } else {
          tot = parseFloat(monto);
        }

        // Validación de NaN y división por cero
        if (isNaN(tot)) {
          return "Error en el cálculo"; // O cualquier otro mensaje de error
        } else {
          return tot.toFixed(2);
        }
      } else {
        return "Monto o tasa no válidos";
      }
    },

    updateMontoAbono() {
      let newVal;
      let montoBolivares;
      let montoDolares;
      let montoPesos;

      // LIMPIAR VALORES ERRONEOS
      if (!this.form.montoBolivaresEfectivo)
        this.form.montoBolivaresEfectivo = 0;
      if (!this.form.montoBolivaresPagomovil)
        this.form.montoBolivaresPagomovil = 0;
      if (!this.form.montoBolivaresPunto) this.form.montoBolivaresPunto = 0;
      if (!this.form.montoBolivaresTransferencia)
        this.form.montoBolivaresTransferencia = 0;
      if (!this.form.montoDolaresEfectivo) this.form.montoDolaresEfectivo = 0;
      if (!this.form.montoDolaresPanama) this.form.montoDolaresPanama = 0;
      if (!this.form.montoDolaresZelle) this.form.montoDolaresZelle = 0;
      if (!this.form.montoPesosEfectivo) this.form.montoPesosEfectivo = 0;
      if (!this.form.montoPesosTransferencia)
        this.form.montoPesosTransferencia = 0;

      // RESET MONTO ABONO
      this.form.abono = 0;

      // CALCULO DOLARES
      montoDolares =
        parseFloat(this.form.montoDolaresEfectivo) +
        parseFloat(this.form.montoDolaresPanama) +
        parseFloat(this.form.montoDolaresZelle);

      // CALCULO EN PESOS - Solo si tasas están cargadas
      if (this.tasasCargadas && this.tasas.peso_colombiano > 0) {
        montoPesos =
          (parseFloat(this.form.montoPesosEfectivo) +
            parseFloat(this.form.montoPesosTransferencia)) /
          parseFloat(this.tasas.peso_colombiano);
      } else {
        montoPesos = 0;
      }

      // CALCULO EN BOLIVARES - Solo si tasas están cargadas
      if (this.tasasCargadas && this.tasas.bolivar > 0) {
        montoBolivares =
          (parseFloat(this.form.montoBolivaresEfectivo) +
            parseFloat(this.form.montoBolivaresPagomovil) +
            parseFloat(this.form.montoBolivaresPunto) +
            parseFloat(this.form.montoBolivaresTransferencia)) /
          parseFloat(this.tasas.bolivar);
      } else {
        montoBolivares = 0;
      }

      // SUMATOORIA DE TODAS LAS MONEDAS
      newVal = (montoDolares + montoPesos + montoBolivares).toFixed(2);
      this.form.abono = newVal;
      return newVal;
    },

    hacerAbono() {
      // Prevenir múltiples ejecuciones
      if (this.isSubmitting) {
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

      let tmpAbono = parseFloat(this.form.abono); // Antiguamente se enviava un solo vaor ahora tenen=mos que envuar todo por semparado...
      let tmpDescuento = parseFloat(this.valueDescuento);

      // if (isNaN(tmpAbono) || this.form.abono.trim() === '' || !this.form.abono) {
      if (isNaN(tmpAbono) || !this.form.abono) {
        tmpAbono = 0;
      }

      if (isNaN(tmpDescuento) || !this.valueDescuento) {
        tmpDescuento = 0;
      }

      if (!tmpAbono && !tmpDescuento) {
        this.$fire({
          title: "Error en el monto",
          html: "<p>Ingrese el monto del abono y/o el descuento</p>",
          type: "warning",
        });
      } else if (this.calculated < 0) {
        this.$fire({
          title: "Error en el monto",
          html: "<p>El monto ingresado excede el total de la orden</p>",
          type: "warning",
        });
      } else {
        this.isSubmitting = true; // Bloquear botón
        
        this.$confirm(
          `Verifique los datos: abono: ${tmpAbono}, descuento: ${tmpDescuento}`,
          "Abono",
          "info"
        ).then(() => {
          this.abonar().then(() => {
            this.sendMessage(this.idorden, this.msgWhatsAppAbono);
            this.valueDescuento = 0;
            this.getDataAbonos();
            this.$emit("reload");
            this.isSubmitting = false; // Desbloquear botón
          }).catch(() => {
            this.isSubmitting = false; // Desbloquear botón en caso de error
          });
        }).catch(() => {
          this.isSubmitting = false; // Desbloquear si cancela
        });
      }
    },

    async abonar() {
      this.showError = false;
      this.showSuccess = false;

      this.overlay = true;
      this.inputDisabled = true;
      const data = new URLSearchParams();
      data.set("id", this.idorden);
      data.set("empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("responsable", this.$store.state.login.dataUser.id_empleado);
      //TODO aqui vamos a enviar cada metodod e pago por separado...
      data.set("tasa_dolar", this.tasas.bolivar); // Changed from bolivar to dolar
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
      data.set("abono", this.form.abono); // Assuming totalAbono is meant to be this.form.abono
      data.set("tipoAbono", "Abono a orden");

      data.set("detalleZelle", this.form.detalleZelle);
      data.set("detallePanama", this.form.detallePanama);
      data.set(
        "detallePesosTransferencia",
        this.form.detallePesosTransferencia
      );
      data.set("detallePagomovil", this.form.detallePagomovil);
      data.set(
        "detalleBolivaresTransferencia",
        this.form.detalleBolivaresTransferencia
      );

      // Descuento y Detalle
      if (!this.valueDescuento) {
        data.set("descuento", 0);
      } else {
        data.set("descuento", this.valueDescuento);
        data.set("descuentoDetalle", this.valueDescuentoDetalle); // <-- Enviar detalle
      }

      console.log(`Data abono: ${data}`);

      await this.$axios
        .post(`${this.$config.API}/orden/abono`, data)
        .then((res) => {
          this.getData().then((res) => {
            this.overlay = false;
            this.valueDescuento = 0;
            this.valueDescuentoDetalle = "";
            this.form = {
              abono: 0,
              montoDolaresEfectivo: 0,
              montoDolaresZelle: 0,
              montoDolaresPanama: 0,
              montoPesosEfectivo: 0,
              montoPesosTransferencia: 0,
              montoBolivaresEfectivo: 0,
              montoBolivaresPunto: 0,
              montoBolivaresPagomovil: 0,
              montoBolivaresTransferencia: 0,
            };

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

    async enviarAbono() {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("responsable", this.$store.state.login.dataUser.id_empleado);
      // data.set('form', this.form)
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
      data.set("tipoAbono", "Abono a orden");

      console.log("data:", data);

      await this.$axios
        .post(`${this.$config.API}/otro-abono`, data)
        .then((res) => {
          this.valueDescuento = 0;
          this.form = {
            abono: 0,
            montoDolaresEfectivo: 0,
            montoDolaresZelle: 0,
            montoDolaresPanama: 0,
            montoPesosEfectivo: 0,
            montoPesosTransferencia: 0,
            montoBolivaresEfectivo: 0,
            montoBolivaresPunto: 0,
            montoBolivaresPagomovil: 0,
            montoBolivaresTransferencia: 0,
          };
          this.overlay = false;
          // this.getDataReport(this.fechaActual()).then(() => {
          // })
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
