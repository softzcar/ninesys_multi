<template>
    <div>
        <b-form-checkbox-group
            button-variant="success"
            v-model="selectedOrdnes"
            :options="ordenesCheck"
            stacked
            name="buttons-1"
            buttons
        ></b-form-checkbox-group>
        <pre>
			{{ item }}
		</pre
        >
    </div>
</template>

<script>
import axios from "axios"
export default {
    data() {
        return {
            selectedOrdnes: [],
        }
    },
    computed: {
        ordenesCheck() {
            return this.$store.state.empleados.ordenesAsignadas.map((item) => {
                return {
                    text: item.id_orden,
                    value: item.id_orden,
                }
            })
        },

        ordenes() {
            return this.$store.state.empleados.ordenesAsignadas
        },
    },

    watch: {
        selectedOrdnes() {
            this.postOrdenes()
        },
    },

    methods: {
        saveOrden() {
            alert("save orden")
        },

        async postOrdenes() {
            this.overlay = true
            const data = new URLSearchParams()
            data.set("ordenes", this.selectedOrdnes)
            data.set("id_insumo", this.item._id)
            data.set("id_empleado", this$store.state.login.dataUser.id_empleado)
            data.set(this.item)

            await this.$axios
                .post(`${this.$config.API}/inventario-movimientos/nuevo`, data)
                .then((res) => {
                    this.overlay = false
                    this.pagos = []
                    this.pagos = res.data.data
                    // this.urlLink = res.data.linkdrive
                })
        },
    },

    props: ["item"],
}
</script>
