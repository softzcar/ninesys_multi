<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div v-if="dataUser.departamento === 'Administración'">
                <b-overlay :show="overlay" spinner-small>
                    <!-- <pre class="force" style="background-color: darkslategrey">
                        {{ departamentosOrd }}
                    </pre> -->
                    <b-container fluid>
                        <b-row>
                            <b-col offset-lg="8" offset-xl="8">
                                <b-input-group class="mb-4" size="sm">
                                    <b-form-input
                                        id="filter-input"
                                        v-model="filter"
                                        type="search"
                                        placeholder="Filtrar Resultados"
                                    ></b-form-input>

                                    <b-input-group-append>
                                        <b-button
                                            :disabled="!filter"
                                            @click="filter = ''"
                                        >
                                            Limpiar
                                        </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <!-- <inventario-InsumoNuevo @reload="getProducts" /> -->
                                <!-- <products-new :attributescat="prductAttributes" :attributesval="prductAttributesValues"
                                    class="mb-4" @r="getResponseNewProduct" /> -->
                                <admin-departamentosNew
                                    @reload="getDepartamentos()"
                                />
                            </b-col>
                        </b-row>
                        <b-row v-if="departamentosOrd.length > 0">
                            <b-col md="12">
                                <b-row>
                                    <b-col>
                                        <h3>
                                            Arrastre para ordenar los
                                            departamentos
                                        </h3>
                                        <draggable
                                            v-model="departamentosOrd"
                                            @end="actualizarOrden"
                                            tag="ul"
                                            class="list-group"
                                        >
                                            <b-list-group-item
                                                style="cursor: grab"
                                                v-for="(
                                                    departamento, index
                                                ) in departamentosOrd"
                                                :key="index"
                                                class="pb-3 drag-handle d-flex align-items-left"
                                            >
                                                <span
                                                    class="mt-4"
                                                    style="padding-top: 4px"
                                                    >☰</span
                                                >
                                                <h5 class="mt-4">
                                                    <b-badge
                                                        class="ml-4 mr-2"
                                                        variant="primary"
                                                        >{{
                                                            departamento.orden_proceso
                                                        }}</b-badge
                                                    >
                                                </h5>
                                                <span
                                                    class="mt-4"
                                                    style="width: 80%"
                                                    >{{
                                                        departamento.departamento
                                                    }}</span
                                                >

                                                <span class="mt-3">
                                                    <admin-departamentosEdit
                                                        :key="departamento._id"
                                                        :item="departamento"
                                                        @reload="
                                                            getDepartamentos()
                                                        "
                                                    />
                                                </span>
                                                <span class="ml-2 mt-3">
                                                    <admin-departamentosDelete
                                                        @reload="
                                                            getDepartamentos()
                                                        "
                                                        :iddep="
                                                            departamento._id
                                                        "
                                                        :key="departamento._id"
                                                        :nombre="
                                                            departamento.departamento
                                                        "
                                                    />
                                                    <!-- <b-button
                                                        size="sm"
                                                        class="mb-4"
                                                        variant="danger"
                                                    >
                                                        <b-icon
                                                            icon="trash"
                                                        ></b-icon> 
                                                    </b-button>-->
                                                </span>
                                            </b-list-group-item>
                                        </draggable>
                                    </b-col>
                                    <b-col>
                                        <h3>Departamentos fijos</h3>
                                        <b-list-group class="list-group">
                                            <b-list-group-item
                                                v-for="(
                                                    departamento, index
                                                ) in departamentosOrdAdm"
                                                :key="index"
                                                class="pb-3 drag-handle d-flex align-items-left"
                                            >
                                                <span
                                                    class="mt-4"
                                                    style="width: 80%"
                                                    >{{
                                                        departamento.departamento
                                                    }}</span
                                                >

                                                <span class="mt-3">
                                                    <admin-departamentosEdit
                                                        :key="departamento._id"
                                                        :item="departamento"
                                                        @reload="
                                                            getDepartamentos()
                                                        "
                                                    />
                                                </span>
                                                <span class="ml-2 mt-3">
                                                    <b-button
                                                        size="sm"
                                                        class="mb-4"
                                                        variant="danger"
                                                    >
                                                        <b-icon
                                                            icon="trash"
                                                        ></b-icon>
                                                    </b-button>
                                                </span>
                                            </b-list-group-item>
                                        </b-list-group>
                                    </b-col>
                                </b-row>
                            </b-col>
                        </b-row>

                        <b-row v-else>
                            <b-col>
                                <b-alert variant="info" show>
                                    <p>No se encontraron departamentos</p>
                                </b-alert>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-overlay>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import draggable from "vuedraggable";

