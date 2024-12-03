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
                        </b-col>
                    </b-row>

                    <b-row>
                        <b-col md="3" offset-md="9" class="mb-4">
                            <b-form-group
                                label="Seleccione un rago de tiempo"
                                label-for="select-time"
                            >
                                <b-form-select
                                    id="select-time"
                                    v-model="rango"
                                    :options="options"
                                    @change="getOrdenes"
                                ></b-form-select>
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col>
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
            titulo: "Ordenes entregadas",
            dataTable: [],
            rango: "-32 days",
            options: [
                { value: "-32 days", text: "Un mes" },
                { value: "-8 days", text: "Una semana" },
                { value: "-2 days", text: "Un día" },
            ],
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
                .get(
                    `${this.$config.API}/comercializacion/ordenes/reporte/entregadas/${this.rango}`
                )
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
