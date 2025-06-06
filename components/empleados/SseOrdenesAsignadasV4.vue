<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
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
            <empleados-RendimientoGeneral :ordenes="ordenes" :pausas="pausas" />
          </b-col>
        </b-row>
      </div>

      <div v-else>
        <b-container fluid>
          <!-- Filtro de busqueda -->
          <b-row>
            <b-col offset-lg="8" offset-xl="8">
              <b-input-group class="mb-4" size="sm">
                <b-form-input
                  id="filter-input"
                  v-model="filter"
                  type="search"
                  placeholder="Filtrar Resultados"
                ></b-form-input>

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
                  <b-button variant="success" @click="reloadMe"
                    >Recargar</b-button
                  >
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
                  No tienes reposiciones en curso</b-alert
                >

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
                    <div style="width: 164%; float: left">
                      <span class="floatme">
                        <linkSearch class="floatme mb-2" :id="row.item.orden" />
                      </span>

                      <!-- Ver detalles -->
                      <!-- <span class="floatme">
                                                <b-button
                                                :variant="setStatusButton('secondary', row.item.urgent)"
                                                block
                                                size="xl"
                                                style="padding: 6px 20px 0 20px"
                                                @click="row.toggleDetails"
                                                >
                                                <h4>
                                                    <b-icon icon="caret-down-fill"></b-icon>
                                                </h4>
                                                </b-button>
                                            </span> -->

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
                          :insumosimp="insumosImpresion"
                          :insumosest="insumosEstampado"
                          :insumoscor="insumosCorte"
                          :insumoscos="insumosCostura"
                          :insumoslim="insumosLimpieza"
                          :insumosrev="insumosRevision"
                          tipo="todo"
                          :idorden="row.item.orden"
                          :id_ordenes_productos="row.item.id_ordenes_productos"
                          @reload="reloadMe"
                          @registrarestado="registrarEstado"
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
                      <span class="floatme" style="width: 160px">
                        <empleados-ProgressBarEmpleados
                          :idOrden="row.item.orden"
                        />
                      </span>

                      <!-- Reposición -->
                      <span class="floatme">
                        <empleados-reposicion
                          @reload_this="reloadMe"
                          :id_orden="row.item.orden"
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

                      <!-- <span
                        v-html="filterFechaEstimada(row.item.orden)"
                        class="floatme"
                      ></span> -->
                      <!-- Detalle Reposición -->
                      <!-- <span class="floatme">
                                            <produccion-control-de-produccion-detalle-reposicion
                                                :detalle="
                                                    row.item.detalle_reposicion
                                                "
                                            />
                                        </span> -->
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
                  >No tienes tareas en curso</b-alert
                >
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
                    <div style="width: 164%; float: right">
                      <span class="floatme">
                        <linkSearch class="floatme mb-2" :id="row.item.orden" />
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
                      <span class="floatme" style="width: 160px">
                        <empleados-ProgressBarEmpleados
                          :idOrden="row.item.orden"
                        />
                      </span>

                      <!-- Reposición -->
                      <span class="floatme">
                        <empleados-reposicion
                          @reload_this="reloadMe"
                          :id_orden="row.item.orden"
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
                        <ordenes-vinculadas-v2
                          :ordenes_vinculadas="filterVinculdas(row.item.orden)"
                        />
                      </span>

                      <span class="floatme">
                        <p>Fecha estimada de entrega</p>

                        <pre class="force" style="margin-top: -16px">
                          {{ fechasResult[0] }}
                        </pre>
                      </span>

                      <!-- <span
                        v-html="filterFechaEstimada(row.item.orden)"
                        class="floatme"
                      ></span> -->
                    </div>
                  </template>
                </b-table>
              </b-card>
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
                  >No tienes tareas pendientes</b-alert
                >

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
                    <div style="width: 164%; float: left">
                      <span class="floatme">
                        <linkSearch class="floatme mb-2" :id="row.item.orden" />
                      </span>

                      <span class="floatme">
                        <b-button
                          block
                          size="xl"
                          variant="info"
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

                      <span class="floatme" style="width: 160px">
                        <empleados-ProgressBarEmpleados
                          :idOrden="row.item.orden"
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
                        <ordenes-vinculadas-v2
                          :ordenes_vinculadas="filterVinculdas(row.item.orden)"
                        />
                      </span>

                      <span class="floatme">
                        <!-- <progreso-tiempo-empleado
                          :fechasResult="fechasResult"
                          :estimada="
                            fechasResult[0].fecha_estimada_entrega_formateada
                          "
                          :inicio="fechasResult[0].fecha_inicio_formateada"
                          :filtro="filterFechaEstimada(row.item.orden)"
                        /> -->
                      </span>

                      <span class="floatme">
                        <p>Fecha estimada de entrega</p>

                        <p style="margin-top: -16px">
                          {{ fechasResult[0].fecha_inicio_formateada }}
                        </p>
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

