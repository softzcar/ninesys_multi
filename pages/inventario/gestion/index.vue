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
                                <inventario-InsumoNuevo @reload="getInsumos"
                                    :catalogoProductosData="catalogoInsumosProductos"
                                    @reloadCatalogo="fetchCatalogoInsumosProductos" />
                                <LazyInventarioBulkLoad @upload-success="getInsumos" />
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col class="mb-4">
                                <b-form-radio-group id="btn-radios-2" v-model="selectedRadio" :options="optionsRadio"
                                    button-variant="outline-primary" size="lg" name="radio-btn-outline"
                                    @input="showResultRadio()" buttons></b-form-radio-group>
                            </b-col>
                            <b-col offset-lg="2" offset-xl="2" lg="4" xl="4">
                                <b-input-group class="mb-4" size="sm">
                                    <b-form-select v-model="selectedQuantity" :options="quantityOptions"
                                        size="sm"></b-form-select>
                                </b-input-group>
                            </b-col>
                            <b-col lg="6" xl="6">
                                <b-input-group class="mb-4" size="sm">
                                    <b-form-input id="filter-input" v-model="filter" type="search"
                                        placeholder="Buscar por Nombre, SKU o ID"></b-form-input>

                                    <b-input-group-append>
                                        <b-button :disabled="!filter" @click="filter = ''">
                                            Limpiar
                                        </b-button>
                                        <b-button variant="info" @click="generatePDF" title="Imprimir Reporte">
                                            <b-icon icon="printer-fill"></b-icon>
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
                                    <template #cell(ver_consumo)="data">
                                        <inventario-ConsumoMaterialModal :idInsumo="data.item._id"
                                            :nombreInsumo="data.item.insumo" @reload="getInsumos" />
                                    </template>

                                    <template #cell(_id)="data">
                                        <span class="floatme">
                                            <inventario-InsumoEditar @reload="getInsumos" :data="data.item"
                                                :catalogoProductosData="catalogoInsumosProductos"
                                                @reloadCatalogo="fetchCatalogoInsumosProductos" />
                                        </span>
                                        <span class="floatme">
                                            <!-- Nuevo Componente Terminar Insumo -->
                                            <inventario-InsumoTerminar :idInsumo="data.item._id"
                                                :nombreInsumo="data.item.insumo" :cantidadActual="data.item.cantidad"
                                                @reload="getInsumos" />
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
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default {
    data() {
        return {
            includedFields: ["insumo", "departamento", "sku", "rollo"],
            titulo: "Gestión de Inventario",
            overlay: true,
            filter: null,
            dataTableDyn: [],
            allFilteredItems: [], // Para guardar los items filtrados reales
            dataTable: [],
            sortBy: "departamento",
            sortDesc: false,
            perPage: 25,
            currentPage: 1,
            totalRows: 0, // Initialized totalRows
            selectedRadio: "Todos",
            optionsRadio: [],
            optionsRadio1: [
                { text: "Todas", value: "todas" },
                { text: "Pagadas", value: "pagadas" },
                { text: "Pendientes", value: "pendientes" },
            ],
            selectedQuantity: null,
            quantityOptions: [
                { value: null, text: 'Seleccionar Cantidad para filtro' },
                { value: 1, text: '1' },
                { value: 3, text: '3' },
                { value: 5, text: '5' },
                { value: 10, text: '10' }
            ],
            fields: [
                {
                    key: "rollo",
                    label: "ID Insumo",
                    sortable: true,
                },
                {
                    key: "sku",
                    label: "SKU",
                    sortable: true,
                },
                {
                    key: "insumo",
                    label: "Nombre",
                    sortable: true,
                },
                {
                    key: "departamento",
                    label: "Departamento",
                    sortable: true,
                },
                {
                    key: "rendimiento",
                    label: "Rendimiento",
                    sortable: true,
                },
                {
                    key: "metros",
                    label: "Metros",
                    sortable: true,
                },
                {
                    key: "unidad",
                    label: "Unidad",
                    sortable: true,
                },
                {
                    key: "cantidad",
                    label: "Cantidad",
                    sortable: true,
                },
                {
                    key: "costo",
                    label: "Costo Total",
                    sortable: true,
                },
                {
                    label: "Consumo",
                    key: "ver_consumo",
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
                    this.dataTable = resp.data
                    this.dataTableDyn = resp.data.items
                    this.totalRows = this.dataTableDyn.length

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
            if (!this.dataTable || !this.dataTable.items) {
                this.dataTableDyn = []
                this.totalRows = 0
                return
            }

            if (
                this.selectedRadio === "Todos" ||
                this.selectedRadio === "Telas"
            ) {
                this.fields = [
                    {
                        key: "rollo",
                        label: "ID Insumo",
                        sortable: true,
                    },
                    {
                        key: "sku",
                        label: "SKU",
                        sortable: true,
                    },
                    {
                        key: "insumo",
                        label: "Nombre",
                        sortable: true,
                    },
                    {
                        key: "departamento",
                        label: "Departamento",
                        sortable: true,
                    },
                    {
                        key: "rendimiento",
                        label: "Rendimiento",
                        sortable: true,
                    },
                    {
                        key: "metros",
                        label: "Metros",
                        sortable: true,
                    },
                    {
                        key: "unidad",
                        label: "Unidad",
                        sortable: true,
                    },
                    {
                        key: "cantidad",
                        label: "Cantidad",
                        sortable: true,
                    },
                    {
                        key: "costo",
                        label: "Costo",
                        sortable: true,
                    },
                    {
                        label: "Consumo",
                        key: "ver_consumo",
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
                        sortable: true,
                    },
                    {
                        key: "sku",
                        label: "SKU",
                        sortable: true,
                    },
                    {
                        key: "insumo",
                        label: "Nombre",
                        sortable: true,
                    },
                    {
                        key: "departamento",
                        label: "Departamento",
                        sortable: true,
                    },
                    {
                        key: "unidad",
                        label: "Unidad",
                        sortable: true,
                    },
                    {
                        key: "cantidad",
                        label: "Cantidad",
                        sortable: true,
                    },
                    {
                        key: "costo",
                        label: "Costo",
                        sortable: true,
                    },
                    {
                        label: "Consumo",
                        key: "ver_consumo",
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
            }

            // Aplicar filtro de cantidad si está seleccionado un valor
            if (this.selectedQuantity !== null) {
                this.dataTableDyn = this.dataTableDyn.filter(
                    (item) => parseFloat(item.cantidad) <= this.selectedQuantity
                )
            }

            console.log(
                `Acciones al aplicar el filtro a los insumos filte ${this.selectedRadio}`,
                this.dataTableDyn
            )
            this.totalRows = this.dataTableDyn.length
        },

        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
            this.allFilteredItems = filteredItems // Guardamos la lista completa filtrada
        },

        generatePDF() {
            const doc = new jsPDF()

            // Título del reporte
            doc.setFontSize(18)
            doc.text("Reporte de Inventario", 14, 22)

            doc.setFontSize(11)
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30)
            if (this.filter) {
                doc.text(`Filtro aplicado: ${this.filter}`, 14, 36)
            }

            // Definir columnas para el PDF (excluyendo acciones y columnas vacías)
            const tableColumn = [
                "ID Insumo",
                "SKU",
                "Nombre",
                "Departamento",
                "Rendimiento",
                "Metros",
                "Unidad",
                "Cantidad",
                "Costo"
            ]

            // Preparar datos
            // Logica corregida: Si hay filtro activo, usamos allFilteredItems (que viene de @filtered)
            // Si no hay filtro, usamos dataTableDyn (todos los del departamento actual)
            let itemsToPrint = []

            if (this.filter && this.filter.trim() !== '') {
                // Si hay texto en el filtro, usamos lo que b-table procesó (sin paginar)
                itemsToPrint = this.allFilteredItems
            } else {
                // Si no hay filtro de texto, usamos todos los items del ambito actual
                itemsToPrint = this.dataTableDyn
            }

            const tableRows = itemsToPrint.map(item => [
                item.rollo,
                item.sku,
                item.insumo,
                item.departamento,
                item.rendimiento,
                item.metros,
                item.unidad,
                item.cantidad,
                item.costo
            ])

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [23, 162, 184] } // Info color variant approximation
            })

            doc.save(`reporte_inventario_${new Date().toISOString().slice(0, 10)}.pdf`)
        },

        async fetchCatalogoInsumosProductos() {
            try {
                const response = await this.$axios.get(`${this.$config.API}/catalogo-insumos-productos`);
                this.catalogoInsumosProductos = response.data;
            } catch (error) {
                console.error("Error al obtener el catálogo de productos:", error);
            }
        },
    },

    watch: {
        selectedQuantity(newVal) {
            this.showResultRadio()
        },
    },

    mounted() {
        this.getInsumos().then(() => {
            this.overlay = false
        })
        this.fetchCatalogoInsumosProductos();
    },
}
</script>

<style scoped>
.floatme {
    float: left;
    margin-right: 0.4rem;
}
</style>
