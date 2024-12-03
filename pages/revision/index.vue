<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="
                    dataUser.departamento === 'Administración' ||
                    dataUser.departamento === 'Revisión'
                "
            >
                <b-overlay :show="overlay" spinner-small>
                    <div v-if="prodSize < 1">
                        <b-container>
                            <b-row>
                                <b-col>
                                    <b-alert
                                        :show="showAlert"
                                        variant="warning"
                                    >
                                        <p>No hay nada para revisar</p>
                                    </b-alert>
                                </b-col>
                            </b-row>
                        </b-container>
                    </div>

                    <div v-else>
                        <b-container fluid>
                            <b-row>
                                <b-col> <h1>REVISIÖN</h1> </b-col>
                            </b-row>
                            <b-row>
                                <b-col>
                                    <b-table
                                        stacked
                                        responsive
                                        small
                                        striped
                                        hover
                                        :items="productos"
                                        :fields="fields"
                                    >
                                        <template #cell(id_orden)="data">
                                            <linkSearch
                                                :id="data.item.id_orden"
                                            />
                                        </template>
                                        <template #cell(estatus)="data">
                                            <revision-select-estatus
                                                :item="data.item"
                                            />
                                        </template>
                                    </b-table>
                                </b-col>
                            </b-row>
                        </b-container>
                    </div>
                </b-overlay>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios"
import { mapState } from "vuex"

export default {
    data() {
        return {
            overlay: true,
            showAlert: false,
            productos: [],
            fields: [
                {
                    key: "id_orden",
                    label: "Orden",
                },
                {
                    key: "producto",
                    label: "Producto",
                },
                {
                    key: "cantidad",
                    label: "Cantidad",
                },
                {
                    key: "empleado",
                    label: "Empleado",
                },
                {
                    key: "estatus",
                    label: "Estatus",
                },
            ],
        }
    },

    computed: {
        ...mapState("login", ["dataUser", "access"]),

        prodSize() {
            let show
            let l = this.productos.length
            if (l.length) {
                this.showAlert = false
            } else {
                this.showAlert = true
            }

            return l
        },
    },

    mounted() {
        this.getProducts().then(() => (this.overlay = false))
    },

    methods: {
        async getProducts() {
            await this.$axios
                .get(`${this.$config.API}/revision/trabajos`)
                .then((resp) => {
                    this.productos = resp.data.items
                })
        },
    },
}
</script>

<style scoped>
table th div {
    /* font-size: 50% !important; */
    color: red !important;
}
</style>
