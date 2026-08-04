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
          <b-row>
            <b-col>
              <h1 class="mb-4">Cierre de Caja</h1>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <!-- Ancho completo, alineado a la derecha por flex -- sin
                   reservar columnas vacías como antes (offset-9, 2026-08-04) -->
              <div class="d-flex justify-content-end">
                <form-monedas />
              </div>
            </b-col>
          </b-row>
        </b-container>

        <b-container v-if="tasasCargadas">
          <b-overlay
            :show="overlay"
            spinner-small
          >
            <b-row class="mb-4">
              <b-col>
                <b-alert
                  show
                  class="mb-4"
                  variant="warning"
                >
                  El cierre de caja implica el retiro del efectivo por parte de
                  la empresa,
                  <strong>Si va a hacer un retiro de efectivo para algun gasto,
                    hagalo desde el siguiente link:
                    <router-link
                      class="nav-link"
                      to="/comercializacion/retiros"
                      custom
                      v-slot="{ navigate }"
                    >
                      <span
                        @click="navigate"
                        @keypress.enter="navigate"
                        style="display: inline; padding: 0"
                        class="blue-link"
                        role="link"
                      >
                        Retiros
                      </span>
                    </router-link></strong>
                </b-alert>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <h2 class="mb-4">
                  MONTO DEL CIERRE {{ form.abono }}
                  <b-button
                    size="lg"
                    class="ml-4"
                    variant="success"
                    @click="enviarCierre"
                  >Cerrar Caja</b-button>
                </h2>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <H2>TABLA DE MONTOS EN CAJA POR TIPO DE MONEDA</H2>
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
              <b-col
                xl="4"
                lg="4"
                md="12"
                sm="12"
              >
                <hr />
                <h5>Disponible para cerrar</h5>
                <b-list-group>
                  <b-list-group-item
                    v-for="m in saldoPorMoneda"
                    :key="m.id_moneda"
                    :class="{ 'text-danger': parseFloat(m.total) < 0 }"
                  >
                    {{ m.nombre }}: {{ formatNumber(m.total) }}
                  </b-list-group-item>
                  <b-list-group-item v-if="saldoPorMoneda.length === 0" class="text-muted">
                    No hay efectivo disponible para cerrar.
                  </b-list-group-item>
                </b-list-group>
              </b-col>
            </b-row>
          </b-overlay>
        </b-container>

        <b-container v-else>
          <b-row>
            <b-col>
              <b-alert
                show
                variant="warning"
              >Por favor indique las Tasas del día</b-alert>
            </b-col>
          </b-row>
        </b-container>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixins from "~/mixins/mixins.js";
import mixinLogin from "~/mixins/mixin-login.js";
import FormMonedas from "~/components/formMonedas.vue";
import MetodosPagoDinamico from "~/components/ordenes/MetodosPagoDinamico.vue";

