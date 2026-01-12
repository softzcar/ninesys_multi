<template>
  <div>
    <!-- Header con título y botón de actualización -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Tasas del día</h5>
      <b-button size="sm" variant="outline-primary" @click="cargarAutomaticamente" :disabled="cargando">
        <b-spinner small v-if="cargando"></b-spinner>
        <span v-else>🔄</span>
        {{ cargando ? 'Cargando...' : 'Actualizar Automáticamente' }}
      </b-button>
    </div>

    <!-- Información de última actualización -->
    <div v-if="infoActualizacion" class="mb-3">
      <small class="text-muted">
        <strong>Última actualización:</strong> {{ infoActualizacion.fecha_formateada }}
        <b-badge :variant="infoActualizacion.fuente === 'fallback' ? 'warning' : 'success'" class="ml-2">
          {{ fuenteTexto }}
        </b-badge>
      </small>
    </div>

    <!-- Formulario de tasas -->
    <b-form v-if="currencyConfigState === 'SHOW_FORM'">
      <b-form-group v-for="moneda in additionalActiveMonedas" :key="moneda.moneda" :label="moneda.mondeda_nombre"
        :description="puedeEditarTasas ? '' : '⚠ Solo lectura - No tienes permisos para editar tasas'">
        <b-form-input type="number" step="0.01" :value="tasas[moneda.moneda]" @input="updateTasa(moneda.moneda, $event)"
          :readonly="!puedeEditarTasas" :disabled="!puedeEditarTasas" class="mb-2" />
      </b-form-group>
    </b-form>

    <!-- Solo moneda base (dólares) -->
    <div v-else-if="currencyConfigState === 'ONLY_BASE_CURRENCY'">
      <p><strong>No hay monedas adicionales configuradas, los precios se manejan solamente en dólares.</strong></p>
    </div>

    <!-- Sin configuración -->
    <div v-else>
      <p>Debe configurar las monedas para poder continuar.</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  name: "FormMonedas",
  data() {
    return {
      cargando: false,
    };
  },
  computed: {
    ...mapState("login", ["tasas"]),
    ...mapGetters("login", [
      "additionalActiveMonedas",
      "currencyConfigState",
      "puedeEditarTasas",
      "infoUltimaActualizacionTasas"
    ]),
    infoActualizacion() {
      return this.infoUltimaActualizacionTasas;
    },
    fuenteTexto() {
      const fuente = this.infoActualizacion?.fuente;
      if (fuente === 'automatica') return 'Automática';
      if (fuente === 'fallback') return 'Caché';
      if (fuente === 'manual') return 'Manual';
      return 'Desconocida';
    }
  },
  methods: {
    updateTasa(moneda, valor) {
      if (!this.puedeEditarTasas) {
        this.$bvToast.toast('No tienes permisos para editar las tasas de cambio.', {
          title: 'Permiso Denegado',
          variant: 'warning',
          solid: true
        });
        return;
      }

      const valorNumerico = parseFloat(valor) || 0;
      this.$store.commit("login/setTasa", { moneda, valor: valorNumerico });

      // Actualizar metadata indicando que fue edición manual
      this.$store.commit("login/setMetadataTasas", {
        timestamp: new Date().toISOString(),
        fuente: 'manual',
        metadata: { editado_manualmente: true }
      });
    },
    async cargarAutomaticamente() {
      this.cargando = true;

      try {
        const resultado = await this.$store.dispatch('login/cargarTasasAutomaticas');

        if (resultado.success) {
          const mensaje = resultado.fallback
            ? 'Tasas cargadas desde caché (no hay conexión a las APIs)'
            : 'Tasas actualizadas correctamente desde las APIs';

          this.$bvToast.toast(mensaje, {
            title: 'Éxito',
            variant: resultado.fallback ? 'warning' : 'success',
            solid: true,
            autoHideDelay: 5000
          });
        } else {
          this.$bvToast.toast(
            resultado.error || 'No se pudieron cargar las tasas. Por favor, ingrésalas manualmente.',
            {
              title: 'Error',
              variant: 'danger',
              solid: true,
              autoHideDelay: 5000
            }
          );
        }
      } catch (error) {
        console.error('Error al cargar tasas:', error);
        this.$bvToast.toast('Ocurrió un error inesperado al cargar las tasas.', {
          title: 'Error',
          variant: 'danger',
          solid: true
        });
      } finally {
        this.cargando = false;
      }
    }
  }
};
</script>