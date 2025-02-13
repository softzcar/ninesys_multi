<template>
    <div>
        <b-alert v-if="status === 'terminado'" show variant="success">TERMINADA</b-alert>
        <b-overlay :show="overlay" spinner-small>
            <div>
                <div class="floatme">
                    <span class="capital"><strong> {{ this.item.paso }}</strong>
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
                    <produccionsse-asignar :asign="asignacion" :empleados="empleados" :id="item.orden"
                        :orden_productos="orden_productos" reloadtest="Reload test!!!" :lote_detalles="lote_detalles"
                        :lotes_fisicos="lotes_fisicos" @reload="reloadOrders" />
                </div>
                <div class="floatme margin-buttons-bar">
                    <produccionsse-reposicion :departamento="this.$store.state.login.dataUser.departamento
                        " @reload="reloadOrders" :empleados="empleados" :reposicion_ordenes_productos="reposicion_ordenes_productos
                            " :item="item" />
                </div>
            </div>
        </b-overlay>
    </div>
</template>

<script>
import axios from "axios"

export default {
    data() {
        return {
            departamento: "",
            status: this.item.status,
            responseData: null,
            // reload: false,
            overlay: true,
            paso: this.item.paso,
            value: 0,
            max: 100,
            selected: this.$store.state.produccion.dataPorcentaje.paso,
        }
    },

    computed: {
        // paso() {},

        miPorcentaje() {
            let porcentaje

            if (this.item.paso === "producción") {
                porcentaje = 0
            } else {
                let paso

                switch (this.item.paso) {
                    case "Impresión":
                        paso = 1
                        break

                    case "Estampado":
                        paso = 2
                        break

                    case "Corte":
                        paso = 3
                        break

                    case "Costura":
                        paso = 4
                        break

                    case "Limpieza":
                        paso = 5
                        break

                    case "Revisión":
                        paso = 6
                        break

                    default:
                        paso = 1
                        break
                }
                porcentaje = parseInt((paso * 100) / 6)
            }

            return porcentaje
        },
    },

    methods: {
        reloadOrders() {
            this.$emit("reload")
        },

        filterPaso(id_orden) {
            return id_orden
        },

        clickedSomething(val) {
            console.log(`clickedSomething`, val)
        },

        setPaso(val) {
            this.overlay = true
            const data = new URLSearchParams()
            data.set("paso", val)
            data.set("id_orden", this.item.orden)

            axios
                .post(`${this.$config.API}/produccion/update/paso`, data)
                .then((res) => {
                    if (res.data.nodata) {
                        if (this.selected != "sin_asignar") {
                            this.$fire({
                                type: "info",
                                title: "Error en asignación",
                                html: `El paso '${this.selected}' no está asignado a ningún empeado`,
                            }).then(() => {
                                this.selected = "sin_asignar"
                            })
                        } else {
                            this.value = 0
                        }
                    } else {
                        this.getPorcentaje()
                    }
                    this.overlay = false
                })
                .catch((err) => {
                    this.$fire({
                        type: "error",
                        title: "Error",
                        html: `No se pudo actualizar os datos: ${err}`,
                    })
                    this.overlay = false
                })
        },

        pasoActual() {
            switch (this.item.paso) {
                case "comercializacion":
                    this.paso = "Comercialización"
                    break

                case "jefe_diseno":
                    this.paso = "Jefe de Diseño"
                    break

                case "diseno":
                    this.paso = "Diseño"
                    break

                case "Corte":
                    this.paso = "Corte"
                    break

                case "Impresión":
                    this.departamento = "Impresión"
                    break

                case "Estampado":
                    this.departamento = "Estampado"
                    break

                case "Costura":
                    this.departamento = "Costura"
                    break

                case "Limpieza":
                    this.departamento = "Limpieza"
                    break

                case "Revisión":
                    this.departamento = "Revisión"
                    break

                default:
                    this.departamento = this.item.paso
                    break
            }
        },

        reloadData() {
            this.$emit("reload")
        },

        async getPorcentaje() {
            // this.overlay = true
            try {
                const response = await this.$axios
                    .get(`${this.$config.API}/`)
                    .then((res) => {
                        console.log("prueba de progressbar", res.data)
                    })
                console.log("Response:", response.data)
            } catch {
                this.$fire({
                    title: "Error",
                    html: `<p>Error en pruaba para prgressBar</p><p>${err}</p>`,
                    type: "warning",
                })
                console.error("Error en prueba para prgressBar", err)
            }
        },

        async getPorcentaje_OLD() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/`)
                .then((res) => {
                    console.log("prueba de progressbar", res.data)
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>Error en pruaba para prgressBar</p><p>${err}</p>`,
                        type: "warning",
                    })
                    console.error("Error en prueba para prgressBar", err)
                })
                .finally(() => {
                    this.overlay = false
                })
        },
        /* async getPorcentaje() {
            this.overlay = true
            await this.$axios
                .get(
                    `${this.$config.API}/produccion/progressbar/${this.item.orden}`
                )
                .then((res) => {
                    this.departamento = res.data.departamento
                    this.responseData = res.data
                    this.value = res.data.porcentaje
                    // this.paso = res.data.paso
                    this.selected = res.data.paso
                    // this.status = res.data.status
                    this.pasoActual()
                    this.overlay = false

                    if (
                        this.status != "activa" ||
                        this.status != "pausada" ||
                        this.status != "En espera"
                    ) {
                        this.$emit("reload")
                    }
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>Error al obtener los datos para prgressBar</p><p>${err}</p>`,
                        type: "warning",
                    })
                    console.error(
                        "Error al obtener los datos para prgressBar",
                        err
                    )
                })
                .finally(() => {
                    this.overlay = false
                })
        }, */
    },

    mounted() {
        this.overlay = false
        this.$store
            .dispatch("produccion/getPorcentaje2", this.item.orden)
            .then(() => {
                this.pasoActual()
                this.overlay = false
            })
        /*  this.getPorcentaje().then(() => {
       let x = this.$store.state.produccion.dataPorcentaje
     }) */
    },

    props: [
        "item",
        "depart",
        "asignacion",
        "empleados",
        "pasos",
        "orden_productos",
        "lote_detalles",
        "lotes_fisicos",
        "reposicion_ordenes_productos",
        "reload",
    ],
}
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
