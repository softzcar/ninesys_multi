<template>
    <div>
        {{ item }}
        <b-form-input style="width: 100px" type="number" min="0" step="1" v-model="orderValue"
            @change="guardarOrdenDepartamento()" :disabled="inputDisabled" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            inputDisabled: false,
            orderValue: this.item.orden_proceso
        }
    },

    methods: {
        async guardarOrdenDepartamento() {
            // VERIFICAR QUE EL NÚMERO INTRODUCIDO ESTE EN EL RANGO
            // const newOrd = parseInt(this.orderValue)

            const data = new URLSearchParams()
            data.set("id_departamento", this.item._id)
            data.set("orden_proceso_cur", this.item.orden_proceso)
            data.set("orden_proceso_new", this.orderValue)

            await this.$axios
                .post(
                    `${this.$config.API}/departamentos/orden-paso`, data)
                .then((res) => {
                    console.log(`Nuevo orden de pasos`, res.data)
                    this.$emit("reload", "true")
                    return res
                })
                .catch((err) => {
                    alert(`Ocurrió un error al conectarse a internet: ${err}`)
                })
                .finally(() => {
                    // this.laoding = false
                })
        },
    },

    props: ['item', 'reload']
}
</script>