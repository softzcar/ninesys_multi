export const state = () => ({
  dataUser: [],
  // dataSys: null,
  access: false,
  loading: true,
  activo: false,
})

export const mutations = {
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
    commit('loading', data)
  },
}
