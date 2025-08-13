<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div v-if="
                dataUser.departamento === 'Administración' ||
                dataUser.departamento === 'Producción'
            ">
                <b-overlay :show="overlay" spinner-small>
                    <b-container fluid v-if="
                        dataUser.departamento === 'Administración' ||
                        dataUser.departamento === 'Producción'
                    ">
                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <inventario-InsumoNuevo @reload="getInsumos" :catalogoProductosData="catalogoInsumosProductos" />
                                <inventario-BulkLoad @upload-success="getInsumos" />
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col class="mb-4">
                                <b-form-radio-group id="btn-radios-2" v-model="selectedRadio" :options="optionsRadio"
                                    button-variant="outline-primary" size="lg" name="radio-btn-outline"
                                    @input="showResultRadio()" buttons></b-form-radio-group>
                            </b-col>
                            <b-col offset-lg="6" offset-xl="6">
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
                                <b-pagination v-model="currentPage" :total-rows="totalRows"
                                    :per-page="perPage"></b-pagination>

                                <p>selectedRadio: {{ selectedRadio }}</p>
                                <p class="mt-3">
                                    Página actual: {{ currentPage }}
                                </p>

                                <b-table ref="table" responsive small striped hover :items="dataTableDyn"
                                    :fields="fields" :per-page="perPage" :current-page="currentPage"
                                    @filtered="onFiltered" :filter="filter" :filter-included-fields="includedFields"
                                    sort-icon-left>
                                    <template #cell(_id)="data">
                                        <span class="floatme">
                                            <inventario-InsumoEditar @reload="getInsumos" :data="data.item" :catalogoProductosData="catalogoInsumosProductos" />
                                        </span>
                                        <span class="floatme">
                                            <b-button variant="danger" v-on:click="
                                                deleteInsumo(data.item._id)
                                                "><b-icon icon="trash"></b-icon>
                                            </b-button>
                                        </span>
                                    </template>
                                </b-table>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-overlay>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
import axios from "axios"

