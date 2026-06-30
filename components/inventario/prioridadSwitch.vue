<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <b-button :variant="variant" @click="changeStatus()">
                <b-icon-asterisk></b-icon-asterisk>
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
            variant: "secondary",
            prioridad: "0",
        }
    },

    watch: {
        'item.prioridad': {
            handler(newVal) {
                const isUrgent = parseInt(newVal) === 1;
                this.prioridad = isUrgent ? "1" : "0";
                this.variant = isUrgent ? "danger" : "secondary";
            },
            immediate: true
        }
    },

    methods: {
        async updatePrioridad() {
            this.overlay = true

            const data = new URLSearchParams()
            data.set("id", this.item.orden)
            data.set("prioridad", this.prioridad)

            await this.$axios
                .post(
                    `${this.$config.API}/inventario-movimientos/update-prioridad`,
                    data
                )
                .then((res) => {
                    // this.resetForm()
                    // this.$bvModal.hide(this.modal)
                })
                .then(() => (this.overlay = false))
        },

        changeStatus() {
            if (this.prioridad == "1") {
                this.prioridad = "0"
                this.variant = "secondary"
            } else {
                this.prioridad = "1"
                this.variant = "danger"
            }
            this.updatePrioridad()
            // this.verify = !this.verify
        },
    },



    props: ["item"],
}
</script>
