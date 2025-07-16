<template>
    <div>
        <loading :show="loading.show" :text="loading.text" />
        <b-container fluid>
            <b-row>
                <b-col class="mb-4">
                    <b-form-radio-group id="btn-radios-2" v-model="selectedRadio" :options="optionsRadio"
                        button-variant="outline-primary" size="lg" name="radio-btn-outline" @input="applyFilters()"
                        buttons></b-form-radio-group>
                </b-col>
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
                    <b-form class="mb-4" @submit.prevent="onSubmit">
                        <b-row>
                            <b-col>
                                <h3>Fecha Inicio</h3>
                                <b-form-datepicker class="mb-4" v-model="fechaConsultaInicio" />
                            </b-col>
                            <b-col>
                                <h3>Fecha Fin</h3>
                                <b-form-datepicker class="mb-4" v-model="fechaConsultaFin" />
                            </b-col>
                            <b-col>
                                <h3>Vendedor</h3>
                                <b-form-select v-model="selectedVendedor" :options="vendedores"
                                    @change="applyFilters()" />
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col class="text-center">
                                <b-button type="submit" variant="primary" class="mr-2">BUSCAR</b-button>
                                <b-button
                                  type="button"
                                  variant="secondary"
                                  @click="resetFilters"
                                >Limpiar Filtros</b-button>
                            </b-col>
                        </b-row>
                    </b-form>
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage"></b-pagination>

                    <p class="mt-3">Página actual: {{ currentPage }}</p>

                    <b-table :items="ordenesTabla" :per-page="perPage" :current-page="currentPage"
                        @filtered="onFiltered" :fields="fields" :filter="filter"
                        :filter-included-fields="includedFields">
                        <template #cell(orden)="data">
                            <linkSearch :id="data.item.orden" key="data.item.orden" />
                        </template>
                        <template #cell(acc)="data">
                            <div style="float: left; margin-right: 6px">
                                <diseno-view-image class="floatme mb-2" :id="data.item.orden" />
                            </div>
                            <div style="float: left; margin-right: 6px">
                                <ordenes-editar :data="data.item" :key="data.item.orden" />
                            </div>
                            <div style="float: left; margin-right: 6px">
                                <ordenes-abono :idorden="data.item.orden" :key="data.item.orden"
                                    :item="filterPago(data.item.orden)" @reload="reloadMe()" />
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
            includedFields: ["orden", "cliente_nombre"],
            selectedRadio: "todas",
            optionsRadio: [
                { text: "Todas", value: "todas" },
                { text: "Pagadas", value: "pagadas" },
                { text: "Pendientes", value: "pendientes" },
            ],
            perPage: 25,
            currentPage: 1,
            ordenesLength: 0,
            ordenes: [],
            ordenesTabla: [],
            fields: null,
            filter: null,
            loading: {
                show: true,
                text: "Cargando ordenes...",
            },
            fechaConsultaInicio: "",
            fechaConsultaFin: "",
            selectedVendedor: 0,
            vendedores: [],
        }
    },

    methods: {
        resetFilters() {
            this.fechaConsultaInicio = "";
            this.fechaConsultaFin = "";
            this.selectedVendedor = 0;
            this.selectedRadio = "todas";
            this.applyFilters();
        },
        onSubmit(event) {
            event.preventDefault();
            const fechaInicio = this.fechaConsultaInicio;
            const fechaFin = this.fechaConsultaFin;

            if (!fechaInicio || !fechaFin) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>Por favor seleccione ambas fechas</p>`,
                    type: "warning",
                });
                return;
            }

            if (new Date(fechaInicio) > new Date(fechaFin)) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
                    type: "warning",
                });
                return;
            }
            this.applyFilters();
        },

        applyFilters() {
            let filtered = [...this.ordenes];

            // Filter by seller
            if (this.selectedVendedor != 0) {
                filtered = filtered.filter(el => el.id_vendedor == this.selectedVendedor);
            }

            // Filter by date range
            if (this.fechaConsultaInicio && this.fechaConsultaFin) {
                const inicio = new Date(this.fechaConsultaInicio);
                const fin = new Date(this.fechaConsultaFin);
                fin.setHours(23, 59, 59, 999); // Include the whole end day

                filtered = filtered.filter(item => {
                    const fechaInicio = new Date(item.fecha_inicio);
                    const fechaEntrega = new Date(item.fecha_entrega);
                    return (
                        (fechaInicio >= inicio && fechaInicio <= fin) ||
                        (fechaEntrega >= inicio && fechaEntrega <= fin) ||
                        (fechaInicio <= inicio && fechaEntrega >= fin)
                    );
                });
            }

            // Filter by payment status
            if (this.selectedRadio === "pagadas") {
                filtered = filtered.filter(el => parseFloat(el.monto_pendiente) === 0);
            } else if (this.selectedRadio === "pendientes") {
                filtered = filtered.filter(el => parseFloat(el.monto_pendiente) > 0);
            }

            this.ordenesTabla = filtered;
        },

        async getOrdenes() {
            await this.$axios
                .get(`${this.$config.API}/table/ordenes-todas`)
                .then((res) => {
                    this.ordenes = res.data.items.map((obj) => ({
                        ...obj,
                        acc: obj.orden,
                    }));
                    this.fields = res.data.fields;
                    this.applyFilters(); // Apply filters after loading orders
                });
        },

        async getPagos() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/reporte-de-pagos`)
                .then((resp) => {
                    this.pagos = resp.data.pagos;
                    this.vendedores = resp.data.vendedores.map((el) => {
                        return {
                            value: el._id,
                            text: el.nombre,
                        };
                    });
                    this.vendedores.unshift({ value: 0, text: "Todos" });
                    this.overlay = false
                })
        },

        filterPago(idOrden) {
            return this.pagos.filter((el) => el.orden == idOrden)
        },

        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },

        reloadMe() {
            this.loading.show = true;
            this.getOrdenes().then(() => {
                this.getPagos().then(() => {
                    this.loading.show = false
                })
            })
        },
    },

    computed: {
        totalRows() {
            return this.ordenesTabla.length;
        },
    },

    mounted() {
        this.reloadMe()
    },

    mixins: [mixin],
}
</script>
