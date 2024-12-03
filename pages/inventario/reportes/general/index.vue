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
                    dataUser.departamento === 'Producción'
                "
            >
                <b-overlay :show="overlay" spinner-small>
                    <b-container
                        fluid
                        v-if="
                            dataUser.departamento === 'Administración' ||
                            dataUser.departamento === 'Producción'
                        "
                    >
                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <inventario-InsumoNuevo @reload="getInsumos" />
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-table
                                    ref="table"
                                    responsive
                                    small
                                    striped
                                    hover
                                    :items="myTable"
                                    :fields="dataTable.fields"
                                >
                                    <template #cell(_id)="data">
                                        <span class="floatme">
                                            <inventario-InsumoEditar
                                                @reload="getInsumos"
                                                :data="data.item"
                                            />
                                        </span>
                                        <span class="floatme">
                                            <b-button
                                                variant="danger"
                                                v-on:click="
                                                    deleteInsumo(data.item._id)
                                                "
                                                ><b-icon icon="trash"></b-icon>
                                                XXX
                                            </b-button>
                                        </span>
                                    </template>
                                </b-table>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-overlay>
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
            titulo: "Gestión de Inventario",
            overlay: true,
            dataTable: [],
        }
    },

    computed: {
        ...mapState("login", ["dataUser", "access"]),
        myTable() {
            return this.dataTable.items
        },
    },

    methods: {
        deleteInsumo(id_emp) {
            this.$confirm(
                `¿Desea Elimiar el insumo ${id_emp} ?`,
                "Eliminar Imsumo",
                "warning"
            )
                .then(() => {
                    this.overlay = true
                    const data = new URLSearchParams()
                    data.set("id", id_emp)

                    axios
                        .post(`${this.$config.API}/insumos/eliminar`, data)
                        .then((res) => {
                            this.getInsumos().then(() => (this.overlay = false))
                        })
                })
                .catch((err) => {
                    console.log("CATCH!!!", err)
                    return false
                })
        },

        reloadData() {
            this.overlay = true
            alert("probando recusrsividad ")
            this.overlay = false
        },

        async getInsumos() {
            await this.$axios
                .get(`${this.$config.API}/inventario`)
                .then((resp) => {
                    this.dataTable = []
                    this.dataTable = resp.data
                    this.overlay = false
                })
        },
    },

    mounted() {
        this.getInsumos().then(() => {
            this.overlay = false
        })
    },
}
</script>
