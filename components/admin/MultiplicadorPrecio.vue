<template>
    <div>
        <b-card title="Multiplicador de Precio USD → VES" border-variant="primary" class="shadow-sm">
            <b-alert show variant="info" class="mb-3">
                <b-icon icon="info-circle-fill" class="mr-2"></b-icon>
                Este multiplicador se aplica a nivel de empresa y se muestra en el wizard de creación de órdenes para
                conversión de USD a VES.
            </b-alert>

            <b-row>
                <b-col md="6">
                    <b-form-group label="Multiplicador Actual:" label-for="input-multiplicador"
                        description="Porcentaje de margen para conversión USD → VES">
                        <b-input-group append="%">
                            <b-form-input id="input-multiplicador" v-model.number="formMultiplicador" type="number"
                                step="0.1" min="0" max="100" :state="validationState" />
                        </b-input-group>
                        <b-form-invalid-feedback :state="validationState">
                            El multiplicador debe estar entre 0% y 100%
                        </b-form-invalid-feedback>
                    </b-form-group>

                    <b-button variant="success" @click="actualizarMultiplicador"
                        :disabled="!validationState || guardando">
                        <b-spinner small v-if="guardando"></b-spinner>
                        {{ guardando ? 'Guardando...' : 'Guardar Multiplicador' }}
                    </b-button>
                </b-col>

                <b-col md="6">
                    <div class="bg-light p-3 rounded">
                        <h6 class="text-muted mb-3">Ejemplo de aplicación:</h6>
                        <p class="mb-2">
                            <strong>Precio base:</strong> $100.00 USD
                        </p>
                        <p class="mb-2">
                            <strong>Multiplicador:</strong> {{ formMultiplicador || 0 }}%
                        </p>
                        <p class="mb-2">
                            <strong>Tasa BCV (ejemplo):</strong> 45.00 Bs/$
                        </p>
                        <hr>
                        <p class="mb-0">
                            <strong>Resultado:</strong>
                            <span class="text-success">{{ calcularEjemplo() }} Bs</span>
                        </p>
                        <small class="text-muted">
                            (Con margen aplicado)
                        </small>
                    </div>
                </b-col>
            </b-row>
        </b-card>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'MultiplicadorPrecio',

    data() {
        return {
            formMultiplicador: 0,
            guardando: false
        }
    },

    computed: {
        ...mapState('login', ['datos_personalizacion', 'idEmpresa']),

        validationState() {
            const val = parseFloat(this.formMultiplicador)
            return !isNaN(val) && val >= 0 && val <= 100
        }
    },

    mounted() {
        // Cargar el multiplicador actual desde Vuex
        if (this.datos_personalizacion && this.datos_personalizacion.multiplicador_precio) {
            this.formMultiplicador = parseFloat(this.datos_personalizacion.multiplicador_precio)
        }
    },

    methods: {
        calcularEjemplo() {
            const precioBase = 100
            const tasaBCV = 45.00
            const margen = parseFloat(this.formMultiplicador) || 0
            const tasaConMargen = tasaBCV * (1 + margen / 100)
            const resultado = precioBase * tasaConMargen

            return new Intl.NumberFormat('es-VE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(resultado)
        },

        async actualizarMultiplicador() {
            if (!this.validationState) {
                return
            }

            this.guardando = true

            try {
                const data = new URLSearchParams()
                data.set('multiplicador_precio', this.formMultiplicador)

                const response = await this.$axios.post(
                    `${this.$config.API}/config/multiplicador-precio`,
                    data
                )

                if (response.data.success) {
                    // Actualizar Vuex
                    this.$store.commit('login/setDatosPersonalizacion', {
                        ...this.datos_personalizacion,
                        multiplicador_precio: parseFloat(this.formMultiplicador)
                    })

                    this.$bvToast.toast('Multiplicador actualizado correctamente', {
                        title: 'Éxito',
                        variant: 'success',
                        solid: true
                    })
                } else {
                    throw new Error(response.data.message || 'Error desconocido')
                }
            } catch (error) {
                console.error('Error actualizando multiplicador:', error)
                this.$bvToast.toast(
                    error.response?.data?.message || 'No se pudo actualizar el multiplicador',
                    {
                        title: 'Error',
                        variant: 'danger',
                        solid: true
                    }
                )
            } finally {
                this.guardando = false
            }
        }
    }
}
</script>

<style scoped>
.bg-light {
    background-color: #f8f9fa !important;
}
</style>
