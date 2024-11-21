export const state = () => ({
    dataUser: [],
    dataEmpresa: [],
    idEmpresa: 0,
    access: false,
    loading: true,
    activo: false,
})

export const mutations = {
    setIdEmpresa(state, data) {
        state.idEmpresa = data
    },
    setDataEmpresa(state, data) {
        state.dataEmpresa = data
    },
    setDataUser(state, data) {
        state.dataUser = data
    },
    setActivo(state, data) {
        state.activo = data
    },
    /* setDataSys(state, data) {
    state.dataSys = data
  }, */
    setLoading(state, data) {
        state.loading = data
    },
    logout(state) {
        state.access = false
        state.dataUser = []
    },
    setAccess(state, value) {
        state.access = value
    },
}

export const actions = {
    getLoading({ commit }, data) {
        commit("loading", data)
    },
}
