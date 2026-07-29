<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div v-if="
                dataUser.departamento === 'Administración' ||
                dataUser.departamento === 'Producción'
            ">
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
                                <b-table responsive :fields="fields" :items="dataTable.data">
                                    <template #cell(_id)="data">
                                        <span class="floatme">
                                            <AdminTallasEditar :item="data.item" @reload="getTallas" />
                                        </span>
                                        <span class="floatme">
                                            <b-button variant="danger" v-on:click="
                                                deleteTalla(
                                                    data.item.name,
                                                    data.item._id
                                                )
                                                ">
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
                    key: "variation_percentage",
                    label: "Variación (%)",
                    sortable: true,
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

        async deleteTalla(name, idTalla) {
            this.overlay = true;
            let uso = null;
            try {
                const resp = await this.$axios.get(`${this.$config.API}/sizes/${idTalla}/uso`);
                uso = resp.data;
            } catch (err) {
                console.error("Error consultando el uso de la talla:", err);
            } finally {
                this.overlay = false;
            }

            const mensaje = this.mensajeConfirmacionEliminar(name, uso);

            this.$confirm(mensaje, "Eliminar Talla", uso && uso.total > 0 ? "warning" : "question")
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

        mensajeConfirmacionEliminar(name, uso) {
            if (!uso || uso.total === 0) {
                return `¿Desea eliminar la talla "${name}"? No tiene ningún producto, orden ni presupuesto asociado.`;
            }

            const detalles = [];
            if (uso.ordenes_productos > 0) detalles.push(`${uso.ordenes_productos} línea(s) de producto en órdenes`);
            if (uso.presupuestos_productos > 0) detalles.push(`${uso.presupuestos_productos} línea(s) en presupuestos`);
            if (uso.eficiencia_teorica > 0) detalles.push(`${uso.eficiencia_teorica} registro(s) de eficiencia teórica`);
            if (uso.insumos_asignados > 0) detalles.push(`${uso.insumos_asignados} asignación(es) de insumos en la Ficha Técnica`);

            return `⚠️ La talla "${name}" está en uso: ${detalles.join(", ")}.\n\n`
                + `Si la elimina, dejará de estar disponible para nuevas asignaciones, pero el historial existente se mantendrá intacto.\n\n`
                + `Si solo quiere corregir el nombre o el porcentaje de variación, es mejor usar "Editar" en vez de eliminar.\n\n`
                + `¿Desea continuar con la eliminación?`;
        },
    },
    mounted() {
        this.getTallas()
    },
}
</script>
