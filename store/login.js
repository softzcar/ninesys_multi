export const state = () => ({
    currentComponent: null,
    currentDepartament: "",
    currentDepartamentId: null,
    dataUser: [],
    dataEmpresa: [],
    departamentos: [],
    modulos: [],
    empleado: [0, 23],
    idEmpresa: 0,
    access: false,
    loading: true,
    activo: false,
})

export const mutations = {
    scurrentDepartamentId(state, data) {
        state.currentDepartamentId = data
    },
    scurrentDepartament(state, data) {
        state.currentDepartament = data
    },
    setCurrentComponent(state, data) {
        state.currentComponent = data
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
            return {
                value: el.id,
                text: el.nombre,
                modulo: el.modulo,
            }
        })
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
