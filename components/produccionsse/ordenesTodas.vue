<template>
    <div>
        <loading :show="loading.show" :text="loading.text" />
        <b-container fluid>
            <b-row>
                <b-col class="mb-4">
                    <h5 class="mb-2">Filtrar por estado de pago:</h5>
                    <b-form-radio-group id="btn-radios-2" v-model="selectedRadio" :options="optionsRadio"
                        button-variant="outline-primary" size="lg" name="radio-btn-outline"
                        buttons></b-form-radio-group>

                    <h5 class="mt-4 mb-2">Filtrar por categoría de producto:</h5>
                    <b-form-radio-group id="btn-radios-categories" v-model="selectedCategory" :options="optionsCategories"
                        button-variant="outline-primary" size="lg" name="radio-btn-categories"
                        @input="fetchPage({ reset: true })" buttons></b-form-radio-group>

                    <h5 class="mt-4 mb-2">Filtrar por status de orden:</h5>
                    <b-form-radio-group id="btn-radios-status" v-model="selectedOrderStatus" :options="optionsOrderStatus"
                        button-variant="outline-primary" size="lg" name="radio-btn-status"
                        @input="fetchPage({ reset: true })" buttons></b-form-radio-group>
                </b-col>
                <b-col offset-lg="8" offset-xl="8">
                    <b-input-group class="mb-2" size="sm">
                        <b-form-input id="filter-input" v-model="filter" type="search" debounce="400"
                            placeholder="Buscar orden o cliente (en todo el historial)"
                            @update="fetchPage({ reset: true })"></b-form-input>

                        <b-input-group-append>
                            <b-button :disabled="!filter" @click="clearSearch">
                                Limpiar
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-col>
            </b-row>

            <b-row v-if="busquedaActiva" class="mb-4">
                <b-col>
                    <b-alert show variant="info" class="text-center d-flex flex-column flex-md-row align-items-center justify-content-center">
                        <span class="mb-2 mb-md-0 mr-md-3">
                            Ignorando el rango de fechas -- hay un filtro o búsqueda activa (categoría, estado, vendedor o texto), buscando en todo el historial.
                        </span>
                        <b-button size="sm" variant="outline-secondary" @click="resetFilters">
                            Limpiar todos los filtros
                        </b-button>
                    </b-alert>
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <b-form class="mb-4" @submit.prevent="onSubmit">
                        <b-row>
                            <b-col class="col-12 col-md-4">
                                <h3>Fecha Inicio</h3>
                                <b-form-datepicker class="mb-4" v-model="fechaConsultaInicio" />
                            </b-col>
                            <b-col class="col-12 col-md-4">
                                <h3>Fecha Fin</h3>
                                <b-form-datepicker class="mb-4" v-model="fechaConsultaFin" />
                            </b-col>
                            <b-col class="col-12 col-md-4 mb-4">
                                <h3>Vendedor</h3>
                                <b-form-select v-model="selectedVendedor" :options="vendedores"
                                    @change="fetchPage({ reset: true })" />
                            </b-col>
                        </b-row>

                        <b-row class="mb-4">
                            <b-col>
                                <h2 class="text-info font-weight-bold">{{ rangoFechasTexto }}</h2>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col class="text-center">
                                <b-button type="submit" variant="primary" class="mr-2">BUSCAR</b-button>
                                <b-button
                                  type="button"
                                  variant="secondary"
                                  @click="resetFilters"
                                >Limpiar Filtros</b-button>
                            </b-col>
                        </b-row>
                    </b-form>
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <h3 class="mb-3 text-primary">
                        {{ filterName }} -- {{ ordenesTabla.length }}<span v-if="selectedRadio === 'todas'"> de {{ totalCount }}</span> Ordenes
                    </h3>

                    <b-table :items="ordenesTabla" :fields="fields" show-empty
                        empty-text="No se encontraron órdenes con estos filtros.">
                        <template #cell(orden)="data">
                            <linkSearch :id="data.item.orden" :key="data.item.orden" />
                        </template>
                        <template #cell(estatus)="data">
                            <badge-estatus-orden :estatus="data.value" />
                        </template>
                        <template #cell(acc)="data">
                            <div class="acciones-container">
                                <div class="botones-superior">
                                    <div class="btn-acciones">
                                        <diseno-view-image class="floatme mb-2" :id="data.item.orden" :aprobada="true" />
                                    </div>
                                    <div class="btn-acciones">
                                        <ordenes-editar :data="data.item" :key="data.item.orden" @updated="reloadMe" />
                                    </div>
                                    <div class="btn-acciones d-lg-none text-left">
                                        <ordenes-abono
                                            :idorden="data.item.orden"
                                            :key="data.item.orden"
                                            :sobrePago="data.item.payment_status === 'sobrepagada' ? data.item.monto_pendiente * -1 : 0"
                                            @reload="reloadMe()" />
                                    </div>
                                </div>
                                <div class="abono-inferior d-lg-block">
                                    <ordenes-abono
                                        :idorden="data.item.orden"
                                        :key="data.item.orden"
                                        :sobrePago="data.item.payment_status === 'sobrepagada' ? data.item.monto_pendiente * -1 : 0"
                                        @reload="reloadMe()" />
                                </div>
                            </div>
                        </template>
                    </b-table>

                    <div id="ordenes-todas-scroll-sentinel"
                        style="height: 50px; display: flex; align-items: center; justify-content: center;">
                        <div v-if="isLoadingMore" class="text-muted">
                            <b-spinner small variant="success" class="mr-2"></b-spinner>
                            Cargando más órdenes...
                        </div>
                        <div v-else-if="endOfList && ordenesTabla.length > 0" class="text-muted small">
                            Fin de la lista ({{ ordenesTabla.length }} órdenes mostradas)
                        </div>
                    </div>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"

