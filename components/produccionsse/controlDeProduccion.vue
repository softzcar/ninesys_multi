<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <b-row>
                <b-col offset-lg="8" offset-xl="8">
                    <b-input-group class="mb-4" size="sm">
                        <b-form-input id="filter-input" v-model="filter" type="search"
                            placeholder="Filtrar Resultados"></b-form-input>

                        <b-input-group-append>
                            <b-button :disabled="!filter" @click="filter = ''">
                                Limpiar
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <h3>Reposiciones pendientes</h3>
                    <b-table responsive :items="reposiciones_solicitadas" :fields="fields_reposiciones"
                        :filter-included-fields="includedFields" @reload="loadOrdersProduction" headless>
                        <template #cell(id_orden)="data">
                            <!-- <link-search :id="data.item.orden" /> -->
                            <div style="margin-top: 15px">
                                <produccionsse-reposicionesPendientes :empleados="empleados" :item="data.item"
                                    :key="data.index" />
                            </div>
                        </template>
                    </b-table>
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage"></b-pagination>

                    <p class="mt-3">Página actual: {{ currentPage }}</p>
                    <b-table responsive :per-page="perPage" :current-page="currentPage" :fields="fields" :items="items"
                        :key-field="'orden'" @filtered="onFiltered" :filter="filter">
                        <template #cell(orden)="data">
                            <!-- <link-search :id="data.item.orden" /> -->
                            <div style="margin-top: 15px">
                                <link-search :id="data.value" :key="data.item._id" />
                            </div>
                        </template>

                        <template #cell(inicio)="data">
                            <!-- {{ formatDate(data.item.inicio) }} -->
                            <div style="margin-top: 32px">
                                {{ formatDate(data.item.inicio) }}
                            </div>
                        </template>

                        <template #cell(estatus_revision)="data">
                            <!-- {{ formatDate(data.item.inicio) }} -->
                            <p v-if="data.item.estatus_revision === 'Aprobado'" class="h1 mt-2">
                                <b-button variant="outline-light">
                                    <b-icon icon="exclamation-circle-fill" variant="success" @click="
                                        showDesigner(data.item.disenador)
                                        " :key="data.item._id"></b-icon>
                                </b-button>
                            </p>

                            <p v-else class="h1 mt-2">
                                <b-button variant="outline-light" @click="showDesigner(data.item.disenador)"
                                    :key="data.item._id">
                                    <b-icon icon="exclamation-circle-fill" style="color: lightgray"></b-icon>
                                </b-button>
                            </p>
                        </template>

                        <template #cell(cliente)="data">
                            <div style="margin-top: 32px">
                                {{ data.item.cliente }}
                            </div>
                        </template>

                        <template #cell(unidades)="data">
                            <div style="margin-top: 32px; text-align: center;">
                                {{ data.item.unidades }}
                            </div>
                        </template>

                        <template #cell(entrega)="data">
                            <div style="margin-top: 32px">
                                {{ formatDate(data.item.entrega) }}
                            </div>
                        </template>

                        <template #cell(estatus)="data">
                            <div style="margin-top: 32px">
                                <span class="capital">{{
                                    data.item.estatus
                                    }}</span>
                            </div>
                        </template>

                        <template #cell(paso)="data">
                            <span class="floatme">
                                <produccionsse-progress-bar :pasos="pasos" :asignacion="asignacion"
                                    :empleados="empleados" :por_asignar="por_asignar" :depart="pActivo(data.item.orden)"
                                    :item="data.item" :orden_productos="filterOrdenProductos(data.item.orden)
                                        " :reposicion_ordenes_productos="reposicion_ordenes_productos
                                            " :lote_detalles="filterLoteDetalles(data.item.orden)
                                                " :lotes_fisicos="lotes_fisicos" :key="data.item._id"
                                    @reload="loadOrdersProduction" />
                            </span>
                        </template>

                        <template #cell(detalles)="data">
                            <div style="margin-top: 32px">
                                <produccion-control-de-produccion-detalles-editor :idorden="data.item.orden"
                                    :item="data.item" :detalles="data.item.detalles" :detalle_empleado="data.item.detalle_empleado
                                        " :key="data.item._id" :productos="productsFilter(data.item.orden)" />
                            </div>
                        </template>

                        <template #cell(vinculada)="data">
                            <span class="floatme">
                                <ordenes-vinculadas :vinculadas="filterVinculadas(data.item.acciones)
                                    " :key="data.item._id" />
                            </span>
                        </template>

                        <template #cell(acciones)="data">
                            <div style="margin-top: 15px">
                                <span class="floatme">
                                    <ordenes-editar :data="data.item" :key="data.item._id" />
                                </span>
                                <span class="floatme">
                                    <!-- <diseno-view-image :id="data.item.acciones" /> -->
                                </span>

                                <span class="floatme">
                                    <!-- <produccion-terminar :id="data.item.acciones" /> -->
                                </span>
                            </div>
                        </template>
                    </b-table>

                    <p class="mt-3">Página actual: {{ currentPage }}</p>
                </b-col>
            </b-row>
        </b-overlay>
    </div>
