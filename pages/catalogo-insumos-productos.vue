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
                                <admin-CatalogoInsumosProductosNuevo
                                    @reload="getCatalogoInsumosProductos"
                                />
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
                                        <template v-if="data.item.nombre.toLowerCase() !== 'tinta'">
                                            <span class="floatme">
                                                <admin-CatalogoInsumosProductosEditar
                                                    :item="data.item"
                                                    @reload="getCatalogoInsumosProductos"
                                                />
                                            </span>
                                            <span class="floatme">
                                                <b-button
                                                    variant="danger"
                                                    v-on:click="deleteCatalogoInsumoProducto(data.item.nombre, data.item._id)"
                                                >
                                                    <b-icon icon="trash"></b-icon>
                                                </b-button>
                                            </span>
                                        </template>
                                        <template v-else>
                                            <span class="badge badge-secondary p-2">
                                                <b-icon icon="lock-fill" class="mr-1"></b-icon> Bloqueado
                                            </span>
                                        </template>
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
            titulo: "Catálogo de Insumos de Productos",
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
        };
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
    methods: {
        async getCatalogoInsumosProductos() {
            this.overlay = true;
            try {
                const catalogoRes = await this.$axios.get(`${this.$config.API}/catalogo-insumos-productos`);
                this.dataTable = catalogoRes.data;
                this.overlay = false;
            } catch (error) {
                this.overlay = false;
                console.error("Error cargando los datos:", error);
                this.$bvToast.toast("No se pudieron cargar los datos", {
                  variant: "danger",
                });
            }
        },

        deleteCatalogoInsumoProducto(name, id) {
            this.$confirm(
                `¿Desea Eliminar el insumo ${name} del catálogo?`,
                "Eliminar Insumo del Catálogo",
                "warning"
            )
                .then(() => {
                    this.overlay = true;
                    const data = new URLSearchParams();
                    data.set("id", id);

                    this.$axios
                        .post(`${this.$config.API}/catalogo-insumos-productos/eliminar`, data)
                        .then((res) => {
                            this.getCatalogoInsumosProductos().then(() => (this.overlay = false));
                        })
                        .catch(err => {
                            this.overlay = false;
                            console.error(`Error al eliminar el insumo del catálogo: ${err}`);
                            const message = err?.response?.data?.message || 'Error al eliminar el insumo del catálogo';
                            this.$bvToast.toast(message, {
                                title: 'Error',
                                variant: 'danger',
                                solid: true
                            });
                        });
                })
                .catch((err) => {
                    console.log("CATCH!!!", err);
                    return false;
                });
        },
    },
    mounted() {
        this.getCatalogoInsumosProductos();
    },
};
</script>