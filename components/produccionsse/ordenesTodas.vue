<template>
    <div>
        <loading :show="loading.show" :text="loading.text" />
        <b-container fluid>
            <b-row>
                <b-col class="mb-4">
                    <h5 class="mb-2">Filtrar por estado de pago:</h5>
                    <b-form-radio-group id="btn-radios-2" v-model="selectedRadio" :options="optionsRadio"
                        button-variant="outline-primary" size="lg" name="radio-btn-outline" @input="applyFilters()"
                        buttons></b-form-radio-group>
                    
                    <h5 class="mt-4 mb-2">Filtrar por categoría de producto:</h5>
                    <b-form-radio-group id="btn-radios-categories" v-model="selectedCategory" :options="optionsCategories"
                        button-variant="outline-info" size="lg" name="radio-btn-categories" @input="applyFilters()"
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
                                <ordenes-abono 
                                    :idorden="data.item.orden" 
                                    :key="data.item.orden"
                                    :item="filterPago(data.item.orden)" 
                                    :sobrePago="data.item.payment_status === 'sobrepagada' ? data.item.monto_pendiente * -1 : 0"
                                    @reload="reloadMe()" />
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
                { text: "Sobrepagadas", value: "sobrepagada" },
                { text: "Canceladas", value: "cancelada" },
            ],
            selectedCategory: "todas",
            optionsCategories: [],
            perPage: 25,
            currentPage: 1,
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
            this.selectedCategory = "todas";
            this.applyFilters();
        },
        generateCategoryOptions() {
            if (!this.ordenes || this.ordenes.length === 0) {
                this.optionsCategories = [];
                return;
            }

            const uniqueCategories = new Map();
            this.ordenes.forEach(order => {
                if (order.product_categories && Array.isArray(order.product_categories)) {
                    order.product_categories.forEach(cat => {
                        if (cat.category_name) {
                            const trimmedCat = cat.category_name.trim();
                            const lowerCaseCat = trimmedCat.toLowerCase();
                            if (trimmedCat && !uniqueCategories.has(lowerCaseCat)) {
                                uniqueCategories.set(lowerCaseCat, trimmedCat); // Use original casing for display
                            }
                        }
                    });
                }
            });

            const categoryOptions = [...uniqueCategories.values()].map(originalCat => ({
                text: originalCat,
                value: originalCat,
            }));

            // Sort categories alphabetically for better UX
            categoryOptions.sort((a, b) => a.text.localeCompare(b.text));

            this.optionsCategories = [
                { text: "Todas", value: "todas" },
                ...categoryOptions,
            ];
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
            let filtered = [...this.ordenesConEstadoDePago];

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
                filtered = filtered.filter(el => el.payment_status === 'pagada');
            } else if (this.selectedRadio === "pendientes") {
                filtered = filtered.filter(el => el.payment_status === 'pendiente');
            } else if (this.selectedRadio === "sobrepagada") {
                filtered = filtered.filter(el => el.payment_status === 'sobrepagada');
            } else if (this.selectedRadio === "cancelada") {
                filtered = filtered.filter(el => el.estatus === 'cancelada');
            }

            // Filter by category
            if (this.selectedCategory !== "todas") {
                filtered = filtered.filter(order => 
                    order.product_categories && order.product_categories.some(cat => cat.category_name === this.selectedCategory)
                );
            }

            this.ordenesTabla = filtered;
        },

        async loadData() {
            this.loading.show = true;
            try {
                const [ordenesRes, pagosRes] = await Promise.all([
                    this.$axios.get(`${this.$config.API}/table/ordenes-todas`),
                    this.$axios.get(`${this.$config.API}/reporte-de-pagos`)
                ]);

                this.pagos = pagosRes.data.pagos;
                const vendedoresData = pagosRes.data.vendedores.map(el => ({
                    value: el._id,
                    text: el.nombre,
                }));
                this.vendedores = [{ value: 0, text: "Todos" }, ...vendedoresData];
                this.ordenes = ordenesRes.data.items;
                this.fields = ordenesRes.data.fields;
                
                // Añadir la columna 'Estatus'
                this.fields.push({ key: 'estatus', label: 'Estatus', sortable: true });

                this.generateCategoryOptions();
                this.applyFilters();

            } catch (error) {
                console.error("Error cargando los datos:", error);
            } finally {
                this.loading.show = false;
            }
        },

        filterPago(idOrden) {
            return this.pagos.filter((el) => el.orden == idOrden)
        },

        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },

        reloadMe() {
            this.loadData();
        },
    },

    computed: {
        ordenesConEstadoDePago() {
            if (!this.ordenes.length || !this.pagos.length) return [];
            
            return this.ordenes.map(orden => {
                const pagosDeOrden = this.pagos.filter(p => p.orden === orden.orden);
                const totalAbonado = pagosDeOrden.reduce((acc, pago) => acc + parseFloat(pago.monto), 0);
                const totalOrden = parseFloat(orden.total) || 0;
                const montoPendiente = totalOrden - totalAbonado;

                let payment_status = 'pendiente';
                if (montoPendiente === 0) {
                    payment_status = 'pagada';
                } else if (montoPendiente < 0) {
                    payment_status = 'sobrepagada';
                }

                return {
                    ...orden,
                    acc: orden.orden,
                    monto_pendiente: montoPendiente,
                    payment_status: payment_status
                };
            });
        },
        totalRows() {
            return this.ordenesTabla.length;
        },
    },

    mounted() {
        this.loadData()
    },

    mixins: [mixin],
}
</script>
