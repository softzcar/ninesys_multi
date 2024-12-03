<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <div id="progressbar">
                <div>
                    <b-progress :max="max" variant="success">
                        <b-progress-bar :value="value">
                            <span
                                >{{ paso }}: <strong>{{ value }}%</strong></span
                            >
                            <!-- <span
                >{{ paso }}: <strong>{{ value.toFixed(0) }}%</strong></span
              > -->
                        </b-progress-bar>
                    </b-progress>
                </div>
                <div>
                    <div class="floatme">
                        <b-form-select
                            v-model="selected"
                            :options="options"
                            size="sm"
                            class="mt-3"
                            style="width: 240px"
                            @change="setPaso"
                        ></b-form-select>
                    </div>

                    <div class="floatme" style="margin-top: 12px">
                        <!-- <produccion-asignar :reload="reload" :id="data.orden" /> -->
                        <div id="modalasignar">
                            <b-button
                                variant="primary"
                                @click="$bvModal.show(modal)"
                            >
                                <b-icon icon="person-plus"></b-icon>
                            </b-button>

                            <b-modal
                                :size="size"
                                :title="title"
                                :id="modal"
                                hide-footer
                            >
                                <b-overlay :show="overlay" spinner-small>
                                    <b-container>
                                        <b-row>
                                            <b-col>
                                                <h5>
                                                    Detalles de productos Lote
                                                    {{ data.orden }}
                                                </h5>
                                                <b-table
                                                    ref="table"
                                                    responsive
                                                    small
                                                    striped
                                                    hover
                                                    :items="itemsProducts"
                                                    :fields="fieldsProducts"
                                                >
                                                    <template #cell(_id)="data">
                                                        <produccionsse-guardar-cantidad
                                                            :cantidadLote="
                                                                data.item
                                                                    .cantidad_lote
                                                            "
                                                            :id="data.item._id"
                                                        />
                                                        <!-- <b-button @click="changeCantidad">OPEN ME</b-button> -->
                                                    </template>
                                                </b-table>
                                            </b-col>
                                        </b-row>
                                        <b-row>
                                            <b-col>
                                                <h5 class="mt-4">
                                                    Asignación de personal Lote
                                                    {{ data.orden }}
                                                </h5>
                                                <b-card no-body>
                                                    <b-tabs card>
                                                        <b-tab
                                                            :title="`Corte`"
                                                            active
                                                        >
                                                            <b-row>
                                                                <b-col
                                                                    v-for="(
                                                                        item,
                                                                        index
                                                                    ) in itemsProducts"
                                                                    :key="index"
                                                                >
                                                                    <ul>
                                                                        <li>
                                                                            <strong
                                                                                >{{
                                                                                    item.name
                                                                                }}</strong
                                                                            >
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Corte:</strong
                                                                            >
                                                                            {{
                                                                                item.corte
                                                                            }}
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Tela:</strong
                                                                            >
                                                                            {{
                                                                                item.tela
                                                                            }}
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Talla:</strong
                                                                            >
                                                                            {{
                                                                                item.talla
                                                                            }}
                                                                        </li>
                                                                    </ul>
                                                                    <hr />
                                                                    <produccion-asignar-empleado
                                                                        :item="
                                                                            item
                                                                        "
                                                                        :reload="
                                                                            reload
                                                                        "
                                                                        :options="
                                                                            optionsEmpleados
                                                                        "
                                                                        departamento="Corte"
                                                                    />
                                                                </b-col>
                                                            </b-row>
                                                        </b-tab>

                                                        <b-tab
                                                            :title="`Estampado`"
                                                        >
                                                            <b-row>
                                                                <b-col
                                                                    v-for="(
                                                                        item,
                                                                        index
                                                                    ) in itemsProducts"
                                                                    :key="index"
                                                                >
                                                                    <ul>
                                                                        <li>
                                                                            <strong
                                                                                >{{
                                                                                    item.name
                                                                                }}</strong
                                                                            >
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Corte:</strong
                                                                            >
                                                                            {{
                                                                                item.corte
                                                                            }}
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Tela:</strong
                                                                            >
                                                                            {{
                                                                                item.tela
                                                                            }}
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Talla:</strong
                                                                            >
                                                                            {{
                                                                                item.talla
                                                                            }}
                                                                        </li>
                                                                    </ul>
                                                                    <hr />
                                                                    <produccion-asignar-empleado
                                                                        :item="
                                                                            item
                                                                        "
                                                                        :reload="
                                                                            reload
                                                                        "
                                                                        :options="
                                                                            optionsEmpleados
                                                                        "
                                                                        departamento="Estampado"
                                                                    />
                                                                </b-col>
                                                            </b-row>
                                                        </b-tab>

                                                        <b-tab
                                                            :title="`Impresión`"
                                                        >
                                                            <b-row>
                                                                <b-col
                                                                    v-for="(
                                                                        item,
                                                                        index
                                                                    ) in itemsProducts"
                                                                    :key="index"
                                                                >
                                                                    <ul>
                                                                        <li>
                                                                            <strong
                                                                                >{{
                                                                                    item.name
                                                                                }}</strong
                                                                            >
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Corte:</strong
                                                                            >
                                                                            {{
                                                                                item.corte
                                                                            }}
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Tela:</strong
                                                                            >
                                                                            {{
                                                                                item.tela
                                                                            }}
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Talla:</strong
                                                                            >
                                                                            {{
                                                                                item.talla
                                                                            }}
                                                                        </li>
                                                                    </ul>
                                                                    <hr />
                                                                    <produccion-asignar-empleado
                                                                        :item="
                                                                            item
                                                                        "
                                                                        :reload="
                                                                            reload
                                                                        "
                                                                        :options="
                                                                            optionsEmpleados
                                                                        "
                                                                        departamento="Impresión"
                                                                    />
                                                                </b-col>
                                                            </b-row>
                                                        </b-tab>

                                                        <b-tab
                                                            :title="`Costura`"
                                                        >
                                                            <b-row>
                                                                <b-col
                                                                    v-for="(
                                                                        item,
                                                                        index
                                                                    ) in itemsProducts"
                                                                    :key="index"
                                                                >
                                                                    <ul>
                                                                        <li>
                                                                            <strong
                                                                                >{{
                                                                                    item.name
                                                                                }}</strong
                                                                            >
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Corte:</strong
                                                                            >
                                                                            {{
                                                                                item.corte
                                                                            }}
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Tela:</strong
                                                                            >
                                                                            {{
                                                                                item.tela
                                                                            }}
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Talla:</strong
                                                                            >
                                                                            {{
                                                                                item.talla
                                                                            }}
                                                                        </li>
                                                                    </ul>
                                                                    <hr />
                                                                    <produccion-asignar-empleado
                                                                        :item="
                                                                            item
                                                                        "
                                                                        :reload="
                                                                            reload
                                                                        "
                                                                        :options="
                                                                            optionsEmpleados
                                                                        "
                                                                        departamento="Costura"
                                                                    />
                                                                </b-col>
                                                            </b-row>
                                                        </b-tab>

                                                        <b-tab
                                                            :title="`Revisión`"
                                                        >
                                                            <b-row>
                                                                <b-col
                                                                    v-for="(
                                                                        item,
                                                                        index
                                                                    ) in itemsProducts"
                                                                    :key="index"
                                                                >
                                                                    <ul>
                                                                        <li>
                                                                            <strong
                                                                                >{{
                                                                                    item.name
                                                                                }}</strong
                                                                            >
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Corte:</strong
                                                                            >
                                                                            {{
                                                                                item.corte
                                                                            }}
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Tela:</strong
                                                                            >
                                                                            {{
                                                                                item.tela
                                                                            }}
                                                                        </li>
                                                                        <li>
                                                                            <strong
                                                                                >Talla:</strong
                                                                            >
                                                                            {{
                                                                                item.talla
                                                                            }}
                                                                        </li>
                                                                    </ul>
                                                                    <hr />
                                                                    <produccion-asignar-empleado
                                                                        :item="
                                                                            item
                                                                        "
                                                                        :reload="
                                                                            reload
                                                                        "
                                                                        :options="
                                                                            optionsEmpleados
                                                                        "
                                                                        departamento="Revisión"
                                                                    />
                                                                </b-col>
                                                            </b-row>
                                                        </b-tab>
                                                    </b-tabs>
                                                </b-card>
                                            </b-col>
                                        </b-row>
                                    </b-container>
                                </b-overlay>
                            </b-modal>
                        </div>
                    </div>
                </div>
            </div>
        </b-overlay>
        <!-- <pre style="width: 300px">
      {{ data }}
    </pre> -->
    </div>
