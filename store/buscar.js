import axios from "axios"

export const state = () => ({
    orden: {
        customer: {
            nombre: "",
            direccion: "",
            email: "",
            cedula: "",
            telefono: "",
        },
        orden: [
            {
                _id: "0",
                status: "",
                cliente_nombre: "",
                cliente_cedula: "",
                fecha_inicio: "",
                fecha_entrega: "",
                pago_total: "0",
                pago_abono: "0",
                pago_descuento: "0",
            },
        ],
        diseno: [{ tipo: "" }],
        productos: [],
    },
    observaciones: ''
})

export const mutations = {
    setObservaciones(state, value) {
        state.observaciones = value
    },
    setOrden(state, value) {
        state.orden = value
    },
    clearData(state) {
        state.orden = {
            customer: {
                nombre: "",
                direccion: "",
                email: "",
                cedula: "",
                telefono: "",
            },
            orden: [
                {
                    _id: "0",
                    status: "",
                    cliente_nombre: "",
                    cliente_cedula: "",
                    fecha_inicio: "",
                    fecha_entrega: "",
                    pago_total: "0",
                    pago_abono: "0",
                    pago_descuento: "0",
                },
            ],
            diseno: [{ tipo: "" }],
            productos: [],
        };
        state.observaciones = '';
    },
    clearOrden(state) {
        state.orden = [
            {
                _id: "0",
                status: "",
                cliente_nombre: "",
                cliente_cedula: "",
                fecha_inicio: "",
                fecha_entrega: "",
                observaciones: "",
                pago_total: "0",
                pago_abono: "0",
                pago_descuento: "0",
            },
        ]
    },
}

export const getters = {
    resOrden(state) {
        return state.orden
    },
}
export const actions = {
    async getObservaciones({ commit }, id) {
        const url = `${this.$config.API}/ordenes-observaciones/${id}`
        
        await this.$axios.get(url).then(res => {
            if (res.data && res.data.length > 0) {
                commit("setObservaciones", res.data[0].observaciones)
            }
        }).catch(err => {
            console.error(err)
        })
    },
    async getOrden({ commit }, id) {
        await this.$axios
            .get(`${this.$config.API}/buscar/${id}`)
            .then((resp) => {
                commit("setOrden", resp.data)
                return resp.data
            })
    },
}
