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

                        <!-- Gráfico de Eficiencia - Oculto solo para Diseño -->
                        <b-col md="4" sm="12" class="mb-4"
                            v-if="currentDepartamentId !== 7">
                            <b-card title="Eficiencia de Tiempo">
                                <charts-EfficiencyChart :realTime="stats.eficiencia.tiempo_real"
                                    :estimatedTime="stats.eficiencia.tiempo_estimado" />
                            </b-card>
                        </b-col>

                        <!-- Gráfico de Pagos Semanales - Oculto para Producción e Impresión -->
                        <b-col md="4" sm="12" class="mb-4"
                            v-if="accessModule.accessData.id_modulo !== 5 && currentDepartamentId !== 1">
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
import mixinTime from "~/mixins/mixin-time.js";

export default {
    name: "DashboardEmpleado",
    mixins: [mixin, mixinTime],
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
                let idDepartamento = this.currentDepartamentId;

                if (!idDepartamento) {
                    console.warn("No currentDepartamentId found in store, defaulting to 4");
                    idDepartamento = 4;
                }

                const [statsResponse] = await Promise.all([
                    this.$axios.get(`${this.$config.API}/empleados/dashboard-stats/${idEmpleado}/${idDepartamento}`),
                    this.fetchEficienciaChart(idEmpleado, idDepartamento),
                ]);

                if (statsResponse.data) {
                    const data = statsResponse.data;
                    if (data.status) this.stats.status = data.status;
                    if (data.reposiciones) this.stats.reposiciones = data.reposiciones;

                    if (data.pagos_semana && Array.isArray(data.pagos_semana)) {
                        const diasEtiquetas = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                        const valores = [0, 0, 0, 0, 0, 0, 0];
                        data.pagos_semana.forEach(item => {
                            if (item.fecha) {
                                const partes = item.fecha.split('-');
                                const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
                                const chartIndex = (fecha.getDay() + 6) % 7;
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

        async fetchEficienciaChart(idEmpleado, idDepartamento) {
            try {
                const ordenProceso = this.$store.state.login.currentOrdenProceso || 1;

                // 1. Órdenes activas + reposiciones + terminadas hoy
                const [ordenesResp, terminadasResp] = await Promise.all([
                    this.$axios.get(`${this.$config.API}/empleados/ordenes-asignadas/v2/${idEmpleado}/${idDepartamento}/${ordenProceso}`),
                    this.$axios.get(`${this.$config.API}/empleados/terminadas-hoy/${idEmpleado}/${idDepartamento}`).catch(() => ({ data: [] })),
                ]);

                const { ordenes = [], reposiciones = [], vinculadas = [], pausas = [] } = ordenesResp.data;
                const finishedToday = Array.isArray(terminadasResp.data) ? terminadasResp.data : [];

                const activePool = [...ordenes, ...reposiciones, ...vinculadas];
                const activeIds = activePool.map(o => o.orden || o.id_orden).filter(Boolean);
                const uniqueIds = [...new Set([...activeIds, ...finishedToday])];

                if (uniqueIds.length === 0) return;

                // 2. Tiempos proyectados y detalles de tareas desde manufacturing-time
                const mfgResp = await this.$axios.post(`${this.$config.API}/reports/manufacturing-time`, {
                    id_ordenes: uniqueIds,
                    id_empleado: idEmpleado,
                    id_departamento: idDepartamento,
                });

                if (!mfgResp.data?.resumen) return;

                const resumen = mfgResp.data.resumen;
                const detalles = mfgResp.data.tareas_detalles || [];

                // 3. Tiempos reales con horario laboral (igual que SseOrdenesAsignadasV4)
                let horarioLaboral = this.$store.state.login.dataEmpresa.horario_laboral;
                if (typeof horarioLaboral === 'string') {
                    try { horarioLaboral = JSON.parse(horarioLaboral); } catch (e) { horarioLaboral = null; }
                }

                const pausasProcesadas = pausas.map(p => ({
                    fecha_inicio: new Date(p.pausa_inicio),
                    fecha_fin: p.pausa_fin ? new Date(p.pausa_fin) : new Date(),
                }));

                let totalRealTerminadas = 0;
                if (horarioLaboral && detalles.length > 0) {
                    detalles.forEach(task => {
                        if (!task.fecha_inicio || !task.fecha_terminado) return;
                        const tareaObj = {
                            fecha_inicio: new Date(task.fecha_inicio.replace(' ', 'T')),
                            fecha_fin: new Date(task.fecha_terminado.replace(' ', 'T')),
                        };
                        totalRealTerminadas += this.calcularTiempoTrabajoIndividual(tareaObj, pausasProcesadas, horarioLaboral) / 1000;
                    });
                }

                const totalProjectedTerminadas = resumen
                    .filter(item => item.tarea_terminada == 1)
                    .reduce((acc, item) => acc + (item.totalProjectedTerminadas || 0), 0);

                if (totalProjectedTerminadas > 0 || totalRealTerminadas > 0) {
                    this.stats.eficiencia = {
                        tiempo_estimado: totalProjectedTerminadas,
                        tiempo_real: totalRealTerminadas,
                    };
                }
            } catch (e) {
                console.error("Error fetching eficiencia chart:", e);
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
