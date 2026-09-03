<template>
  <div>
    <b-overlay :show="cargando" spinner-small>
      <div v-for="moneda in monedas" :key="moneda._id" class="mb-4">
        <h5>
          {{ moneda.nombre }}
          <small v-if="tasaDisponible(moneda) && moneda.codigo !== monedaBaseCodigo" class="text-muted">
            (tasa: {{ tasaMoneda(moneda).toFixed(4) }})
          </small>
        </h5>

        <b-form-checkbox
          v-if="tasaDisponible(moneda) && moneda.codigo !== monedaBaseCodigo"
          v-model="modoBasePorMoneda[moneda._id]"
          switch
          class="mb-2"
          @change="alternarModoBase(moneda)"
        >
          Escribir montos en {{ monedaBaseCodigo }}
        </b-form-checkbox>

        <b-alert v-if="!tasaDisponible(moneda)" show variant="warning" class="py-2">
          No hay tasa de cambio configurada para {{ moneda.nombre }}. Un administrador debe
          configurarla en Empresa &rarr; Configuración &rarr; Monedas antes de poder registrar
          pagos en esta moneda.
        </b-alert>
        <b-alert v-else-if="sinSaldoDisponible(moneda)" show variant="info" class="py-2">
          No hay {{ moneda.nombre }} disponible en este momento.
        </b-alert>

        <b-row v-for="metodo in metodosPorMoneda(moneda._id)" :key="metodo._id" class="mb-2 align-items-end">
          <b-col md="4">
            <b-form-group :label="metodo.nombre" :label-for="`monto-${metodo._id}`">
              <b-input-group :prepend="modoBasePorMoneda[moneda._id] ? monedaBaseSimbolo : (moneda.simbolo || moneda.codigo)">
                <campo-decimal
                  :id="`monto-${metodo._id}`"
                  :value="valorMostrado(moneda, metodo)"
                  placeholder="0.00"
                  :disabled="!tasaDisponible(moneda) || sinSaldoDisponible(moneda)"
                  @input="(val) => actualizarMonto(moneda, metodo, val)"
                ></campo-decimal>
              </b-input-group>
            </b-form-group>
          </b-col>

          <b-col md="4" v-if="metodo.requiere_referencia">
            <b-form-group :label="`Referencia ${metodo.nombre}`" :label-for="`detalle-${metodo._id}`">
              <b-form-input
                :id="`detalle-${metodo._id}`"
                v-model="detalles[metodo._id]"
                placeholder="Número de referencia"
                :state="estadoReferencia(metodo)"
                @input="emitirCambio"
              ></b-form-input>
              <b-form-invalid-feedback :state="estadoReferencia(metodo)">
                La referencia es obligatoria para {{ metodo.nombre }}.
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>

          <b-col md="4" v-if="montos[metodo._id] > 0">
            <small class="text-success" v-if="!modoBasePorMoneda[moneda._id]">
              ≈ {{ equivalenteEnBase(moneda, montos[metodo._id]).toFixed(2) }} {{ monedaBaseSimbolo }}
            </small>
            <small class="text-success" v-else>
              ≈ {{ parseFloat(montos[metodo._id]).toFixed(2) }} {{ moneda.simbolo || moneda.codigo }}
            </small>
          </b-col>
        </b-row>
      </div>

      <div v-if="!cargando && monedas.length === 0" class="text-muted">
        No hay monedas activas configuradas para esta empresa.
      </div>

      <b-alert :show="totalEnBase > 0" variant="info">
        Total equivalente: {{ totalEnBase.toFixed(2) }} {{ monedaBaseSimbolo }}
      </b-alert>
    </b-overlay>
  </div>
</template>

