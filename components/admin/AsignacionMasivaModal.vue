<template>
    <b-modal :id="id" :title="`Asignación Masiva: ${insumoBaseName}`" size="lg" @ok="handleOk" @shown="prepareData"
        @hidden="resetData">
        <div v-if="localItems.length > 0">
            <!-- Configuración Global -->
            <b-row class="mb-3">
                <b-col md="6">
                    <b-form-group label="Asignar Unidad a Todos:" label-for="masiva-unidad">
                        <b-form-select id="masiva-unidad" v-model="globalUnit" :options="unitOptions"
                            @change="applyUnitToAll"></b-form-select>
                    </b-form-group>
                </b-col>
                <b-col md="6">
                    <b-form-group label="Cantidad Base (Talla S / Referencia):" label-for="masiva-cantidad">
                        <div class="d-flex align-items-center">
                            <b-form-input id="masiva-cantidad" type="number" v-model.number="baseQuantity"
                                @input="calculateQuantities" placeholder="Ej: 1.0" class="mr-2"></b-form-input>
                            <b-badge :variant="useCalculation ? 'primary' : 'info'" class="p-2"
                                style="white-space: nowrap;">
                                <b-icon :icon="useCalculation ? 'arrow-repeat' : 'check-all'" class="mr-1"></b-icon>
                                {{ useCalculation ? 'Recalcular' : 'Asignar Todos' }}
                            </b-badge>
                        </div>
                    </b-form-group>
                </b-col>
            </b-row>

            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5>Previsualización de Asignaciones</h5>
                <b-form-checkbox v-model="useCalculation" switch @change="calculateQuantities">
                    Activar Cálculo Automático (%)
                </b-form-checkbox>
            </div>

            <!-- Tabla de Previsualización -->
            <b-table-simple hover small responsive bordered>
                <b-thead head-variant="light">
                    <b-tr>
                        <b-th>Talla</b-th>
                        <b-th class="text-center">Variación %</b-th>
                        <b-th>Cantidad</b-th>
                        <b-th>Unidad</b-th>
                    </b-tr>
                </b-thead>
                <b-tbody>
                    <b-tr v-for="(item, index) in localItems" :key="index">
                        <b-td><strong>{{ item.tallaLabel }}</strong></b-td>
                        <b-td class="text-center">
                            <span v-if="item.variation_percentage > 0" class="text-success">+{{
                                item.variation_percentage }}%</span>
                            <span v-else-if="item.variation_percentage < 0" class="text-danger">{{
                                item.variation_percentage }}%</span>
                            <span v-else class="text-muted">--</span>
                        </b-td>
                        <b-td>
                            <b-form-input type="number" v-model.number="item.cantidad" size="sm"
                                step="0.01"></b-form-input>
                        </b-td>
                        <b-td>
                            <b-form-select v-model="item.unidadDeMedida" :options="unitOptions"
                                size="sm"></b-form-select>
                        </b-td>
                    </b-tr>
                </b-tbody>
            </b-table-simple>

            <b-alert show variant="info" class="mt-2" v-if="useCalculation">
                <b-icon icon="info-circle"></b-icon> Las cantidades se calculan basándose en la <strong>Cantidad
                    Base</strong> y el <strong>Porcentaje de Variación</strong> de cada talla.
            </b-alert>
        </div>
        <div v-else class="text-center py-4">
            <b-spinner label="Cargando..."></b-spinner>
            <p>Cargando información de tallas...</p>
        </div>

        <template #modal-footer="{ ok, cancel }">
            <b-button variant="secondary" @click="cancel()">Cancelar</b-button>
            <b-button variant="success" @click="ok()">
                <b-icon icon="check-lg"></b-icon> Aplicar Asignaciones
            </b-button>
        </template>
    </b-modal>
</template>

<script>
export default {
    name: "AsignacionMasivaModal",
    props: {
        id: {
            type: String,
            required: true,
        },
        insumoBaseName: {
            type: String,
            default: "Insumo Seleccionado",
        },
        insumoBaseId: {
            type: [String, Number],
            default: null
        },
        tallasDisponibles: {
            type: Array, // Array de objetos { value (id), text (nombre), variation_percentage }
            default: () => [],
        },
        unitOptions: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            globalUnit: null,
            baseQuantity: 1,
            localItems: [],
            useCalculation: true,
        };
    },
    watch: {
        tallasDisponibles: {
            handler(val) {
                if (val && val.length > 0 && this.localItems.length === 0) {
                    // Si cambian las tallas y no tenemos items, inicializar
                    // Pero mejor hacerlo en 'prepareData'
                }
            },
            deep: true
        }
    },
    methods: {
        prepareData() {
            // Convertir las tallas disponibles en items editables
            this.localItems = this.tallasDisponibles
                .filter(t => t.value !== null) // Filtrar opciones placeholder
                .map((talla) => ({
                    insumo: this.insumoBaseId,
                    miTalla: talla.value,
                    tallaLabel: talla.text,
                    variation_percentage: parseFloat(talla.variation_percentage || 0),
                    cantidad: 1,
                    unidadDeMedida: this.globalUnit,
                }));

            this.calculateQuantities();
        },

        resetData() {
            this.localItems = [];
            this.globalUnit = null;
            this.baseQuantity = 1;
            this.useCalculation = true;
        },

        calculateQuantities() {
            const base = parseFloat(this.baseQuantity) || 0;

            if (this.useCalculation) {
                // Cálculo automático basado en porcentajes
                this.localItems = this.localItems.map(item => {
                    const factor = 1 + (item.variation_percentage / 100);
                    let calculated = base * factor;
                    return {
                        ...item,
                        cantidad: parseFloat(calculated.toFixed(4))
                    };
                });
            } else {
                // Asignación manual de la misma cantidad a todos
                this.localItems = this.localItems.map(item => ({
                    ...item,
                    cantidad: base
                }));
            }
        },

        applyUnitToAll() {
            if (this.globalUnit) {
                this.localItems = this.localItems.map(item => ({
                    ...item,
                    unidadDeMedida: this.globalUnit
                }));
            }
        },

        handleOk(bvModalEvt) {
            bvModalEvt.preventDefault();

            if (!this.globalUnit) {
                this.$fire({
                    type: "warning",
                    title: "Falta Unidad",
                    text: "Por favor seleccione una unidad de medida para realizar la asignación.",
                });
                return;
            }

            /* Validar que todos tengan cantidad > 0 ?? No necesariamente, puede ser 0 */

            this.$emit("apply", this.localItems);
            this.$nextTick(() => {
                this.$bvModal.hide(this.id);
            });
        },
    },
};
</script>

<style scoped>
.table-responsive {
    max-height: 400px;
    overflow-y: auto;
}
</style>
