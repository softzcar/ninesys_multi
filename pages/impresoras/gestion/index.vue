<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div v-if="
                accessModule.accessData.id_modulo === 1 ||
                accessModule.accessData.id_modulo === 3 ||
                accessModule.accessData.id_modulo === 4 ||
                accessModule.accessData.id_modulo === 6 
                
            ">
                <b-overlay :show="overlay" spinner-small>
                    <b-container fluid>
                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <admin-ImpresoraNueva class="mb-4" @reload="getImpresoras" />
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-alert class="mt-4" variant="info" :show="dataTable.items.length === 0 && !overlay">
                                    No se encontraron impresoras registradas en el sistema.
                                </b-alert>
                                <b-table v-if="dataTable.items.length > 0" responsive :fields="dataTable.fields" :items="dataTable.items">
                                    <template #cell(acciones)="data">
                                        <span class="floatme">
                                            <admin-ImpresoraEditar :item="data.item" @reload="getImpresoras" />
                                        </span>
                                        <span class="floatme">
                                            <b-button variant="danger" @click="deleteImpresora(data.item._id)">
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

            <div v-else>
                <accessDenied />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
import mixin from "~/mixins/mixin-login.js";

export default {
    mixins: [mixin],

    data() {
        return {
            titulo: "Gestión de Impresoras",
            overlay: true,
            dataTable: {
                fields: [
                    { key: 'codigo_interno', label: 'Código Interno' },
                    { key: 'marca', label: 'Marca' },
                    { key: 'modelo', label: 'Modelo' },
                    { key: 'ubicacion', label: 'Ubicación' },
                    { key: 'tipo_tecnologia', label: 'Tecnología' },
                    { key: 'estado', label: 'Estado' },
                    { key: 'acciones', label: 'Acciones' }
                ],
                items: []
            }
        }
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
    methods: {
        async getImpresoras() {
            this.overlay = true;
            await this.$axios.get(`${this.$config.API}/impresoras`)
                .then(response => {
                    this.dataTable.items = response.data;
                })
                .catch(error => {
                    console.error('Error al obtener las impresoras:', error);
                    this.$fire({
                        title: "Error",
                        html: "<p>No se pudieron cargar las impresoras.</p>",
                        type: "error",
                    });
                })
                .finally(() => {
                    this.overlay = false;
                });
        },
        deleteImpresora(id) {
            this.$confirm(
                `¿Desea eliminar la impresora?`,
                "Eliminar Impresora",
                "question"
            )
            .then(() => {
                this.overlay = true;
                this.$axios.delete(`${this.$config.API}/impresoras/${id}`)
                    .then(() => {
                        this.$fire({
                            title: "Impresora Eliminada",
                            html: "<p>La impresora ha sido eliminada correctamente.</p>",
                            type: "success",
                        });
                        this.getImpresoras();
                    })
                    .catch(error => {
                        console.error('Error al eliminar la impresora:', error);
                        this.$fire({
                            title: "Error",
                            html: "<p>No se pudo eliminar la impresora.</p>",
                            type: "error",
                        });
                        this.overlay = false;
                    });
            });
        }
    },
    mounted() {
        this.getImpresoras();
    },
}
</script>
