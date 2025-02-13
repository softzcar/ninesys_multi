<template>
    <div>
        <b-overlay :show="overlay">
            <b-container>
                <b-row>
                    <b-col>
                        <h3>Asignación de comisiones a productos</h3>
                    </b-col>
                </b-row>

                <!-- Filtro de busqueda -->
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
                        <b-form-select id="select-departamento" :disabled="inputDisabled" v-model="departamento"
                            :options="departamentosSelect" :value="departamento"></b-form-select>
                    </b-col>
                </b-row>

                <b-row>
                    <b-col>
                        <h2 class="mt-4">{{ departamentoTit }}</h2>

                        <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage"></b-pagination>

                        <p class="mt-3">Página actual: {{ currentPage }}</p>

                        <b-table :per-page="perPage" :current-page="currentPage" striped :items="products"
                            :fields="fields" :filter-included-fields="includedFields" @filtered="onFiltered"
                            :filter="filter">
                            <template #cell(comision)="data">
                                <admin-ComisionesProductosInputGeneral :iddep="departamento" :key="data.item.cod"
                                    :item="data.item" :seldep="departamentosSelect" @reload="loadData" />
                            </template>

                            <template #cell(categories)="data">
                                <b-badge v-for="(prod, index) in data.item.categories(
                                    data.item.categories
                                )" :key="index" pill variant="info" class="mr-1 mb-1 p-2">{{ prod.name }}</b-badge>
                            </template>
                        </b-table>
                    </b-col>
                </b-row>
            </b-container>
        </b-overlay>
    </div>
</template>

<script>

export default {
    data() {
        return {
            perPage: 25,
            currentPage: 1,
            filter: null,
            includedFields: ["name"],
            overlay: true,
            inputDisabled: false,
            products: [],
            productsTable: [],
            departamento: null,
            departamentoTit: `Seleccione un departamento`,
            dataLength: 0,
            departamentos: [],
            departamentosSelect: [],
            productsSelect: [],
            fields: [
                {
                    key: "name",
                    label: "nombre",
                },
                {
                    key: "comision",
                    label: "comision",
                },
            ],
        }
    },

    watch: {
        departamento(val) {
            // ACTUALIZAR EL TITULO DEL DEPARTAMENTO SELECCIONADO
            const tmpDep = this.departamentosSelect.find(el => el.value === val)
            this.departamentoTit = tmpDep.text

        },

        totalRows() {
            // ACTUALIZAR EL TITULO DEL DEPARTAMENTO SELECCIONADO
            const tmpDep = this.departamentosSelect.find(el => el.value === this.departamento)
            this.departamentoTit = tmpDep.text
        }
    },

    computed: {
        /* productsOrdered() {
            return this.products.sort(this.compareNames)
        }, */
        totalRows() {
            return parseInt(this.dataLength) + 1
        },
    },

    methods: {
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },

        async loadData() {
            this.overlay = true
            await this.getDepartamentos()
            await this.getProducts().then(() => this.productsTable = this.products)
            this.overlay = false
        },

        async getProducts() {
            await this.$axios(`${this.$config.API}/products`)
                .then((res) => {
                    this.products = res.data
                    this.dataLength = res.data.length
                    this.productsSelect = res.data.map((prod) => {
                        return {
                            value: prod.cod,
                            text: prod.name
                        }
                    })
                })
                .catch((err) => {
                    console.log("Error en getPtroducts", err)
                    // this.alert({
                    //   type: 'error',
                    //   titile: 'Error',
                    //   html: 'Error en la conexión',
                    // })
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        async getDepartamentos() {
            await this.$axios(`${this.$config.API}/departamentos`)
                .then((res) => {
                    this.departamentos = res.data
                    this.departamentosSelect = res.data.map((dep) => {
                        return {
                            value: dep._id,
                            text: dep.departamento
                        }
                    })

                    this.departamentosSelect.unshift({
                        value: null,
                        text: "Seleccione un departamento",
                    })

                    console.log(`Select departamentos`, this.departamentosSelect)
                })
                .catch((err) => {
                    console.log("Error en getPtroducts", err)
                    // this.alert({
                    //   type: 'error',
                    //   titile: 'Error',
                    //   html: 'Error en la conexión',
                    // })
                })
                .finally(() => {
                    this.overlay = false
                })
        },
        /* compareNames(a, b) {
            const nameA = a.name.toUpperCase()
            const nameB = b.name.toUpperCase()
    
            let comparison = 0
            if (nameA > nameB) {
                comparison = 1
            } else if (nameA < nameB) {
                comparison = -1
            }
            return comparison
        }, */

        /* showCategories(dat) {
            const filtered = dat.map((el) => {
                return el.name
            })
            return filtered
        }, */

        /* async getAttributes() {
            await this.$axios
                .get(`${this.$config.API}/atributos/comisiones`)
                .then((res) => {
                    this.products = res.data.data
                })
        }, */
    },

    mounted() {
        this.loadData()
        // this.getProducts().then(() => this.productsTable = this.products)
        // this.getDepartamentos()
        // this.getAttributes().then(() => (this.overlay = false))
    },
}
</script>

<style lang="scss" scoped></style>
