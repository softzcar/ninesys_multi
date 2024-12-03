<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <!-- Infos -->
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
            </div>

            <div v-else>
                <b-container fluid>
                    <!-- Botón recargar  -->
                    <b-row>
                        <b-col>
                            <b-row class="text-center mb-4">
                                <b-col>
                                    <b-button
                                        variant="success"
                                        @click="reloadMe"
                                        >Recargar</b-button
                                    >
                                </b-col>
                            </b-row>
                        </b-col>
                    </b-row>

                    <b-row>
                        <b-col>
                            <h3>
                                Reposiciones {{ dataTableReposiciones.length }}
                            </h3>
                        </b-col>

                        <b-alert
                            class="text-center"
                            v-if="dataTableReposiciones.length < 1"
                            show
                            variant="info"
                            >No tienes reposiciones en curso</b-alert
                        >
                        <b-table
                            v-else
                            fixed
                            :items="dataTableReposiciones"
                            :fields="filedsLista"
                        >
                            <template #cell(orden)="row">
                                <div style="width: 164%; float: left">
                                    <span class="floatme">
                                        <linkSearch
                                            class="floatme mb-2"
                                            :id="row.item.orden"
                                        />
                                    </span>

                                    <!-- Ver detalles -->
                                    <span class="floatme">
                                        <b-button
                                            :variant="
                                                setStatusButton(
                                                    'secondary',
                                                    row.item.urgent
                                                )
                                            "
                                            block
                                            size="xl"
                                            style="padding: 6px 20px 0 20px"
                                            @click="row.toggleDetails"
                                        >
                                            <h4>
                                                <b-icon
                                                    icon="caret-down-fill"
                                                ></b-icon>
                                            </h4>
                                        </b-button>
                                    </span>

                                    <!-- Terminar -->
                                    <span class="floatme">
                                        <empleados-SseOrdenesAsignadasModalExtra
                                            :departamento="
                                                $store.state.login.dataUser
                                                    .departamento
                                            "
                                            :item="row.item"
                                            :items="
                                                filterOrder(
                                                    row.item.orden,
                                                    'en curso'
                                                )
                                            "
                                            class="floatme"
                                            :insumosimp="insumosImpresion"
                                            :insumosest="insumosEstampado"
                                            :insumoscor="insumosCorte"
                                            tipo="todo"
                                            :idorden="row.item.orden"
                                            @reload="reloadMe()"
                                        />
                                        <!-- 
                      <b-buttongetOrdenesAsignadas
                        block
                        size="xl"
                        variant="success"
                        @click="
                          checkTerminar(
                            row.item.orden,
                            filterOrder(row.item.orden, 'todo')
                          )
                        "
                        >Terminar
                      </b-button>-->
                                        <!-- <b-button block size="xl" variant="success" @click="
                        terminarTodo(
                          row.item.orden,
                          filterOrder(row.item.orden, 'todo')
                        )
                        ">Terminar
                      </b-button> -->
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
                                            :idorden="row.item.orden"
                                            :detalles="row.item.observaciones"
                                            :detalle_empleado="
                                                row.item.detalle_empleado
                                            "
                                            :productos="
                                                productsFilter(row.item.orden)
                                            "
                                        />
                                    </span>
                                </div>
                            </template>

                            <!-- Lista de productos -->
                            <template #row-details="row">
                                <b-card>
                                    <b-table
                                        small
                                        striped
                                        stacked
                                        responsive
                                        :items="
                                            filterOrder(
                                                row.item.orden,
                                                'en curso'
                                            )
                                        "
                                        :fields="fields"
                                    >
                                        <template #cell(orden)="row">
                                            <span class="floatme">
                                                <b-button
                                                    block
                                                    size="xl"
                                                    variant="success"
                                                    @click="
                                                        terminarIndividual(
                                                            row.item.orden,
                                                            // filterOrder(row.item.orden)
                                                            row.item
                                                        )
                                                    "
                                                    >Terminar
                                                </b-button>
                                                <!-- <pre>
                            item:::: {{ row.item }}
                          </pre> -->
                                            </span>
                                        </template>
                                        <!-- <template #cell(orden)="row">
                        <empleados-BotonTerminarModalListaDeTareas
                          class="mt-3 mb-3 text-left"
                          :item="row.item"
                          :itemfather="row.item"
                          @reload="getOrdenesAsignadas"
                        />
                      </template> -->

                                        <template #cell(departamento)="row">
                                            {{ row.item.departamento }}
                                        </template>
                                        <template #cell(id_orden)="row">
                                            <h4 class="mb-4">
                                                {{ row.item.id_orden }}
                                                <small style="font-size: 35%"
                                                    >{{ row.item.producto }} |
                                                    Talla
                                                    {{ row.item.talla }}</small
                                                >
                                            </h4>
                                            {{
                                                maquetarPrioridad(
                                                    row.item.prioridad
                                                )
                                            }}
                                        </template>
                                    </b-table>
                                </b-card>
                            </template>
                        </b-table>
                    </b-row>

                    <b-row>
                        <b-col>
                            <h3>En Curso {{ dataTableEnCurso.length }}</h3>
                            <b-alert
                                class="text-center"
                                v-if="dataTableEnCurso.length < 1"
                                show
                                variant="info"
                                >No tienes reposiciones pendientes</b-alert
                            >
                            <!-- BOTONES EN CURSO -->
                            <b-table
                                v-else
                                fixed
                                :items="dataTableEnCurso"
                                :fields="filedsLista"
                            >
                                <template #cell(orden)="row">
                                    <div style="width: 164%; float: left">
                                        <span class="floatme">
                                            <linkSearch
                                                class="floatme mb-2"
                                                :id="row.item.orden"
                                            />
                                        </span>

                                        <!-- Ver detalles -->
                                        <span class="floatme">
                                            <b-button
                                                :variant="
                                                    setStatusButton(
                                                        'secondary',
                                                        row.item.urgent
                                                    )
                                                "
                                                block
                                                size="xl"
                                                style="padding: 6px 20px 0 20px"
                                                @click="row.toggleDetails"
                                            >
                                                <h4>
                                                    <b-icon
                                                        icon="caret-down-fill"
                                                    ></b-icon>
                                                </h4>
                                            </b-button>
                                        </span>

                                        <!-- Terminar -->
                                        <span class="floatme">
                                            <empleados-SseOrdenesAsignadasModalExtra
                                                :departamento="
                                                    $store.state.login.dataUser
                                                        .departamento
                                                "
                                                :item="row.item"
                                                :items="
                                                    filterOrder(
                                                        row.item.orden,
                                                        'en curso'
                                                    )
                                                "
                                                class="floatme"
                                                :insumosimp="insumosImpresion"
                                                :insumosest="insumosEstampado"
                                                :insumoscor="insumosCorte"
                                                tipo="todo"
                                                :idorden="row.item.orden"
                                                @reload="reloadMe()"
                                            />
                                            <!-- 
                      <b-buttongetOrdenesAsignadas
                        block
                        size="xl"
                        variant="success"
                        @click="
                          checkTerminar(
                            row.item.orden,
                            filterOrder(row.item.orden, 'todo')
                          )
                        "
                        >Terminar
                      </b-button>-->
                                            <!-- <b-button block size="xl" variant="success" @click="
                        terminarTodo(
                          row.item.orden,
                          filterOrder(row.item.orden, 'todo')
                        )
                        ">Terminar
                      </b-button> -->
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
                                                :idorden="row.item.orden"
                                                :detalles="
                                                    row.item.observaciones
                                                "
                                                :detalle_empleado="
                                                    row.item.detalle_empleado
                                                "
                                                :productos="
                                                    productsFilter(
                                                        row.item.orden
                                                    )
                                                "
                                            />
                                        </span>

                                        <!-- Vinculadas -->
                                        <span class="floatme">
                                            <ordenes-vinculadas-v2
                                                :ordenes_vinculadas="vinculadas"
                                            />
                                            VINCULADAS
                                        </span>
                                    </div>
                                </template>

                                <!-- Lista de productos -->
                                <template #row-details="row">
                                    <b-card>
                                        <b-table
                                            small
                                            striped
                                            stacked
                                            responsive
                                            :items="
                                                filterOrder(
                                                    row.item.orden,
                                                    'en curso'
                                                )
                                            "
                                            :fields="fields"
                                        >
                                            <template #cell(orden)="row">
                                                <span class="floatme">
                                                    <b-button
                                                        block
                                                        size="xl"
                                                        variant="success"
                                                        @click="
                                                            terminarIndividual(
                                                                row.item.orden,
                                                                // filterOrder(row.item.orden)
                                                                row.item
                                                            )
                                                        "
                                                        >Terminar
                                                    </b-button>
                                                    <!-- <pre>
                            item:::: {{ row.item }}
                          </pre> -->
                                                </span>
                                            </template>
                                            <!-- <template #cell(orden)="row">
                        <empleados-BotonTerminarModalListaDeTareas
                          class="mt-3 mb-3 text-left"
                          :item="row.item"
                          :itemfather="row.item"
                          @reload="getOrdenesAsignadas"
                        />
                      </template> -->

                                            <template #cell(departamento)="row">
                                                {{ row.item.departamento }}
                                            </template>
                                            <template #cell(id_orden)="row">
                                                <h4 class="mb-4">
                                                    {{ row.item.id_orden }}
                                                    <small
                                                        style="font-size: 35%"
                                                        >{{ row.item.producto }}
                                                        | Talla
                                                        {{
                                                            row.item.talla
                                                        }}</small
                                                    >
                                                </h4>
                                                {{
                                                    maquetarPrioridad(
                                                        row.item.prioridad
                                                    )
                                                }}
                                            </template>
                                        </b-table>
                                    </b-card>
                                </template>
                            </b-table>
                        </b-col>
                    </b-row>

                    <!-- ORDENES PENDIENTES -->
                    <b-row>
                        <b-col>
                            <h3>Pendientes {{ dataTablePendiente.length }}</h3>

                            <b-alert
                                class="text-center"
                                v-if="dataTablePendiente.length < 1"
                                show
                                variant="info"
                                >No tienes tareas pendientes</b-alert
                            >

                            <b-table
                                v-else
                                fixed
                                :items="dataTablePendiente"
                                :fields="filedsLista"
                            >
                                <template #cell(orden)="row">
                                    <div style="width: 164%; float: left">
                                        <span class="floatme">
                                            <linkSearch
                                                class="floatme mb-2"
                                                :id="row.item.orden"
                                            />
                                        </span>

                                        <span class="floatme">
                                            <b-button
                                                :variant="
                                                    setStatusButton(
                                                        'secondary',
                                                        row.item.urgent
                                                    )
                                                "
                                                block
                                                size="xl"
                                                style="padding: 6px 20px 0 20px"
                                                @click="row.toggleDetails"
                                            >
                                                <h4>
                                                    <b-icon
                                                        icon="caret-down-fill"
                                                    ></b-icon>
                                                </h4>
                                            </b-button>
                                        </span>

                                        <span class="floatme">
                                            <b-button
                                                block
                                                size="xl"
                                                variant="info"
                                                @click="
                                                    iniciarTodo(row.item.orden)
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

                                        <!-- <span class="floatme">
                      <b-button
                        :variant="row.item.urgent"
                        block
                        size="xl"
                        style="padding: 6px 20px 0 20px"
                        @click="row.toggleDetails"
                        ><h4>
                          Items Asignados
                          <b-icon icon="caret-down-fill"></b-icon>
                        </h4>
                      </b-button>
                    </span> -->

                                        <span
                                            class="floatme"
                                            style="width: 160px"
                                        >
                                            <empleados-ProgressBarEmpleados
                                                :idOrden="row.item.orden"
                                            />
                                        </span>

                                        <!-- Detalles -->
                                        <span class="floatme">
                                            <produccion-control-de-produccion-detalles-editor
                                                :idorden="row.item.orden"
                                                :detalles="
                                                    row.item.observaciones
                                                "
                                                :detalle_empleado="
                                                    row.item.detalle_empleado
                                                "
                                                :productos="
                                                    productsFilter(
                                                        row.item.orden
                                                    )
                                                "
                                            />
                                        </span>

                                        <!-- Vinculadas -->
                                        <span class="floatme">
                                            <ordenes-vinculadas-v2
                                                :ordenes_vinculadas="vinculadas"
                                            />
                                            VINCULADAS
                                        </span>

                                        <!-- <span
                      style="
                        display: inline-block;
                        padding-top: 2px;
                        padding-left: 10px;
                        margin-top: 14px;
                      "
                    >
                      <h4 class="mt'4">
                        {{
                          formatFechaGuiones(compararFecha(row.item.entrega))
                        }}
                      </h4>
                    </span> -->
                                    </div>
                                </template>

                                <template #row-details="row">
                                    <b-card>
                                        <b-table
                                            small
                                            striped
                                            stacked
                                            responsive
                                            :items="
                                                filterOrder(
                                                    row.item.orden,
                                                    'por iniciar'
                                                )
                                            "
                                            :fields="fields"
                                        >
                                            <template #cell(departamento)="row">
                                                {{ row.item.departamento }}
                                            </template>

                                            <template #cell(orden)="row">
                                                <empleados-BotonIniciarModalListaDeTareas
                                                    class="mt-3 mb-3 text-left"
                                                    :item="row.item"
                                                    :itemfather="row.item"
                                                    @reload="
                                                        getOrdenesAsignadas
                                                    "
                                                />
                                            </template>

                                            <template #cell(id_orden)="row">
                                                <h4 class="mb-4">
                                                    {{ row.item.id_orden }}
                                                    <small
                                                        style="font-size: 35%"
                                                        >{{ row.item.producto }}
                                                        | Talla
                                                        {{
                                                            row.item.talla
                                                        }}</small
                                                    >
                                                </h4>
                                                {{
                                                    maquetarPrioridad(
                                                        row.item.prioridad
                                                    )
                                                }}
                                            </template>
                                        </b-table>
                                    </b-card>
                                </template>
                            </b-table>
                        </b-col>
                    </b-row>

                    <!-- <b-row>
            <b-col>
              <h3>Lista antigua</h3>
              <b-table small stacked :items="ordersList" :fields="fields2">
                <template #cell(id_lotes_detalles)="row">
                  terminemos el lote {{ row.item.id_lotes_detalles }}
                </template>
                <template #cell(orden)="row">
                  <div style="width: 164%; float: left">
                    <div style="width: 270px; margin: 0 auto">
                      <span style="display: inline-block">
                        <b-button
                          :variant="row.item.urgent"
                          block
                          size="xl"
                          style="padding: 6px 40px 0 40px"
                          @click="row.toggleDetails"
                          ><h4>{{ row.item.orden }}</h4>
                        </b-button>
                      </span>
                      <span
                        style="
                          display: inline-block;
                          padding-top: 2px;
                          padding-left: 10px;
                        "
                      >
                        <h4>Entrega: {{ compararFecha(row.item.entrega) }}</h4>
                      </span>
                    </div>
                  </div>
                </template>

                <template #row-details="row">
                  <b-card>
                    <b-table
                      small
                      striped
                      stacked
                      responsive
                      :items="filterOrder(row.item.orden)"
                      :fields="fields"
                    >
                      <template #cell(departamento)="row">
                        {{ row.item.departamento }}
                      </template>
                      <template #cell(id_lotes_detalles)="row">
                        <empleados-BotonTerminarModal
                          :datainsumos="dataInsumos"
                          :datos="dataInsumos"
                          :itemfather="row.item"
                          :item="row.item"
                          @reload="reloadMe()"
                        />
                      </template>
                      <template #cell(detalle)="row">
                        <div
                          style="
                            width: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                          "
                        >
                          <linkSearch
                            class="floatme mb-2"
                            :id="row.item.id_orden"
                          />
                          <diseno-view-image
                            class="floatme mb-2"
                            :id="row.item.id_orden"
                          />
                        </div>
                        <empleados-ver-detalle
                          class="mt-2"
                          :detalles_revision="row.item.detalles_revision"
                          :idorden="row.item.id_orden"
                          :id_ordenes_productos="row.item.id_ordenes_productos"
                        />
                      </template>
                      <template #cell(id_orden)="row">
                        <h4 class="mb-4">
                          {{ row.item.id_orden }}
                          <small style="font-size: 35%"
                            >{{ row.item.producto }} | Talla
                            {{ row.item.talla }}</small
                          >
                        </h4>
                        {{ maquetarPrioridad(row.item.prioridad) }}
                      </template>
                    </b-table>
                  </b-card>
                </template>
              </b-table>
            </b-col>
          </b-row> -->
                </b-container>
                <!-- <pre>
          {{ ordenes }}
        </pre> -->
            </div>
        </b-overlay>
        <!-- <pre style="display: block !important">
      $data::: {{ $data }}
    </pre> -->
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"
import axios from "axios"

