<template>
  <div>
    <!-- <a href="#" @click="$bvModal.show(modal)"> -->
    <!-- <a href="#" @click="$bvModal.show(modal)"> -->
    <b-button
      variant="info"
      @click="$bvModal.show(modal)"
      size="lg"
    >
      Ver Detalles
    </b-button>

    <b-modal
      :size="size"
      :title="title"
      :id="modal"
      hide-footer
    >
      <b-overlay
        :show="overlay"
        spinner-small
      >
        <b-container fluid>
          <b-row>
            <b-col>
              <div
                class="floatme"
                style="width: 100%; margin-bottom: 20px"
              >
                <span v-if="showbutton != 'false'">
                  <b-button
                    @click="imprimirReporte"
                    variant="primary"
                  >Imprimir</b-button>
                </span>
                <div class="mt-3">
                  <h5>Total a Pagar: <strong>{{ pagoTotal }}</strong></h5>
                </div>
                <div
                  v-if="item.pago === '0.00'"
                  class="alert alert-info mt-2"
                >
                  <small>Este empleado ya recibió su salario correspondiente al período actual.</small>
                </div>
              </div>
            </b-col>
          </b-row>
          <b-row class="justify-content-md-center">
            <b-col>
              <b-table
                responsive
                small
                striped
                :items="detalles"
                :fields="fields"
              >
                <template #cell(pago)="data">
                  $ {{ formatNumber(data.item.pago) }}
                </template>

                <template #cell(comision_tipo)="data">
                  <div>{{ data.item.salario_tipo }}</div>
                  <small v-if="data.item.comision_tipo" class="text-muted">
                    ({{ data.item.comision_tipo }})
                  </small>
                </template>

                <template #cell(comision)="data">
                  <span v-if="data.item.comision_tipo === 'porcentaje'">
                    {{ data.item.comision }}%
                  </span>
                  <span v-else>
                     $ {{ formatNumber(data.item.comision) }}
                  </span>
                </template>

                <template #cell(monto_abonado)="data">
                  <span v-if="tipoEmpleado === 'Vendedor'">
                    ${{ formatNumber(data.item.monto_abonado) }}
                  </span>
                  <span v-else>
                    ${{ formatNumber(data.item.monto_orden) }}
                  </span>
                </template>
                <template #cell(id_orden)="data">
                  <linkSearch
                    v-if="data.item.orden || data.item.id_orden"
                    class="floatme"
                    :id="data.item.orden || data.item.id_orden"
                  />
                  <diseno-viewImage
                    v-if="data.item.orden || data.item.id_orden"
                    class="floatme"
                    :id="data.item.orden || data.item.id_orden"
                  />
                  <span v-else class="text-muted small">Sin orden</span>
                </template>
              </b-table>
            </b-col>
          </b-row>

        </b-container>
      </b-overlay>
    </b-modal>

    <!-- Componente para impresión, oculto -->
    <div style="display: none;">
      <ReportePagoVendedor
        :datos-reporte="datosParaElReporte"
        ref="reporteParaImprimir"
      />
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import ReportePagoVendedor from "~/components/reportes/ReportePagoVendedor.vue";

export default {
  mixins: [mixin],
  components: {
    ReportePagoVendedor,
  },
  props: {
    item: {},
    detalles: {},
    products: {},
    reload: {},
    showbutton: {},
    tipoEmpleado: {
      type: String,
      default: 'Vendedor'
    }
  },
  data() {
    return {
      size: "xl",
      title: `${this.tipoEmpleado}: ${this.item.nombre}`,
      overlay: false,
      dataTable: [],
      fields: [
        {
          key: "id_orden",
          label: "Orden",
          thClass: "text-center",
          tdClass: "text-center",
        },
        // Eliminada columna Vendedor (redundante)
        {
          key: "comision_tipo",
          label: "Tipo Pago",
        },
        {
          key: "comision",
          label: "Comisión",
        },
        {
          key: "pago",
          label: "Monto Pagado",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "monto_abonado", // Usamos esta misma key pero cambiamos el contenido visualmente
          label: "Monto Orden",
          thClass: "text-right",
          tdClass: "text-right",
        },
      ],
    };
  },

  methods: {

    imprimirReporte() {
      const printContent = this.$refs.reporteParaImprimir.$el.innerHTML;
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const reportDate = `${day}-${month}-${year}`;
      const employeeName = this.item.nombre;
      const reportTitle = `Reporte de Pago - ${employeeName} - ${reportDate}`;

      const newWindow = window.open("", "_blank", "width=800,height=600");
      newWindow.document.write(`
        <html>
          <head>
            <title>${reportTitle}</title>
            <style>
              @page {
                size: portrait;
                margin: 0.5in;
              }
              body {
                font-family: Verdana, sans-serif;
                font-size: 9pt;
              }
              .report-container {
                color: #000;
              }
              .report-header {
                text-align: center;
                margin-bottom: 1rem;
              }
              .report-header h1, .report-header h2 {
                margin: 0;
              }
              .report-info {
                text-align: left;
                margin-top: 1rem;
                display: inline-block;
              }
              .report-info p {
                margin: 0.1rem 0;
                font-size: 9pt;
              }
              .report-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 1rem;
              }
              .report-table th, .report-table td {
                border: 1px solid #ccc;
                padding: 2px;
                text-align: left;
                font-size: 8pt;
              }
              .report-table th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.focus();
      setTimeout(() => {
        newWindow.print();
        newWindow.close();
      }, 250);
    },

    reloadMe() {
      this.$emit("reload");
    },

    filterProd(id_woo, campo) {
      // let myProd = this.products.filter((el) => el.cod === parseInt(id_woo));
      // return myProd[0][campo];
      return '';
    },
  },

  computed: {
    datosParaElReporte() {
      return {
        nombreEmpleado: this.item.nombre,
        totalPagar: `${this.item.pago}`,
        detalles: this.detalles,
      };
    },
    pagoTotal() {
      const total = this.detalles.reduce((acc, curr) => {
        const pagoDecimal = parseFloat(curr.pago);
        return acc + pagoDecimal;
      }, 0);

      return String.fromCharCode(36) + total.toFixed(2);
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },
};
</script>

<style>
.float-button {
  width: 100%;
  float: left;
  margin-bottom: 40px;
  margin-top: 1rem;
}

.image img {
  width: auto;
}
</style>
