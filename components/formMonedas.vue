<template>
  <div>
    <!-- Header con botón de actualización -->
    <div class="d-flex justify-content-end align-items-center mb-3">
      <b-button v-if="puedeEditarTasas" size="sm" variant="outline-primary" @click="cargarAutomaticamente"
        :disabled="cargando">
        <b-spinner small v-if="cargando"></b-spinner>
        <span v-else>🔄</span>
        {{ cargando ? 'Cargando...' : 'Actualizar Automáticamente' }}
      </b-button>
    </div>

    <!-- Información de última actualización -->
    <div v-if="infoActualizacion" class="mb-3">
      <small class="text-muted">
        <strong>Última actualización:</strong> {{ infoActualizacion.fecha_formateada }}
        <b-badge v-if="puedeEditarTasas" :variant="infoActualizacion.fuente === 'fallback' ? 'warning' : 'success'"
          class="ml-2">
          {{ fuenteTexto }}
        </b-badge>
      </small>

      <!-- BCV vs Manual Comparison -->
      <b-list-group class="mt-2">
        <b-list-group-item class="d-flex justify-content-between align-items-center py-1 px-2">
          <small class="mb-0"><strong>BCV:</strong></small>
          <small><b-badge variant="primary">{{ tasaBcv }}</b-badge></small>
        </b-list-group-item>
        <b-list-group-item class="d-flex justify-content-between align-items-center py-1 px-2">
          <small class="mb-0"><strong>Manual:</strong></small>
          <small><b-badge variant="secondary">{{ tasaManual }}</b-badge></small>
        </b-list-group-item>
      </b-list-group>
    </div>

    <!-- Formulario de tasas -->
    <b-form v-if="currencyConfigState === 'SHOW_FORM'" @submit.prevent>
      <b-form-group v-for="moneda in additionalActiveMonedas" :key="moneda.moneda" label="Tasa sistema"
        :description="puedeEditarTasas ? '' : ''">
        <b-form-input type="number" step="0.01" :value="moneda.valor || 0" @input="updateTasa(moneda.moneda, $event)"
          @blur="persistirTasas" @keyup.enter="persistirTasas" :readonly="!puedeEditarTasas"
          :disabled="!puedeEditarTasas" class="mb-2" />
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
    },
    tasaBcv() {
      // Obtener la tasa BCV desde la metadata de la última actualización automática
      const metadata = this.infoActualizacion?.metadata;
      if (metadata && metadata.bcv_disponible) {
        return parseFloat(metadata.bcv_disponible).toFixed(2);
      }
      return 'N/A';
    },
    tasaManual() {
      // Obtener la tasa manual desde la base de datos (tipos_de_monedas)
      const tipos = this.$store.state.login.dataEmpresa.tipos_de_monedas || [];
      const bolivar = tipos.find(m => m.moneda === 'bolivar');
      if (bolivar && bolivar.valor) {
        return parseFloat(bolivar.valor).toFixed(2);
      }
      return 'N/A';
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
      // IMPORTANTE: Preservar la metadata existente (especialmente bcv_disponible)
      const metadataActual = this.$store.state.login.metadataTasas || {};
      this.$store.commit("login/setMetadataTasas", {
        timestamp: new Date().toISOString(),
        fuente: 'manual',
        metadata: {
          ...metadataActual, // Preservar metadata existente (bcv_disponible, paralelo_disponible, etc.)
          editado_manualmente: true
        }
      });
    },
    async persistirTasas() {
      if (!this.puedeEditarTasas) return;

      try {
        // Intentar obtener el ID desde múltiples propiedades posibles
        const user = this.$store.state.login.dataUser;
        const idEmpleado = user.id_empleado || user.usuario_id || user._id || user.id;

        console.log('Persistiendo tasas. Usuario:', user, 'ID:', idEmpleado);

        if (!idEmpleado) {
          throw new Error('No se pudo identificar al empleado (ID no encontrado en state.login.dataUser)');
        }

        // Obtener la configuración actual de monedas de la empresa
        // y actualizar con los valores locales actuales
        const monedasActuales = JSON.parse(JSON.stringify(this.$store.state.login.dataEmpresa.tipos_de_monedas || []));

        const monedasActualizadas = monedasActuales.map(m => {
          if (this.tasas[m.moneda] !== undefined) {
            // Actualizar el valor predeterminado/inicial en la configuración
            // Nota: El backend espera 'valor' u otra propiedad?
            // En dataEmpresa.tipos_de_monedas usualmente no se guarda el valor diario, 
            // sino la configuración estructural. 
            // PERO el usuario quiere GUARDAR la tasa.
            // Si el backend en /configuracion/monedas guarda todo el objeto JSON,
            // entones podemos guardar el 'valor' ahí.
            return { ...m, valor: this.tasas[m.moneda] };
          }
          return m;
        });

        // NOTA: Si 'monedasActualizadas' está vacío (caso raro), no enviamos nada
        if (monedasActualizadas.length === 0) return;

        // Usar URLSearchParams como solicitado para evitar problemas de CORS/Preflight con JSON
        const params = new URLSearchParams();
        params.append('id_empleado', idEmpleado);
        params.append('monedas', JSON.stringify(monedasActualizadas));

        const response = await this.$axios.post('/configuracion/monedas', params);

        if (response.data && response.data.message) {
          // Actualizar dataEmpresa con los nuevos valores guardados para refrescar la vista
          this.$store.commit('login/setDataEmpresa', {
            ...this.$store.state.login.dataEmpresa,
            tipos_de_monedas: monedasActualizadas
          });

          this.$bvToast.toast('Tasa actualizada y guardada para todos los usuarios.', {
            title: 'Actualización Exitosa',
            variant: 'success',
            solid: true,
            autoHideDelay: 2000
          });
        }

      } catch (error) {
        console.error('Error al persistir tasas:', error);
        this.$bvToast.toast('Error al guardar la tasa en el servidor.', {
          title: 'Error de Guardado',
          variant: 'danger',
          solid: true
        });
      }
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

          // Al cargar automáticamente, también deberíamos persistir si queremos que sea global
          // Pero quizás mejor dejarlo manual por ahora o llamar a persistirTasas() aquí también.
          this.persistirTasas();

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