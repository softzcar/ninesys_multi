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
                observaciones: "",
                pago_total: "0",
                pago_abono: "0",
                pago_descuento: "0",
            },
        ],
        diseno: [{ tipo: "" }],
        productos: [],
    },
})

export const mutations = {
    setOrden(state, value) {
        state.orden = value
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
    async getOrden({ commit }, id) {
        await this.$axios
            .get(`${this.$config.API}/buscar/${id}`)
            .then((resp) => {
                commit("setOrden", resp.data)
                return resp.data
            })
    },
}
