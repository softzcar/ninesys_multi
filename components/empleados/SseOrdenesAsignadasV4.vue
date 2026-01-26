<template>
  <div>

    <div v-if="ordenesSize < 1">
      <b-row>
        <b-col>
          <b-alert :show="showAlert" class="text-center" variant="info">
            <h3>{{ msg }}</h3>
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
        <!-- Filtro de busqueda -->
        <b-row>
          <b-col offset-lg="8" offset-xl="8">
            <b-input-group class="mb-4" size="sm">
              <b-form-input id="filter-input" v-model="filter" type="search"
                placeholder="Filtrar Resultados"></b-form-input>

              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''">
                  Limpiar
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-col>
        </b-row>

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
                      <span>
                        <strong>Orden #{{ orden.id_orden }}</strong> - {{ orden.cliente_nombre }}
                      </span>
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
              <b-card class="mb-4" :header="contarItems(reposicionesPendientes.length)">
                <h3>Reposiciones Pendientes</h3>

                <b-alert class="text-center" v-if="reposicionesPendientes.length < 1" show variant="info">
                  No tienes reposiciones pendientes</b-alert>

                <!-- TABLA DE REPOSICIONES PENDIENTES -->
                <b-table v-else stacked :items="reposicionesPendientes" :fields="filedsLista"
                  :filter-included-fields="includedFields" @filtered="onFiltered" :filter="filter">
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
                          :detalles="row.item.observaciones" :detalle_empleado="row.item.detalle_empleado"
                          :productos="productsFilter(row.item.orden)" />
                      </b-col>
                    </b-row>
                  </template>

                  <!-- Lista de productos -->
                </b-table>
              </b-card>
            </b-overlay>
          </b-col>
        </b-row>

        <!-- Reposiciones En Curso -->
        <b-row v-if="reposicionesEnCurso.length > 0">
          <b-col>
            <b-overlay :show="loadingOrders" spinner-small rounded="sm">
              <b-card class="mb-4" :header="contarItems(reposicionesEnCurso.length)">
                <h3>Reposiciones En Curso</h3>

                <!-- TABLA DE REPOSICIONES EN CURSO -->
                <b-table stacked :items="reposicionesEnCurso" :fields="filedsLista"
                  :filter-included-fields="includedFields" @filtered="onFiltered" :filter="filter">
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
                          :datainsumos="dataInsumos" :orden_proceso_departamento="row.item.orden_proceso_departamento"
                          tipo="todo" :idorden="row.item.orden" :id_ordenes_productos="row.item.id_ordenes_productos"
                          @reload="reloadMe" />
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
              </b-card>
            </b-overlay>
          </b-col>
        </b-row>

        <!-- En curso -->
        <b-row>
          <b-col>
            <b-overlay :show="loadingOrders" spinner-small rounded="sm">
              <b-card class="mb-4" :header="contarItems(dataTableEnCurso.length)">
                <h3>En Curso</h3>
                <b-alert class="text-center" v-if="dataTableEnCurso.length < 1" show variant="info">No tienes tareas en
                  curso</b-alert>
                <!-- BOTONES EN CURSO -->
                <b-table v-else stacked :items="dataTableEnCurso" :fields="filedsLista"
                  :filter-included-fields="includedFields" @filtered="onFiltered" :filter="filter">
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
                          :insumosrev="insumosRevision" :insumoscor="insumosCorte" :datainsumos="dataInsumos"
                          tipo="todo" :idorden="row.item.orden" :id_ordenes_productos="row.item.id_ordenes_productos"
                          @reload="reloadMe()" :orden_proceso_departamento="row.item.orden_proceso_departamento" />
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

                      <!-- <span class="floatme">
                        <b-alert
                          :variant="filterFechaEstimada(row.item.orden).variant"
                          show
                        >
                          <h4 class="alert-heading">
                            {{
                              filterFechaEstimada(row.item.orden).variant_text
                            }}
                            {{
                              filterFechaEstimada(row.item.orden)
                                .fecha_estimada_fin_formateada
                            }}
                          </h4> mmmmm
                        </b-alert>
                      </span> -->
                    </b-row>
                  </template>
                </b-table>
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

        <!-- ORDENES PENDIENTES -->
        <b-row>
          <b-col>
            <b-overlay :show="loadingOrders" spinner-small rounded="sm">
              <b-card :header="contarItems(dataTablePendiente.length)">
                <h3>Pendientes</h3>


                <b-alert class="text-center" v-if="dataTablePendiente.length < 1" show variant="info">No tienes tareas
                  pendientes</b-alert>

                <b-table v-else stacked :items="dataTablePendiente" :fields="filedsLista"
                  :filter-included-fields="includedFields" @filtered="onFiltered" :filter="filter">
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
              </b-card>
            </b-overlay>
          </b-col>
        </b-row>
      </b-container>
    </div>


    <!-- MODAL PARA FINALIZAR LOTE -->
    <FinalizarLoteModal v-if="loteParaFinalizar" :show="showFinalizarLoteModal" :lote-id="loteParaFinalizar.id"
      :total-papel-utilizado="papelUtilizadoLote" :insumos="insumos" :ordenes="ordenesParaFinalizar"
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
import FinalizarLoteModal from '~/components/empleados/FinalizarLoteModal.vue'
import FinalizarLoteImpresionModal from '~/components/empleados/FinalizarLoteImpresionModal.vue'
import FinalizarLoteCorteModal from '~/components/empleados/FinalizarLoteCorteModal.vue';