export default {
    data() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

        // Helper to format as YYYY-MM-DD for datepickers
        const toISO = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            selectedRadio: "todas",
            optionsRadio: [
                { text: "Todas", value: "todas" },
                { text: "Pagadas", value: "pagadas" },
                { text: "Pendientes", value: "pendientes" },
                { text: "Sobrepagadas", value: "sobrepagada" },
                { text: "Canceladas", value: "cancelada" },
            ],
            selectedCategory: "todas",
            optionsCategories: [{ text: "Todas", value: "todas" }],
            selectedOrderStatus: "todas",
            optionsOrderStatus: [{ text: "Todas", value: "todas" }],
            ordenes: [],
            fields: null,
            filter: "",
            loading: {
                show: true,
                text: "Cargando ordenes...",
            },
            fechaConsultaInicio: toISO(firstDay),
            fechaConsultaFin: toISO(now),
            selectedVendedor: 0,
            vendedores: [{ value: 0, text: "Todos" }],
            // Paginación real por cursor (ord._id) + scroll infinito -- reemplaza el
            // viejo esquema de "cargar todo el rango de fechas de una sola vez".
            cursor: null,
            totalCount: 0,
            isLoadingMore: false,
            endOfList: false,
            scrollObserver: null,
        }
    },

    methods: {
        resetFilters() {
            this.fechaConsultaInicio = "";
            this.fechaConsultaFin = "";
            this.selectedVendedor = 0;
            this.selectedRadio = "todas";
            this.selectedCategory = "todas";
            this.selectedOrderStatus = "todas";
            this.filter = "";
            this.fetchPage({ reset: true });
        },

        clearSearch() {
            this.filter = "";
            this.fetchPage({ reset: true });
        },

        async fetchOpciones() {
            try {
                const res = await this.$axios.get(`${this.$config.API}/table/ordenes-todas/opciones`);
                this.optionsCategories = [
                    { text: "Todas", value: "todas" },
                    ...res.data.categorias.map(c => ({ text: c, value: c })),
                ];
                this.optionsOrderStatus = [
                    { text: "Todas", value: "todas" },
                    ...res.data.estados_orden.map(s => ({ text: s, value: s })),
                ];
                this.vendedores = [
                    { value: 0, text: "Todos" },
                    ...res.data.vendedores.map(v => ({ value: v._id, text: v.nombre })),
                ];
            } catch (error) {
                console.error("Error cargando opciones de filtro:", error);
            }
        },

        onSubmit(event) {
            event.preventDefault();
            const fechaInicio = this.fechaConsultaInicio;
            const fechaFin = this.fechaConsultaFin;

            if (!fechaInicio || !fechaFin) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>Por favor seleccione ambas fechas</p>`,
                    type: "warning",
                });
                return;
            }

            if (new Date(fechaInicio) > new Date(fechaFin)) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
                    type: "warning",
                });
                return;
            }
            this.fetchPage({ reset: true });
        },

        // Reemplaza loadData()/applyFilters(): un único método que pide una página real al
        // servidor (fecha, búsqueda, vendedor, categoría, estado -- todos como filtros del
        // WHERE, nunca solo sobre lo ya cargado) y la anexa al buffer acumulado. reset=true
        // vuelve a la primera página (cambio de filtro/búsqueda); reset=false es "cargar más"
        // desde el scroll infinito.
        async fetchPage({ reset = false } = {}) {
            if (this.isLoadingMore) return;
            this.isLoadingMore = true;
            if (reset) {
                this.loading.show = true;
                this.ordenes = [];
                this.cursor = null;
                this.endOfList = false;
            }

            const searchTerm = (this.filter || "").trim();
            // Igual que la búsqueda de texto: si el usuario filtra por categoría/estado/
            // vendedor, ignorar el rango de fechas -- si no, "Cancelada" combinado con el
            // rango por defecto (ej. este mes) parece devolver "ninguna" cuando en realidad
            // sí existen, solo que fuera del rango cargado (mismo bug de raíz que la búsqueda).
            const filtroActivo = searchTerm.length >= 2
                || this.selectedCategory !== 'todas'
                || this.selectedOrderStatus !== 'todas'
                || this.selectedVendedor != 0;

            try {
                const params = {
                    fecha_inicio: this.fechaConsultaInicio,
                    fecha_fin: this.fechaConsultaFin,
                    ignorar_fecha: filtroActivo ? 1 : 0,
                    search: searchTerm,
                    id_vendedor: this.selectedVendedor,
                    categoria: this.selectedCategory,
                    estado_orden: this.selectedOrderStatus,
                    limit: 25,
                };
                if (!reset && this.cursor) {
                    params.cursor = this.cursor;
                }

                const res = await this.$axios.get(`${this.$config.API}/table/ordenes-todas`, { params });

                if (!this.fields) {
                    this.fields = res.data.fields;
                    this.fields.push({ key: 'estatus', label: 'Estatus', sortable: true });
                }

                this.ordenes.push(...res.data.items);
                this.cursor = res.data.next_cursor;
                this.endOfList = res.data.next_cursor === null;
                if (typeof res.data.total_count === 'number') {
                    this.totalCount = res.data.total_count;
                }
            } catch (error) {
                console.error("Error cargando las ordenes:", error);
            } finally {
                this.isLoadingMore = false;
                this.loading.show = false;
                this.setupInfiniteScroll();
            }
        },

        setupInfiniteScroll() {
            if (this.scrollObserver) {
                this.scrollObserver.disconnect();
                this.scrollObserver = null;
            }
            this.$nextTick(() => {
                const sentinel = document.getElementById('ordenes-todas-scroll-sentinel');
                if (sentinel) {
                    const observer = new IntersectionObserver((entries) => {
                        if (entries[0].isIntersecting && !this.isLoadingMore && !this.endOfList) {
                            this.fetchPage({ reset: false });
                        }
                    }, { threshold: 0.1 });
                    observer.observe(sentinel);
                    this.scrollObserver = observer;
                }
            });
        },

        reloadMe() {
            this.fetchPage({ reset: true });
        },
    },

    computed: {
        busquedaActiva() {
            return (this.filter || "").trim().length >= 2
                || this.selectedCategory !== 'todas'
                || this.selectedOrderStatus !== 'todas'
                || this.selectedVendedor != 0;
        },
        ordenesConEstadoDePago() {
            if (!this.ordenes || !this.ordenes.length) return [];

            return this.ordenes.map(orden => {
                const totalAbonado = parseFloat(orden.total_abonado_base) || 0;
                const totalOrden = parseFloat(orden.total) || 0;
                const totalDescuento = parseFloat(orden.descuento_total) || 0;
                const montoPendiente = totalOrden - totalAbonado - totalDescuento;

                let payment_status = 'pendiente';
                const epsilon = 0.1; // Tolerance for floating point errors

                if (Math.abs(montoPendiente) < epsilon) {
                    payment_status = 'pagada';
                } else if (montoPendiente < -epsilon) {
                    payment_status = 'sobrepagada';
                }

                return {
                    ...orden,
                    acc: orden.orden,
                    monto_pendiente: montoPendiente,
                    payment_status: payment_status
                };
            });
        },
        // Único filtro que sigue siendo client-side, sobre el buffer acumulado: el estado de
        // pago no es una columna plana (es total - abonado - descuento), paginarlo exacto en
        // el servidor requeriría sobre-muestreo. fecha/búsqueda/vendedor/categoría/estado de
        // orden ya son filtros reales del servidor (ver fetchPage).
        ordenesTabla() {
            let filtered = this.ordenesConEstadoDePago;
            if (this.selectedRadio === "pagadas") {
                filtered = filtered.filter(el => el.payment_status === 'pagada');
            } else if (this.selectedRadio === "pendientes") {
                filtered = filtered.filter(el => el.payment_status === 'pendiente');
            } else if (this.selectedRadio === "sobrepagada") {
                filtered = filtered.filter(el => el.payment_status === 'sobrepagada');
            } else if (this.selectedRadio === "cancelada") {
                filtered = filtered.filter(el => el.estatus === 'cancelada');
            }
            return filtered;
        },
        filterName() {
            const option = this.optionsRadio.find(opt => opt.value === this.selectedRadio);
            return option ? option.text : 'Todas';
        },
        rangoFechasTexto() {
            if (!this.fechaConsultaInicio || !this.fechaConsultaFin) return "";
            const format = (dateStr) => {
                const [y, m, d] = dateStr.split("-");
                return `${d}/${m}/${y}`;
            };
            return `Reporte desde ${format(this.fechaConsultaInicio)} hasta ${format(this.fechaConsultaFin)}`;
        },
    },

    async mounted() {
        await this.fetchOpciones();
        await this.fetchPage({ reset: true });
    },

    mixins: [mixin],
}
</script>

<style scoped>
@media (min-width: 992px) {
  .acciones-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }
  .botones-superior {
    display: flex;
    flex-direction: row;
  }
  .abono-inferior {
    margin-left: 20px;
  }
}
@media (max-width: 991px) {
  .acciones-container {
    display: flex;
    flex-direction: column;
  }
  .botones-superior {
    display: flex;
    justify-content: flex-start;
  }
  .abono-inferior {
    margin-top: 16px;
  }
  .btn-acciones {
    float: none !important;
    margin-right: 6px;
    margin-bottom: 4px;
  }
}
</style>