</template>

<script>
import axios from "axios"

export default {
    data() {
        return {
            // Asignar
            size: "xl",
            imageWidth: "100%",
            imageHeight: "auto",
            title: "Asignar",
            loteInfo: [],
            optionsEmpleados: [],

            // Progressbar
            reload: false,
            overlay: true,
            value: this.$store.state.produccion.dataPorcentaje.porcentaje,
            max: 100,
            paso: this.$store.state.produccion.dataPorcentaje.paso,
            selected: this.$store.state.produccion.dataPorcentaje.paso,
            options: [
                { value: "sin_asignar", text: "Seleccione una opción" },
                { value: "corte", text: "Corte" },
                { value: "impresion", text: "Impresión" },
                { value: "estampado", text: "Estampado" },
                { value: "Costura", text: "Costura" },
                { value: "limpieza", text: "Limpieza" },
                { value: "revision", text: "Revisión" },
            ],
        }
    },

    computed: {
        itemsProducts() {
            return this.loteInfo.orden_productos
        },

        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },

        fieldsProducts() {
            return this.loteInfo.fields_orden_productos
            // return this.$store.state.produccion.loteDetalles.fields_orden_productos
        },
    },

    watch: {
        reload() {
            if (this.reload) {
                console.log(`Relaod me baby!`)
                this.reload = false
            }
        },
    },

    methods: {
        // ProgressBAr
        setPaso(val) {
            this.overlay = true
            const data = new URLSearchParams()
            data.set("paso", val)
            data.set("id_orden", this.data.orden)

            axios
                .post(`${this.$config.API}/produccion/update/paso`, data)
                .then((res) => {
                    if (res.data.nodata) {
                        this.$fire({
                            type: "info",
                            title: "Error en asignación",
                            html: `El paso '${this.selected}' no está asignado a ningún empeado`,
                        }).then(() => {
                            this.selected = "sin_asignar"
                        })
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
            switch (this.data.paso) {
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

                case "Estampado":
                    this.departamento = "Estampado"
                    break

                case "Impresión":
                    this.departamento = "Impresión"
                    break

                case "Confeción":
                    this.departamento = "Confeción"
                    break

                case "Limpieza":
                    this.departamento = "Limpieza"
                    break

                case "Revisión":
                    this.departamento = "Revisión"
                    break

                default:
                    this.departamento = this.data.paso
                    break
            }
        },

        async getPorcentaje() {
            this.overlay = true
            await this.$axios
                .get(
                    `${this.$config.API}/produccion/progressbar/${this.data.orden}`
                )
                .then((res) => {
                    this.value = res.data.porcentaje
                    this.paso = res.data.paso
                    this.selected = res.data.paso
                    this.pasoActual()
                    this.overlay = false
                })
                .catch((err) => {
                    console.error(
                        "Error al obtener los datos del servidor para prgressBar",
                        err
                    )
                    this.overlay = false
                })
        },

        // Asignacion
        token() {
            const length = 8
            var a =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
                    ""
                )
            var b = []
            for (var i = 0; i < length; i++) {
                var j = (Math.random() * (a.length - 1)).toFixed(0)
                b[i] = a[j]
            }
            return b.join("")
        },

        async getLotInfo() {
            await this.$axios
                .get(`${this.$config.API}/lotes/detalles/v2/${this.id}`)
                .then((res) => {
                    this.loteInfo = res.data
                })
        },
    },

    mounted() {
        this.$store
            .dispatch("produccion/getPorcentaje2", this.data.orden)
            .then(() => {
                // progressBar
                this.pasoActual()

                // asignacion
                axios
                    .get(`${this.$config.API}/empleados/produccion/asignacion`)
                    .then((res) => {
                        this.optionsEmpleados = res.data
                        this.getLotInfo().then(() => (this.overlay = false))
                    })

                // Comun
                this.overlay = false
            })
    },

    props: ["data"],
}
</script>

<style scoped>
.floatme {
    float: left;
    margin-right: 4px;
}
</style>
