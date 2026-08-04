<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="
          accessModule.accessData.id_modulo === 2 ||
          accessModule.accessData.id_modulo === 1
        ">
        <b-container>
          <b-container>
            <b-row>
              <b-col>
                <!-- Título y widget de tasas comparten la misma fila (en vez
                     de una fila propia casi vacía) -- se envuelven en
                     pantallas angostas (2026-08-04). -->
                <div class="d-flex justify-content-between align-items-start flex-wrap">
                  <h1 class="mb-4">Retiro de efectivo</h1>
                  <form-monedas />
                </div>
              </b-col>
            </b-row>
          </b-container>
          <div v-if="tasasCargadas">
            <b-overlay
              :show="loading"
              spinner-small
            >
              <div v-if="loading" class="text-center p-5">
                <p class="mt-2 text-muted italic">Cargando información de caja...</p>
              </div>
              <div v-else-if="hayFondosDisponibles">
                <b-row>
                  <b-col>
                    <h2 class="mb-4">DINERO EN EFECTIVO:</h2>
                    <b-list-group class="mb-4">
                      <b-list-group-item
                        v-for="entrada in caja"
                        :key="entrada.moneda"
                        :class="{ 'text-danger': parseFloat(entrada.monto) < 0 }"
                      >{{ entrada.moneda.toUpperCase() }}: {{ formatNumber(entrada.monto) }}</b-list-group-item>
                    </b-list-group>
                  </b-col>
                </b-row>

                <b-row>
                  <b-col
                    xl="8"
                    lg="8"
                    md="12"
                    sm="12"
                  >
                    <hr />
                    <ordenes-metodos-pago-dinamico
                      ref="metodosPago"
                      solo-efectivo
                      :saldos-por-moneda="saldosPorMoneda"
                      @change="onPagosChange"
                    />
                  </b-col>
                </b-row>

                <b-row class="mt-4">
                  <b-col>
                    <h4>Detalle del retiro</h4>
                    <b-form-textarea v-model="form.detalle"></b-form-textarea>
                  </b-col>
                </b-row>

                <b-row class="mt-4">
                  <b-col>
                    <hr />
                    <h2 class="mb-4">
                      TOTAL RETIRO: {{ formatNumber(form.abono) }}
                      <b-button
                        size="lg"
                        class="ml-4"
                        variant="success"
                        @click="enviarRetiro"
                      >RETIRAR</b-button>
                    </h2>
                  </b-col>
                </b-row>
              </div>
              <div v-else-if="!loading">
                <b-row>
                  <b-col>
                    <b-alert
                      show
                      variant="info"
                      class="mt-4"
                    >No hay fondos en efectivo disponibles hoy para retirar.</b-alert>
                  </b-col>
                </b-row>
              </div>


            </b-overlay>
          </div>

          <div v-else>
            <b-alert
              show
              variant="warning"
            >Por favor indique las Tasas del día</b-alert>
          </div>
        </b-container>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import mixinLogin from "~/mixins/mixin-login.js";
import { mapState } from "vuex";
import FormMonedas from "~/components/formMonedas.vue";
import MetodosPagoDinamico from "~/components/ordenes/MetodosPagoDinamico.vue";

