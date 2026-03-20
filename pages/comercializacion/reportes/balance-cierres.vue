<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="isAdmin">
        <b-container fluid>
          <b-row class="mt-4">
            <b-col class="d-flex justify-content-between align-items-center">
              <h1>Balance de Cierres de Caja</h1>
              <b-button v-b-modal.modal-ayuda variant="info" size="sm" class="shadow-sm">
                <i class="fas fa-info-circle mr-1"></i> Guía del Reporte
              </b-button>
            </b-col>
          </b-row>

          <!-- Filtros -->
          <b-row class="mb-4 mt-2">
            <b-col md="3">
              <label>Fecha Inicio</label>
              <b-form-input type="date" v-model="filtros.inicio"></b-form-input>
            </b-col>
            <b-col md="3">
              <label>Fecha Fin</label>
              <b-form-input type="date" v-model="filtros.fin"></b-form-input>
            </b-col>
            <b-col md="3">
              <label>Vendedor</label>
              <b-form-select v-model="filtros.vendedor" :options="vendedoresOptions"></b-form-select>
            </b-col>
            <b-col md="3" class="d-flex align-items-end">
              <b-button variant="primary" block @click="cargarDatos" :disabled="loading">
                <b-spinner small v-if="loading"></b-spinner>
                Generar Reporte
              </b-button>
            </b-col>
          </b-row>

          <!-- Resumen de Totales -->
          <b-row class="mb-4" v-if="datos.length > 0">
            <b-col md="4">
              <div class="summary-card text-center p-3 shadow-sm bg-white rounded">
                <h3 class="text-muted mb-1">Diferencia USD</h3>
                <h1 :class="getDiffClass(totalDiferenciaUSD)" style="font-size: 2.5rem; font-weight: bold;">
                  {{ formatNumber(totalDiferenciaUSD) }}
                </h1>
              </div>
            </b-col>
            <b-col md="4">
              <div class="summary-card text-center p-3 shadow-sm bg-white rounded">
                <h3 class="text-muted mb-1">Diferencia COP</h3>
                <h1 :class="getDiffClass(totalDiferenciaCOP)" style="font-size: 2.5rem; font-weight: bold;">
                  {{ formatNumber(totalDiferenciaCOP) }}
                </h1>
              </div>
            </b-col>
            <b-col md="4">
              <div class="summary-card text-center p-3 shadow-sm bg-white rounded">
                <h3 class="text-muted mb-1">Diferencia BS</h3>
                <h1 :class="getDiffClass(totalDiferenciaBS)" style="font-size: 2.5rem; font-weight: bold;">
                  {{ formatNumber(totalDiferenciaBS) }}
                </h1>
              </div>
            </b-col>
          </b-row>

          <!-- Tabla de Datos -->
          <b-row>
            <b-col>
              <b-table
                hover
                responsive
                :items="balanceData"
                :fields="fields"
                :busy="loading"
                head-variant="light"
                class="shadow-sm"
              >
                <template #table-busy>
                  <div class="text-center text-primary my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Cargando...</strong>
                  </div>
                </template>

                <template #cell(fecha_cierre)="data">
                  {{ formatTimestamp(data.value) }}
                </template>

                <template #cell(total_teorico_usd)="data">
                  <span class="font-weight-bold">{{ formatNumber(data.value) }}</span>
                </template>
                
                <template #cell(monto_cierre_usd)="data">
                  {{ formatNumber(data.value) }}
                </template>

                <template #cell(monto_cierre_cop)="data">
                  {{ formatNumber(data.value) }}
                </template>

                <template #cell(monto_cierre_bs)="data">
                  {{ formatNumber(data.value) }}
                </template>

                <template #cell(fondo_nuevo_usd)="data">
                  {{ formatNumber(data.value) }}
                </template>

                <template #cell(fondo_nuevo_cop)="data">
                  {{ formatNumber(data.value) }}
                </template>

                <template #cell(fondo_nuevo_bs)="data">
                  {{ formatNumber(data.value) }}
                </template>

                <template #cell(total_retirado_usd)="data">
                  {{ formatNumber(data.value) }}
                </template>

                <template #cell(diferencia_usd)="data">
                  <span :class="getDiffClass(calculateDiff(data.item, 'usd'))">
                    {{ formatNumber(calculateDiff(data.item, 'usd')) }}
                  </span>
                </template>

                <template #cell(diferencia_cop)="data">
                  <span :class="getDiffClass(calculateDiff(data.item, 'cop'))">
                    {{ formatNumber(calculateDiff(data.item, 'cop')) }}
                  </span>
                </template>

                <template #cell(diferencia_bs)="data">
                  <span :class="getDiffClass(calculateDiff(data.item, 'bs'))">
                    {{ formatNumber(calculateDiff(data.item, 'bs')) }}
                  </span>
                </template>
              </b-table>
            </b-col>
          </b-row>

          <!-- Modal de Ayuda -->
          <b-modal id="modal-ayuda" title="Guía: ¿Cómo entender este reporte?" size="lg" hide-footer centered>
            <div class="p-2">
              <h5 class="text-primary"><i class="fas fa-calculator mr-2"></i>La Lógica del Balance</h5>
              <p>El reporte busca responder una pregunta simple: <strong>¿El dinero que se reportó coincide con lo que el sistema registró?</strong></p>
              
              <div class="bg-light p-3 rounded mb-4">
                <strong>Fórmula básica:</strong><br>
                <code>(Retirado + Fondo Final) - (Fondo Inicial + Recaudado) = Diferencia</code>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <h6><span class="badge badge-info">1</span> El Teórico (Lo que debería haber)</h6>
                  <ul>
                    <li><strong>Fondo Inicial:</strong> Dinero que quedó del turno anterior.</li>
                    <li><strong>Recaudado:</strong> Ventas en efectivo realizadas hoy.</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6><span class="badge badge-success">2</span> El Real (Lo que hay físicamente)</h6>
                  <ul>
                    <li><strong>Retirado:</strong> Lo que el vendedor sacó para entregar.</li>
                    <li><strong>Fondo Final:</strong> Lo que se quedó en la gaveta para mañana.</li>
                  </ul>
                </div>
              </div>

              <hr>

              <h5 class="text-primary mt-4"><i class="fas fa-check-circle mr-2"></i>Interpretando las Diferencias</h5>
              <div class="mb-3">
                <span class="text-success font-weight-bold">0.00 (Verde):</span> La caja cuadró perfectamente. El reporte físico coincide con el sistema.<br>
                <span class="text-danger font-weight-bold">Negativo (Rojo):</span> <strong>Falta Dinero.</strong> El vendedor reportó menos de lo que registró el sistema.<br>
                <span class="text-warning font-weight-bold">Positivo:</span> <strong>Sobra Dinero.</strong> Hay más dinero físico que el registrado en ventas.
              </div>

              <p class="text-muted small italic">
                <i class="fas fa-lightbulb mr-1"></i> <strong>Tip:</strong> Pasa el mouse sobre los títulos de las columnas en la tabla para ver una breve explicación de cada una.
              </p>
            </div>
          </b-modal>
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

