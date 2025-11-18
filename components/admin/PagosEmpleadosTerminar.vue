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
        <b-modal v-model="modalConfirmacion" size="lg" title="Confirmar Procesamiento de Pagos" @ok="procesarPagos">
            <b-form>
                <b-row>
                    <b-col cols="12">
                        <h5>Resumen de Pagos</h5>
                        <p><strong>Total General:</strong> ${{ calcularTotalConAdicionales() }}</p>
                        <p><strong>Total Base:</strong> ${{ totalCancelado.totalGeneral }}</p>
                        <p><strong>Bonos:</strong> ${{ datosPago.bonos || 0 }}</p>
                        <p><strong>Aguinaldos:</strong> ${{ datosPago.aguinaldos || 0 }}</p>
                        <p><strong>Descuentos:</strong> -${{ datosPago.descuentos || 0 }}</p>
                        <hr>
                        <p><strong>Total Vendedores:</strong> ${{ totalCancelado.totalVendedores }}</p>
                        <p><strong>Total Empleados:</strong> ${{ totalCancelado.totalEmpleados }}</p>
                        <p><strong>Total Diseñadores:</strong> ${{ totalCancelado.totalDiseno }}</p>
                    </b-col>
                </b-row>

                <b-row class="mt-3">
                    <b-col cols="6">
                        <b-form-group label="Bonos Adicionales">
                            <b-form-input
                                v-model="datosPago.bonos"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col cols="6">
                        <b-form-group label="Detalle de Bonos">
                            <b-form-input
                                v-model="datosPago.detalleBonos"
                                placeholder="Descripción del bono"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-row>
                    <b-col cols="6">
                        <b-form-group label="Aguinaldos">
                            <b-form-input
                                v-model="datosPago.aguinaldos"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col cols="6">
                        <b-form-group label="Detalle de Aguinaldos">
                            <b-form-input
                                v-model="datosPago.detalleAguinaldos"
                                placeholder="Descripción del aguinaldo"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-row>
                    <b-col cols="6">
                        <b-form-group label="Descuentos">
                            <b-form-input
                                v-model="datosPago.descuentos"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col cols="6">
                        <b-form-group label="Detalle de Descuentos">
                            <b-form-input
                                v-model="datosPago.detalleDescuentos"
                                placeholder="Descripción del descuento"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-row>
                    <b-col cols="12">
                        <b-form-group label="Fecha de Pago">
                            <b-form-datepicker
                                v-model="datosPago.fechaPago"
                                required
                            ></b-form-datepicker>
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-row>
                    <b-col cols="12">
                        <b-form-group label="Observaciones">
                            <b-form-textarea
                                v-model="datosPago.observaciones"
                                placeholder="Observaciones adicionales..."
                                rows="3"
                            ></b-form-textarea>
                        </b-form-group>
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

export default {
    data() {
        return {
            overlay: false,
            modalConfirmacion: false,
            datosPago: {
                bonos: 0,
                detalleBonos: '',
                aguinaldos: 0,
                detalleAguinaldos: '',
                descuentos: 0,
                detalleDescuentos: '',
                fechaPago: '',
                observaciones: ''
            }
        }
    },

    props: ["reload", "totalCancelado", "pagosResumen", "pagosResumenVendedores", "pagosResumenDiseno", "fechaConsultaInicio", "fechaConsultaFin"],

    methods: {
        abrirModalConfirmacion() {
            this.modalConfirmacion = true
        },

        async procesarPagos() {
            this.overlay = true
            this.modalConfirmacion = false

            // Preparar datos de pagos con información adicional
            const pagosData = []

            // Agregar empleados
            this.pagosResumen.forEach(empleado => {
                if (parseFloat(empleado.monto_salario) > 0 || parseFloat(empleado.monto_comision) > 0) {
                    pagosData.push({
                        id_empleado: empleado.id_empleado,
                        monto_salario: parseFloat(empleado.monto_salario) || 0,
                        monto_comision: parseFloat(empleado.monto_comision) || 0,
                        tipo_salario: 'quincenal',
                        tipo_comision: 'quincenal',
                        numero_semana: this.calcularNumeroSemanaActual(),
                        bonos: parseFloat(this.datosPago.bonos) || 0,
                        detalle_bonos: this.datosPago.detalleBonos,
                        aguinaldos: parseFloat(this.datosPago.aguinaldos) || 0,
                        detalle_aguinaldos: this.datosPago.detalleAguinaldos,
                        descuentos: parseFloat(this.datosPago.descuentos) || 0,
                        detalle_descuentos: this.datosPago.detalleDescuentos,
                        fecha_pago: this.datosPago.fechaPago,
                        observaciones: this.datosPago.observaciones
                    })
                }
            })

            // Agregar vendedores
            this.pagosResumenVendedores.forEach(vendedor => {
                if (parseFloat(vendedor.monto_salario) > 0 || parseFloat(vendedor.monto_comision) > 0) {
                    pagosData.push({
                        id_empleado: vendedor.id_empleado,
                        monto_salario: parseFloat(vendedor.monto_salario) || 0,
                        monto_comision: parseFloat(vendedor.monto_comision) || 0,
                        tipo_salario: 'quincenal',
                        tipo_comision: 'quincenal',
                        numero_semana: this.calcularNumeroSemanaActual(),
                        bonos: parseFloat(this.datosPago.bonos) || 0,
                        detalle_bonos: this.datosPago.detalleBonos,
                        aguinaldos: parseFloat(this.datosPago.aguinaldos) || 0,
                        detalle_aguinaldos: this.datosPago.detalleAguinaldos,
                        descuentos: parseFloat(this.datosPago.descuentos) || 0,
                        detalle_descuentos: this.datosPago.detalleDescuentos,
                        fecha_pago: this.datosPago.fechaPago,
                        observaciones: this.datosPago.observaciones
                    })
                }
            })

            // Agregar diseñadores
            this.pagosResumenDiseno.forEach(disenador => {
                if (parseFloat(disenador.monto_salario) > 0 || parseFloat(disenador.monto_comision) > 0) {
                    pagosData.push({
                        id_empleado: disenador.id_empleado,
                        monto_salario: parseFloat(disenador.monto_salario) || 0,
                        monto_comision: parseFloat(disenador.monto_comision) || 0,
                        tipo_salario: 'quincenal',
                        tipo_comision: 'quincenal',
                        numero_semana: this.calcularNumeroSemanaActual(),
                        bonos: parseFloat(this.datosPago.bonos) || 0,
                        detalle_bonos: this.datosPago.detalleBonos,
                        aguinaldos: parseFloat(this.datosPago.aguinaldos) || 0,
                        detalle_aguinaldos: this.datosPago.detalleAguinaldos,
                        descuentos: parseFloat(this.datosPago.descuentos) || 0,
                        detalle_descuentos: this.datosPago.detalleDescuentos,
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
                .post(`${this.$config.API}/pagos/pagar-a-empleados`, payload)
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
                        bonos: 0,
                        detalleBonos: '',
                        aguinaldos: 0,
                        detalleAguinaldos: '',
                        descuentos: 0,
                        detalleDescuentos: '',
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

        calcularTotalConAdicionales() {
            const totalBase = parseFloat(this.totalCancelado.totalGeneral) || 0
            const bonos = parseFloat(this.datosPago.bonos) || 0
            const aguinaldos = parseFloat(this.datosPago.aguinaldos) || 0
            const descuentos = parseFloat(this.datosPago.descuentos) || 0
            return (totalBase + bonos + aguinaldos - descuentos).toFixed(2)
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
