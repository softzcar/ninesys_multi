<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="dataUser.departamento === 'Administración' || dataUser.departamento === 'Producción'"
            >
                <b-overlay :show="overlay" spinner-small>
                    <b-container>
                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <admin-AtributosNuevo @reload="getAtributos" />
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
                                            <admin-AtributosEditar
                                                :item="data.item"
                                                @reload="getAtributos"
                                            />
                                        </span>
                                        <span class="floatme">
                                            <b-button
                                                variant="danger"
                                                v-on:click="deleteAtributo(data.item.name, data.item._id)"
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
import { mapState } from "vuex";

export default {
    data() {
        return {
            titulo: "Gestión de Atributos de Productos",
            overlay: true,
            dataTable: [],
            fields: [
                {
                    key: "name",
                    label: "Atributo",
                },
                {
                    key: "_id",
                    label: "Acciones",
                },
            ],
        };
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
    methods: {
        async getAtributos() {
            this.overlay = true;
            await this.$axios.get(`${this.$config.API}/products-attributes`).then((resp) => {
                this.dataTable = resp.data;
                this.overlay = false;
            }).catch(error => {
                this.overlay = false;
                console.error("Error cargando los atributos:", error);
                this.$bvToast.toast("No se pudieron cargar los atributos", {
                  variant: "danger",
                });
            });
        },

        deleteAtributo(name, idAtributo) {
            this.$confirm(
                `¿Desea Eliminar el atributo ${name} ?`,
                "Eliminar Atributo",
                "warning"
            )
                .then(() => {
                    this.overlay = true;
                    const data = new URLSearchParams();
                    data.set("id", idAtributo);

                    this.$axios
                        .post(`${this.$config.API}/products-attributes/eliminar`, data)
                        .then((res) => {
                            this.getAtributos().then(() => (this.overlay = false));
                        });
                })
                .catch((err) => {
                    console.log("CATCH!!!", err);
                    return false;
                });
        },
    },
    mounted() {
        this.getAtributos();
    },
};
</script>
