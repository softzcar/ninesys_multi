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
        const [resDisenos, resEmpleados] = await Promise.all([
            this.$axios.get(`${this.$config.API}/disenos`),
            this.$axios.get(`${this.$config.API}/empleados`)
        ])
        commit("setDisenos", resDisenos.data.disenos)
        commit("setEmpleados", resEmpleados.data.items)
    },
    async getDisenosAsignados({ commit }) {
        await this.$axios
            .get(`${this.$config.API}/disenos/asignados`)
            .then((res) => {
                commit("setDisenosAsignados", res.data.disenos)
                // commit('setEmpleadosAsignados', res.data.empleados)
            })
    },
    async getDisenosTerminados({ commit, rootState }, payload = {}) {
        const idEmpleado =
            payload?.id_empleado ||
            rootState.login.dataUser?.id_empleado ||
            rootState.login.dataUser?.id_usuario;
        const queryParams = new URLSearchParams();
        if (idEmpleado) queryParams.set("id_empleado", idEmpleado);
        queryParams.set("dias", payload?.dias || 30);

        await this.$axios
            .get(`${this.$config.API}/disenos/terminados?${queryParams.toString()}`)
            .then((res) => {
                commit("setDisenosTerminados", res.data)
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
