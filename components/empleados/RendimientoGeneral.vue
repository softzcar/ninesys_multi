<template>
    <div>
        <b-alert class="text-center" show :variant="variant">
            <h2 class="alert-heading" style="margin: 2rem">
                {{ text }}
            </h2>
            <!-- <pre class="force">
                {{ tiempoTrabajoMs }}
            </pre> -->
        </b-alert>
    </div>
</template>

<script>
import { log } from "console";
import mixintime from "~/mixins/mixin-time.js";
export default {
    mixins: [mixintime],

    data() {
        return {
            variant: "light",
            text: "Calculando eficiencia...",
            horario: null,
            tiempoTrabajoMs: [],
        };
    },

    watch: {
        ordenes(val) {
            if (val.length > 0) {
                this.totalEficiencia();
            }
        },
    },

    methods: {
        liveEficiencia() {
            this.tiempoTrabajoMs = this.calcularTiempoTrabajoOrdenes(
                this.ordenes,
                this.pausas,
                this.horario
            );
            this.totalEficiencia();
        },

        totalEficiencia() {
            if (this.ordenes.length === 0) {
                this.text = `???`;
                this.variant = "light";
            } else {
                if (this.tiempoTrabajoMs.porcentajeEficienciaGlobal < 50) {
                    this.variant = "danger";
                } else if (
                    this.tiempoTrabajoMs.porcentajeEficienciaGlobal < 51 &&
                    this.tiempoTrabajoMs.porcentajeEficienciaGlobal < 80
                ) {
                    this.variant = "warning";
                } else {
                    this.variant = "success";
                }

                let porcentaje =
                    this.tiempoTrabajoMs.porcentajeEficienciaGlobal;

                if (porcentaje === null) {
                    porcentaje = 0;
                }

                this.text = `Tienes un ${porcentaje}% de Eficiencia`;
                console.log("texto eficiencia", this.text);
            }
        },
    },

    mounted() {
        this.horario = this.$store.state.login.dataEmpresa.horario_laboral;
        this.tiempoTrabajoMs = this.calcularTiempoTrabajoOrdenes(
            this.ordenes,
            this.pausas,
            this.horario
        );

        this.totalEficiencia();

        const intervaloId = setInterval(this.liveEficiencia, 5000);
        setTimeout(() => {
            clearInterval(intervaloId);
            console.log("Temporizador detenido después de 30 segundos.");
        }, 30000000);
    },

    props: ["ordenes", "pausas"],
};
</script>
