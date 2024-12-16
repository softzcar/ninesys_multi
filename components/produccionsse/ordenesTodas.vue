<template>
    <div>
        <loading :show="loading.show" :text="loading.text" />
        <b-container fluid>
            <b-row>
                <b-col class="mb-4">
                    <b-form-radio-group
                        id="btn-radios-2"
                        v-model="selectedRadio"
                        :options="optionsRadio"
                        button-variant="outline-primary"
                        size="lg"
                        name="radio-btn-outline"
                        @input="showResultRadio()"
                        buttons
                    ></b-form-radio-group>
                </b-col>
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
                    <b-pagination
                        v-model="currentPage"
                        :total-rows="totalRows"
                        :per-page="perPage"
                    ></b-pagination>

                    <p class="mt-3">Página actual: {{ currentPage }}</p>
                    <!-- <b-pagination-nav :link-gen="linkGen" :number-of-pages="10" use-router></b-pagination-nav> -->

                    <b-table
                        :items="ordenesTabla"
                        :per-page="perPage"
                        :current-page="currentPage"
                        @filtered="onFiltered"
                        :fields="fields"
                        :filter="filter"
                        :filter-included-fields="includedFields"
                    >
                        <template #cell(orden)="data">
                            <linkSearch
                                :id="data.item.orden"
                                key="data.item.orden"
                            />
                        </template>
                        <template #cell(acc)="data">
                            <!-- <div
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
                                    class="floatme mb-2"
                                    :id="data.item.orden"
                                />
                            </div>
                            <div style="float: left; margin-right: 6px">
                                <ordenes-editar
                                    :data="data.item"
                                    :key="data.item.orden"
                                />
                            </div>
                            <div style="float: left; margin-right: 6px">
                                <ordenes-abono
                                    :idorden="data.item.orden"
                                    :key="data.item.orden"
                                    :item="filterPago(data.item.orden)"
                                    @reload="reloadMe()"
                                />
                            </div>
                        </template>
                    </b-table>
                    <p class="mt-3">Página actual: {{ currentPage }}</p>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import axios from "axios"
import mixin from "~/mixins/mixins.js"

export default {
    data() {
        return {
            pagos: [],
            includedFields: ["orden", "cliente"],
            selectedRadio: "todas",
            optionsRadio: [
                { text: "Todas", value: "todas" },
                { text: "Pagadas", value: "pagadas" },
                { text: "Pendientes", value: "pendientes" },
            ],
            perPage: 25,
            currentPage: 1,
            ordenesLength: 0,
            ordenes: null,
            ordenesTabla: null,
            ordenesFiltradas: null,
            fields: null,
            filter: null,
            loading: {
                show: true,
                text: "Cargando ordenes...",
            },

            fields: [
                {
                    key: "name",
                    label: "Person full name",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "age",
                    label: "Person age",
                    sortable: true,
                    class: "text-center",
                },
                {
                    key: "isActive",
                    label: "Is Active",
                    formatter: (value, key, item) => {
                        return value ? "Yes" : "No"
                    },
                    sortable: true,
                    sortByFormatted: true,
                    filterByFormatted: true,
                },
                { key: "actions", label: "Actions" },
            ],
        }
    },

    methods: {
        showResultRadio() {
            if (this.selectedRadio === "todas") {
                this.ordenesTabla = this.ordenes
            } else if (this.selectedRadio === "pagadas") {
                this.ordenesTabla = this.ordenes.filter(
                    (el) => parseFloat(el.monto_pendiente) === 0
                )
            } else if (this.selectedRadio === "pendientes") {
                this.ordenesTabla = this.ordenes.filter(
                    (el) => parseFloat(el.monto_pendiente) > 0
                )
            } else {
                this.ordenesTabla = this.ordenes
            }
        },
        async getOrdenes() {
            await this.$axios
                .get(`${this.$config.API}/table/ordenes-todas`)
                .then((res) => {
                    this.ordenes = res.data.items.map((obj) => ({
                        ...obj,
                        acc: obj.orden,
                    }))
                    this.ordenesLength = this.ordenes.length
                    this.ordenesTabla = this.ordenes

                    this.fields = res.data.fields
                })
        },
        async getPagos() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/reporte-de-pagos`)
                .then((resp) => {
                    this.pagos = resp.data.pagos
                    /* this.vendedores = resp.data.vendedores
                    this.vendedores.unshift({ value: 0, text: "Todos" })

                    this.ordenesLength = this.pagos.length
                    console.log("Pagos y abonos cargados", this.pagos)
                    console.log("Totales", this.totales) */
                    this.overlay = false
                })
        },

        filterPago(idOrden) {
            return this.pagos.filter((el) => el.orden == idOrden)
        },

        loadOrders() {
            this.overlay = true
            this.getOrdenes().then(() => (this.loading.show = false))
        },

        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        reloadMe() {
            this.getOrdenes().then(() => {
                this.getPagos().then(() => {
                    this.loading.show = false
                })
            })
        },
    },

    computed: {
        totalRows() {
            return parseInt(this.ordenesLength) + 1
        },

        misOrdenes() {
            return this.ordenes
        },
    },

    mounted() {
        this.reloadMe()
    },

    mixins: [mixin],
}
</script>
