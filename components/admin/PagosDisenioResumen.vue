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
                    @click="imprimirReporte"
                    variant="primary"
                    >Imprimir</b-button
                  >
                </span>
                <div v-if="item.pago === '0.00'" class="alert alert-info mt-2">
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
                <template #cell(id_orden)="data">
                  <linkSearch :id="data.item.id_orden" />
                </template>
                <template #cell(tipo)="data">
                  {{ data.item.moment }}
                </template>
              </b-table>
            </b-col>
          </b-row>

        </b-container>
      </b-overlay>
    </b-modal>

    <!-- Componente para impresión, oculto -->
    <div style="display: none;">
      <ReportePagoDisenador
        :datos-reporte="datosParaElReporte"
        ref="reporteParaImprimir"
      />
    </div>
  </div>
</template>

<script>
import ReportePagoDisenador from '~/components/reportes/ReportePagoDisenador.vue'
import PrintService from '@/utils/PrintService'

export default {
  components: {
    ReportePagoDisenador,
  },
  data() {
    return {
      size: 'xl',
      title: `Diseñador: ${this.item.nombre}`,
      overlay: false,
      fields: [
        {
          key: 'id_orden',
          label: 'Orden',
        },
        {
          key: 'id_revision',
          label: 'Revisión',
        },
        {
          key: 'producto',
          label: 'Producto',
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
          key: 'monto_pago',
          label: 'Pago',
        },
      ],
    }
  },

  methods: {

    imprimirReporte() {
      const printContent = this.$refs.reporteParaImprimir.$el.innerHTML
      const today = new Date()
      const day = String(today.getDate()).padStart(2, '0')
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const year = today.getFullYear()
      const reportDate = `${day}-${month}-${year}`
      const employeeName = this.item.nombre
      const reportTitle = `Reporte de Pago - ${employeeName} - ${reportDate}`;

      PrintService.imprimir(reportTitle, printContent)
    },

    reloadMe() {
      this.$emit('reload')
    },
  },

  computed: {
    datosParaElReporte() {
      return {
        nombreEmpleado: this.item.nombre,
        totalPagar: this.pagoTotal,
        detalles: this.detalles,
      }
    },
    pagoTotal() {
      const total = this.detalles.reduce((acc, curr) => {
        const pagoDecimal = parseFloat(curr.monto_pago)
        return acc + (isNaN(pagoDecimal) ? 0 : pagoDecimal)
      }, 0)

      return String.fromCharCode(36) + total.toFixed(2)
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)
      return `modal-${rand}`
    },
  },

  props: [
    'id_empleado',
    'detalles',
    'reload',
    'item',
    'adicionales',
    'showbutton',
  ],
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

