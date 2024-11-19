export const state = () => ({
  t: [{ tit: 'Módulo de test' }],
})

export const mutations = {
  setT(state, t) {
    state.t = [...state.t, t]
  },
}
