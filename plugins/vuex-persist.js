export default ({ store }) => {
    if (process.client) {
        const STORAGE_KEY = 'ninesys_vuex_v1'

        // Restaurar estado
        const savedState = localStorage.getItem(STORAGE_KEY)
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState)

                // Restaurar módulo login
                if (parsedState.login) {
                    // Restauramos campo por campo para evitar sobrescribir con estructura incompatible
                    if (parsedState.login.access) store.commit('login/setAccess', parsedState.login.access)
                    if (parsedState.login.token) store.commit('login/setToken', parsedState.login.token)
                    if (parsedState.login.dataUser) store.commit('login/setDataUser', parsedState.login.dataUser)
                    if (parsedState.login.currentDepartament) store.commit('login/scurrentDepartament', parsedState.login.currentDepartament)
                    if (parsedState.login.currentDepartamentId) store.commit('login/scurrentDepartamentId', parsedState.login.currentDepartamentId)
                    if (parsedState.login.idEmpresa) store.commit('login/setIdEmpresa', parsedState.login.idEmpresa)
                    if (parsedState.login.empleado) store.commit('login/setEmpleado', parsedState.login.empleado)
                    if (parsedState.login.departamentos) store.commit('login/setDepartamentos', parsedState.login.departamentos)
                    if (parsedState.login.dataEmpresa) store.commit('login/setDataEmpresa', parsedState.login.dataEmpresa)
                    if (parsedState.login.datos_personalizacion) store.commit('login/setDatosPersonalizacion', parsedState.login.datos_personalizacion)
                }
            } catch (e) {
                console.error('Error restaurando estado Vuex:', e)
                localStorage.removeItem(STORAGE_KEY)
            }
        }

        // Guardar estado en cada mutación relevante
        store.subscribe((mutation, state) => {
            // Solo guardar si la mutación es del módulo login
            if (mutation.type.startsWith('login/')) {
                const stateToSave = {
                    login: {
                        access: state.login.access,
                        token: state.login.token,
                        dataUser: state.login.dataUser,
                        currentDepartament: state.login.currentDepartament,
                        currentDepartamentId: state.login.currentDepartamentId,
                        idEmpresa: state.login.idEmpresa,
                        empleado: state.login.empleado,
                        departamentos: state.login.departamentos,
                        dataEmpresa: state.login.dataEmpresa,
                        datos_personalizacion: state.login.datos_personalizacion
                    }
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
            }
        })
    }
}
