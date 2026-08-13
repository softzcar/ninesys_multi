<template>
  <div>
    <b-container fluid>
      <b-overlay
        :show="overlay"
        spinner-small
      >
        <b-row>
          <b-col>
            <b-card
              v-if="
                $store.getters['login/currentDepartamentTipo'] === 'corte' ||
                $store.state.login.dataUser.departamento ===
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
                />
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
          <b-col> TAREAS EN CURSO </b-col>
        </b-row>

        <!-- Buscador -->
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
  </div>
</template>

<script>
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
    // 2026-08-13: /sse/empleados/ordenes-asignadas dejó de ser un stream SSE
    // real (el backend ahora devuelve JSON normal, ver nota en manufacturing.php)
    // -- EventSource fallaba con "Error in SSE connection" y la tarjeta
    // "Trabajos en curso" quedaba siempre vacía. Se unifica en un solo método
    // (antes había dos casi idénticos: uno para la carga inicial y otro para
    // el @reload del botón "Terminar", este último con un `this.emp` que
    // nunca estaba definido).
    // El Jefe de Producción (u otro rol que no sea Corte) no tiene tareas de
    // corte asignadas a sí mismo -- su trabajo es asignárselas a otros -- así
    // que ve el total de la empresa (?todos=1) en vez de su propia cola vacía.
    async getOrdenesAsignadas() {
      try {
        const esCorte = this.$store.getters["login/currentDepartamentTipo"] === "corte";
        const { data } = await this.$axios.get(
          `${this.$config.API}/sse/empleados/ordenes-asignadas/${this.$store.state.login.dataUser.id_empleado}${esCorte ? "" : "?todos=1"}`
        );
        this.enCurso = data.trabajos_en_curso || [];
      } catch (error) {
        console.error("Error al cargar órdenes asignadas:", error);
      }
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

    // 2026-08-13: mismo problema que getOrdenesAsignadas -- /sse/produccion/corte
    // ya no es un stream SSE real (ver nota en production.php). Se elimina
    // también connectToServer()/closeConnection(), que ya no tienen función
    // sin una conexión persistente que abrir/cerrar. Mismo caso de ?todos=1
    // que getOrdenesAsignadas -- ver nota arriba.
    async loadOrdersProduction() {
      try {
        const esCorte = this.$store.getters["login/currentDepartamentTipo"] === "corte";
        const { data } = await this.$axios.get(
          `${this.$config.API}/sse/produccion/corte/${this.$store.state.login.dataUser.id_empleado}${esCorte ? "" : "?todos=1"}`
        );
        this.items = data.items || [];
        this.empleados = data.empleados || [];
      } catch (error) {
        console.error("Error al cargar piezas de corte:", error);
      } finally {
        this.overlay = false;
      }
    },

    inicio() {
      if (this.$store.getters['login/currentDepartamentTipo'] === "corte") {
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
      this.loadOrdersProduction();
    },
  },
  mounted() {
    this.inicio();
    this.getOrdenesAsignadas();
  },
};
</script>
