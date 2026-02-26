<template>
  <div :class="embedded ? 'w-100' : 'd-inline-block'">
    
    <!-- MODO BOTON + MODAL (USO CLÁSICO) -->
    <template v-if="!embedded">
      <b-button size="sm" variant="info" @click="openModal" v-b-tooltip.hover title="Ver mi asignación de piezas"
        class="ml-1 custom-asignacion-btn">
        <b-icon icon="list-check"></b-icon>
      </b-button>

      <b-modal :id="modalId" :title="'Mi Asignación - Orden #' + idorden" hide-footer size="md" centered
        @show="cargarDatos">
        <!-- Renderizar Contenido -->
        <AsignacionContenido :datos="datos" :loading="loading" :totalPiezas="totalPiezas" />
      </b-modal>
    </template>

    <!-- MODO EMBEDDED (INYECTANDO DENTRO DE OTRO MODAL COMO LINKSEARCH) -->
    <template v-else>
        <!-- Renderizar Contenido Directamente -->
        <AsignacionContenido :datos="datos" :loading="loading" :totalPiezas="totalPiezas" />
    </template>
  </div>
</template>

<script>
import AsignacionContenido from './MiAsignacionContenido.vue';

export default {
  name: 'MiAsignacionVista',
  components: { AsignacionContenido },
  props: {
    idorden: {
      type: [String, Number],
      required: true
    },
    idempleado: {
      type: [String, Number],
      required: true
    },
    embedded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      datos: null
    };
  },
  mounted() {
    if (this.embedded) {
      this.cargarDatos();
    }
  },
  computed: {
    modalId() {
      return `modal-asignacion-${this.idorden}-${this.idempleado}`;
    },
    totalPiezas() {
      if (!this.datos || !this.datos.productos) return 0;
      return this.datos.productos.reduce((acc, p) => acc + parseFloat(p.cantidad_asignada || 0), 0);
    }
  },
  methods: {
    openModal() {
      this.$bvModal.show(this.modalId);
    },
    async cargarDatos() {
      this.loading = true;
      this.datos = null;
      try {
        const res = await this.$axios.get(
          `${this.$config.API}/empleados/mi-asignacion/${this.idorden}/${this.idempleado}`
        );
        this.datos = res.data;
      } catch (err) {
        console.error('Error al cargar datos de asignación:', err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.custom-asignacion-btn {
  padding: 0.25rem 0.5rem;
  font-size: 1.1rem;
  border-radius: 4px;
}
</style>
