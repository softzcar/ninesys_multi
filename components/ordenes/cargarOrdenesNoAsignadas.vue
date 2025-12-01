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
        const [resOrden, resObs] = await Promise.all([
          this.$axios.get(`${this.$config.API}/buscar/${idOrden}`),
          this.$axios.get(`${this.$config.API}/ordenes-observaciones/${idOrden}`),
        ]);

        const datosOrden = resOrden.data;

        // Inyectar observaciones si existen
        if (
          resObs.data &&
          resObs.data.length > 0 &&
          datosOrden.orden &&
          datosOrden.orden[0]
        ) {
          // Asumimos que queremos concatenar todas las observaciones encontradas
          // o tomar la más reciente. Por ahora, tomaremos la descripción de la primera
          // observación encontrada si es un array, o el campo directo si es objeto.
          // Ajustar según estructura real: [{ id, id_orden, observacion, ... }]
          
          console.log("Observaciones extra cargadas:", resObs.data);
          
          // Estrategia: Si el campo observaciones original está vacío, lo llenamos.
          // Si no, concatenamos.
          // FIX: La propiedad devuelta por el API es 'observaciones' (plural), no 'observacion'.
          const obsExtra = resObs.data.map(o => o.observaciones).join("\n");
          
          if (obsExtra) {
             const obsOriginal = datosOrden.orden[0].observaciones || "";
             datosOrden.orden[0].observaciones = obsOriginal ? `${obsOriginal}\n${obsExtra}` : obsExtra;
          }
        }

        // Emitimos un evento con los datos completos de la orden para que el padre los reciba.
        this.$emit("orden-cargada", datosOrden);

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
