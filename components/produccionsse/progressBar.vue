<template>
    <div>
        <b-alert v-if="status === 'terminado'" show variant="success"
            >TERMINADA</b-alert
        >
        <b-overlay :show="overlay" spinner-small>
            <div>
                <div class="floatme">
                    <span class="capital"
                        ><strong> {{ this.item.paso }}</strong>
                    </span>
                    <b-progress :max="max" variant="success">
                        <b-progress-bar class="my-bar" :value="miPorcentaje">
                            <strong>{{ miPorcentaje }}%</strong>
                        </b-progress-bar>
                    </b-progress>
                </div>
            </div>

            <div>
                <div class="floatme margin-buttons-bar">
                    <inventario-prioridad-switch :item="item" />
                </div>

                <div class="floatme margin-buttons-bar">
                    <produccionsse-asignar
                        :asign="asignacion"
                        :empleados="empleados"
                        :emp_asignados="emp_asignados"
                        :por_asignar="por_asignar"
                        :id="item.orden"
                        :orden_productos="orden_productos"
                        reloadtest="Reload test!!!"
                        :lote_detalles="lote_detalles"
                        :lotes_fisicos="lotes_fisicos"
                        @refresh-data="reloadOrders"
                    />
                </div>
                <div class="floatme margin-buttons-bar">
                    <produccionsse-reposicion
                        :departamento="
                            this.$store.state.login.dataUser.departamento
                        "
                        @reload="reloadOrders"
                        :empleados="empleados"
                        :reposicion_ordenes_productos="
                            reposicion_ordenes_productos
                        "
                        :item="item"
                    />
                </div>
            </div>
        </b-overlay>
    </div>
</template>

<script>
export default {
    data() {
        return {
            max: 100,
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
.margin-buttons-bar {
    margin-top: 20px;
}

.floatme {
    float: left;
    margin-right: 4px;
}
</style>
