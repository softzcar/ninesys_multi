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
                                    :products="products"
                                    :departamentos="departamentos"
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
                                        <span class="floatme">
                                            <admin-CatalogoInsumosProductosEditar
                                                :item="data.item"
                                                :products="products"
                                                :departamentos="departamentos"
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
            products: [],
            departamentos: [],
            fields: [
                {
                    key: "nombre",
                    label: "Nombre",
                },
                {
                    key: "product_name",
                    label: "Producto",
                },
                {
                    key: "departamento_name",
                    label: "Departamento",
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
                const [
                    catalogoRes,
                    productsRes,
                    depsRes,
                ] = await Promise.all([
                    this.$axios.get(`${this.$config.API}/catalogo-insumos-productos`),
                    this.$axios.get(`${this.$config.API}/products`),
                    this.$axios.get(`${this.$config.API}/departamentos`),
                ]);

                this.dataTable = catalogoRes.data;
                this.products = productsRes.data;
                this.departamentos = depsRes.data;

                // Enriquecer los datos con nombres
                this.dataTable.data = this.dataTable.data.map(item => ({
                    ...item,
                    product_name: this.products.find(p => p.cod === item.id_product)?.name || 'N/A',
                    departamento_name: this.departamentos.find(d => d._id === item.id_departamento)?.departamento || 'N/A',
                }));

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
                            this.$bvToast.toast('Error al eliminar el insumo del catálogo', {
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