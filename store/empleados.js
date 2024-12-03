import axios from "axios"

export const state = () => ({
    dataInsumos: [],
    insumos: [],
    options: null,
    dataTable2: [],
    ordenesAsignadas: [],
})

export const mutations = {
    setOrdenesAsignadas(state, value) {
        state.ordenesAsignadas = value
    },

    setDataInsumos(state, value) {
        state.dataInsumos = value
    },

    setOptions(state, value) {
        state.options = value
    },

    setDataTable2(state, value) {
        // state.dataTable2.push(value)
        state.dataTable2 = value
    },

    pushDataTable2(state, value) {
        state.dataTable2.push(value)
    },

    spliceDataTable2(state, index) {
        if (index) {
            state.dataTable2.splice(index, 1)
        }
    },

    setOptions(state, value) {
        state.options = value
    },

    setInsumos(state, value) {
        state.insumos = value
    },
}

export const getters = {
    getDataTable2(state) {
        return state.dataTable2
    },
}
export const actions = {
    updateOptions({ commit }, data) {
        commit("setOptions", data)
        return data
    },

    updateDataTable2({ commit }, data) {
        commit("setDataTable2", data)
        return data
    },

    pushDataTable2Acc({ commit }, data) {
        commit("pushDataTable2", data)
    },

    spliceDataTable22Acc({ commit }, data) {
        commit("spliceDataTable2", data)
    },

    async getDataInsumos({ commit }, id) {
        await this.$axios
            .get(`${this.$config.API}/inventario/${this.catagoriaInsumo}`)
            .then((resp) => {
                commit("setOrden", resp.data)
                return resp.data
            })
    },
}