// import { log } from 'console'
export default {
  components: {
    FinalizarLoteModal,
    FinalizarLoteImpresionModal,
    FinalizarLoteCorteModal,
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
      reporteData: null,
      inputEfficiencyData: null,

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
    };
  },

  mixins: [mixin, mixin2, procesamientoOrdenesMixin],

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
              el.fecha_inicio != null &&
              el.fecha_terminado == null &&
              el.en_tintas === 0 &&
              el.en_reposiciones === 0 || el.status === 'pausada' // Include paused orders
          )
          .map((el) => {
            return {
              ...el,
              esreposicion: false,
              en_reposiciones: el.en_reposiciones,
              id_orden: el.id_orden,
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
              !ordenesEnLotes.includes(el.id_orden) && (el.progreso === 'en curso' || el.status === 'pausada')
          )
          .map((el) => {
            return {
              ...el,
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
              (el.progreso === 'en curso' || el.status === 'pausada') &&
              el.en_reposiciones === 0
          )
          .map((el) => {
            return {
              ...el,
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
              (el.progreso === 'en curso' || el.status === 'pausada') &&
              el.en_reposiciones === 0 &&
              el.fecha_inicio != null
          )
          .map((el) => {
            return {
              ...el,
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

      return enCurso
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
        /* .reduce((acc, item) => {
            // console.log('item to push', item)

            if (acc.filter((row) => row.orden === item.orden).length === 0) {
              acc.push(item);
            }
            return acc;
          }, []) */
      );
    },

    // Reposiciones Pendientes: sin fecha de inicio
    reposicionesPendientes() {
      return this.dataTableReposiciones.filter(r => !r.fecha_inicio);
    },

    // Reposiciones En Curso: con fecha de inicio pero sin fecha de término
    reposicionesEnCurso() {
      return this.dataTableReposiciones.filter(r => r.fecha_inicio && !r.fecha_terminado);
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
      // let size = 0;
      let size = parseInt(this.ordenes.length);
      if (size < 1) {
        this.msg = "Usted no tiene ordenes asignadas";
      } else {
        // this.msg = "Has terminado todas tus tareas 👍";
      }

      return size;
    },
  },

  methods: {
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
      this.ordenesParaFinalizar = lote.ordenes
      // Detectar si es un lote de reposiciones (si alguna orden tiene en_reposiciones === 1)
      this.esReposicionParaFinalizar = lote.ordenes.some(o => o.en_reposiciones === 1 || o.esreposicion === true)
      const depto = this.$store.state.login.currentDepartament

      if (depto === 'Impresión') {
        this.showFinalizarImpresionModal = true
      } else if (depto === 'Corte') {
        this.showFinalizarCorteModal = true
      } else {
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
      }
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
              item.progreso === tipo &&
              item.en_tintas === 0
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
        });
    },

    async loadDataInsumos() {
      try {
        // Get unique order IDs from ordenes and reposiciones
        const ordenesIds = [...new Set(this.ordenes.map(o => o.id_orden))];

        if (ordenesIds.length === 0) {
          this.dataInsumos = [];
          return;
        }

        // Fetch insumos data for each order
        const insumosPromises = ordenesIds.map(idOrden =>
          this.$axios.get(`${this.$config.API}/eficiencia-orden/${idOrden}`)
            .then(resp => resp.data.insumos_asignados || [])
            .catch(err => {
              console.error(`Error loading insumos for order ${idOrden}:`, err);
              return [];
            })
        );

        // Wait for all requests to complete
        const insumosArrays = await Promise.all(insumosPromises);

        // Flatten the array of arrays into a single array
        this.dataInsumos = insumosArrays.flat();

        console.log('DataInsumos loaded:', this.dataInsumos.length, 'items');
      } catch (error) {
        console.error('Error in loadData Insumos:', error);
        this.dataInsumos = [];
      }
    },

    async fetchEfficiency() {
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

        // Extract IDs
        const uniqueIds = [...new Set(itemsForEfficiency.map(o => o.orden || o.id_orden).filter(id => id))];
        const ids = uniqueIds.join(',');

        if (!ids) {
          this.loadingEfficiency = false;
          return;
        }

        const postData = {
          id_ordenes: uniqueIds,
          id_empleado: this.$store.state.login?.dataUser?.id_empleado || null
        };

        // Parallel requests for Manufacturing Time and Input Efficiency
        const [timeResponse, inputResponse] = await Promise.all([
          this.$axios.post(`${this.$config.API}/reports/manufacturing-time`, postData),
          this.$axios.get(`${this.$config.API}/reports/input-efficiency/${ids}`)
        ]);

        // Process Manufacturing Time
        if (timeResponse.data) {
          const totalReal = timeResponse.data.reduce((acc, item) => acc + (item.tiempo_total_segundos || 0), 0);
          const totalProjected = timeResponse.data.reduce((acc, item) => {
            if ((item.tiempo_total_segundos && item.tiempo_total_segundos > 0) || item.fecha_inicio_primer_proceso) {
              const projected = parseFloat(item.tiempo_proyectado_segundos || 0);
              const real = parseFloat(item.tiempo_total_segundos || 0);
              if (item.status === 'terminado' || item.prioridad === 'Completado') {
                return acc + projected;
              } else {
                return acc + Math.min(real, projected);
              }
            }
            return acc;
          }, 0);

          this.reporteData = {
            totalReal,
            totalProjected,
            totalElapsed: 0 // Simplification: we may not need exact elapsed for the bar if using real vs projected
          };
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
      } finally {
        this.loadingEfficiency = false;
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

    reloadMe() {
      this.getLotesActivos();
      this.getInsumos();
      this.getOrdenesAsignadas();
      this.getOrdenesFechas().then(() => {
        this.fechasResult = this.generarPlanProduccionCompleto(
          this.fechas,
          this.$store.state.login.dataEmpresa.horario_laboral
        );
      });
    },
  },

  mounted() {
    this.getLotesActivos();
    // CArgar datos de las ordenes asignadas
    /* this.sourceEvent = new EventSource(
      `${this.$config.API}/sse/empleados/ordenes-asignadas/${this.emp}`
      ); */
    this.getOrdenesFechas().then(() => {
      this.fechasResult = this.generarPlanProduccionCompleto(
        this.fechas,
        this.$store.state.login.dataEmpresa.horario_laboral
      );
      console.log("fechasResult", this.fechasResult);
    });

    this.getOrdenesAsignadas().then(() => {
      // console.log("Pausas en  V4", this.pausas);
    });
    if (this.$store.state.login.currentDepartament === "Impresión") {
      // Cargar Impresoras
      this.getImpresoras()
      this.promptHTML = "<h2>Ingrese la cantidad en metros</h2>";
      this.prompInputType = "number";
      // Cargar Insumos
    } else if (this.$store.state.login.currentDepartament === "Estampado") {
      this.promptHTML = "<h2>Ingrese el número de rollo</h2>";
      this.prompInputType = "number";
    } else if (this.$store.state.login.currentDepartament === "Corte") {
      this.promptHTML = "<h2>Ingrese el peso del desperdicio en Gramos</h2>";
      this.prompInputType = "number";
    }
    this.getInsumos();
  },

  props: ["emp", "updatedata"],
};
</script>