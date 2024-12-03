<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="
                    dataUser.departamento === 'Comercialización' ||
                    dataUser.departamento === 'Administración'
                "
            >
                <b-container
                    v-if="this.dataUser.departamento === 'Comercialización'"
                >
                    <b-row>
                        <b-col>
                            <h1 class="mb-4">{{ titulo }}</h1>
                            <b-overlay :show="overlay" spinner-small>
                                <b-table
                                    ref="table"
                                    responsive
                                    small
                                    striped
                                    hover
                                    :items="dataTable.items"
                                    :fields="dataTable.fields"
                                >
                                    <template #cell(_id)="data">
                                        <linkSearch :id="data.item._id" />
                                    </template>

                                    <template #cell(vinculada)="data">
                                        <div
                                            v-for="(
                                                item, index
                                            ) in dataTable.vinculadas"
                                            v-bind:key="index"
                                        >
                                            <div
                                                v-if="
                                                    item.id_father ===
                                                    data.item._id
                                                "
                                            >
                                                <span class="floatme">
                                                    <linkSearch
                                                        :id="item.id_child"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </template>
                                </b-table>
                            </b-overlay>
                        </b-col>
                    </b-row>
                </b-container>
            </div>

            <div v-else>
                <accessDenied />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
import axios from "axios"

export default {
    data() {
        return {
            overlay: true,
            titulo: "Reporte General de ordenes",
            dataTable: [],
        }
    },

    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },

    methods: {
        async getOrdenes() {
            console.log("vamos a cargar las ordenes")
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/comercializacion/ordenes/reporte/`)
                .then((resp) => {
                    this.dataTable = resp.data
                    this.overlay = false
                })
        },
    },

    mounted() {
        this.getOrdenes()
    },
}
</script>
