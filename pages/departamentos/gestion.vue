<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div v-if="dataUser.departamento === 'Administración'">
                <b-overlay :show="overlay" spinner-small>
                    <b-container fluid>
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
                                <!-- <inventario-InsumoNuevo @reload="getProducts" /> -->
                                <!-- <products-new :attributescat="prductAttributes" :attributesval="prductAttributesValues"
                                    class="mb-4" @r="getResponseNewProduct" /> -->
                                <p>Incluir componente para crar unevo departamento aqui, badaso en el componente
                                    `products-new`</p>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-pagination v-model="currentPage" :total-rows="totalRows"
                                    :per-page="perPage"></b-pagination>

                                <p class="mt-3">
                                    Página actual: {{ currentPage }}
                                </p>
                                <!-- <pre class="force">
                                    dep {{ departamentos }}
                                </pre> -->

                                <b-table v-if="departamentos.length > 0" ref="table" small striped fixed
                                    :items="departamentos" :fields="fields" :per-page="perPage" :filter="filter"
                                    :current-page="currentPage" @filtered="onFiltered"
                                    :filter-included-fields="includedFields">
                                    <template #cell(orden_proceso)="data">
                                        <admin-departamentosInputOrden @reload="getDepartamentos" :item="data.item" />
                                        <!-- <b-form-group id="input-group-8" label="Tipo de comisión:"
                                            label-for="select-orden-proceso">
                                            <b-form-select id="select-orden-proceso" v-model="tmpOptionSelect"
                                                :options="getDepartamentosSelect" :value="data.item.prden_proceso"
                                                required>
                                            </b-form-select>
                                        </b-form-group> -->
                                    </template>
                                </b-table>

                                <b-alert v-else variant="info" show>
                                    <p>No se encontraron departamentos</p>
                                </b-alert>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-overlay>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"

export default {
    data() {
        return {
            inputDisabled: false,
            perPage: 20,
            currentPage: 1,
            filter: null,
            includedFields: ["departamento", "orden_proceso"],
            titulo: "Gestión de Departamentos",
            overlay: false,
            dataTable: [],
            tmpOptionSelect: null,
            tmpOrden: null,
            fields: [
                /* {
                    key: "_id",
                    label: "ID Departamento",
                    tdClass: "pl-4",
                }, */
                {
                    key: "orden_proceso",
                    label: "Orden proceso",
                },
                {
                    key: "departamento",
                    label: "Departamento",
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

        ...mapState("login", ["dataUser", "access", "departamentos"]),
        ...mapGetters("login", ["getDepartamentosSelect"]),
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

        getResponseNewProduct(res) {
            this.loading.show = true
            this.getProducts().then(() => {
                this.loading.show = false
            })
        },

        async getDepartamentos() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/departamentos`)
                .then((res) => {
                    this.$store.commit("login/setDepartamentos", res.data)
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error cargando los departamentos",
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
    },

    mounted() {
        this.getDepartamentos()
        /* this.getProductsAttributes()
        this.getProducts().then(() => {
            console.log(
                `vamos a crear los datos de los clientes con`,
                this.dataTable
            )
            this.overlay = false
        }) */
    },
}
</script>
