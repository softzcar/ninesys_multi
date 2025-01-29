<template>
    <div>
        <b-button @click="openModal" variant="info">
            <b-icon icon="info-circle"></b-icon>
        </b-button>

        <b-modal :id="modal" :title="title" hide-footer size="xl">
            <b-overlay :show="overlay" spinner-small>
                <!-- <buscar-resultadoModal :id="id" /> -->
                <b-table striped :fields="fields" :items="dataTable.items">
                    <template #cell(moment)="data">
                        {{ formatTimestampDate(data.item.moment) }}
                    </template>
                </b-table>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"
import mixin from "~/mixins/mixins.js"

export default {
    data() {
        return {
            overlay: false,
            dataTable: [],
            fields: [
                {
                    key: "moment",
                    label: "Fecha",
                },
                {
                    key: "id_orden",
                    label: "Orden",
                },
                {
                    key: "cantidad",
                    label: "Cantidad",
                },
            ],
        }
    },

    computed: {
        title: function () {
            return `${this.curritem.categoria_tienda} ${this.curritem.tela} talla ${this.curritem.talla}`
        },

        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        openModal() {
            this.detallesItem().then(() => this.$bvModal.show(this.modal))
        },

        async detallesItem() {
            this.overlay = true

            const data = new URLSearchParams()
            data.set("id_woo", this.curritem.id_woo)
            data.set("talla", this.curritem.talla)

            await this.$axios
                .post(`${this.$config.API}/lotes/get-detalles`, data) // crear en la api
                .then((res) => {
                    this.dataTable = res.data
                    console.log(`respueta de /lotes/get-detalles`, res.data)
                    //   this.resetForm()
                    //   this.$bvModal.hide(this.modal)
                })
                .finally(() => {
                    this.overlay = false
                })
        },
    },

    mounted() {
        // Realizar acciones aqui al abrir el modal
        console.log(`modal ${this.modal}`, this.$bvModal)
    },

    mixins: [mixin],

    props: ["name", "curritem"],
}
</script>
