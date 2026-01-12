<template>
    <div>
        <b-alert v-if="status === 'terminado'" show variant="success">TERMINADA</b-alert>
        <b-overlay :show="overlay" spinner-small>
            <!-- Contenedor responsive: horizontal en desktop, vertical en mobile -->
            <div class="progress-container">
                <!-- Botones de acción -->
                <div class="action-buttons">
                    <div class="action-button-item">
                        <inventario-prioridad-switch :item="item" />
                    </div>

                    <div class="action-button-item">
                        <produccionsse-asignar :asign="asignacion" :empleados="empleados" :emp_asignados="emp_asignados"
                            :por_asignar="por_asignar" :id="item.orden" :orden_productos="orden_productos"
                            reloadtest="Reload test!!!" :lote_detalles="lote_detalles" :lotes_fisicos="lotes_fisicos"
                            @refresh-data="reloadOrders" />
                    </div>

                    <div class="action-button-item">
                        <produccionsse-reposicion :departamento="this.$store.state.login.dataUser.departamento
                            " @reload="reloadOrders" :empleados="empleados" :reposicion_ordenes_productos="reposicion_ordenes_productos
                                " :item="item" />
                    </div>
                </div>

                <!-- Radial Chart + Departamento -->
                <div class="progress-bar-wrapper">
                    <apexchart type="radialBar" :options="chartOptions" :series="chartSeries" height="70" width="70">
                    </apexchart>
                    <span :id="`dept-label-${item.orden}`" class="department-label">
                        {{ departmentLabel }}
                    </span>
                    <b-tooltip v-if="item.paso && item.paso.length > maxChars" :target="`dept-label-${item.orden}`"
                        triggers="hover">
                        {{ item.paso }}
                    </b-tooltip>
                </div>
            </div>
        </b-overlay>
    </div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts';

export default {
    components: {
        apexchart: VueApexCharts,
    },
    data() {
        return {
            max: 100,
            overlay: false,
            maxChars: 15 // Máximo de caracteres para el nombre del departamento
        };
    },

    computed: {
        miPorcentaje() {
            // Directamente usa el valor de la prop. Si no existe, devuelve 0.
            return this.item.progreso_porcentaje || 0;
        },
        status() {
            // Directamente usa el valor de la prop.
            return this.item.estatus;
        },
        departmentLabel() {
            // Truncar el nombre del departamento si excede maxChars
            const departmentName = this.item.paso || '';
            if (departmentName.length > this.maxChars) {
                return departmentName.substring(0, this.maxChars) + '...';
            }
            return departmentName;
        },
        chartSeries() {
            return [this.miPorcentaje];
        },
        chartOptions() {
            return {
                chart: {
                    type: 'radialBar',
                    sparkline: {
                        enabled: true // Elimina padding y labels externos
                    }
                },
                plotOptions: {
                    radialBar: {
                        hollow: {
                            size: '55%'  // Reducido para hacer el anillo más grueso
                        },
                        track: {
                            background: '#2d3748',
                            strokeWidth: '100%',
                            margin: 0
                        },
                        dataLabels: {
                            show: true,
                            name: {
                                show: false
                            },
                            value: {
                                show: true,
                                fontSize: '18px',  // Aumentado de 16px
                                fontWeight: 'bold',
                                color: '#00bc8c',  // Verde brillante en lugar de blanco
                                offsetY: 6,
                                formatter: (val) => `${Math.round(val)}%`
                            }
                        }
                    }
                },
                colors: ['#00bc8c'], // Verde del tema
                stroke: {
                    lineCap: 'round'
                }
            };
        }
    },

    methods: {
        reloadOrders() {
            console.log('emit desde progressBar');
            this.$emit("reload", true);
        },
    },

    props: {
        item: {
            type: Object,
            required: true,
        },
        // Las siguientes props se mantienen porque son usadas por los componentes hijos
        // que no estamos modificando en este momento (asignar, reposicion, etc.)
        asignacion: Array,
        emp_asignados: Array,
        por_asignar: Array,
        empleados: Array,
        pasos: Array,
        orden_productos: Array,
        lote_detalles: Array,
        lotes_fisicos: Array,
        reposicion_ordenes_productos: Array,
    },
};
</script>

<style scoped>
/* Contenedor principal - Responsive flex */
.progress-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    margin: 0;
    padding: 0;
}

.progress-bar-wrapper {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: max-content;
    /* Se adapta al contenido máximo */
}

/* Label del departamento al lado del chart */
.department-label {
    font-size: 15px;
    font-weight: 600;
    color: #00bc8c;
    /* Verde brillante en lugar de blanco */
    white-space: nowrap;
}

/* Eliminar padding interno del componente b-progress (ya no usado pero por compatibilidad) */
.progress-bar-wrapper>>>.progress {
    margin: 0;
    padding: 0;
}

.progress-bar-wrapper>>>.progress-bar {
    margin: 0;
}

.div.progress {
    background-color: darkslategray;
}

.action-buttons {
    margin: 0;
    padding: 0;
}

/* Desktop: layout horizontal */
@media (min-width: 992px) {
    .progress-container {
        flex-direction: row;
        align-items: center;
        gap: 8px;
    }

    .progress-bar-wrapper {
        flex: 1;
    }

    .action-buttons {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
    }
}

/* Mobile: layout vertical */
@media (max-width: 991px) {
    .progress-bar-wrapper {
        width: 100%;
    }

    .action-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
}

/* Botones de acción */
.action-button-item {
    flex-shrink: 0;
}

/* Estilos legacy para compatibilidad */
.margin-buttons-bar {
    margin-top: 20px;
}

.floatme {
    float: left;
    margin-right: 4px;
}
</style>
