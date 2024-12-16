<template>
    <div>
        <loading :show="loading.show" :text="loading.text" />
        <b-container fluid>
            <b-row>
                <b-col>
                    <h2>Resumen semanal</h2>
                    <!-- <pre>
            {{ dataUser.id_empleado }}
          </pre> -->
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <b-list-group class="mb-4 mt-2">
                        <b-list-group-item>
                            <strong>Abonado:</strong> $
                            {{ totalAbonado }}</b-list-group-item
                        >
                        <b-list-group-item>
                            <strong>Crédito:</strong> $
                            {{ totalCredito }}</b-list-group-item
                        >
                        <b-list-group-item>
                            <strong>Descuentos:</strong> $
                            {{ totalDescuentos }}</b-list-group-item
                        >
                        <b-list-group-item>
                            <strong>Total Semana:</strong> $
                            {{ totalSemana }}</b-list-group-item
                        >
                    </b-list-group>
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
                    <b-input-group class="mb-4" size="sm">
                        <b-form-datepicker
                            id="fecha-1"
                            v-model="fechaordenesGuardadas"
                            class="mb-2"
                            @click="loadWeekOrdenesGuardadas"
                        ></b-form-datepicker>
                    </b-input-group>
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
                        :items="ordenesSemana.items"
                        :fields="ordenesSemana.fields"
                        @filtered="onFiltered"
                        :filter="filter"
                        :filter-included-fields="includedFields"
                    >
                        <template #cell(orden)="data">
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
                            <!-- <div style="float: left; margin-right: 6px">
                <comercio-editarProductos @reload="loadOrders()" :item="data.item" />
              </div> -->
                            <div style="float: left; margin-right: 6px">
                                <diseno-view-image
                                    class="floatme mb-2"
                                    :id="data.item.orden"
                                />
                            </div>
                            <div style="float: left; margin-right: 6px">
                                <ordenes-editar
                                    :key="data.item.orden"
                                    :data="data.item"
                                />
                            </div>
                            <div style="float: left; margin-right: 6px">
                                <ordenes-abono
                                    :key="data.item.orden"
                                    :idorden="data.item.orden"
                                    :item="data.item"
                                />
                            </div>
                        </template>
                    </b-table>
                    <!-- <pre>
            {{ ordenesSemana.items }}
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
            includedFields: ["id_orden", "cliente"],
            fechaordenesGuardadas: "",
            perPage: 25,
            currentPage: 1,
            filter: null,
            totalAbonado: 0,
            totalCredito: 0,
            totalDescuentos: 0,
            totalPendiente: 0,
            loading: {
                show: true,
                text: "Cargando ordenes activas...",
            },
        }
    },

    watch: {
        fechaordenesGuardadas(val) {
            this.getOrdenesSemana(this.objGetData)
        },

        totalAbonado() {
            if (isNaN(this.totalAbonado)) {
                this.totalAbonado = 0
            }

            if (isNaN(this.totalCredito)) {
                this.totalCredito = 0
            }
            if (isNaN(this.totalDescuentos)) {
                this.totalDescuentos = 0
            }
        },
    },

    methods: {
        loadWeekOrdenesGuardadas(val) {
            // alert(val)
        },
        ...mapActions("comerce", ["getOrdenesSemana"]),
        loadOrders() {
            this.overlay = true
            this.getOrdenesSemana(
                this.dataUser.id_empleado,
                this.fechaordenesGuardadas
            ).then(() => (this.loading.show = false))
        },

        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
    },

    computed: {
        objGetData() {
            return {
                id_empleado: this.dataUser.id_empleado,
                fecha: this.fechaordenesGuardadas,
            }
        },

        totalSemana() {
            const total =
                parseFloat(this.totalAbonado) + parseFloat(this.totalCredito)
            return total.toFixed(2)
        },

        totalRows() {
            return this.ordenesLength
        },

        misOrdenes() {
            return this.ordenesSemana
        },
        ...mapState("comerce", ["ordenesSemana", "ordenesLength", "hola"]),
        ...mapState("login", ["dataUser"]),
    },

    beforeMount() {
        this.fechaordenesGuardadas = new Date().toLocaleDateString("sv-SE")
    },

    mounted() {
        this.getOrdenesSemana(this.objGetData)
            .then(() => (this.loading.show = false))
            .then(() => {
                this.totalAbonado = parseFloat(
                    this.ordenesSemana.total_week[0].total_semana
                ).toFixed(2)
                this.totalCredito = parseFloat(
                    this.ordenesSemana.total_credito[0].total_credito
                ).toFixed(2)
                this.totalDescuentos = parseFloat(
                    this.ordenesSemana.total_descuentos[0].total_descuentos
                ).toFixed(2)
            })
        // this.loadOrders()
    },

    mixins: [mixin],
}
</script>
