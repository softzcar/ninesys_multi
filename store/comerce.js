import axios from 'axios'

export const state = () => ({
  ordenesActivas: [{ msg: 'Aqui las ordenes activas' }],
  ordenesSemana: [],
  ordenNuevaTelas: [],
  dolar: 0,
  ordenesLength: 0,
  peso: 0,
  dataProductos: [],
  dataProductosSelect: [],
  dataCustomers: [],
  dataTallas: [],
  dataTelas: [],
  dataCategories: [],
  customersSelect: [],
})

export const actions = {
  getDataProductos({ commit }, data) {
    commit('dataProductos', data)
  },

  getCustomersSelect({ commit }, data) {
    commit('customersSelect', data)
    console.log('cargamos en customerSelect', data)
  },

  getDataCustomers({ commit }, data) {
    commit('dataCustomers', data)
  },

  getDataTallas({ commit }, data) {
    commit('dataTallas', data)
  },

  getDataTelas({ commit }, data) {
    commit('dataTelas', data)
  },

  getDataCategories({ commit }, data) {
    commit('dataCategories', data)
  },

  getDolar({ commit }, monto) {
    commit('setDolar', monto)
  },

  getPeso({ commit }, monto) {
    commit('setPeso', monto)
  },

  async getOrdenesActivas({ commit }, id_empleado) {
    await axios
      .get(`${this.$config.API}/table/ordenes-activas/${id_empleado}`)
      .then((res) => {
        commit('setOrdenesActivas', res.data)
        const len = parseInt(res.data.items.length) + 1
        commit('setOrdenesLength', len)
      })
  },

  async getOrdenesSemana({ commit }, data) {
    let newDate

    if (data.fecha === undefined) {
      newDate = new Date().toLocaleDateString('sv-SE')
    } else {
      newDate = data.fecha
    }

    await axios
      .get(`${this.$config.API}/ordenes-reporte-semanal/${newDate}`)
      .then((res) => {
        commit('setOrdenesSemana', res.data)
        const len = parseInt(res.data.items.length) + 1
        commit('setOrdenesLength', len)
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
      return objeto.categories.some((categoria) => categoria.id === 91)
    })
  },

  getProductsCustom(state) {
    return state.dataProductos.filter((objeto) => {
      return objeto.categories.some((categoria) => categoria.id != 91)
    })
  },
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
