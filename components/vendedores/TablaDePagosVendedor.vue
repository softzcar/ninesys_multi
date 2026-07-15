<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-row>
        <b-col>
          <b-list-group class="mb-4">
            <b-list-group-item variant="success" class="text-center p-4">
              <h2 class="mb-0"><strong>TOTAL ACUMULADO:</strong> $ {{ totalPendiente }}</h2>
            </b-list-group-item>
          </b-list-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col class="mb-4">
          <h5 class="mb-2">Filtrar por método de pago:</h5>
          <b-form-radio-group
            id="btn-radios-metodo-pago"
            v-model="selectedMetodoPago"
            :options="optionsMetodoPago"
            button-variant="outline-primary"
            size="sm"
            name="radio-btn-metodo-pago"
            @input="applyFilters()"
            buttons
          ></b-form-radio-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col class="col-12 col-md-4">
          <h5 class="mb-2">Fecha Inicio</h5>
          <b-form-datepicker
            class="mb-3"
            v-model="fechaConsultaInicio"
            @input="applyFilters()"
          />
        </b-col>
        <b-col class="col-12 col-md-4">
          <h5 class="mb-2">Fecha Fin</h5>
          <b-form-datepicker
            class="mb-3"
            v-model="fechaConsultaFin"
            @input="applyFilters()"
          />
        </b-col>
        <b-col class="col-12 col-md-4 d-flex align-items-end mb-3">
          <b-button
            type="button"
            variant="secondary"
            @click="resetFilters"
          >Limpiar Filtros</b-button>
        </b-col>
      </b-row>

      <b-row>
        <b-col class="mt-2">
          <!-- Only PENDIENTES tab content, no b-tabs needed -->
          <b-table
            bordered
            responsive
            small
            striped
            :items="pagosPendientes"
            :fields="fields.pendientes"
          >
            <template #cell(id_orden)="data">
              <linkSearch :id="data.item.id_orden" />
            </template>
            <template #cell(pago)="data">
              ${{ data.item.pago }}
            </template>
            <template #cell(metodo_pago)="data">
              {{ formatMetodoPago(data.item) }}
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],
  props: ["emp"],
  data() {
    return {
      overlay: true,
      pagos: [],
      pagosTerminados: [], // Still needed for filtering in getMisPagosDeVendedor
      pagosPendientesTodos: [], // Datos sin filtrar, tal cual llegan del backend
      pagosPendientes: [], // Datos ya filtrados, lo que se muestra en la tabla
      fechaConsultaInicio: "",
      fechaConsultaFin: "",
      selectedMetodoPago: "todos",
      optionsMetodoPago: [],
    };
  },

  computed: {
    fields() {
      return {
        pendientes: [
          { key: "id_orden", label: "ORD", class: "text-center", sortable: true },
          { key: "cliente_nombre", label: "CLIENTE", class: "text-center", sortable: true },
          { key: "fecha_de_pago", label: "FECHA", class: "text-center", sortable: true },
          { key: "tipo_de_pago", label: "TIPO", class: "text-center", sortable: true },
          { key: "metodo_pago", label: "MÉTODO DE PAGO", class: "text-center", sortable: true },
          { key: "pago", label: "COMISIÓN", class: "text-center", sortable: true },
        ],
        // terminadas fields are no longer needed in template
      };
    },
    totalPendiente() {
      if (!this.pagosPendientes.length) return '0.00';
      const total = this.pagosPendientes.reduce((acc, item) => acc + parseFloat(item.pago), 0);
      return total.toFixed(2);
    },
    // totalTerminado and total computed properties are removed
  },

  methods: {
    formatMetodoPago(item) {
      if (!item.metodo_pago) return "-";
      return item.moneda ? `${item.metodo_pago} (${item.moneda})` : item.metodo_pago;
    },

    generateMetodoPagoOptions() {
      const unicos = new Map();
      this.pagosPendientesTodos.forEach((p) => {
        if (p.metodo_pago) {
          const key = p.metodo_pago.trim();
          if (!unicos.has(key)) unicos.set(key, key);
        }
      });

      const opciones = [...unicos.values()]
        .sort((a, b) => a.localeCompare(b))
        .map((metodo) => ({ text: metodo, value: metodo }));

      this.optionsMetodoPago = [{ text: "Todos", value: "todos" }, ...opciones];
    },

    applyFilters() {
      let filtered = [...this.pagosPendientesTodos];

      if (this.fechaConsultaInicio && this.fechaConsultaFin) {
        const inicio = new Date(this.fechaConsultaInicio);
        const fin = new Date(this.fechaConsultaFin);
        fin.setHours(23, 59, 59, 999);

        filtered = filtered.filter((item) => {
          if (!item.moment_raw) return false;
          const fechaPago = new Date(item.moment_raw.replace(" ", "T"));
          return fechaPago >= inicio && fechaPago <= fin;
        });
      }

      if (this.selectedMetodoPago !== "todos") {
        filtered = filtered.filter((item) => item.metodo_pago === this.selectedMetodoPago);
      }

      this.pagosPendientes = filtered;
    },

    resetFilters() {
      this.fechaConsultaInicio = "";
      this.fechaConsultaFin = "";
      this.selectedMetodoPago = "todos";
      this.applyFilters();
    },

    async getMisPagosDeVendedor() {
      this.overlay = true;
      const url = `${this.$config.API}/pagos/vendedor/${this.emp}`;

      try {
        const response = await this.$axios.get(url);
        const pagosData = response.data.data.vendedores || [];

        // Filtramos los pagos basados en el campo fecha_pago
        this.pagosPendientesTodos = pagosData.filter(p => p.fecha_pago === null);
        this.pagosTerminados = pagosData.filter(p => p.fecha_pago !== null); // Still filter, but not displayed

        this.pagos = pagosData; // Guardamos todos los pagos si es necesario

        this.generateMetodoPagoOptions();
        this.applyFilters();
      } catch (error) {
        console.error("Error al obtener los pagos del vendedor:", error);
        this.$fire({
            title: "Error",
            html: "No se pudieron cargar los datos de pagos.",
            type: "error",
          });
      } finally {
        this.overlay = false;
      }
    },
  },

  mounted() {
    this.getMisPagosDeVendedor();
  },
};
</script>
