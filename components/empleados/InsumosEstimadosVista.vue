<template>
    <div class="d-inline-block">
        <b-button size="sm" variant="dark" @click="openModal" v-b-tooltip.hover title="Ver Material Estimado"
            class="ml-1 custom-box-btn">
            <b-icon icon="box-seam"></b-icon>
        </b-button>

        <b-modal :id="modalId" :title="'Material Estimado - Orden #' + idorden" hide-footer size="md" centered>
            <!-- INFO TELA VENDEDOR -->
            <div v-if="telasVendedor.length > 0" class="mb-3">
                <b-alert show variant="light" border-variant="primary" class="mb-0 py-2">
                    <div class="d-flex align-items-center">
                        <b-icon icon="info-circle-fill" variant="primary" class="mr-2"></b-icon>
                        <div>
                            <span class="small font-weight-bold text-uppercase d-block text-primary">Tela(s) Seleccionada por Vendedor:</span>
                            <span class="font-weight-bold text-dark">{{ telasVendedor.join(', ') }}</span>
                        </div>
                    </div>
                </b-alert>
            </div>

            <div v-if="resumenMaterial.length > 0">
                <b-list-group>
                    <b-list-group-item v-for="(item, index) in resumenMaterial" :key="index"
                        class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0">{{ item.catalogo }}</h6>
                            <small class="text-muted">Insumo requerido para el departamento</small>
                        </div>
                        <b-badge variant="dark" pill style="font-size: 1rem;">
                            {{ item.total }} {{ item.unidad }}
                        </b-badge>
                    </b-list-group-item>
                </b-list-group>
            </div>
            <div v-else class="text-center py-4">
                <b-icon icon="info-circle" variant="info" font-scale="2" class="mb-2"></b-icon>
                <p class="text-muted">No hay insumos estimados asignados para esta orden en {{ currentDepartamentName
                    }}.</p>
            </div>
        </b-modal>
    </div>
</template>

<script>
export default {
    props: {
        idorden: {
            type: [String, Number],
            required: true
        },
        departamentoId: {
            type: [String, Number],
            required: true
        },
        dataInsumos: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        modalId() {
            return `modal-estimado-${this.idorden}-${Math.random().toString(36).substring(7)}`;
        },
        currentDepartamentName() {
            return this.$store.state.login.currentDepartament;
        },
        telasVendedor() {
            if (!this.dataInsumos || this.dataInsumos.length === 0) return [];
            const telas = this.dataInsumos
                .filter(item => item.id_orden == this.idorden && item.tela_vendedor)
                .map(item => item.tela_vendedor);
            return [...new Set(telas)];
        },
        dataInsumosFiltrado() {
            const depName = this.currentDepartamentName;
            const depId = this.departamentoId;

            return this.dataInsumos.filter((el) => {
                const isSameOrder = el.id_orden == this.idorden;
                if (!isSameOrder) return false;

                // Si es el mismo departamento ID, incluir
                if (el.id_departamento == depId) return true;

                // Lógica de departamentos hermanos (Estampado y Corte suelen compartir configuración de telas)
                const materialDepts = ["Estampado", "Corte"];
                if (
                    materialDepts.includes(depName) &&
                    materialDepts.includes(el.departamento)
                ) {
                    return true;
                }

                return false;
            });
        },
        resumenMaterial() {
            if (!this.dataInsumosFiltrado || this.dataInsumosFiltrado.length === 0) {
                return [];
            }

            // PASO 1: Deduplicar por id_ordenes_productos + catalogo (Replicando lógica de ModalExtra)
            const productosUnicos = new Map();

            this.dataInsumosFiltrado.forEach((item) => {
                const key = `${item.id_ordenes_productos}_${item.catalogo}`;
                if (!productosUnicos.has(key)) {
                    productosUnicos.set(key, {
                        catalogo: item.catalogo || 'Sin catálogo',
                        cantidad_estimada: parseFloat(item.cantidad_estimada_de_consumo) || 0,
                        unidades: parseInt(item.unidades) || 0,
                        unidad: item.unidad_de_medida || 'Metros',
                        tipo_insumo: item.tipo_insumo
                    });
                }
            });

            // PASO 2: Agrupar por catálogo y sumar totales
            const catalogoMap = new Map();

            productosUnicos.forEach((producto) => {
                const catalogoNombre = producto.catalogo;
                const totalItem = producto.cantidad_estimada * producto.unidades;

                if (catalogoMap.has(catalogoNombre)) {
                    catalogoMap.get(catalogoNombre).total += totalItem;
                } else {
                    let unidadMostrar = producto.unidad;

                    // Override visual de la unidad para Telas (Kg -> Mt)
                    if (producto.tipo_insumo === 'tela' && unidadMostrar === 'Kg') {
                        unidadMostrar = 'Mt';
                    }

                    catalogoMap.set(catalogoNombre, {
                        catalogo: catalogoNombre,
                        total: totalItem,
                        unidad: unidadMostrar
                    });
                }
            });

            return Array.from(catalogoMap.values()).map(item => ({
                ...item,
                total: item.total.toFixed(2)
            }));
        }
    },
    methods: {
        openModal() {
            this.$bvModal.show(this.modalId);
        }
    }
}
</script>

<style scoped>
.custom-box-btn {
    padding: 0.25rem 0.5rem;
    font-size: 1.1rem;
    border-radius: 4px;
}
</style>