export default {
  components: { FormMonedas, MetodosPagoDinamico },
  data() {
    return {
      titulo: "Retiros",
      loading: true,
      caja: [],
      pagosDinamicos: [],
      porMoneda: [],
      form: {
        detalle: "",
        abono: 0, // Pago total o parcial
      },
    };
  },
  computed: {
    ...mapState("login", ["access", "dataUser", "tasas"]),

    tasasCargadas() {
      let cargadas = false;
      const tipos = this.$store.state.login.dataEmpresa.tipos_de_monedas || [];
      const activeMonedas = tipos.filter((m) => m.activo);
      if (activeMonedas.length > 0) {
        // Check if every active currency has a rate > 0
        cargadas = activeMonedas.every(
          (moneda) => this.tasas[moneda.moneda] > 0
        );
      }
      return cargadas;
    },


    // Antes sumaba `monto` de TODAS las monedas directamente (Bolívares +
    // Pesos + Dólares como si fueran la misma unidad) para decidir si
    // mostrar el formulario -- un saldo negativo en una sola moneda (ej. un
    // retiro histórico que ya excedía lo disponible en Pesos) podía arrastrar
    // el total combinado a negativo y esconder la pantalla COMPLETA, aunque
    // otras monedas sí tuvieran fondos reales disponibles (hallazgo real,
    // 2026-08-03). Ahora basta con que UNA moneda tenga saldo positivo.
    hayFondosDisponibles() {
      if (!this.caja || this.caja.length === 0) {
        return false;
      }
      return this.caja.some((current) => (parseFloat(current.monto) || 0) > 0);
    },
    // Mapa { [nombreMoneda]: saldo } para que MetodosPagoDinamico.vue
    // deshabilite el input y avise de las monedas sin saldo (ej. Euro en 0),
    // en vez de mostrar un input que la validación rechazará al enviar.
    saldosPorMoneda() {
      const map = {};
      (this.caja || []).forEach((c) => {
        map[c.moneda] = parseFloat(c.monto) || 0;
      });
      return map;
    },
  },

  methods: {
    fechaActual() {
      let date = new Date();
      let day = `${date.getDate()}`.padStart(2, "0");
      let month = `${date.getMonth() + 1}`.padStart(2, "0");
      let year = date.getFullYear();

      return `${year}-${month}-${day}`;
    },

    /* totEnCaja(moneda) {
      let totales = []

      if (moneda === 'dolares') {
        if (this.caja[0].monto === undefined) {
          totales['dolares'] = 0
        } else {
          totales['dolares'] = this.caja[0].monto
        }
      }

      if (moneda === 'pesos') {
        if (this.caja[1].monto === undefined) {
          totales['pesos'] = 0
        } else {
          totales['pesos'] = this.caja[1].monto
        }
      }
      if (moneda === 'bolivares') {
        if (this.caja[2].monto === undefined) {
          totales['bolivares'] = 0
        } else {
          totales['bolivares'] = this.caja[2].monto
        }
      }

      return totales
    }, */

    async enviarRetiro() {
      let msg = "";
      let ok = true;

      // 1. VALIDACIÓN DE SALDO DISPONIBLE (PRIORIDAD) -- por cada moneda con
      // monto ingresado, se busca su saldo real en `caja` por el nombre exacto
      // del catálogo (ej. "Dólares"), no por índice fijo.
      this.porMoneda.forEach((entrada) => {
        const saldoRow = this.caja.find((c) => c.moneda === entrada.nombre);
        const saldoDisponible = parseFloat(saldoRow ? saldoRow.monto : 0);
        if (entrada.montoLocal > saldoDisponible) {
          ok = false;
          msg += `<p>Saldo insuficiente en ${entrada.nombre}. Disponible: ${this.formatNumber(saldoDisponible)}</p>`;
        }
      });

      // Si no hay saldo, mostramos el error y no seguimos validando otras cosas (UX)
      if (!ok) {
        this.$fire({
          title: "Saldo insuficiente",
          html: msg,
          type: "error",
        });
        return;
      }

      // 2. OTRAS VALIDACIONES (TOTAL Y DETALLE)
      if (parseFloat(this.form.abono) === 0) {
        ok = false;
        msg = msg + "<p>El Total del retiro no puede ser Cero</p>";
      }

      if (this.form.detalle === "") {
        ok = false;
        msg = msg + "<p>Debe escribir el detalle del retiro</p>";
      }

      if (this.$refs.metodosPago && !this.$refs.metodosPago.validar()) {
        ok = false;
        msg = msg + "<p>Hay un método de pago que requiere número de referencia y quedó vacío.</p>";
      }

      if (ok) {
        // CONSTRUIR RESUMEN PARA CONFIRMACIÓN
        let resumen = `<div class="text-left">
          <p><strong>Detalle:</strong> ${this.form.detalle}</p>
          <ul>`;
        this.porMoneda.forEach((entrada) => {
          resumen += `<li>${entrada.nombre}: ${this.formatNumber(entrada.montoLocal)}</li>`;
        });
        resumen += `</ul><p class="text-center mt-3"><strong>¿Confirmar este retiro?</strong></p></div>`;

        this.$fire({
          title: "Confirmar Retiro",
          html: resumen,
          type: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, retirar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.value) {
            this.loading = true; // Bloqueamos la interfaz
            try {
              const data = new URLSearchParams();
              data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
              data.set("pagos", JSON.stringify(this.pagosDinamicos));
              data.set("abono", this.form.abono);
              data.set("detalle", this.form.detalle);

              const res = await this.$axios.post(`${this.$config.API}/retiro`, data);

              if (res.status === 200 || res.data.status === "success" || res.data.statusCode === 200) {
                this.$fire({
                  title: "Éxito",
                  text: res.data.message || "El retiro se ha registrado correctamente",
                  type: "success",
                });

                // Resetear formulario
                this.form.detalle = "";
                this.form.abono = 0;
                this.pagosDinamicos = [];
                this.porMoneda = [];
                this.$refs.metodosPago?.resetear();
              } else {
                throw new Error(res.data.error?.description || "Error desconocido al procesar el retiro");
              }
            } catch (error) {
              this.$fire({
                title: "Error",
                text: error.message || "No se pudo procesar el retiro",
                type: "error",
              });
            } finally {
              // SIEMPRE refrescar la información tras intentar un retiro
              await this.getCaja();
              this.loading = false;
            }
          }
        });
      } else {
        this.$fire({
          title: "Se requieren datos",
          type: "error",
          html: msg,
        });
      }
    },

    onPagosChange({ pagos, totalEnBase, porMoneda }) {
      this.pagosDinamicos = pagos;
      this.form.abono = totalEnBase.toFixed(2);
      this.porMoneda = porMoneda;
    },



    async getCaja() {
      const todayStr = new Date().toISOString().substring(0, 10);
      this.loading = true;
      await this.$axios
        .get(
          `${this.$config.API}/retiros/${todayStr}/${todayStr}/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          this.caja = res.data.data.caja;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },

  mounted() {
    this.getCaja();
  },

  mixins: [mixin, mixinLogin],
};
</script>
