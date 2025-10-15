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

                <b-row class="mt-3 mb-3">
                    <b-col>
                        <h5>Filtrar por tipo de producto:</h5>
                        <b-form-radio-group id="btn-radios-type" v-model="selectedType" :options="optionsType"
                            button-variant="outline-primary" size="lg" name="radio-btn-type" buttons></b-form-radio-group>
                    </b-col>
                </b-row>

                <b-row class="mt-3 mb-3">
                    <b-col>
                        <b-button variant="primary" @click="guardarTodosLosCambios" :disabled="!hayCambios">
                            Guardar Todos los Cambios
                        </b-button>
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
                                    :item="data.item" :seldep="departamentosSelect"
                                    @update-comision="actualizarComisionEnData" />
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
            selectedType: "todos",
            optionsType: [
                { text: "Todos", value: "todos" },
                { text: "Físicos", value: "fisicos" },
                { text: "Digitales", value: "digitales" },
            ],
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
            cambios: {}, // Objeto para registrar los cambios pendientes
        }
    },

    watch: {
        departamento(val) {
            // ACTUALIZAR EL TITULO DEL DEPARTAMENTO SELECCIONADO
            const tmpDep = this.departamentosSelect.find(el => el.value === val)
            this.departamentoTit = tmpDep.text
            this.selectedType = "todos"
            this.applyFilters()
        },

        totalRows() {
            // ACTUALIZAR EL TITULO DEL DEPARTAMENTO SELECCIONADO
            const tmpDep = this.departamentosSelect.find(el => el.value === this.departamento)
            this.departamentoTit = tmpDep.text
        },

        selectedType() {
            this.applyFilters()
        }
    },

    computed: {
        hayCambios() {
            return Object.keys(this.cambios).length > 0
        },

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
            await this.getProducts().then(() => {
                this.productsTable = this.products
                this.applyFilters()
            })
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

        actualizarComisionEnData(payload) {
            // payload es { id_producto: ..., comision: ... }

            // Actualizamos el valor en la data local para que la UI sea consistente
            const producto = this.products.find(p => p.cod === payload.id_producto)
            if (producto) {
                // Esto es opcional, pero mantiene la data del padre sincronizada
                // por si se necesita en el futuro.
            }

            // Registramos el cambio en nuestro objeto de cambios pendientes
            // Usamos el id_producto como clave para no tener duplicados
            this.$set(this.cambios, payload.id_producto, payload.comision)

            // Forzamos la reactividad si es necesario (Vue 2)
            this.$forceUpdate()
        },

        applyFilters() {
            let filtered = [...this.productsTable] // Start from the original products

            // Filter by product type
            if (this.selectedType === "fisicos") {
                filtered = filtered.filter(product => product.producto_fisico === 1)
            } else if (this.selectedType === "digitales") {
                filtered = filtered.filter(product => product.producto_fisico === 0)
            }

            this.products = filtered
            this.dataLength = filtered.length
            this.currentPage = 1
        },

        async guardarTodosLosCambios() {
            this.overlay = true

            // Convertimos nuestro objeto de cambios a un array que la API pueda procesar
            const loteDeCambios = Object.keys(this.cambios).map(idProducto => {
                return {
                    id_product: idProducto,
                    id_departamento: this.departamento, // El departamento actual
                    comision: this.cambios[idProducto],
                }
            })

            // --- IMPORTANTE: Modificación en el Backend ---
            // El endpoint actual (`/product-set-comision-producto`) procesa un solo cambio.
            // Lo ideal es crear un NUEVO ENDPOINT que acepte un lote.
            // Ej: POST /product-set-comisiones-batch

            // --- CAMBIO AQUÍ: Construir URLSearchParams con JSON.stringify --- 
            const params = new URLSearchParams()
            params.set('comisiones', JSON.stringify(loteDeCambios)) // <--- ESTE ES EL CAMBIO CLAVE
            // --- FIN CAMBIO ---

            await this.$axios
                .post(
                    `${this.$config.API}/product-set-comisiones-batch`,
                    params.toString(), // Envía el string de URLSearchParams
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded' // Especifica el Content-Type
                        }
                    }
                )
                .then(res => {
                    this.$fire({
                        title: "Éxito",
                        html: "Se guardaron todas las comisiones.",
                        type: "success",
                    })
                    this.cambios = {} // Limpiamos los cambios pendientes
                    this.loadData() // Recargamos los datos desde la fuente original
                })
                .catch(err => {
                    console.error("Error al guardar en lote:", err)
                    this.$fire({
                        title: "Error",
                        html: "No se pudieron guardar los cambios.",
                        type: "error",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },
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
