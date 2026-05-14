<template>
    <div>
        <!-- Botón para abrir el modal -->
        <b-button @click="openModal" variant="info" size="sm">
            <b-icon icon="eye" aria-hidden="true"></b-icon>
            Ver Consumo
        </b-button>

        <!-- Modal -->
        <b-modal :id="modalId" :title="`Consumo de Material: ${nombreInsumo}`" size="xl" hide-footer @show="onModalShow"
            @hidden="onModalHidden">
            <b-overlay :show="loading" spinner-small>
                <!-- Información del insumo -->
                <b-alert show variant="info" class="mb-3">
                    <strong>Insumo:</strong> {{ nombreInsumo }} (ID: {{ idInsumo }})
                </b-alert>

                <!-- Leyenda sobre Material Estimado -->
                <b-alert show variant="warning" class="mb-3 small">
                    <b-icon icon="info-circle-fill" class="mr-2"></b-icon>
                    <strong>Nota importante:</strong> Si el <strong>Material Estimado</strong> se muestra en
                    <span class="text-danger font-weight-bold">0.00</span> rojo, significa que no se ha configurado
                    un consumo esperado de este material para ciertos productos de la orden.
                </b-alert>

                <!-- Tabla de consumo -->
                <div v-if="!loading && consumoData.length > 0">
                    <b-table striped hover responsive small :items="consumoData" :fields="fields" :per-page="perPage"
                        :current-page="currentPage" :tbody-tr-class="rowClass">

                        <!-- Columna ID Orden con linkSearch -->
                        <template #cell(id_orden)="data">
                            <link-search :id="data.item.id_orden" />
                        </template>

                        <!-- ===== COLUMNAS EXCLUSIVAS DE TELA ===== -->

                        <!-- Estimado (Metros) -->
                        <template #cell(material_estimado_metros)="data">
                            <span :class="{'text-danger font-weight-bold': !parseFloat(data.item.material_estimado_metros)}">
                                {{ data.item.material_estimado_metros }}
                            </span>
                        </template>

                        <!-- Estimado (Kilos) -->
                        <template #cell(material_estimado_kilos)="data">
                            <span :class="{'text-danger font-weight-bold': !parseFloat(data.item.material_estimado_kilos)}">
                                {{ data.item.material_estimado_kilos }}
                            </span>
                        </template>

                        <!-- Consumido (Metros) -->
                        <template #cell(material_consumido_metros)="data">
                            <span v-if="data.item.editing" class="text-info font-weight-bold">
                                {{ (parseFloat(data.item.editedValue || 0) * parseFloat(data.item.rendimiento || 0)).toFixed(2) }}
                            </span>
                            <span v-else>{{ data.item.material_consumido_metros }}</span>
                        </template>

                        <!-- ===== COLUMNAS EXCLUSIVAS DE OTROS INSUMOS ===== -->

                        <!-- Estimado (unidad dinámica: Mts, ML, etc.) -->
                        <template #cell(material_estimado_unidad)="data">
                            <span :class="{'text-danger font-weight-bold': !parseFloat(data.item.material_estimado_unidad)}">
                                {{ data.item.material_estimado_unidad }}
                            </span>
                        </template>

                        <!-- ===== COLUMNA COMÚN: Consumido (editable) ===== -->
                        <template #cell(material_consumido)="data">
                            <div v-if="data.item.editing">
                                <b-form-input v-model.number="data.item.editedValue" type="number" step="0.01" size="sm"
                                    :state="validateMaterialConsumido(data.item.editedValue)"></b-form-input>
                            </div>
                            <div v-else>
                                {{ data.item.material_consumido }}
                            </div>
                        </template>

                        <!-- Columna Fecha formateada -->
                        <template #cell(fecha_del_consumo)="data">
                            {{ formatDate(data.item.fecha_del_consumo) }}
                        </template>

                        <!-- Columna Acciones -->
                        <template #cell(acciones)="data">
                            <div v-if="data.item.editing">
                                <b-button @click="saveEdit(data.item)" variant="success" size="sm" class="mr-1"
                                    :disabled="!validateMaterialConsumido(data.item.editedValue)">
                                    <b-icon icon="check" aria-hidden="true"></b-icon>
                                </b-button>
                                <b-button @click="cancelEdit(data.item)" variant="secondary" size="sm">
                                    <b-icon icon="x" aria-hidden="true"></b-icon>
                                </b-button>
                            </div>
                            <div v-else>
                                <b-button @click="enableEdit(data.item)" variant="primary" size="sm" class="mr-1">
                                    <b-icon icon="pencil" aria-hidden="true"></b-icon>
                                    Editar
                                </b-button>
                                <inventario-HistorialCambiosModal :idMovimiento="data.item.id_movimiento" />
                            </div>
                        </template>

                        <!-- Row details para observaciones -->
                        <template #row-details="data">
                            <b-card>
                                <b-form-group label="Observaciones (opcional):" label-for="obs-input">
                                    <b-form-textarea id="obs-input" v-model="data.item.observaciones"
                                        placeholder="Ingresa el motivo del cambio o cualquier observación relevante..."
                                        rows="3" max-rows="6"></b-form-textarea>
                                </b-form-group>
                            </b-card>
                        </template>
                    </b-table>

                    <!-- Paginación -->
                    <b-pagination v-model="currentPage" :total-rows="consumoData.length" :per-page="perPage"
                        align="center" size="sm"></b-pagination>
                </div>

                <!-- Mensaje si no hay datos -->
                <b-alert v-else-if="!loading && consumoData.length === 0" show variant="warning">
                    No se encontraron registros de consumo para este insumo.
                </b-alert>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import LinkSearch from "~/components/linkSearch.vue";

