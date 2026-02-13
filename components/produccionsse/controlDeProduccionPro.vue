<template>
  <div>
    <div class="d-flex align-items-center mb-3">
      <b-button @click="initTiemposDeProduccion" :variant="buttonState.variant" :disabled="buttonState.disabled">
        <b-icon icon="arrow-clockwise" :animation="isLoading ? 'spin' : ''"></b-icon>
        {{ buttonState.text }}
      </b-button>

      <produccionsse-asignacion-masiva :items="items" :empleados="empleados" :ordenes-proyectadas="ordenesProyectadas2"
        @reload="initTiemposDeProduccion" />
    </div>

    <h3 class="mt-4">Reposiciones</h3>

    <b-overlay :show="isLoading" opacity="0.6" rounded="sm" spinner-variant="success">
      <template #overlay>
        <div class="text-center">
          <b-spinner variant="success" label="Cargando..."></b-spinner>
          <h3 class="mt-2">Cargando reposiciones...</h3>
        </div>
      </template>

      <div v-if="reposiciones_solicitadas.length === 0 && !isLoading">
        <b-alert class="text-cetner mb-4" show variant="info">
          <h3>No hay reposiciones para revisar</h3>
        </b-alert>
      </div>

      <div v-else>
        <b-container fluid>
          <!-- Cabeceras para Reposiciones -->
          <div class="list-group-header-reposiciones">
            <div class="list-group-header-item">⋮</div>
            <div class="list-group-header-item">Orden</div>
            <div class="list-group-header-item">Detalles</div>
          </div>

          <draggable v-model="reposiciones_solicitadas" @end="afterDragRep" tag="ul" class="list-group">
            <li v-for="(el, index) in reposiciones_solicitadas" :key="`rep-${el.id_reposicion}-${refreshKey}`"
              class="list-group-item" style="list-style: none; padding: 0; margin: 0; border: none">
              <b-list-group class="list-group-reposiciones">
                <b-list-group-item class="pb-3 drag-handle d-flex align-items-left">
                  <span class="drag-handle-zone" style="padding-top: 12px; padding-right: 16px; cursor: grab;">☰</span>
                </b-list-group-item>

                <b-list-group-item data-label="Orden">
                  <div>
                    <link-search :id="el.id_orden" :key="el.id_orden" />
                  </div>
                  <div v-if="el.estatus_revision === 'Aprobado'" class="h1 mt-2">
                    <b-button variant="outline-light">
                      <b-icon icon="exclamation-circle-fill" variant="success" @click="showDesigner(el.disenador)"
                        :key="el.orden"></b-icon>
                    </b-button>
                  </div>

                  <div v-else class="h1 mt-2">
                    <b-button variant="outline-light" @click="showDesigner(el.disenador)" :key="el.orden">
                      <b-icon icon="exclamation-circle-fill" style="color: lightgray"></b-icon>
                    </b-button>
                  </div>
                </b-list-group-item>

                <b-list-group-item data-label="Detalles">
                  <produccionsse-reposicionesPendientes :empleados="empleados" :item="el" :key="index"
                    @reload="initTiemposDeProduccion" />
                </b-list-group-item>
              </b-list-group>
            </li>
          </draggable>
        </b-container>
      </div>
    </b-overlay>

    <h3 class="mt-4">Ordenes en curso</h3>

    <!-- Filtros -->
    <b-row class="mb-3">
      <b-col md="3">
        <b-form-group label="Filtrar por Orden" label-for="filter-orden">
          <b-form-input id="filter-orden" v-model="filterOrden" placeholder="Ej: 1234" type="text"
            debounce="300"></b-form-input>
        </b-form-group>
      </b-col>
      <b-col md="3">
        <b-form-group label="Filtrar por Cliente" label-for="filter-cliente">
          <b-form-input id="filter-cliente" v-model="filterCliente" placeholder="Nombre del cliente"
            debounce="300"></b-form-input>
        </b-form-group>
      </b-col>
      <b-col md="3">
        <b-form-group label="Filtrar por Estado" label-for="filter-estatus">
          <b-form-input id="filter-estatus" v-model="filterEstatus" placeholder="Estado de la orden"
            debounce="300"></b-form-input>
        </b-form-group>
      </b-col>
      <b-col md="3" class="d-flex align-items-end flex-column">
        <b-button v-if="isUserFiltering" @click="clearFilters" variant="outline-danger" size="sm" class="mb-2 w-100">
          <b-icon icon="x-circle"></b-icon> Limpiar Filtros
        </b-button>
        <b-alert v-if="isUserFiltering" show variant="warning" class="m-0 p-2 w-100 text-center">
          <small><strong>Reordenamiento desactivado</strong> por filtros
            activos.</small>
        </b-alert>
      </b-col>
    </b-row>

    <b-overlay :show="isLoading" opacity="0.6" rounded="sm" spinner-variant="success">
      <template #overlay>
        <div class="text-center">
          <b-spinner variant="success" label="Cargando..."></b-spinner>
          <h3 class="mt-2">Cargando Ordenes...</h3>
        </div>
      </template>

      <div v-if="items.length === 0 && !isLoading">
        <b-alert show class="mt-2 mb-4" variant="info">
          <h3>No hay ordenes en curso</h3>
        </b-alert>
      </div>

      <div v-else>
        <b-container fluid>
          <!-- Cabeceras fijas con el mismo grid -->
          <div class="list-group-header">
            <div class="list-group-header-item">⋮</div>
            <div class="list-group-header-item">Orden</div>
            <div class="list-group-header-item">Cliente</div>
            <div class="list-group-header-item">Und.</div>
            <div class="list-group-header-item">Progreso</div>
            <div class="list-group-header-item">Entrega</div>
            <div class="list-group-header-item">Vinc.</div>
            <div class="list-group-header-item">Estatus</div>
            <div class="list-group-header-item">Detalles</div>
            <div class="list-group-header-item">Acciones</div>
          </div>

          <draggable v-model="itemsFiltrados" @end="afterDrag" tag="ul" class="list-group" handle=".drag-handle-zone"
            :disabled="isUserFiltering">
            <li v-for="(el, index) in itemsFiltrados" :key="`${el.orden}-${refreshKey}`" class="list-group-item"
              style="list-style: none; padding: 0; margin: 0; border: none">
              <b-list-group class="list-group-draggable">
                <b-list-group-item class="pb-3 drag-handle d-flex align-items-left">
                  <span class="drag-handle-zone" :style="{
                    cursor: isUserFiltering ? 'not-allowed' : 'grab',
                    paddingTop: '4px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    opacity: isUserFiltering ? 0.3 : 1
                  }">☰</span>
                </b-list-group-item>

                <b-list-group-item data-label="Orden">
                  <div>
                    <link-search :id="el.orden" :key="el.orden" />
                  </div>
                  <div v-if="el.estatus_revision === 'Aprobado'" class="h1 mt-2">
                    <b-button variant="outline-light">
                      <b-icon icon="exclamation-circle-fill" variant="success" @click="showDesigner(el.disenador)"
                        :key="el.orden"></b-icon>
                    </b-button>
                  </div>

                  <div v-else class="h1 mt-2">
                    <b-button variant="outline-light" @click="showDesigner(el.disenador)" :key="el.orden">
                      <b-icon icon="exclamation-circle-fill" style="color: lightgray"></b-icon>
                    </b-button>
                  </div>
                </b-list-group-item>

                <b-list-group-item data-label="Cliente">
                  {{ el.cliente }}
                </b-list-group-item>

                <b-list-group-item data-label="Unidades">
                  <div>
                    {{ el.unidades }}
                  </div>
                </b-list-group-item>

                <b-list-group-item data-label="Progreso">
                  <div>
                    <produccionsse-progress-bar :pasos="pasos" :asignacion="asignacion"
                      :emp_asignados="empleadosAsignados" :empleados="empleados" :por_asignar="por_asignar"
                      :depart="pActivo(el.orden)" :item="el" :orden_productos="filterOrdenProductos(el.orden)"
                      :reposicion_ordenes_productos="reposicion_ordenes_productos
                        " :lote_detalles="filterLoteDetalles(el.orden)" :lotes_fisicos="lotes_fisicos" :key="el.orden"
                      @reload="initTiemposDeProduccion" />
                  </div>
                </b-list-group-item>

                <b-list-group-item data-label="Entrega">
                  <div style="margin-top: 32px">
                    <!-- ===================== INICIO DE MODIFICACIÓN ==================== -->
                    <!-- Se reemplaza @reload por los eventos de modal -->
                    <progreso-tiempo-semaforo :key="el.orden" @modal-shown="handleModalShown"
                      @modal-hidden="handleModalHidden" :ordenesTodas="fechas" :id_orden="el.orden"
                      :ordenesProyectadas2="ordenesProyectadas2" />
                    <!-- ====================== FIN DE MODIFICACIÓN ====================== -->
                  </div>
                </b-list-group-item>

                <b-list-group-item data-label="Vinculada">
                  <div class="floatme">
                    <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculadas(el.acciones)" :key="el.orden"
                      :id_orden="el.orden" />
                  </div>
                </b-list-group-item>

                <b-list-group-item data-label="Estatus">
                  <div>
                    {{ el.estatus }}
                  </div>
                </b-list-group-item>

                <b-list-group-item data-label="Detalles">
                  <div>
                    <produccion-control-de-produccion-detalles-editor :idorden="el.orden" :item="el"
                      :detalles="el.detalles" :detalle_empleado="el.detalle_empleado" :key="el.orden"
                      :productos="productsFilter(el.orden)" />
                  </div>
                </b-list-group-item>

                <b-list-group-item data-label="Acciones">
                  <div>
                    <ordenes-editar :data="el" :key="el.orden" />
                  </div>
                </b-list-group-item>
              </b-list-group>
            </li>
          </draggable>
        </b-container>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import mixin3 from "~/mixins/procesamientoOrdenes.js";
