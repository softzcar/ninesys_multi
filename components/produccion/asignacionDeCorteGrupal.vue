<template>
  <div>
    <b-container>
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
              placeholder="Filtrar Resultados repetido"
            ></b-form-input>

            <b-input-group-append>
              <b-button
                :disabled="!filter"
                @click="filter = ''"
              >
                Clear
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
            fixed
            striped
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
                <b-badge variant="info">{{ producto }}</b-badge>
              </div>
            </template>

            <template #cell(ordenes)="data">
              <div
                class="floatme mt-2"
                v-for="orden in generateArray(data.item.ordenes)"
                :key="orden"
              >
                <CorteItemView :idOrden="orden" />
              </div>
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { prependListener } from "process";
import CorteItemView from '~/components/produccion/CorteItemView.vue';

export default {
  data() {
    return {
      includedFields: ["orden", "producto"],
      filter: null,
      items: [],
      fields: [
        {
          key: "ordenes",
          label: "Ordenes",
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
            producto,
          } = obj;
          const key = `${talla}_${tela}_${corte}_${categoria}`;

          if (!acc[key]) {
            acc[key] = {
              talla,
              tela,
              corte,
              categoria,
              piezas_en_lote: parseInt(piezas_en_lote),
              cantidad: parseInt(cantidad),
              ordenes: [orden],
              productos: [producto],
            };
          } else {
            acc[key].piezas_en_lote += parseInt(piezas_en_lote);
            acc[key].cantidad += parseInt(cantidad);
            if (!acc[key].ordenes.includes(orden)) {
              acc[key].ordenes.push(orden);
            }
            if (!acc[key].productos.includes(producto)) {
              acc[key].productos.push(producto);
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
  },

  methods: {
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },

    generateArray(txt) {
      return txt.split(",").map((item) => item.trim());
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
  },
  mounted() {
    this.connectToServer();
  },
  components: { prependListener, CorteItemView },
};
</script>
