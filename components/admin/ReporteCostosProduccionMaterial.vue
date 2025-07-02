<template>
  <div>
    <b-link @click="showModal">{{ valor.toFixed(2) }} </b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Material Consumido - Orden #${id_orden}`"
      hide-footer
      size="lg"
    >
      <b-overlay :show="isLoading" rounded="sm">
        <b-table
          v-if="!isLoading && materialData.length"
          striped
          hover
          :items="materialData"
          :fields="fields"
          responsive
        >
          <template #cell(cantidad_consumida)="data">
            {{ data.item.cantidad_consumida.toFixed(2) }} {{ data.item.unidad }}
          </template>
          <template #cell(desperdicio)="data">
            {{ data.item.desperdicio.toFixed(2) }} {{ data.item.unidad }}
          </template>
        </b-table>
        <p v-else>No se encontró consumo de material para esta orden.</p>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ReporteCostosProduccionMaterial",
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
      materialData: [],
      isLoading: false,
      fields: [
        { key: "material", label: "Material", sortable: true },
        { key: "departamento", label: "Departamento", sortable: true },
        { key: "empleado", label: "Empleado", sortable: true },
        { key: "cantidad_consumida", label: "Consumido", sortable: true },
        { key: "desperdicio", label: "Desperdicio", sortable: true },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-material-${this.id_orden}`;
    },
  },
  methods: {
    async getMaterialConsumido() {
      this.isLoading = true;
      try {
        const url = `${this.$config.API}/reportes/material-consumido-por-orden/${this.id_orden}`;
        const { data } = await this.$axios.get(url);
        this.materialData = data;
      } catch (error) {
        console.error("Error al obtener el material consumido:", error);
        this.$bvToast.toast(
          "No se pudieron cargar los detalles del material.",
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
      this.getMaterialConsumido();
      this.$bvModal.show(this.modalId);
    },
  },
};
</script>