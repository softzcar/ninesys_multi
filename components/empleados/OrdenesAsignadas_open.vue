<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <div v-if="ordenesSize < 1">
        <b-container>
          <b-row>
            <b-col>
              <b-alert
                :show="showAlert"
                variant="warning"
              >
                <h1>Has terminado todas tus tareas 👍</h1>
              </b-alert>
            </b-col>
          </b-row>
        </b-container>
      </div>

      <div v-else>
        <b-container>
          <b-table
            small
            striped
            stacked
            :items="ordenes"
            :fields="fields"
          >
            <template #cell(id_orden)="data">
              <linkSearch :id="data.item.id_orden" />
            </template>

            <template #cell(prioridad)="data">
              {{ maquetarPrioridad(data.item.prioridad) }}
            </template>

            <template #cell(id_lotes_detalles)="data">
              <b-button
                variant="primary"
                @click="terminarTrabajo(data.item)"
              >TERMINAR</b-button>
            </template>
          </b-table>
        </b-container>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import axios from "axios";
import { log } from "console";
export default {
  data() {
    return {
      showAlert: true,
      ordenes: [],
      overlay: true,
      fields: [
        {
          key: "id_orden",
          label: "",
          tdClass: "text-center pt-4 pb-4",
        },
        {
          key: "prioridad",
          label: "",
          tdClass: "text-center pt-4 pb-4",
          variant: "",
        },
        {
          key: "id_ordenes_productos",
          thClass: "d-none",
          tdClass: "d-none",
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
          key: "id_lotes_detalles",
          label: " ",
          tdClass: "text-center pt-4 pb-4",
        },
        /* {
          key: 'departamento',
          thClass: 'd-none',
          tdClass: 'd-none',
        }, */
      ],
    };
  },

  computed: {
    ordenesSize() {
      const size = parseInt(this.ordenes.length);
      return size;
    },
  },

  methods: {
    terminarTrabajo(item) {
      this.$confirm(
        `¿Desea terminar la orden Nro ${item.id_orden}?`,
        "Terminar Orden",
        "info"
      )
        .then(() => {
          this.terminarOrden(item.id_lotes_detalles);
        })
        .catch(() => {
          return false;
        });
    },

    async getOrdenesAsignadas() {
      await this.$axios
        .get(`${this.$config.API}/empleados/ordenes-asignadas/${this.emp}`)
        .then((resp) => {
          this.ordenes = resp.data.items;
          this.overlay = false;
        });
    },

    async terminarOrden(id_lote_detalles) {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/empleados/registrar-pago/${this.emp}`)
        .then((resp) => {
          // this.getOrdenesAsignadas().then(() => (this.overlay = false))
        });
    },

    maquetarPrioridad(prioridad) {
      const pri = parseInt(prioridad);
      let text = "";

      if (!pri) {
        text = "NORMAL";
        this.fields[1].variant = "success";
      } else {
        text = "URGENTE ";
        this.fields[1].variant = "danger";
      }

      return text;
    },
  },

  mounted() {
    this.getOrdenesAsignadas().then(() => {
      this.items = this.ordenes;
      this.overlay = false;
    });
  },

  props: ["emp"],
};
</script>
