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
      </div>

      <div v-else>
        <b-container>
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

              <b-card
                v-if="
                                    this.$store.state.login.dataUser
                                        .departamento === 'Corte' ||
                                    this.$store.state.login.dataUser
                                        .departamento === 'Administración'
                                "
                bg-variant="default"
                header="Control de Material"
                class="text-center mb-4"
              >
                <b-card-text>
                  <empleados-AsignacionDeTelas
                    :datos="dataInsumos"
                    @reload="getDataTable"
                  />
                </b-card-text>
              </b-card>
              <b-card
                bg-variant="default"
                header="Trabajos en curso"
                class="text-center mb-4"
              >
                <b-card-text v-if="enCurso.length">
                  <b-table
                    small
                    stacked
                    striped
                    :fields="fieldsOrdenesEnCurso"
                    :items="enCurso"
                  >
                    <template #cell(id_lotes_detalles)="row">
                      <!-- <empleados-BotonTerminarListaDeTareas
                        class="mt-3 mb-3"
                        :item="row.item"
                        @reload="getOrdenesAsignadasReload"
                      />
                      <h4>↓ Botón prototipo ↓</h4> -->
                      <empleados-BotonTerminarModalListaDeTareas
                        class="mt-3 mb-3"
                        :item="row.item"
                        :itemfather="row.item"
                        @reload="
                                                    getOrdenesAsignadasReload
                                                "
                      />
                      <!-- <empleados-BotonTerminarModalListaDeTareas
                        class="mt-3 mb-3"
                        :datainsumos="dataInsumos"
                        :datos="dataInsumos"
                        :itemfather="row.item"
                        :item="row.item"
                        @reload="reloadMe()"
                        /> -->
                      <!-- <empleados-BotonTerminarModal
                        :datainsumos="dataInsumos"
                        :datos="dataInsumos"
                        :itemfather="row.item"
                        :item="row.item"
                        @reload="reloadMe()"
                        /> -->
                    </template>
                  </b-table>
                </b-card-text>
                <b-card-text v-else>
                  <b-alert
                    :show="showAlert"
                    class="text-center"
                    variant="info"
                  >
                    No hay tareas en curso.
                  </b-alert>
                </b-card-text>
                <!-- <b-card-text>{{ dataOrdenEnCurso }}</b-card-text> -->
              </b-card>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-table
                small
                stacked
                :items="ordersList"
                :fields="fields2"
              >
                <template #cell(id_lotes_detalles)="row">
                  terminemos el lote
                  {{ row.item.id_lotes_detalles }}
                </template>
                <template #cell(orden)="row">
                  <div style="width: 164%; float: left">
                    <div style="width: 270px; margin: 0 auto">
                      <span style="display: inline-block">
                        <b-button
                          :variant="row.item.urgent"
                          block
                          size="xl"
                          style="
                                                        padding: 6px 40px 0 40px;
                                                    "
                          @click="row.toggleDetails"
                        >
                          <h4>
                            {{ row.item.orden }}
                          </h4>
                        </b-button>
                      </span>
                      <span style="
                                                    display: inline-block;
                                                    padding-top: 2px;
                                                    padding-left: 10px;
                                                ">
                        <!-- <h3>{{ row.item.entrega }}</h3> -->
                        <h4>
                          Entrega:
                          {{
                                                        compararFecha(
                                                            row.item.entrega
                                                        )
                                                    }}
                        </h4>
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
                        <div style="
                                                        width: 100%;
                                                        display: flex;
                                                        justify-content: center;
                                                        align-items: center;
                                                    ">
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
                          :detalles_revision="
                                                        row.item
                                                            .detalles_revision
                                                    "
                          :idorden="row.item.id_orden"
                          :id_ordenes_productos="
                                                        row.item
                                                            .id_ordenes_productos
                                                    "
                        />
                      </template>
                      <template #cell(id_orden)="row">
                        <h4 class="mb-4">
                          {{ row.item.id_orden }}
                          <small style="font-size: 35%">{{
                                                            row.item.producto
                                                        }}
                            | Talla
                            {{
                                                            row.item.talla
                                                        }}</small>
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
        </b-container>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import { groupEnd } from "console";

