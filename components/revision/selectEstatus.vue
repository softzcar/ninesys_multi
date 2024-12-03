<template>
    <div>
        <b-form-select
            v-model="selected"
            :options="options"
            size="sm"
            class="mt-3"
            @change="actualizar()"
        ></b-form-select>
    </div>
</template>

<script>
import axios from "axios"

export default {
    name: "WorkspaceJsonSelectEstatus",

    data() {
        return {
            overlay: true,
            options: [
                { value: "Por revisar", text: "Por revisar" },
                { value: "Aprobado", text: "Aprobado" },
                { value: "Rechazado", text: "Rechazado" },
            ],
            selected: this.item.estatus,
        }
    },

    mounted() {},

    methods: {
        async updateEstatus() {
            this.overlay = true
            await this.$axios
                .get(
                    `${this.$config.API}/revision/actualizar-estatus-de-pago/${this.selected}/${this.item.id_pagos}`
                )
                .then((resp) => {
                    // this.urlLink = resp.data.linkdrive
                    this.overlay = false
                })
        },
        actualizar() {
            console.log(`Vamos a actualizar a >>> ${this.selected}`)
            let msg = ""
            let icon = ""
            switch (this.selected) {
                case "Por revisar":
                    msg = "¿Desea dejar revisarlo mas tarde?"
                    icon = "question"
                    break

                case "Aprobado":
                    msg =
                        "¿El producto ha pasado la revisi´on satisfactoriamente?"
                    icon = "success"
                    break

                case "Rechazado":
                    msg = "¿Desea devolver el producto para su arreglo?"
                    icon = "error"
                    break
            }
            this.$confirm(msg, `Terminar Revisión`, icon)
                .then(() => {
                    this.updateEstatus()
                })
                .catch((e) => {
                    this.selected = "Por revisar"
                })
                .finally(() => (this.overlay = false))
        },
    },

    props: ["item"],
}
</script>

<style scoped></style>
