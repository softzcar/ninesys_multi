<template>
  <div>
    <b-link @click="showModal">$ {{ valor.toFixed(2) }}</b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Mano de Obra - Orden #${id_orden}`"
      hide-footer
      size="lg"
    >
      <b-overlay :show="isLoading" rounded="sm">
        <b-table
          v-if="!isLoading && manoDeObraData.length"
          striped
          hover
          :items="manoDeObraData"
          :fields="fields"
          responsive
        >
          <template #cell(monto_pago)="data">
            $ {{ data.item.monto_pago.toFixed(2) }}
          </template>
        </b-table>
        <p v-else>No se encontraron pagos para esta orden.</p>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ReporteCostosProduccionManoObra",
  props: {
    id_orden: {
      type: [Number, String],
      required: true,
    },
    valor: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      manoDeObraData: [],
      isLoading: false,
      fields: [
        { key: "nombre_empleado", label: "Empleado", sortable: true },
        { key: "departamento", label: "Departamento", sortable: true },
        { key: "cantidad", label: "Piezas", sortable: true },
        { key: "monto_pago", label: "Pago", sortable: true },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-mano-obra-${this.id_orden}`;
    },
  },
  methods: {
    async getManoDeObra() {
      this.isLoading = true;
      try {
        const url = `${this.$config.API}/reportes/mano-obra-por-orden/${this.id_orden}`;
        const { data } = await this.$axios.get(url);
        this.manoDeObraData = data;
      } catch (error) {
        console.error("Error al obtener la mano de obra:", error);
        this.$bvToast.toast(
          "No se pudieron cargar los detalles de la mano de obra.",
          {
            title: "Error",
            variant: "danger",
            solid: true,
          }
        );
      } finally {
        this.isLoading = false;
      }
    },
    showModal() {
      this.getManoDeObra();
      this.$bvModal.show(this.modalId);
    },
  },
};
</script>