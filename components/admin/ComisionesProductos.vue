<template>
    <div>
        <b-overlay :show="overlay">
            <b-container class="pb-5">
                <b-row>
                    <b-col>
                        <h3>Asignación de comisiones a productos</h3>
                    </b-col>
                </b-row>

                <!-- Filtros -->
                <b-row>
                    <b-col cols="12" lg="5" class="mb-4">
                        <b-input-group size="sm">
                            <b-form-input id="filter-input" v-model="filter" type="search"
                                placeholder="Filtrar Resultados"></b-form-input>

                            <b-input-group-append>
                                <b-button :disabled="!filter" @click="filter = ''">
                                    Limpiar
                                </b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-col>
                    <b-col cols="12" lg="7" class="mb-4">
                        <h5 class="mb-2">Filtrar por tipo de producto:</h5>
                        <b-form-radio-group id="btn-radios-type" v-model="selectedType" :options="optionsType"
                            button-variant="outline-primary" size="lg" name="radio-btn-type"
                            class="filtro-departamento-buttons" buttons></b-form-radio-group>
                    </b-col>
                </b-row>

                <b-row class="mt-3 mb-3 guardar-cambios-bar">
                    <b-col class="d-flex align-items-center">
                        <b-button variant="primary" @click="guardarTodosLosCambios" :disabled="!hayCambios">
                            Guardar Todos los Cambios
                        </b-button>
                        <span v-if="hayCambios" class="ml-3 text-muted">
                            {{ cantidadCambiosPendientes }} cambio(s) sin guardar
                        </span>
                    </b-col>
                </b-row>

                <b-row v-if="productosFiltrados.length === 0 && !overlay">
                    <b-col>
                        <p class="text-muted">No hay productos que coincidan con el filtro actual.</p>
                    </b-col>
                </b-row>

                <div v-for="dep in departamentos" :key="dep._id" class="section-container mb-3">
                    <div class="section-header" @click="toggleSeccion(dep._id)">
                        <div class="d-flex align-items-center">
                            <b-icon :icon="expandedSections[dep._id] ? 'chevron-down' : 'chevron-right'"
                                class="mr-2"></b-icon>
                            <h5 class="mb-0">{{ dep.departamento }}</h5>
                            <b-badge variant="secondary" class="ml-2">{{ productosFiltrados.length }}</b-badge>
                            <b-badge v-if="cambiosPorDepartamento(dep._id) > 0" variant="warning" class="ml-2">
                                {{ cambiosPorDepartamento(dep._id) }} sin guardar
                            </b-badge>
                        </div>
                    </div>

                    <b-collapse :visible="!!expandedSections[dep._id]" lazy>
                        <div class="section-body p-3">
                            <div class="d-flex flex-wrap align-items-center mb-3 aplicar-masiva-bar">
                                <b-button size="sm" variant="outline-secondary" class="mr-1 mb-2"
                                    @click="marcarTodos(dep._id, true)">
                                    Marcar todos
                                </b-button>
                                <b-button size="sm" variant="outline-secondary" class="mr-3 mb-2"
                                    @click="marcarTodos(dep._id, false)">
                                    Desmarcar todos
                                </b-button>

                                <campo-decimal :id="`comision-global-${dep._id}`" style="width: 110px"
                                    class="mr-2 mb-2" placeholder="Comisión" :decimals="3"
                                    :value="comisionGlobalPorDepartamento[dep._id]"
                                    @input="(val) => actualizarComisionGlobal(dep._id, val)" />

                                <b-button size="sm" variant="success" class="mb-2"
                                    :disabled="!seleccionCountPorDepartamento(dep._id) || comisionGlobalPorDepartamento[dep._id] === null || comisionGlobalPorDepartamento[dep._id] === undefined"
                                    @click="aplicarComisionASeleccionados(dep._id)">
                                    Aplicar a seleccionados ({{ seleccionCountPorDepartamento(dep._id) }})
                                </b-button>
                            </div>

                            <b-table-simple hover small responsive bordered>
                                <b-thead head-variant="light">
                                    <b-tr>
                                        <b-th style="width: 40px;"></b-th>
                                        <b-th>Producto</b-th>
                                        <b-th style="width: 130px;">Comisión</b-th>
                                    </b-tr>
                                </b-thead>
                                <b-tbody>
                                    <b-tr v-for="prod in productosFiltrados" :key="prod.cod">
                                        <b-td>
                                            <b-form-checkbox
                                                :checked="!!seleccionadosMap[claveSeleccion(dep._id, prod.cod)]"
                                                @change="(val) => toggleSeleccion(dep._id, prod.cod, val)" />
                                        </b-td>
                                        <b-td>{{ prod.name }}</b-td>
                                        <b-td>
                                            <admin-ComisionesProductosInputGeneral
                                                :id-producto="prod.cod"
                                                :id-departamento="dep._id"
                                                :original-value="obtenerComisionOriginal(prod, dep._id)"
                                                :pending-value="obtenerComisionPendiente(prod.cod, dep._id)"
                                                @update-comision="actualizarComisionEnData" />
                                        </b-td>
                                    </b-tr>
                                </b-tbody>
                            </b-table-simple>
                        </div>
                    </b-collapse>
                </div>
            </b-container>
        </b-overlay>
    </div>