// import { log } from 'console'
export default {
  data() {
    return {
      msg: "Estamos buscando sus tareas por favor espere...",
      enCurso: null,
      ordenesAsignadas: null,
      dataInsumos: [],
      dataOrdenEnCurso: [],
      showAlert: true,
      ordenes: [],
      pagos: [],
      overlay: false,
      reload: false,
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
          label: "Paso Actual XXX",
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
          key: "detalle",
          label: "",
          class: "text-center",
        },
        {
          key: "id_lotes_detalles",
          label: "",
          tdClass: "text-center pt-4 pb-4",
        },
        {
          key: "departamento",
          thClass: "d-none",
          tdClass: "d-none",
        },
      ],
    };
  },

  watch: {
    reload(val) {
      // const p = this.dataOrdenEnCurso.push('val')
      this.dataOrdenEnCurso = [{ data: "hola" }];

      console.log("cargar informacion en el cuadro informativo", p);
      return true;
    },
  },

  computed: {
    ordersList() {
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
            urgent: this.checkPrioridad(item.prioridad),
          };
        })
        .reduce((acc, item) => {
          console.log("item to push", item);

          if (acc.filter((row) => row.orden === item.orden).length === 0) {
            acc.push(item);
          }
          return acc;
        }, []);
      return tmp;
    },

    ordenesSize() {
      let size = null;
      size = parseInt(this.ordenes.length);
      if (size) {
        this.msg = "";
      } else {
        this.msg = "Has terminado todas tus tareas 👍";
      }

      return size;
    },
  },

  methods: {
    getDataTable(data) {
      this.dataInsumos = data;
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

    filterOrder(id_orden) {
      const products = this.ordenes.filter(
        (item) => item.id_orden === id_orden && !item.fecha_terminado
      );

      return products;
    },

    getOrdenesAsignadas() {
      this.msg = "Estamos buscando sus tareas por favor espere..";
      this.source = new EventSource(
        `${this.$config.API}/sse/empleados/ordenes-asignadas/${this.emp}`
      );

      this.source.addEventListener("message", (event) => {
        console.group("SSE Listener");
        console.log("event message", event);
        const eventData = JSON.parse(event.data);
        const eventType = event.type;

        if (eventType === "chat") {
          this.events.push(eventData);
        }

        if (eventType === "message") {
          // this.events = eventData
          this.ordenes = eventData.items.filter(
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
          );
          console.log("eventData", eventData);
          this.enCurso = eventData.trabajos_en_curso;
          // this.ordenesAsignadas = eventData.ordenes_asignadas
          this.$store.commit(
            "empleados/setOrdenesAsignadas",
            eventData.ordenes_asignadas
          );
          /* if (eventData.pagos.length) {
            this.pagos = eventData.pagos[0]
          } */
          console.groupEnd();
        }
      });

      this.source.addEventListener("error", (error) => {
        console.error("Error in SSE connection:", error);
        this.source.close(); // Cerrar la conexión actual

        // Intentar reconectar después de tres minutos (180 segundos)
        /* setTimeout(() => {
          // this.getOrdenesAsignadas()
        }, 96000) */
      });
    },

    getOrdenesAsignadasReload() {
      this.msg = "Estamos buscando sus tareas por favor espere..";
      this.source = new EventSource(
        `${this.$config.API}/sse/empleados/ordenes-asignadas/${this.emp}`
      );

      this.source.addEventListener("message", (event) => {
        console.group("SSE Listener");
        console.log("event message", event);
        const eventData = JSON.parse(event.data);
        const eventType = event.type;

        if (eventType === "chat") {
          this.events.push(eventData);
        }

        if (eventType === "message") {
          // this.events = eventData
          this.ordenes = eventData.items.filter(
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
          );
          console.log("eventData", eventData);
          this.enCurso = eventData.trabajos_en_curso;
          /* if (eventData.pagos.length) {
            this.pagos = eventData.pagos[0]
          } */
          console.groupEnd();
        }
      });

      this.source.addEventListener("error", (error) => {
        console.error("Error in SSE connection:", error);
        this.source.close(); // Cerrar la conexión actual
      });
    },

    connectToServer() {
      this.getOrdenesAsignadas();
    },

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
      this.getOrdenesAsignadasReload();
      if (this.ordenes != this.items) {
        this.items = this.ordenes;
      }
    },
  },

  mounted() {
    this.getOrdenesAsignadas();
    // setInterval(this.reloadMe, 90000)
  },

  props: ["emp", "updatedata"],
};
</script>
