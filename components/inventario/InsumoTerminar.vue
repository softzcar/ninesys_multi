<template>
    <div class="d-inline-block">
        <!-- Botón de acción -->
        <b-button variant="warning" size="sm" @click="openModal" v-b-tooltip.hover
            title="Terminar Insumo (Cerrar Stock)">
            <b-icon icon="x-circle" aria-hidden="true"></b-icon>
        </b-button>

        <!-- Modal de confirmación -->
        <b-modal :id="modalId" :title="`Terminar Insumo: ${nombreInsumo}`" @ok="handleOk" @hidden="resetModal"
            ok-title="Terminar y Guardar" ok-variant="danger" cancel-title="Cancelar">

            <b-overlay :show="loading" spinner-small>
                <div class="d-block text-center mb-3">
                    <b-alert show variant="warning">
                        <h5 class="alert-heading">¡Atención!</h5>
                        <p>Esta acción pondrá la <strong>CANTIDAD (Stock) en 0</strong>.</p>
                        <p class="mb-2">Cantidad Actual en Sistema: <strong>{{ cantidadActual }}</strong></p>
                        <p class="mb-0 small">Ingrese abajo el <strong>REMANENTE (Retazo/Sobrante)</strong> físico real
                            para guardarlo en el historial.</p>
                    </b-alert>
                </div>

                <form ref="form" @submit.stop.prevent="handleSubmit">
                    <b-form-group label="Remanente Físico (Cantidad Sobrante)" label-for="remanente-input"
                        invalid-feedback="El remanente es requerido y debe ser un número válido">
                        <b-input-group>
                            <b-form-input id="remanente-input" v-model.number="remanente" type="number" step="0.01"
                                min="0" required placeholder="Ej: 2.5"></b-form-input>
                            <b-input-group-append>
                                <b-button variant="outline-secondary" @click="remanente = parseFloat(cantidadActual)"
                                    title="Cargar Cantidad Actual">
                                    <b-icon icon="arrow-down"></b-icon> Cargar Actual
                                </b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-form-group>

                    <b-form-group label="Motivo" label-for="motivo-select">
                        <b-form-select id="motivo-select" v-model="motivo" :options="motivosOptions" required>
                        </b-form-select>
                    </b-form-group>

                    <b-form-group label="Observación" label-for="observacion-input">
                        <b-form-textarea id="observacion-input" v-model="observacion"
                            placeholder="Detalles adicionales sobre el remanente..." rows="3"></b-form-textarea>
                    </b-form-group>
                </form>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    name: 'InsumoTerminar',
    props: {
        idInsumo: {
            type: [String, Number],
            required: true
        },
        nombreInsumo: {
            type: String,
            required: true
        },
        cantidadActual: {
            type: [String, Number],
            default: 0
        }
    },
    data() {
        return {
            modalId: `modal-terminar-${this.idInsumo}`,
            remanente: 0,
            motivo: 'Terminación (Sobrante)',
            observacion: '',
            loading: false,
            motivosOptions: [
                { value: 'Terminación (Sobrante)', text: 'Terminación (Sobrante Normal)' },
                { value: 'Daño / Defecto', text: 'Daño / Material Defectuoso' },
                { value: 'Recorte', text: 'Recorte (Retazo Utilizable)' },
                { value: 'Otro', text: 'Otro (Especificar en observación)' }
            ]
        }
    },
    methods: {
        openModal() {
            this.$bvModal.show(this.modalId)
        },
        resetModal() {
            this.remanente = 0
            this.motivo = 'Terminación (Sobrante)'
            this.observacion = ''
            this.loading = false
        },
        handleOk(bvModalEvent) {
            // Prevent modal close
            bvModalEvent.preventDefault()
            this.handleSubmit()
        },
        async handleSubmit() {
            // Validación: Remanente no puede ser mayor a la cantidad actual
            const currentQty = parseFloat(this.cantidadActual) || 0
            const inputQty = parseFloat(this.remanente)

            if (inputQty > currentQty) {
                this.$bvToast.toast(`El remanente (${inputQty}) no puede ser mayor a la cantidad actual disponible (${currentQty})`, {
                    title: 'Error de Validación',
                    variant: 'danger',
                    solid: true
                })
                return
            }

            this.loading = true

            try {
                // Construcción del Payload
                // Tipo: 'consumo' para RESTAR la cantidad, NO 'fin' (que pone en cero)
                // cantidad_consumida: El valor del remanente (para que se reste del inventario)
                // remanente: El valor para guardar en el historial (trigger backend manual logic)

                const payload = {
                    id_insumo: this.idInsumo,
                    tipo: 'consumo', // Indica resta, no terminación
                    remanente: inputQty,
                    cantidad_consumida: inputQty, // Set amount to subtract
                    auto_remanente: false,
                    id_empleado: this.$store.state.login.dataUser.id_empleado,
                    motivo: this.motivo,
                    observacion: this.observacion
                }

                const response = await this.$axios.post(`${this.$config.API}/inventario-movimientos/empleados/update-insumo`, payload)

                if (response.status === 200 || response.data.update_success) {
                    this.$bvToast.toast(`Insumo terminado correctamente. Remanente guardado: ${this.remanente}`, {
                        title: 'Éxito',
                        variant: 'success',
                        solid: true
                    })

                    // Cerrar modal manualmente
                    this.$nextTick(() => {
                        this.$bvModal.hide(this.modalId)
                    })

                    // Emitir evento para recargar la tabla padre
                    this.$emit('reload')
                } else {
                    throw new Error('La respuesta del servidor no indicó éxito')
                }

            } catch (error) {
                console.error('Error al terminar insumo:', error)
                this.$bvToast.toast('Error al procesar la terminación del insumo.', {
                    title: 'Error',
                    variant: 'danger',
                    solid: true
                })
            } finally {
                this.loading = false
            }
        }
    }
}
</script>
