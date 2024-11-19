<template>
  <div>
    <b-container fluid>
      <pre>
        {{ items }}
      </pre>
      <b-overlay :show="overlay" spinner-small>
        <b-row>
          <b-col>
            <b-card
              v-if="
                this.$store.state.login.dataUser.departamento === 'Corte' ||
                this.$store.state.login.dataUser.departamento ===
                  'Administración'
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
                    <empleados-BotonTerminarModalListaDeTareas
                      class="mt-3 mb-3"
                      :item="row.item"
                      :itemfather="row.item"
                      @reload="getOrdenesAsignadasReload"
                    />
                  </template>
                </b-table>
              </b-card-text>
              <b-card-text v-else>
                <b-alert :show="showAlert" class="text-center" variant="info">
                  No hay tareas en curso.
                </b-alert>
              </b-card-text>
              <!-- <b-card-text>{{ dataOrdenEnCurso }}</b-card-text> -->
            </b-card>
          </b-col>
        </b-row>
        <b-row>
          <b-col> TAREAS EN CURSO </b-col>
        </b-row>

        <!-- Buscador -->
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
        <b-row>
          <b-col>
            <b-table
              @filtered="onFiltered"
              :filter="filter"
              striped
              small
              :items="processedItems"
              :fields="fields"
              :filter-included-fields="includedFields"
            >
              <template #cell(productos)="data">
                <div
                  class="floatme mt-2"
                  v-for="producto in generateArray(data.item.productos)"
                  :key="producto"
                >
                  <b-badge variant="info">{{ truncarTexto(producto) }}</b-badge>
                </div>
              </template>

              <template #cell(acciones)="data">
                <produccionsse-AsignacionDeCorteGrupalIniciarTodo
                  :item="data.item"
                  @reload="inicio()"
                  :key="orden"
                />
              </template>

              <template #cell(cantidad)="data">
                {{ sumatoria(data.item) }}
              </template>

              <template #cell(id_lotes_detalles)="data">
                <produccionsse-asignacionDeCorteGrupalGuardar
                  :ordenes="generateArray(data.item.ordenes)"
                  :empleados="empleados"
                  :item="data.item"
                  :key="orden"
                />
              </template>
              <template #cell(ordenes)="data">
                <div
                  class="floatme mt-2"
                  v-for="orden in generateArray(data.item.ordenes)"
                  :key="orden"
                >
                  <linkSearch
                    :id="orden"
                    :progreso="data.item.cantidadIndividual[0].progreso"
                    :key="orden"
                  />
                  <!-- {{ data.item.cantidadIndividual[0].progreso }} -->
                </div>
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-overlay>
    </b-container>
    <!-- <pre>
      {{ processedItems }}
      <hr>
      {{ items }}
    </pre> -->
  </div>
</template>

<script>
import { prependListener } from "process";

