<template>
  <div>
    <b-link @click="showModal">{{ valor }}</b-link>
    <b-modal
      :id="modalId"
      :title="`Detalle de Productos - Orden #${id_orden}`"
      hide-footer
      size="lg"
    >
      <b-overlay :show="isLoading" rounded="sm">
        <b-table
          striped
          hover
          :items="productos"
          :fields="fields"
          responsive
          v-if="!isLoading && productos.length"
        ></b-table>
        <p v-if="!isLoading && !productos.length">
          No se encontraron productos para esta orden.
        </p>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ReporteCostosProduccionProductos",
  props: {
    id_orden: {
      type: [Number, String],
      required: true,
    },
    valor: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      productos: [],
      isLoading: false,
      fields: [
        { key: "producto", label: "Producto" },
        { key: "cantidad", label: "Cantidad" },
        { key: "talla", label: "Talla" },
        { key: "tela", label: "Tela" },
        { key: "corte", label: "Corte" },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-productos-${this.id_orden}`;
    },
  },
  methods: {
    async getProductosOrden() {
      this.isLoading = true;
      try {
        const url = `${this.$config.API}/productos-asignados/${this.id_orden}`;
        const { data } = await this.$axios.get(url);
        this.productos = data.data;
      } catch (error) {
        console.error("Error al obtener los productos de la orden:", error);
        this.$bvToast.toast(
          "No se pudieron cargar los detalles de los productos.",
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
      this.getProductosOrden();
      this.$bvModal.show(this.modalId);
    },
  },
};
</script>