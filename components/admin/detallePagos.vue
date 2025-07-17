<template>
  <div>
    <div>
      <b-button
        variant="primary"
        @click="$bvModal.show(modal)"
      >
        <b-icon icon="eye"></b-icon>
      </b-button>

      <b-modal
        :id="modal"
        :title="title"
        hide-footer
        size="xl"
      >
        <b-overlay
          :show="overlay"
          spinner-small
        >
          <div class="mb-4">
            <h4>Histórico</h4>
            <b-table
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
                {{ moneyFormatter(data.item.descuento) }}
              </template>
            </b-table>

            <h4 class="mt-4">Estado actual</h4>
            <b-list-group>
              <b-list-group-item>
                <strong>Total orden: </strong>{{ moneyFormatter(dataCalc.total) }}
              </b-list-group-item>
              <b-list-group-item>
                <strong>Monto abonado anterior: </strong>{{ moneyFormatter(dataCalc.abono) }}
              </b-list-group-item>
              <b-list-group-item>
                <strong>Resta:</strong>
                {{ moneyFormatter(calculated) }}
              </b-list-group-item>
            </b-list-group>
          </div>
          <div class="mt-4">
            <b-alert
              :show="showError"
              variant="danger"
            >{{
                            errorMsg
                            }}</b-alert>
            <b-alert
              :show="showSuccess"
              variant="success"
            >{{
                            successMsg
                            }}</b-alert>
          </div>
          <!-- <div class="mb-4">
            <h4 class="mt-4">Asigne el abono y descuento</h4>
            <b-form-input
              min="0"
              :disabled="inputDisabled"
              v-model="value"
              type="number"
              placeholder="Abono"
            ></b-form-input>
            <b-form-input
              min="0"
              :disabled="inputDisabled"
              v-model="valueDescuento"
              type="number"
              placeholder="Descuento"
              class="mt-2"
            ></b-form-input>
          </div>
          <b-button
            :disabled="inputDisabled"
            class="mt-3"
            variant="primary"
            block
            @click="hacerAbono"
            >Abonar</b-button
          > -->
        </b-overlay>
      </b-modal>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import mixin from "~/mixins/mixins.js";
import { timeout } from "q";
import { tmpdir } from "os";

export default {
  mixins: [mixin],

  data() {
    return {
      inputDisabled: false,
      showSuccess: false,
      showError: false,
      errorMsg: `ERROR`,
      successMsg: "OK",
      dataTable: [],
      dataCalc: {
        id_orden: this.idorden,
        abono: 0,
        descuento: 0,
        total: 0,
        moment: null,
      },
      value: "",
      valueDescuento: "",
      size: "md",
      title: `Abono a la Orden ${this.idorden}`,
      overlay: false,
    };
  },

  computed: {
    calculated() {
      let total = this.floatMe(this.dataCalc.total);
      let abonado = this.floatMe(this.dataCalc.abono);
      let descuento = this.floatMe(this.dataCalc.descuento);
      let nuevoAbono = 0;
      let nuevoDescuento = 0;

      if (this.value.trim() === "") {
        nuevoAbono = 0;
      } else {
        nuevoAbono = this.floatMe(this.value);
      }

      if (this.valueDescuento.trim() === "") {
        nuevoDescuento = 0;
      } else {
        nuevoDescuento = this.floatMe(this.valueDescuento);
      }

      let resultado = total - abonado - descuento - nuevoAbono - nuevoDescuento;

      return resultado;
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);

      return `modal-${rand}`;
    },
  },
  methods: {
    hacerAbono() {
      let tmpAbono = parseFloat(this.value);
      let tmpDescuento = parseFloat(this.valueDescuento);

      if (isNaN(tmpAbono) || this.value.trim() === "" || !this.value) {
        tmpAbono = 0;
      }

      if (
        isNaN(tmpDescuento) ||
        this.valueDescuento.trim() === "" ||
        !this.valueDescuento
      ) {
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
        this.$confirm(
          `Verifique los datos: abono: ${tmpAbono}, descuento: ${tmpDescuento}`,
          "Abono",
          "info"
        ).then(() => {
          this.abonar().then(() => {
            this.value = "";
            this.valueDescuento = "";
            this.getDataAbonos();
          });

          /* if (this.calculated < 0) {
            this.errorMsg = `El monto abonado excede el total de la orden`
            this.showError = true
          } else if (this.value === NaN) {
            this.errorMsg = `Ingrese el monto del abono`
            this.showError = true
          } else {
            // stuff here
          } */
        });
      }
    },

    async abonar() {
      this.showError = false;
      this.showSuccess = false;

      this.overlay = true;
      this.inputDisabled = true;
      const data = new URLSearchParams();
      data.set("monto", this.value);
      data.set("descuento", this.valueDescuento);
      data.set("id", this.idorden);
      data.set("empleado", this.$store.state.login.dataUser._id);

      console.log(`Data abono: ${data}`);

      await this.$axios
        .post(`${this.$config.API}/orden/abono`, data)
        .then((res) => {
          this.value = "";
          this.overlay = false;
          this.getData().then((res) => {
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
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      this.getData();
      this.getDataAbonos();
    });
  },
  props: ["idorden", "item"],
};
</script>