</template>

<script>
import axios from "axios"
import mixin from "~/mixins/mixins.js"

export default {
    data() {
        return {
            includedFields: ["orden", "cliente"],
            perPage: 25,
            currentPage: 1,
            ordenesLength: 0,
            filter: null,
            overlay: true,
            items: [],
            pactivos: [],
            vinculadas: [],
            por_asignar: [],
            products: [],
            asignacion: [],
            orden_productos: [],
            reposicion_ordenes_productos: [],
            lote_detalles: [],
            lotes_fisicos: [],
            reposiciones_solicitadas: [],
            empleados: [],
            pasos: [],
            reloadMe: false,
            events: [],
            fields_reposiciones: [
                {
                    key: "id_orden",
                    label: " ",
                },
            ],
            fields: [
                {
                    key: "orden",
                    label: "Orden",
                },
                {
                    key: "estatus_revision",
                    label: "Diseño",
                    thClass: "text-center",
                    tdClass: "text-center",
                },
                {
                    key: "cliente",
                    label: "Cliente",
                },
                {
                    key: "unidades",
                    label: "Unidades",
                    thClass: "text-center"
                },
                {
                    key: "paso",
                    label: "Progreso",
                },
                {
                    key: "inicio",
                    label: "Inicio",
                },
                {
                    key: "entrega",
                    label: "Entrega",
                },
                {
                    key: "vinculada",
                    label: "Vinculada",
                },
                {
                    key: "estatus",
                    label: "Estatus",
                },
                {
                    key: "detalles",
                    label: "Detalles",
                },
                {
                    key: "acciones",
                    label: "Acciones",
                },
            ],
        }
    },

    methods: {
        productsFilter(id) {
            return this.products.filter((el) => el.id_orden == id)
        },

        showDesigner(designer) {
            this.$fire({
                title: designer,
                html: ``,
                type: "info",
            })
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },

        pActivo(id_orden) {
            return this.pactivos
                .filter((el) => el.id_orden == id_orden)
                .map((el) => {
                    return el.departamento
                })
            // return id_orden
        },

        filterVinculadas(id_orden) {
            return this.vinculadas
                .filter((el) => el.id_father == id_orden)
                .map((el) => {
                    return {
                        id_child: el.id_child,
                    }
                })
        },
        filterOrdenProductos(id_orden) {
            return this.orden_productos
                .filter((el) => el.id_orden == id_orden)
                .map((el) => {
                    return el
                })
        },

        filterLoteDetalles(id_orden) {
            return this.lote_detalles
                .filter((el) => el.id_orden == id_orden)
                .map((el) => {
                    return el
                })
        },

        async loadOrdersProduction() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/sse/produccion`)
                .then((res) => {
                    console.log(`Respuesta de /sse/produccion`, res.data)
                    this.items = res.data.items
                    this.ordenesLength = parseInt(res.data.items.length) + 1
                    this.pactivos = res.data.pactivos
                    this.por_asignar = res.data.por_asignar
                    this.vinculadas = res.data.vinculadas
                    this.products = res.data.productos
                    this.reposiciones_solicitadas =
                        res.data.reposiciones_solicitadas
                    this.asignacion = res.data.asignacion
                    this.empleados = res.data.empleados
                    this.orden_productos = res.data.orden_productos
                    this.reposicion_ordenes_productos =
                        res.data.reposicion_ordenes_productos
                    this.lote_detalles = res.data.lote_detalles
                    this.lotes_fisicos = res.data.lotes_fisicos
                    this.pasos = res.data.pasos
                    // console.log(`ITEMS`, this.items)
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>Error obteniendo los datos de producción</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        /* loadOrdersProduction_SSE() {
            this.source = new EventSource(`${this.$config.API}/sse/produccion`)

            this.source.addEventListener("message", (event) => {
                const eventData = JSON.parse(event.data)
                const eventType = event.type

                if (eventType === "keep") {
                    // this.events.push(eventData)
                    console.log("keep", eventData)
                } else {
                    if (eventType === "chat") {
                        this.events.push(eventData)
                    }

                    if (eventType === "message") {
                        this.items = eventData.items
                        console.log(
                            "todos los items de Control de produccion",
                            this.items
                        )
                        this.ordenesLength =
                            parseInt(eventData.items.length) + 1

                        this.events = eventData
                        this.pactivos = eventData.pactivos
                        this.vinculadas = eventData.vinculadas
                        this.products = eventData.productos
                        this.reposiciones_solicitadas =
                            eventData.reposiciones_solicitadas
                        this.asignacion = eventData.asignacion
                        this.empleados = eventData.empleados
                        this.orden_productos = eventData.orden_productos
                        this.reposicion_ordenes_productos =
                            eventData.reposicion_ordenes_productos
                        this.lote_detalles = eventData.lote_detalles
                        this.lotes_fisicos = eventData.lotes_fisicos
                        this.pasos = eventData.pasos
                        this.overlay = false
                    }
                }
            })

            this.source.addEventListener("error", (error) => {
                console.error("Error in SSE connection:", error)
                // alert(error)
                this.source.close() // Cerrar la conexión actual
            })
        }, */

        connectToServer() {
            this.loadOrdersProduction()
        },

        async getPorcentaje() {
            this.overlay = true
            await this.$axios
                .get(
                    `${this.$config.API}/produccion/progressbar/${this.items.orden}`
                )
                .then((res) => {
                    console.log("items de /sse/produccion", res.data)

                    this.departamento = res.data.departamento
                    this.responseData = res.data
                    this.value = res.data.porcentaje
                    // this.paso = res.data.paso
                    this.selected = res.data.paso
                    // this.status = res.data.status
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
                    /* this.$fire({
                        title: "Error",
                        html: `<p>Error al obtener los datos para prgressBar</p><p>${err}</p>`,
                        type: "warning",
                    }) */
                    console.error(
                        "Error al obtener los datos para prgressBar",
                        err
                    )
                })
                .finally(() => {
                    this.overlay = false
                })
        },
    },

    computed: {
        totalRows() {
            return parseInt(this.ordenesLength) + 1
        },
        /* itemsNoDesign() {
      const filtered = this.items.filter(el => )
    }, */
    },

    mounted() {
        this.loadOrdersProduction().then(() => {
            // this.getPorcentaje()
        })
    },

    mixins: [mixin],
}
</script>

<style scoped>
.float-me {
    float: left;
    margin-right: 4px;
    margin-top: 4px;
}
</style>
