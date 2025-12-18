<template>
  <div>
    <!-- Enlace para abrir modal -->
    <a href="#" @click="$bvModal.show(modalId)">
      {{ empleado.nombre }}
    </a>

    <!-- Modal principal -->
    <b-modal
      :id="modalId"
      size="lg"
      :title="`Histórico de Pago - ${empleado.nombre}`"
      hide-footer
    >
      <b-form>
        <b-row>
          <b-col cols="12">
            <p><strong>Empleado:</strong> {{ empleado.nombre }}</p>
            <p><strong>Departamento:</strong> {{ empleado.departamento }}</p>

            <!-- Resumen de pago dinámico -->
            <div class="resumen-pago-principal mt-3">
              <h6>Resumen del Pago</h6>
              <hr class="mt-2 mb-3">
              <div class="row">
                <div class="col-8"><strong>Salario Base:</strong></div>
                <div class="col-4 text-right">${{ formatNumber(salario) }}</div>
              </div>
              <div class="row" v-if="comision > 0">
                <div class="col-8"><strong>Comisiones:</strong></div>
                <div class="col-4 text-right">${{ formatNumber(comision) }}</div>
              </div>
              <div class="row" v-if="totalBonos > 0">
                <div class="col-8"><strong>Bonos:</strong></div>
                <div class="col-4 text-right">${{ formatNumber(totalBonos) }}</div>
              </div>
              <div class="row" v-if="totalDescuentos > 0">
                <div class="col-8"><strong>Descuentos:</strong></div>
                <div class="col-4 text-right text-danger">-${{ formatNumber(totalDescuentos) }}</div>
              </div>
              <hr class="mt-2 mb-2">
              <div class="row">
                <div class="col-8"><strong>Total Pagado:</strong></div>
                <div class="col-4 text-right"><strong>${{ formatNumber(totalPagado) }}</strong></div>
              </div>
              
              <hr class="mt-2 mb-2">

              <!-- Detalles de Bonos -->
              <div v-if="bonos && bonos.length > 0" class="mt-3">
                <h6>Detalles de Bonos:</h6>
                <b-list-group>
                  <b-list-group-item
                    v-for="(bono, index) in bonos"
                    :key="index"
                    variant="success"
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span>{{ bono.descripcion || `Bono ${index + 1}` }}</span>
                    <strong>${{ formatNumber(bono.monto) }}</strong>
                  </b-list-group-item>
                </b-list-group>
              </div>

              <!-- Detalles de Descuentos -->
              <div v-if="descuentos && descuentos.length > 0" class="mt-3">
                <h6>Detalles de Descuentos:</h6>
                <b-list-group>
                  <b-list-group-item
                    v-for="(descuento, index) in descuentos"
                    :key="index"
                    variant="danger"
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span>{{ descuento.descripcion || `Descuento ${index + 1}` }}</span>
                    <strong class="text-danger">-${{ formatNumber(descuento.monto) }}</strong>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </div>
          </b-col>
        </b-row>
        
        <b-row class="mt-4">
             <b-col class="text-right">
                <admin-pagos-vendedor-resumen
                  :item="empleado"
                  :detalles="detalles"
                  :tipo-empleado="'Empleado'"
                  :showbutton="true"
                  :bonos="bonos"
                  :descuentos="descuentos"
                  :salario="salario"
                  :comision="comision"
                />
             </b-col>
        </b-row>

      </b-form>
    </b-modal>
  </div>
</template>

<script>
// import PagosVendedorResumen from './PagosVendedorResumen.vue'

export default {
  name: 'PagosHistoricoModal',
  /* components: {
    PagosVendedorResumen
  }, */
  props: {
    empleado: {
      type: Object,
      required: true
    },
    detalles: {
      type: Array,
      default: () => []
    },
    salario: {
      type: [Number, String],
      default: 0
    },
    comision: {
      type: [Number, String],
      default: 0
    },
    bonos: {
      type: Array,
      default: () => []
    },
    descuentos: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    totalBonos() {
      return (this.bonos || []).reduce((sum, bono) => sum + (parseFloat(bono.monto) || 0), 0)
    },
    totalDescuentos() {
      return (this.descuentos || []).reduce((sum, desc) => sum + (parseFloat(desc.monto) || 0), 0)
    },
    totalPagado() {
        // Usar los valores calculados
        const s = parseFloat(this.salario) || 0;
        const c = parseFloat(this.comision) || 0;
        const b = this.totalBonos;
        const d = this.totalDescuentos;
        return s + c + b - d; 
    },
    modalId() {
        return `modal-historico-${this.empleado.id_empleado || Math.random().toString(36).substring(2, 7)}`
    }
  },

  methods: {
    formatNumber(value) {
      return parseFloat(value || 0).toFixed(2);
    }
  }
}
</script>

<style scoped>
.resumen-pago-principal .row {
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.resumen-pago-principal hr {
  margin: 10px 0;
  border-top: 1px solid #dee2e6;
}
</style>