// import { log } from 'console'
export default {
    data() {
        return {
            // sourceEvent: null, // Variable para inicializar eventSource y utilizarla poseteriormente en la sfunciones para obtener la informacion de las ordenes asignadas
            promptHTML: "HTML PROMPT!!!",
            prompInputType: "text",
            value: 45,
            msg: "Estamos buscando sus tareas por favor espere...",
            enCurso: null,
            dataInsumos: [],
            dataOrdenEnCurso: [],
            showAlert: true,
            ordenes: [],
            vinculadas: [],
            productos: [],
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
        }
    },

    mixins: [mixin],

    watch: {
        reload(val) {
            // const p = this.dataOrdenEnCurso.push('val')
            this.dataOrdenEnCurso = [{ data: "hola" }]

            console.log("cargar informacion en el cuadro informativo", p)
            return true
        },
    },

    computed: {
        insumosImpresion() {
            let options = this.insumos.filter(
                (item) => item.departamento === "Impresión"
            )
            options.concat({ value: 0, text: "Seleccion insumo" })
            return options
        },

        insumosEstampado() {
            let options = this.insumos.filter(
                (item) =>
                    item.departamento === "Estampado" ||
                    item.departamento === "Corte"
            )
            options.concat({ value: 0, text: "Seleccion insumo" })
            return options
        },

        insumosCorte() {
            let options = this.insumos.filter(
                (item) =>
                    item.departamento === "Estampado" ||
                    item.departamento === "Corte"
            )
            options.concat({ value: 0, text: "Seleccion insumo" })
            return options
        },

        dataTableEnCurso() {
            let enCurso = []
            if (this.$store.state.login.dataUser.departamento === "Impresión") {
                //
                enCurso = this.ordenes
                    .filter(
                        (el) =>
                            (el.progreso === "en curso" ||
                                el.progreso === "terminada") &&
                            el.en_tintas === 0
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
                            en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
                            en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
                            valor_inicial: el.valor_inicial,
                            valor_final: el.valor_final,
                            observaciones: el.observaciones,
                        }
                    })
                    .reduce((acc, item) => {
                        // console.log('item to push', item)
                        if (
                            acc.filter((row) => row.orden === item.orden)
                                .length === 0
                        ) {
                            acc.push(item)
                        }
                        return acc
                    }, [])
            } else if (
                this.$store.state.login.dataUser.departamento === "Estampado"
            ) {
                enCurso = this.ordenes
                    .filter(
                        (el) =>
                            (el.progreso === "en curso" ||
                                el.progreso === "terminada") &&
                            el.en_inv_mov === 0
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
                            en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
                            en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
                            valor_inicial: el.valor_inicial,
                            valor_final: el.valor_final,
                        }
                    })
                    .reduce((acc, item) => {
                        // console.log('item to push', item)
                        if (
                            acc.filter((row) => row.orden === item.orden)
                                .length === 0
                        ) {
                            acc.push(item)
                        }
                        return acc
                    }, [])
                // opciones para corte
            } else if (
                this.$store.state.login.dataUser.departamento === "Corte"
            ) {
                enCurso = this.ordenes
                    .filter(
                        (el) =>
                            (el.progreso === "en curso" ||
                                el.progreso === "terminada") &&
                            el.en_inv_mov === 0
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
                            en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
                            en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
                        }
                    })
                    .reduce((acc, item) => {
                        // console.log('item to push', item)
                        if (
                            acc.filter((row) => row.orden === item.orden)
                                .length === 0
                        ) {
                            acc.push(item)
                        }
                        return acc
                    }, [])
            } else {
                enCurso = this.ordenes
                    .filter(
                        (el) =>
                            (el.progreso === "en curso" ||
                                el.progreso === "terminada") &&
                            el.en_inv_mov === 0 &&
                            el.en_reposiciones === 0
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
                            en_tintas: el.en_tintas, // Verificar si ya tiene registro en la tabal tintas
                            en_inv_mov: el.en_inv_mov, // Verificar si ya tiene registro en la tabal inventario_movimientos
                        }
                    })
                    .reduce((acc, item) => {
                        // console.log('item to push', item)
                        if (
                            acc.filter((row) => row.orden === item.orden)
                                .length === 0
                        ) {
                            acc.push(item)
                        }
                        return acc
                    }, [])
            }

            console.log("dataTableEnCurso", enCurso)
            return enCurso
        },

        dataTablePendiente() {
            return (
                this.ordenes
                    // .filter((el) => el.fecha_inicio === null)
                    .filter((el) => el.progreso === "por iniciar")
                    .map((el) => {
                        return {
                            // ...el,
                            orden: el.id_orden,
                            urgent: el.prioridad,
                            entrega: el.fecha_entrega,
                            id_lotes_detalles: el.id_lotes_detalles,
                            unidades: el.unidades,
                            observaciones: el.observaciones,
                        }
                    })
                    .reduce((acc, item) => {
                        // console.log('item to push', item)

                        if (
                            acc.filter((row) => row.orden === item.orden)
                                .length === 0
                        ) {
                            acc.push(item)
                        }
                        return acc
                    }, [])
            )
        },

        dataTableReposiciones() {
            return (
                this.ordenes
                    // .filter((el) => el.fecha_inicio === null)
                    .filter((el) => el.en_reposiciones === 1)
                    .map((el) => {
                        return {
                            // ...el,
                            orden: el.id_orden,
                            id_woo: el.id_woo,
                            urgent: el.prioridad,
                            entrega: el.fecha_entrega,
                            id_lotes_detalles: el.id_lotes_detalles,
                            unidades: el.unidades,
                            observaciones: el.observaciones,
                        }
                    })
                    .reduce((acc, item) => {
                        // console.log('item to push', item)

                        if (
                            acc.filter((row) => row.orden === item.orden)
                                .length === 0
                        ) {
                            acc.push(item)
                        }
                        return acc
                    }, [])
            )
        },

        ordersListPendiente() {
            if (!Array.isArray(this.pagos)) {
                this.pagos = []
            }

            let tmp = this.ordenes
                .map((item) => {
                    let txtVariant
                    if (parseInt(item.prioridad)) {
                        txtVariant = "danger"
                    } else {
                        txtVariant = "success"
                    }
                    return {
                        orden: item.id_orden,
                        variant: txtVariant,
                        entrega: item.fecha_entrega,
                        inicio: item.fecha_inicio,
                        terminado: item.fecha_terminado,
                        urgent: this.checkPrioridad(item.prioridad),
                    }
                })
                .reduce((acc, item) => {
                    // console.log('item to push', item)

                    if (
                        acc.filter((row) => row.orden === item.orden).length ===
                        0
                    ) {
                        acc.push(item)
                    }
                    return acc
                }, [])
            return tmp
        },

        ordersListEnCurso() {
            if (!Array.isArray(this.pagos)) {
                this.pagos = []
            }

            let tmp = this.ordenes
                .map((item) => {
                    let txtVariant
                    if (parseInt(item.prioridad)) {
                        txtVariant = "danger"
                    } else {
                        txtVariant = "success"
                    }
                    return {
                        orden: item.id_orden,
                        variant: txtVariant,
                        entrega: item.fecha_entrega,
                        terminado: item.fecha_terminado,
                        inicio: item.fecha_inicio,
                        urgent: this.checkPrioridad(item.prioridad),
                    }
                })
                .reduce((acc, item) => {
                    // console.log('item to push', item)

                    if (
                        acc.filter((row) => row.orden === item.orden).length ===
                        0
                    ) {
                        acc.push(item)
                    }
                    return acc
                }, [])
            return tmp
        },

        ordenesSize() {
            let size = null
            size = parseInt(this.ordenes.length)
            if (size) {
                this.msg = ""
            } else {
                this.msg = "Cargando sus tareas por favor espere..."
                // this.msg = "Has terminado todas tus tareas 👍";
            }

            return size
        },
    },

    methods: {
        productsFilter(id) {
            return this.productos.filter((el) => el.id_orden == id)
        },

        setStatusButton(status, urgent) {
            if (urgent === "0") {
                return status
            } else {
                return "danger"
            }
        },

        async registrarEstado(tipo, id_lotes_detalles, unidades) {
            // tipos: inicio, fin
            this.overlay = true
            if (this.ButtonText === "INICIAR TAREA") {
                // this.ButtonText = 'TERMINAR TAREA OLD'
                // this.ButtonVariant = 'success'
                this.ButtonDisabled = true
            }

            await this.$axios
                .post(
                    `${this.$config.API}/empleados/registrar-paso/${tipo}/${this.$store.state.login.dataUser.departamento}/${id_lotes_detalles}/${unidades}`
                )
                .then((resp) => {
                    console.log("emitimos aqui...")
                    this.overlay = false
                    // this.$emit('reload', 'true')
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error registrando la accion",
                        html: `<p>Por favor intetelo de nuevo</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    if (tipo === "fin") {
                        this.$emit("reload")
                    }
                })
        },

        async rendimiento(valor, idOrden) {
            const data = new URLSearchParams()
            data.set("id_orden", idOrden)
            data.set("valor", valor)
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            )
            data.set(
                "departamento",
                this.$store.state.login.dataUser.departamento
            )

            await this.$axios
                .post(`${this.$config.API}/insumos/rendimiento`, data)
                .then((res) => {
                    console.log("Rendimienot enviado")
                    // this.resetForm()
                    // this.$bvModal.hide(this.modal)
                })
        },
        iniciarTodo(idOrden) {
            console.log("Itmes a iniciar", this.dataTablePendiente)

            this.$confirm(
                ``,
                `¿Desea inicar todas las tareas de la Orden ${idOrden}?`,
                "question"
            )
                .then(() => {
                    const OrdenesPorIniciar = this.ordenes.filter(
                        (el) => el.id_orden == idOrden
                    )

                    OrdenesPorIniciar.forEach((item) => {
                        this.registrarEstado(
                            "inicio",
                            item.id_lotes_detalles,
                            item.unidades
                        ).then(() => {})
                    })
                })
                .catch((err) => {
                    console.log(`Error al iniciar la tarea`, err)
                    return false
                })
                .finally(() => {
                    // this.reloadMe();
                    this.getOrdenesAsignadas()
                    this.overlay = false
                })
        },

        checkTerminar(idOrden, items) {
            /**
             * Checar aqui si vamos a termiar todo e individual también okok!
             */
            if (this.$store.state.login.dataUser.departamento === "Impresión") {
                alert("Solicitar números de rollos de papel")
            } else if (
                this.$store.state.login.dataUser.departamento === "Estampado"
            ) {
                alert("Solicitar datos de Estampado")
            } else if (
                this.$store.state.login.dataUser.departamento === "Corte"
            ) {
                alert("Solicitar datos de Corte")
            } else {
                alert("No preguntar nada, empleado normal")
            }
        },

        /*  terminarTodo(idOrden, items) {
      this.$confirm(
        ``,
        `¿Desea terminar todas las tareas de la Orden ${idOrden}?`,
        'question'
      )
        .then(() => {
          // Discriminar departamentos
          if (
            this.$store.state.login.dataUser.departamento === 'Impresión' ||
            this.$store.state.login.dataUser.departamento === 'Estampado' ||
            this.$store.state.login.dataUser.departamento === 'Corte'
          ) {
            this.$fire({
              html: this.promptHTML,
              input: this.prompInputType,
              min: 0,
              step: 1,
              showCancelButton: true,
              inputValidator: (value) => {
                if (!value) {
                  alert('Debe ingresar un valor')
                } else {
                  this.rendimiento(value, idOrden).then(() => {
                    items.forEach((item) => {
                      // enviar
                      this.registrarEstado(
                        'fin',
                        item.id_lotes_detalles,
                        item.unidades
                      ).then(() => {
                        this.reloadMe()
                      })
                    })
                  })
                }
              },
            })
          } else {
            items.forEach((item) => {
              // enviar
              this.registrarEstado(
                'fin',
                item.id_lotes_detalles,
                item.unidades
              ).then(() => {
                this.reloadMe()
              })
            })
          }
        })
        .catch((err) => {
          return false
        })
        .finally(() => {
          this.overlay = false
        })
    }, */

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
                    )
                    console.log("showForm", showForm)

                    if (showForm) {
                        // Discriminar departamentos
                        if (
                            this.$store.state.login.dataUser.departamento ===
                                "Impresión" ||
                            this.$store.state.login.dataUser.departamento ===
                                "Estampado" ||
                            this.$store.state.login.dataUser.departamento ===
                                "Corte"
                        ) {
                            this.$fire({
                                html: this.promptHTML,
                                input: this.prompInputType,
                                min: 0,
                                step: 1,
                                showCancelButton: true,
                                inputValidator: (value) => {
                                    if (!value) {
                                        alert("Debe ingresar un valor")
                                    } else {
                                        this.rendimiento(value, idOrden).then(
                                            () => {
                                                this.registrarEstado(
                                                    "fin",
                                                    item.id_lotes_detalles,
                                                    item.unidades
                                                ).then(() => {
                                                    this.reloadMe()
                                                })
                                                /* items.forEach((item) => {
                        // enviar
                      }) */
                                            }
                                        )
                                    }
                                },
                            })
                        } else {
                            console.log(
                                "iteem para terminar tarea individual",
                                item
                            )
                            this.registrarEstado(
                                "fin",
                                item.id_lotes_detalles,
                                item.unidades
                            ).then(() => {
                                this.reloadMe()
                            })
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
                            this.reloadMe()
                        })
                    }
                })
                .catch((err) => {
                    return false
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        getDataTable(data) {
            this.dataInsumos = data
        },
        /*  SSEConnect(url) {
             this.source = new EventSource(`${this.$config.API}/${url}`)

             this.source.addEventListener('message', (event) => {
                 const eventData = JSON.parse(event.data)
                 const eventType = event.type

                 if (eventType === 'chat') {
                     this.events.push(eventData)
                 }

                 if (eventType === 'message') {
                     // this.events.push(eventData)
                     this.events = eventData
                 }
             })

             this.source.addEventListener('error', (error) => {
                 console.error('Error in SSE connection:', error)
                 this.source.close() // Cerrar la conexión actual

                 // Intentar reconectar después de un cierto período de tiempo
                 setTimeout(() => {
                     this.connectToServer()
                 }, 120000) // Puedes ajustar el tiempo de espera según tus necesidades
             })
         }, */

        /* connectToServer() {
      this.getOrdenesAsignadas()
    }, */
        compararFecha(fecha) {
            // Obtener la fecha actual
            const fechaActual = new Date()

            // Dividir la fecha ingresada en día, mes y año
            const [dia, mes, anio] = fecha.split("-")

            // Crear un objeto de fecha con la fecha ingresada
            const fechaIngresada = new Date(anio, mes - 1, dia)

            // Comparar las fechas
            if (fechaIngresada <= fechaActual) {
                // La fecha es igual o menor a la fecha actual, retornar el mismo valor
                return fecha
            } else {
                // Restar un día a la fecha ingresada
                fechaIngresada.setDate(fechaIngresada.getDate() - 1)

                // Obtener el nuevo día, mes y año
                const nuevoDia = fechaIngresada.getDate()
                const nuevoMes = fechaIngresada.getMonth() + 1
                const nuevoAnio = fechaIngresada.getFullYear()

                // Formatear el nuevo valor de la fecha
                const nuevoValor = `${nuevoDia
                    .toString()
                    .padStart(2, "0")}-${nuevoMes
                    .toString()
                    .padStart(2, "0")}-${nuevoAnio}`

                return nuevoValor
            }
        },

        checkPrioridad(val) {
            const prioridad = parseInt(val)
            let variant = ""
            if (prioridad) {
                variant = "danger"
            } else {
                variant = "info"
            }
            return variant
        },

        createArray(obj) {
            const arr = []
            arr.push(obj)
            console.log(" creata array", arr)
            return arr
        },

        filterOrder(id_orden, tipo) {
            let products
            if (tipo === "en curso") {
                // Discriminar ordenes de Impresión
                if (this.departamento === "Impresión") {
                    products = this.ordenes.filter(
                        (item) =>
                            item.id_orden === id_orden &&
                            item.progreso === tipo &&
                            item.en_tintas === 0
                    )
                } /* else if (this.departamento === 'Estampado') {
          // Discriminar estampado
        } else if (this.departamento === 'Corte') {
          // Discriminar Corte
        } */ else {
                    products = this.ordenes.filter(
                        (item) =>
                            item.id_orden === id_orden && item.progreso === tipo
                    )
                }
            } else if (tipo === "todo") {
                products = this.ordenes.filter(
                    (item) =>
                        item.id_orden === id_orden && !item.fecha_inicio != null
                )
            } else {
                products = this.ordenes.filter(
                    (item) =>
                        item.id_orden === id_orden && item.progreso === tipo
                )
            }
            console.log("Todos ordenes", this.ordenes)

            console.log(`Productos filtrados tipo ${tipo}`, products)

            return products
        },

        async getOrdenesAsignadas() {
            await this.$axios
                .get(
                    `${this.$config.API}/empleados/ordenes-asignadas/v2/${this.emp}`
                )
                .then((resp) => {
                    console.log("respuesta de ordenes asignadas", resp)

                    this.ordenes = resp.data.ordenes
                    this.vinculadas = resp.data.vinculadas
                    this.productos = resp.data.productos
                    /* this.ordenes = resp.data.ordenes.filter(
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
          ); */
                })
        },

        getOrdenesAsignadasSSE() {
            this.msg = "Estamos buscando sus tareas por favor espere.."
            /* this.source = new EventSource(
        `${this.$config.API}/sse/empleados/ordenes-asignadas/${this.emp}`
      ); */

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

                    /* if (eventData.pagos.length) {
            this.pagos = eventData.pagos[0]
          } */
                    console.groupEnd()
                }
            })

            this.source.addEventListener("error", (error) => {
                console.error("Error in SSE connection:", error)
                this.source.close() // Cerrar la conexión actual

                // Intentar reconectar después de tres minutos (180 segundos)
                /* setTimeout(() => {
          // this.getOrdenesAsignadas()
        }, 96000) */
            })
        },

        async getOrdenesAsignadasReload() {
            this.msg = "Estamos buscando sus tareas por favor espere.."
            /* this.source = new EventSource(
        `${this.$config.API}/sse/empleados/ordenes-asignadas/${this.emp}`
      ); */

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

                    /* if (eventData.pagos.length) {
            this.pagos = eventData.pagos[0]
          } */
                    console.groupEnd()
                }
            })

            this.source.addEventListener("error", (error) => {
                console.error("Error in SSE connection:", error)
                this.source.close() // Cerrar la conexión actual
            })
        },

        /* connectToServer() {
      this.getOrdenesAsignadas()
    }, */

        /* async getOrdenesAsignadas_old() {
      await this.$axios
        .get(`${this.$config.API}/empleados/ordenes-asignadas/${this.emp}`)
        .then((resp) => {
          this.ordenes = resp.data.items.filter(
            (item) =>
              item.id_woo != '11' ||
              item.id_woo != '12' ||
              item.id_woo != '13' ||
              item.id_woo != '14' ||
              item.id_woo != '15' ||
              item.id_woo != '16' ||
              item.id_woo != '112' ||
              item.id_woo != '113' ||
              item.id_woo != '168' ||
              item.id_woo != '169' ||
              item.id_woo != '170' ||
              item.id_woo != '171' ||
              item.id_woo != '172' ||
              item.id_woo != '173'
          )
          this.enCurso = resp.data.trabajos_en_curso
          if (resp.data.pagos.length) {
            this.pagos = resp.data.pagos[0]
          }
        })
    }, */
        async getInsumos() {
            await this.$axios
                .get(`${this.$config.API}/insumos`)
                .then((resp) => {
                    this.insumos = resp.data
                })
        },

        maquetarPrioridad(prioridad) {
            const pri = parseInt(prioridad)
            let text = ""

            if (!pri) {
                text = ""
                this.fields[0].variant = "info"
            } else {
                text = ""
                this.fields[0].variant = "danger"
            }

            return text
        },

        reloadMe() {
            this.getOrdenesAsignadas()
            if (this.ordenes != this.items) {
                // this.items = this.ordenes
                this.msg = "Tiene nuevas ordenes asignadas"
            }
        },
    },

    mounted() {
        // CArgar datos de las ordenes asignadas
        /* this.sourceEvent = new EventSource(
      `${this.$config.API}/sse/empleados/ordenes-asignadas/${this.emp}`
    ); */

        this.getOrdenesAsignadas()
        if (this.$store.state.login.dataUser.departamento === "Impresión") {
            this.promptHTML = "<h2>Ingrese la cantidad en metros</h2>"
            this.prompInputType = "number"
            // Cargar Insumos
        } else if (
            this.$store.state.login.dataUser.departamento === "Estampado"
        ) {
            this.promptHTML = "<h2>Ingrese el número de rollo</h2>"
            this.prompInputType = "number"
        } else if (this.$store.state.login.dataUser.departamento === "Corte") {
            this.promptHTML =
                "<h2>Ingrese el peso del desperdicio en Gramos</h2>"
            this.prompInputType = "number"
        }
        this.getInsumos()
    },

    props: ["emp", "updatedata"],
}
</script>
