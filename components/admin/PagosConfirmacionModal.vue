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
      :title="`Confirmar Pago - ${empleado.nombre}`"
      @ok.prevent="mostrarConfirmacion"
      @ok-prevented="onValidationError"
      @hidden="cerrarModal"
      no-close-on-backdrop
      no-close-on-esc
    >
      <b-form>
        <b-row>
          <b-col cols="12">
            <p><strong>{{ tipoEmpleado }}:</strong> {{ empleado.nombre }}</p>
            <p><strong>Tipo de ingreso:</strong> {{ empleado.salario_tipo || 'No configurado' }}</p>

            <!-- Resumen de pago dinámico -->
            <div class="resumen-pago-principal mt-3">
              <h6>Resumen del Pago</h6>
              <hr class="mt-2 mb-3">
              <div class="row">
                <div class="col-8"><strong>Salario Base:</strong></div>
                <div class="col-4 text-right">${{ salarioBase }}</div>
              </div>
              <div class="row" v-if="totalComisionesTabla > 0">
                <div class="col-8"><strong>Comisiones:</strong></div>
                <div class="col-4 text-right">${{ totalComisionesTabla.toFixed(2) }}</div>
              </div>
              <div class="row" v-if="totalBonosCompletos > 0">
                <div class="col-8"><strong>Bonos:</strong></div>
                <div class="col-4 text-right">${{ totalBonosCompletos.toFixed(2) }}</div>
              </div>
              <div class="row" v-if="totalDescuentos > 0">
                <div class="col-8"><strong>Descuentos:</strong></div>
                <div class="col-4 text-right text-danger">-${{ totalDescuentos.toFixed(2) }}</div>
              </div>
              <hr class="mt-2 mb-2">
              <div class="row">
                <div class="col-8"><strong>Total a Pagar:</strong></div>
                <div class="col-4 text-right"><strong>${{ totalFinal }}</strong></div>
              </div>
              
              <hr class="mt-2 mb-2">

              <h6>Detalles de Pago:</h6>
              <!-- Mostrar detalles de bonos si existen -->
              <div v-if="datosPago.bonos && datosPago.bonos.length > 0" class="mt-3">
                <h6>Detalles de Bonos:</h6>
                <b-list-group>
                  <b-list-group-item
                    v-for="(bono, index) in datosPago.bonos"
                    :key="index"
                    variant="success"
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span>{{ bono.descripcion || `Bono ${index + 1}` }}</span>
                    <strong>${{ parseFloat(bono.monto || 0).toFixed(2) }}</strong>
                  </b-list-group-item>
                </b-list-group>
              </div>

              <!-- Mostrar detalles de descuentos si existen -->
              <div v-if="datosPago.descuentos && datosPago.descuentos.length > 0" class="mt-3">
                <h6>Detalles de Descuentos:</h6>
                <b-list-group>
                  <b-list-group-item
                    v-for="(descuento, index) in datosPago.descuentos"
                    :key="index"
                    variant="danger"
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span>{{ descuento.descripcion || `Descuento ${index + 1}` }}</span>
                    <strong class="text-danger">-${{ parseFloat(descuento.monto || 0).toFixed(2) }}</strong>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </div>
          </b-col>
        </b-row>

        <!-- Sección de Bonos Adicionales -->
        <b-row class="mt-3">
          <b-col cols="12">
            <h6>Agregar Bonos</h6>
            <b-button
              variant="light"
              @click="addBono"
              size="sm"
              class="mb-2"
            >
              <b-icon icon="plus-lg"></b-icon> Agregar Bono
            </b-button>
            <b-table
              responsive
              small
              striped
              :fields="camposBonos"
              :items="datosPago.bonos"
            >
              <template #cell(input)="row">
                <pagos-bono-form
                  :item="row.item"
                  :index="row.index"
                  @remove="removeBono(row.index)"
                />
              </template>
            </b-table>
          </b-col>
        </b-row>

        <!-- Sección de Descuentos -->
        <b-row class="mt-3">
          <b-col cols="12">
            <h6>Agregar Descuentos</h6>
            <b-button
              variant="light"
              @click="addDescuento"
              size="sm"
              class="mb-2"
            >
              <b-icon icon="plus-lg"></b-icon> Agregar Descuento
            </b-button>
            <b-table
              responsive
              small
              striped
              :fields="camposDescuentos"
              :items="datosPago.descuentos"
            >
              <template #cell(input)="row">
                <pagos-descuento-form
                  :item="row.item"
                  :index="row.index"
                  @remove="removeDescuento(row.index)"
                />
              </template>
            </b-table>
          </b-col>
        </b-row>

        <!-- Sección de errores de validación -->
        <b-row v-if="erroresValidacion.length > 0" class="mt-3">
          <b-col cols="12">
            <b-alert variant="danger" show>
              <h6>Errores de validación:</h6>
              <ul class="mb-0">
                <li v-for="(error, index) in erroresValidacion" :key="index">{{ error }}</li>
              </ul>
            </b-alert>
          </b-col>
        </b-row>
      </b-form>

      <template #modal-footer="{ ok, cancel }">
        <admin-pagos-vendedor-resumen
          :item="empleado"
          :detalles="detalles"
          :showbutton="false"
        />
        <b-button variant="secondary" @click="cancel">Cancelar</b-button>
        <b-button variant="primary" @click="ok">
          Confirmar y Procesar Pago
        </b-button>
      </template>
    </b-modal>

    <!-- Modal de confirmación final -->
    <b-modal :id="modalConfirmacionFinalId" size="md" title="Confirmar Pago" @ok="procesarPago" @cancel="cerrarModalConfirmacion" @hidden="cerrarModalConfirmacion">
      <div class="resumen-pago">
        <h5>Resumen del Pago</h5>
        <hr>
        <div class="row">
          <div class="col-8"><strong>Salario Base:</strong></div>
          <div class="col-4 text-right">${{ salarioBase }}</div>
        </div>
        <div class="row" v-if="totalComisionesTabla > 0">
          <div class="col-8"><strong>Comisiones:</strong></div>
          <div class="col-4 text-right">${{ totalComisionesTabla.toFixed(2) }}</div>
        </div>
        <div class="row" v-if="totalBonosCompletos > 0">
          <div class="col-8"><strong>Bonos:</strong></div>
          <div class="col-4 text-right">${{ totalBonosCompletos.toFixed(2) }}</div>
        </div>
        <div class="row" v-if="totalDescuentos > 0">
          <div class="col-8"><strong>Descuentos:</strong></div>
          <div class="col-4 text-right text-danger">-${{ totalDescuentos.toFixed(2) }}</div>
        </div>
        <hr>
        <div class="row">
          <div class="col-8"><strong><h5>Total a Pagar:</h5></strong></div>
          <div class="col-4 text-right"><h5>${{ totalFinal }}</h5></div>
        </div>

        <!-- Mostrar detalles de bonos si existen -->
        <div v-if="datosPago.bonos && datosPago.bonos.length > 0" class="mt-3">
          <h6>Detalles de Bonos:</h6>
          <b-list-group>
            <b-list-group-item
              v-for="(bono, index) in datosPago.bonos"
              :key="index"
              variant="success"
              class="d-flex justify-content-between align-items-center"
            >
              <span>{{ bono.descripcion || `Bono ${index + 1}` }}</span>
              <strong>${{ parseFloat(bono.monto || 0).toFixed(2) }}</strong>
            </b-list-group-item>
          </b-list-group>
        </div>

        <!-- Mostrar detalles de descuentos si existen -->
        <div v-if="datosPago.descuentos && datosPago.descuentos.length > 0" class="mt-3">
          <h6>Detalles de Descuentos:</h6>
          <b-list-group>
            <b-list-group-item
              v-for="(descuento, index) in datosPago.descuentos"
              :key="index"
              variant="danger"
              class="d-flex justify-content-between align-items-center"
            >
              <span>{{ descuento.descripcion || `Descuento ${index + 1}` }}</span>
              <strong class="text-danger">-${{ parseFloat(descuento.monto || 0).toFixed(2) }}</strong>
            </b-list-group-item>
          </b-list-group>
        </div>
      </div>

      <template #modal-footer="{ ok, cancel }">
        <b-button variant="secondary" @click="cancel">Revisar</b-button>
        <b-button variant="success" @click="ok">
          Confirmar Pago
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import PagosBonoForm from './PagosBonoForm.vue'
import PagosDescuentoForm from './PagosDescuentoForm.vue'
import PagosVendedorResumen from './PagosVendedorResumen.vue'