export default {
  data() {
    return {
      includedFields: ["orden", "producto"],
      showAlert: true,
      enCurso: [],
      dataInsumos: [],
      filter: null,
      items: [],
      empleados: [],
      overlay: false,
      fields: [],
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
    };
  },
  computed: {
    processedItems() {
      return Object.values(
        this.items.reduce((acc, obj) => {
          const {
            talla,
            tela,
            corte,
            categoria,
            piezas_en_lote,
            orden,
            cantidad,
            progreso,
            cantidadIndividual,
            producto,
            id_lotes_detalles,
          } = obj;
          const key = `${talla}_${tela}_${corte}_${categoria}`;

          if (!acc[key]) {
            acc[key] = {
              talla,
              tela,
              corte,
              categoria,
              id_lotes_detalles: [id_lotes_detalles],
              piezas_en_lote: parseInt(piezas_en_lote),
              cantidad: parseInt(cantidad),
              cantidadIndividual: [
                {
                  id_orden: orden,
                  id_lotes_detalles: id_lotes_detalles,
                  cantidad: parseInt(cantidadIndividual),
                  progreso: progreso,
                },
              ],
              orden: [orden],
              ordenes: [orden],
              productos: [producto],
            };
          } else {
            const existingItem = acc[key].cantidadIndividual.find(
              (item) =>
                item.id_orden === orden &&
                item.id_lotes_detalles === id_lotes_detalles
            );
            if (!existingItem) {
              acc[key].cantidadIndividual.push({
                id_orden: orden,
                id_lotes_detalles: id_lotes_detalles,
                cantidad: parseInt(cantidadIndividual),
                progreso: progreso,
              });
            }
            acc[key].piezas_en_lote += parseInt(piezas_en_lote);
            acc[key].cantidad += parseInt(cantidad);
            if (!acc[key].ordenes.includes(orden)) {
              acc[key].ordenes.push(orden);
            }
            if (!acc[key].productos.includes(producto)) {
              acc[key].productos.push(producto);
            }
            if (!acc[key].id_lotes_detalles.includes(id_lotes_detalles)) {
              acc[key].id_lotes_detalles.push(id_lotes_detalles);
            }
          }

          return acc;
        }, {})
      ).map((obj) => ({
        ...obj,
        ordenes: obj.ordenes.join(", "),
        productos: obj.productos.join(", "),
      }));
    },
    /* processedItems() {
      return Object.values(
        this.items.reduce((acc, obj) => {
          const {
            talla,
            tela,
            corte,
            categoria,
            piezas_en_lote,
            orden,
            cantidad,
            cantidadIndividual,
            producto,
            id_lotes_detalles,
          } = obj
          const key = `${talla}_${tela}_${corte}_${categoria}`

          if (!acc[key]) {
            acc[key] = {
              talla,
              tela,
              corte,
              categoria,
              id_lotes_detalles: [id_lotes_detalles],
              piezas_en_lote: parseInt(piezas_en_lote),
              cantidad: parseInt(cantidad),
              cantidadIndividual: [
                {
                  id_orden: orden,
                  cantidad: parseInt(cantidadIndividual),
                  id_lotes_detalles: id_lotes_detalles,
                },
              ],
              orden: [orden],
              ordenes: [orden],
              productos: [producto],
            }
          } else {
            acc[key].cantidadIndividual.push({
              id_orden: orden,
              cantidad: parseInt(cantidadIndividual),
              id_lotes_detalles: id_lotes_detalles,
            })
            acc[key].piezas_en_lote += parseInt(piezas_en_lote)
            acc[key].cantidad += parseInt(cantidad)
            if (!acc[key].ordenes.includes(orden)) {
              acc[key].ordenes.push(orden)
            }
            if (!acc[key].productos.includes(producto)) {
              acc[key].productos.push(producto)
            }
            if (!acc[key].id_lotes_detalles.includes(id_lotes_detalles)) {
              acc[key].id_lotes_detalles.push(id_lotes_detalles)
            }
          }

          return acc
        }, {})
      ).map((obj) => ({
        ...obj,
        ordenes: obj.ordenes.join(', '),
        productos: obj.productos.join(', '),
      }))
    }, */
  },

  methods: {
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
    getOrdenesAsignadas() {
      this.source = new EventSource(
        `${this.$config.API}/sse/empleados/ordenes-asignadas/${this.$store.state.login.dataUser.id_empleado}`
      );

      this.source.addEventListener("message", (event) => {
        console.log("event SSE", event);
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
          this.enCurso = eventData.trabajos_en_curso;
          /* if (eventData.pagos.length) {
            this.pagos = eventData.pagos[0]
          } */
        }
      });

      this.source.addEventListener("error", (error) => {
        console.error("Error in SSE connection:", error);
        this.source.close(); // Cerrar la conexión actual

        // Intentar reconectar después de tres minutos (180 segundos)
        /* setTimeout(() => {
          this.getOrdenesAsignadas()
        }, 120000) */
      });
    },

    getDataTable(data) {
      this.dataInsumos = data;
    },
    sumatoria(item) {
      return item.cantidadIndividual.reduce((acc, obj) => {
        return acc + obj.cantidad;
      }, 0);
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },

    generateArray(txt) {
      return txt.split(",").map((item) => item.trim());
    },

    truncarTexto(texto) {
      if (texto.length > 30) {
        return texto.substring(0, 30) + "...";
      } else {
        return texto;
      }
    },

    loadOrdersProduction() {
      this.source = new EventSource(
        `${this.$config.API}/sse/produccion/corte/${this.$store.state.login.dataUser.id_empleado}`
      );
      this.source.addEventListener("message", (event) => {
        const eventData = JSON.parse(event.data);
        const eventType = event.type;
        if (eventType === "chat") {
          this.events.push(eventData);
        }
        if (eventType === "message") {
          this.events = eventData;
          this.items = eventData.items;
          this.empleados = eventData.empleados;
          this.overlay = false;
        }
      });
      this.source.addEventListener("error", (error) => {
        console.error("Error in SSE connection:", error);
        // alert(error)
        this.source.close(); // Cerrar la conexión actual
        // Intentar reconectar después de un cierto período de tiempo
        /* setTimeout(() => {
          this.connectToServer()
        }, 120000) // Puedes ajustar el tiempo de espera según tus necesidades */
      });
    },

    connectToServer() {
      this.loadOrdersProduction();
    },

    closeConnection() {
      if (this.source) {
        this.source.close();
        this.source = null;
      }
    },

    inicio() {
      if (this.$store.state.login.dataUser.departamento === "Corte") {
        this.fields = [
          {
            key: "acciones",
            label: "",
            tdClass: "text-right pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "ordenes",
            label: "Ordenes",
            tdClass: "text-left pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "productos",
            label: "Nombre producto",
            tdClass: "text-right pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "categoria",
            label: "Categoria",
            tdClass: "text-right pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "talla",
            label: "talla",
            tdClass: "text-center pr-5",
            thClass: "text-center pr-5",
          },
          {
            key: "tela",
            label: "tela",
            tdClass: "text-left pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "corte",
            label: "corte",
            tdClass: "text-left pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "cantidad",
            label: "Solicitadas",
            tdClass: "text-center pr-5",
            thClass: "text-center pr-5",
          },
          {
            key: "piezas_en_lote",
            label: "Lotes",
            tdClass: "text-center pr-5",
            thClass: "text-center pr-5",
          },
        ];
      } else {
        this.fields = [
          {
            key: "ordenes",
            label: "Ordenes",
            tdClass: "text-left pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "acciones",
            label: "Acciones",
            tdClass: "text-left pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "productos",
            label: "Productos",
            tdClass: "text-right pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "categoria",
            label: "Categoria",
            tdClass: "text-right pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "talla",
            label: "talla",
            tdClass: "text-center pr-5",
            thClass: "text-center pr-5",
          },
          {
            key: "tela",
            label: "tela",
            tdClass: "text-left pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "corte",
            label: "corte",
            tdClass: "text-left pr-5",
            thClass: "text-left pr-5",
          },
          {
            key: "cantidad",
            label: "Solicitadas",
            tdClass: "text-center pr-5",
            thClass: "text-center pr-5",
          },
          {
            key: "piezas_en_lote",
            label: "Lotes",
            tdClass: "text-center pr-5",
            thClass: "text-center pr-5",
          },
          {
            key: "id_lotes_detalles",
            label: "Asignar",
            tdClass: "text-center pr-5",
            thClass: "text-center pr-5",
          },
        ];
      }
      this.closeConnection();
      this.loadOrdersProduction();
    },
  },
  mounted() {
    this.inicio();
    this.getOrdenesAsignadas();
    // this.loadOrdersProduction()
    this.connectToServer();
    // Eliminar el evento 'beforeunload' para evitar cierres de conexión innecesarios
    // window.removeEventListener('beforeunload', this.closeConnection)
  },

  beforeDestroy() {
    // Cerrar la conexión SSE antes de que el componente se destruya
    this.closeConnection();

    // Eliminar el evento 'beforeunload' para evitar cierres de conexión innecesarios
    window.removeEventListener("beforeunload", this.closeConnection);
  },

  components: { prependListener },
};
</script>