import draggable from "vuedraggable";
import { log } from "console";

export default {
  components: {
    draggable,
  },
  data() {
    return {
      isLoading: true,
      hasNewData: false,
      toastShown: false,
      isCheckingForUpdates: false,
      ordenesProyectadas2: [],
      fechasResultSemaforo: null,
      fechas: [],
      includedFields: ["orden", "cliente"],
      perPage: 25,
      currentPage: 1,
      ordenesLength: 0,
      filter: null,
      // Nuevos filtros
      filterOrden: '',
      filterCliente: '',
      filterEstatus: '',

      overlay: true,
      items: [],
      pactivos: [],
      vinculadas: [],
      por_asignar: [],
      products: [],
      asignacion: [],
      empleadosAsignados: [],
      orden_productos: [],
      reposicion_ordenes_productos: [],
      lote_detalles: [],
      lotes_fisicos: [],
      reposiciones_solicitadas: [],
      empleados: [],
      pasos: [],
      refreshKey: 0,
      reloadMe: false,
      events: [],
      fields_reposiciones: [{ key: "id_orden", label: " " }],
      fields: [
        { key: "orden", label: "Orden" },
        {
          key: "estatus_revision",
          label: "Diseño",
          thClass: "text-center",
          tdClass: "text-center",
        },
        { key: "cliente", label: "Cliente" },
        { key: "unidades", label: "Unidades", thClass: "text-center" },
        { key: "paso", label: "Progreso" },
        { key: "inicio", label: "Inicio" },
        { key: "entrega", label: "Entrega" },
        { key: "vinculada", label: "Vinculada" },
        { key: "estatus", label: "Estatus" },
        { key: "detalles", label: "Detalles" },
        { key: "acciones", label: "Acciones" },
      ],
      activeModalCount: 0,
      intervaloRecargaDatos: null,
    };
  },

  methods: {
    checkForUpdates() {
      if (this.isCheckingForUpdates || this.isLoading) return;
      this.isCheckingForUpdates = true;

      this.$axios
        .get(`${this.$config.API}/sse/produccion`)
        .then((res) => {
          const newItems = res.data.items;
          const newReposiciones = res.data.reposiciones_solicitadas;

          const currentItemsStr = JSON.stringify(this.items.map(i => i.orden));
          const newItemsStr = JSON.stringify(newItems.map(i => i.orden));

          const currentReposicionesStr = JSON.stringify(this.reposiciones_solicitadas.map(r => r.id_reposicion));
          const newReposicionesStr = JSON.stringify(newReposiciones.map(r => r.id_reposicion));

          if (currentItemsStr !== newItemsStr || currentReposicionesStr !== newReposicionesStr) {
            if (!this.toastShown) {
              this.$bvToast.toast("Hay nuevas órdenes o reposiciones.", {
                id: 'new-data-toast',
                title: "Actualización Disponible",
                variant: "success",
                solid: true,
                toaster: "b-toaster-top-right",
                noAutoHide: true,
                appendToast: true,
              });
              this.hasNewData = true;
              this.toastShown = true;
            }
          }
        })
        .catch((err) => {
          console.error("Error al verificar actualizaciones:", err);
        })
        .finally(() => {
          this.isCheckingForUpdates = false;
        });
    },

    handleModalShown() {
      this.activeModalCount++;
    },
    handleModalHidden() {
      this.activeModalCount--;
    },

    initTiemposDeProduccion() {
      this.isLoading = true;
      this.hasNewData = false;
      this.toastShown = false;
      this.$bvToast.hide('new-data-toast'); // Ocultar el toast de nuevos datos

      this.loadOrdersProduction().then(() => {
        this.refreshKey++; // Incrementar para forzar reactividad en hijos
        this.getOrdenesFechas().then(() => {
          this.ordenesProyectadas2 = this.generarPlanProduccionCompleto(
            this.fechas,
            this.$store.state.login.dataEmpresa.horario_laboral
          );
        });
      });
    },

    async getOrdenesFechas() {
      await this.$axios
        .get(`${this.$config.API}/ordenes/proyeccion-entrega`)
        .then((res) => {
          this.fechas = res.data;
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<P>No se recibieron las fechas</p><p>${err}</p>`,
            type: "warning",
          });
        })
    },

    afterDrag(evt) {
      const nuevosOrdenes = this.items.map((dep, index) => ({
        orden: dep.orden,
        orden_fila: index + 1,
      }));
      try {
        this.initTiemposDeProduccion();
        this.items = nuevosOrdenes;
        this.items.forEach((el) => {
          this.updateFilaOren(el.orden, el.orden_fila);
        });
      } catch (error) {
        console.error("Error al actualizar orden:", error);
      }
    },

    afterDragRep(evt) {
      const nuevasReposiciones = this.reposiciones_solicitadas.map(
        (dep, index) => ({
          id_reposicion: dep.id_reposicion,
          orden_fila: index + 1,
        })
      );
      try {
        this.reposiciones_solicitadas = nuevasReposiciones;
        this.reposiciones_solicitadas.forEach((el) => {
          this.updateFilaReposicionNueva(el.id_reposicion, el.orden_fila);
        });
      } catch (error) {
        console.error("Error al actualizar orden:", error);
      }
    },

    async updateFilaOren(idOrden, ordenFila) {
      const data = new URLSearchParams();
      data.set("id_orden", idOrden);
      data.set("orden_fila", ordenFila);
      await this.$axios
        .post(`${this.$config.API}/ordenes/actualizar-fila`, data)
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se eliminó el registro</p><p>${err}</p>`,
            type: "warning",
          });
        })
    },

    async updateFilaReposicionNueva(idReposicion, ordenFila) {
      const data = new URLSearchParams();
      data.set("id_reposicion", idReposicion);
      data.set("orden_fila", ordenFila);
      await this.$axios
        .post(`${this.$config.API}/reposiciones/actualizar-fila`, data)
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se eliminó el registro</p><p>${err}</p>`,
            type: "warning",
          });
        })
    },

    productsFilter(id) {
      return this.products.filter((el) => el.id_orden == id);
    },

    showDesigner(designer) {
      this.$fire({
        title: designer,
        html: ``,
        type: "info",
      });
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },

    pActivo(id_orden) {
      return this.pactivos
        .filter((el) => el.id_orden == id_orden)
        .map((el) => {
          return el.departamento;
        });
    },

    filterVinculadas(id_orden) {
      return this.vinculadas
        .filter((el) => el.id_father == id_orden)
        .map((el) => ({ id_child: el.id_child }));
    },
    filterOrdenProductos(id_orden) {
      return this.orden_productos.filter((el) => el.id_orden == id_orden);
    },

    filterLoteDetalles(id_orden) {
      return this.lote_detalles.filter((el) => el.id_orden == id_orden);
    },

    clearFilters() {
      this.filterOrden = "";
      this.filterCliente = "";
      this.filterEstatus = "";
    },

    async loadOrdersProduction() {
      await this.$axios
        .get(`${this.$config.API}/sse/produccion`)
        .then((res) => {
          this.items = res.data.items || [];
          this.empleadosAsignados = res.data.emp_asignados || [];
          this.por_asignar = res.data.por_asignar || [];
          this.ordenesLength =
            parseInt(res.data.items ? res.data.items.length : 0) + 1;
          this.pactivos = res.data.pactivos || [];
          this.vinculadas = res.data.vinculadas || [];
          this.products = res.data.productos || [];
          this.reposiciones_solicitadas =
            res.data.reposiciones_solicitadas || [];
          this.asignacion = res.data.asignacion || [];
          this.empleados = res.data.empleados || [];
          this.orden_productos = res.data.orden_productos || [];
          this.reposicion_ordenes_productos =
            res.data.reposicion_ordenes_productos || [];
          this.lote_detalles = res.data.lote_detalles || [];
          this.lotes_fisicos = res.data.lotes_fisicos || [];
          this.pasos = res.data.pasos || [];
        })
        .catch((err) => {
          this.$bvToast.toast("No se pudieron cargar los datos de producción.", {
            title: "Error de Carga",
            variant: "danger",
            solid: true,
          });
          this.hasNewData = true; // Permitir reintentar
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },

  computed: {
    // --- COMPUTED ORIGINAL RESTAURADO ---
    totalRows() {
      return parseInt(this.ordenesLength) + 1;
    },

    isUserFiltering() {
      return (
        (this.filterOrden && this.filterOrden.trim().length > 0) ||
        (this.filterCliente && this.filterCliente.trim().length > 0) ||
        (this.filterEstatus && this.filterEstatus.trim().length > 0)
      );
    },

    itemsFiltrados: {
      get() {
        if (!this.items.length || !this.orden_productos.length) {
          return [];
        }

        // 1. Filtrado base (Productos físicos)
        let filtered = this.items.filter((order) => {
          const productosDeLaOrden = this.orden_productos.filter(
            (p) => p.id_orden === order.orden
          );

          if (productosDeLaOrden.length === 0) {
            return false;
          }

          const tieneProductoFisico = productosDeLaOrden.some(
            (p) => p.fisico == 1
          );

          return tieneProductoFisico;
        });

        // 2. Aplicar filtros de usuario si existen
        if (this.filterOrden) {
          const fOrden = this.filterOrden.toLowerCase();
          filtered = filtered.filter(item =>
            String(item.orden).toLowerCase().includes(fOrden)
          );
        }

        if (this.filterCliente) {
          const fCliente = this.filterCliente.toLowerCase();
          filtered = filtered.filter(item =>
            (item.cliente && item.cliente.toLowerCase().includes(fCliente))
          );
        }

        if (this.filterEstatus) {
          const fEstatus = this.filterEstatus.toLowerCase();
          filtered = filtered.filter(item =>
            (item.estatus && item.estatus.toLowerCase().includes(fEstatus))
          );
        }

        return filtered;
      },
      set(reorderedItems) {
        // Si el usuario está filtrando, NO permitimos reordenar (aunque el drag se haya disparado)
        // Esto es una medida de seguridad adicional, aunque el UI debería estar bloqueado.
        if (this.isUserFiltering) {
          return;
        }

        // 1. Obtenemos los items que fueron filtrados (los que son solo no-físicos)
        // NOTA: Aquí solo consideramos el filtro base de "no físicos" para la lógica de reordenamiento original.
        // Si hubiera filtros de usuario activos, reorderedItems sería un subconjunto y perderíamos datos al guardar.
        // Por eso bloqueamos el set si isUserFiltering es true.

        const itemsNoFisicos = this.items.filter((order) => {
          const productosDeLaOrden = this.orden_productos.filter(
            (p) => p.id_orden === order.orden
          );
          return !productosDeLaOrden.some((p) => p.fisico == 1);
        });

        // 2. Concatenamos la lista reordenada con los no físicos al final.
        this.items = [...reorderedItems, ...itemsNoFisicos];
      },
    },

    buttonState() {
      if (this.isLoading) {
        return {
          variant: 'info',
          text: 'Cargando...',
          disabled: true,
        };
      }
      if (this.hasNewData) {
        return {
          variant: 'success',
          text: 'Recargar para ver cambios',
          disabled: false,
        };
      }
      return {
        variant: 'primary',
        text: 'Recargar',
        disabled: false,
      };
    },
  },

  mounted() {
    this.initTiemposDeProduccion();
    this.intervaloRecargaDatos = setInterval(() => {
      if (this.activeModalCount === 0) {
        this.checkForUpdates();
      }
    }, 60000);
  },

  beforeDestroy() {
    clearInterval(this.intervaloRecargaDatos);
  },

  mixins: [mixin, mixin3],
};
</script>

<style scoped>
.float-me {
  float: left;
  margin-right: 4px;
  margin-top: 4px;
}

/* .reposiciones-grid-container {
  display: grid;
  grid-template-columns: auto auto auto auto 1fr;
} */
/* Nueva grilla para reposiciones */
.list-group-header-reposiciones {
  display: grid;
  grid-template-columns: 50px 100px 1fr;
  background-color: #375a7f;
  border: 1px solid #4e5d6c;
  border-bottom: 2px solid #00bc8c;
  padding: 0.75rem 0;
  font-weight: 600;
  margin-bottom: 0;
}

.list-group-reposiciones {
  display: grid;
  grid-template-columns: 50px 100px 1fr;
  padding: 0;
  margin: 0;
}

.list-group-reposiciones .list-group-item {
  padding: 0.5rem 0.5rem;
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-bottom: 1px solid #4e5d6c;
}

/* Cabecera de la tabla list-group */
.list-group-header {
  display: grid;
  grid-template-columns: 50px 0.8fr 3fr 60px 340px 160px 70px 100px 80px 80px;
  background-color: #375a7f;
  border: 1px solid #4e5d6c;
  border-bottom: 2px solid #00bc8c;
  padding: 0.75rem 0;
  font-weight: 600;
  margin-bottom: 0;
}

.list-group-header-item {
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  color: #fff;
}

.list-group-draggable {
  display: grid;
  /* Define 10 columnas: Handle, Orden, Cliente, Unidades, Progreso, Entrega, Vinculada, Estatus, Detalles, Acciones */
  grid-template-columns: 50px 0.8fr 3fr 60px 340px 160px 70px 100px 80px 80px;
  /* Ajusta las columnas según necesites. '1fr' para la columna de cliente que tomará el espacio restante */
  padding: 0;
  margin: 0;
}

.list-group-draggable .list-group-item {
  padding: 0.5rem 0.5rem;
  /* Reducir padding predeterminado de Bootstrap para mejor densidad */
  border: none;
  background-color: transparent;
  /* Importante si hay fondo en filas alternas */
  display: flex;
  align-items: center;
  /* Centrar contenido verticalmente */
  overflow: hidden;
  /* Evitar desbordes */
  border-bottom: 1px solid #4e5d6c;
  /* Simula el borde de la fila */
}

/* Handle de arrastre */
.drag-handle-zone {
  user-select: none;
  touch-action: none;
}

@media (max-width: 1350px) {

  /* Ocultar cabeceras en móvil */
  .list-group-header {
    display: none;
  }

  /* Transformar la fila en tarjeta */
  .list-group-draggable {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    /* Borde suave claro */
    margin-bottom: 1rem;
    background-color: #fff;
    /* Fondo blanco */
    border-radius: 8px;
    /* Bordes redondeados */
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    /* Sombra sutil */
  }

  /* Estilar cada celda como una fila de la tarjeta */
  .list-group-draggable .list-group-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    /* Separador muy sutil */
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    /* Permitir que el contenido baje si es necesario */
    width: 100%;
    /* Ocupar todo el ancho */
    min-height: 50px;
    /* Altura mínima para facilidad táctil */
    color: #333;
    /* Texto oscuro */
  }

  /* Quitar borde del último item */
  .list-group-draggable .list-group-item:last-child {
    border-bottom: none;
  }

  /* Mostrar etiquetas usando data-label */
  .list-group-draggable .list-group-item::before {
    content: attr(data-label);
    font-weight: bold;
    color: #00bc8c;
    /* Verde del tema (se mantiene bien) */
    margin-right: auto;
    /* Empujar el contenido a la derecha */
    padding-right: 1rem;
    display: block;
    /* Asegurar que se comporte bien */
  }

  /* Excepciones */

  /* Handle: Ocultar o mostrar diferente */
  .list-group-draggable .list-group-item:first-child {
    background-color: #375a7f;
    /* Color de cabecera manteniendo identidad */
    justify-content: center;
    padding: 0.5rem;
    color: white;
  }

  .list-group-draggable .list-group-item:first-child::before {
    display: none;
    /* No mostrar label para el handle */
  }

  /* Progreso: Dar más espacio */
  .list-group-draggable .list-group-item[data-label="Progreso"] {
    flex-direction: column;
    align-items: stretch;
    /* Ocupar todo el ancho */
  }

  .list-group-draggable .list-group-item[data-label="Progreso"]::before {
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
    width: 100%;
    padding-bottom: 0.25rem;
  }

  /* Cliente: Resaltar */
  .list-group-draggable .list-group-item[data-label="Cliente"] {
    font-size: 1.1em;
    font-weight: bold;
    background-color: #f8f9fa;
    /* Gris muy claro para resaltar */
  }

  /* REPOSICIONES MOBILE */
  .list-group-header-reposiciones {
    display: none;
  }

  .list-group-reposiciones {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    margin-bottom: 1rem;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .list-group-reposiciones .list-group-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
    min-height: 50px;
    color: #333;
  }

  .list-group-reposiciones .list-group-item::before {
    content: attr(data-label);
    font-weight: bold;
    color: #00bc8c;
    margin-right: auto;
    padding-right: 1rem;
    display: block;
  }

  .list-group-reposiciones .list-group-item:first-child {
    background-color: #375a7f;
    justify-content: center;
    padding: 0.5rem;
    color: white;
  }

  .list-group-reposiciones .list-group-item:first-child::before {
    display: none;
  }
}
</style>