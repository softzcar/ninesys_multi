<template>
  <div>
    <a href="#" @click="$bvModal.show(modal)">
      {{ item.nombre }}
    </a>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-overlay :show="overlay" spinner-small>
        <b-container fluid>
          <b-row>
            <b-col>
              <div class="floatme" style="width: 100%; margin-bottom: 20px">
                <span v-if="showbutton != 'false'">
                  <b-button
                    @click="pagarEmpleado(item.id_empleado)"
                    variant="success"
                    >PAGAR {{ pagoTotal }}</b-button
                  >
                  <b-button
                    @click="imprimirReporte"
                    variant="primary"
                    class="ml-2"
                    >Imprimir</b-button
                  >
                </span>

                <span
                  style="font-size: 1.4rem; font-weight: bold; padding: 12px"
                >
                  Total piezas {{ obtenerTotales(detalles) }}
                </span>
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
                <template #cell(orden)="data">
                  <linkSearch :id="data.item.orden" />
                </template>
                <template #cell(porcentaje)="data">
                  <admin-ComisionesProductosInput
                    :item="data.item"
                    :idprod="filterProd(data.item.id_woo, 'cod')"
                    :attributes="filterProd(data.item.id_woo, 'attributes')"
                    :categories="filterProd(data.item.id_woo, 'categories')"
                    @reload="reloadMe"
                    :lock="data.item.fecha_pago"
                    :departamento="data.item.departamento"
                    :comisionEmp="data.item.comision"
                  />
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
    </b-modal>

    <!-- Componente para impresión, oculto -->
    <div style="display: none;">
      <ReportePagoEmpleado
        :datos-reporte="datosParaElReporte"
        ref="reporteParaImprimir"
      />
    </div>
  </div>
</template>

<script>
import ReportePagoEmpleado from '~/components/reportes/ReportePagoEmpleado.vue'

export default {
  components: {
    ReportePagoEmpleado,
  },
  data() {
    return {
      size: 'xl',
      title: `Empleado: ${this.item.nombre}`,
      overlay: false,
      dataTable: [],
      fields: [
        {
          key: 'orden',
          label: 'Orden',
        },
        {
          key: 'nombre',
          label: 'Empleado',
        },
        {
          key: 'departamento',
          label: 'Departamento',
        },
        {
          key: 'dia',
          label: 'Día',
        },
        {
          key: 'semana',
          label: 'Semana',
        },
        {
          key: 'comision_tipo',
          label: 'Tipo',
        },
        {
          key: 'cantidad',
          label: 'Cantidad',
        },
        {
          key: 'porcentaje',
          label: 'Comisión',
        },
        {
          key: 'pago',
          label: 'Pago',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
        {
          key: 'fecha',
          label: 'Fecha',
        },
      ],
    }
  },

  methods: {
    imprimirReporte() {
      const printContent = this.$refs.reporteParaImprimir.$el.innerHTML;
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const reportDate = `${day}-${month}-${year}`;
      const employeeName = this.item.nombre;
      const reportTitle = `Reporte de Pago - ${employeeName} - ${reportDate}`;

      const newWindow = window.open('', '_blank', 'width=800,height=600');
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
                font-size: 8pt; /* Smaller font for the table */
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
    obtenerTotales(pagos) {
      if (!Array.isArray(pagos)) {
        return 0
      }
      let sumatoriaCantidad = 0
      pagos.forEach((pago) => {
        const cantidad = parseInt(pago.cantidad, 10)
        if (!isNaN(cantidad)) {
          sumatoriaCantidad += cantidad
        }
      })
      return sumatoriaCantidad
    },
    reloadMe() {
      this.$emit('reload')
    },

    async pagarEmpleado() {
      this.overlay = true

      const idPagos = this.detalles.map((el) => {
        return el.id_pago
      })
      const data = new URLSearchParams()
      data.set('id_pagos', idPagos)

      await this.$axios
        .post(`${this.$config.API}/pagos/pagar-a-empleados`, data)
        .then((res) => {
          console.log('$sql ejecutar pagos', res.data.sql)
        })
        .catch((err) => {
          this.$fire({
            title: 'Error en pago',
            html: `<p>Algo salió mal al procesar los pagos</p><p>${err}</p>`,
            type: 'warning',
          })
        })
        .finally(() => {
          this.overlay = false
          this.reloadMe()
          this.$bvModal.hide(this.modal)
        })
    },

    filterProd(id_woo, campo) {
      // console.log("Props", this.$props);
      // console.log("id_woo", id_woo);
      // console.log("campo", campo);
      // console.log("----------------");
    },
  },

  computed: {
    datosParaElReporte() {
      return {
        nombreEmpleado: this.item.nombre,
        totalPiezas: this.obtenerTotales(this.detalles),
        totalPagar: this.pagoTotal,
        detalles: this.detalles,
      }
    },
    pagoTotal() {
      const total = this.detalles.reduce((acc, curr) => {
        const pagoDecimal = parseFloat(curr.pago)
        return acc + (isNaN(pagoDecimal) ? 0 : pagoDecimal)
      }, 0)

      return String.fromCharCode(36) + total.toFixed(2)
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)
      return `modal-${rand}`
    },
  },

  props: ['item', 'detalles', 'products', 'reload', 'showbutton'],
}
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