<script>
export default {
  name: "MetodosPagoDinamico",
  props: {
    // Cuando es true, solo se renderizan métodos con es_efectivo=1 (ej. retiro
    // de caja física: no tiene sentido "retirar" por Zelle/Transferencia).
    soloEfectivo: {
      type: Boolean,
      default: false,
    },
    // Opcional -- solo lo usan consumidores donde "cuánto hay disponible"
    // tiene sentido (Retiros, Cierre de Caja; no aplica a Abono/Nueva Orden,
    // que reciben dinero en vez de sacarlo). Mapa { [nombreMoneda]: saldo }.
    // Si una moneda no aparece como clave, no se restringe (comportamiento
    // igual al de siempre). Si aparece con saldo <= 0, el input se
    // deshabilita y se avisa -- en vez de dejar que el usuario intente
    // capturar un monto que la validación del formulario rechazará después
    // (hallazgo real: Euro con 0 disponible mostraba su input igual, 2026-08-03).
    saldosPorMoneda: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      cargando: true,
      monedas: [],
      metodos: [],
      montos: {},
      detalles: {},
      // Por moneda: true = el usuario está escribiendo el monto en moneda
      // base (monedaBaseCodigo) y el componente lo convierte a la moneda
      // local; false (default) = comportamiento de siempre, se escribe
      // directo en la moneda del método de pago.
      modoBasePorMoneda: {},
      // Staging solo para el modo base -- lo que el usuario ve/edita
      // mientras modoBasePorMoneda[moneda._id] es true. `montos` sigue
      // siendo, siempre, la fuente de verdad en moneda local que se envía
      // al backend (obtenerPagos() no cambia).
      montosBaseTexto: {},
      // Los recuadros en rojo de "referencia obligatoria" solo se muestran
      // después del primer intento de envío (validar()) -- no mientras el
      // usuario todavía está llenando el formulario.
      mostrarErroresReferencia: false,
    };
  },
  computed: {
    monedaBaseSimbolo() {
      return this.$store.state.login.dataEmpresa?.moneda_base?.simbolo || "$";
    },
    monedaBaseCodigo() {
      return this.$store.state.login.dataEmpresa?.moneda_base?.codigo || "USD";
    },
    totalEnBase() {
      return this.monedas.reduce((total, moneda) => {
        const metodos = this.metodosPorMoneda(moneda._id);
        const subtotal = metodos.reduce((acc, metodo) => {
          const monto = parseFloat(this.montos[metodo._id]) || 0;
          return acc + this.equivalenteEnBase(moneda, monto);
        }, 0);
        return total + subtotal;
      }, 0);
    },
    // Métodos con monto capturado (>0) que requieren referencia y la
    // dejaron vacía -- la única fuente de verdad de "falta algo por
    // completar", usada tanto por validar() como por estadoReferencia().
    metodosConReferenciaFaltante() {
      const faltantes = [];
      this.monedas.forEach((moneda) => {
        this.metodosPorMoneda(moneda._id).forEach((metodo) => {
          const monto = parseFloat(this.montos[metodo._id]) || 0;
          const detalle = (this.detalles[metodo._id] || "").trim();
          if (monto > 0 && metodo.requiere_referencia && !detalle) {
            faltantes.push(metodo);
          }
        });
      });
      return faltantes;
    },
  },
  methods: {
    metodosPorMoneda(idMoneda) {
      return this.metodos.filter(
        (m) => m.id_moneda === idMoneda && (!this.soloEfectivo || m.es_efectivo)
      );
    },
    // Devuelve la tasa numérica si está resuelta, o null si no hay ninguna
    // fuente confiable (automática ni manual) -- nunca asume 1:1 en silencio.
    tasaMoneda(moneda) {
      if (moneda.codigo === this.monedaBaseCodigo) return 1;
      const tasas = this.$store.state.login.tasas || {};
      const valor = parseFloat(tasas[moneda.codigo]);
      return valor > 0 ? valor : null;
    },
    tasaDisponible(moneda) {
      return this.tasaMoneda(moneda) !== null;
    },
    // true solo cuando el consumidor pasó saldosPorMoneda Y esta moneda
    // específica tiene saldo <= 0 -- si el prop no trae esta moneda como
    // clave, no restringe nada (mismo comportamiento que sin el prop).
    sinSaldoDisponible(moneda) {
      if (!Object.prototype.hasOwnProperty.call(this.saldosPorMoneda, moneda.nombre)) {
        return false;
      }
      return parseFloat(this.saldosPorMoneda[moneda.nombre]) <= 0;
    },
    equivalenteEnBase(moneda, monto) {
      const n = parseFloat(monto) || 0;
      if (moneda.codigo === this.monedaBaseCodigo) {
        return n;
      }
      const tasa = this.tasaMoneda(moneda);
      return tasa ? n / tasa : 0;
    },
    // Valor que debe verse en el input del método de pago según el modo
    // activo para su moneda -- lo que el usuario está tecleando, no un
    // recálculo derivado (evita el problema de redondeo de "ida y vuelta").
    valorMostrado(moneda, metodo) {
      if (this.modoBasePorMoneda[moneda._id]) {
        return this.montosBaseTexto[metodo._id];
      }
      return this.montos[metodo._id];
    },
    // Único punto de escritura de `montos[metodo._id]` (la fuente de verdad
    // en moneda local que se envía al backend, sin cambiar su forma). En
    // modo base, convierte usando la misma tasa ya resuelta por
    // tasaMoneda() -- si no hay tasa real, nunca multiplica a ciegas (mismo
    // patrón defensivo que equivalenteEnBase): escribe 0 en vez de NaN o un
    // monto basado en una tasa inventada.
    actualizarMonto(moneda, metodo, valorEscrito) {
      if (this.modoBasePorMoneda[moneda._id]) {
        this.$set(this.montosBaseTexto, metodo._id, valorEscrito);
        const base = parseFloat(valorEscrito) || 0;
        const tasa = this.tasaMoneda(moneda);
        const local = tasa ? Math.round(base * tasa * 100) / 100 : 0;
        this.$set(this.montos, metodo._id, local);
      } else {
        this.$set(this.montos, metodo._id, valorEscrito);
      }
      this.emitirCambio();
    },
    // Al activar el modo base para una moneda con montos ya cargados en
    // moneda local, precarga el staging para no perder lo ya escrito.
    alternarModoBase(moneda) {
      if (!this.modoBasePorMoneda[moneda._id]) return;
      this.metodosPorMoneda(moneda._id).forEach((metodo) => {
        const local = parseFloat(this.montos[metodo._id]) || 0;
        this.$set(
          this.montosBaseTexto,
          metodo._id,
          local > 0 ? this.equivalenteEnBase(moneda, local).toFixed(2) : null
        );
      });
    },
    async cargarCatalogo() {
      this.cargando = true;
      try {
        const [resMonedas, resMetodos] = await Promise.all([
          this.$axios.get(`${this.$config.API}/monedas`),
          this.$axios.get(`${this.$config.API}/metodos-pago`),
        ]);
        this.monedas = (resMonedas.data?.data || []).filter((m) => m.activo);
        this.metodos = (resMetodos.data?.data || []).filter((m) => m.activo);
        this.monedas.forEach((moneda) => {
          this.$set(this.modoBasePorMoneda, moneda._id, false);
        });
      } catch (err) {
        console.error("Error al cargar catálogo de monedas/métodos de pago:", err);
      } finally {
        this.cargando = false;
      }
    },
    // Construye el payload `pagos` que esperan los endpoints genéricos
    // (Fase 7 del rediseño de monedas): [{id_metodo_pago, monto, detalle, tasa}]
    obtenerPagos() {
      const pagos = [];
      this.monedas.forEach((moneda) => {
        if (!this.tasaDisponible(moneda)) return; // sin tasa resuelta, no se puede capturar
        if (this.sinSaldoDisponible(moneda)) return; // sin saldo, no se puede capturar
        this.metodosPorMoneda(moneda._id).forEach((metodo) => {
          const monto = parseFloat(this.montos[metodo._id]) || 0;
          if (monto > 0) {
            pagos.push({
              id_metodo_pago: metodo._id,
              monto,
              detalle: this.detalles[metodo._id] || "",
              tasa: this.tasaMoneda(moneda),
            });
          }
        });
      });
      return pagos;
    },
    // Desglose por moneda (nombre real del catálogo, ej. "Dólares") -- para
    // consumidores que necesitan validar contra un saldo disponible por
    // moneda (ej. retiro de caja), sin tener que resolver id_metodo_pago -> moneda ellos mismos.
    obtenerPorMoneda() {
      return this.monedas
        .map((moneda) => {
          const montoLocal = this.tasaDisponible(moneda) && !this.sinSaldoDisponible(moneda)
            ? this.metodosPorMoneda(moneda._id).reduce((acc, metodo) => {
                return acc + (parseFloat(this.montos[metodo._id]) || 0);
              }, 0)
            : 0;
          return {
            id: moneda._id,
            codigo: moneda.codigo,
            nombre: moneda.nombre,
            montoLocal,
            montoBase: this.equivalenteEnBase(moneda, montoLocal),
          };
        })
        .filter((entry) => entry.montoLocal > 0);
    },
    // Público -- todo formulario que use este componente debe llamarlo antes
    // de enviar el pago, y abortar el envío si devuelve false (mismo patrón
    // ya usado para otras validaciones de estos formularios, ej. detalle de
    // descuento obligatorio en nueva.vue). Centralizada aquí una sola vez
    // para que la regla ("requiere_referencia" del catálogo real) se aplique
    // igual en los 6 formularios que capturan pagos, sin repetirla en cada uno.
    validar() {
      this.mostrarErroresReferencia = true;
      return this.metodosConReferenciaFaltante.length === 0;
    },
    // null = neutral (aún no se intentó enviar, o no aplica), false = falta
    // la referencia y ya se intentó enviar -- bootstrap-vue pinta el input
    // en rojo y muestra el b-form-invalid-feedback asociado.
    estadoReferencia(metodo) {
      if (!this.mostrarErroresReferencia) return null;
      const invalido = this.metodosConReferenciaFaltante.some((m) => m._id === metodo._id);
      return invalido ? false : null;
    },
    resetear() {
      this.montos = {};
      this.detalles = {};
      this.montosBaseTexto = {};
      this.mostrarErroresReferencia = false;
      this.emitirCambio();
    },
    emitirCambio() {
      this.$emit("change", {
        pagos: this.obtenerPagos(),
        totalEnBase: this.totalEnBase,
        porMoneda: this.obtenerPorMoneda(),
      });
    },
  },
  async mounted() {
    await this.cargarCatalogo();
    this.emitirCambio();
  },
};
</script>
