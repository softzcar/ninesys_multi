export default ({ store }) => {
    if (process.client) {
        const STORAGE_KEY = 'ninesys_vuex_v1'

        // Restaurar estado
        const savedState = localStorage.getItem(STORAGE_KEY)
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState)
                console.log('🔄 [VUEX-PERSIST] Restoring store state from localStorage:', JSON.stringify(parsedState.login))

                // Restaurar módulo login
                if (parsedState.login) {
                    // Restauramos campo por campo para evitar sobrescribir con estructura incompatible
                    if (parsedState.login.access !== undefined) store.commit('login/setAccess', parsedState.login.access)
                    if (parsedState.login.token !== undefined) store.commit('login/setToken', parsedState.login.token)
                    if (parsedState.login.dataUser !== undefined) store.commit('login/setDataUser', parsedState.login.dataUser)
                    if (parsedState.login.currentDepartament !== undefined) store.commit('login/scurrentDepartament', parsedState.login.currentDepartament)
                    if (parsedState.login.currentDepartamentId !== undefined) store.commit('login/scurrentDepartamentId', parsedState.login.currentDepartamentId)
                    if (parsedState.login.currentComponent !== undefined) store.commit('login/setCurrentComponent', parsedState.login.currentComponent)
                    if (parsedState.login.currentOrdenProceso !== undefined) store.commit('login/setCurrentOrdenProceso', parsedState.login.currentOrdenProceso)
                    if (parsedState.login.currentMinOrdenProcesoId !== undefined) store.commit('login/setCurrentMinOrdenProcesoId', parsedState.login.currentMinOrdenProcesoId)
                    if (parsedState.login.idEmpresa !== undefined) store.commit('login/setIdEmpresa', parsedState.login.idEmpresa)
                    if (parsedState.login.empleado !== undefined) store.commit('login/setEmpleado', parsedState.login.empleado)
                    if (parsedState.login.departamentos !== undefined) store.commit('login/setDepartamentos', parsedState.login.departamentos)
                    if (parsedState.login.dataEmpresa !== undefined) store.commit('login/setDataEmpresa', parsedState.login.dataEmpresa)
                    if (parsedState.login.datos_personalizacion !== undefined) store.commit('login/setDatosPersonalizacion', parsedState.login.datos_personalizacion)
                    if (parsedState.login.modulos !== undefined) store.commit('login/setModulos', parsedState.login.modulos)
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
                        currentComponent: state.login.currentComponent,
                        currentOrdenProceso: state.login.currentOrdenProceso,
                        currentMinOrdenProcesoId: state.login.currentMinOrdenProcesoId,
                        idEmpresa: state.login.idEmpresa,
                        empleado: state.login.empleado,
                        departamentos: state.login.departamentos,
                        dataEmpresa: state.login.dataEmpresa,
                        datos_personalizacion: state.login.datos_personalizacion,
                        modulos: state.login.modulos
                    }
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
            }
        })
    }
}
