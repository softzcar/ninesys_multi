<template>
    <div>
        <b-button variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="pencil"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" ok-only>
            <b-container>
                <b-row>
                    <b-col>
                        <p>
                            Seleccione el estatus de la orden
                        </p>
                        <p>
                            <b-overlay :show="overlay" spinner-small>
                                <b-form-select v-model="selected" :options="options"
                                    @change="handleStatusChange"></b-form-select>
                            </b-overlay>
                        </p>

                        <!-- Mensaje de Error y Tareas Pendientes -->
                        <div v-if="errorMessage" class="mt-3">
                            <b-alert show variant="danger">
                                <h6 class="alert-heading">{{ errorMessage }}</h6>
                                <hr v-if="pendingTasks.length > 0">
                                <b-table v-if="pendingTasks.length > 0" :items="pendingTasks" :fields="fields" small
                                    bordered head-variant="light" class="mt-2" style="font-size: 0.8rem;"></b-table>
                            </b-alert>
                        </div>

                        <p>
                        <ul>
                            <li>
                                <strong>En espera</strong>: La orden aún no ha iniciado el proceso de fabricación
                            </li>
                            <li>
                                <strong>Activa</strong>: La orden está en proceso de fabricación
                            </li>
                            <li>
                                <strong>Pausada</strong>: El proceso de fabricación se ha detenido, se reanudará
                                posteriormente
                            </li>
                            <li>
                                <strong>Cancelada</strong>: La fabricación se ha interrupido y no se reanudará
                            </li>
                            <li>
                                <strong>Terminada</strong>: El proceso de fabricación ha concluido
                            </li>
                            <li>
                                <strong>Entregada</strong>: La orden ha sido despachada al cliente
                            </li>
                        </ul>
                        </p>
                    </b-col>
                </b-row>
            </b-container>
        </b-modal>

        <!-- Modal de Confirmación de Cancelación -->
        <b-modal :id="modalCancelacion" title="⚠️ Confirmar Cancelación de Orden" size="lg" header-bg-variant="warning"
            header-text-variant="dark" @ok="confirmCancelacion" @hidden="onModalCancelacionHidden"
            ok-title="Sí, Cancelar Orden" cancel-title="No, Regresar" ok-variant="danger">
            <b-overlay :show="overlayCancelacion" spinner-small>
                <p class="mb-3">
                    <strong>¿Está seguro de cancelar esta orden?</strong>
                </p>
                <p v-if="tareasCancelacion.length > 0">
                    Las siguientes <strong>asignaciones de empleados</strong> serán <strong
                        class="text-danger">eliminadas permanentemente</strong>:
                </p>
                <p v-else class="text-muted">
                    No hay asignaciones pendientes que eliminar.
                </p>

                <b-table v-if="tareasCancelacion.length > 0" :items="tareasCancelacion" :fields="fields" small bordered
                    striped head-variant="dark" class="mt-2" style="font-size: 0.85rem;"></b-table>

                <b-alert show variant="info" class="mt-3 mb-0">
                    <small>
                        <b-icon icon="info-circle"></b-icon>
                        Las tareas que los empleados ya hayan marcado como <strong>completadas</strong> se mantendrán en
                        el historial.
                    </small>
                </b-alert>
            </b-overlay>
        </b-modal>

        <!-- Modal de Advertencia de Reactivación -->
        <b-modal :id="modalReactivacion" title="⚠️ Advertencia: Orden sin Personal Asignado" size="lg"
            header-bg-variant="warning" header-text-variant="dark" @ok="confirmarReactivacion"
            @hidden="revertirReactivacion" ok-title="Sí, Reactivar de Todas Formas" cancel-title="No, Cancelar"
            ok-variant="warning">
            <p class="mb-2">
                Esta orden fue <strong>cancelada previamente</strong> y <strong class="text-danger">no tiene personal
                    asignado</strong>.
            </p>
            <p class="mb-3">
                Si continúa, deberá <strong>asignar empleados manualmente</strong> desde la sección de Producción.
            </p>
            <p class="mb-0">
                <strong>¿Desea reactivar esta orden de todas formas?</strong>
            </p>
        </b-modal>

        <!-- Modal de Motivo para Cancelación/Terminación Manual -->
        <b-modal :id="modalMotivo" title="Motivo Obligatorio" size="md" header-bg-variant="danger"
            header-text-variant="white" @ok="confirmarConMotivo" @cancel="cancelarMotivo" @hidden="cancelarMotivo"
            ok-title="Confirmar" cancel-title="Cancelar" ok-variant="danger"
            :ok-disabled="!motivoCambio || motivoCambio.trim() === ''">
            <p class="mb-2">
                Debe proporcionar un <strong>motivo detallado</strong> para esta acción:
            </p>
            <b-form-textarea v-model="motivoCambio" rows="4" max-rows="8"
                placeholder="Explique la razón de esta acción..." required></b-form-textarea>
            <small class="text-muted">Este motivo quedará registrado en el sistema.</small>
        </b-modal>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"

