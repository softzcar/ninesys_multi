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
                    <b-container>
                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <admin-TallasNuevo @reload="getTallas" />
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
                                            <AdminTallasEditar
                                                :item="data.item"
                                                @reload="getTallas"
                                            />
                                        </span>
                                        <span class="floatme">
                                            <b-button
                                                variant="danger"
                                                v-on:click="
                                                    deleteTalla(
                                                        data.item.name,
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
            titulo: "Gestión de Tallas",
            overlay: true,
            dataTable: [],
            fields: [
                {
                    key: "name",
                    label: "Talla",
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
        async getTallas() {
            this.overlay = true;
            await this.$axios.get(`${this.$config.API}/sizes`).then((resp) => {
                this.dataTable = resp.data
                this.overlay = false
            }).catch(error => {
                this.overlay = false;
                console.error("Error cargando las tallas:", error);
                this.$bvToast.toast("No se pudieron cargar las tallas", {
                  variant: "danger",
                });
            });
        },

        deleteTalla(name, idTalla) {
            this.$confirm(
                `¿Desea Elimiar la talla ${name} ?`,
                "Eliminar Talla",
                "warning"
            )
                .then(() => {
                    this.overlay = true
                    const data = new URLSearchParams()
                    data.set("id", idTalla)

                    this.$axios
                        .post(`${this.$config.API}/sizes/eliminar`, data)
                        .then((res) => {
                            this.getTallas().then(() => (this.overlay = false))
                        })
                        .catch(err => {
                            this.overlay = false;
                            console.error(`Error al eliminar la talla: ${err}`);
                            this.$bvToast.toast('Error al eliminar la talla', {
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
        this.getTallas()
    },
}
</script>
