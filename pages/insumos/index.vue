<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="
                    dataUser.departamento === 'Administración'
                "
            >
                <b-overlay :show="overlay" spinner-small>
                    <b-container>
                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <admin-InsumosNuevo @reload="getInsumos" />
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-table
                                    responsive
                                    :fields="fields"
                                    :items="dataTable.data"
                                >
                                    <template #cell(_id)="data">
                                        <span class="floatme">
                                            <admin-InsumosEditar
                                                :item="data.item"
                                                @reload="getInsumos"
                                            />
                                        </span>
                                        <span class="floatme">
                                            <b-button
                                                variant="danger"
                                                v-on:click="
                                                    deleteInsumo(
                                                        data.item.nombre,
                                                        data.item._id
                                                    )
                                                "
                                            >
                                                <b-icon icon="trash"></b-icon>
                                            </b-button>
                                        </span>
                                    </template>
                                </b-table>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-overlay>
            </div>

            <div v-else><accessDenied /></div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
import axios from "axios"

export default {
    data() {
        return {
            titulo: "Gestión de Insumos",
            overlay: true,
            dataTable: [],
            fields: [
                {
                    key: "nombre",
                    label: "Nombre",
                },
                {
                    key: "_id",
                    label: "Acciones",
                },
            ],
        }
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
    methods: {
        async getInsumos() {
            this.overlay = true;
            await this.$axios.get(`${this.$config.API}/catalogo-insumos-productos`).then((resp) => {
                this.dataTable = {data: resp.data}
                this.overlay = false
            }).catch(error => {
                this.overlay = false;
                console.error("Error cargando los insumos:", error);
                this.$bvToast.toast("No se pudieron cargar los insumos", {
                  variant: "danger",
                });
            });
        },

        deleteInsumo(nombre, idInsumo) {
            this.$confirm(
                `¿Desea Eliminar el insumo ${nombre} ?`,
                "Eliminar Insumo",
                "warning"
            )
                .then(() => {
                    this.overlay = true
                    const data = new URLSearchParams()
                    data.set("id", idInsumo)

                    this.$axios
                        .post(`${this.$config.API}/catalogo-insumos-productos/eliminar`, data)
                        .then((res) => {
                            this.getInsumos().then(() => (this.overlay = false))
                        })
                        .catch(err => {
                            this.overlay = false;
                            console.error(`Error al eliminar el insumo: ${err}`);
                            this.$bvToast.toast('Error al eliminar el insumo', {
                                title: 'Error',
                                variant: 'danger',
                                solid: true
                            });
                        })
                })
                .catch((err) => {
                    console.log("CATCH!!!", err)
                    return false
                })
        },
    },
    mounted() {
        this.getInsumos()
    },
}
</script>