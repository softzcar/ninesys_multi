<template>
  <div class="form-monedas-bar">
    <!-- Barra horizontal compacta: se envuelve (flex-wrap) en pantallas angostas
         en vez de apilar cada pieza en su propio bloque -- evita que el widget
         necesite una columna angosta dedicada para verse bien (2026-08-04). -->
    <div class="d-flex flex-wrap align-items-center justify-content-end" style="gap: 0.5rem;">
      <b-button v-if="puedeEditarTasas" size="sm" variant="outline-primary" @click="cargarAutomaticamente"
        :disabled="cargando">
        <b-spinner small v-if="cargando"></b-spinner>
        <span v-else>🔄</span>
        {{ cargando ? 'Cargando...' : 'Actualizar' }}
      </b-button>

      <template v-if="infoActualizacion">
        <b-badge variant="primary" v-b-tooltip.hover title="Tasa BCV">BCV: {{ tasaBcv }}</b-badge>
        <b-badge variant="secondary" v-b-tooltip.hover title="Tasa manual guardada">Manual: {{ tasaManual }}</b-badge>
      </template>

      <template v-if="currencyConfigState === 'SHOW_FORM'">
        <div
          v-for="moneda in additionalActiveMonedas"
          :key="moneda.moneda"
          class="d-flex align-items-center"
          style="gap: 0.25rem; min-width: 0;"
        >
          <label class="mb-0 small text-nowrap">{{ capitalize(moneda.moneda) }}:</label>
          <b-input-group size="sm" style="min-width: 130px; width: 130px;">
            <b-form-input
              type="number"
              step="0.01"
              :value="moneda.valor || 0"
              @change="updateTasa(moneda.moneda, $event, true)"
              @blur="persistirTasas"
              @keyup.enter="persistirTasas"
              :readonly="!puedeEditarTasas"
              :disabled="!puedeEditarTasas"
            />
            <b-input-group-append v-if="moneda.moneda === 'bolivar' && puedeEditarTasas">
              <b-button variant="outline-success" @click="aplicarBcvManual" v-b-tooltip.hover
                title="Usar tasa BCV oficial">
                BCV
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </div>
      </template>

      <span v-else-if="currencyConfigState === 'ONLY_BASE_CURRENCY'" class="small text-muted">
        Solo dólares (sin monedas adicionales configuradas)
      </span>
      <span v-else class="small text-muted">
        Debe configurar las monedas para poder continuar.
      </span>
    </div>

    <!-- Última actualización: línea secundaria, discreta -->
    <div v-if="infoActualizacion" class="text-right mt-1">
      <small class="text-muted">
        {{ infoActualizacion.fecha_formateada }}
        <b-badge v-if="puedeEditarTasas" :variant="infoActualizacion.fuente === 'fallback' ? 'warning' : 'success'" class="ml-1">
          {{ fuenteTexto }}
        </b-badge>
      </small>
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
    updateTasa(moneda, valor, esManual = false) {
      if (!this.puedeEditarTasas) {
        this.$bvToast.toast('No tienes permisos para editar las tasas de cambio.', {
          title: 'Permiso Denegado',
          variant: 'warning',
          solid: true
        });
        return;
      }

      const valorNumerico = parseFloat(valor) || 0;
      
      // Solo actualizar si el valor es realmente diferente para evitar ciclos
      if (this.tasas[moneda] === valorNumerico && !esManual) return;

      this.$store.commit("login/setTasa", { moneda, valor: valorNumerico });

      // Solo marcar como manual si el evento provino de una interacción directa del usuario
      if (esManual) {
        const metadataActual = this.$store.state.login.metadataTasas || {};
        this.$store.commit("login/setMetadataTasas", {
          timestamp: new Date().toISOString(),
          fuente: 'manual',
          metadata: {
            ...metadataActual,
            editado_manualmente: true
          }
        });
      }
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
    },
    capitalize(text) {
      if (!text) return "";
      // Mapeo manual para nombres especiales
      const mapping = {
        bolivar: "Bolívar",
        peso_colombiano: "Pesos",
        euro: "Euro",
      };
      if (mapping[text.toLowerCase()]) return mapping[text.toLowerCase()];

      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    aplicarBcvManual() {
      const bcv = parseFloat(this.tasaBcv);
      if (isNaN(bcv) || bcv <= 0) {
        this.$bvToast.toast('No hay una tasa BCV válida disponible para aplicar.', {
          title: 'Aviso',
          variant: 'warning',
          solid: true
        });
        return;
      }

      this.updateTasa('bolivar', bcv, true);
      this.persistirTasas();

      this.$bvToast.toast(`Se ha aplicado la tasa BCV: ${bcv}`, {
        title: 'Tasa Aplicada',
        variant: 'success',
        solid: true,
        autoHideDelay: 2000
      });
    }
  },
};
</script>

<style scoped>
.form-monedas-bar {
  /* Sin width:100% a propósito -- así se ajusta a su propio contenido cuando
     comparte fila con un título (flex), en vez de forzar su propia línea.
     max-width evita que se desborde en pantallas angostas. */
  max-width: 100%;
}
</style>