<template>
    <div>
        <b-button class="mb-4" variant="outline-secondary" @click="abrir">
            <b-icon icon="credit-card"></b-icon> Métodos de Pago
        </b-button>

        <b-modal size="lg" :title="`Métodos de Pago -- ${moneda.nombre}`" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row class="mb-3">
                        <b-col>
                            <b-form inline @submit="onSubmitNuevo">
                                <b-form-input
                                    v-model="nuevo.nombre"
                                    placeholder="Nombre (ej: Zelle)"
                                    class="mr-2 mb-2"
                                    required
                                ></b-form-input>
                                <b-form-checkbox v-model="nuevo.requiere_referencia" class="mr-2 mb-2">
                                    Requiere referencia
                                </b-form-checkbox>
                                <b-button type="submit" variant="primary" class="mb-2">
                                    <b-icon icon="plus-lg"></b-icon> Agregar
                                </b-button>
                            </b-form>
                        </b-col>
                    </b-row>

                    <b-row>
                        <b-col>
                            <b-table responsive :fields="fields" :items="metodos">
                                <template #cell(requiere_referencia)="data">
                                    <b-badge :variant="data.item.requiere_referencia ? 'info' : 'secondary'">
                                        {{ data.item.requiere_referencia ? "Sí" : "No" }}
                                    </b-badge>
                                </template>
                                <template #cell(activo)="data">
                                    <b-badge :variant="data.item.activo ? 'success' : 'secondary'">
                                        {{ data.item.activo ? "Activo" : "Inactivo" }}
                                    </b-badge>
                                </template>
                                <template #cell(acciones)="data">
                                    <b-button
                                        variant="danger"
                                        size="sm"
                                        @click="eliminarMetodo(data.item)"
                                    >
                                        <b-icon icon="trash"></b-icon>
                                    </b-button>
                                </template>
                            </b-table>
                        </b-col>
                    </b-row>
                </b-container>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    props: ["moneda"],
    data() {
        return {
            metodos: [],
            nuevo: {
                nombre: "",
                requiere_referencia: false,
            },
            overlay: false,
            fields: [
                { key: "nombre", label: "Nombre" },
                { key: "requiere_referencia", label: "Requiere Referencia" },
                { key: "activo", label: "Estado" },
                { key: "acciones", label: "Acciones" },
            ],
        };
    },

    computed: {
        modal() {
            return `modal-metodos-pago-${this.moneda._id}`;
        },
    },

    methods: {
        async abrir() {
            await this.cargarMetodos();
            this.$bvModal.show(this.modal);
        },
        async cargarMetodos() {
            this.overlay = true;
            try {
                const { data } = await this.$axios.get(
                    `${this.$config.API}/metodos-pago`,
                    { params: { id_moneda: this.moneda._id } }
                );
                this.metodos = data?.data || [];
            } catch (err) {
                console.error("Error al cargar métodos de pago:", err);
            } finally {
                this.overlay = false;
            }
        },
        slugify(nombre) {
            return nombre
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[̀-ͯ]/g, "")
                .replace(/[^a-z0-9]+/g, "_");
        },
        async guardarMetodo(reactivarId = null) {
            const nombre = this.nuevo.nombre.trim();
            if (!nombre) return;

            this.overlay = true;
            const data = new URLSearchParams();
            data.set("id_moneda", this.moneda._id);
            data.set("codigo", this.slugify(nombre));
            data.set("nombre", nombre);
            data.set("requiere_referencia", this.nuevo.requiere_referencia);
            if (reactivarId) {
                data.set("reactivar_id", reactivarId);
            }

            try {
                await this.$axios.post(`${this.$config.API}/metodos-pago`, data);
                this.nuevo = { nombre: "", requiere_referencia: false };
                await this.cargarMetodos();
            } catch (err) {
                const errData = err.response && err.response.data;
                if (err.response && err.response.status === 409 && errData && errData.eliminado_existente) {
                    this.overlay = false;
                    try {
                        await this.$confirm(
                            `Ya existe un método eliminado llamado "${errData.nombre}" para esta moneda. ¿Desea reactivarlo?`,
                            "Método ya existe",
                            "question"
                        );
                        await this.guardarMetodo(errData.id);
                    } catch (e) {
                        // Usuario canceló la reactivación
                    }
                    return;
                }

                console.error("Error guardando el método de pago:", err);
                this.$bvToast.toast((errData && errData.error) || "No se pudo guardar el método de pago", {
                    variant: "danger",
                });
            } finally {
                this.overlay = false;
            }
        },
        onSubmitNuevo(event) {
            event.preventDefault();
            this.guardarMetodo();
        },
        async eliminarMetodo(metodo) {
            this.overlay = true;
            let uso = null;
            try {
                const resp = await this.$axios.get(`${this.$config.API}/metodos-pago/${metodo._id}/uso`);
                uso = resp.data;
            } catch (err) {
                console.error("Error consultando el uso del método de pago:", err);
            } finally {
                this.overlay = false;
            }

            const mensaje = uso && uso.total > 0
                ? `⚠️ El método "${metodo.nombre}" está en uso (${uso.total} registro(s) históricos). Si lo elimina, dejará de estar disponible para nuevos pagos, pero el historial existente se mantendrá intacto.\n\n¿Desea continuar?`
                : `¿Desea eliminar el método "${metodo.nombre}"? No tiene ningún pago asociado.`;

            try {
                await this.$confirm(mensaje, "Eliminar Método de Pago", uso && uso.total > 0 ? "warning" : "question");

                this.overlay = true;
                const data = new URLSearchParams();
                data.set("id", metodo._id);
                await this.$axios.post(`${this.$config.API}/metodos-pago/eliminar`, data);
                await this.cargarMetodos();
            } catch (err) {
                if (err !== false) {
                    console.error("Error al eliminar el método de pago:", err);
                }
            } finally {
                this.overlay = false;
            }
        },
    },
};
</script>