export default {
  name: 'PagosConfirmacionModal',
  components: {
    PagosBonoForm,
    PagosDescuentoForm,
    PagosVendedorResumen
  },
  data() {
    return {
       totalItemsPagos: 0,
      dataToPost: '',
      datosPago: {
        bonos: [],
        descuentos: []
      },
      camposBonos: [
        { key: 'input', label: '' },
        { key: 'id', label: '' }
      ],
      camposDescuentos: [
        { key: 'input', label: '' },
        { key: 'id', label: '' }
      ],
      erroresValidacion: [],
      modalId: `modal-confirmacion-${this.empleado.id_empleado || Math.random().toString(36).substring(2, 7)}`,
      modalConfirmacionFinalId: `modal-confirmacion-final-${this.empleado.id_empleado || Math.random().toString(36).substring(2, 7)}`
    }
  },

  props: {
    empleado: {
      type: Object,
      required: true
    },
    totalBase: {
      type: [String, Number],
      required: true
    },
    tipoEmpleado: {
      type: String,
      required: true
    },
    detalles: {
      type: Array,
      default: () => []
    },
    salarioCalculado: {
      type: [String, Number],
      default: 0
    },
    comisionCalculada: {
      type: [String, Number],
      default: 0
    },
  },

  computed: {
    totalComisionesTabla() {
      if (!this.detalles || !Array.isArray(this.detalles)) {
        return 0
      }

      return this.detalles.reduce((total, detalle) => {
        // Sumar directamente el campo pago de cada detalle
        const pago = parseFloat(detalle.pago) || 0
        return total + pago
      }, 0)
    },
    totalBonos() {
      return this.datosPago.bonos.reduce((sum, bono) => {
        return sum + (parseFloat(bono.monto / this.totalItemsPagos) || 0)
      }, 0)
    },
    totalBonosCompletos() {
      return this.datosPago.bonos.reduce((sum, bono) => {
        return sum + (parseFloat(bono.monto) || 0)
      }, 0)
    },
    totalDescuentos() {
      return this.datosPago.descuentos.reduce((sum, descuento) => {
        return sum + (parseFloat(descuento.monto) || 0)
      }, 0)
    },
    salarioBase() {
      // El salario base debería ser solo el salario sin comisiones
      // totalBase ya incluye salario + comisiones, así que necesitamos extraer solo el salario
      const totalBaseNum = parseFloat(this.totalBase.toString().replace('$', '')) || 0
      return (totalBaseNum - this.totalComisionesTabla).toFixed(2)
    },
    totalFinal() {
      const salario = parseFloat(this.salarioBase)
      const comisiones = this.totalComisionesTabla
      const bonos = this.totalBonosCompletos
      const descuentos = this.totalDescuentos
      return (salario + comisiones + bonos - descuentos).toFixed(2)
    }
  },

  methods: {
    addBono() {
      this.datosPago.bonos.push({
        monto: 0,
        descripcion: ''
      })
    },

    removeBono(index) {
      this.datosPago.bonos.splice(index, 1)
    },

    addDescuento() {
      this.datosPago.descuentos.push({
        monto: 0,
        descripcion: ''
      })
    },

    removeDescuento(index) {
      this.datosPago.descuentos.splice(index, 1)
    },

    calcularTotalConAdicionales() {
      const base = parseFloat(this.totalBase.toString().replace('$', '')) || 0

      // Sumar todos los bonos
      const totalBonos = this.datosPago.bonos.reduce((sum, bono) => {
        return sum + (parseFloat(bono.monto / this.totalItemsPagos) || 0)
      }, 0)

      // Sumar todos los descuentos
      const totalDescuentos = this.datosPago.descuentos.reduce((sum, descuento) => {
        return sum + (parseFloat(descuento.monto) || 0)
      }, 0)

      return (base + totalBonos - totalDescuentos).toFixed(2)
    },

    calcularNumeroSemanaActual() {
      const fecha = new Date()
      const primerDiaAnio = new Date(fecha.getFullYear(), 0, 1)
      const diasTranscurridos = Math.floor((fecha - primerDiaAnio) / (24 * 60 * 60 * 1000))
      return Math.ceil((diasTranscurridos + primerDiaAnio.getDay() + 1) / 7)
    },

    validarBonosYDescuentos() {
      const errores = []

      // Validar bonos
      this.datosPago.bonos.forEach((bono, index) => {
        const monto = parseFloat(bono.monto) || 0
        if (monto <= 0) {
          errores.push(`Bono ${index + 1}: El monto debe ser mayor a 0`)
        }
        if (!bono.descripcion || bono.descripcion.trim() === '') {
          errores.push(`Bono ${index + 1}: La descripción es requerida`)
        }
      })

      // Validar descuentos
      this.datosPago.descuentos.forEach((descuento, index) => {
        const monto = parseFloat(descuento.monto) || 0
        if (monto <= 0) {
          errores.push(`Descuento ${index + 1}: El monto debe ser mayor a 0`)
        }
        if (!descuento.descripcion || descuento.descripcion.trim() === '') {
          errores.push(`Descuento ${index + 1}: La descripción es requerida`)
        }
      })

      return errores
    },

    onValidationError() {
      // Este método se llama cuando la validación falla y el modal intenta cerrarse
      // No necesitamos hacer nada específico aquí, ya que bvModalEvt.preventDefault() ya maneja el cierre
    },

    mostrarConfirmacion(bvModalEvt) {
      // Prevenir que el modal principal se cierre
      bvModalEvt.preventDefault()

      // Limpiar errores previos
      this.erroresValidacion = []

      // Validar bonos y descuentos antes de mostrar confirmación
      const erroresValidacion = this.validarBonosYDescuentos()
      if (erroresValidacion.length > 0) {
        this.erroresValidacion = erroresValidacion
        return
      }

      // Validar que el monto total calculado sea mayor a 0
      const totalConAdicionales = parseFloat(this.calcularTotalConAdicionales())
      if (totalConAdicionales <= 0) {
        this.erroresValidacion.push('El monto total del pago debe ser mayor a 0')
        return
      }

      // Validar que hay detalles disponibles
      if (!this.detalles || !Array.isArray(this.detalles) || this.detalles.length === 0) {
        this.erroresValidacion.push('No hay datos de pago disponibles para procesar')
        return
      }

      // Mostrar modal de confirmación final usando $bvModal
      this.$bvModal.show(this.modalConfirmacionFinalId)
    },

    async procesarPago(bvModalEvt) {
      // Limpiar errores previos
      this.erroresValidacion = []

      // Validar bonos y descuentos antes de procesar
      const erroresValidacion = this.validarBonosYDescuentos()
      if (erroresValidacion.length > 0) {
        this.erroresValidacion = erroresValidacion
        // Prevenir que el modal se cierre
        bvModalEvt.preventDefault()
        return
      }

      // Validar que el monto total calculado sea mayor a 0
      const totalConAdicionales = parseFloat(this.calcularTotalConAdicionales())
      if (totalConAdicionales <= 0) {
        this.erroresValidacion.push('El monto total del pago debe ser mayor a 0')
        bvModalEvt.preventDefault()
        return
      }

      // Validar que hay detalles disponibles
      if (!this.detalles || !Array.isArray(this.detalles) || this.detalles.length === 0) {
        this.erroresValidacion.push('No hay datos de pago disponibles para procesar')
        bvModalEvt.preventDefault()
        return
      }

      // Extraer los id_pago de los detalles y filtrar valores válidos
      const idPagos = this.detalles
        .map((el) => el.id_pago)
        .filter(id => id != null && id !== '' && id !== undefined)

      // Validar que hay IDs válidos
      let totalItemsPagos = 0
      if (idPagos.length === 0) {
        this.erroresValidacion.push('No se encontraron IDs de pago válidos')
        bvModalEvt.preventDefault()
        return
      } else {
        totalItemsPagos = idPagos.length
      }

      // Preparar datos como el endpoint espera
      const data = new URLSearchParams()
      data.set('id_pagos', idPagos.join(','))

      // Agregar bonos si existen
      if (this.datosPago.bonos && this.datosPago.bonos.length > 0) {
        data.set('bonos', JSON.stringify(this.datosPago.bonos))
      } else {
        data.set('bonos', '0')
      }

      // Agregar descuentos si existen
      if (this.datosPago.descuentos && this.datosPago.descuentos.length > 0) {
        data.set('descuentos', JSON.stringify(this.datosPago.descuentos))
      } else {
        data.set('descuentos', '0')
      }

      // DEBUG: Agregar logs para diagnosticar envío a API
      console.log('DEBUG API - Empleado:', this.empleado);
      console.log('DEBUG API - Salario tipo:', this.empleado?.salario_tipo);
      console.log('DEBUG API - Salario calculado (prop):', this.salarioCalculado);
      console.log('DEBUG API - Total comisiones tabla:', this.totalComisionesTabla);
      console.log('DEBUG API - Salario base calculado:', this.salarioBase);
      console.log('DEBUG API - Detalles completos:', this.detalles);

      // Agregar salario calculado si existe y el tipo de salario lo permite
      if ((this.empleado.salario_tipo === 'Salario' || this.empleado.salario_tipo === 'Salario más Comisión') && this.salarioCalculado && parseFloat(this.salarioCalculado) > 0) {
        data.set('salario', this.salarioCalculado.toString())
        console.log('DEBUG API - Enviando salario:', this.salarioCalculado.toString());
      } else {
        // Para vendedores con "Salario más Comisión", siempre enviar el salario calculado aunque sea 0
        // Esto asegura que se registre el período como pagado
        if (this.empleado.salario_tipo === 'Salario más Comisión') {
          const salarioAEnviar = this.salarioCalculado ? this.salarioCalculado.toString() : '0';
          data.set('salario', salarioAEnviar)
          console.log('DEBUG API - Enviando salario para Salario+Comisión:', salarioAEnviar);
        } else {
          data.set('salario', '0')
          console.log('DEBUG API - Enviando salario: 0 (condición no cumplida)');
        }
      }

      // Agregar comisión calculada desde la tabla de detalles (acumulado total)
      // Solo enviar comisiones si el tipo de salario lo permite
      if (this.empleado.salario_tipo === 'Comisión' || this.empleado.salario_tipo === 'Salario más Comisión') {
        data.set('comision', this.totalComisionesTabla.toString())
        console.log('DEBUG API - Enviando comisión:', this.totalComisionesTabla.toString());
      } else {
        data.set('comision', '0')
        console.log('DEBUG API - Enviando comisión: 0 (condición no cumplida)');
      }

      this.dataToPost = data;

      try {
        const dataObjeto = Object.fromEntries(data.entries());
        console.warn('Procesando pago con los siguientes datos:', dataObjeto);
        await this.$axios.post(`${this.$config.API}/pagos/pagar-a-empleados`, data)
        // Emitir evento con datos completos del pago para el recibo
        this.$emit('pago-exitoso', this.empleado.nombre, {
          salarioBase: this.salarioBase,
          comisionTotal: this.totalComisionesTabla,
          bonos: this.datosPago.bonos,
          descuentos: this.datosPago.descuentos,
          totalFinal: this.totalFinal,
          detalles: this.detalles,
          empleado: this.empleado,
          tipoEmpleado: this.tipoEmpleado
        })
        this.limpiarDatos()
      } catch (error) {
        this.$emit('pago-error', error.message)
      }
    },

    cerrarModal() {
      // Limpiar datos cuando se cierra el modal principal
      this.limpiarDatos()
    },

    cerrarModalConfirmacion() {
      // Cerrar el modal de confirmación usando $bvModal
      this.$bvModal.hide(this.modalConfirmacionFinalId)
    },

    limpiarDatos() {
      this.datosPago = {
        bonos: [],
        descuentos: []
      }
      this.erroresValidacion = []
      this.showConfirmacionFinal = false
    }
  },

  /* watch: {
    visible: {
      handler(newVal) {
        this.modalVisible = newVal
      },
      immediate: true
    }
  }, */

  mounted() {
  this.totalItemsPagos = this.detalles.length
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

.resumen-pago .row {
  margin-bottom: 8px;
}

.resumen-pago hr {
  margin: 15px 0;
  border-top: 2px solid #dee2e6;
}
</style>