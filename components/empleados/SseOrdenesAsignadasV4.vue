<template>
  <div>

    <div v-if="ordenesSize < 1">
      <b-row>
        <b-col>
          <b-alert :show="true" class="text-center" variant="info">
            <template v-if="loadingOrders">
              <b-spinner small type="grow" class="mr-2"></b-spinner>
              <span class="font-weight-bold">Cargando tus tareas asignadas...</span>
              <div class="text-muted">Un momento mientras obtenemos tu información.</div>
            </template>
            <template v-else>
              <h3>{{ msg }}</h3>
            </template>
          </b-alert>
        </b-col>
      </b-row>

      <!-- Eficiencia -->
      <b-row>
        <b-col>
          <b-overlay :show="loadingEfficiency" spinner-small rounded="sm">
            <empleados-RendimientoGeneral :ordenes="ordenes" :pausas="pausas"
              :departmentId="$store.state.login.currentDepartamentId" :reporteData="reporteData"
              :inputEfficiencyData="inputEfficiencyData" :isLoading="loadingEfficiency" />
          </b-overlay>
        </b-col>
      </b-row>

    </div>

    <div v-else>
      <b-container fluid>
        <!-- Botón recargar  -->
        <b-row>
          <b-col>
            <b-row class="text-center mb-4">
              <b-col>
                <b-button variant="success" @click="reloadMe">Recargar</b-button>
              </b-col>
            </b-row>
          </b-col>
        </b-row>


        <!-- Eficiencia -->
        <b-row>
          <b-col>
            <b-overlay :show="loadingEfficiency" spinner-small rounded="sm">
              <empleados-RendimientoGeneral :ordenes="ordenes" :pausas="pausas"
                :departmentId="$store.state.login.currentDepartamentId" :reporteData="reporteData"
                :inputEfficiencyData="inputEfficiencyData" :isLoading="loadingEfficiency" />
            </b-overlay>
          </b-col>
        </b-row>

        <!-- Lotes en Proceso -->
        <b-row v-if="lotesActivos.length > 0">
          <b-col>
            <b-card class="mb-4" header="Lotes en Proceso" header-tag="header">
              <div v-for="lote in lotesActivos" :key="lote.id" class="mb-3">
                <b-card no-body>
                  <template #header>
                    <h5 class="mb-0 d-flex justify-content-between align-items-center">
                      <span>
                        Lote #{{ lote.id }} <b-badge :variant="lote.estado === 'en_curso' ? 'success' : 'secondary'">{{
                          lote.estado }}</b-badge>
                      </span>
                      <small>Órdenes: {{ lote.ordenes.length }}</small>
                    </h5>
                  </template>

                  <b-list-group flush>
                    <b-list-group-item v-for="orden in lote.ordenes" :key="orden.id_orden"
                      class="d-flex align-items-center">
                      <linkSearch :id="orden.id_orden" size="sm" class="mr-3" />
                      <span class="mr-auto">
                        <strong>Orden #{{ orden.id_orden }}</strong> - {{ orden.cliente_nombre }}
                      </span>
                      <empleados-InsumosEstimadosVista :idorden="orden.id_orden"
                        :departamentoId="$store.state.login.currentDepartamentId" :dataInsumos="dataInsumos" />
                    </b-list-group-item>
                  </b-list-group>

                  <template #footer>
                    <div class="text-left">
                      <b-button v-if="lote.estado === 'pendiente'" @click="iniciarLote(lote.id)" variant="success"
                        size="sm" class="mr-2">
                        Iniciar Lote
                      </b-button>
                      <b-button v-if="lote.estado === 'en_curso'" @click="finalizarLotePorDepartamento(lote.id)"
                        variant="success" size="sm">
                        Finalizar Lote
                      </b-button>
                    </div>
                  </template>
                </b-card>
              </div>
            </b-card>
          </b-col>
        </b-row>

        <!-- Reposiciones Pendientes -->
        <b-row>
          <b-col>
            <b-overlay :show="loadingOrders" spinner-small rounded="sm">
              <b-card class="mb-4" :header="contarItems(reposicionesPendientesFiltradas.length)">
                <h3>Reposiciones Pendientes</h3>

                <b-alert class="text-center" v-if="reposicionesPendientesFiltradas.length < 1" show variant="info">
                  No tienes reposiciones pendientes</b-alert>

                <!-- TABLA DE REPOSICIONES PENDIENTES -->
                <b-table stacked :items="reposicionesPendientesVisibles" :fields="filedsLista">
                  <template #cell(orden)="row">
                    <b-row class="align-items-center flex-wrap flex-lg-nowrap" style="gap: 0.5rem">
                      <b-col cols="auto">
                        <linkSearch :id="row.item.orden" />
                      </b-col>

                      <!-- Iniciar Reposicion -->
                      <b-col cols="auto">
                        <b-button variant="info" @click="iniciarReposicion(row.item)">Iniciar</b-button>
                      </b-col>

                      <!-- ProgressBar -->
                      <b-col cols="auto">
                        <empleados-ProgressBarEmpleados :idOrden="row.item.orden" />
                      </b-col>

                      <!-- Reposición -->
                      <b-col cols="auto" style="margin-left: 0.3rem;">
                        <empleados-reposicion @reload_this="reloadMe" :id_orden="row.item.orden" :itemRep="row.item"
                          :productos="productsFilter(row.item.orden)" />
                      </b-col>

                      <!-- Ver Diseño -->
                      <b-col cols="auto">
                        <diseno-view-image :id="row.item.orden" />
                      </b-col>

                      <!-- Detalles productos -->
                      <b-col cols="auto">
                        <produccion-control-de-produccion-detalles-editor esreposicion="true" :idorden="row.item.orden"
                          :detalles-externos="row.item.detalle_reposicion" :detalles="row.item.observaciones"
                          :detalle_empleado="row.item.detalle_empleado" :productos="productsFilter(row.item.orden)" />
                      </b-col>
                    </b-row>
                  </template>

                  <!-- Lista de productos -->
                </b-table>
                <div id="sentinel-reposiciones-pendientes" class="text-center mt-2" 
                  v-show="!filter && visibleReposicionesPendientes < reposicionesPendientesFiltradas.length">
                   <b-spinner small variant="info"></b-spinner>
                   <small class="text-muted">Cargando más... {{ visibleReposicionesPendientes }} de {{ reposicionesPendientesFiltradas.length }}</small>
                 </div>
              </b-card>
            </b-overlay>
          </b-col>
        </b-row>

        <!-- Reposiciones En Curso -->
        <b-row v-if="reposicionesEnCurso.length > 0">
          <b-col>
            <b-overlay :show="loadingOrders" spinner-small rounded="sm">
              <b-card class="mb-4" :header="contarItems(reposicionesEnCursoFiltradas.length)">
                <h3>Reposiciones En Curso</h3>

                <!-- TABLA DE REPOSICIONES EN CURSO -->
                <b-table stacked :items="reposicionesEnCursoVisibles" :fields="filedsLista">
                  <template #cell(orden)="row">
                    <b-row class="align-items-center flex-wrap flex-lg-nowrap" style="gap: 0.5rem">
                      <b-col cols="auto">
                        <linkSearch :id="row.item.orden" />
                      </b-col>

                      <!-- Terminar/Pausar -->
                      <b-col cols="auto">
                        <empleados-SseOrdenesAsignadasModalExtra :pausas="pausas" :departamento="$store.state.login.dataUser.departamento
                          " :item="row.item" :items="filterOrder(row.item.orden, 'en curso')" :esreposicion="1"
                          :idlotesdetalles="row.item.id_lotes_detalles" :impresoras="impresoras" :insumosTodos="insumos"
                          :insumosimp="insumosImpresion" :insumosest="insumosEstampado" :insumoscor="insumosCorte"
                          :insumoscos="insumosCostura" :insumoslim="insumosLimpieza" :insumosrev="insumosRevision"
                          :data-insumos="dataInsumos" :orden_proceso_departamento="row.item.orden_proceso_departamento"
                          tipo="todo" :idorden="row.item.orden" :id_ordenes_productos="row.item.id_ordenes_productos"
                          @reload="reloadMe" />
                      </b-col>

                      <b-col cols="auto">
                        <empleados-InsumosEstimadosVista :idorden="row.item.orden"
                          :departamentoId="$store.state.login.currentDepartamentId" :dataInsumos="dataInsumos" />
                      </b-col>

                      <!-- ProgressBar -->
                      <b-col cols="auto">
                        <empleados-ProgressBarEmpleados :idOrden="row.item.orden" />
                      </b-col>

                      <!-- Ver Diseño -->
                      <b-col cols="auto">
                        <diseno-view-image :id="row.item.orden" />
                      </b-col>

                      <!-- Reposición (Botón Amarillo Ojo) -->
                      <b-col cols="auto" style="margin-left: 0.3rem;">
                        <empleados-reposicion @reload_this="reloadMe" :id_orden="row.item.orden" :itemRep="row.item"
                          :productos="productsFilter(row.item.orden)" />
                      </b-col>

                      <!-- Detalles (Botón Azul) -->
                      <b-col cols="auto">
                        <produccion-control-de-produccion-detalles-editor esreposicion="true" :idorden="row.item.orden"
                          :detalles-externos="row.item.detalle_reposicion"
                          :productos="productsFilter(row.item.orden)" />
                      </b-col>
                    </b-row>
                  </template>
                </b-table>
                <div id="sentinel-reposiciones-en-curso" class="text-center mt-2" 
                  v-show="!filter && visibleReposicionesEnCurso < reposicionesEnCursoFiltradas.length">
                   <b-spinner small variant="info"></b-spinner>
                   <small class="text-muted">Cargando más... {{ visibleReposicionesEnCurso }} de {{ reposicionesEnCursoFiltradas.length }}</small>
                 </div>
              </b-card>
            </b-overlay>
          </b-col>
        </b-row>

        <!-- En curso -->
        <b-row>
          <b-col>
            <b-overlay :show="loadingOrders" spinner-small rounded="sm">
              <b-card class="mb-4" :header="contarItems(dataTableEnCursoFiltradas.length)">
                <h3>Ordenes En Curso</h3>
                <b-alert class="text-center" v-if="dataTableEnCursoFiltradas.length < 1" show variant="info">No tienes tareas en
                  curso</b-alert>
                <!-- TABLA DE ORDENES EN CURSO -->
                <b-table stacked :items="dataTableEnCursoVisibles" :fields="filedsLista">
                  <template #cell(orden)="row">
                    <b-row class="align-items-center flex-wrap flex-lg-nowrap" style="gap: 0.5rem">
                      <!-- Número de orden -->
                      <b-col cols="auto">
                        <linkSearch :id="row.item.orden" />
                      </b-col>

                      <!-- Terminar Todo + PAUSAR -->
                      <b-col cols="auto">
                        <empleados-SseOrdenesAsignadasModalExtra :pausas="pausas" :departamento="$store.state.login.dataUser.departamento
                          " :item="row.item" :items="filterOrder(row.item.orden, 'en curso')" :esreposicion="0"
                          :impresoras="impresoras" :insumosTodos="insumos" :insumosimp="insumosImpresion"
                          :insumosest="insumosEstampado" :insumoscos="insumosCostura" :insumoslim="insumosLimpieza"
                          :insumosrev="insumosRevision" :insumoscor="insumosCorte" :data-insumos="dataInsumos"
                          tipo="todo" :idorden="row.item.orden" :id_ordenes_productos="row.item.id_ordenes_productos"
                          @reload="reloadMe()" :orden_proceso_departamento="row.item.orden_proceso_departamento" />
                      </b-col>

                      <b-col cols="auto">
                        <empleados-InsumosEstimadosVista :idorden="row.item.orden"
                          :departamentoId="$store.state.login.currentDepartamentId" :dataInsumos="dataInsumos" />
                      </b-col>

                      <!-- ProgressBar (después de PAUSAR) -->
                      <b-col cols="auto">
                        <empleados-ProgressBarEmpleados :idOrden="row.item.orden" />
                      </b-col>

                      <!-- Reposición -->
                      <b-col cols="auto" style="margin-left: 0.3rem;">
                        <empleados-reposicion @reload_this="reloadMe" :id_orden="row.item.orden" :itemRep="row.item" />
                      </b-col>

                      <!-- Ver Diseño -->
                      <b-col cols="auto">
                        <diseno-view-image :id="row.item.orden" />
                      </b-col>

                      <!-- Detalles -->
                      <b-col cols="auto">
                        <produccion-control-de-produccion-detalles-editor esreposicion="false" :idorden="row.item.orden"
                          :detalles="row.item.observaciones" :detalle_empleado="row.item.detalle_empleado"
                          :productos="productsFilter(row.item.orden)" />
                      </b-col>

                      <!-- Vinculadas (último) -->
                      <b-col cols="auto">
                        <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculdas(row.item.orden)" />
                      </b-col>

                    </b-row>
                  </template>
                </b-table>
                <div id="sentinel-en-curso" class="text-center mt-2" 
                  v-show="!filter && visibleEnCurso < dataTableEnCursoFiltradas.length">
                  <b-spinner small variant="info"></b-spinner>
                  <small class="text-muted">Cargando más... {{ visibleEnCurso }} de {{ dataTableEnCursoFiltradas.length }}</small>
                </div>
              </b-card>
            </b-overlay>
          </b-col>
        </b-row>

        <!-- Botón para Crear Lote -->
        <b-row v-if="esDepartamentoDeMateriales">
          <b-col class="mb-3">
            <b-button variant="primary" :disabled="ordenesSeleccionadas.length === 0" @click="crearLote">
              Crear Lote ({{ ordenesSeleccionadas.length }} seleccionadas)
            </b-button>
          </b-col>
        </b-row>

        <!-- Filtro de busqueda -->
        <b-row>
          <b-col offset-lg="8" offset-xl="8">
            <b-input-group class="mb-4" size="sm">
              <b-form-input id="filter-input" v-model="filter" type="search" placeholder="Filtrar Resultados"></b-form-input>

              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''">
                  Limpiar
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-col>
        </b-row>

        <!-- ORDENES PENDIENTES -->
        <b-row>
          <b-col>
            <b-overlay :show="loadingOrders" spinner-small rounded="sm">
              <b-card :header="contarItems(dataTablePendienteFiltradas.length)">
                <h3>Ordenes Pendientes</h3>


                <b-alert class="text-center" v-if="dataTablePendienteFiltradas.length < 1" show variant="info">No tienes tareas
                  pendientes</b-alert>

                <b-table v-else stacked :items="dataTablePendienteVisibles" :fields="filedsLista">
                  <template #cell(orden)="row">
                    <b-row class="align-items-center flex-wrap flex-lg-nowrap" style="gap: 0.5rem">
                      <!-- Checkbox de selección -->
                      <b-col v-if="esDepartamentoDeMateriales" cols="auto">
                        <b-form-checkbox v-model="ordenesSeleccionadas" :value="row.item.id_orden" size="lg"
                          :disabled="verificarOrdenProceso(row.item.orden_proceso, row.item.orden_proceso_min)" />
                      </b-col>

                      <!-- Número de orden -->
                      <b-col cols="auto">
                        <linkSearch :id="row.item.orden" />
                      </b-col>

                      <!-- Iniciar Todo -->
                      <b-col cols="auto">
                        <b-button block size="xl" variant="info" :disabled="verificarOrdenProceso(
                          row.item.orden_proceso,
                          row.item.orden_proceso_min
                        )
                          " @click="
                            iniciarTodo(row.item.orden, row.item.unidades)
                            ">Iniciar Todo
                        </b-button>
                      </b-col>

                      <b-col cols="auto">
                        <empleados-InsumosEstimadosVista :idorden="row.item.orden"
                          :departamentoId="$store.state.login.currentDepartamentId" :dataInsumos="dataInsumos" />
                      </b-col>

                      <!-- ProgressBar (después de Iniciar Todo) -->
                      <b-col cols="auto">
                        <empleados-ProgressBarEmpleados :idOrden="row.item.orden" />
                      </b-col>

                      <!-- Ver Diseño -->
                      <b-col cols="auto">
                        <diseno-view-image :id="row.item.orden" />
                      </b-col>

                      <!-- Detalles -->
                      <b-col cols="auto">
                        <produccion-control-de-produccion-detalles-editor esreposicion="false" :idorden="row.item.orden"
                          :detalles="row.item.observaciones" :detalle_empleado="row.item.detalle_empleado"
                          :productos="productsFilter(row.item.orden)" />
                      </b-col>

                      <!-- Tiempo estimado -->
                      <b-col cols="auto">
                        <b-alert :variant="filterFechaEstimada(row.item.orden).variant" show>
                          <h4 class="alert-heading">
                            {{
                              filterFechaEstimada(row.item.orden).variant_text
                            }}
                            {{
                              filterFechaEstimada(row.item.orden)
                                .fecha_estimada_fin_formateada
                            }}
                          </h4>
                        </b-alert>
                      </b-col>

                      <!-- Vinculadas (último) -->
                      <b-col cols="auto">
                        <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculdas(row.item.orden)" />
                      </b-col>
                    </b-row>
                  </template>
                </b-table>
                <div id="sentinel-pendientes" class="text-center mt-2" 
                  v-show="!filter && visiblePendientes < dataTablePendienteFiltradas.length">
                  <b-spinner small variant="info"></b-spinner>
                  <small class="text-muted">Cargando más... {{ visiblePendientes }} de {{ dataTablePendienteFiltradas.length }}</small>
                </div>
              </b-card>
            </b-overlay>
          </b-col>
        </b-row>
      </b-container>
    </div>


    <!-- MODAL PARA FINALIZAR LOTE -->
    <FinalizarLoteModal v-if="loteParaFinalizar" :show="showFinalizarLoteModal" :lote-id="loteParaFinalizar.id"
      :total-papel-utilizado="papelUtilizadoLote" :insumos="insumos" :ordenes="ordenesParaFinalizar"
      :data-insumos="dataInsumos" :impresoras="impresoras" :es-reposicion="esReposicionParaFinalizar"
      @close="showFinalizarLoteModal = false" @lote-finalizado="handleLoteFinalizado" />

    <!-- MODAL PARA FINALIZAR LOTE DE IMPRESIÓN -->
    <FinalizarLoteImpresionModal v-if="loteParaFinalizar" :show="showFinalizarImpresionModal"
      :lote-id="loteParaFinalizar.id" :insumos="insumos" :impresoras="impresoras" :ordenes="ordenesParaFinalizar"
      :es-reposicion="esReposicionParaFinalizar" @close="showFinalizarImpresionModal = false"
      @lote-finalizado="handleLoteFinalizado" />

    <!-- MODAL PARA FINALIZAR LOTE DE CORTE -->
    <FinalizarLoteCorteModal v-if="loteParaFinalizar" :show="showFinalizarCorteModal" :lote-id="loteParaFinalizar.id"
      :insumos="insumos" :ordenes="ordenesParaFinalizar" @close="showFinalizarCorteModal = false"
      @lote-finalizado="handleLoteFinalizado" />
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import mixin2 from "~/mixins/mixin-proyeccion-entrega.js";
import procesamientoOrdenesMixin from "~/mixins/procesamientoOrdenes.js";
import mixintime from "~/mixins/mixin-time.js";
import FinalizarLoteModal from '~/components/empleados/FinalizarLoteModal.vue'
import FinalizarLoteImpresionModal from '~/components/empleados/FinalizarLoteImpresionModal.vue'
import FinalizarLoteCorteModal from '~/components/empleados/FinalizarLoteCorteModal.vue';
import CorteItemView from '~/components/produccion/CorteItemView.vue';

