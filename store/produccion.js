import axios from 'axios'

export const state = () => ({
  ordenesActivas: [],
  loteDetalles: [],
  dataPorcentaje: [],
  ordenesProgressbar: [],
})

export const mutations = {
  setDataPorcentaje(state, data) {
    state.dataPorcentaje = data
  },
  setOrdenesActivas(state, disenos) {
    state.ordenesActivas = disenos
  },
  setLoteDetalles(state, detalles) {
    state.loteDetalles = detalles
  },
  setOrdenesProgressbar(state, ordenes) {
    state.ordenesProgressbar = ordenes
  },
}

export const actions = {
  async getPorcentaje2({ commit }, id_orden) {
    this.overlay = true
    await axios
      .get(`${this.$config.API}/produccion/progressbar/${id_orden}`)
      .then((res) => {
        commit('setDataPorcentaje', res.data)
        /* this.value = res.data.porcentaje
          this.paso = res.data.paso
          this.selected = res.data.paso
          this.pasoActual()
          this.overlay = false */
      })
      .catch((err) => {
        console.error(
          'Error al obtener los datos del servidor para prgressBar',
          err
        )
        this.overlay = false
      })
  },

  async getOrdenesActivas({ commit }) {
    await axios.get(`${this.$config.API}/asignacion/ordenes`).then((res) => {
      commit('setOrdenesActivas', res.data)
    })
  },
}