// import { log } from 'console'
export default {
  data() {
    return {
      // sourceEvent: null, // Variable para inicializar eventSource y utilizarla poseteriormente en la sfunciones para obtener la informacion de las ordenes asignadas
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
          label: "orden",
          variant: "",
        },
      ],
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

  mixins: [mixin, mixin2],

  watch: {
    reload(val) {
      // const p = this.dataOrdenEnCurso.push('val')
      this.dataOrdenEnCurso = [{ data: "hola" }];

      console.log("cargar informacion en el cuadro informativo", p);
      return true;
    },
  },

  computed: {
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
              (el.progreso === "en curso" || el.progreso === "terminada") &&
              el.en_tintas === 0 &&
              el.en_reposiciones === 0 /* &&
                            (el.fecha_inicio != null && el.fecha_terminado == null) */
          ) // Filtramos las órdenes "en curso" y verificamos que aún no tenga registro en la tabla `inventario_movimientos`
          .map((el) => {
            return {
              // ...el, // Incluimos todas las propiedades originales del objeto "el"
              esreposicion: false,
              en_reposiciones: el.en_reposiciones,
              id_orden: el.id_orden,
              extra: el.extra,
              orden: el.id_orden, // Sobreescribimos la propiedad "orden"
              urgent: el.prioridad, // Sobreescribimos la propiedad "urgent"
              entrega: el.fecha_entrega, // Sobreescribimos la propiedad "entrega"
              id_lotes_detalles: el.id_lotes_detalles,
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
              // ...el, // Incluimos todas las propiedades originales del objeto "el"
              extra: el.extra,
              orden: el.id_orden, // Sobreescribimos la propiedad "orden"
              urgent: el.prioridad, // Sobreescribimos la propiedad "urgent"
              entrega: el.fecha_entrega, // Sobreescribimos la propiedad "entrega"
              id_lotes_detalles: el.id_lotes_detalles,
              unidades: el.unidades,
              id_woo: el.id_woo,
              en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
              en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
              observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
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
              // ...el, // Incluimos todas las propiedades originales del objeto "el"
              extra: el.extra,
              orden: el.id_orden, // Sobreescribimos la propiedad "orden"
              urgent: el.prioridad, // Sobreescribimos la propiedad "urgent"
              entrega: el.fecha_entrega, // Sobreescribimos la propiedad "entrega"
              id_lotes_detalles: el.id_lotes_detalles,
              unidades: el.unidades,
              id_woo: el.id_woo,
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
              en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
              en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
              observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
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
              el.en_inv_mov === 0 &&
              el.en_reposiciones === 0 &&
              el.fecha_inicio != null
          ) // Filtramos las órdenes "en curso" y verificamos que aún no tenga registro en la tabla `inventario_movimientos`
          .map((el) => {
            return {
              // ...el, // Incluimos todas las propiedades originales del objeto "el"
              extra: el.extra,
              orden: el.id_orden, // Sobreescribimos la propiedad "orden"
              urgent: el.prioridad, // Sobreescribimos la propiedad "urgent"
              entrega: el.fecha_entrega, // Sobreescribimos la propiedad "entrega"
              id_lotes_detalles: el.id_lotes_detalles,
              unidades: el.unidades,
              id_woo: el.id_woo,
              valor_inicial: el.valor_inicial,
              valor_final: el.valor_final,
              en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
              en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
              observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
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
      return (
        this.ordenes
          // .filter((el) => el.fecha_inicio === null)
          .filter((el) => el.progreso === "por iniciar")
          .map((el) => {
            return {
              // ...el,
              id_orden: el.id_orden,
              esreposicion: false,
              en_reposiciones: el.en_reposiciones,
              orden: el.id_orden,
              urgent: el.prioridad,
              entrega: el.fecha_entrega,
              id_lotes_detalles: el.id_lotes_detalles,
              unidades: el.unidades,
              observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
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
        this.ordenes
          // .filter((el) => el.fecha_inicio === null)
          .filter((el) => el.en_reposiciones === 1)
          .map((el) => {
            return {
              // ...el,
              esreposicion: true,
              en_reposiciones: el.en_reposiciones,
              orden: el.id_orden,
              id_woo: el.id_woo,
              urgent: el.prioridad,
              entrega: el.fecha_entrega,
              id_lotes_detalles: el.id_lotes_detalles,
              unidades: el.unidades,
              observaciones: el.observaciones,
              detalle_empleado: el.detalle_empleado,
              detalle_reposicion: el.detalle_reposicion,
              id_ordenes_productos: el.id_ordenes_productos,
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
    filterFechaEstimada(idOrden) {
      //   return false;
      const filtrado = this.fechasResult.filter((el) => el.id_orden == idOrden);
      console.log("fechas filtradas", filtrado);
      // return this.fechasResult;

      if (
        filtrado &&
        filtrado.length > 0 &&
        filtrado[0].fecha_estimada_entrega_formateada === undefined
      ) {
        return `<p>Fecha estimada de entrega</p><p style="margin-top:-16px">&nbsp;</p>`;
      } else {
        return `<p>Fecha estimada de entrega</p><p style="margin-top:-16px">${filtrado[0].fecha_estimada_entrega_formateada}</p>`;
      }
    },
    contarItems(cantidad) {
      return `Total ${cantidad}`;
    },
    filterVinculdas(id_orden) {
      return this.vinculadas.filter((el) => el.id_father === id_orden);
    },

    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },

    productsFilter_old(id) {
      return this.productos.filter((el) => el.id_orden == id);
    },

    productsFilter(id) {
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

    async registrarEstado(tipo, id_orden, unidades) {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("id_departamento", this.$store.state.login.currentDepartamentId);
      data.set("id_orden", id_orden);
      // data.set("id_lotes_detalles", this.item.id_lotes_detalles);
      data.set("tipo", tipo);
      data.set("unidades", unidades);
      data.set("departamento", this.$store.state.login.currentDepartament);

      await this.$axios
        .post(`${this.$config.API}/registrar-paso-empleado`, data)
        .then((res) => {
          console.log("emitimos aqui...");
          // this.$emit('reload', 'true')
          this.overlay = false;
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se pudo registrar la acción</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    async registrarEstado_old(tipo, id_lotes_detalles, unidades) {
      // tipos: inicio, fin
      this.overlay = true;
      if (this.ButtonText === "INICIAR TAREA") {
        this.ButtonDisabled = true;
      }

      await this.$axios
        .post(
          `${this.$config.API}/empleados/registrar-paso/${tipo}/${this.$store.state.login.currentDepartamentId}/${id_lotes_detalles}/${unidades}`
        )
        .then((resp) => {
          console.log("emitimos aqui...");
          this.overlay = false;
          // this.$emit('reload', 'true')
        })
        .catch((err) => {
          this.$fire({
            title: "Error registrando la accion",
            html: `<p>Por favor intetelo de nuevo</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          if (tipo === "fin") {
            this.$emit("reload");
          }
        });
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
          console.log("Rendimienot enviado");
        });
    },

    /* async sendMessageClient(idOrden) {
            this.overlay = true

            const data = new URLSearchParams()
            data.set('departamento', this.$store.state.login.currentDepartament)
            data.set('id_orden', idOrden)

            await this.$axios.post(`${this.$config.API}/send-message-produccion`, data).then(res => {
                // this.$store.dispatch('comerce/getOrdenesActivas').then(() => (this.overlay = false))
                this.overlay = false
            })
        }, */

    iniciarTodo(idOrden, unidades) {
      this.$confirm(
        ``,
        `¿Desea inicar todas las tareas de la Orden ${idOrden}?`,
        "question"
      )
        .then(() => {
          /* const OrdenesPorIniciar = this.ordenes.filter(
                        (el) => el.id_orden == idOrden
                    );

                    console.log("OrdenesPorIniciar", OrdenesPorIniciar); */

          this.registrarEstado("inicio", idOrden, unidades).then(() => {
            this.reloadMe();
            this.sendMessageClient(idOrden);
          });
        })
        .catch((err) => {
          console.log(`Error al iniciar la tarea`, err);
          return false;
        })
        .finally(() => {
          this.reloadMe();
          // this.getOrdenesAsignadas()
          this.overlay = false;
        });
    },

    /* iniciarTodo(idOrden) {
            console.log("Itmes a iniciar", this.dataTablePendiente);

            this.$confirm(
                ``,
                `¿Desea inicar todas las tareas de la Orden ${idOrden}?`,
                "question"
            )
                .then(() => {
                    const OrdenesPorIniciar = this.ordenes.filter(
                        (el) => el.id_orden == idOrden
                    );

                    console.log("OrdenesPorIniciar", OrdenesPorIniciar);

                    OrdenesPorIniciar.forEach((item) => {
                        this.registrarEstado(
                            "inicio",
                            item.id_lotes_detalles,
                            item.unidades
                        ).then(() => {});
                    });

                    this.reloadMe();
                    this.sendMessageClient(idOrden);
                })
                .catch((err) => {
                    console.log(`Error al iniciar la tarea`, err);
                    return false;
                })
                .finally(() => {
                    this.reloadMe();
                    // this.getOrdenesAsignadas()
                    this.overlay = false;
                });
        }, */

    checkTerminar(idOrden, items) {
      /**
       * Checar aqui si vamos a termiar todo e individual también okok!
       */
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

    terminarIndividual(idOrden, item) {
      this.$confirm(
        ``,
        `¿Desea terminar ésta tarea? Orden ${idOrden}`,
        "question"
      )
        .then(() => {
          // Verificar parametro en configuración del ssitema
          const showForm = parseInt(
            this.$store.state.datasys.dataSys
              .sys_mostrar_detalle_terminar_indicidual
          );
          console.log("showForm", showForm);

          if (showForm) {
            // Discriminar departamentos
            if (
              this.$store.state.login.currentDepartament === "Impresión" ||
              this.$store.state.login.currentDepartament === "Estampado" ||
              this.$store.state.login.currentDepartament === "Corte"
            ) {
              this.$fire({
                html: this.promptHTML,
                input: this.prompInputType,
                min: 0,
                step: 1,
                showCancelButton: true,
                inputValidator: (value) => {
                  if (!value) {
                    alert("Debe ingresar un valor");
                  } else {
                    this.rendimiento(value, idOrden).then(() => {
                      this.registrarEstado(
                        "fin",
                        item.id_lotes_detalles,
                        item.unidades
                      ).then(() => {
                        this.reloadMe();
                      });
                      /* items.forEach((item) => {
                        // enviar
                      }) */
                    });
                  }
                },
              });
            } else {
              console.log("iteem para terminar tarea individual", item);
              this.registrarEstado(
                "fin",
                item.id_lotes_detalles,
                item.unidades
              ).then(() => {
                this.reloadMe();
              });
              /* items.forEach((item) => {
                // enviar
              }) */
            }
          } else {
            this.registrarEstado(
              "fin",
              item.id_lotes_detalles,
              item.unidades
            ).then(() => {
              this.reloadMe();
            });
          }
        })
        .catch((err) => {
          return false;
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    getDataTable(data) {
      this.dataInsumos = data;
    },

    compararFecha(fecha) {
      // Obtener la fecha actual
      const fechaActual = new Date();

      // Dividir la fecha ingresada en día, mes y año
      const [dia, mes, anio] = fecha.split("-");

      // Crear un objeto de fecha con la fecha ingresada
      const fechaIngresada = new Date(anio, mes - 1, dia);

      // Comparar las fechas
      if (fechaIngresada <= fechaActual) {
        // La fecha es igual o menor a la fecha actual, retornar el mismo valor
        return fecha;
      } else {
        // Restar un día a la fecha ingresada
        fechaIngresada.setDate(fechaIngresada.getDate() - 1);

        // Obtener el nuevo día, mes y año
        const nuevoDia = fechaIngresada.getDate();
        const nuevoMes = fechaIngresada.getMonth() + 1;
        const nuevoAnio = fechaIngresada.getFullYear();

        // Formatear el nuevo valor de la fecha
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
        // Discriminar ordenes de Impresión
        if (this.departamento === "Impresión") {
          products = this.ordenes.filter(
            (item) =>
              item.id_orden === id_orden &&
              item.progreso === tipo &&
              item.en_tintas === 0
          );
        } /* else if (this.departamento === 'Estampado') {
          // Discriminar estampado
        } else if (this.departamento === 'Corte') {
          // Discriminar Corte
        } */ else {
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
          `${this.$config.API}/empleados/ordenes-asignadas/v2/${this.emp}/${this.$store.state.login.currentDepartamentId}`
        )
        .then((resp) => {
          if (resp.data.ordenes.length === 0) {
            this.msg = "Usted no tiene ordenes asignadas";
          }

          this.ordenes = [];
          this.ordenes = resp.data.ordenes;
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

    /* getOrdenesAsignadasSSE() {
            this.msg = "Estamos buscando sus tareas por favor espere.."
            this.sourceEvent.addEventListener("message", (event) => {
                console.group("SSE Listener (Asignadas)")
                // console.log("event message", event);
                const eventData = JSON.parse(event.data)
                const eventType = event.type

                if (eventType === "chat") {
                    this.events.push(eventData)
                }

                if (eventType === "message") {
                    // this.events = eventData
                    const tmpResp = eventData.items.filter(
                        (item) =>
                            item.id_woo != "11" ||
                            item.id_woo != "12" ||
                            item.id_woo != "13" ||
                            item.id_woo != "14" ||
                            item.id_woo != "15" ||
                            item.id_woo != "16" ||
                            item.id_woo != "112" ||
                            item.id_woo != "113" ||
                            item.id_woo != "168" ||
                            item.id_woo != "169" ||
                            item.id_woo != "170" ||
                            item.id_woo != "171" ||
                            item.id_woo != "172" ||
                            item.id_woo != "173"
                    )
                    console.log("igual?", tmpResp != this.ordenes)
                    const checkMe = tmpResp == this.ordenes
                    if (!checkMe) {
                        this.ordenes = tmpResp
                        console.log("this.enCurso", this.enCurso.length)
                        console.log("eventData", eventData.length)
                        this.enCurso = eventData.trabajos_en_curso
                    }
                    console.groupEnd()
                }
            })

            this.source.addEventListener("error", (error) => {
                console.error("Error in SSE connection:", error)
                this.source.close() // Cerrar la conexión actual
            })
        }, */

    /* async getOrdenesAsignadasReload() {
            this.msg = "Estamos buscando sus tareas por favor espere.."
            await this.sourceEvent.addEventListener("message", (event) => {
                console.group("SSE Listener (Reload)")
                console.log("event message", event)
                const eventData = JSON.parse(event.data)
                const eventType = event.type

                if (eventType === "chat") {
                    this.events.push(eventData)
                }

                if (eventType === "message") {
                    // this.events = eventData
                    const tmpResp = eventData.items.filter(
                        (item) =>
                            item.id_woo != "11" ||
                            item.id_woo != "12" ||
                            item.id_woo != "13" ||
                            item.id_woo != "14" ||
                            item.id_woo != "15" ||
                            item.id_woo != "16" ||
                            item.id_woo != "112" ||
                            item.id_woo != "113" ||
                            item.id_woo != "168" ||
                            item.id_woo != "169" ||
                            item.id_woo != "170" ||
                            item.id_woo != "171" ||
                            item.id_woo != "172" ||
                            item.id_woo != "173"
                    )

                    if (tmpResp != this.ordenes) {
                        this.ordenes = tmpResp
                        console.log("this.enCurso", this.enCurso)
                        console.log("eventData", eventData)
                        this.enCurso = eventData.trabajos_en_curso
                    }

                    console.groupEnd()
                }
            })

            this.source.addEventListener("error", (error) => {
                console.error("Error in SSE connection:", error)
                this.source.close() // Cerrar la conexión actual
            })
        }, */
    async getInsumos() {
      await this.$axios.get(`${this.$config.API}/insumos`).then((resp) => {
        this.insumos = resp.data;
      });
    },

    maquetarPrioridad(prioridad) {
      const pri = parseInt(prioridad);
      let text = "";

      if (!pri) {
        text = "";
        this.fields[0].variant = "info";
      } else {
        text = "";
        this.fields[0].variant = "danger";
      }

      return text;
    },

    reloadMe() {
      this.getInsumos();
      this.getOrdenesAsignadas();
      this.getOrdenesFechas().then(() => {
        this.fechasResult = this.proyectarEntregaConCola(
          this.fechas,
          this.$store.state.login.dataEmpresa.horario_laboral
        );
      });
      if (this.ordenes != this.items) {
        this.msg = "Tiene nuevas ordenes asignadas";
      }
    },
  },

  mounted() {
    // CArgar datos de las ordenes asignadas
    /* this.sourceEvent = new EventSource(
      `${this.$config.API}/sse/empleados/ordenes-asignadas/${this.emp}`
    ); */
    this.getOrdenesFechas().then(() => {
      this.fechasResult = this.proyectarEntregaConCola(
        this.fechas,
        this.$store.state.login.dataEmpresa.horario_laboral
      );
    });

    this.getOrdenesAsignadas().then(() => {
      // console.log("Pausas en  V4", this.pausas);
    });
    if (this.$store.state.login.currentDepartament === "Impresión") {
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
