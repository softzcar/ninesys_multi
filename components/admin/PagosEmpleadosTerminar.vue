<template>
    <div>
        <b-overlay :show="overlay">
            <!-- <b-button variant="success" @click="terminarPlanilla" size="lg">Teminar Planilla</b-button> -->
            <b-button variant="info" @click="$emit('reload')" size="lg">
                Pagos Pendientes
            </b-button>
        </b-overlay>
    </div>
</template>

<script>
import axios from "axios"

export default {
    data() {
        return {
            overlay: false,
        }
    },

    methods: {
        async terminar() {
            this.overlay = true
            await this.$axios
                .post(`${this.$config.API}/pagos/terminar-planilla`)
                .then((res) => {
                    this.$emit("reload")
                    this.overlay = false
                })
        },

        terminarPlanilla() {
            this.$confirm(
                `¿Desea Terminar la Planilla de pagos?`,
                "Terminar planilla de pagos",
                "question"
            )
                .then(() => {
                    this.terminar()
                })
                .catch(() => {
                    return false
                })
        },
    },

    props: ["reload"],
}
</script>

<style lang="scss" scoped></style>
