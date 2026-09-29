// Estado del Asistente IA (panel lateral derecho). Vive en Vuex para que la
// conversación sobreviva a la navegación; plugins/aichat-persist.client.js lo
// guarda en sessionStorage (por pestaña) y lo borra al cambiar de empresa/usuario.

export const MIN_WIDTH = 320
export const DEFAULT_WIDTH = 440

export const state = () => ({
  messages: [], // { sender: 'user' | 'bot', text, images: [{url, caption}], time, error }
  isOpen: false,
  width: DEFAULT_WIDTH,
  isLoading: false,
  owner: null, // `${idEmpresa}:${id_empleado}` dueño de la conversación
})

export const mutations = {
  setOpen(state, value) {
    state.isOpen = !!value
  },
  toggle(state) {
    state.isOpen = !state.isOpen
  },
  setWidth(state, width) {
    state.width = Math.max(MIN_WIDTH, Math.round(width))
  },
  setLoading(state, value) {
    state.isLoading = !!value
  },
  addMessage(state, msg) {
    state.messages.push(msg)
  },
  reset(state) {
    state.messages = []
    state.isLoading = false
  },
  setOwner(state, owner) {
    state.owner = owner
  },
  hydrate(state, saved) {
    state.messages = Array.isArray(saved.messages) ? saved.messages : []
    state.isOpen = !!saved.isOpen
    if (saved.width) state.width = Math.max(MIN_WIDTH, saved.width)
  },
}

const now = () =>
  new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

export const actions = {
  /**
   * Envía una consulta al asistente (POST /ai/chat, proxy al agente IA).
   * No se sobreescribe Authorization: el interceptor de axios adjunta el JWT,
   * del que la API deriva la empresa.
   */
  async send({ state, commit }, { query, apiUrl }) {
    const text = (query || '').trim()
    if (!text || state.isLoading) return

    // Historial previo (sin el mensaje nuevo), solo texto, últimos 10.
    const history = state.messages
      .filter((m) => !m.error)
      .slice(-10)
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text }))

    commit('addMessage', { sender: 'user', text, images: [], time: now() })
    commit('setLoading', true)
    try {
      const { data } = await this.$axios.post(`${apiUrl}/ai/chat`, { query: text, history })
      if (data && data.success) {
        commit('addMessage', {
          sender: 'bot',
          text: data.response || '',
          images: Array.isArray(data.images) ? data.images : [],
          time: now(),
        })
      } else {
        commit('addMessage', {
          sender: 'bot',
          text: (data && (data.error || data.response)) || 'Error al procesar la consulta',
          images: [],
          time: now(),
          error: true,
        })
      }
    } catch (e) {
      commit('addMessage', {
        sender: 'bot',
        text: 'Error de conexión. Por favor, intenta de nuevo.',
        images: [],
        time: now(),
        error: true,
      })
    } finally {
      commit('setLoading', false)
    }
  },
}
