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
        <b-overlay
          :show="overlay"
          spinner-small
        >
          <b-container v-if="
              this.accessModule.accessData.id_modulo === 2 ||
              accessModule.accessData.id_modulo === 1
            ">
            <b-row>
              <b-col>
                <h1 class="mb-4">{{ titulo }}</h1>
              </b-col>
            </b-row>

            <b-form
              class="mb-4"
              @submit="onSubmit"
            >
              <b-row>
                <b-col>
                  <h3>Fecha Inicio</h3>
                  <b-form-datepicker
                    class="mb-4"
                    v-model="fechaConsultaInicio"
                  />
                </b-col>
                <b-col>
                  <h3>Fecha Fin</h3>
                  <b-form-datepicker
                    class="mb-4"
                    v-model="fechaConsultaFin"
                  />
                </b-col>
              </b-row>
              <b-row>
                <b-col class="text-center">
                  <b-button
                    type="submit"
                    variant="primary"
                  >BUSCAR</b-button>
                </b-col>
              </b-row>
            </b-form>

            <b-card>
              <b-row>
                <b-col>
                  <h3 class="mt-4">Efectivo</h3>

                  <h3>DOLARES</h3>

                  <b-alert
                    v-if="dataReport.efectivo.dolares.length === 0"
                    variant="info"
                    show
                  >No hay dólares en la caja</b-alert>

                  <div v-else>
                    <b-table
                      striped
                      small
                      :items="dataReport.efectivo.dolares"
                      :fields="fields"
                      foot-clone
                    >
                      <template #cell(moneda)="data">
                        {{ data.item.moneda }}
                        {{ data.item.metodo_pago }}
                      </template>

                      <template #cell(monto)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.monto) }}
                        </div>
                      </template>

                      <template #cell(tasa)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.tasa) }}
                        </div>
                      </template>

                      <template #cell(dolares)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.dolares) }}
                        </div>
                      </template>
                    </b-table>

                    <b-row>
                      <b-col>
                        <h4 class="text-right mb-4">Total Dólares XXX</h4>
                      </b-col>
                    </b-row>
                  </div>

                  <h3>PESOS</h3>
                  <b-alert
                    v-if="dataReport.efectivo.pesos.length === 0"
                    variant="info"
                    show
                  >No hay dólares en la caja</b-alert>

                  <div v-else>
                    <b-table
                      striped
                      small
                      :items="dataReport.efectivo.pesos"
                      :fields="fields"
                      foot-clone
                    >
                      <template #cell(moneda)="data">
                        {{ data.item.moneda }}
                        {{ data.item.metodo_pago }}
                      </template>

                      <template #cell(monto)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.monto) }}
                        </div>
                      </template>

                      <template #cell(tasa)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.tasa) }}
                        </div>
                      </template>

                      <template #cell(dolares)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.dolares) }}
                        </div>
                      </template>
                    </b-table>

                    <b-row>
                      <b-col>
                        <h4 class="text-right mb-4">Total Pesos XXX</h4>
                      </b-col>
                    </b-row>
                  </div>

                  <h3>BOLIVARES</h3>

                  <b-alert
                    v-if="dataReport.efectivo.bolivares.length === 0"
                    variant="info"
                    show
                  >No hay dólares en la caja</b-alert>

                  <div v-else>
                    <b-table
                      striped
                      small
                      :items="dataReport.efectivo.bolivares"
                      :fields="fields"
                      foot-clone
                    >
                      <template #cell(moneda)="data">
                        {{ data.item.moneda }}
                        {{ data.item.metodo_pago }}
                      </template>

                      <template #cell(monto)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.monto) }}
                        </div>
                      </template>

                      <template #cell(tasa)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.tasa) }}
                        </div>
                      </template>

                      <template #cell(dolares)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.dolares) }}
                        </div>
                      </template>
                    </b-table>

                    <b-row>
                      <b-col>
                        <h4 class="text-right mb-4">Total Bolívares XXX</h4>
                      </b-col>
                    </b-row>
                  </div>
                </b-col>
              </b-row>

              <b-row>
                <b-col>
                  <h3>Retiros</h3>

                  <b-alert
                    v-if="dataReport.retiros.length === 0"
                    variant="info"
                    show
                  >No hay retiros</b-alert>

                  <div v-else>
                    <b-table
                      striped
                      small
                      :items="dataReport.retiros"
                      :fields="fields"
                      foot-clone
                    >
                      <template #cell(moneda)="data">
                        {{ data.item.moneda }}
                        {{ data.item.metodo_pago }}
                      </template>

                      <template #cell(monto)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.monto) }}
                        </div>
                      </template>

                      <template #cell(tasa)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.tasa) }}
                        </div>
                      </template>

                      <template #cell(dolares)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.dolares) }}
                        </div>
                      </template>
                    </b-table>

                    <b-row>
                      <b-col>
                        <h4 class="text-right mb-4">Total Retiros XXX</h4>
                      </b-col>
                    </b-row>
                  </div>
                </b-col>
              </b-row>

              <b-row>
                <b-col>
                  <h4 class="text-right mb-4">
                    Total Efectivo
                    <span class="money-result">$
                      {{
                        getTotal("efectivo", "num") - getTotal("retiros", "num")
                      }}</span>
                  </h4>
                </b-col>
              </b-row>
            </b-card>

            <b-card class="mt-4">
              <b-row>
                <b-col>
                  <h3>Zelle</h3>

                  <b-alert
                    v-if="dataReport.digital.length === 0"
                    variant="info"
                    show
                  >No hay Zelle</b-alert>

                  <div v-else>
                    <b-table
                      striped
                      small
                      :items="dataReport.digital.zelle"
                      :fields="fields"
                      foot-clone
                    >
                      <template #cell(moneda)="data">
                        {{ data.item.moneda }}
                        {{ data.item.metodo_pago }}
                      </template>

                      <template #cell(monto)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.monto) }}
                        </div>
                      </template>

                      <template #cell(tasa)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.tasa) }}
                        </div>
                      </template>

                      <template #cell(dolares)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.dolares) }}
                        </div>
                      </template>
                    </b-table>

                    <b-row>
                      <b-col>
                        <h4 class="text-right mb-4">Total Zelle XXX</h4>
                      </b-col>
                    </b-row>
                  </div>

                  <h3>Pago Móvil</h3>

                  <b-alert
                    v-if="dataReport.digital.length === 0"
                    variant="info"
                    show
                  >No hay Pago Móvil</b-alert>

                  <div v-else>
                    <b-table
                      striped
                      small
                      :items="dataReport.digital.pagomovil"
                      :fields="fields"
                      foot-clone
                    >
                      <template #cell(moneda)="data">
                        {{ data.item.moneda }}
                        {{ data.item.metodo_pago }}
                      </template>

                      <template #cell(monto)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.monto) }}
                        </div>
                      </template>

                      <template #cell(tasa)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.tasa) }}
                        </div>
                      </template>

                      <template #cell(dolares)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.dolares) }}
                        </div>
                      </template>
                    </b-table>

                    <b-row>
                      <b-col>
                        <h4 class="text-right mb-4">Total Pago Móvil XXX</h4>
                      </b-col>
                    </b-row>
                  </div>

                  <h3>Transferencias</h3>

                  <b-alert
                    v-if="dataReport.digital.length === 0"
                    variant="info"
                    show
                  >No hay Transferencias</b-alert>

                  <div v-else>
                    <b-table
                      striped
                      small
                      :items="dataReport.digital.transferencia"
                      :fields="fields"
                      foot-clone
                    >
                      <template #cell(moneda)="data">
                        {{ data.item.moneda }}
                        {{ data.item.metodo_pago }}
                      </template>

                      <template #cell(monto)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.monto) }}
                        </div>
                      </template>

                      <template #cell(tasa)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.tasa) }}
                        </div>
                      </template>

                      <template #cell(dolares)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.dolares) }}
                        </div>
                      </template>
                    </b-table>

                    <b-row>
                      <b-col>
                        <h4 class="text-right mb-4">
                          Total Transferencias XXX
                        </h4>
                      </b-col>
                    </b-row>
                  </div>
                </b-col>
              </b-row>
            </b-card>

            <b-row>
              <b-col>
                <hr />
                <h4 class="text-right mb-4 mt-4 pb-4">
                  Total General
                  <span class="money-result">$
                    {{
                      totalGeneral(
                        getTotal("efectivo", "num"),
                        getTotal("digital", "num"),
                        getTotal("retiros", "num")
                      )
                    }}</span>
                </h4>
              </b-col>
            </b-row>

          </b-container>
        </b-overlay>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixins.js";