export default {
    data() {
        return {
            includedFields: ["insumo", "departamento", "sku"],
            titulo: "Gestión de Inventario",
            overlay: true,
            filter: null,
            dataTableDyn: [],
            dataTable: [],
            sortBy: "departamento",
            sortDesc: false,
            perPage: 25,
            currentPage: 1,
            totalRows: 0, // Initialized totalRows
            selectedRadio: "todas",
            optionsRadio: [],
            optionsRadio1: [
                { text: "Todas", value: "todas" },
                { text: "Pagadas", value: "pagadas" },
                { text: "Pendientes", value: "pendientes" },
            ],
            fields: [
                {
                    key: "rollo",
                    label: "ID Insumo",
                    sortable: false,
                },
                {
                    key: "sku",
                    label: "SKU",
                    sortable: false,
                },
                {
                    key: "insumo",
                    label: "Nombre",
                    sortable: false,
                },
                {
                    key: "departamento",
                    label: "Departamento",
                    sortable: true,
                },
                {
                    key: "rendimiento",
                    label: "Rendimiento",
                    sortable: false,
                },
                {
                    key: "metros",
                    label: "Metros",
                    sortable: false,
                },
                {
                    key: "unidad",
                    label: "Unidad",
                    sortable: false,
                },
                {
                    key: "cantidad",
                    label: "Cantidad",
                    sortable: false,
                },
                {
                    key: "costo",
                    label: "Costo",
                    sortable: false,
                },
                {
                    label: "",
                    key: "_id",
                    sortable: false,
                },
            ],
            catalogoInsumosProductos: [], // New data property
        }
    },

    computed: {
        ...mapState("login", ["dataUser", "access"]),
        myTable() {
            return this.dataTable.items
        },
    },

    methods: {
        deleteInsumo(id_emp) {
            this.$confirm(
                `¿Desea Elimiar el insumo ${id_emp} ?`,
                "Eliminar Imsumo",
                "warning"
            )
                .then(() => {
                    this.overlay = true
                    const data = new URLSearchParams()
                    data.set("id", id_emp)

                    this.$axios
                        .post(`${this.$config.API}/insumos/eliminar`, data)
                        .then((res) => {
                            this.getInsumos().then(() => (this.overlay = false))
                        })
                })
                .catch((err) => {
                    console.log("CATCH!!!", err)
                    return false
                })
        },

        async fetchCatalogoInsumosProductos() {
            try {
                const response = await this.$axios.get(`${this.$config.API}/catalogo-insumos-productos`);
                this.catalogoInsumosProductos = response.data;
            } catch (error) {
                console.error("Error al obtener el catálogo de productos:", error);
            }
        },

        reloadData() {
            this.overlay = true
            alert("probando recusrsividad ")
            this.overlay = false
        },

        async getInsumos() {
            await this.$axios
                .get(`${this.$config.API}/inventario/todos`)
                .then((resp) => {
                    this.dataTable = []
                    this.dataTable = resp.data
                    this.dataTableDyn = resp.data.items

                    const departamentosUnicos = new Set(
                        resp.data.items.map((item) => item.departamento)
                    )
                    this.optionsRadio = Array.from(departamentosUnicos).map(
                        (departamento) => ({
                            text: departamento,
                            value: departamento,
                        })
                    )
                    this.optionsRadio.unshift({ text: "Todos", value: "Todos" })
                    this.overlay = false
                })
        },

        showResultRadio() {
            if (
                this.selectedRadio === "Todos" ||
                this.selectedRadio === "Telas"
            ) {
                this.fields = [
                    {
                        key: "rollo",
                        label: "ID Insumo",
                        sortable: false,
                    },
                    {
                        key: "sku",
                        label: "SKU",
                        sortable: false,
                    },
                    {
                        key: "insumo",
                        label: "Nombre",
                        sortable: false,
                    },
                    {
                        key: "departamento",
                        label: "Departamento",
                        sortable: true,
                    },
                    {
                        key: "rendimiento",
                        label: "Rendimiento",
                        sortable: false,
                    },
                    {
                        key: "metros",
                        label: "Metros",
                        sortable: false,
                    },
                    {
                        key: "unidad",
                        label: "Unidad",
                        sortable: false,
                    },
                    {
                        key: "cantidad",
                        label: "Cantidad",
                        sortable: false,
                    },
                    {
                        key: "costo",
                        label: "Costo",
                        sortable: false,
                    },
                    {
                        label: "",
                        key: "_id",
                        sortable: false,
                    },
                ]
            } else {
                this.fields = [
                    {
                        key: "rollo",
                        label: "ID Insumo",
                        sortable: false,
                    },
                    {
                        key: "sku",
                        label: "SKU",
                        sortable: false,
                    },
                    {
                        key: "insumo",
                        label: "Nombre",
                        sortable: false,
                    },
                    {
                        key: "departamento",
                        label: "Departamento",
                        sortable: true,
                    },
                    {
                        key: "unidad",
                        label: "Unidad",
                        sortable: false,
                    },
                    {
                        key: "cantidad",
                        label: "Cantidad",
                        sortable: false,
                    },
                    {
                        key: "costo",
                        label: "Costo",
                        sortable: false,
                    },
                    {
                        label: "",
                        key: "_id",
                        sortable: false,
                    },
                ]
            }

            if (this.selectedRadio === "Todos") {
                this.dataTableDyn = this.dataTable.items
            } else {
                this.dataTableDyn = this.dataTable.items.filter(
                    (el) => el.departamento === this.selectedRadio
                )
                console.log(
                    `Acciones al aplicar el filtro a los insumos filtrer
            ${this.selectedRadio}`,
                    this.dataTableDyn
                )
            }
        },

        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
    },

    mounted() {
        this.getInsumos().then(() => {
            this.overlay = false
        })
        this.fetchCatalogoInsumosProductos(); // Call the new method
    },
}
</script>

<style scoped>
.floatme {
    float: left;
    margin-right: 0.4rem;
}
</style>
