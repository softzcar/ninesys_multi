// import axios from "axios"

export const state = () => ({
    ordenesActivas: [{ msg: "Aqui las ordenes activas" }],
    ordenesSemana: [],
    ordenNuevaTelas: [],
    dolar: 110,
    ordenesLength: 0,
    peso: 4000,
    dataProductos: [],
    dataProductosSelect: [],
    dataCustomers: [],
    dataTallas: [],
    // Mapa id_product -> [id_talla,...] con las tallas que ese producto tiene
    // realmente configuradas en product_insumos_asignados. Un producto sin
    // entradas aqui (nunca se le asigno ningun insumo por talla) no aparece
    // como key -- en ese caso el filtro en nueva orden/presupuesto debe caer
    // al catalogo completo (dataTallas) para no romper productos existentes
    // que nunca curaron esto (hallazgo real 2026-09-09).
    tallasAsignadasPorProducto: {},
    dataTelas: [],
    dataCategories: [],
    customersSelect: [],
})

export const actions = {
    getDataProductos({ commit }, data) {
        commit("dataProductos", data)
    },

    getCustomersSelect({ commit }, data) {
        commit("customersSelect", data)
        console.log("cargamos en customerSelect", data)
    },

    getDataCustomers({ commit }, data) {
        commit("dataCustomers", data)
    },

    getDataTallas({ commit }, data) {
        commit("dataTallas", data)
    },

    getDataTelas({ commit }, data) {
        commit("dataTelas", data)
    },

    getDataCategories({ commit }, data) {
        commit("setDataCategories", data)
    },

    getDolar({ commit }, monto) {
        commit("setDolar", monto)
    },

    getPeso({ commit }, monto) {
        commit("setPeso", monto)
    },

    async getOrdenesActivas({ commit }, id_empleado) {
        await this.$axios
            .get(`${this.$config.API}/table/ordenes-activas/${id_empleado}`)
            .then((res) => {
                commit("setOrdenesActivas", res.data)
                const len = parseInt(res.data.items.length) + 1
                commit("setOrdenesLength", len)
            })
    },

    async getOrdenesSemana({ commit }, data) {
        let newDate

        if (data.fecha === undefined) {
            newDate = new Date().toLocaleDateString("sv-SE")
        } else {
            newDate = data.fecha
        }

        await this.$axios
            .get(`${this.$config.API}/ordenes-reporte-semanal/${newDate}`)
            .then((res) => {
                commit("setOrdenesSemana", res.data)
                const len = parseInt(res.data.items.length) + 1
                commit("setOrdenesLength", len)
            })
    },
}

export const getters = {
    getCustomersSelect(state) {
        return state.dataCustomers.map((client) => {
            return `${client.id} | ${client.first_name} ${client.last_name} - ${client.phone}`
        })
    },
    dynOrdenesActivas(state) {
        return state.ordenesActivas
    },

    getProductsSport(state) {
        return state.dataProductos.filter((objeto) => {
            return parseInt(objeto.stock_quantity) > 0
        })
    },

    getProductsCustom(state) {
        return state.dataProductos
    },
    /* getProductsSport(state) {
        return state.dataProductos.filter((objeto) => {
            return objeto.categories.some((categoria) => categoria.id === 91)
        })
    },

    getProductsCustom(state) {
        return state.dataProductos.filter((objeto) => {
            return objeto.categories.some((categoria) => categoria.id != 91)
        })
    }, */
}

export const mutations = {
    setOrdenesLength(state, data) {
        state.ordenesLength = data
    },
    setLoading(state, data) {
        state.loading = data
    },
    setDataProductos(state, data) {
        state.dataProductos = data
    },

    addDataProductos(state, data) {
        const { cod, description, price } = data

        // Buscar el producto con el código especificado
        const targetProduct = state.dataProductos.find(
            (item) => item.cod === cod
        )

        if (targetProduct) {
            // Verificar si ya existe un precio con la misma descripción
            const existingPrice = targetProduct.prices.some(
                (priceItem) => priceItem.description === description
            )

            if (!existingPrice) {
                // Si la descripción no existe, agregar un nuevo precio
                targetProduct.prices.push({ description, price })
            }
        } else {
            // Si el producto con el código especificado no existe en dataProductos
            console.warn(`Producto con cod ${cod} no encontrado.`)
        }
    },

    setDataProductosSelect(state, data) {
        state.dataProductosSelect = data
    },
    setDataCustomers(state, data) {
        state.dataCustomers = data
    },
    setDataCustomersSelect(state, data) {
        state.customersSelect = data
    },
    setDataTallas(state, data) {
        state.dataTallas = data
    },
    setTallasAsignadasPorProducto(state, pares) {
        // pares: [{id_product, id_talla}, ...] -- construye el mapa una sola
        // vez a partir de la respuesta plana del backend.
        const mapa = {}
        for (const { id_product, id_talla } of pares) {
            if (!mapa[id_product]) mapa[id_product] = []
            mapa[id_product].push(id_talla)
        }
        state.tallasAsignadasPorProducto = mapa
    },
    setDataCategories(state, data) {
        state.dataCategories = data
    },
    setDataTelas(state, data) {
        state.dataTelas = data
    },
    setDolar(state, data) {
        state.dolar = data
    },
    setPeso(state, data) {
        state.peso = data
    },
    setOrdenesActivas(state, ordenes) {
        state.ordenesActivas = ordenes
    },

    setOrdenesSemana(state, ordenes) {
        state.ordenesSemana = ordenes
    },
}
