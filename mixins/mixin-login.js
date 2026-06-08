export default {
    computed: {
        accessModule() {            
            const currDep = this.$store.state.login.currentDepartamentId
            const empleado = this.$store.state.login.empleado
            const deps = empleado?.departamentos

            if (!empleado || !Array.isArray(deps)) {
                return { access: null, currDep: null, accessData: {} };
            }

            let response = {
                access: null,
                currDep: null,
                accessData: {
                    id: null,
                    id_modulo: null,
                    modulo: null,
                    nombre: null,
                }
            }

            if (currDep === null) {
                return response
            }

            let access = deps.filter(el => parseInt(el.id) === parseInt(currDep))

            response.access = access.length
            response.currDep = currDep

            if (access.length) {
                response.accessData = access[0]
            }
            
            console.log('accessModule', response);
            

            return response
        },
    },
}