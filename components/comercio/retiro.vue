<template>
    <div>
        <b-button variant="success" @click="$bvModal.show(modal)">
            <b-icon icon="cash-coin"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <h5>Retirar Dinero</h5>
                            <b-table
                                ref="table"
                                responsive
                                small
                                striped
                                :size="size"
                                :items="retiros"
                                :fields="fields"
                            >
                            </b-table>
                        </b-col>
                    </b-row>
                </b-container>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"

export default {
    data() {
        return {
            overlay: true,
            size: "xl",
            imageWidth: "100%",
            imageHeight: "auto",
            title: "Retirar",
            retiros: [],
            fields: [
                {
                    key: "moment",
                    label: "Fecha",
                },
                {
                    key: "monto_retirado",
                    labek: "monto",
                },
                {
                    key: "empleado",
                    labek: "Empleado",
                },
            ],
            reload: false,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        token() {
            const length = 8
            var a =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
                    ""
                )
            var b = []
            for (var i = 0; i < length; i++) {
                var j = (Math.random() * (a.length - 1)).toFixed(0)
                b[i] = a[j]
            }
            return b.join("")
        },

        async getRetiros() {
            await this.$axios.get(`${this.$config.API}/retiros`).then((res) => {
                this.retiros = res.data.retiros
            })
        },
    },

    mounted() {
        this.overlay = true
        this.getRetiros().then(() => (this.overlay = false))
    },
}
</script>
