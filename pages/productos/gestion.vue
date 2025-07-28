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
                                <h2 class="mb-4">{{ titulo }}</h2>
                            </b-col>
                        </b-row>
                        <b-row class="mb-4">
                            <b-col md="6">
                                <products-new :attributescat="prductAttributes" :attributesval="prductAttributesValues"
                                     @r="getResponseNewProduct" />
                            </b-col>
                            <b-col md="6">
                                <products-BulkLoad />
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-pagination v-model="currentPage" :total-rows="totalRows"
                                    :per-page="perPage"></b-pagination>

                                <p class="mt-3">
                                    Página actual: {{ currentPage }}
                                </p>

                                <b-table ref="table" small striped fixed hover :items="dataTable" :fields="fields"
                                    :per-page="perPage" :filter="filter" :current-page="currentPage"
                                    @filtered="onFiltered" :filter-included-fields="includedFields">
                                    <template #cell(cod)="data">
                                        <span class="floatme">
                                            <products-ProductEditar :key="data.item.cod" @reload="getProducts"
                                                :data="data.item" />
                                        </span>
                                        <span class="floatme">
                                            <b-button variant="danger" v-on:click="
                                                deleteProduct(data.item.cod)
                                                "><b-icon icon="trash"></b-icon>
                                            </b-button>
                                        </span>
                                    </template>

                                    <template #cell(first_name)="data">
                                        {{ data.item.first_name }}
                                        {{ data.item.last_name }}
                                    </template>

                                    <template #cell(categories)="data">
                                        <b-badge pill variant="info" v-for="category in getCategoriesWithLetters(
                                            data.item.categories
                                        )" :key="category.id" class="floatme">
                                            {{ category.name }}
                                        </b-badge>
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

export default {
    data() {
        return {
            prductAttributes: [],
            prductAttributesValues: [],
            includedFields: ["cod", "name"],
            perPage: 20,
            currentPage: 1,
            productsLength: 0,
            filter: null,
            titulo: "Gestión de Productos",
            overlay: true,
            dataTable: [],
            fields: [
                {
                    key: "cod",
                    label: "",
                    tdClass: "pl-4",
                },
                {
                    key: "name",
                    label: "Producto",
                    tdClass: "pl-4",
                },
                {
                    key: "sku",
                    label: "SKU",
                    tdClass: "pl-4",
                },
                {
                    key: "regular_price",
                    label: "Precio",
                },
                {
                    key: "stock_quantity",
                    label: "cantidad",
                },
                {
                    key: "categories",
                    label: "Categorías",
                },
            ],
            loading: {
                show: false,
                text: "",
            },
        }
    },

    computed: {
        totalRows() {
            return parseInt(this.productsLength) + 1
        },

        ...mapState("login", ["dataUser", "access"]),
        myTable() {
            return this.items
        },
    },

    methods: {
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },

        getCategoriesWithLetters(categories) {
            // Filtra las categorías donde el campo "name" contiene letras
            return categories.filter((category) =>
                /[a-zA-Z]/.test(category.name)
            )
        },

        getResponseNewProduct(res) {
            this.loading.show = true
            this.getProducts().then(() => {
                this.loading.show = false
            })
        },

        async getCategorias() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/categories`)
                .then((res) => {
                    this.$store.commit("comerce/setDataCategories", res.data)
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error cargando las catagorías",
                        html: `<p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        /* ANTERIOR DE INSUMOS DESDEAQUÍ */
        deleteProduct(id) {
            this.$confirm(
                `¿Desea Elimiar el insumo ${id} ?`,
                "Eliminar Imsumo",
                "warning"
            )
                .then(() => {
                    this.overlay = true
                    // const data = new URLSearchParams()
                    // data.set('id', id)

                    this.$axios
                        .delete(`${this.$config.API}/products/${id}`)
                        .then((res) => {
                            let msgDat
                            if (parseInt(res.data.cantidad_prod) === 0) {
                                msgDat = {
                                    icon: 'success',
                                    msg: 'El producto ha sido eliminado',
                                }
                                this.getProducts()
                            } else {
                                msgDat = {
                                    icon: 'warning',
                                    msg: 'El producto tiene ordenes asociadas a él y no se puede eliminar',
                                }
                            }

                            this.$fire({
                                title: "Eliminar Producto",
                                html: `<p>${msgDat.msg}</p>`,
                                type: msgDat.icon,
                            })

                        }).catch((err) => {
                            this.$fire({
                                title: "Eliminar Producto",
                                html: `<p>Ocurrió un error al eliminar el productos</p><p>${err}</p>`,
                                type: msgDat.icon,
                            })
                        })
                        .finally(() => this.overlay = false)
                })
                .catch((err) => {
                    console.log("CATCH!!!", err)
                    return false
                })
        },

        reloadData() {
            this.overlay = true
            alert("probando recusrsividad ")
            this.overlay = false
        },

        async getProducts(val) {
            await this.$axios
                .get(`${this.$config.API}/products`)
                .then((resp) => {
                    this.dataTable = resp.data
                    this.productsLength = this.dataTable.length
                    this.overlay = false
                })
        },

        async getProductsAttributes() {
            await this.$axios
                .get(`${this.$config.API}/products-attributes`)
                .then((resp) => {
                    this.prductAttributes = resp.data.products_attributes
                    this.prductAttributesValues = resp.data.products_attributes_values
                    this.overlay = false
                })
        },
    },

    mounted() {
        this.getCategorias()
        this.getProductsAttributes()
        this.getProducts().then(() => {
            console.log(
                `vamos a crear los datos de los clientes con`,
                this.dataTable
            )
            this.overlay = false
        })
    },
}
</script>
