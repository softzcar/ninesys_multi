<template>
    <div>
        <div v-if="
            accessModule.accessData.id_modulo === 1 ||
            accessModule.accessData.id_modulo === 3 ||
            accessModule.accessData.id_modulo === 4
        ">
            <b-overlay :show="overlay" spinner-small>
                <b-container fluid>
                    <!-- Estadísticas y Gráficos -->
                    <b-row class="mb-4 mt-4" v-if="showCharts">
                        <!-- Gráfico de Estado de Órdenes -->
                        <b-col md="4" sm="12" class="mb-4">
                            <b-card :title="currentDepartamentId === 7 ? 'Estado de Diseños' : 'Estado de Órdenes'">
                                <charts-OrdersStatusChart :finished="stats.status.terminadas"
                                    :pending="stats.status.pendientes" :actives="stats.status.activas" />
                            </b-card>
                        </b-col>

                        <!-- Gráfico de Estado de Reposiciones -->
                        <b-col md="4" sm="12" class="mb-4">
                            <b-card title="Estado de Reposiciones">
                                <charts-OrdersStatusChart 
                                    :finished="stats.reposiciones.terminadas"
                                    :pending="stats.reposiciones.pendientes"
                                    :actives="stats.reposiciones.en_curso"
                                />
                            </b-card>
                        </b-col>

                        <!-- Gráfico de Eficiencia - Oculto para Impresión y Diseño -->
                        <b-col md="4" sm="12" class="mb-4"
                            v-if="currentDepartamentId !== 7 && currentDepartamentId !== 1">
                            <b-card title="Eficiencia de Tiempo">
                                <charts-EfficiencyChart :realTime="stats.eficiencia.tiempo_real"
                                    :estimatedTime="stats.eficiencia.tiempo_estimado" />
                            </b-card>
                        </b-col>

                        <!-- Gráfico de Pagos Semanales - Oculto para Producción -->
                        <b-col md="4" sm="12" class="mb-4" v-if="accessModule.accessData.id_modulo !== 5">
                            <b-card title="Pagos Semanales">
                                <charts-BarChart title="" :seriesData="pagosSemana.valores"
                                    :categories="pagosSemana.dias" seriesName="Pago" color="#00E396" valuePrefix="$"
                                    :height="300" />
                            </b-card>
                        </b-col>
                    </b-row>

                    <b-row v-if="showTasks">
                        <b-col>
                            <h3 class="mb-4 text-center">
                                {{ titulo }}
                            </h3>
                            <empleados-SseOrdenesAsignadasV4 :updatedata="updateData" :emp="dataUser.id_empleado" />
                        </b-col>
                    </b-row>
                </b-container>
            </b-overlay>
        </div>

        <div v-else>
            <accessDenied />
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import mixin from "~/mixins/mixin-login.js";

export default {
    name: "DashboardEmpleado",
    mixins: [mixin],
    props: {
        showCharts: {
            type: Boolean,
            default: true
        },
        showTasks: {
            type: Boolean,
            default: true
        }
    },

    data() {
        return {
            titulo: "Mis Tareas Asignadas",
            activas: 0,
            overlay: true,
            dataTable: [],
            tareaEnCurso: null,
            stats: {
                status: { terminadas: 0, pendientes: 0, activas: 0 },
                reposiciones: { terminadas: 0, en_curso: 0, pendientes: 0 },
                eficiencia: { tiempo_real: 0, tiempo_estimado: 0 },
            },
            pagosSemana: {
                valores: [],
                dias: []
            }
        };
    },
    computed: {
        ...mapState("login", ["dataUser", "access", "currentDepartamentId"]),
    },
    watch: {
        currentDepartamentId(newVal) {
            console.log("Departamento cambiado a:", newVal);
            if (this.showCharts && newVal) {
                this.fetchStats();
            }
        }
    },
    methods: {
        updateData(data) {
            console.log(
                "Vamos a actualizar los datos en la vista de tareas activas aqui",
                data
            );
            // Recargar estadísticas si hay cambios significativos
            if (this.showCharts) {
                this.fetchStats();
            }
        },
        async fetchStats() {
            try {
                const idEmpleado = this.dataUser.id_empleado;
                // Usar departamento actual si existe, sino intentar obtenerlo de dataUser
                // dataUser tiene departamentos como array a veces, o departamento como string.
                // currentDepartamentId viene del SelectDepartament.vue que guarda en Vuex

                let idDepartamento = this.currentDepartamentId;

                if (!idDepartamento) {
                    // Fallback logica simple si no hay currentDepartament set
                    console.warn("No currentDepartamentId found in store, defaulting to 4 (Produccion)");
                    idDepartamento = 4;
                }

                console.log(`Fetching dashboard stats for Emp: ${idEmpleado}, Dept: ${idDepartamento}`);

                const response = await this.$axios.get(`${this.$config.API}/empleados/dashboard-stats/${idEmpleado}/${idDepartamento}`);

                if (response.data) {
                    const data = response.data;
                    console.log("Stats received:", data);

                    // Actualizar status
                    if (data.status) this.stats.status = data.status;

                    // Actualizar reposiciones
                    if (data.reposiciones) this.stats.reposiciones = data.reposiciones;

                    // Actualizar eficiencia
                    if (data.eficiencia) this.stats.eficiencia = data.eficiencia;

                    // Actualizar pagos
                    if (data.pagos_semana && Array.isArray(data.pagos_semana)) {
                        // Configuración de categorías para el gráfico (Lun-Dom)
                        const diasEtiquetas = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                        const valores = [0, 0, 0, 0, 0, 0, 0];

                        // Llenar datos usando la fecha para ser agnóstico del idioma del servidor
                        data.pagos_semana.forEach(item => {
                            if (item.fecha) {
                                // Crear fecha asumiendo YYYY-MM-DD. 
                                // Nota: new Date('2025-12-30') en UTC puede variar, mejor dividir string o usar una librería si hubiera.
                                // Usamos constructor seguro para evitar timezone shifts locales inesperados con strings simples
                                const partes = item.fecha.split('-');
                                const fecha = new Date(partes[0], partes[1] - 1, partes[2]);

                                const dayOfWeek = fecha.getDay(); // 0 = Domingo, 1 = Lunes...

                                // Convertir a índice 0=Lunes, ..., 6=Domingo
                                // Lunes (1) -> 0
                                // Domingo (0) -> 6
                                const chartIndex = (dayOfWeek + 6) % 7;

                                valores[chartIndex] = parseFloat(item.total_pagado);
                            }
                        });

                        this.pagosSemana.valores = valores;
                        this.pagosSemana.dias = diasEtiquetas;
                    }
                }
            } catch (e) {
                console.error("Error fetching stats:", e);
            }
        },
    },
    mounted() {
        this.overlay = false;
        if (this.showCharts) {
            this.fetchStats();
        }
    },
};
</script>