</template>

<script>

export default {
    data() {
        return {
            filter: null,
            overlay: true,
            products: [],
            departamentos: [],
            selectedType: "todos",
            optionsType: [
                { text: "Todos", value: "todos" },
                { text: "Físicos", value: "fisicos" },
                { text: "Digitales", value: "digitales" },
            ],
            // Cambios pendientes sin guardar. Clave compuesta
            // `${id_departamento}::${id_producto}` -- antes se indexaba solo
            // por id_producto, así que al cambiar de departamento con
            // cambios pendientes se guardaban con el id_departamento
            // equivocado (contaminación cruzada entre departamentos).
            cambios: {},
            // Selección múltiple por producto+departamento, para poder
            // aplicar una misma comisión a varios productos de una vez.
            seleccionadosMap: {},
            comisionGlobalPorDepartamento: {},
            // Todas las secciones arrancan colapsadas (junto con `lazy` en
            // b-collapse, evita renderizar de una vez N departamentos x
            // cientos de productos cada uno).
            expandedSections: {},
        }
    },

    computed: {
        hayCambios() {
            return Object.keys(this.cambios).length > 0
        },

        cantidadCambiosPendientes() {
            return Object.keys(this.cambios).length
        },

        productosFiltrados() {
            let filtered = [...this.products]

            if (this.selectedType === "fisicos") {
                filtered = filtered.filter(product => product.producto_fisico === 1)
            } else if (this.selectedType === "digitales") {
                filtered = filtered.filter(product => product.producto_fisico === 0)
            }

            if (this.filter) {
                const term = this.filter.toLowerCase()
                filtered = filtered.filter(product => (product.name || "").toLowerCase().includes(term))
            }

            return filtered
        },
    },

    methods: {
        claveSeleccion(idDepartamento, idProducto) {
            return `${idDepartamento}::${idProducto}`
        },

        claveCambio(idDepartamento, idProducto) {
            return `${idDepartamento}::${idProducto}`
        },

        toggleSeccion(idDepartamento) {
            this.$set(this.expandedSections, idDepartamento, !this.expandedSections[idDepartamento])
        },

        toggleSeleccion(idDepartamento, idProducto, valor) {
            this.$set(this.seleccionadosMap, this.claveSeleccion(idDepartamento, idProducto), valor)
        },

        actualizarComisionGlobal(idDepartamento, valor) {
            this.$set(this.comisionGlobalPorDepartamento, idDepartamento, valor)
        },

        marcarTodos(idDepartamento, valor) {
            this.productosFiltrados.forEach(prod => {
                this.$set(this.seleccionadosMap, this.claveSeleccion(idDepartamento, prod.cod), valor)
            })
        },

        seleccionCountPorDepartamento(idDepartamento) {
            const prefix = `${idDepartamento}::`
            return Object.keys(this.seleccionadosMap)
                .filter(key => key.startsWith(prefix) && this.seleccionadosMap[key])
                .length
        },

        cambiosPorDepartamento(idDepartamento) {
            const prefix = `${idDepartamento}::`
            return Object.keys(this.cambios).filter(key => key.startsWith(prefix)).length
        },

        obtenerComisionOriginal(producto, idDepartamento) {
            const idExist = (producto.comisiones || []).find(
                (el) => el.id_departamento === idDepartamento
            )
            if (idExist !== undefined) {
                return parseFloat(idExist.comision) || 0
            }

            const dep = this.departamentos.find(d => d._id === idDepartamento)
            const esDiseno = dep && dep.departamento === "Diseño"
            if (producto.es_diseno === 1 && esDiseno) {
                return parseFloat(producto.comision) || 0
            }

            return 0
        },

        obtenerComisionPendiente(idProducto, idDepartamento) {
            const key = this.claveCambio(idDepartamento, idProducto)
            return Object.prototype.hasOwnProperty.call(this.cambios, key) ? this.cambios[key] : null
        },

        actualizarComisionEnData(payload) {
            // payload: { id_producto, id_departamento, comision }
            const key = this.claveCambio(payload.id_departamento, payload.id_producto)
            const producto = this.products.find(p => p.cod === payload.id_producto)
            const original = producto ? this.obtenerComisionOriginal(producto, payload.id_departamento) : null

            if (original !== null && payload.comision === original) {
                // El usuario volvió al valor original: ya no es un cambio pendiente.
                this.$delete(this.cambios, key)
            } else {
                this.$set(this.cambios, key, payload.comision)
            }
        },

        aplicarComisionASeleccionados(idDepartamento) {
            const valor = parseFloat(this.comisionGlobalPorDepartamento[idDepartamento])
            if (Number.isNaN(valor)) return

            const prefix = `${idDepartamento}::`
            const idsSeleccionados = Object.keys(this.seleccionadosMap)
                .filter(key => key.startsWith(prefix) && this.seleccionadosMap[key])
                .map(key => key.split("::")[1])

            idsSeleccionados.forEach(idProductoStr => {
                const producto = this.products.find(p => String(p.cod) === idProductoStr)
                if (!producto) return
                this.actualizarComisionEnData({
                    id_producto: producto.cod,
                    id_departamento: idDepartamento,
                    comision: valor,
                })
            })
        },

        async loadData() {
            this.overlay = true
            await this.getDepartamentos()
            await this.getProducts()
            this.overlay = false
        },

        async getProducts() {
            await this.$axios(`${this.$config.API}/products`)
                .then((res) => {
                    this.products = res.data
                })
                .catch((err) => {
                    console.log("Error en getProducts", err)
                })
        },

        async getDepartamentos() {
            await this.$axios(`${this.$config.API}/departamentos`)
                .then((res) => {
                    this.departamentos = res.data
                })
                .catch((err) => {
                    console.log("Error en getDepartamentos", err)
                })
        },

        async guardarTodosLosCambios() {
            this.overlay = true

            const loteDeCambios = Object.keys(this.cambios).map(key => {
                const [idDepartamento, idProducto] = key.split("::")
                return {
                    id_product: idProducto,
                    id_departamento: parseInt(idDepartamento, 10),
                    comision: this.cambios[key],
                }
            })

            const params = new URLSearchParams()
            params.set('comisiones', JSON.stringify(loteDeCambios))

            await this.$axios
                .post(
                    `${this.$config.API}/product-set-comisiones-batch`,
                    params.toString(),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                )
                .then(res => {
                    this.$fire({
                        title: "Éxito",
                        html: "Se guardaron todas las comisiones.",
                        type: "success",
                    })
                    this.cambios = {}
                    this.loadData()
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
    },
}
</script>

<style lang="scss" scoped>
.filtro-departamento-buttons {
    flex-wrap: wrap;
}
.filtro-departamento-buttons ::v-deep .btn {
    /* Bootstrap le da flex:1 1 auto a los botones dentro de un .btn-group,
       así que al envolver en más de una fila, cada fila reparte el ancho
       completo entre los botones que le tocaron -- con menos botones en la
       última fila, esos quedan mucho más anchos que los de arriba y se ven
       como un elemento distinto. Se fuerza ancho natural (sin crecer) para
       que el tamaño de cada botón sea el mismo sin importar en qué fila caiga. */
    flex: 0 0 auto;
    margin-bottom: 4px;
}

.guardar-cambios-bar {
    position: sticky;
    top: 0;
    z-index: 20;
    background-color: #fff;
    padding-top: 8px;
    padding-bottom: 8px;
}

.section-container {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background-color: #f8f9fa;
    cursor: pointer;
    user-select: none;
}

.section-header:hover {
    background-color: #eef1f4;
}

.section-body {
    background-color: #fff;
}

.aplicar-masiva-bar {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 10px;
}
</style>
