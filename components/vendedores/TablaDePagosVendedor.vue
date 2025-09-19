<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-row>
        <b-col>
          <b-list-group class="mb-4">
            <b-list-group-item>
              <h3>RELACIÓN DE PAGOS</h3>
            </b-list-group-item>
            <b-list-group-item variant="danger"><strong>PENDIENTE:</strong> $ {{ totalPendiente }}</b-list-group-item>
          </b-list-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col class="mt-4">
          <!-- Only PENDIENTES tab content, no b-tabs needed -->
          <b-table-lite
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
          </b-table-lite>
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
      pagosPendientes: [],
    };
  },

  computed: {
    fields() {
      return {
        pendientes: [
          { key: "id_orden", label: "ORD", class: "text-center" },
          { key: "fecha_de_pago", label: "FECHA", class: "text-center" },
          { key: "tipo_de_pago", label: "TIPO", class: "text-center" },
          { key: "pago", label: "COMISIÓN", class: "text-center" },
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
    async getMisPagosDeVendedor() {
      this.overlay = true;
      const url = `${this.$config.API}/pagos/vendedor/${this.emp}`;

      try {
        const response = await this.$axios.get(url);
        const pagosData = response.data.data.vendedores || [];
        
        // Filtramos los pagos basados en el campo fecha_pago
        this.pagosPendientes = pagosData.filter(p => p.fecha_pago === null);
        this.pagosTerminados = pagosData.filter(p => p.fecha_pago !== null); // Still filter, but not displayed
        
        this.pagos = pagosData; // Guardamos todos los pagos si es necesario
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
