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
              <b-col>
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

            <b-row>
              <b-col>
                <h4>Detalle del abono</h4>
                <b-form-textarea v-model="form.detalle"></b-form-textarea>
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

              <!-- Modal para Abono a Órdenes -->
              <!-- <b-modal
                id="orderAbonoModal"
                v-model="showOrderAbonoModal"
                title="Abono a Orden Específica"
                size="lg"
                hide-footer
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
                  <p><strong>Saldo Pendiente:</strong> ${{ foundOrderDetails.saldoPendiente }}</p>
                  <p><strong>Saldo Pendiente:</strong> ${{ (foundOrderDetails.currentTotal - - foundOrderDetails.saldoPendiente).toFixed(2) }}</p>

                  <hr />
                  <h6>Realizar Abono Adicional:</h6>
                  <b-row>
                    <b-col
                      xl="6"
                      lg="6"
                      md="6"
                      sm="12"
                    >
                      <b-form-group label="Monto en Dólares (Efectivo)">
                        <b-form-input
                          type="number"
                          step="0.10"
                          min="0"
                          v-model="abonoOrderForm.montoDolaresEfectivo"
                        ></b-form-input>
                      </b-form-group>
                      <b-form-group label="Monto en Dólares (Zelle)">
                        <b-form-input
                          type="number"
                          step="0.10"
                          min="0"
                          v-model="abonoOrderForm.montoDolaresZelle"
                        ></b-form-input>
                      </b-form-group>
                      <b-form-group label="Monto en Dólares (Banesco Panamá)">
                        <b-form-input
                          type="number"
                          step="0.10"
                          min="0"
                          v-model="abonoOrderForm.montoDolaresPanama"
                        ></b-form-input>
                      </b-form-group>
                    </b-col>
                    <b-col
                      xl="6"
                      lg="6"
                      md="6"
                      sm="12"
                    >
                      <b-form-group label="Monto en Pesos (Efectivo)">
                        <b-form-input
                          type="number"
                          step="0.10"
                          min="0"
                          v-model="abonoOrderForm.montoPesosEfectivo"
                        ></b-form-input>
                      </b-form-group>
                      <b-form-group label="Monto en Pesos (Transferencia)">
                        <b-form-input
                          type="number"
                          step="0.10"
                          min="0"
                          v-model="abonoOrderForm.montoPesosTransferencia"
                        ></b-form-input>
                      </b-form-group>
                      <b-form-group label="Monto en Bolívares (Efectivo)">
                        <b-form-input
                          type="number"
                          step="0.10"
                          min="0"
                          v-model="abonoOrderForm.montoBolivaresEfectivo"
                        ></b-form-input>
                      </b-form-group>
                      <b-form-group label="Monto en Bolívares (Pago Móvil)">
                        <b-form-input
                          type="number"
                          step="0.10"
                          min="0"
                          v-model="abonoOrderForm.montoBolivaresPagomovil"
                        ></b-form-input>
                      </b-form-group>
                      <b-form-group label="Monto en Bolívares (Punto)">
                        <b-form-input
                          type="number"
                          step="0.10"
                          min="0"
                          v-model="abonoOrderForm.montoBolivaresPunto"
                        ></b-form-input>
                      </b-form-group>
                      <b-form-group label="Monto en Bolívares (Transferencia)">
                        <b-form-input
                          type="number"
                          step="0.10"
                          min="0"
                          v-model="abonoOrderForm.montoBolivaresTransferencia"
                        ></b-form-input>
                      </b-form-group>
                    </b-col>
                  </b-row>
                  <b-form-group label="Detalle del Abono:">
                    <b-form-textarea v-model="abonoOrderForm.detalle"></b-form-textarea>
                  </b-form-group>
                  <b-button
                    variant="success"
                    @click="sendOrderAbono"
                  >Registrar Abono</b-button>
                </div>
              </b-modal> -->

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
                <b-row>
                  <b-col
                    xl="6"
                    lg="6"
                    md="6"
                    sm="12"
                  >
                    <b-form-group label="Monto en Dólares (Efectivo)">
                      <b-form-input
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="abonoOrderForm.montoDolaresEfectivo"
                      ></b-form-input>
                    </b-form-group>
                    <b-form-group label="Monto en Dólares (Zelle)">
                      <b-form-input
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="abonoOrderForm.montoDolaresZelle"
                      ></b-form-input>
                    </b-form-group>
                    <b-form-group label="Monto en Dólares (Banesco Panamá)">
                      <b-form-input
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="abonoOrderForm.montoDolaresPanama"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                  <b-col
                    xl="6"
                    lg="6"
                    md="6"
                    sm="12"
                  >
                    <b-form-group label="Monto en Pesos (Efectivo)">
                      <b-form-input
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="abonoOrderForm.montoPesosEfectivo"
                      ></b-form-input>
                    </b-form-group>
                    <b-form-group label="Monto en Pesos (Transferencia)">
                      <b-form-input
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="abonoOrderForm.montoPesosTransferencia"
                      ></b-form-input>
                    </b-form-group>
                    <b-form-group label="Monto en Bolívares (Efectivo)">
                      <b-form-input
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="abonoOrderForm.montoBolivaresEfectivo"
                      ></b-form-input>
                    </b-form-group>
                    <b-form-group label="Monto en Bolívares (Pago Móvil)">
                      <b-form-input
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="abonoOrderForm.montoBolivaresPagomovil"
                      ></b-form-input>
                    </b-form-group>
                    <b-form-group label="Monto en Bolívares (Punto)">
                      <b-form-input
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="abonoOrderForm.montoBolivaresPunto"
                      ></b-form-input>
                    </b-form-group>
                    <b-form-group label="Monto en Bolívares (Transferencia)">
                      <b-form-input
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="abonoOrderForm.montoBolivaresTransferencia"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-form-group label="Detalle del Abono:">
                  <b-form-textarea v-model="abonoOrderForm.detalle"></b-form-textarea>
                </b-form-group>
                <b-button
                  variant="success"
                  @click="sendOrderAbono"
                >Registrar Abono</b-button>
              </div>
            </b-modal>

            <b-col
              xl="3"
              lg="3"
              md="3"
              sm="12"
            >
              <b-row>
                <b-col>
                  <hr />
                  <h4>Dólares {{ totalDolares }}</h4>
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
                      @change="updateMontoAbono"
                      v-model="form.montoDolaresEfectivo"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row align-h="start">
                <b-col>
                  <b-form-group
                    id="input-group-2"
                    label="ZELLE"
                    label-for="input-dolares-zelle"
                    class="pl-2"
                  >
                    <b-form-input
                      id="input-dolares-zelle"
                      type="number"
                      step="0.10"
                      min="0"
                      @change="updateMontoAbono"
                      v-model="form.montoDolaresZelle"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row align-h="start">
                <b-col>
                  <b-form-group
                    id="input-group-3"
                    label="BANESCO PANAMA"
                    label-for="input-dolares-zelle"
                    class="pl-2"
                  >
                    <b-form-input
                      id="input-dolares-zelle"
                      type="number"
                      step="0.10"
                      min="0"
                      @change="updateMontoAbono"
                      v-model="form.montoDolaresPanama"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-col>
            <b-col
              xl="3"
              lg="3"
              md="3"
              sm="12"
            >
              <b-row>
                <b-col>
                  <hr />
                  <h4>Pesos {{ totalPesos }}</h4>
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
                      @change="updateMontoAbono"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row align-h="start">
                <b-col>
                  <b-form-group
                    id="input-group-5"
                    label="TRANSFERENCIA"
                    label-for="input-dolares-zelle"
                    class="pl-2"
                  >
                    <b-form-input
                      id="input-pesos-dolares-zelle"
                      type="number"
                      step="0.10"
                      min="0"
                      v-model="form.montoPesosTransferencia"
                      @change="updateMontoAbono"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-col>
            <b-col
              xl="3"
              lg="3"
              md="3"
              sm="12"
            >
              <b-row>
                <b-col>
                  <hr />
                  <h4>Bolívares {{ totalBolivares }}</h4>
                </b-col>
              </b-row>

              <b-row align-h="start">
                <b-col>
                  <b-form-group
                    id="input-group-6"
                    label="PAGO MOVIL"
                    label-for="input-bolivares-pagomovil "
                    class="pl-2"
                  >
                    <b-form-input
                      id="input-bolivares-pagomovil"
                      type="number"
                      step="0.10"
                      min="0"
                      v-model="form.montoBolivaresPagomovil"
                      @change="updateMontoAbono"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row align-h="start">
                <b-col>
                  <b-form-group
                    id="input-group-6"
                    label="PUNTO"
                    label-for="input-bolivares-punto "
                    class="pl-2"
                  >
                    <b-form-input
                      id="input-bolivares-punto"
                      type="number"
                      step="0.10"
                      min="0"
                      v-model="form.montoBolivaresPunto"
                      @change="updateMontoAbono"
                    ></b-form-input>
                  </b-form-group>
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
                      @change="updateMontoAbono"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row align-h="start">
                <b-col>
                  <b-form-group
                    id="input-group-6"
                    label="TRANSFERENCIA"
                    label-for="input-bolivares-transferencia "
                    class="pl-2"
                  >
                    <b-form-input
                      id="input-bolivares-transferencia"
                      type="number"
                      step="0.10"
                      min="0"
                      v-model="form.montoBolivaresTransferencia"
                      @change="updateMontoAbono"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-col>
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

