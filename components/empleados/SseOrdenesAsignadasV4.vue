<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <div v-if="ordenesSize < 1">
        <b-row>
          <b-col>
            <b-alert
              :show="showAlert"
              class="text-center"
              variant="info"
            >
              <h3>{{ msg }}</h3>
            </b-alert>
          </b-col>
        </b-row>

        <!-- Eficiencia -->
        <b-row>
          <b-col>
            <empleados-RendimientoGeneral
              :ordenes="ordenes"
              :pausas="pausas"
            />
          </b-col>
        </b-row>

      </div>

      <div v-else>
        <b-container fluid>
          <!-- Filtro de busqueda -->
          <b-row>
            <b-col
              offset-lg="8"
              offset-xl="8"
            >
              <b-input-group
                class="mb-4"
                size="sm"
              >
                <b-form-input
                  id="filter-input"
                  v-model="filter"
                  type="search"
                  placeholder="Filtrar Resultados"
                ></b-form-input>

                <b-input-group-append>
                  <b-button
                    :disabled="!filter"
                    @click="filter = ''"
                  >
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
                  <b-button
                    variant="success"
                    @click="reloadMe"
                  >Recargar</b-button>
                </b-col>
              </b-row>
            </b-col>
          </b-row>

          <!-- Eficiencia -->
          <b-row>
            <b-col>
              <empleados-RendimientoGeneral
                :ordenes="ordenes"
                :pausas="pausas"
              />
            </b-col>
          </b-row>

          <!-- Lotes en Proceso -->
          <b-row v-if="lotesActivos.length > 0">
            <b-col>
              <b-card
                class="mb-4"
                header="Lotes en Proceso"
                header-tag="header"
              >
                <div v-for="lote in lotesActivos" :key="lote.id" class="mb-3">
                  <b-card no-body>
                    <template #header>
                      <h5 class="mb-0 d-flex justify-content-between align-items-center">
                        <span>
                          Lote #{{ lote.id }} <b-badge :variant="lote.estado === 'en_curso' ? 'success' : 'secondary'">{{ lote.estado }}</b-badge>
                        </span>
                        <small>Órdenes: {{ lote.ordenes.length }}</small>
                      </h5>
                    </template>

                    <b-list-group flush>
                      <b-list-group-item 
                        v-for="orden in lote.ordenes" 
                        :key="orden.id_orden"
                        class="d-flex align-items-center"
                      >
                        <linkSearch
                          :id="orden.id_orden"
                          size="sm"
                          class="mr-3"
                        />
                        <span>
                          <strong>Orden #{{ orden.id_orden }}</strong> - {{ orden.cliente_nombre }}
                        </span>
                      </b-list-group-item>
                    </b-list-group>

                    <template #footer>
                      <div class="text-left">
                        <b-button v-if="lote.estado === 'pendiente'" @click="iniciarLote(lote.id)" variant="success" size="sm" class="mr-2">
                           Iniciar Lote
                        </b-button>
                        <b-button v-if="lote.estado === 'en_curso'" @click="finalizarLotePorDepartamento(lote.id)" variant="success" size="sm">
                          Finalizar Lote
                        </b-button>
                      </div>
                    </template>
                  </b-card>
                </div>
              </b-card>
            </b-col>
          </b-row>

          <!-- Reposiciones -->
          <b-row>
            <b-col>
              <b-card
                class="mb-4"
                :header="contarItems(dataTableReposiciones.length)"
              >
                <h3>Reposiciones</h3>

                
                <b-alert
                  class="text-center"
                  v-if="dataTableReposiciones.length < 1"
                  show
                  variant="info"
                >
                  No tienes reposiciones en curso</b-alert>

                <!-- TABLA DE REPOSICIONES -->
                <b-table
                  v-else
                  stacked
                  :items="dataTableReposiciones"
                  :fields="filedsLista"
                  :filter-included-fields="includedFields"
                  @filtered="onFiltered"
                  :filter="filter"
                >
                  <template #cell(orden)="row">
                    <div>
                      <span class="floatme">
                        <linkSearch
                          class="floatme mb-2"
                          :id="row.item.orden"
                        />
                      </span>

                      <!-- Terminar -->
                      <span class="floatme">
                        <empleados-SseOrdenesAsignadasModalExtra
                          :pausas="pausas"
                          :departamento="
                            $store.state.login.dataUser.departamento
                          "
                          :item="row.item"
                          :items="filterOrder(row.item.orden, 'en curso')"
                          class="floatme"
                          :esreposicion="1"
                          :idlotesdetalles="row.item.id_lotes_detalles"
                          :impresoras="impresoras"
                          :insumosTodos="insumos"
                          :insumosimp="insumosImpresion"
                          :insumosest="insumosEstampado"
                          :insumoscor="insumosCorte"
                          :insumoscos="insumosCostura"
                          :insumoslim="insumosLimpieza"
                          :insumosrev="insumosRevision"
                          :orden_proceso_departamento="row.item.orden_proceso_departamento"
                          tipo="todo"
                          :idorden="row.item.orden"
                          :id_ordenes_productos="row.item.id_ordenes_productos"
                          @reload="reloadMe"
                        />
                      </span>

                      <!-- Ver Diseño -->
                      <span class="floatme">
                        <diseno-view-image
                          class="floatme mb-2"
                          :id="row.item.orden"
                        />
                      </span>

                      <!-- ProgressBar -->
                      <span
                        class="floatme"
                        style="width: 160px"
                      >
                        <empleados-ProgressBarEmpleados :idOrden="row.item.orden" />
                      </span>

                      <!-- Reposición -->
                      <span class="floatme">
                        <empleados-reposicion
                          @reload_this="reloadMe"
                          :id_orden="row.item.orden"
                          :itemRep="row.item"
                          :productos="productsFilter(row.item.orden)"
                        />
                      </span>

                      <!-- Detalles productos -->
                      <span class="floatme">
                        <produccion-control-de-produccion-detalles-editor
                          esreposicion="true"
                          :idorden="row.item.orden"
                          :detalles="row.item.observaciones"
                          :detalle_empleado="row.item.detalle_empleado"
                          :productos="productsFilter(row.item.orden)"
                        />
                      </span>
                    </div>
                  </template>

                  <!-- Lista de productos -->
                </b-table>                
              </b-card>
            </b-col>
          </b-row>

          <!-- En curso -->
          <b-row>
            <b-col>
              <b-card
                class="mb-4"
                :header="contarItems(dataTableEnCurso.length)"
              >
                <h3>En Curso</h3>
                <b-alert
                  class="text-center"
                  v-if="dataTableEnCurso.length < 1"
                  show
                  variant="info"
                >No tienes tareas en curso</b-alert>
                <!-- BOTONES EN CURSO -->
                <b-table
                  v-else
                  stacked
                  :items="dataTableEnCurso"
                  :fields="filedsLista"
                  :filter-included-fields="includedFields"
                  @filtered="onFiltered"
                  :filter="filter"
                >
                  <template #cell(orden)="row">
                    <div>
                      <span class="floatme">
                        <linkSearch
                          class="floatme mb-2"
                          :id="row.item.orden"
                        />
                      </span>

                      <!-- Terminar -->
                      <span class="floatme">
                        <empleados-SseOrdenesAsignadasModalExtra
                          :pausas="pausas"
                          :departamento="
                            $store.state.login.dataUser.departamento
                          "
                          :item="row.item"
                          :items="filterOrder(row.item.orden, 'en curso')"
                          class="floatme"
                          :esreposicion="0"
                          :impresoras="impresoras"
                          :insumosTodos="insumos"
                          :insumosimp="insumosImpresion"
                          :insumosest="insumosEstampado"
                          :insumoscos="insumosCostura"
                          :insumoslim="insumosLimpieza"
                          :insumosrev="insumosRevision"
                          :insumoscor="insumosCorte"
                          tipo="todo"
                          :idorden="row.item.orden"
                          :id_ordenes_productos="row.item.id_ordenes_productos"
                          @reload="reloadMe()"
                          :orden_proceso_departamento="row.item.orden_proceso_departamento"
                        />
                      </span>

                      <!-- Ver Diseño -->
                      <span class="floatme">
                        <diseno-view-image
                          class="floatme mb-2"
                          :id="row.item.orden"
                        />
                      </span>

                      <!-- ProgressBar -->
                      <span
                        class="floatme"
                        style="width: 160px"
                      >
                        <empleados-ProgressBarEmpleados :idOrden="row.item.orden" />
                      </span>

                      <!-- Reposición -->
                      <span class="floatme">
                        <empleados-reposicion
                          @reload_this="reloadMe"
                          :id_orden="row.item.orden"
                          :itemRep="row.item"
                        />
                      </span>

                      <!-- Detalles -->
                      <span class="floatme">
                        <produccion-control-de-produccion-detalles-editor
                          esreposicion="false"
                          :idorden="row.item.orden"
                          :detalles="row.item.observaciones"
                          :detalle_empleado="row.item.detalle_empleado"
                          :productos="productsFilter(row.item.orden)"
                        />
                      </span>

                      <!-- Vinculadas -->
                      <span class="floatme">
                        <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculdas(row.item.orden)" />
                      </span>

                      <span class="floatme">
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
                          </h4>
                        </b-alert>
                      </span>
                    </div>
                  </template>
                </b-table>
              </b-card>
            </b-col>
          </b-row>

          <!-- Botón para Crear Lote -->
          <b-row v-if="esDepartamentoDeMateriales">
            <b-col class="mb-3">
              <b-button
                variant="primary"
                :disabled="ordenesSeleccionadas.length === 0"
                @click="crearLote"
              >
                Crear Lote ({{ ordenesSeleccionadas.length }} seleccionadas)
              </b-button>
            </b-col>
          </b-row>

          <!-- ORDENES PENDIENTES -->
          <b-row>
            <b-col>
              <b-card :header="contarItems(dataTablePendiente.length)">
                <h3>Pendientes</h3>


                <b-alert
                  class="text-center"
                  v-if="dataTablePendiente.length < 1"
                  show
                  variant="info"
                >No tienes tareas pendientes</b-alert>

                <b-table
                  v-else
                  stacked
                  :items="dataTablePendiente"
                  :fields="filedsLista"
                  :filter-included-fields="includedFields"
                  @filtered="onFiltered"
                  :filter="filter"
                >
                  <template #cell(orden)="row">
                    <div>
                      <!-- Checkbox de selección -->
                      <span v-if="esDepartamentoDeMateriales" class="floatme mr-2">
                        <b-form-checkbox
                          v-model="ordenesSeleccionadas"
                          :value="row.item.id_orden"
                          size="lg"
                          :disabled="verificarOrdenProceso(row.item.orden_proceso, row.item.orden_proceso_min)"
                        />
                      </span>

                      <span class="floatme">
                        <linkSearch
                          class="floatme mb-2"
                          :id="row.item.orden"
                        />
                      </span>

                      <span class="floatme">
                        <b-button
                          block
                          size="xl"
                          variant="info"
                          :disabled="
                            verificarOrdenProceso(
                              row.item.orden_proceso,
                              row.item.orden_proceso_min
                            )
                          "
                          @click="
                            iniciarTodo(row.item.orden, row.item.unidades)
                          "
                        >Iniciar Todo
                        </b-button>
                      </span>

                      <span class="floatme">
                        <diseno-view-image
                          class="floatme mb-2"
                          :id="row.item.orden"
                        />
                      </span>

                      <span
                        class="floatme"
                        style="width: 160px"
                      >
                        <empleados-ProgressBarEmpleados :idOrden="row.item.orden" />
                      </span>

                      <!-- Detalles -->
                      <span class="floatme">
                        <produccion-control-de-produccion-detalles-editor
                          esreposicion="false"
                          :idorden="row.item.orden"
                          :detalles="row.item.observaciones"
                          :detalle_empleado="row.item.detalle_empleado"
                          :productos="productsFilter(row.item.orden)"
                        />
                      </span>

                      <!-- Vinculadas -->
                      <span class="floatme">
                        <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculdas(row.item.orden)" />
                      </span>

                      <span class="floatme">
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
                          </h4>
                        </b-alert>
                      </span>
                    </div>
                  </template>
                </b-table>
              </b-card>
            </b-col>
          </b-row>
        </b-container>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import mixin2 from "~/mixins/mixin-proyeccion-entrega.js";
