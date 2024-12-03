import axios from "axios"

export const state = () => ({
    disenos: [],
    disenosasignados: [],
    empleados: [],
    disenosEmpleado: [],
    disenosTerminados: [],
})

export const mutations = {
    setDisenos(state, disenos) {
        state.disenos = disenos
    },
    setDisenosEmpleado(state, disenos) {
        state.disenosEmpleado = disenos
    },
    setDisenosTerminados(state, disenos) {
        state.disenosTerminados = disenos
    },
    setDisenosAsignados(state, disenos) {
        state.disenosAsignados = disenos
    },
    setEmpleados(state, empleados) {
        state.empleados = empleados
    },
}

export const actions = {
    async getDisenos({ commit }) {
        await this.$axios.get(`${this.$config.API}/disenos`).then((res) => {
            commit("setDisenos", res.data.disenos)
            commit("setEmpleados", res.data.empleados)
        })
    },
    async getDisenosAsignados({ commit }) {
        await this.$axios
            .get(`${this.$config.API}/disenos/asignados`)
            .then((res) => {
                commit("setDisenosAsignados", res.data.disenos)
                // commit('setEmpleadosAsignados', res.data.empleados)
            })
    },
    async getDisenosTerminados({ commit }) {
        await this.$axios
            .get(`${this.$config.API}/disenos/terminados`)
            .then((res) => {
                commit("setDisenosTerminados", res.data)
                // commit('setEmpleadosAsignados', res.data.empleados)
            })
    },
    async getDisenosEmpleado({ commit }, id_empleado) {
        // let userType = this.$store.state.login.dataUser.departamento
        // console.log('Departamento de usuario', userType)
        await this.$axios
            .get(`${this.$config.API}/disenos/asignados/${id_empleado}`)
            .then((res) => {
                commit("setDisenosEmpleado", res.data)
            })
    },
}
