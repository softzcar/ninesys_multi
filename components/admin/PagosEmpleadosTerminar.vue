<template>
    <div>
        <b-overlay :show="overlay">
            <!-- <b-button variant="success" @click="terminarPlanilla" size="lg">Teminar Planilla</b-button> -->
            <b-button variant="info" @click="$emit('reload')" size="lg">
                Pagos Pendientes
            </b-button>
            <b-button variant="success" @click="abrirModalConfirmacion" size="lg" class="ml-2">
                Procesar Pagos
            </b-button>
        </b-overlay>

        <!-- Modal de Confirmación de Pagos -->
        <b-modal v-model="modalConfirmacion" size="lg" title="Confirmar Procesamiento de Pagos"
            @ok="mostrarConfirmacion" @hidden="limpiarErrores">
            <b-form>
                <b-row>
                    <b-col cols="12">
                        <h5>Resumen de Pagos</h5>
                        <p><strong>Total General:</strong> ${{ calcularTotalConAdicionales() }}</p>
                        <p><strong>Total Base:</strong> ${{ totalCancelado.totalGeneral }}</p>
                        <p><strong>Bonos Adicionales:</strong> ${{ calcularTotalBonos().toFixed(2) }}</p>
                        <p><strong>Descuentos:</strong> -${{ calcularTotalDescuentos().toFixed(2) }}</p>
                    </b-col>
                </b-row>

                <!-- Sección de Bonos Adicionales -->
                <b-row class="mt-3">
                    <b-col cols="12">
                        <h6>Agregar Bonos Globales</h6>
                        <b-button variant="light" @click="addBono" size="sm" class="mb-2">
                            <b-icon icon="plus-lg"></b-icon> Agregar Bono
                        </b-button>
                        <b-table responsive small striped :fields="camposBonos" :items="datosPago.bonos">
                            <template #cell(input)="row">
                                <pagos-bono-form :item="row.item" :index="row.index" @remove="removeBono(row.index)" />
                            </template>
                        </b-table>
                    </b-col>
                </b-row>

                <!-- Sección de Descuentos -->
                <b-row class="mt-3">
                    <b-col cols="12">
                        <h6>Agregar Descuentos Globales</h6>
                        <b-button variant="light" @click="addDescuento" size="sm" class="mb-2">
                            <b-icon icon="plus-lg"></b-icon> Agregar Descuento
                        </b-button>
                        <b-table responsive small striped :fields="camposDescuentos" :items="datosPago.descuentos">
                            <template #cell(input)="row">
                                <pagos-descuento-form :item="row.item" :index="row.index"
                                    @remove="removeDescuento(row.index)" />
                            </template>
                        </b-table>
                    </b-col>
                </b-row>

                <b-row>
                    <b-col cols="12">
                        <b-form-group label="Fecha de Pago">
                            <b-form-datepicker v-model="datosPago.fechaPago" required></b-form-datepicker>
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-row>
                    <b-col cols="12">
                        <b-form-group label="Observaciones">
                            <b-form-textarea v-model="datosPago.observaciones"
                                placeholder="Observaciones adicionales..." rows="3"></b-form-textarea>
                        </b-form-group>
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
                <b-button variant="secondary" @click="cancel">Cancelar</b-button>
                <b-button variant="primary" @click="ok" :disabled="!datosPago.fechaPago">
                    Confirmar y Procesar Pagos
                </b-button>
            </template>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"
import PagosBonoForm from './PagosBonoForm.vue'
import PagosDescuentoForm from './PagosDescuentoForm.vue'
import mixin from '~/mixins/mixins.js'

