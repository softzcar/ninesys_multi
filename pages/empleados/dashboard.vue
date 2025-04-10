<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="
                    dataUser.departamento === 'Administración' ||
                    dataUser.departamento === 'Empleado' ||
                    dataUser.departamento === 'Corte' ||
                    dataUser.departamento === 'Impresión' ||
                    dataUser.departamento === 'Estampado' ||
                    dataUser.departamento === 'Costura' ||
                    dataUser.departamento === 'Limpieza' ||
                    dataUser.departamento === 'Revisión' ||
                    dataUser.departamento === 'Diseño'
                "
            >
                <b-overlay :show="overlay" spinner-small>
                    <b-container fluid>
                        <b-row>
                            <b-col>
                                <h3 class="mb-4 mt-4 text-center">
                                    {{ titulo }}
                                </h3>
                                <empleados-SseOrdenesAsignadasV4
                                    :updatedata="updateData()"
                                    :emp="dataUser.id_empleado"
                                />
                            </b-col>
                        </b-row>
                    </b-container>
                </b-overlay>
            </div>

            <div v-else>
                <accessDenied />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";

export default {
    data() {
        return {
            titulo: "",
            overlay: true,
            dataTable: [],
            tareaEnCurso: null,
        };
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
    methods: {
        updateData(data) {
            console.log(
                "Vamos a actualizar los datos en la vista de tareas activas aqui",
                data
            );
        },
        async getEmpleados() {
            await this.$axios
                .get(`${this.$config.API}/empleados`)
                .then((resp) => {
                    this.dataTable = resp.data;
                    this.overlay = false;
                });
        },

        deleteEmpleado(id_emp) {
            this.$confirm(
                `¿Desea Elimiar el empleado ${id_emp} ?`,
                "Eliminar Empleado",
                "warning"
            )
                .then(() => {
                    this.overlay = true;
                    const data = new URLSearchParams();
                    data.set("id", id_emp);

                    axios
                        .post(`${this.$config.API}/empleados/eliminar`, data)
                        .then((res) => {
                            this.getEmpleados().then(
                                () => (this.overlay = false)
                            );
                        });
                })
                .catch((err) => {
                    console.log("CATCH!!!", err);
                    return false;
                });
        },
    },
    mounted() {
        this.overlay = false;
        // this.SSEConnect(`empleados/ordenes-asignadas/${this.dataUser.id_empleado}`);
        this.getEmpleados().then(() => {
            this.overlay = false;
        });
    },
};
</script>
