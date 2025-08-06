<template>
  <div>
    <b-button
      @click="initTiemposDeProduccion"
      :variant="buttonState.variant"
      :disabled="buttonState.disabled"
      class="mb-3"
    >
      <b-icon icon="arrow-clockwise" :animation="isLoading ? 'spin' : ''"></b-icon>
      {{ buttonState.text }}
    </b-button>

    <h3 class="mt-4">Reposiciones</h3>

    <div v-if="isLoading">
      <b-alert
        class="text-cetner mb-4"
        show
        variant="info"
      >
        <h3>Cargando reposiciones...</h3>
      </b-alert>
    </div>

    <div v-else-if="reposiciones_solicitadas.length === 0">
      <b-alert
        class="text-cetner mb-4"
        show
        variant="info"
      >
        <h3>No hay reposiciones para revisar</h3>
      </b-alert>
    </div>

    <div v-else>
      <b-container fluid>
        <draggable
          v-model="reposiciones_solicitadas"
          @end="afterDragRep"
          tag="ul"
          class="list-group reposiciones-grid-container"
        >
          <b-list-group
            v-for="(el, index) in reposiciones_solicitadas"
            class=""
            :key="index"
            horizontal
          >
            <b-list-group-item
              style="cursor: grab"
              class="pb-3 drag-handle d-flex align-items-left list-group-draggable-item"
            >
              <span style="padding-top: 4px; padding-right: 8px; padding-top: 12px">☰</span>
            </b-list-group-item>

            <b-list-group-item style="min-width: 15%; max-width: 15%">
              <!-- Orden {{ el.id_orden }} -->
              <div
                v-if="el.estatus_revision === 'Aprobado'"
                class="h1 mt-2"
              >
                <b-button variant="outline-light">
                  <b-icon
                    icon="exclamation-circle-fill"
                    variant="success"
                    @click="showDesigner(el.disenador)"
                    :key="el.orden"
                  ></b-icon>
                </b-button>
              </div>

              <div
                v-else
                class="h1 mt-2"
              >
                <b-button
                  variant="outline-light"
                  @click="showDesigner(el.disenador)"
                  :key="el.orden"
                >
                  <b-icon
                    icon="exclamation-circle-fill"
                    style="color: lightgray"
                  ></b-icon>
                </b-button>
              </div>
            </b-list-group-item>

            <b-list-group-item style="min-width: 40%; max-width: 40%">
              {{ el.producto }}
            </b-list-group-item>

            <b-list-group-item style="min-width: 15%; max-width: 15%">
              {{ el.unidades }} unidades
            </b-list-group-item>

            <b-list-group-item>
              <produccionsse-reposicionesPendientes
                :empleados="empleados"
                :item="el"
                :key="index"
              />
            </b-list-group-item>
          </b-list-group>
        </draggable>
      </b-container>
    </div>

    <h3 class="mt-4">Ordenes en curso</h3>

    <div v-if="isLoading">
      <b-alert
        show
        class="mt-2 mb-4"
        variant="info"
      >
        <h3>Cargando ordenes...</h3>
      </b-alert>
    </div>

    <div v-else-if="items.length === 0">
      <b-alert
        show
        class="mt-2 mb-4"
        variant="info"
      >
        <h3>No hay ordenes en curso</h3>
      </b-alert>
    </div>

    <div v-else>
      <b-container fluid>
        <draggable
          v-model="itemsFiltrados"
          @end="afterDrag"
          tag="ul"
          class="list-group"
          handle=".drag-handle-zone"
        >
          <li
            v-for="(el, index) in itemsFiltrados"
            :key="index"
            class="list-group-item"
            style="list-style: none; padding: 0; margin: 0; border: none"
          >
            <b-list-group
              class="list-group-draggable"
            >
              <b-list-group-item
                class="pb-3 drag-handle d-flex align-items-left"
              >
                <span
                  class="drag-handle-zone"
                  style="
                    cursor: grab;
                    padding-top: 4px;
                    padding-right: 16px;
                    padding-top: 12px;
                  "
                  >☰</span
                >
              </b-list-group-item>

              <b-list-group-item>
                <div>
                  <link-search :id="el.orden" :key="el.orden" />
                </div>
                <div
                  v-if="el.estatus_revision === 'Aprobado'"
                  class="h1 mt-2"
                >
                  <b-button variant="outline-light">
                    <b-icon
                      icon="exclamation-circle-fill"
                      variant="success"
                      @click="showDesigner(el.disenador)"
                      :key="el.orden"
                    ></b-icon>
                  </b-button>
                </div>

                <div v-else class="h1 mt-2">
                  <b-button
                    variant="outline-light"
                    @click="showDesigner(el.disenador)"
                    :key="el.orden"
                  >
                    <b-icon
                      icon="exclamation-circle-fill"
                      style="color: lightgray"
                    ></b-icon>
                  </b-button>
                </div>
              </b-list-group-item>

              <b-list-group-item>
                {{ el.cliente }}
              </b-list-group-item>

              <b-list-group-item>
                <div>
                  {{ el.unidades }}
                </div>
              </b-list-group-item>

              <b-list-group-item>
                <div>
                  <produccionsse-progress-bar
                    :pasos="pasos"
                    :asignacion="asignacion"
                    :emp_asignados="empleadosAsignados"
                    :empleados="empleados"
                    :por_asignar="por_asignar"
                    :depart="pActivo(el.orden)"
                    :item="el"
                    :orden_productos="filterOrdenProductos(el.orden)"
                    :reposicion_ordenes_productos="
                      reposicion_ordenes_productos
                    "
                    :lote_detalles="filterLoteDetalles(el.orden)"
                    :lotes_fisicos="lotes_fisicos"
                    :key="el.orden"
                    @reload="initTiemposDeProduccion"
                  />
                </div>
              </b-list-group-item>

              <b-list-group-item>
                <div style="margin-top: 32px">
                  <!-- ===================== INICIO DE MODIFICACIÓN ==================== -->
                  <!-- Se reemplaza @reload por los eventos de modal -->
                  <progreso-tiempo-semaforo
                    :key="el.orden"
                    @modal-shown="handleModalShown"
                    @modal-hidden="handleModalHidden"
                    :ordenesTodas="fechas"
                    :id_orden="el.orden"
                    :ordenesProyectadas2="ordenesProyectadas2"
                  />
                  <!-- ====================== FIN DE MODIFICACIÓN ====================== -->
                </div>
              </b-list-group-item>

              <b-list-group-item>
                <div class="floatme">
                  <ordenes-vinculadas
                    :vinculadas="filterVinculadas(el.acciones)"
                    :key="el.orden"
                  />
                </div>
              </b-list-group-item>

              <b-list-group-item>
                <div>
                  {{ el.estatus }}
                </div>
              </b-list-group-item>

              <b-list-group-item>
                <div>
                  <produccion-control-de-produccion-detalles-editor
                    :idorden="el.orden"
                    :item="el"
                    :detalles="el.detalles"
                    :detalle_empleado="el.detalle_empleado"
                    :key="el.orden"
                    :productos="productsFilter(el.orden)"
                  />
                </div>
              </b-list-group-item>

              <b-list-group-item>
                <div>
                  <ordenes-editar :data="el" :key="el.orden" />
                </div>
              </b-list-group-item>
            </b-list-group>
          </li>
        </draggable>
      </b-container>
    </div>
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

    async loadOrdersProduction() {
      await this.$axios
        .get(`${this.$config.API}/sse/produccion`)
        .then((res) => {
          this.items = res.data.items;
          this.empleadosAsignados = res.data.emp_asignados;
          this.por_asignar = res.data.por_asignar;
          this.ordenesLength = parseInt(res.data.items.length) + 1;
          this.pactivos = res.data.pactivos;
          this.vinculadas = res.data.vinculadas;
          this.products = res.data.productos;
          this.reposiciones_solicitadas = res.data.reposiciones_solicitadas;
          this.asignacion = res.data.asignacion;
          this.empleados = res.data.empleados;
          this.orden_productos = res.data.orden_productos;
          this.reposicion_ordenes_productos =
            res.data.reposicion_ordenes_productos;
          this.lote_detalles = res.data.lote_detalles;
          this.lotes_fisicos = res.data.lotes_fisicos;
          this.pasos = res.data.pasos;
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

    itemsFiltrados: {
      get() {
        if (!this.items.length || !this.orden_productos.length) {
          return [];
        }

        return this.items.filter((order) => {
          // Encontrar todos los productos para la orden actual
          const productosDeLaOrden = this.orden_productos.filter(
            (p) => p.id_orden === order.orden
          );

          if (productosDeLaOrden.length === 0) {
            return false; // Si no tiene productos, no se puede verificar, se excluye.
          }

          // La regla es mostrar la orden si tiene AL MENOS UN producto físico (fisico = 1)
          const tieneProductoFisico = productosDeLaOrden.some(
            (p) => p.fisico == 1
          );

          return tieneProductoFisico;
        });
      },
      set(reorderedItems) {
        // 1. Obtenemos los items que fueron filtrados (los que son solo no-físicos)
        const itemsNoFisicos = this.items.filter((order) => {
          const productosDeLaOrden = this.orden_productos.filter(
            (p) => p.id_orden === order.orden
          );
          // Un item es "no físico" si ninguno de sus productos es físico.
          // Si la orden no tiene productos, some() devuelve false, por lo que !some() es true, y se filtra correctamente.
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
.reposiciones-grid-container {
  display: grid;
  grid-template-columns: auto auto auto auto 1fr;
}

.list-group-draggable {
  display: grid;
  /* Define 10 columnas: Handle, Orden, Diseño, Cliente, Unidades, Progreso, Entrega, Vinculada, Estatus, Detalles, Acciones */
  grid-template-columns: auto 1fr 4fr 1fr 2fr 2fr 1fr 1fr auto auto;
  /* Ajusta las columnas según necesites. '1fr' para la columna de cliente que tomará el espacio restante */
}

.list-group-draggable > .list-group-item {
  border-bottom: 1px solid #4e5d6c; /* Simula el borde de la fila */
  display: flex;
  align-items: center;
}
</style>