export default {
    name: "ConsumoMaterialModal",

    components: {
        LinkSearch,
    },

    props: {
        idInsumo: {
            type: [Number, String],
            required: true,
        },
        nombreInsumo: {
            type: String,
            required: true,
        },
    },

    data() {
        return {
            modalId: `consumo-modal-${this.idInsumo}`,
            loading: false,
            consumoData: [],
            currentPage: 1,
            perPage: 10,
        };
    },

    computed: {
        esTela() {
            if (!this.consumoData.length) return false;
            return (this.consumoData[0].tipo_insumo || "").toLowerCase() === "tela";
        },

        unidadInsumo() {
            if (!this.consumoData.length) return "";
            return this.consumoData[0].unidad || "";
        },

        fields() {
            const base = [
                { key: "id_orden",        label: "ID Orden",     sortable: true },
                { key: "cliente_nombre",  label: "Cliente",      sortable: true },
                { key: "departamento",    label: "Departamento", sortable: true },
                { key: "nombre_empleado", label: "Empleado",     sortable: true },
            ];

            if (this.esTela) {
                base.push(
                    { key: "material_estimado_metros", label: "Estimado (Metros)", sortable: true, class: "text-right" },
                    { key: "material_estimado_kilos",  label: "Estimado (Kilos)",  sortable: true, class: "text-right" },
                    { key: "material_consumido_metros", label: "Consumido (Metros)", sortable: true, class: "text-right" },
                    { key: "material_consumido",        label: "Consumido (Kilos)", sortable: true, class: "text-right" },
                );
            } else {
                base.push(
                    { key: "material_estimado_unidad", label: `Estimado (${this.unidadInsumo})`,  sortable: true, class: "text-right" },
                    { key: "material_consumido",       label: `Consumido (${this.unidadInsumo})`, sortable: true, class: "text-right" },
                );
            }

            base.push(
                { key: "valor_inicial",    label: "Valor Inicial", sortable: true, class: "text-right" },
                { key: "valor_final",      label: "Valor Final",   sortable: true, class: "text-right" },
                { key: "fecha_del_consumo", label: "Fecha",        sortable: true },
                { key: "acciones",         label: "Acciones" },
            );

            return base;
        },
    },

    methods: {
        openModal() {
            this.$bvModal.show(this.modalId);
        },

        async onModalShow() {
            await this.fetchConsumoData();
        },

        onModalHidden() {
            this.consumoData = [];
            this.currentPage = 1;
        },

        async fetchConsumoData() {
            this.loading = true;
            try {
                const response = await this.$axios.get(
                    `${this.$config.API}/inventario/consumo/${this.idInsumo}`
                );

                if (response.data.success) {
                    this.consumoData = response.data.data.map((item) => {
                        const rendimiento = parseFloat(item.rendimiento) || 0;
                        const unidadNorm = (item.unidad || "").toLowerCase();
                        const esKilos = unidadNorm === "kg" || unidadNorm === "kilos" || unidadNorm === "kilo";
                        const esTela = (item.tipo_insumo || "").toLowerCase() === "tela";
                        const estimadoBase = parseFloat(item.material_estimado) || 0;

                        let extra = {};

                        if (esTela) {
                            const consumidoBase = parseFloat(item.material_consumido) || 0;
                            extra = {
                                material_estimado_metros: estimadoBase.toFixed(2),
                                material_estimado_kilos: (esKilos && rendimiento > 0)
                                    ? (estimadoBase / rendimiento).toFixed(2)
                                    : estimadoBase.toFixed(2),
                                material_consumido_metros: (esKilos && rendimiento > 0)
                                    ? (consumidoBase * rendimiento).toFixed(2)
                                    : consumidoBase.toFixed(2),
                            };
                        } else {
                            // Para otros insumos, el estimado ya viene en la unidad nativa del insumo
                            extra = {
                                material_estimado_unidad: estimadoBase.toFixed(2),
                            };
                        }

                        return {
                            ...item,
                            ...extra,
                            editing: false,
                            editedValue: item.material_consumido,
                            originalValue: item.material_consumido,
                        };
                    });
                } else {
                    this.$bvToast.toast("Error al cargar los datos de consumo", {
                        title: "Error",
                        variant: "danger",
                        solid: true,
                    });
                }
            } catch (error) {
                console.error("Error fetching consumo data:", error);
                this.$bvToast.toast(
                    "Error de conexión al cargar los datos de consumo",
                    {
                        title: "Error",
                        variant: "danger",
                        solid: true,
                    }
                );
            } finally {
                this.loading = false;
            }
        },

        enableEdit(item) {
            item.editing = true;
            item.editedValue = item.material_consumido;
            item.observaciones = '';
            this.$set(item, '_showDetails', true);
        },

        cancelEdit(item) {
            item.editing = false;
            item.editedValue = item.originalValue;
            item.observaciones = '';
            this.$set(item, '_showDetails', false);
        },

        validateMaterialConsumido(value) {
            return value !== null && value !== undefined && value >= 0;
        },

        async saveEdit(item) {
            this.loading = true;
            try {
                const response = await this.$axios.patch(
                    `${this.$config.API}/inventario/consumo/${item.id_movimiento}`,
                    {
                        material_consumido: item.editedValue,
                        observaciones: item.observaciones || '',
                        id_usuario: this.$store.state.login.dataUser.id_empleado,
                    }
                );

                if (response.data.success) {
                    item.material_consumido = item.editedValue;
                    item.originalValue = item.editedValue;
                    item.editing = false;
                    item.observaciones = '';
                    this.$set(item, '_showDetails', false);

                    this.$bvToast.toast('Material consumido actualizado correctamente', {
                        title: 'Éxito',
                        variant: 'success',
                        solid: true,
                    });

                    await this.fetchConsumoData();
                    this.$emit('reload');
                } else {
                    this.$bvToast.toast(response.data.message || 'Error al guardar', {
                        title: 'Error',
                        variant: 'danger',
                        solid: true,
                    });
                }
            } catch (error) {
                console.error('Error saving edit:', error);
                this.$bvToast.toast(
                    error.response?.data?.message || 'Error de conexión al guardar',
                    {
                        title: 'Error',
                        variant: 'danger',
                        solid: true,
                    }
                );
            } finally {
                this.loading = false;
            }
        },

        formatDate(dateString) {
            if (!dateString) return "-";
            const options = {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            };
            return new Date(dateString).toLocaleString("es-ES", options);
        },

        rowClass(item, type) {
            if (!item || type !== 'row') return;
            if (item.editing) return 'table-info';
        },
    },
};
</script>

<style scoped>
.text-right {
    text-align: right;
}
</style>
