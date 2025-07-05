export const state = () => ({
    currentComponent: null,
    currentDepartament: "",
    currentDepartamentId: null,
    currentOrdenProceso: null,
    currentMinOrdenProcesoId: null,
    dataUser: [],
    dataEmpresa: [],
    departamentos: [],
    tasas: { dolar: 1 },
    modulos: [],
    empleado: [0, 23],
    idEmpresa: 0,
    access: false,
    loading: true,
    activo: false,
})

export const mutations = {
    setTasa(state, { moneda, valor }) {
        state.tasas = { ...state.tasas, [moneda]: valor }
    },
    scurrentDepartamentId(state, data) {
        state.currentDepartamentId = data
    },
    scurrentDepartament(state, data) {
        state.currentDepartament = data
        state.dataUser.departamento = data
    },
    setCurrentComponent(state, data) {
        state.currentComponent = data
    },
    setCurrentMinOrdenProcesoId(state, data) {
        state.currentComponent = data
    },
    setCurrentOrdenProceso(state, data) {
        if (data === null) {
            state.currentOrdenProceso = 1
        } else {
            state.currentOrdenProceso = data
        }
    },
    setEmpleado(state, data) {
        state.empleado = data
    },
    setCurrentComponent(state, data) {
        state.currentComponent = data
    },
    setIdEmpresa(state, data) {
        state.idEmpresa = data
    },
    setModulos(state, data) {
        state.modulos = data
    },
    setDataEmpresa(state, data) {
        state.dataEmpresa = data
        if (data && data.tipos_de_monedas) {
            const initialTasas = { dolar: 1 } // Siempre iniciamos con dolar en 1
            data.tipos_de_monedas.forEach((tipo) => {
                // Omitimos 'dolar' porque ya está fijado y no debe ser 0
                if (tipo.activo && tipo.moneda !== 'dolar') {
                    // Mantenemos el valor si ya existe, si no, lo inicializamos en 0
                    initialTasas[tipo.moneda] = state.tasas[tipo.moneda] || 0
                }
            })
            state.tasas = initialTasas
        }
    },
    setDepartamentos(state, data) {
        state.departamentos = data
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
export const getters = {
    getModulosSelect(state) {
        let modTmp = state.modulos.map((mod) => {
            return {
                value: mod._id,
                text: mod.modulo,
                modulo: mod.modulo,
                orden_proceso: mod.orden_proceso,
            }
        })

        modTmp.unshift({
            value: null,
            text: "Seleccione un módulo",
        })

        return modTmp
    },

    getDepartamentosEmpleadoSelect(state) {
        return state.empleado.departamentos.map((el) => {
            console.log('getDepartamentosEmpleadoSelect', el);
            
            return {
                value: el.id,
                text: el.nombre,
                modulo: el.modulo,
                orden_proceso: el.orden_proceso,
                orden_proceso_min: el.orden_proceso_min,
            }
        })
    },
    
    getDepartamentosOrdenProceso(state) {
        if (state.currentDepartamentId && state.departamentos.length) {
            return state.departamentos.filter(el => el._id === state.currentDepartamentId).map((el) => {
                return el.orden_proceso
            })
        } else {
            return 0
        }
    },

    getDepartamentosSelect(state) {
        let tmpOptions = state.departamentos.map((el) => {
            return {
                value: el._id,
                text: `${el.departamento}`,
            }
        })

        tmpOptions.unshift({
            value: null,
            text: "Seleccione un departamento",
        })

        return tmpOptions
    },
}