export default {
    components: { draggable },

    data() {
        return {
            departamentosOrd: [],
            inputDisabled: false,
            perPage: 20,
            currentPage: 1,
            filter: null,
            includedFields: ["departamento", "orden_proceso"],
            titulo: "Gestión de Departamentos",
            overlay: false,
            dataTable: [],
            tmpOptionSelect: null,
            tmpOrden: null,
            fields: [
                /* {
                    key: "_id",
                    label: "ID Departamento",
                    tdClass: "pl-4",
                }, */
                {
                    key: "orden_proceso",
                    label: "Orden proceso",
                },
                {
                    key: "departamento",
                    label: "Departamento",
                },
            ],
            loading: {
                show: false,
                text: "",
            },
        };
    },

    computed: {
        ...mapState("login", ["dataUser", "access", "departamentos"]),
        ...mapGetters("login", ["getDepartamentosSelect"]),
    },

    methods: {
        async updateDepartamentos(dep) {
            // this.overlay = true
            const data = new URLSearchParams();
            data.set("orden_proceso", dep.orden_proceso);
            data.set("id_departamento", dep._id);

            await this.$axios
                .post(`${this.$config.API}/departamentos/orden-paso`, data)
                .then((res) => {
                    console.log("respuesta de actualizar departamento", res);
                    /* this.form.splice(index, 1)
                    this.$fire({
                        title: "Departamento",
                        html: `<p>La asiganción fué eliminada</p>`,
                        type: "success",
                    }) */
                })
                .catch((err) => {
                    this.departamentosOrd = this.departamentos;
                    this.$fire({
                        title: "Error",
                        html: `<p>NO se actualizaron el departamento ${dep.departamento}</p><p>${err}</p>`,
                        type: "danger",
                    });
                })
                .finally(() => {
                    // this.overlay = false
                });
        },

        async actualizarOrden() {
            // Crear un array con el nuevo orden
            const nuevosOrdenes = this.departamentosOrd.map((dep, index) => ({
                _id: dep._id,
                departamento: dep.departamento,
                orden_proceso: index + 1,
            }));

            try {
                this.departamentosOrd = nuevosOrdenes;

                this.departamentosOrd.forEach((el) => {
                    this.updateDepartamentos(el);
                });

                this.getDepartamentos();
            } catch (error) {
                console.error("Error al actualizar orden:", error);
            }
        },

        async getDepartamentos() {
            this.overlay = true;
            await this.$axios
                .get(`${this.$config.API}/departamentos`)
                .then((res) => {
                    this.departamentosOrd = [];
                    this.$store.commit("login/setDepartamentos", res.data);
                    this.departamentosOrd = res.data.filter(
                        (el) => el.asignar_numero_de_paso == 1
                    );
                    this.departamentosOrdAdm = res.data.filter(
                        (el) => el.asignar_numero_de_paso == 0
                    );
                    // this.departamentosOrd = res.data
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error cargando los departamentos",
                        html: `<p>${err}</p>`,
                        type: "warning",
                    });
                })
                .finally(() => {
                    this.overlay = false;
                });
        },

        /* ANTERIOR DE INSUMOS DESDEAQUÍ */
        deleteProduct(id) {
            this.$confirm(
                `¿Desea Elimiar el insumo ${id} ?`,
                "Eliminar Imsumo",
                "warning"
            )
                .then(() => {
                    this.overlay = true;
                    // const data = new URLSearchParams()
                    // data.set('id', id)

                    this.$axios
                        .delete(`${this.$config.API}/products/${id}`)
                        .then((res) => {
                            let msgDat;
                            if (parseInt(res.data.cantidad_prod) === 0) {
                                msgDat = {
                                    icon: "success",
                                    msg: "El producto ha sido eliminado",
                                };
                                this.getProducts();
                            } else {
                                msgDat = {
                                    icon: "warning",
                                    msg: "El producto tiene ordenes asociadas a él y no se puede eliminar",
                                };
                            }

                            this.$fire({
                                title: "Eliminar Producto",
                                html: `<p>${msgDat.msg}</p>`,
                                type: msgDat.icon,
                            });
                        })
                        .catch((err) => {
                            this.$fire({
                                title: "Eliminar Producto",
                                html: `<p>Ocurrió un error al eliminar el productos</p><p>${err}</p>`,
                                type: msgDat.icon,
                            });
                        })
                        .finally(() => (this.overlay = false));
                })
                .catch((err) => {
                    console.log("CATCH!!!", err);
                    return false;
                });
        },
    },

    mounted() {
        this.getDepartamentos();
        /* this.getProductsAttributes()
        this.getProducts().then(() => {
            console.log(
                `vamos a crear los datos de los clientes con`,
                this.dataTable
            )
            this.overlay = false
        }) */
    },
};
</script>