// import { log } from 'console'
export default {
  components: {
    FinalizarLoteModal,
    FinalizarLoteImpresionModal,
    FinalizarLoteCorteModal,
    CorteItemView,
  },
  data() {
    return {
      // Modal de finalización
      showFinalizarLoteModal: false,
      showFinalizarImpresionModal: false,
      showFinalizarCorteModal: false,
      loteParaFinalizar: null,
      ordenesParaFinalizar: [],
      esReposicionParaFinalizar: false,
      papelUtilizadoLote: 0,

      // Propiedades para la nueva funcionalidad de lotes
      ordenesSeleccionadas: [],
      lotesActivos: [],

      // sourceEvent: null, // Variable para inicializar eventSource y utilizarla poseteriormente en la sfunciones para obtener la informacion de las ordenes asignadas
      orden_proceso_departamento: null,
      disIniciar: false,
      filter: null,
      includedFields: ["orden"],
      promptHTML: "HTML PROMPT!!!",
      prompInputType: "text",
      value: 45,
      // Infinite scroll - carga 10 en 10
      itemsPerBatch: 10,
      visibleReposicionesPendientes: 10,
      visibleReposicionesEnCurso: 10,
      visibleEnCurso: 10,
      visiblePendientes: 10,
      loadingObservers: {},
      loadingReposicionesPendientes: false,
      loadingReposicionesEnCurso: false,
      loadingEnCurso: false,
      loadingPendientes: false,
      msg: "Estamos buscando sus tareas por favor espere...",
      enCurso: null,
      dataInsumos: [],
      fechas: [],
      fechasResult: [],
      departamento: "",
      dataOrdenEnCurso: [],
      showAlert: true,
      ordenes: [],
      reposiciones: [],
      vinculadas: [],
      productos: [],
      pausas: [],
      insumos: [],
      pagos: [],
      overlay: false,
      reload: false,
      filedsLista: [
        {
          key: "orden",
          label: "",
          variant: "",
        },
      ],
      impresoras: [],


      // New loading states and data for sectioned loading
      loadingEfficiency: false,
      loadingOrders: false,
      isFetchingOrders: false,
      isFetchingEfficiency: false,
      lastFetchOrdersAt: null,
      lastFetchEfficiencyAt: null,
      fetchEfficiencyPromise: null,
      reporteData: null,
      inputEfficiencyData: null,
      eficienciaOrdenCache: {},
      dataInsumosCacheOrderIdsKey: "",


      fields2: [
        {
          key: "orden",
          label: "",
          variant: "",
        },
      ],
      fieldsOrdenesEnCurso: [
        {
          key: "orden",
          label: "Orden",
        },
        {
          key: "producto",
          label: "Producto",
        },
        {
          key: "unidades",
          label: "Unidades",
        },
        {
          key: "piezas_actuales",
          label: "Piezas Actuales",
        },
        {
          key: "talla",
          label: "Talla",
        },
        {
          key: "corte",
          label: "Corte",
        },
        {
          key: "tela",
          label: "Tela",
        },
        {
          key: "id_lotes_detalles",
          label: " ",
        },
      ],

      fields: [
        {
          key: "departamento",
          label: "Paso Actual",
        },
        {
          key: "producto",
          thClass: "Porducto",
        },
        {
          key: "unidades_solicitadas",
          label: "Unidades",
        },

        {
          key: "id_empleado",
          thClass: "d-none",
          tdClass: "d-none",
        },
        {
          key: "talla",
          label: "Talla",
        },
        {
          key: "corte",
          label: "Corte",
        },
        {
          key: "tela",
          label: "Tela",
        },
        {
          key: "orden",
          label: ".",
        },
      ],
      isReloading: false,
    };
  },

  mixins: [mixin, mixin2, procesamientoOrdenesMixin, mixintime],

  watch: {
    reload(val) {
      // const p = this.dataOrdenEnCurso.push('val')
      this.dataOrdenEnCurso = [{ data: "hola" }];

      console.log("cargar informacion en el cuadro informativo", p);
      return true;
    },
  },

  computed: {
    esDepartamentoDeMateriales() {
      const depto = this.$store.state.login.currentDepartament;
      return ['Estampado', 'Corte', 'Impresión'].includes(depto);
    },

    ordenProceso() {
      if (this.$store.getters["login/getDepartamentosOrdenProceso"]) {
        return this.$store.getters["login/getDepartamentosOrdenProceso"][0];
      } else {
        return 0;
      }
    },

    insumosImpresion() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter(
        (item) => item.departamento === "Impresión"
      );
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosEstampado() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter(
        (item) => item.departamento === "Telas" || item.departamento === "Estampado"
      );
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosCostura() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter(
        (item) => item.departamento === "Costura"
      );
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosRevision() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter(
        (item) => item.departamento === "Producción"
      );
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosLimpieza() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter(
        (item) => item.departamento === "Producción"
      );
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosCorte() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter(
        (item) => item.departamento === "Telas"
      );
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    dataTableEnCurso() {
      const ordenesEnLotes = this.lotesActivos.flatMap((lote) =>
        lote.ordenes.map((o) => o.id_orden)
      )

      let enCurso = []
      if (this.$store.state.login.currentDepartament === 'Impresión') {
        enCurso = this.ordenes
          .filter(
            (el) =>
              !ordenesEnLotes.includes(el.id_orden) &&
              el.fecha_terminado == null &&
              ((el.fecha_inicio != null &&
                /* el.en_tintas === 0 && */
                el.en_reposiciones === 0) ||
                el.status === 'pausada') // Include paused orders
          )
          .map((el) => {
            return {
              ...el,
              esreposicion: false,
              en_reposiciones: el.en_reposiciones,
              id_orden: el.id_orden,
              fecha_hora: el.fecha_inicio || el.fecha_entrega || null,
              extra: el.extra,
              orden: el.id_orden,
              urgent: el.prioridad,
              entrega: el.fecha_entrega,
              id_lotes_detalles: el.id_lotes_detalles_empleados_asignados,
              lotes_detalles_empleados_asignados:
                el.lotes_detalles_empleados_asignados,
              unidades: el.unidades,
              id_woo: el.id_woo,
              en_inv_mov: el.en_inv_mov,
              en_tintas: el.en_tintas,
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
              observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
              orden_proceso_departamento: el.orden_proceso_departamento,
            }
          })
          .reduce((acc, item) => {
            if (acc.filter((row) => row.orden === item.orden).length === 0) {
              acc.push(item)
            }
            return acc
          }, [])
      } else if (this.$store.state.login.currentDepartament === 'Estampado') {
        enCurso = this.ordenes
          .filter(
            (el) =>
              !ordenesEnLotes.includes(el.id_orden) &&
              el.fecha_terminado == null &&
              (el.progreso === 'en curso' || el.status === 'pausada')
          )
          .map((el) => {
            return {
              ...el,
              fecha_hora: el.fecha_inicio || el.fecha_entrega || null,
              extra: el.extra,
              orden: el.id_orden,
              urgent: el.prioridad,
              entrega: el.fecha_entrega,
              id_lotes_detalles: el.id_lotes_detalles,
              lotes_detalles_empleados_asignados:
                el.lotes_detalles_empleados_asignados,
              unidades: el.unidades,
              id_woo: el.id_woo,
              en_tintas: el.en_tintas,
              en_inv_mov: el.en_inv_mov,
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
              observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
              orden_proceso_departamento: el.orden_proceso_departamento,
            }
          })
          .reduce((acc, item) => {
            if (acc.filter((row) => row.orden === item.orden).length === 0) {
              acc.push(item)
            }
            return acc
          }, [])
      } else if (this.$store.state.login.currentDepartament === 'Corte') {
        enCurso = this.ordenes
          .filter(
            (el) =>
              !ordenesEnLotes.includes(el.id_orden) &&
              el.fecha_terminado == null &&
              (el.progreso === 'en curso' || el.status === 'pausada') &&
              el.en_reposiciones === 0
          )
          .map((el) => {
            return {
              ...el,
              fecha_hora: el.fecha_inicio || el.fecha_entrega || null,
              extra: el.extra,
              orden: el.id_orden,
              urgent: el.prioridad,
              entrega: el.fecha_entrega,
              id_lotes_detalles: el.id_lotes_detalles,
              lotes_detalles_empleados_asignados:
                el.lotes_detalles_empleados_asignados,
              unidades: el.unidades,
              id_woo: el.id_woo,
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
              en_tintas: el.en_tintas,
              en_inv_mov: el.en_inv_mov,
              observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
              orden_proceso_departamento: el.orden_proceso_departamento,
            }
          })
          .reduce((acc, item) => {
            if (acc.filter((row) => row.orden === item.orden).length === 0) {
              acc.push(item)
            }
            return acc
          }, [])
      } else {
        enCurso = this.ordenes
          .filter(
            (el) =>
              !ordenesEnLotes.includes(el.id_orden) &&
              el.fecha_terminado == null &&
              (el.progreso === 'en curso' || el.status === 'pausada') &&
              el.en_reposiciones === 0 &&
              el.fecha_inicio != null
          )
          .map((el) => {
            return {
              ...el,
              fecha_hora: el.fecha_inicio || el.fecha_entrega || null,
              extra: el.extra,
              orden: el.id_orden,
              urgent: el.prioridad,
              entrega: el.fecha_entrega,
              id_lotes_detalles: el.id_lotes_detalles,
              lotes_detalles_empleados_asignados:
                el.lotes_detalles_empleados_asignados,
              unidades: el.unidades,
              id_woo: el.id_woo,
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
              en_tintas: el.en_tintas,
              en_inv_mov: el.en_inv_mov,
              observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
              orden_proceso_departamento: el.orden_proceso_departamento,
            }
          })
          .reduce((acc, item) => {
            if (acc.filter((row) => row.orden === item.orden).length === 0) {
              acc.push(item)
            }
            return acc
          }, [])
      }

      return enCurso.sort((a, b) => {
        const dateA = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0;
        const dateB = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0;
        return dateA - dateB;
      });
    },

    dataTablePendiente() {
      const ordenesEnLotes = this.lotesActivos.flatMap(lote => lote.ordenes.map(o => o.id_orden));
      return (
        this.ordenes
          .filter((el) => el.fecha_inicio === null && !ordenesEnLotes.includes(el.id_orden))
          // .filter((el) => el.progreso == "por iniciar")
          .map((el) => {
            return {
              ...el,
              fecha_hora: el.fecha_inicio || el.fecha_entrega || null,
              id_orden: el.id_orden,
              esreposicion: false,
              en_reposiciones: el.en_reposiciones,
              orden: el.id_orden,
              urgent: el.prioridad,
              entrega: el.fecha_entrega,
              id_lotes_detalles: el.id_lotes_detalles,
              unidades: el.unidades,
              orden_proceso: el.orden_proceso,
              orden_proceso_departamento: el.orden_proceso_departamento,
              orden_proceso_min: el.orden_proceso_min,
              observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
              orden_proceso_departamento: el.orden_proceso_departamento,
            };
          })
          .reduce((acc, item) => {
            // console.log('item to push', item)

            if (acc.filter((row) => row.orden === item.orden).length === 0) {
              acc.push(item);
            }
            return acc;
          }, [])
          .sort((a, b) => {
            const dateA = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0;
            const dateB = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0;
            return dateA - dateB;
          })
      );
    },

    dataTableReposiciones() {
      // DEBUG: Ver qué llega del backend
      console.log('REPOSICIONES RAW:', this.reposiciones);

      return (
        this.reposiciones
          .map((el) => {
            // DEBUG: Ver fechas individuales
            // console.log(`Repo ID ${el.id_reposicion}: Inicio=${el.fecha_inicio}, Fin=${el.fecha_terminado}`);
            return {
              ...el,
              fecha_hora: el.fecha_inicio || el.fecha_entrega || null,
              esreposicion: true,
              en_reposiciones: 1,
              orden: el.id_orden,
              id_woo: el.id_producto,
              urgent: el.prioridad,
              entrega: el.fecha_entrega,
              // id_lotes_detalles: el.id_lotes_detalles,
              unidades: el.unidades,
              //   observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
              detalle_reposicion: el.detalle_reposicion,
              id_ordenes_productos: el.id_ordenes_productos,
              fecha_inicio: el.fecha_inicio,
              fecha_terminado: el.fecha_terminado,
              id_reposicion: el.id_reposicion,
            };
          })
          .sort((a, b) => {
            const dateA = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0;
            const dateB = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0;
            return dateA - dateB;
          })
      );
    },

    // Reposiciones Pendientes: sin fecha de inicio
    reposicionesPendientes() {
      return this.dataTableReposiciones
        .filter(r => !r.fecha_inicio)
        .sort((a, b) => {
          const dateA = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0;
          const dateB = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0;
          return dateA - dateB;
        });
    },

    // Reposiciones En Curso: con fecha de inicio pero sin fecha de término
    reposicionesEnCurso() {
      return this.dataTableReposiciones
        .filter(r => r.fecha_inicio && !r.fecha_terminado)
        .sort((a, b) => {
          const dateA = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0;
          const dateB = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0;
          return dateA - dateB;
        });
    },

    // --- LOGICA /TEST: FILTRAR -> RECORTAR ---

    reposicionesPendientesFiltradas() {
      let data = this.reposicionesPendientes;
      if (this.filter && this.filter.trim()) {
        const st = this.filter.trim().toLowerCase();
        data = data.filter(item => {
          if (!item) return false;
          return (item.orden && String(item.orden).toLowerCase().includes(st)) ||
                 (item.cliente && String(item.cliente).toLowerCase().includes(st));
        });
      }
      return data;
    },

    reposicionesEnCursoFiltradas() {
      let data = this.reposicionesEnCurso;
      if (this.filter && this.filter.trim()) {
        const st = this.filter.trim().toLowerCase();
        data = data.filter(item => {
          if (!item) return false;
          return (item.orden && String(item.orden).toLowerCase().includes(st)) ||
                 (item.cliente && String(item.cliente).toLowerCase().includes(st));
        });
      }
      return data;
    },

    dataTableEnCursoFiltradas() {
      let data = this.dataTableEnCurso;
      if (this.filter && this.filter.trim()) {
        const st = this.filter.trim().toLowerCase();
        data = data.filter(item => {
          if (!item) return false;
          return (item.orden && String(item.orden).toLowerCase().includes(st)) ||
                 (item.cliente && String(item.cliente).toLowerCase().includes(st));
        });
      }
      return data;
    },

    dataTablePendienteFiltradas() {
      let data = this.dataTablePendiente;
      if (this.filter && this.filter.trim()) {
        const st = this.filter.trim().toLowerCase();
        data = data.filter(item => {
          if (!item) return false;
          return (item.orden && String(item.orden).toLowerCase().includes(st)) ||
                 (item.cliente && String(item.cliente).toLowerCase().includes(st));
        });
      }
      return data;
    },

    // Infinite scroll - items visibles de reposiciones pendientes
    reposicionesPendientesVisibles() {
      return this.reposicionesPendientesFiltradas.slice(0, this.visibleReposicionesPendientes);
    },

    // Infinite scroll - items visibles de reposiciones en curso
    reposicionesEnCursoVisibles() {
      return this.reposicionesEnCursoFiltradas.slice(0, this.visibleReposicionesEnCurso);
    },

    // Infinite scroll - items visibles de ordenes en curso
    dataTableEnCursoVisibles() {
      return this.dataTableEnCursoFiltradas.slice(0, this.visibleEnCurso);
    },

    // Infinite scroll - items visibles de ordenes pendientes
    dataTablePendienteVisibles() {
      return this.dataTablePendienteFiltradas.slice(0, this.visiblePendientes);
    },

    ordersListPendiente() {
      if (!Array.isArray(this.pagos)) {
        this.pagos = [];
      }

      let tmp = this.ordenes
        .map((item) => {
          let txtVariant;
          if (parseInt(item.prioridad)) {
            txtVariant = "danger";
          } else {
            txtVariant = "success";
          }
          return {
            orden: item.id_orden,
            variant: txtVariant,
            entrega: item.fecha_entrega,
            inicio: item.fecha_inicio,
            terminado: item.fecha_terminado,
            urgent: this.checkPrioridad(item.prioridad),
          };
        })
        .reduce((acc, item) => {
          // console.log('item to push', item)

          if (acc.filter((row) => row.orden === item.orden).length === 0) {
            acc.push(item);
          }
          return acc;
        }, []);
      return tmp;
    },

    ordersListEnCurso() {
      if (!Array.isArray(this.pagos)) {
        this.pagos = [];
      }

      let tmp = this.ordenes
        .map((item) => {
          let txtVariant;
          if (parseInt(item.prioridad)) {
            txtVariant = "danger";
          } else {
            txtVariant = "success";
          }
          return {
            orden: item.id_orden,
            variant: txtVariant,
            entrega: item.fecha_entrega,
            terminado: item.fecha_terminado,
            inicio: item.fecha_inicio,
            urgent: this.checkPrioridad(item.prioridad),
          };
        })
        .reduce((acc, item) => {
          // console.log('item to push', item)

          if (acc.filter((row) => row.orden === item.orden).length === 0) {
            acc.push(item);
          }
          return acc;
        }, []);
      return tmp;
    },

    ordenesSize() {
      if (this.loadingOrders) {
        this.msg = 'Cargando órdenes asignadas...';
        return 0;
      }

      const size = parseInt(this.ordenes.length || 0);
      if (size < 1) {
        this.msg = 'No tienes tareas asignadas';
      } else {
        this.msg = '';
      }

      return size;
    },
  },

  methods: {
    // =================================================================
    // INFINITE SCROLL - Cargar 10 en 10 automáticamente
    // =================================================================

    loadMoreReposicionesPendientes() {
      if (this.visibleReposicionesPendientes < this.reposicionesPendientes.length) {
        this.visibleReposicionesPendientes += this.itemsPerBatch;
      }
    },

    loadMoreReposicionesEnCurso() {
      if (this.visibleReposicionesEnCurso < this.reposicionesEnCurso.length) {
        this.visibleReposicionesEnCurso += this.itemsPerBatch;
      }
    },

    loadMoreEnCurso() {
      if (this.visibleEnCurso < this.dataTableEnCurso.length) {
        this.visibleEnCurso += this.itemsPerBatch;
      }
    },

    loadMorePendientes() {
      if (this.visiblePendientes < this.dataTablePendiente.length) {
        this.visiblePendientes += this.itemsPerBatch;
      }
    },

    setupInfiniteScroll() {
      const sections = [
        { name: 'ReposicionesPendientes', loadMore: this.loadMoreReposicionesPendientes, id: 'sentinel-reposiciones-pendientes' },
        { name: 'ReposicionesEnCurso', loadMore: this.loadMoreReposicionesEnCurso, id: 'sentinel-reposiciones-en-curso' },
        { name: 'EnCurso', loadMore: this.loadMoreEnCurso, id: 'sentinel-en-curso' },
        { name: 'Pendientes', loadMore: this.loadMorePendientes, id: 'sentinel-pendientes' }
      ];

      // Desconectar observadores previos si existen
      if (this.loadingObservers && Object.keys(this.loadingObservers).length > 0) {
        Object.values(this.loadingObservers).forEach(observer => {
          if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect();
          }
        });
        this.loadingObservers = {};
      }

      sections.forEach(section => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this[`loading${section.name}`]) {
              this[`loading${section.name}`] = true;
              section.loadMore();
              this.$nextTick(() => {
                this[`loading${section.name}`] = false;
              });
            }
          });
        }, { threshold: 0.1 });

        this.loadingObservers[section.name] = observer;

        const el = document.getElementById(section.id);
        if (el) {
          observer.observe(el);
        }
      });
    },

    // =================================================================
    // MÉTODOS PARA LA GESTIÓN DE LOTES (NUEVA LÓGICA)
    // =================================================================

    async getLotesActivos() {
      const payload = new URLSearchParams();
      payload.append('id_empleado', this.$store.state.login.dataUser.id_empleado);
      payload.append('id_departamento', this.$store.state.login.currentDepartamentId);

      await this.$axios.post(`${this.$config.API}/lotes/activos`, payload)
        .then(res => {
          this.lotesActivos = res.data;
        })
        .catch(err => {
          console.error('Error al cargar los lotes activos:', err);
          this.lotesActivos = []; // Asegurarse de que esté vacío en caso de error
        });
    },

    /**
     * Lógica central para iniciar un lote y todas sus órdenes.
     * No tiene confirmaciones, solo ejecuta las acciones.
     * @param {number} loteId - El ID del lote a iniciar.
     * @param {Array<number>} ordenesDelLote - Un array con los IDs de las órdenes a iniciar.
     */
    async _ejecutarInicioDeLote(loteId, ordenesDelLote) {
      this.overlay = true;
      try {
        // 1. Marcar el lote como 'en_curso' en el backend.
        await this.$axios.post(`${this.$config.API}/lotes/${loteId}/iniciar`);

        // 2. Mapear las órdenes a promesas de `registrarEstado`.
        const promesas = ordenesDelLote.map(idOrden => {
          const ordenCompleta = this.ordenes.find(o => o.id_orden === idOrden);
          if (ordenCompleta) {
            return this.registrarEstado(
              "inicio",
              ordenCompleta.id_orden,
              ordenCompleta.unidades,
              false, // es_reposicion
              ordenCompleta.lotes_detalles_empleados_asignados
            );
          }
          console.warn(`No se encontraron los detalles completos para la orden #${idOrden} en el lote.`);
          return Promise.resolve();
        });

        await Promise.all(promesas);

        this.$fire({
          title: 'Éxito',
          html: `<p>El lote #${loteId} y sus ${ordenesDelLote.length} órdenes han sido iniciados correctamente.</p>`,
          type: 'success',
        });

      } catch (err) {
        this.$fire({
          title: 'Error',
          html: `<p>Ocurrió un error al iniciar las tareas del lote.</p><p>${err}</p>`,
          type: 'warning',
        });
      } finally {
        this.ordenesSeleccionadas = [];
        // Agregamos un pequeño retraso para dar tiempo a la BD a procesar
        setTimeout(() => {
          this.reloadMe();
          this.overlay = false;
        }, 1000); // 1 segundo de retraso
      }
    },

    /**
     * Método llamado por el botón "Crear Lote".
     * Crea el lote y lo inicia automáticamente.
     */
    crearLote() {
      if (this.ordenesSeleccionadas.length < 2) {
        this.$fire({
          title: 'Información',
          html: '<p>Debe seleccionar más de una orden para poder crear un lote.</p>',
          type: 'info',
        });
        return;
      }

      const ordenesParaLote = [...this.ordenesSeleccionadas];
      this.$confirm(
        `¿Desea crear un nuevo lote con ${ordenesParaLote.length} órdenes? El lote se iniciará automáticamente.`,
        'Confirmar Creación e Inicio',
        'question'
      ).then(() => {
        this.overlay = true;
        const payload = new URLSearchParams();
        payload.append('id_empleado', this.$store.state.login.dataUser.id_empleado);
        payload.append('id_departamento', this.$store.state.login.currentDepartamentId);
        payload.append('ordenes', ordenesParaLote.join(','));

        this.$axios
          .post(`${this.$config.API}/lotes`, payload)
          .then(res => {
            const newLoteId = res.data.id_lote;
            // Inmediatamente después de crear, llamamos a la lógica de inicio.
            // Usamos $nextTick para darle tiempo a la UI a que se actualice si es necesario,
            // aunque la lógica ahora no depende de `lotesActivos` para el inicio inmediato.
            this.$nextTick(() => {
              this._ejecutarInicioDeLote(newLoteId, ordenesParaLote);
            });
          })
          .catch(err => {
            this.$fire({
              title: 'Error',
              html: `<p>No se pudo crear el lote.</p><p>${err}</p>`,
              type: 'warning',
            });
            this.overlay = false;
          });
      }).catch(() => {
        // User cancelled
      });
    },

    /**
     * Método llamado por el botón "Iniciar Lote" en un lote ya existente.
     */
    iniciarLote(loteId) {
      const lote = this.lotesActivos.find(l => l.id === loteId);
      if (!lote) return;

      const ordenesDelLote = lote.ordenes.map(o => o.id_orden);
      this.$confirm(
        `¿Desea iniciar el Lote #${loteId}?`,
        'Confirmar Inicio',
        'question'
      ).then(() => {
        this._ejecutarInicioDeLote(loteId, ordenesDelLote);
      }).catch(() => {
        // El usuario canceló
      });
    },

    /**
     * Método llamado por el botón "Terminar Lote".
     */
    finalizarLotePorDepartamento(loteId) {
      const lote = this.lotesActivos.find((l) => l.id === loteId)
      if (!lote || !lote.ordenes || lote.ordenes.length === 0) {
        this.$fire({
          title: 'Error',
          html: '<p>No se pudo encontrar el lote o el lote no contiene órdenes.</p>',
          type: 'error',
        })
        return
      }

      this.loteParaFinalizar = lote
      this.ordenesParaFinalizar = lote.ordenes.map(lo => {
        // Buscar todos los productos de esta orden en la lista de tareas asignadas
        const fullOrders = this.ordenes.filter(o => o.id_orden === lo.id_orden);
        // Recoger todas las telas únicas de los productos de esta orden
        const telas = [...new Set(fullOrders.filter(o => o.tela_vendedor).map(o => o.tela_vendedor))];
        return {
          ...lo,
          tela_vendedor: telas.join(', ')
        };
      });
      // Detectar si es un lote de reposiciones (si alguna orden tiene en_reposiciones === 1)
      this.esReposicionParaFinalizar = lote.ordenes.some(o => o.en_reposiciones === 1 || o.esreposicion === true)
      const depto = this.$store.state.login.currentDepartament

      // Para todos los departamentos (incluyendo Impresión), usar el modal unificado
      let papelConsumido = 0
      const ordenesIdsDelLote = lote.ordenes.map((o) => o.id_orden)
      const ordenesCompletasDelLote = this.ordenes.filter((o) =>
        ordenesIdsDelLote.includes(o.id_orden)
      )

      ordenesCompletasDelLote.forEach((orden) => {
        if (orden.valor_inicial && orden.valor_final) {
          papelConsumido +=
            parseFloat(orden.valor_inicial) - parseFloat(orden.valor_final)
        }
      })

      this.papelUtilizadoLote = papelConsumido
      this.showFinalizarLoteModal = true
    },

    handleLoteFinalizado() {
      this.showFinalizarLoteModal = false
      this.showFinalizarImpresionModal = false
      this.showFinalizarCorteModal = false
      this.loteParaFinalizar = null
      this.reloadMe()
    },

    // =================================================================
    // MÉTODOS DE SOPORTE Y LÓGICA EXISTENTE (MERGED)
    // =================================================================

    verificarOrdenProceso(idOrdenProceso, min) {
      let IdVerificado = null;
      if (idOrdenProceso === null) {
        IdVerificado = min;
      } else {
        IdVerificado = idOrdenProceso;
      }
      if (IdVerificado == this.$store.state.login.currentOrdenProceso) {
        return false;
      } else {
        return true;
      }
    },

    filterFechaEstimada(idOrden) {
      if (!Array.isArray(this.fechasResult)) return { variant: '' };

      const filtrado = this.fechasResult.filter((el) => el.id_orden == idOrden);
      if (filtrado.length) {
        const fechaEstimada = filtrado[0].tareas
          .filter(
            (el) =>
              el.id_departamento ===
              this.$store.state.login.currentDepartamentId
          )
          .map((el) => {
            return {
              fecha_estimada_fin_formateada: el.fecha_estimada_fin_formateada,
              variant: el.variant,
              variant_text: el.variant_text,
            };
          });
        return fechaEstimada[0] || { variant: '', variant_text: 'No est.', fecha_estimada_fin_formateada: '' };
      } else {
        return { variant: '', variant_text: 'No reg.', fecha_estimada_fin_formateada: '' };
      }
    },
    contarItems(cantidad) {
      return `Total ${cantidad}`;
    },
    filterVinculdas(id_orden) {
      return this.vinculadas.filter((el) => el.id_father === id_orden);
    },

    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },

    productsFilter(id) {
      const products = this.productos.filter((el) => el.id_orden == id);
      return products.map((prod) => {
        const repo = this.reposiciones.find(
          (r) => r.id_ordenes_productos == prod.id_ordenes_productos
        );
        if (repo) {
          return {
            ...prod,
            detalle_reposicion:
              repo.detalle_emisor ||
              repo.detalle_reposicion || // Por si ya viene calculado
              repo.detalle ||
              prod.detalle_reposicion,
          };
        }
        return prod;
      });
    },

    productsFilter_old(id) {
      const seen = new Set();
      return this.productos.filter((el) => {
        const key = JSON.stringify(el);
        if (seen.has(key)) {
          return false;
        } else {
          seen.add(key);
          return el.id_orden == id;
        }
      });
    },

    setStatusButton(status, urgent) {
      if (urgent === "0") {
        return status;
      } else {
        return "danger";
      }
    },

    async registrarEstado(tipo, id_orden, unidades, es_reposicion = false, id_lotes_detalles_param = null, id_reposicion = null) {
      const data = new URLSearchParams();
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("id_departamento", this.$store.state.login.currentDepartamentId);
      data.set("id_orden", id_orden);
      data.set("id_lotes_detalles", id_lotes_detalles_param);
      data.set("tipo", tipo);
      data.set("es_reposicion", es_reposicion);
      data.set("id_reposicion", id_reposicion);
      data.set("unidades", unidades);
      data.set("departamento", this.$store.state.login.currentDepartament);
      data.set("orden_proceso", this.$store.state.login.currentOrdenProceso);
      return this.$axios.post(`${this.$config.API}/registrar-paso-empleado`, data);
    },

    async rendimiento(valor, idOrden) {
      const data = new URLSearchParams();
      data.set("id_orden", idOrden);
      data.set("valor", valor);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("departamento", this.$store.state.login.currentDepartament);
      await this.$axios
        .post(`${this.$config.API}/insumos/rendimiento`, data)
        .then((res) => {
          console.log("Rendimiento enviado");
        });
    },

    iniciarTodo(idOrden, unidades) {
      this.$confirm(
        ``,
        `¿Desea inicar todas las tareas de la Orden ${idOrden}?`,
        "question"
      )
        .then(() => {
          this.overlay = true;
          this.registrarEstado("inicio", idOrden, unidades, false, this.ordenes.find(o => o.id_orden === idOrden).lotes_detalles_empleados_asignados)
            .then(() => {
              if (!this.isLastDepartment()) {
                this.sendMsgCustom(idOrden, 'paso', this.$store.state.login.currentDepartamentId);
              }
              this.reloadMe();
            })
            .catch((err) => {
              this.$fire({
                title: "Error",
                html: `<p>No se pudo registrar la acción.</p><p>${err}</p>`,
                type: "warning",
              });
            })
            .finally(() => {
              this.overlay = false;
            });
        })
    },

    iniciarReposicion(item) {
      this.$confirm(
        ``,
        `¿Desea iniciar la reposición de la Orden ${item.orden}?`,
        "question"
      )
        .then(() => {
          this.overlay = true;
          this.registrarEstado("inicio", item.orden, item.unidades, true, null, item.id_reposicion)
            .then(() => {
              this.reloadMe();
            })
            .catch((err) => {
              this.$fire({
                title: "Error",
                html: `<p>No se pudo registrar la acción.</p><p>${err}</p>`,
                type: "warning",
              });
            })
            .finally(() => {
              this.overlay = false;
            });
        })
    },

    isLastDepartment() {
      const departamentos = this.$store.state.login.departamentos;
      if (!departamentos || departamentos.length === 0) {
        return false;
      }

      const departamentosConPaso = departamentos.filter(
        (dep) => dep.asignar_numero_de_paso
      );

      if (departamentosConPaso.length === 0) {
        return false;
      }

      const maxOrdenProceso = Math.max(
        ...departamentosConPaso.map((dep) => dep.orden_proceso)
      );

      const currentOrdenProceso = this.$store.state.login.currentOrdenProceso;

      return currentOrdenProceso === maxOrdenProceso;
    },

    checkTerminar(idOrden, items) {
      if (this.$store.state.login.currentDepartament === "Impresión") {
        alert("Solicitar números de rollos de papel");
      } else if (this.$store.state.login.currentDepartament === "Estampado") {
        alert("Solicitar datos de Estampado");
      } else if (this.$store.state.login.currentDepartament === "Corte") {
        alert("Solicitar datos de Corte");
      } else {
        alert("No preguntar nada, empleado normal");
      }
    },

    getDataTable(data) {
      this.dataInsumos = data;
    },

    compararFecha(fecha) {
      const fechaActual = new Date();
      const [dia, mes, anio] = fecha.split("-");
      const fechaIngresada = new Date(anio, mes - 1, dia);
      if (fechaIngresada <= fechaActual) {
        return fecha;
      } else {
        fechaIngresada.setDate(fechaIngresada.getDate() - 1);
        const nuevoDia = fechaIngresada.getDate();
        const nuevoMes = fechaIngresada.getMonth() + 1;
        const nuevoAnio = fechaIngresada.getFullYear();
        const nuevoValor = `${nuevoDia.toString().padStart(2, "0")}-${nuevoMes
          .toString()
          .padStart(2, "0")}-${nuevoAnio}`;
        return nuevoValor;
      }
    },

    checkPrioridad(val) {
      const prioridad = parseInt(val);
      let variant = "";
      if (prioridad) {
        variant = "danger";
      } else {
        variant = "info";
      }
      return variant;
    },

    createArray(obj) {
      const arr = [];
      arr.push(obj);
      console.log(" creata array", arr);
      return arr;
    },

    filterOrder(id_orden, tipo) {
      let products;
      if (tipo === "en curso") {
        if (this.departamento === "Impresión") {
          products = this.ordenes.filter(
            (item) =>
              item.id_orden === id_orden &&
              item.progreso === tipo
            /* && item.en_tintas === 0 */
          );
        } else {
          products = this.ordenes.filter(
            (item) => item.id_orden === id_orden && (item.progreso === tipo || item.status === "pausada")
          );
        }
      } else if (tipo === "todo") {
        products = this.ordenes.filter(
          (item) => item.id_orden === id_orden && !item.fecha_inicio != null
        );
      } else {
        products = this.ordenes.filter(
          (item) => item.id_orden === id_orden && item.progreso === tipo
        );
      }
      return products;
    },

    async getOrdenesAsignadas() {
      if (this.isFetchingOrders) {
        console.log('getOrdenesAsignadas already in progress, skipping');
        return;
      }

      const now = Date.now();
      if (this.lastFetchOrdersAt && now - this.lastFetchOrdersAt < 5000) {
        console.log('getOrdenesAsignadas debounced (5s)');
        return;
      }
      this.lastFetchOrdersAt = now;

      this.isFetchingOrders = true;
      console.log('[SseOrdenesAsignadasV4] getOrdenesAsignadas called');
      this.loadingOrders = true; // Start loading orders
      await this.$axios
        .get(
          `${this.$config.API}/empleados/ordenes-asignadas/v2/${this.emp}/${this.$store.state.login.currentDepartamentId}/${this.$store.state.login.currentOrdenProceso}`
        )
        .then(async (resp) => {
          if (resp.data.ordenes.length === 0) {
            this.msg = "Usted no tiene ordenes asignadas";
          }
          this.ordenes = resp.data.ordenes;
          this.reposiciones = resp.data.reposiciones;
          this.vinculadas = resp.data.vinculadas;
          this.productos = resp.data.productos;
          this.pausas = resp.data.pausas;

          // Load dataInsumos for all assigned orders
          await this.loadDataInsumos();

          // After orders are loaded, fetch efficiency data
          this.fetchEfficiency();
        })
        .finally(() => {
          this.loadingOrders = false; // Stop loading orders
          this.isFetchingOrders = false;
        });
    },

    async loadDataInsumos() {
      try {
        // Get unique order IDs from ordenes/reposiciones/vinculadas
        const allOrdenes = [...(this.ordenes || []), ...(this.reposiciones || []), ...(this.vinculadas || [])];
        const ordenesIds = [...new Set(allOrdenes.map(o => o.id_orden || o.orden).filter(Boolean))];

        if (ordenesIds.length === 0) {
          this.dataInsumos = [];
          return;
        }

        const sortedKey = ordenesIds.slice().sort((a, b) => a - b).join(',');
        if (sortedKey === this.dataInsumosCacheOrderIdsKey) {
          console.log('loadDataInsumos: ordenes no cambiaron, usando cache');
          this.dataInsumos = ordenesIds.reduce((acc, idOrden) => acc.concat(this.eficienciaOrdenCache[idOrden] || []), []);
          return;
        }
        this.dataInsumosCacheOrderIdsKey = sortedKey;

        // Determine which IDs are not yet cached
        const idsToFetch = ordenesIds.filter(id => !this.eficienciaOrdenCache[id]);

        // Cache control for /eficiencia-orden via environment-level auth settings
        const axiosConfigEficiencia = {};

        if (idsToFetch.length > 0) {
          const insumosPromises = idsToFetch.map((idOrden) =>
            this.$axios
              .get(`${this.$config.API}/eficiencia-orden/${idOrden}`)
              .then((resp) => {
                const insumos = resp.data.insumos_asignados || [];
                const datos = insumos.map((ins) => ({ ...ins, id_orden: idOrden }));
                this.eficienciaOrdenCache[idOrden] = datos;
                return datos;
              })
              .catch((err) => {
                console.error(`Error loading insumos for order ${idOrden}:`, err);
                this.eficienciaOrdenCache[idOrden] = [];
                return [];
              })
          );

          await Promise.all(insumosPromises);
        }

        // Build dataInsumos from cache (all orders)
        this.dataInsumos = ordenesIds.reduce((acc, idOrden) => {
          const cached = this.eficienciaOrdenCache[idOrden] || [];
          return acc.concat(cached);
        }, []);

        console.log('DataInsumos loaded (cache included):', this.dataInsumos.length, 'items');
      } catch (error) {
        console.error('Error in loadData Insumos:', error);
        this.dataInsumos = [];
      }
    },

    async fetchEfficiency() {
      const now = Date.now();
      // evitar ejecuciones en ráfaga por reconciliación de Vue o recargas rápidas
      if (this.isFetchingEfficiency) {
        console.log('fetchEfficiency already in progress, skipping');
        return;
      }
      if (this.lastFetchEfficiencyAt && now - this.lastFetchEfficiencyAt < 5000) {
        console.log('fetchEfficiency debounced (3-5s)');
        return;
      }
      console.log('fetchEfficiency called at', new Date().toISOString());
      this.lastFetchEfficiencyAt = now;
      this.isFetchingEfficiency = true;
      this.loadingEfficiency = true;
      try {
        let itemsForEfficiency = [];

        // If we have orders, use them. Otherwise check for unpaid orders.
        if (this.ordenes && this.ordenes.length > 0) {
          itemsForEfficiency = this.ordenes;
        } else {
          // Fetch unpaid orders logic
          const idEmpleado = this.$store.state.login.dataUser?.id_empleado;
          const idDepartamento = this.$store.state.login.currentDepartamentId;

          if (!idEmpleado || !idDepartamento) {
            this.loadingEfficiency = false;
            return;
          }

          const unpaidResponse = await this.$axios.get(
            `${this.$config.API}/empleados/unpaid-orders/${idEmpleado}/${idDepartamento}`
          );

          if (unpaidResponse.data && unpaidResponse.data.length > 0) {
            itemsForEfficiency = unpaidResponse.data;
          }
        }

        if (itemsForEfficiency.length === 0) {
          this.reporteData = null;
          this.inputEfficiencyData = null;
          this.loadingEfficiency = false;
          return;
        }

        const empId = this.$store.state.login?.dataUser?.id_empleado;
        const deptoId = this.$store.state.login.currentDepartamentId;

        let finishedToday = [];
        if (empId && deptoId) {
          try {
            const respTerminadas = await this.$axios.get(`${this.$config.API}/empleados/terminadas-hoy/${empId}/${deptoId}`);
            finishedToday = Array.isArray(respTerminadas.data) ? respTerminadas.data : [];
          } catch (error) {
            console.error("Error fetching finished orders today:", error);
          }
        }

        // Recolectar IDs de órdenes activas y terminadas hoy
        const activePool = [...this.ordenes, ...this.reposiciones, ...this.vinculadas];
        const activeIds = activePool.map(o => o.orden || o.id_orden).filter(id => id);
        let uniqueIds = [...new Set([...activeIds, ...finishedToday])];

        const ids = uniqueIds.join(',');
        if (!ids) {
          this.loadingEfficiency = false;
          return;
        }

        const postData = {
          id_ordenes: uniqueIds,
          id_empleado: empId || null
        };

        // Parallel requests for Manufacturing Time and Input Efficiency
        console.log("fetchEfficiency: calling manufacture time endpoint", {
          url: `${this.$config.API}/reports/manufacturing-time`,
          body: postData
        });
        console.log("fetchEfficiency: calling input efficiency endpoint", {
          url: `${this.$config.API}/reports/input-efficiency/${ids}`
        });

        const [timeResponse, inputResponse] = await Promise.all([
          this.$axios.post(`${this.$config.API}/reports/manufacturing-time`, postData),
          this.$axios.get(`${this.$config.API}/reports/input-efficiency/${ids}`)
        ]);

        // Process Manufacturing Time
        console.log("Efficiency - Time Response:", timeResponse.data);
        console.log("Efficiency - Input Response:", inputResponse.data);

        if (timeResponse.data && timeResponse.data.resumen) {
          const resumen = timeResponse.data.resumen;
          const detalles = timeResponse.data.tareas_detalles || [];
          
          let horarioLaboral = this.$store.state.login.dataEmpresa.horario_laboral;
          if (typeof horarioLaboral === 'string') {
            try {
              horarioLaboral = JSON.parse(horarioLaboral);
            } catch(e) {
              console.error("Error parseando horario_laboral", e);
              horarioLaboral = null;
            }
          }

          if (!horarioLaboral) {
             this.$fire({
                 title: 'DEBUG',
                 text: 'horarioLaboral no es válido o está ausente',
                 type: 'warning'
             });
          }

          // Recalcular Tiempos Reales usando el Mixin (considerando horario laboral y pausas)
          let totalRealTerminadas = 0;
          let totalRealEnCurso = 0;

          // Preparar pausas en el formato que espera el mixin (fecha_inicio, fecha_fin como Dates)
          const pausasProcesadas = (this.pausas || []).map(p => ({
            fecha_inicio: new Date(p.pausa_inicio),
            fecha_fin: p.pausa_fin ? new Date(p.pausa_fin) : new Date()
          }));

          if (horarioLaboral && detalles.length > 0) {
            detalles.forEach(task => {
              // Formatear fechas para asegurar compatibilidad en iOS/Safari y otros
              const fStartStr = task.fecha_inicio ? task.fecha_inicio.replace(' ', 'T') : null;
              const fEndStr = task.fecha_terminado ? task.fecha_terminado.replace(' ', 'T') : null;

              const tareaObj = {
                fecha_inicio: fStartStr ? new Date(fStartStr) : new Date(),
                fecha_fin: fEndStr ? new Date(fEndStr) : new Date()
              };
              
              // No calcular nada si la tarea no ha iniciado realmente en la BD
              if (!task.fecha_inicio) return;

              // calcularTiempoTrabajoIndividual devuelve milisegundos
              const tiempoEfectivoMs = this.calcularTiempoTrabajoIndividual(tareaObj, pausasProcesadas, horarioLaboral);
              const tiempoEfectivoSegundos = tiempoEfectivoMs / 1000;

              if (task.fecha_terminado) {
                totalRealTerminadas += tiempoEfectivoSegundos;
              } else {
                totalRealEnCurso += tiempoEfectivoSegundos;
              }
            });
          }

          // Los tiempos proyectados (estimados) los seguimos tomando del resumen del backend
          const totalProjectedTerminadas = resumen.reduce((acc, item) => acc + (item.totalProjectedTerminadas || 0), 0);
          const totalProjectedEnCurso = resumen.reduce((acc, item) => acc + (item.totalProjectedEnCurso || 0), 0);

          this.reporteData = {
            totalRealTerminadas,
            totalProjectedTerminadas,
            totalRealEnCurso,
            totalProjectedEnCurso,
            // Mantener para compatibilidad
            totalReal: totalRealTerminadas + totalRealEnCurso,
            totalProjected: totalProjectedTerminadas + totalProjectedEnCurso,
            totalElapsed: 0
          };
          console.debug('[SseOrdenesAsignadasV4] reporteData', this.reporteData);
        }

        // Process Input Efficiency
        if (inputResponse.data && inputResponse.data.length > 0) {
          let totalEstimado = 0;
          let totalReal = 0;
          let unidad = 'Mt';

          inputResponse.data.forEach(item => {
            if (this.$store.state.login.currentDepartamentId && parseInt(item.id_departamento) !== parseInt(this.$store.state.login.currentDepartamentId)) {
              return;
            }
            const standard = parseFloat(item.cantidad_estandar) || 0;
            const real = parseFloat(item.cantidad_real) || 0;
            totalEstimado += standard;
            totalReal += real;
            unidad = item.unidad || 'Mt';
          });

          if (totalEstimado > 0 || totalReal > 0) {
            this.inputEfficiencyData = {
              totalEstimado,
              totalReal,
              unidad
            };
          } else {
            this.inputEfficiencyData = null;
          }
        } else {
          this.inputEfficiencyData = null;
        }

      } catch (error) {
        console.error("Error fetching efficiency data:", error);
        this.reporteData = null; // Reset on error or keep previous? Reset is safer to avoid stale data
        this.isFetchingEfficiency = false;
      } finally {
        this.loadingEfficiency = false;
        this.isFetchingEfficiency = false;
      }
    },

    async getOrdenesFechas() {
      this.overlay = true;
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
        .finally(() => {
          this.overlay = false;
        });
    },

    async getInsumos() {
      await this.$axios.get(`${this.$config.API}/insumos`).then((resp) => {
        this.insumos = resp.data;
      });
    },

    async getImpresoras() {
      await this.$axios.get(`${this.$config.API}/impresoras`).then((resp) => {
        this.impresoras = resp.data;
      });
    },

    maquetarPrioridad(prioridad) {
      const pri = parseInt(prioridad);
      if (!pri) {
        this.fields[0].variant = "info";
      } else {
        this.fields[0].variant = "danger";
      }
      return "";
    },

    async reloadMe() {
      if (this.isReloading) {
        console.log('[SseOrdenesAsignadasV4] reloadMe already in progress, skipping');
        return;
      }
      this.isReloading = true;
      console.log('[SseOrdenesAsignadasV4] reloadMe called');

      try {
        // Ejecutar todas las cargas en paralelo para eficiencia
        await Promise.all([
          this.getLotesActivos(),
          this.getInsumos(),
          this.getOrdenesAsignadas().then(() => {
            // Después de cargar ordenes, configurar scroll infinito
            this.$nextTick(() => {
              this.setupInfiniteScroll();
            });
          }),
          this.getOrdenesFechas().then(() => {
            this.fechasResult = this.generarPlanProduccionCompleto(
              this.fechas,
              this.$store.state.login.dataEmpresa.horario_laboral
            );
          }),
          // Si es impresión, cargar impresoras
          this.$store.state.login.currentDepartament === "Impresión" ? this.getImpresoras() : Promise.resolve()
        ]);
      } catch (error) {
        console.error('[SseOrdenesAsignadasV4] Error during reload:', error);
      } finally {
        this.isReloading = false;
      }
    },
  },

  mounted() {
    // Inicializar configuración visual
    if (this.$store.state.login.currentDepartament === "Impresión") {
      this.promptHTML = "<h2>Ingrese la cantidad en metros</h2>";
      this.prompInputType = "number";
    } else if (this.$store.state.login.currentDepartament === "Estampado") {
      this.promptHTML = "<h2>Ingrese el número de rollo</h2>";
      this.prompInputType = "number";
    } else if (this.$store.state.login.currentDepartament === "Corte") {
      this.promptHTML = "<h2>Ingrese el peso del desperdicio en Gramos</h2>";
      this.prompInputType = "number";
    }

    // Ejecutar recarga única centralizada
    this.reloadMe();
  },

  watch: {},

  beforeDestroy() {
    Object.values(this.loadingObservers).forEach(observer => observer.disconnect());
  },

  props: ["emp", "updatedata"],
};
</script>