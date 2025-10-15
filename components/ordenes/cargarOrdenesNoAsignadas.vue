<template>
  <div>
    <b-button
      variant="warning"
      class="w-100 w-md-auto"
      @click="$bvModal.show(modal)"
    >
      Cargar Orden no Asignada
    </b-button>

    <b-modal
      :id="modal"
      title="Órdenes Pendientes por Asignar"
      hide-footer
      size="lg"
    >
      <b-overlay
        :show="overlay"
        spinner-small
      >
        <div v-if="ordenesSinAsignar && ordenesSinAsignar.length > 0">
          <p>Seleccione una orden para cargar sus datos en el formulario.</p>
          <b-list-group>
            <b-list-group-item
              v-for="orden in ordenesSinAsignar"
              :key="orden.id_orden"
              button
              @click="cargarOrdenCompleta(orden.id_orden)"
            >
              <strong>Orden #{{ orden.id_orden }}</strong> - Cliente: {{ orden.cliente_nombre }}
            </b-list-group-item>
          </b-list-group>
        </div>
        <div v-else>
          <b-alert
            show
            variant="info"
          >No hay órdenes pendientes por asignar.</b-alert>
        </div>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "CargarOrdenesNoAsignadas",
  props: {
    ordenesSinAsignar: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      overlay: false,
    };
  },
  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-no-asignadas-${rand}`;
    },
  },
  methods: {
    async cargarOrdenCompleta(idOrden) {
      this.overlay = true;
      try {
        const response = await this.$axios.get(
          `${this.$config.API}/buscar/${idOrden}`
        );

        // Emitimos un evento con los datos completos de la orden para que el padre los reciba.
        this.$emit("orden-cargada", response.data);

        this.$fire({
          title: "Orden Cargada",
          html: `<p>Se han cargado los datos de la orden #${idOrden}.</p>`,
          type: "success",
        });

        this.$bvModal.hide(this.modal);
      } catch (error) {
        console.error("Error al cargar la orden completa:", error);
        this.$fire({
          title: "Error",
          html: `<p>No se pudieron cargar los datos de la orden.</p><p>${error}</p>`,
          type: "error",
        });
      } finally {
        this.overlay = false;
      }
    },
  },
};
</script>
