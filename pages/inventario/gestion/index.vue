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
                        <!-- FILA 1: TÍTULO Y ACCIONES PRINCIPALES -->
                        <b-row class="align-items-center mb-4 pb-2 border-bottom">
                            <b-col md="6">
                                <h2 class="mb-0 text-dark">{{ titulo }}</h2>
                            </b-col>
                            <b-col md="6" class="text-right d-flex justify-content-end align-items-center">
                                <inventario-InsumoNuevo @reload="getInsumos"
                                    :catalogoProductosData="catalogoInsumosProductos"
                                    :inventoryItems="dataTableDyn"
                                    @reloadCatalogo="fetchCatalogoInsumosProductos" class="mr-2" />
                                <inventario-ResumenSkuModal :items="dataTable.items" class="mr-2" />
                                <b-button variant="info" @click="imprimirReporte" title="Imprimir Reporte">
                                    <b-icon icon="printer-fill" class="mr-1"></b-icon> Imprimir Reporte
                                </b-button>
                            </b-col>
                        </b-row>

                        <!-- FILA 2: CATEGORÍAS Y HERRAMIENTAS -->
                        <b-row class="mb-4 align-items-center">
                            <b-col md="9">
                                <b-form-radio-group id="btn-radios-2" v-model="selectedRadio" :options="optionsRadio"
                                    button-variant="outline-primary" size="md" name="radio-btn-outline"
                                    @input="showResultRadio()" buttons></b-form-radio-group>
                            </b-col>
                            <b-col md="3" class="text-right">
                                <LazyInventarioBulkLoad @upload-success="getInsumos" />
                            </b-col>
                        </b-row>

                        <!-- FILA 3: BÚSQUEDA Y FILTROS TÉCNICOS -->
                        <b-row class="mb-3">
                            <b-col md="8">
                                <b-input-group size="md">
                                    <b-form-input id="filter-input" v-model="filter" type="search"
                                        placeholder="Buscar por Nombre, SKU o ID..."></b-form-input>
                                    <b-input-group-append>
                                        <b-button :disabled="!filter" @click="filter = ''" variant="outline-secondary">
                                            Limpiar
                                        </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-col>
                            <b-col md="4">
                                <b-input-group size="md">
                                    <b-input-group-prepend is-text>
                                        <span class="small font-weight-bold">Stock:</span>
                                    </b-input-group-prepend>
                                    <b-form-select v-model="selectedQuantity" :options="quantityOptions"
                                        size="md"></b-form-select>
                                </b-input-group>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col class="d-flex justify-content-between align-items-center mb-3">
                                <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage"
                                    class="mb-0"></b-pagination>
                                <div class="text-muted small">
                                    Mostrando página {{ currentPage }} de {{ Math.ceil(totalRows / perPage) }}
                                </div>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col>
                                <b-table ref="table" responsive small striped hover :items="dataTableDyn"
                                    :fields="fields" :per-page="perPage" :current-page="currentPage"
                                    @filtered="onFiltered" :filter="filter" :filter-included-fields="includedFields"
                                    :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
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

        <!-- SECCIÓN OCULTA PARA IMPRESIÓN (ESTÁNDAR DEL PROYECTO) -->
        <div style="display: none;">
            <div id="reporte-inventario" class="report">
                <table class="table-header" style="width: 100%; margin-bottom: 20px;">
                    <tr>
                        <td>
                            <h1 style="font-size: 18pt; margin-bottom: 5px;">{{ dataEmpresa.nombre }}</h1>
                            <p>{{ dataEmpresa.direccion }}</p>
                        </td>
                        <td style="text-align: right; vertical-align: top;">
                            <h2 style="font-size: 14pt;">REPORTE DE INVENTARIO</h2>
                            <p><strong>Fecha:</strong> {{ new Date().toLocaleDateString() }}</p>
                            <p v-if="filter"><strong>Filtro:</strong> {{ filter }}</p>
                            <p><strong>Departamento:</strong> {{ selectedRadio }}</p>
                        </td>
                    </tr>
                </table>

                <table class="table-products" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border-bottom: 2px solid #000; padding: 8px; text-align: left;">ID</th>
                            <th style="border-bottom: 2px solid #000; padding: 8px; text-align: left;">SKU</th>
                            <th style="border-bottom: 2px solid #000; padding: 8px; text-align: left;">Insumo</th>
                            <th style="border-bottom: 2px solid #000; padding: 8px; text-align: left;">Depto.</th>
                            <th style="border-bottom: 2px solid #000; padding: 8px; text-align: right;">Rend.</th>
                            <th style="border-bottom: 2px solid #000; padding: 8px; text-align: right;">Metros</th>
                            <th style="border-bottom: 2px solid #000; padding: 8px; text-align: center;">Unidad</th>
                            <th style="border-bottom: 2px solid #000; padding: 8px; text-align: right;">Stock</th>
                            <th style="border-bottom: 2px solid #000; padding: 8px; text-align: right;">Costo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in itemsParaReporte" :key="item._id">
                            <td style="border-bottom: 1px solid #ccc; padding: 6px;">{{ item.rollo }}</td>
                            <td style="border-bottom: 1px solid #ccc; padding: 6px;">{{ item.sku }}</td>
                            <td style="border-bottom: 1px solid #ccc; padding: 6px;">{{ item.insumo }}</td>
                            <td style="border-bottom: 1px solid #ccc; padding: 6px;">{{ item.departamento }}</td>
                            <td style="border-bottom: 1px solid #ccc; padding: 6px; text-align: right;">{{ item.rendimiento }}</td>
                            <td style="border-bottom: 1px solid #ccc; padding: 6px; text-align: right;">
                                <span v-if="item.tipo_insumo === 'tela'">{{ item.metros }}</span>
                                <span v-else>-</span>
                            </td>
                            <td style="border-bottom: 1px solid #ccc; padding: 6px; text-align: center;">{{ item.unidad }}</td>
                            <td style="border-bottom: 1px solid #ccc; padding: 6px; text-align: right;">{{ item.cantidad }}</td>
                            <td style="border-bottom: 1px solid #ccc; padding: 6px; text-align: right;">{{ item.costo }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
import axios from "axios"
import PrintService from "@/utils/PrintService"

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
        ...mapState("login", ["dataEmpresa", "dataUser", "access"]),
        myTable() {
            return this.dataTable.items
        },
        itemsParaReporte() {
            let items = (this.filter && this.filter.trim() !== '') ? [...this.allFilteredItems] : [...this.dataTableDyn];
            
            if (this.sortBy) {
                const field = this.sortBy;
                const isDesc = this.sortDesc;
                const modifier = isDesc ? -1 : 1;
                
                items.sort((a, b) => {
                    let valA = a[field];
                    let valB = b[field];
                    
                    if (valA === null || valA === undefined) return 1;
                    if (valB === null || valB === undefined) return -1;
                    
                    // Intentar comparación numérica si ambos parecen números
                    const numA = parseFloat(valA);
                    const numB = parseFloat(valB);
                    
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return (numA - numB) * modifier;
                    }
                    
                    // Comparación de strings
                    valA = valA.toString().toLowerCase();
                    valB = valB.toString().toLowerCase();
                    
                    if (valA < valB) return -1 * modifier;
                    if (valA > valB) return 1 * modifier;
                    return 0;
                });
            }
            return items;
        }
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
            this.overlay = true;
            await this.$axios
                .get(`${this.$config.API}/inventario/todos`)
                .then((resp) => {
                    this.dataTable = []
                    // Procesar metros para telas antes de guardar
                    if (resp.data && resp.data.items) {
                        resp.data.items = resp.data.items.map(item => {
                            if ((item.tipo_insumo || '').toLowerCase() === 'tela') {
                                const cant = parseFloat(item.cantidad || 0);
                                const rend = parseFloat(item.rendimiento || 0);
                                return {
                                    ...item,
                                    metros: (cant * rend).toFixed(2)
                                };
                            }
                            return { ...item, metros: '-' };
                        });
                    }
                    this.dataTable = resp.data
                    // this.dataTable = resp.data // Duplicado eliminado
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
                    
                    // Re-aplicar filtros actuales para mantener el estado
                    this.showResultRadio();
                    
                    this.overlay = false
                })
                .catch(error => {
                    console.error("Error al obtener insumos:", error);
                    this.overlay = false;
                });
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
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
            this.allFilteredItems = filteredItems; // Guardamos la lista completa filtrada
        },

        imprimirReporte() {
            // Siguiendo el estándar del proyecto (como en resultado.vue)
            const printContent = document.getElementById("reporte-inventario").outerHTML;
            const reportTitle = `Reporte Inventario - ${this.selectedRadio} - ${new Date().toLocaleDateString()}`;

            // Estilos específicos para la impresión (reutilizando el patrón de resultado.vue)
            const customStyles = `
                <style>
                    @page { size: landscape; margin: 10mm; }
                    .report { font-family: Arial, sans-serif; width: 100%; }
                    .table-header { width: 100%; margin-bottom: 20px; border-bottom: 2px solid #17a2b8; padding-bottom: 10px; }
                    .table-products { width: 100%; border-collapse: collapse; }
                    .table-products th { background-color: #f8f9fa; color: #333; font-weight: bold; }
                    .table-products th, .table-products td { border: 1px solid #dee2e6; padding: 8px; font-size: 9pt; }
                    h1 { color: #17a2b8; margin: 0; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                </style>
            `;

            PrintService.imprimir(reportTitle, customStyles + printContent);
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