export default {
  mixins: [mixins, mixinLogin],
  data() {
    return {
      titulo: "Cierre de Caja",
      overlay: false,
      saldoPorMoneda: [], // Fase 8: [{id_moneda, codigo, nombre, simbolo, fondo, caja, total}]
      pagosDinamicos: [],
      porMonedaCierre: [], // [{id, codigo, nombre, montoLocal, montoBase}]
      form: {
        abono: 0,
      },
    };
  },

  computed: {
    ...mapState("login", ["dataUser", "access", "tasas"]),

    // Mapa { [nombreMoneda]: saldo } para que MetodosPagoDinamico.vue
    // deshabilite el input y avise de las monedas sin saldo, en vez de
    // mostrar un input que la validación rechazará al enviar (mismo fix
    // aplicado en Retiros, 2026-08-03).
    saldosPorMoneda() {
      const map = {};
      (this.saldoPorMoneda || []).forEach((s) => {
        map[s.nombre] = parseFloat(s.total) || 0;
      });
      return map;
    },

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

  },

  components: { FormMonedas, MetodosPagoDinamico },
  methods: {
    fechaActual() {
      let date = new Date();
      let day = `${date.getDate()}`.padStart(2, "0");
      let month = `${date.getMonth() + 1}`.padStart(2, "0");
      let year = date.getFullYear();

      return `${year}-${month}-${day}`;
    },

    onPagosChange({ pagos, totalEnBase, porMoneda }) {
      this.pagosDinamicos = pagos;
      this.form.abono = totalEnBase.toFixed(2);
      this.porMonedaCierre = porMoneda;
    },

    async enviarCierre() {
      let ok = true;
      let msg = "";

      if (parseFloat(this.form.abono) === 0) {
        ok = false;
        msg = msg + "<p>El Total del cierre no puede ser Cero</p>";
      }

      // Validar que no se cierre más de lo disponible, por cada moneda real.
      this.porMonedaCierre.forEach((entrada) => {
        const disponibleRow = this.saldoPorMoneda.find((s) => s.id_moneda === entrada.id);
        const disponible = disponibleRow ? parseFloat(disponibleRow.total) : 0;
        if (entrada.montoLocal > disponible) {
          ok = false;
          msg += `<p>El monto ingresado excede el máximo en caja ${entrada.nombre}: ${this.formatNumber(disponible)}</p>`;
        }
      });

      if (this.$refs.metodosPago && !this.$refs.metodosPago.validar()) {
        ok = false;
        msg += "<p>Hay un método de pago que requiere número de referencia y quedó vacío.</p>";
      }

      if (!ok) {
        this.$fire({
          title: "Error en el monto",
          type: "warning",
          html: msg,
        });
        return;
      }

      const resumen = this.porMonedaCierre
        .map((e) => `${e.nombre}: ${this.formatNumber(e.montoLocal)}`)
        .join(", ");

      this.$confirm(
        `¿Desea ejecutar el cierre de caja? ${resumen || "Sin montos"}`,
        "CIERRE DE CAJA",
        "question"
      )
        .then(() => {
          this.overlay = true;

          // El fondo (lo que queda disponible para mañana) es automático:
          // disponible - cerrado, por cada moneda con saldo -- mismo criterio
          // que el cálculo legado, ahora generalizado a cualquier moneda real.
          const fondos = this.saldoPorMoneda
            .map((disponible) => {
              const cerrado = this.porMonedaCierre.find((e) => e.id === disponible.id_moneda);
              const montoCerrado = cerrado ? cerrado.montoLocal : 0;
              const restante = parseFloat(disponible.total) - montoCerrado;
              return { id_moneda: disponible.id_moneda, monto: restante > 0 ? restante : 0 };
            })
            .filter((f) => f.monto > 0);

          const cierres = this.porMonedaCierre.map((e) => ({ id_moneda: e.id, monto: e.montoLocal }));

          const data = new URLSearchParams();
          data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
          data.set("cierres", JSON.stringify(cierres));
          data.set("fondos", JSON.stringify(fondos));

          this.$axios
            .post(`${this.$config.API}/cierre-de-caja-vendedor`, data)
            .then(() => {
              this.form.abono = 0;
              this.pagosDinamicos = [];
              this.porMonedaCierre = [];
              this.$refs.metodosPago?.resetear();
              this.getDataCierre().then(() => (this.overlay = false));
            })
            .catch((err) => {
              this.overlay = false;
              this.$fire({
                title: "Error",
                html: err.response?.data?.message || "No se pudo registrar el cierre de caja",
                type: "error",
              });
            });
        })
        .catch(() => {
          return false;
        });
    },

    async getDataCierre() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/cierre-de-caja/${this.$store.state.login.dataUser.id_empleado}`)
        .then((res) => {
          this.saldoPorMoneda = res.data.data.porMoneda || [];
        })
        .catch((err) => {
          console.error("Error al obtener datos de cierre de caja:", err);
          this.$fire({
            title: "Error de Conexión",
            html: "<p>No se pudieron cargar los datos de la caja. Por favor, intente de nuevo.</p>",
            type: "error",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  created() {
    this.overlay = true;
    this.getDataCierre().then(() => (this.overlay = false));
  },
};
</script>