export default {
    data() {
        return {
            size: 'md',
            title: 'Editar estado de la orden',
            overlay: false,
            overlayCancelacion: false,
            selected: this.data.estatus,
            previousSelected: this.data.estatus,
            cancelacionConfirmada: false,
            reactivacionConfirmada: false,
            motivoCambio: '', // Motivo para cancelación/terminación
            esperandoMotivo: false, // Flag para saber si estamos esperando motivo
            options: [],
            errorMessage: null,
            pendingTasks: [],
            tareasCancelacion: [],
            fields: [
                { key: 'departamento', label: 'Dpto' },
                { key: 'empleado', label: 'Empleado' },
                { key: 'status_tarea', label: 'Estado' }
            ]
        }
    },

    mixins: [mixin],

    computed: {
        modal: function () {
            const rand = Math.random()
                .toString(36)
                .substring(2, 7)

            return `modal-${rand}`
        },
        modalCancelacion: function () {
            return `modal-cancelacion-${this.modal}`
        },
        modalReactivacion: function () {
            return `modal-reactivacion-${this.modal}`
        },
        modalMotivo: function () {
            return `modal-motivo-${this.modal}`
        }
    },

    methods: {
        async handleStatusChange() {
            // Si se selecciona "cancelada", mostrar modal de confirmación primero
            if (this.selected === 'cancelada') {
                await this.showCancelacionConfirm()
            } else {
                await this.saveData()
            }
        },

        async showCancelacionConfirm() {
            this.overlayCancelacion = true
            this.tareasCancelacion = []

            try {
                const data = new URLSearchParams()
                data.set('id', this.data.orden)

                const res = await this.$axios.post(`${this.$config.API}/orden/previa-cancelacion`, data)
                this.tareasCancelacion = res.data.tareas_pendientes || []
                this.overlayCancelacion = false

                // Mostrar modal de confirmación
                this.$bvModal.show(this.modalCancelacion)
            } catch (err) {
                this.overlayCancelacion = false
                this.errorMessage = 'Error al consultar las tareas pendientes.'
                this.selected = this.previousSelected
            }
        },

        async confirmCancelacion() {
            // Usuario confirmó la cancelación, marcar bandera
            this.cancelacionConfirmada = true
            await this.saveData()
        },

        onModalCancelacionHidden() {
            // Solo revertir si NO fue confirmada exitosamente
            if (!this.cancelacionConfirmada) {
                this.selected = this.previousSelected
            }
            // Resetear bandera para próximo uso
            this.cancelacionConfirmada = false
        },

        confirmarReactivacion() {
            // Usuario confirmó reactivación, marcar bandera
            this.reactivacionConfirmada = true
            // Llamar saveData con forzar_reactivacion
            this.saveData(true)
        },

        revertirReactivacion() {
            // Solo revertir si NO fue confirmada
            if (!this.reactivacionConfirmada) {
                this.selected = this.previousSelected
            }
            // Resetear bandera
            this.reactivacionConfirmada = false
        },

        confirmarConMotivo() {
            // Usuario confirmó con motivo, proceder a guardar
            this.esperandoMotivo = false
            this.saveData()
        },

        cancelarMotivo() {
            // Usuario canceló o cerró modal, revertir cambio
            if (this.esperandoMotivo) {
                this.selected = this.previousSelected
                this.esperandoMotivo = false
                this.motivoCambio = ''
            }
        },

        async saveData(forzarReactivacion = false) {
            this.overlay = true
            this.errorMessage = null
            this.pendingTasks = []

            const data = new URLSearchParams()
            data.set('estado', this.selected)
            data.set('id', this.data.orden)
            if (forzarReactivacion) {
                data.set('forzar_reactivacion', '1')
            }

            // Si es cancelada o terminada, verificar que tenemos motivo
            if ((this.selected === 'cancelada' || this.selected === 'terminada') && !this.esperandoMotivo) {
                // Si no hay motivo, mostrar modal
                if (!this.motivoCambio || this.motivoCambio.trim() === '') {
                    this.esperandoMotivo = true
                    this.$bvModal.show(this.modalMotivo)
                    this.overlay = false
                    return
                }
                // Si tenemos motivo, agregarlo
                data.set('motivo', this.motivoCambio.trim())
                data.set('id_admin', this.$store.state.login.dataUser.id_empleado || 0)
                data.set('nombre_admin', this.$store.state.login.dataUser.nombre || 'Administrador')
            }

            try {
                const res = await this.$axios.post(`${this.$config.API}/orden/actualizar-estado`, data)
                this.overlay = false
                this.previousSelected = this.selected

                if (this.selected === 'terminada') {
                    this.sendMessageClient(this.data.orden, 'terminar')
                }

                // Si fue cancelación exitosa, mostrar mensaje
                if (this.selected === 'cancelada') {
                    this.$bvToast.toast('La orden ha sido cancelada y las asignaciones pendientes eliminadas.', {
                        title: 'Orden Cancelada',
                        variant: 'warning',
                        solid: true
                    })
                }

                // Si fue reactivación exitosa, mostrar mensaje
                if (forzarReactivacion) {
                    this.$bvToast.toast('La orden ha sido reactivada. Recuerde asignar personal manualmente.', {
                        title: 'Orden Reactivada',
                        variant: 'info',
                        solid: true
                    })
                } else if (this.selected !== 'cancelada') {
                    // Toast genérico para otros cambios de estado exitosos
                    const estadoTexto = this.selected.charAt(0).toUpperCase() + this.selected.slice(1)
                    this.$bvToast.toast(`El estado de la orden se ha actualizado correctamente.`, {
                        title: `Estado: ${estadoTexto}`,
                        variant: 'success',
                        solid: true
                    })
                }

                // Emit para actualizar datos en componente padre
                this.$emit('updated')
            } catch (err) {
                this.overlay = false
                if (err.response && err.response.status === 400) {
                    // Detectar advertencia de reactivación
                    if (err.response.data.advertencia_reactivacion) {
                        // Mostrar modal de advertencia de reactivación
                        this.$bvModal.show(this.modalReactivacion)
                        return
                    }

                    // Otros errores de validación
                    this.errorMessage = err.response.data.message || err.response.data.error || 'Error de validación'
                    this.pendingTasks = err.response.data.tareas_pendientes || []
                    // Revertir selección local si falló
                    this.selected = this.previousSelected
                } else {
                    this.errorMessage = 'Ocurrió un error al actualizar el estado.'
                    this.selected = this.previousSelected
                }
            }
        },
    },

    mounted() {
        const departamento = this.$store.state.login.dataUser.departamento
        console.log('DEBUG editar.vue - Departamento del usuario:', departamento)

        // Mapeo de nombres a IDs de departamentos estándar (no editables en el sistema)
        const DEPT_IDS = {
            'Administración': 5,
            'Comercialización': 6,
            'Comecialización': 6, // Typo en BD, mapear al mismo ID
            'Producción': 8
        }

        const departamentoId = DEPT_IDS[departamento]
        console.log('DEBUG: ID de departamento:', departamentoId)

        // Filtrar opciones según ID de departamento
        if (departamentoId === 8) {
            // Producción (ID 8): Todos MENOS Cancelada y Entregada
            console.log('DEBUG: Cargando opciones para Producción (ID 8)')
            this.options = [
                { value: 'En espera', text: 'En espera' },
                { value: 'activa', text: 'Activa' },
                { value: 'pausada', text: 'Pausada' },
                { value: 'terminada', text: 'Terminada' }
            ]
        } else if (departamentoId === 6) {
            // Comercialización (ID 6): SOLO Entregada
            console.log('DEBUG: Cargando opciones para Comercialización (ID 6)')
            this.options = [
                { value: 'entregada', text: 'Entregada' }
            ]
        } else if (departamentoId === 5) {
            // Administración (ID 5): TODOS los estados
            console.log('DEBUG: Cargando opciones para Administración (ID 5)')
            this.options = [
                { value: 'En espera', text: 'En espera' },
                { value: 'activa', text: 'Activa' },
                { value: 'pausada', text: 'Pausada' },
                { value: 'cancelada', text: 'Cancelada' },
                { value: 'terminada', text: 'Terminada' },
                { value: 'entregada', text: 'Entregada' }
            ]
        } else {
            // Fallback: solo el estado actual (sin cambios permitidos)
            console.warn('DEBUG: Departamento no reconocido. Departamento:', departamento, 'ID:', departamentoId)
            this.options = [
                { value: this.data.estatus, text: this.data.estatus }
            ]
        }

        console.log('DEBUG: Opciones cargadas:', this.options)
    },

    props: ['data'],
}
</script>
