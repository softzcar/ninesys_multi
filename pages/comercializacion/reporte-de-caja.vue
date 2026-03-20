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
                <b-col md="4" v-if="currentDepartamentId === 7">
                  <h3>Vendedor</h3>
                  <b-form-select
                    v-model="vendedorSeleccionado"
                    :options="vendedoresOptions"
                    class="mb-4"
                  >
                    <template #first>
                      <b-form-select-option :value="null" disabled>-- Seleccione un vendedor --</b-form-select-option>
                      <b-form-select-option :value="0">Todos los vendedores</b-form-select-option>
                    </template>
                  </b-form-select>
                </b-col>
                <b-col md="4">
                  <h3>Fecha Inicio</h3>
                  <b-form-datepicker
                    class="mb-4"
                    v-model="fechaConsultaInicio"
                  />
                </b-col>
                <b-col md="4">
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
                    size="lg"
                    class="px-5 shadow-sm"
                  >
                    <b-icon icon="search" class="mr-2"></b-icon> GENERAR REPORTE
                  </b-button>
                </b-col>
              </b-row>
            </b-form>

            <div v-if="!reporteGenerado" class="py-5 text-center">
              <b-icon icon="info-circle" variant="info" font-scale="4" class="mb-4"></b-icon>
              <h2 class="text-muted">Seleccione un vendedor y un rango de fechas para generar el reporte</h2>
              <p class="text-muted small">Puede elegir un vendedor específico o visualizar los totales de toda la empresa.</p>
            </div>

            <div v-else>
              <b-card>
                <b-row>
                  <b-col>
                    <h3 class="mt-4">Efectivo</h3>

                  <h3>DOLARES</h3>

                  <b-alert
                    v-if="!dataReport.efectivo || !dataReport.efectivo.dolares || dataReport.efectivo.dolares.length === 0"
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
                        <h4 class="text-right mb-4">Total Dólares {{ totalDolares }}</h4>
                      </b-col>
                    </b-row>
                  </div>

                  <h3>PESOS</h3>
                  <b-alert
                    v-if="!dataReport.efectivo || !dataReport.efectivo.pesos || dataReport.efectivo.pesos.length === 0"
                    variant="info"
                    show
                  >No hay pesos en la caja</b-alert>

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
                        <h4 class="text-right mb-4">Total Pesos {{ totalPesos }}</h4>
                      </b-col>
                    </b-row>
                  </div>

                  <h3>BOLIVARES</h3>

                  <b-alert
                    v-if="!dataReport.efectivo || !dataReport.efectivo.bolivares || dataReport.efectivo.bolivares.length === 0"
                    variant="info"
                    show
                  >No hay bolívares en la caja</b-alert>

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
                        <h4 class="text-right mb-4">Total Bolívares {{ totalBolivares }}</h4>
                      </b-col>
                    </b-row>
                  </div>
                </b-col>
              </b-row>

              <b-row>
                <b-col>
                  <h3>Retiros</h3>

                  <b-alert
                    v-if="!dataReport.retiros || dataReport.retiros.length === 0"
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
                        <h4 class="text-right mb-4">Total Retiros {{ totalRetiros }}</h4>
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
                    v-if="!dataReport.digital || !dataReport.digital.zelle || dataReport.digital.zelle.length === 0"
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
                        <h4 class="text-right mb-4">Total Zelle {{ totalZelle }}</h4>
                      </b-col>
                    </b-row>
                  </div>

                  <h3>Pago Móvil</h3>

                  <b-alert
                    v-if="!dataReport.digital || !dataReport.digital.pagomovil || dataReport.digital.pagomovil.length === 0"
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
                        <h4 class="text-right mb-4">Total Pago Móvil {{ totalPagoMovil }}</h4>
                      </b-col>
                    </b-row>
                  </div>

                  <h3>Transferencias</h3>

                  <b-alert
                    v-if="!dataReport.digital || !dataReport.digital.transferencia || dataReport.digital.transferencia.length === 0"
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
                          Total Transferencias {{ totalTransferencias }}
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
          </div>


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
      overlay: false,
      reporteGenerado: false,
      vendedorSeleccionado: null,
      vendedores: [],
      fechaConsultaInicio: null,
      fechaConsultaFin: null,
      dataReport: {
        efectivo: {
          dolares: [],
          pesos: [],
          bolivares: [],
        },
        digital: {
          zelle: [],
          pagomovil: [],
          punto: [],
          transferencia: [],
        },
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
    ...mapState("login", ["dataUser", "access", "currentDepartamentId"]),

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

    totalDolares() {
      return this.dataReport.efectivo.dolares.reduce((total, item) => total + parseFloat(item.dolares || 0), 0).toFixed(2);
    },

    totalPesos() {
      return this.dataReport.efectivo.pesos.reduce((total, item) => total + parseFloat(item.dolares || 0), 0).toFixed(2);
    },

    totalBolivares() {
      return this.dataReport.efectivo.bolivares.reduce((total, item) => total + parseFloat(item.dolares || 0), 0).toFixed(2);
    },

    totalRetiros() {
      return this.dataReport.retiros.reduce((total, item) => total + parseFloat(item.dolares || 0), 0).toFixed(2);
    },

    totalZelle() {
      return (this.dataReport.digital.zelle || []).reduce((total, item) => total + parseFloat(item.dolares || 0), 0).toFixed(2);
    },

    totalPagoMovil() {
      return (this.dataReport.digital.pagomovil || []).reduce((total, item) => total + parseFloat(item.dolares || 0), 0).toFixed(2);
    },

    totalTransferencias() {
      return (this.dataReport.digital.transferencia || []).reduce((total, item) => total + parseFloat(item.dolares || 0), 0).toFixed(2);
    },

    vendedoresOptions() {
      return this.vendedores.map((v) => ({
        value: v._id,
        text: v.nombre,
      }));
    },
  },

  methods: {
    getTotal(campo, curr) {
      let accumulatedDollars = 0;
      const dataToProcess = this.dataReport[campo];

      if (!dataToProcess) {
        return curr === "num" ? 0 : `${curr} 0.00`;
      }

      let items = [];
      if (campo === "efectivo") {
        items = [
          ...(dataToProcess.dolares || []),
          ...(dataToProcess.pesos || []),
          ...(dataToProcess.bolivares || []),
        ];
      } else if (campo === "digital") {
        items = [
          ...(dataToProcess.zelle || []),
          ...(dataToProcess.pagomovil || []),
          ...(dataToProcess.punto || []),
          ...(dataToProcess.transferencia || []),
        ];
      } else {
        items = dataToProcess || [];
      }

      accumulatedDollars = items.reduce((total, item) => {
        return total + (parseFloat(item.dolares) || 0);
      }, 0);

      if (curr === "num") {
        return accumulatedDollars;
      }
      return `${curr} ${accumulatedDollars.toFixed(2)}`;
    },

    onSubmit(event) {
      event.preventDefault();
      const fechaInicio = this.fechaConsultaInicio;
      const fechaFin = this.fechaConsultaFin;

      if (this.vendedorSeleccionado === null || !fechaInicio || !fechaFin) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>Por favor seleccione un vendedor y un rango de fechas</p>`,
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
      this.getCierre(this.fechaConsultaInicio, this.fechaConsultaFin, this.vendedorSeleccionado).then(
        () => {
          this.overlay = false;
          this.reporteGenerado = true;
        }
      );
    },

    async getCierre(inicio, fin, id_vendedor) {
      await this.$axios
        .get(
          `${this.$config.API}/reporte-de-caja/${inicio}/${fin}/${id_vendedor}`
        )
        .then((res) => {
          const baseData = {
            efectivo: { dolares: [], pesos: [], bolivares: [] },
            digital: { zelle: [], pagomovil: [], punto: [], transferencia: [] },
            retiros: [],
          };

          const apiData = res.data.data || {};
          
          this.dataReport = {
            ...baseData,
            ...apiData,
            efectivo: { ...baseData.efectivo, ...(apiData.efectivo || {}) },
            digital: { ...baseData.digital, ...(apiData.digital || {}) },
            retiros: apiData.retiros || [],
          };

          this.vendedores = res.data.vendedores || [];
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
    this.overlay = true;
    // Si no es administrador (ID 7), fijar el vendedor como el propio empleado
    if (this.currentDepartamentId !== 7) {
      this.vendedorSeleccionado = this.dataUser.id_empleado;
    }

    // Cargar vendedores inicialmente (usamos el repo de reporte de caja para traer la lista)
    // Si no es administrador, cargamos solo sus datos
    const idConsulta = this.currentDepartamentId === 7 ? 0 : this.dataUser.id_empleado;

    this.getCierre(this.fechaConsultaInicio, this.fechaConsultaFin, idConsulta).then(() => {
      this.overlay = false;
    });
  },
};
</script>
