<template>
    <div>
        <loading :show="loading.show" :text="loading.text" />
        <b-container fluid>
            <b-row>
                <b-col>
                    <h2>Ordenes en curso</h2>
                    <!-- <pre class="force"> {{ ordenesActivas }} </pre>
                    <pre class="force"> {{ dataTable }} </pre> -->
                </b-col>
            </b-row>
            <!-- EL BUSCADOR INTERCAMBIA LA COLUMNA DE ACCIONES ↓ -->
            <b-row>
                <b-col offset-lg="8" offset-xl="8">
                    <b-input-group class="mb-4" size="sm">
                        <b-form-input
                            id="filter-input"
                            v-model="filter"
                            type="search"
                            placeholder="Filtrar Resultados"
                        ></b-form-input>

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
                    <b-form class="mb-4" @submit="onSubmit">
                        <b-row>
                            <b-col>
                                <h3>Fecha Inicio</h3>
                                <b-form-datepicker
                                    class="mb-4"
                                    v-model="fechaConsultaInicio"
                                />
                            </b-col>
                            <b-col>
                                <h3>Fecha Fin</h3>
                                <b-form-datepicker
                                    class="mb-4"
                                    v-model="fechaConsultaFin"
                                />
                            </b-col>
                            <b-col>
                                <h3>Vendedor {{ selectedVendedor }}</h3>
                                <!-- <pre class="force">
                                    {{ vendedores }}
                                </pre> -->
                                <b-form-select
                                    v-model="selectedVendedor"
                                    :options="vendedores"
                                    @change="filterVendedor($event)"
                                />
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col class="text-center">
                                <b-button type="submit" variant="primary"
                                    >BUSCAR</b-button
                                >
                            </b-col>
                        </b-row>
                    </b-form>
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <b-pagination
                        v-model="currentPage"
                        :total-rows="totalRows"
                        :per-page="perPage"
                    ></b-pagination>

                    <p class="mt-3">Página actual: {{ currentPage }}</p>
                    <b-table
                        :per-page="perPage"
                        :current-page="currentPage"
                        ref="table"
                        responsive
                        small
                        striped
                        hover
                        :items="dataTable"
                        :fields="fields"
                        @filtered="onFiltered"
                        :filter="filter"
                        :filter-included-fields="includedFields"
                    >
                        <template #cell(orden)="data">
                            <!-- <linkSearch :key="data.index" :index="data.index" :id="data.item.orden" /> -->
                            <linkSearch :id="data.item.orden" />
                        </template>

                        <template #cell(fecha_inicio)="data">
                            {{ formatDate(data.item.fecha_inicio) }}
                        </template>

                        <template #cell(fecha_entrega)="data">
                            {{ formatDate(data.item.fecha_entrega) }}
                        </template>

                        <template #cell(id_father)="data">
                            <ordenes-vinculadas
                                :key="data.item.orden"
                                :id_orden="data.item.id_father"
                            />
                        </template>

                        <template #cell(acc)="data">
                            <!--<div
                                style="
                                    float: left;
                                    margin-right: 6px;
                                    margin-top: 6px;
                                "
                            >
                                 <span
                                    v-html="whatsAppMe(data.item.phone, true)"
                                ></span>
                            </div> -->
                            <div style="float: left; margin-right: 6px">
                                <diseno-view-image
                                    :index="data.index"
                                    class="floatme mb-2"
                                    :id="data.item.orden"
                                />
                            </div>
                            <div style="float: left; margin-right: 6px">
                                <ordenes-editar
                                    :index="data.index"
                                    :key="data.item.orden"
                                    :data="data.item"
                                />
                            </div>
                            <div style="float: left; margin-right: 6px">
                                <ordenes-abono
                                    :index="data.index"
                                    :key="data.item.orden"
                                    :idorden="data.item.orden"
                                    :item="filterPago(data.item.orden)"
                                />
                            </div>
                        </template>
                    </b-table>
                    <!-- <pre>
            {{ ordenesActivas }}
          </pre> -->
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import axios from "axios"
import { mapState, mapActions, mapGetters } from "vuex"
import mixin from "~/mixins/mixins.js"

export default {
    data() {
        return {
            dataTable: [],
            ordenesActivas: [],
            fechaConsultaInicio: "",
            fechaConsultaFin: "",
            selectedVendedor: 0,
            vendedores: [],
            pagos: [],
            includedFields: ["orden", "cliente_nombre"],
            perPage: 25,
            currentPage: 1,
            filter: null,
            loading: {
                show: true,
                text: "Cargando ordenes activas...",
            },
        }
    },

    methods: {
        ...mapActions("comerce", ["getOrdenesActivas"]),

        filterVendedor(event) {
            console.log("dataTAble", this.dataTable)
            console.log("event", event)
            this.dataTable = this.ordenesActivas.filter(
                (el) => el.id_vendedor == event
            )
        },

        onSubmit(event) {
            event.preventDefault()
            /*  const fechaInicio = this.fechaConsultaInicio
            const fechaFin = this.fechaConsultaFin
            console.log("inicio", fechaInicio)
            console.log("fin", fechaFin)

            if (!fechaInicio.length || !fechaFin.length) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>Por favor seleccione ambas fechas</p>`,
                    type: "warning",
                })
                return
            }

            if (new Date(fechaInicio) > new Date(fechaFin)) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
                    type: "warning",
                })
                return
            } */
            this.realizarConsulta()
        },

        realizarConsulta() {
            const inicio = new Date(this.fechaConsultaInicio)
            const fin = new Date(this.fechaConsultaFin)
            this.dataTable = this.ordenesActivas.filter((item) => {
                const fechaInicio = new Date(item.fecha_inicio)
                const fechaEntrega = new Date(item.fecha_entrega)
                return (
                    (fechaInicio >= inicio && fechaInicio <= fin) ||
                    (fechaEntrega >= inicio && fechaEntrega <= fin) ||
                    (fechaInicio <= inicio && fechaEntrega >= fin)
                )
            })
        },

        async getOrdenesActivas(id_empleado) {
            await this.$axios
                .get(`${this.$config.API}/table/ordenes-activas/${id_empleado}`)
                .then((res) => {
                    this.dataTable = res.data.items
                    this.fields = res.data.fields
                    this.ordenesActivas = res.data.items
                })
        },

        async getPagos() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/reporte-de-pagos`)
                .then((resp) => {
                    this.pagos = resp.data.pagos
                    this.vendedores = resp.data.vendedores.map((el) => {
                        return {
                            value: el._id,
                            text: el.nombre,
                        }
                    })
                    this.vendedores.unshift({ value: 0, text: "Todos" })
                    /* 
                    this.ordenesLength = this.pagos.length
                    console.log("Pagos y abonos cargados", this.pagos)
                    console.log("Totales", this.totales) */
                    this.overlay = false
                })
        },

        filterPago(idOrden) {
            return this.pagos.filter((el) => el.orden == idOrden)
        },

        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },

        reloadMe() {
            this.overlay = true
            this.getOrdenesActivas(this.dataUser.id_empleado).then(() => {
                this.getPagos().then(() => {
                    this.loading.show = false
                    this.overlay = false
                })
            })
        },
    },

    computed: {
        totalRows() {
            return parseInt(this.ordenesLength) + 1
        },

        misOrdenes() {
            return this.ordenesActivas
        },
        // ...mapState("comerce", ["ordenesLength", "hola"]),
        // ...mapGetters("comerce", ["dynOrdenesActivas"]),
        ...mapState("login", ["dataUser"]),
    },

    mounted() {
        this.reloadMe()
    },

    mixins: [mixin],
}
</script>
