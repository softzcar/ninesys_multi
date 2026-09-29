// Persiste la conversación del Asistente IA en sessionStorage (por pestaña):
// sobrevive a la navegación y a recargar, se pierde al cerrar la pestaña.
// La conversación pertenece a `${idEmpresa}:${id_empleado}`: si cambia la empresa
// o se cierra sesión, se borra (evita mostrar datos de clientes de otra empresa).
// Debe registrarse DESPUÉS de vuex-persist.js (que restaura el login).

const KEY = 'ninesys_aichat_v1'
const MAX_MESSAGES = 60

export default ({ store }) => {
  const ownerOf = () => {
    const login = store.state.login || {}
    if (!login.access || !login.idEmpresa) return null
    const idEmpleado = (login.dataUser && login.dataUser.id_empleado) || 0
    return `${login.idEmpresa}:${idEmpleado}`
  }

  const clearStorage = () => {
    try {
      sessionStorage.removeItem(KEY)
    } catch (e) {}
  }

  // 1. Restaurar solo si la conversación guardada es del usuario/empresa actual.
  const owner = ownerOf()
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (owner && saved && saved.owner === owner) {
        store.commit('aichat/hydrate', saved)
      } else {
        clearStorage()
      }
    }
  } catch (e) {
    clearStorage()
  }
  store.commit('aichat/setOwner', owner)

  // 2. Guardar tras cada cambio del módulo.
  store.subscribe((mutation, state) => {
    if (!mutation.type.startsWith('aichat/')) return
    const s = state.aichat
    if (!s.owner) {
      clearStorage()
      return
    }
    try {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          owner: s.owner,
          isOpen: s.isOpen,
          width: s.width,
          messages: s.messages.slice(-MAX_MESSAGES),
        })
      )
    } catch (e) {}
  })

  // 3. Cambio de empresa/usuario o cierre de sesión → conversación nueva.
  store.watch(ownerOf, (nuevo, anterior) => {
    if (nuevo === anterior) return
    store.commit('aichat/reset')
    store.commit('aichat/setOpen', false)
    store.commit('aichat/setOwner', nuevo)
  })
}