export default {
  mixins: [mixin],
  components: { FormMonedas },

  data() {
    return {
      titulo: "Otros Abonos",
      overlay: false,
      totalAbono: 0,
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
        // Formulario para el abono a la orden
        montoDolaresEfectivo: 0,
        montoDolaresZelle: 0,
        montoDolaresPanama: 0,
        montoPesosEfectivo: 0,
        montoPesosTransferencia: 0,
        montoBolivaresEfectivo: 0,
        montoBolivaresPunto: 0,
        montoBolivaresPagomovil: 0,
        montoBolivaresTransferencia: 0,
        detalle: "",
      },
      form: {
        abono: 0,
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
        data.set("tipoAbono", this.tipoAbono);

        console.log("data:", data);

        await this.$axios
          .post(`${this.$config.API}/otro-abono`, data)
          .then((res) => {
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
            // this.getDataReport(this.fechaActual()).then(() => {
            // })
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
      console.log("this.form.abono = ", newVal);
      return newVal;
    },

    handleTipoAbonoChange(value) {
      if (value === "abono_orden") {
        this.showOrderAbonoModal = true;
        this.orderNumberToAbono = null; // Limpiar el campo de número de orden
        this.foundOrderDetails = null; // Limpiar los detalles de la orden encontrada
        // Resetear el formulario de abono del modal
        this.abonoOrderForm = {
          montoDolaresEfectivo: 0,
          montoDolaresZelle: 0,
          montoDolaresPanama: 0,
          montoPesosEfectivo: 0,
          montoPesosTransferencia: 0,
          montoBolivaresEfectivo: 0,
          montoBolivaresPunto: 0,
          montoBolivaresPagomovil: 0,
          montoBolivaresTransferencia: 0,
          detalle: "",
        };
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

    async sendOrderAbono() {
      let ok = true;
      let msg = "";

      // Calcular el monto total del abono en el modal
      const abonoModalTotal = this.calculateAbonoModalTotal();

      if (parseFloat(abonoModalTotal) === 0) {
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
        data.set("tasa_dolar", this.tasas.bolivar);
        data.set("tasa_peso", this.tasas.peso_colombiano);
        // La diferencia clave: enviamos el id_orden
        data.set("id_orden", this.foundOrderDetails.orderNumber);
        data.set(
          "montoDolaresEfectivo",
          this.abonoOrderForm.montoDolaresEfectivo
        );
        data.set("montoDolaresZelle", this.abonoOrderForm.montoDolaresZelle);
        data.set("montoDolaresPanama", this.abonoOrderForm.montoDolaresPanama);
        data.set("montoPesosEfectivo", this.abonoOrderForm.montoPesosEfectivo);
        data.set(
          "montoPesosTransferencia",
          this.abonoOrderForm.montoPesosTransferencia
        );
        data.set(
          "montoBolivaresEfectivo",
          this.abonoOrderForm.montoBolivaresEfectivo
        );
        data.set(
          "montoBolivaresPunto",
          this.abonoOrderForm.montoBolivaresPunto
        );
        data.set(
          "montoBolivaresPagomovil",
          this.abonoOrderForm.montoBolivaresPagomovil
        );
        data.set(
          "montoBolivaresTransferencia",
          this.abonoOrderForm.montoBolivaresTransferencia
        );
        data.set("abono", abonoModalTotal);
        data.set("detalle", this.abonoOrderForm.detalle);
        data.set("tipoAbono", "Abono a orden"); // Identificador para el backend

        try {
          // Usamos el mismo endpoint que el formulario principal
          await this.$axios.post(`${this.$config.API}/otro-abono`, data);
          this.$fire({
            title: "Éxito",
            html: `Abono de $${abonoModalTotal} registrado para la orden ${this.foundOrderDetails.orderNumber}.`,
            type: "success",
          });
          this.showOrderAbonoModal = false;
          // Resetear el formulario principal y el del modal
          this.form = {
            abono: 0,
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
          };
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

    calculateAbonoModalTotal() {
      let montoDolares =
        parseFloat(this.abonoOrderForm.montoDolaresEfectivo || 0) +
        parseFloat(this.abonoOrderForm.montoDolaresPanama || 0) +
        parseFloat(this.abonoOrderForm.montoDolaresZelle || 0);

      let montoPesos =
        (parseFloat(this.abonoOrderForm.montoPesosEfectivo || 0) +
          parseFloat(this.abonoOrderForm.montoPesosTransferencia || 0)) /
        parseFloat(this.tasas.peso_colombiano);

      let montoBolivares =
        (parseFloat(this.abonoOrderForm.montoBolivaresEfectivo || 0) +
          parseFloat(this.abonoOrderForm.montoBolivaresPagomovil || 0) +
          parseFloat(this.abonoOrderForm.montoBolivaresPunto || 0) +
          parseFloat(this.abonoOrderForm.montoBolivaresTransferencia || 0)) /
        parseFloat(this.tasas.bolivar);

      let total = montoDolares + montoPesos + montoBolivares;
      if (isNaN(total)) total = 0;
      return total.toFixed(2);
    },

    /* NUEVO DE CIERRE DE CAJA */
    async getDataCierre() {
      await this.$axios
        .get(
          `${this.$config.API}/cierre-de-caja/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          this.pagos = res.data.data;
        });
    },
  },

  mounted() {
    this.overlay = true;
    this.getDataCierre().then(() => (this.overlay = false));
  },
};
</script>
