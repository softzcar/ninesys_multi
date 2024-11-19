export const state = () => ({
  loading: false,
})

export const mutations = {
  setLoading(state, val) {
    state.loading = val
  },
}