export default {
    mixins: [mixin],
    components: {
        PagosBonoForm,
        PagosDescuentoForm
    },
    data() {
        return {
            overlay: false,
            modalConfirmacion: false,
            datosPago: {
                bonos: [],
                descuentos: [],
                fechaPago: '',
                observaciones: ''
            },
            camposBonos: [
                { key: 'input', label: '' }
            ],
            camposDescuentos: [
                { key: 'input', label: '' }
            ],
            erroresValidacion: []
        }
    },

    props: ["reload", "totalCancelado", "pagosResumen", "pagosResumenVendedores", "pagosResumenDiseno", "fechaConsultaInicio", "fechaConsultaFin"],

    methods: {
        abrirModalConfirmacion() {
            this.modalConfirmacion = true
        },

        limpiarErrores() {
            this.erroresValidacion = [];
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

        mostrarConfirmacion(bvModalEvt) {
            bvModalEvt.preventDefault()
            this.erroresValidacion = []

            const erroresObj = this.validarBonosYDescuentos()
            if (erroresObj.length > 0) {
                this.erroresValidacion = erroresObj
                return
            }

            // Asignar fecha por defecto si está vacía
            if (!this.datosPago.fechaPago) {
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const yyyy = today.getFullYear();
                this.datosPago.fechaPago = yyyy + '-' + mm + '-' + dd;
            }

            // Asignar observación por defecto si está vacía
            if (!this.datosPago.observaciones || this.datosPago.observaciones.trim() === '') {
                this.datosPago.observaciones = 'Pago nómina ' + this.formatDate(this.datosPago.fechaPago);
            }

            const total = this.calcularTotalConAdicionales();
            const countEmpleados = this.countEmpleadosAPagar();

            if (countEmpleados === 0) {
                this.erroresValidacion.push('No hay empleados con saldo pendiente para pagar.')
                return
            }

            this.$fire({
                title: 'Confirmar Procesamiento masivo',
                html: `¿Desea procesar el pago para ${countEmpleados} empleados?<br><br>
                <strong>Resumen Global:</strong><br>
                Total a Pagar: $${total}<br>
                Total Bonos: $${this.calcularTotalBonos().toFixed(2)}<br>
                Total Descuentos: $${this.calcularTotalDescuentos().toFixed(2)}<br>
                Fecha de Pago: ${this.formatDate(this.datosPago.fechaPago)}<br>
                Observaciones: ${this.datosPago.observaciones}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, procesar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    this.procesarPagos()
                }
            })
        },

        async procesarPagos() {
            this.overlay = true
            this.modalConfirmacion = false

            // Preparar datos de pagos con información adicional
            const pagosData = []

            // Contar cuántos empleados van a recibir pago
            let countEmpleados = 0;
            this.pagosResumen.forEach(empleado => {
                if (parseFloat(empleado.monto_salario) > 0 || parseFloat(empleado.monto_comision) > 0) {
                    countEmpleados++;
                }
            })

            // Enviar bonos y descuentos exactos al backend (se aplicarán enteros a cada id_pago individual)
            const bonosDivididos = this.datosPago.bonos.map(b => ({
                monto: parseFloat(b.monto) || 0,
                descripcion: b.descripcion || 'Bono global'
            }));
            const descuentosDivididos = this.datosPago.descuentos.map(d => ({
                monto: parseFloat(d.monto) || 0,
                descripcion: d.descripcion || 'Descuento global'
            }));

            // Agregar empleados (ahora vienen todos unificados en pagosResumen)
            this.pagosResumen.forEach(empleado => {
                if (parseFloat(empleado.monto_salario) > 0 || parseFloat(empleado.monto_comision) > 0) {
                    pagosData.push({
                        id_empleado: empleado.id_empleado,
                        id_pagos: empleado.id_pagos && Array.isArray(empleado.id_pagos) ? empleado.id_pagos.join(',') : '',
                        monto_salario: parseFloat(empleado.monto_salario) || 0,
                        monto_comision: parseFloat(empleado.monto_comision) || 0,
                        tipo_salario: 'quincenal',
                        tipo_comision: 'quincenal',
                        numero_semana: this.calcularNumeroSemanaActual(),
                        bonos: bonosDivididos,
                        descuentos: descuentosDivididos,
                        fecha_pago: this.datosPago.fechaPago,
                        observaciones: this.datosPago.observaciones
                    })
                }
            })

            // Enviar datos estructurados
            const payload = {
                pagos: pagosData,
                fecha_inicio: this.fechaConsultaInicio,
                fecha_fin: this.fechaConsultaFin
            }

            await this.$axios
                .post(`${this.$config.API}/pagos/procesar-lote-pagos`, payload)
                .then((res) => {
                    this.overlay = false
                    this.$emit("reload")
                    this.$fire({
                        title: "Pago realizado",
                        html: `<p>Los pagos han sido procesados correctamente</p>`,
                        type: "success",
                    })
                    // Limpiar datos del modal
                    this.datosPago = {
                        bonos: [],
                        descuentos: [],
                        fechaPago: '',
                        observaciones: ''
                    }
                })
                .catch((error) => {
                    this.overlay = false
                    this.$fire({
                        title: "Error en pago",
                        html: `<p>Error al procesar los pagos: ${error.message}</p>`,
                        type: "error",
                    })
                })
        },

        calcularNumeroSemanaActual() {
            const fecha = new Date()
            const primerDiaAnio = new Date(fecha.getFullYear(), 0, 1)
            const diasTranscurridos = Math.floor((fecha - primerDiaAnio) / (24 * 60 * 60 * 1000))
            return Math.ceil((diasTranscurridos + primerDiaAnio.getDay() + 1) / 7)
        },

        addBono() {
            this.datosPago.bonos.push({ monto: 0, descripcion: '' })
        },

        removeBono(index) {
            this.datosPago.bonos.splice(index, 1)
        },

        addDescuento() {
            this.datosPago.descuentos.push({ monto: 0, descripcion: '' })
        },

        removeDescuento(index) {
            this.datosPago.descuentos.splice(index, 1)
        },

        countEmpleadosAPagar() {
            let count = 0;
            if (this.pagosResumen && Array.isArray(this.pagosResumen)) {
                this.pagosResumen.forEach(empleado => {
                    if (parseFloat(empleado.monto_salario) > 0 || parseFloat(empleado.monto_comision) > 0) {
                        count++;
                    }
                })
            }
            return count;
        },

        calcularTotalBonos() {
            const baseBonos = this.datosPago.bonos.reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0)
            return baseBonos * this.countEmpleadosAPagar();
        },

        calcularTotalDescuentos() {
            const baseDescuentos = this.datosPago.descuentos.reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0)
            return baseDescuentos * this.countEmpleadosAPagar();
        },

        calcularTotalConAdicionales() {
            const totalBase = parseFloat(this.totalCancelado.totalGeneral) || 0
            const bonosTotales = this.calcularTotalBonos()
            const descuentosTotales = this.calcularTotalDescuentos()
            return (totalBase + bonosTotales - descuentosTotales).toFixed(2)
        },

        async terminar() {
            this.overlay = true
            await this.$axios
                .post(`${this.$config.API}/pagos/terminar-planilla`)
                .then((res) => {
                    this.$emit("reload")
                    this.overlay = false
                })
        },

        terminarPlanilla() {
            this.$confirm(
                `¿Desea Terminar la Planilla de pagos?`,
                "Terminar planilla de pagos",
                "question"
            )
                .then(() => {
                    this.terminar()
                })
                .catch(() => {
                    return false
                })
        },
    },
}
</script>

<style lang="scss" scoped></style>