import procesamientoOrdenesMixin from "~/mixins/procesamientoOrdenes.js";

// import { log } from 'console'
export default {
  data() {
    return {
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
      return ['Estampado', 'Corte'].includes(depto);
    },

    ordenProceso() {
      if (this.$store.getters["login/getDepartamentosOrdenProceso"]) {
        return this.$store.getters["login/getDepartamentosOrdenProceso"][0];
      } else {
        return 0;
      }
    },

    insumosImpresion() {
      let options = this.insumos.filter(
        (item) => item.departamento === "Impresión"
      );
      options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosEstampado() {
      let options = this.insumos.filter(
        (item) => item.departamento === "Telas"
      );
      options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosCostura() {
      let options = this.insumos.filter(
        (item) => item.departamento === "Costura"
      );
      options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosRevision() {
      let options = this.insumos.filter(
        (item) => item.departamento === "Producción"
      );
      options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosLimpieza() {
      let options = this.insumos.filter(
        (item) => item.departamento === "Producción"
      );
      options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosCorte() {
      let options = this.insumos.filter(
        (item) => item.departamento === "Telas"
      );
      options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    dataTableEnCurso() {
      let enCurso = [];
      if (this.$store.state.login.currentDepartament === "Impresión") {
        //
        enCurso = this.ordenes
          .filter(
            (el) =>
              // (el.progreso === "en curso" || el.progreso === "terminada") &&
              (el.fecha_inicio != null && el.fecha_terminado == null) &&
              el.en_tintas === 0 &&
              el.en_reposiciones === 0 /* &&
                            (el.fecha_inicio != null && el.fecha_terminado == null) */
          ) // Filtramos las órdenes "en curso" y verificamos que aún no tenga registro en la tabla `inventario_movimientos`
          .map((el) => {
            return {
              ...el, // Incluimos todas las propiedades originales del objeto "el"
              esreposicion: false,
              en_reposiciones: el.en_reposiciones,
              id_orden: el.id_orden,
              extra: el.extra,
              orden: el.id_orden, // Sobreescribimos la propiedad "orden"
              urgent: el.prioridad, // Sobreescribimos la propiedad "urgent"
              entrega: el.fecha_entrega, // Sobreescribimos la propiedad "entrega"
              id_lotes_detalles: el.id_lotes_detalles_empleados_asignados,
              lotes_detalles_empleados_asignados:
                el.lotes_detalles_empleados_asignados,
              unidades: el.unidades,
              id_woo: el.id_woo,
              en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
              en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
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
          }, []);
      } else if (this.$store.state.login.currentDepartament === "Estampado") {
        enCurso = this.ordenes
          .filter((el) => el.progreso === "en curso") // Filtramos las órdenes "en curso" y verificamos que aún no tenga registro en la tabla `inventario_movimientos`
          /* .filter(
                        (el) =>
                            (el.progreso === "en curso" ||
                                el.progreso === "terminada") &&
                            el.en_inv_mov === 0 &&
                            el.en_reposiciones === 0 && el.fecha_inicio != null
                    ) // Filtramos las órdenes "en curso" y verificamos que aún no tenga registro en la tabla `inventario_movimientos` */
          .map((el) => {
            return {
              ...el, // Incluimos todas las propiedades originales del objeto "el"
              extra: el.extra,
              orden: el.id_orden, // Sobreescribimos la propiedad "orden"
              urgent: el.prioridad, // Sobreescribimos la propiedad "urgent"
              entrega: el.fecha_entrega, // Sobreescribimos la propiedad "entrega"
              id_lotes_detalles: el.id_lotes_detalles,
              lotes_detalles_empleados_asignados:
                el.lotes_detalles_empleados_asignados,
              unidades: el.unidades,
              id_woo: el.id_woo,
              en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
              en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
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
          }, []);
        // opciones para corte
      } else if (this.$store.state.login.currentDepartament === "Corte") {
        enCurso = this.ordenes
          .filter(
            (el) => el.progreso === "en curso" && el.en_reposiciones === 0
          ) // Filtramos las órdenes "en curso" y verificamos que aún no tenga registro en la tabla `inventario_movimientos`
          .map((el) => {
            return {
              ...el, // Incluimos todas las propiedades originales del objeto "el"
              extra: el.extra,
              orden: el.id_orden, // Sobreescribimos la propiedad "orden"
              urgent: el.prioridad, // Sobreescribimos la propiedad "urgent"
              entrega: el.fecha_entrega, // Sobreescribimos la propiedad "entrega"
              id_lotes_detalles: el.id_lotes_detalles,
              lotes_detalles_empleados_asignados:
                el.lotes_detalles_empleados_asignados,
              unidades: el.unidades,
              id_woo: el.id_woo,
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
              en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
              en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
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
          }, []);
      } else {
        enCurso = this.ordenes
          .filter(
            (el) =>
              el.progreso === "en curso" &&
              el.en_reposiciones === 0 &&
              el.fecha_inicio != null
          ) // Filtramos las órdenes "en curso" y verificamos que aún no tenga registro en la tabla `inventario_movimientos`
          .map((el) => {
            return {
              ...el, // Incluimos todas las propiedades originales del objeto "el"
              extra: el.extra,
              orden: el.id_orden, // Sobreescribimos la propiedad "orden"
              urgent: el.prioridad, // Sobreescribimos la propiedad "urgent"
              entrega: el.fecha_entrega, // Sobreescribimos la propiedad "entrega"
              id_lotes_detalles: el.id_lotes_detalles,
              lotes_detalles_empleados_asignados:
                el.lotes_detalles_empleados_asignados,
              unidades: el.unidades,
              id_woo: el.id_woo,
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
              en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
              en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
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
          }, []);
      }

      return enCurso;
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
      return (
        this.reposiciones
          // .filter((el) => el.fecha_inicio === null)
          //   .filter((el) => el.en_reposiciones === 1)
          .map((el) => {
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
      }).catch(()=>{
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
      }).catch(()=>{
        // El usuario canceló
      });
    },

    /**
     * Método llamado por el botón "Terminar Lote".
     */
    finalizarLotePorDepartamento(loteId) {
      this.$confirm(
        `¿Está seguro de que desea finalizar las tareas del Lote #${loteId} para este departamento?`,
        'Confirmar Finalización',
        'warning'
      ).then(() => {
        this.overlay = true;
        const payload = new URLSearchParams();
        payload.append('id_empleado', this.$store.state.login.dataUser.id_empleado);
        payload.append('id_departamento', this.$store.state.login.currentDepartamentId);

        this.$axios
          .post(`${this.$config.API}/lotes/${loteId}/finalizar-departamento`, payload)
          .then((res) => {
            this.$fire({
              title: 'Éxito',
              html: `<p>El lote #${loteId} ha sido finalizado para este departamento.</p>`,
              type: 'success',
            });
            this.reloadMe();
          })
          .catch((err) => {
            this.$fire({
              title: 'Error',
              html: `<p>No se pudo finalizar el lote en este departamento.</p><p>${err}</p>`,
              type: 'warning',
            });
          })
          .finally(() => {
            this.overlay = false;
          });
      });
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
      if (IdVerificado === this.$store.state.login.currentOrdenProceso) {
        return false;
      } else {
        return true;
      }
    },

    filterFechaEstimada(idOrden) {
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
        return fechaEstimada[0];
      } else {
        return "NO hay registros";
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
      return this.productos.filter((el) => el.id_orden == id);
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

    async registrarEstado(tipo, id_orden, unidades, es_reposicion = false, id_lotes_detalles_param = null) {
      const data = new URLSearchParams();
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("id_departamento", this.$store.state.login.currentDepartamentId);
      data.set("id_orden", id_orden);
      data.set("id_lotes_detalles", id_lotes_detalles_param);
      data.set("tipo", tipo);
      data.set("es_reposicion", es_reposicion);
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
            this.sendMessageClient(idOrden);
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
            (item) => item.id_orden === id_orden && item.progreso === tipo
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
      await this.$axios
        .get(
          `${this.$config.API}/empleados/ordenes-asignadas/v2/${this.emp}/${this.$store.state.login.currentDepartamentId}/${this.$store.state.login.currentOrdenProceso}`
        )
        .then((resp) => {
          if (resp.data.ordenes.length === 0) {
            this.msg = "Usted no tiene ordenes asignadas";
          }
          this.ordenes = resp.data.ordenes;
          this.reposiciones = resp.data.reposiciones;
          this.vinculadas = resp.data.vinculadas;
          this.productos = resp.data.productos;
          this.pausas = resp.data.pausas;
        });
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