import mixinLogin from "~/mixins/mixin-login.js";

export default {
  mixins: [mixin, mixinLogin],

  data() {
    return {
      titulo: "Reporte de caja",
      overlay: true,
      fechaConsultaInicio: null,
      fechaConsultaFin: null,
      dataReport: {
        efectivo: {
          dolares: [],
          pesos: [],
          bolivares: [],
        },
        digital: [],
        retiros: [],
      },
      retiros: [],
      pagos: [],
      total: 0,
      fields: [
        { key: "moneda", label: "Moneda" },
        {
          key: "monto",
          label: "Monto",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "tasa",
          label: "Tasa",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "dolares",
          label: "Total Dólares",
          thClass: "text-right",
          tdClass: "text-right",
        },
      ],
      fields_transferencias: [
        { key: "moneda", label: "Moneda" },
        { key: "tasa", label: "Tasa" },
        {
          key: "dolares",
          label: "Dólares",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "monto",
          label: "Monto",
          thClass: "text-right",
          tdClass: "text-right",
        },
      ],
      fieldsRetiros: [
        { key: "moneda", label: "Moneda" },
        {
          key: "monto",
          label: "Monto",
          thClass: "text-right",
          tdClass: "text-right",
        },
        { key: "detalle_retiro", label: "Detalle" },
      ],
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),

    sumPagos() {
      var result = [];
      this.pagos.forEach(function (item) {
        var key = item.metodo_pago + "-" + item.moneda;
        var found = result.find((el) => el.key === key);
        if (found) {
          found.monto = parseFloat(found.monto) + parseFloat(item.monto);
        } else {
          result.push({
            key,
            monto: item.monto,
            moneda: item.moneda,
            metodo_pago: item.metodo_pago,
          });
        }
      });
      return result;
    },

    sumRetiros() {
      var result = [];
      this.retiros.forEach(function (item) {
        var key = item.metodo_pago + "-" + item.moneda;
        var found = result.find((el) => el.key === key);
        if (found) {
          found.monto = parseFloat(found.monto) + parseFloat(item.monto);
        } else {
          result.push({
            key,
            monto: item.monto,
            moneda: item.moneda,
            metodo_pago: item.metodo_pago,
            detalle_retiro: item.detalle_retiro,
          });
        }
      });
      return result;
    },
  },

  methods: {
    getTotal(campo, curr) {
      return `${curr} - ${campo}`;
      let accumulatedDollars = 0;
      const dataToProcess = this.dataReport[campo];

      if (!dataToProcess) {
        return curr === "num" ? "0.00" : `${curr} 0.00`;
      }

      let items = [];
      if (campo === "efectivo") {
        // dataToProcess es un objeto {dolares:[], pesos:[], bolivares:[]}
        items = [
          ...(dataToProcess.dolares || []),
          ...(dataToProcess.pesos || []),
          ...(dataToProcess.bolivares || []),
        ];
      } else {
        // dataToProcess es un array para 'digital' y 'retiros'
        items = dataToProcess;
      }

      items.forEach((item) => {
        if (item && item.dolares !== null && !isNaN(parseFloat(item.dolares))) {
          accumulatedDollars += parseFloat(item.dolares);
        }
      });

      if (curr === "num") {
        return accumulatedDollars.toFixed(2);
      }
      return `${curr} ${accumulatedDollars.toFixed(2)}`;
    },

    onSubmit(event) {
      event.preventDefault();
      const fechaInicio = this.fechaConsultaInicio;
      const fechaFin = this.fechaConsultaFin;

      if (!fechaInicio || !fechaFin) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>Por favor seleccione ambas fechas</p>`,
          type: "warning",
        });
        return;
      }

      if (new Date(fechaInicio) > new Date(fechaFin)) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
          type: "warning",
        });
        return;
      }
      this.realizarConsulta();
    },

    realizarConsulta() {
      this.overlay = true;
      this.getCierre(this.fechaConsultaInicio, this.fechaConsultaFin).then(
        () => (this.overlay = false)
      );
      // this.getPagos(val)
      // this.getDataReport(val)
    },

    async getCierre(inicio, fin) {
      // Tipos de cierre de caja: diario, semanal, yyyy-mm-dd
      await this.$axios
        .get(
          `${this.$config.API}/reporte-de-caja/${inicio}/${fin}/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          this.dataReport = res.data.data;
          console.log("dataReport:", this.dataReport);
        });
    },

    fechaActual() {
      let date = new Date();
      let day = `${date.getDate()}`.padStart(2, "0");
      let month = `${date.getMonth() + 1}`.padStart(2, "0");
      let year = date.getFullYear();

      return `${year}-${month}-${day}`;
    },

    totalGeneral(efectivo, transferencias, retiros) {
      let result =
        parseFloat(efectivo) + parseFloat(transferencias) - parseFloat(retiros);
      return result.toFixed(2);
    },

    async getDataReport(fecha) {
      await this.$axios
        .get(
          `${this.$config.API}/retiros/${fecha}/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          this.retiros = res.data.data;
          /* this.report.forEach(item => {
          this.sumatoriaDescuento += Number(item.pago_descuento)
          this.sumatoriaTotal += Number(item.pago_total)
          this.sumatoriaAbono += Number(item.pago_abono)
        }) */
        });
    },

    async getPagos(fecha) {
      await this.$axios
        .get(`${this.$config.API}/pagos-ordenes/${fecha}`)
        .then((res) => {
          this.pagos = res.data.data;
          /* this.report.forEach(item => {
          this.sumatoriaDescuento += Number(item.pago_descuento)
          this.sumatoriaTotal += Number(item.pago_total)
          this.sumatoriaAbono += Number(item.pago_abono)
        }) */
        });
    },
  },

  beforeMount() {
    this.fechaConsultaInicio = this.fechaActual();
    this.fechaConsultaFin = this.fechaActual();
  },

  mounted() {
    this.getCierre(this.fechaConsultaInicio, this.fechaConsultaFin).then(
      () => (this.overlay = false)
    );
  },
};
</script>
