<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div v-if="dataUser.departamento === 'Administración'">
                <b-overlay :show="overlay" spinner-small>
                    <b-container>
                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <p class="text-muted">
                                    Gestiona las monedas que tu empresa utiliza para transacciones, y los métodos de pago disponibles para cada una.
                                    <strong>Nota:</strong> la moneda base de la empresa no puede eliminarse.
                                </p>
                            </b-col>
                        </b-row>

                        <b-row class="mb-3">
                            <b-col>
                                <admin-MonedasNueva @reload="getMonedas" />
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col>
                                <b-table responsive :fields="fields" :items="monedas">
                                    <template #cell(codigo)="data">
                                        <strong>{{ data.item.codigo }}</strong>
                                    </template>
                                    <template #cell(es_base)="data">
                                        <b-badge v-if="data.item.es_base" variant="primary">Moneda Base</b-badge>
                                    </template>
                                    <template #cell(activo)="data">
                                        <b-badge :variant="data.item.activo ? 'success' : 'secondary'">
                                            {{ data.item.activo ? "Activa" : "Inactiva" }}
                                        </b-badge>
                                    </template>
                                    <template #cell(acciones)="data">
                                        <span class="floatme">
                                            <admin-MonedasEditar :item="data.item" @reload="getMonedas" />
                                        </span>
                                        <span class="floatme">
                                            <admin-MetodosPagoManager :moneda="data.item" />
                                        </span>
                                        <span class="floatme">
                                            <b-button
                                                variant="danger"
                                                :disabled="data.item.es_base"
                                                @click="eliminarMoneda(data.item)"
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

            <div v-else>
                <accessDenied />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "GestionMonedas",
    data() {
        return {
            titulo: "Gestión de Monedas",
            overlay: true,
            monedas: [],
            fields: [
                { key: "codigo", label: "Código", sortable: true },
                { key: "nombre", label: "Nombre", sortable: true },
                { key: "simbolo", label: "Símbolo" },
                { key: "es_base", label: "" },
                { key: "activo", label: "Estado", class: "text-center" },
                { key: "acciones", label: "Acciones", class: "text-center" },
            ],
        };
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
    methods: {
        async getMonedas() {
            this.overlay = true;
            try {
                const { data } = await this.$axios.get(`${this.$config.API}/monedas`);
                this.monedas = data?.data || [];
            } catch (err) {
                console.error("Error al cargar monedas:", err);
            } finally {
                this.overlay = false;
            }
        },

        async eliminarMoneda(moneda) {
            this.overlay = true;
            let uso = null;
            try {
                const resp = await this.$axios.get(`${this.$config.API}/monedas/${moneda._id}/uso`);
                uso = resp.data;
            } catch (err) {
                console.error("Error consultando el uso de la moneda:", err);
            } finally {
                this.overlay = false;
            }

            const mensaje = this.mensajeConfirmacionEliminar(moneda, uso);

            try {
                await this.$confirm(
                    mensaje,
                    "Eliminar Moneda",
                    uso && uso.total > 0 ? "warning" : "question"
                );

                this.overlay = true;
                const data = new URLSearchParams();
                data.set("id", moneda._id);
                await this.$axios.post(`${this.$config.API}/monedas/eliminar`, data);

                await this.getMonedas();

                this.$fire({
                    title: "Eliminar Moneda",
                    html: "<p>La moneda ha sido eliminada exitosamente del catálogo.</p>",
                    type: "success",
                });
            } catch (err) {
                if (err !== false) {
                    const mensajeError = err.response?.data?.error || err.message || err;
                    this.$fire({
                        title: "Eliminar Moneda",
                        html: `<p>Ocurrió un error al eliminar la moneda.</p><p>${mensajeError}</p>`,
                        type: "error",
                    });
                }
            } finally {
                this.overlay = false;
            }
        },

        mensajeConfirmacionEliminar(moneda, uso) {
            if (!uso || uso.total === 0) {
                return `¿Desea eliminar la moneda "${moneda.nombre}"? No tiene ningún pago asociado.`;
            }

            const detalles = [];
            if (uso.metodos_de_pago > 0) detalles.push(`${uso.metodos_de_pago} pago(s) registrados`);
            if (uso.caja > 0) detalles.push(`${uso.caja} movimiento(s) de caja`);
            if (uso.retiros > 0) detalles.push(`${uso.retiros} retiro(s)`);

            return `⚠️ La moneda "${moneda.nombre}" está en uso: ${detalles.join(", ")}.\n\n`
                + `Si la elimina, dejará de estar disponible para nuevos pagos, pero el historial existente se mantendrá intacto.\n\n`
                + `¿Desea continuar con la eliminación?`;
        },
    },
    mounted() {
        this.getMonedas();
    },
};
</script>

<style scoped>
.floatme {
    margin-right: 5px;
}
</style>