export default {
  mixins: [mixins],
  data() {
    return {
      loading: false,
      filtros: {
        inicio: new Date().toISOString().substr(0, 10),
        fin: new Date().toISOString().substr(0, 10),
        vendedor: 0
      },
      datos: [],
      vendedores: [],
      fields: [
        { key: 'fecha_cierre', label: 'Fecha/Hora', sortable: true },
        { key: 'vendedor', label: 'Vendedor', sortable: true },
        { key: 'total_teorico_usd', label: 'Teórico USD', headerTitle: 'Suma de (Fondo Anterior + Recaudado) de todas las monedas convertido a USD', sortable: true, thClass: 'text-right bg-light', tdClass: 'text-right bg-light' },
        { key: 'recaudado_usd', label: 'Rec. USD', headerTitle: 'Ventas en efectivo de este turno en Dólares', sortable: true, thClass: 'text-right', tdClass: 'text-right' },
        { key: 'recaudado_cop', label: 'Rec. COP', headerTitle: 'Ventas en efectivo de este turno en Pesos', sortable: true, thClass: 'text-right', tdClass: 'text-right' },
        { key: 'recaudado_bs', label: 'Rec. BS', headerTitle: 'Ventas en efectivo de este turno en Bolívares', sortable: true, thClass: 'text-right', tdClass: 'text-right' },
        { key: 'monto_cierre_usd', label: 'Ret. USD', headerTitle: 'Efectivo retirado físicamente en Dólares', sortable: true, thClass: 'text-right', tdClass: 'text-right' },
        { key: 'monto_cierre_cop', label: 'Ret. COP', headerTitle: 'Efectivo retirado físicamente en Pesos', sortable: true, thClass: 'text-right', tdClass: 'text-right' },
        { key: 'monto_cierre_bs', label: 'Ret. BS', headerTitle: 'Efectivo retirado físicamente en Bolívares', sortable: true, thClass: 'text-right', tdClass: 'text-right' },
        { key: 'fondo_nuevo_usd', label: 'Fondo USD', headerTitle: 'Efectivo que se quedó en la gaveta en Dólares', sortable: true, thClass: 'text-right', tdClass: 'text-right' },
        { key: 'fondo_nuevo_cop', label: 'Fondo COP', headerTitle: 'Efectivo que se quedó en la gaveta en Pesos', sortable: true, thClass: 'text-right', tdClass: 'text-right' },
        { key: 'fondo_nuevo_bs', label: 'Fondo BS', headerTitle: 'Efectivo que se quedó en la gaveta en Bolívares', sortable: true, thClass: 'text-right', tdClass: 'text-right' },
        { key: 'total_retirado_usd', label: 'Total Real USD', headerTitle: 'Suma de (Retirado + Fondo) convertido a USD', sortable: true, thClass: 'text-right bg-light', tdClass: 'text-right bg-light font-weight-bold' },
        { key: 'diferencia_usd', label: 'Diff USD', headerTitle: 'Total Real USD - Total Teórico USD', sortable: true, thClass: 'text-right', tdClass: 'text-right font-weight-bold' },
        { key: 'diferencia_cop', label: 'Diff COP', headerTitle: 'Suma de (Retirado COP + Fondo COP) - (Fondo Ant COP + Recaudado COP)', sortable: true, thClass: 'text-right', tdClass: 'text-right font-weight-bold' },
        { key: 'diferencia_bs', label: 'Diff BS', headerTitle: 'Suma de (Retirado BS + Fondo BS) - (Fondo Ant BS + Recaudado BS)', sortable: true, thClass: 'text-right', tdClass: 'text-right font-weight-bold' }
      ]
    };
  },
  computed: {
    ...mapState("login", ["access", "dataUser", "currentDepartamentId"]),
    isAdmin() {
      return this.currentDepartamentId === 7;
    },
    vendedoresOptions() {
      const options = [{ value: 0, text: 'Todos los vendedores' }];
      this.vendedores.forEach(v => {
        options.push({ value: v._id, text: v.nombre });
      });
      return options;
    },
    balanceData() {
      return this.datos.map(item => {
        const usdVal = parseFloat(item.monto_cierre_usd) || 0;
        const copVal = parseFloat(item.monto_cierre_cop) || 0;
        const bsVal = parseFloat(item.monto_cierre_bs) || 0;
        const tasaCop = parseFloat(item.tasa_cop) || 1;
        const tasaBs = parseFloat(item.tasa_bs) || 1;

        // Nuevo Fondo (Real)
        const nfUsd = parseFloat(item.fondo_nuevo_usd) || 0;
        const nfCop = parseFloat(item.fondo_nuevo_cop) || 0;
        const nfBs = parseFloat(item.fondo_nuevo_bs) || 0;

        // Fondo Anterior (Teórico)
        const faUsd = parseFloat(item.fondo_anterior_usd) || 0;
        const faCop = parseFloat(item.fondo_anterior_cop) || 0;
        const faBs = parseFloat(item.fondo_anterior_bs) || 0;

        // Recaudado (Teórico)
        const rUsd = parseFloat(item.recaudado_usd) || 0;
        const rCop = parseFloat(item.recaudado_cop) || 0;
        const rBs = parseFloat(item.recaudado_bs) || 0;

        const totalRealUsd = (usdVal + nfUsd) + ((copVal + nfCop) / tasaCop) + ((bsVal + nfBs) / tasaBs);
        const totalTeoricoUsd = (faUsd + rUsd) + ((faCop + rCop) / tasaCop) + ((faBs + rBs) / tasaBs);

        return {
          ...item,
          total_retirado_usd: totalRealUsd,
          total_teorico_usd: totalTeoricoUsd,
          recaudado_cop: rCop,
          recaudado_bs: rBs,
          fondo_nuevo_usd: nfUsd,
          fondo_nuevo_cop: nfCop,
          fondo_nuevo_bs: nfBs
        };
      });
    },
    totalDiferenciaUSD() {
      return this.datos.reduce((acc, item) => acc + this.calculateDiff(item, 'usd'), 0);
    },
    totalDiferenciaCOP() {
      return this.datos.reduce((acc, item) => acc + this.calculateDiff(item, 'cop'), 0);
    },
    totalDiferenciaBS() {
      return this.datos.reduce((acc, item) => acc + this.calculateDiff(item, 'bs'), 0);
    }
  },
  mounted() {
    if (this.isAdmin) {
      this.cargarVendedores();
      this.cargarDatos();
    }
  },
  methods: {
    async cargarVendedores() {
      try {
        // Aprovechamos el endpoint de reporte de caja que ya trae vendedores
        const res = await this.$axios.get(`${this.$config.API}/reporte-de-caja/${this.filtros.inicio}/${this.filtros.fin}/0`);
        this.vendedores = res.data.vendedores || [];
      } catch (e) {
        console.error("Error al cargar vendedores", e);
      }
    },
    async cargarDatos() {
      this.loading = true;
      try {
        const res = await this.$axios.get(`${this.$config.API}/balance-de-cierres/${this.filtros.inicio}/${this.filtros.fin}/${this.filtros.vendedor}`);
        this.datos = res.data.data || [];
      } catch (e) {
        this.$fire({
          title: "Error",
          text: "No se pudieron cargar los datos del balance",
          type: "error"
        });
      } finally {
        this.loading = false;
      }
    },
    calculateDiff(item, currency) {
      const valAnterior = item[`fondo_anterior_${currency}`] || 0;
      const valRecaudado = item[`recaudado_${currency}`] || 0;
      const valRetirado = item[`monto_cierre_${currency}`] || 0;
      const valNuevoFondo = item[`fondo_nuevo_${currency}`] || 0;
      
      const teorico = valAnterior + valRecaudado;
      const realEnCaja = valRetirado + valNuevoFondo;
      
      return realEnCaja - teorico;
    },
    getDiffClass(val) {
      if (val > 0.1) return 'text-success';
      if (val < -0.1) return 'text-danger';
      return 'text-muted';
    }
  }
};
</script>

<style scoped>
.summary-card {
  transition: transform 0.2s;
}
.summary-card:hover {
  transform: translateY(-5px);
}
.text-success {
  color: #28a745 !important;
}
.text-danger {
  color: #dc3545 !important;
}
.blue-link {
  color: #007bff;
  cursor: pointer;
}
</style>
