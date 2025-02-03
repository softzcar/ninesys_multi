<template>
    <div>
        <b-container fluid>
            <b-row>
                <b-card>
                    <h5>Ordenar Departamentos</h5>

                    <!-- Tabla de Bootstrap Vue -->
                    <b-table striped bordered hover :items="departamentosOrd" :fields="fields">

                        <!-- Columna para mover (ícono de arrastre) -->
                        <template #cell(_id)>
                            <span class="drag-handle" style="cursor: grab;">☰</span>
                        </template>

                        <!-- Columna para el nombre del departamento -->
                        <template #cell(departamento)="row">
                            {{ row.item.departamento }}
                        </template>

                        <!-- Columna para mostrar el orden -->
                        <template #cell(orden_proceso)="row">
                            <b-badge variant="primary">{{ row.item.orden_proceso }}</b-badge>
                        </template>

                        <!-- Draggable envuelve el cuerpo de la tabla -->
                        <template #table-busy>
                            <draggable tag="tbody" v-model="departamentosOrd" @end="actualizarOrden"
                                handle=".drag-handle">
                                <tr v-for="(departamento, index) in departamentosOrd" :key="index">
                                    <td>
                                        <span class="drag-handle" style="cursor: grab;">☰</span>
                                    </td>
                                    <td>{{ departamento.departamento }}</td>
                                    <td>
                                        <b-badge variant="primary">{{ departamento.orden_proceso }}</b-badge>
                                    </td>
                                </tr>
                            </draggable>
                        </template>

                    </b-table>

                    <!-- Draggable para reordenar filas -->
                    <draggable tag="tbody" v-model="departamentosOrd" @end="actualizarOrden" handle=".drag-handle">
                        <tr v-for="(departamento, index) in departamentosOrd" :key="index">
                            <td>
                                <span class="drag-handle" style="cursor: grab;">☰</span>
                            </td>
                            <td>
                                <b-badge variant="primary">{{ departamento.orden_proceso }}</b-badge>
                            </td>
                            <td>{{ departamento.departamento }}</td>
                        </tr>
                    </draggable>

                </b-card>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import draggable from "vuedraggable";
import { mapState, mapGetters } from "vuex"

export default {
    components: { draggable },

    data() {
        return {
            departamentosOrd: [], // Aquí se cargarán los datos desde la API
            fields: [
                { key: "orden_proceso", label: "Orden" },
                { key: "departamento", label: "Departamento" },
                { key: "_id", label: "Accuines" },
            ],
        };
    },

    computed: {
        ...mapState("login", ["dataUser", "access", "departamentos"]),
        ...mapGetters("login", ["getDepartamentosSelect"]),
    },

    async mounted() {
        await this.getDepartamentos(); // Cargar datos al iniciar
    },

    methods: {
        testClick(dep) {
            console.log('click!!', dep)
        },
        async getDepartamentos() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/departamentos`)
                .then((res) => {
                    this.departamentosOrd = res.data
                    this.$store.commit("login/setDepartamentos", res.data)
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error cargando los departamentos",
                        html: `<p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },
        async actualizarOrden() {
            // Crear un array con el nuevo orden
            const nuevosOrdenes = this.departamentosOrd.map((dep, index) => ({
                _id: dep._id,
                departamento: dep.departamento,
                orden_proceso: index + 1
            }));


            try {
                this.departamentosOrd = nuevosOrdenes
                // await this.$axios.post(`${this.$config.API}/actualizar-orden`, { ordenes: nuevosOrdenes });
                console.log("Orden actualizado correctamente.", nuevosOrdenes);
            } catch (error) {
                console.error("Error al actualizar orden:", error);
            }
        }
    },
};
</script>
