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

          <!-- Resumen de Totales: una tarjeta por cada moneda activa real de la empresa -->
          <b-row class="mb-4" v-if="datos.length > 0">
            <b-col md="4" v-for="m in monedas" :key="m._id">
              <div class="summary-card text-center p-3 shadow-sm bg-white rounded">
                <h3 class="text-muted mb-1">Diferencia {{ m.codigo }}</h3>
                <h1 :class="getDiffClass(totalDiferenciaPorMoneda(m.codigo))" style="font-size: 2.5rem; font-weight: bold;">
                  {{ formatNumber(totalDiferenciaPorMoneda(m.codigo)) }}
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
      monedas: [], // catálogo real de monedas activas de la empresa, devuelto por el backend
      monedaBase: null
    };
  },
  computed: {
    ...mapState("login", ["access", "dataUser", "currentDepartamentId", "currentDepartament"]),
    isAdmin() {
      return (
        Number(this.dataUser?.acceso) === 1 ||
        this.currentDepartament === "Administración" ||
        this.currentDepartamentId === 7
      );
    },
    vendedoresOptions() {
      const options = [{ value: 0, text: 'Todos los vendedores' }];
      this.vendedores.forEach(v => {
        options.push({ value: v._id, text: v.nombre });
      });
      return options;
    },
    codigoBase() {
      return this.monedaBase ? this.monedaBase.codigo : '';
    },
    // Columnas dinámicas: 3 por cada moneda activa real de la empresa
    // (Recaudado/Retirado/Fondo/Diff), más el resumen en la moneda base --
    // reemplaza los 3 bloques fijos USD/COP/BS que asumían siempre esas 3.
    fields() {
      const base = [
        { key: 'fecha_cierre', label: 'Fecha/Hora', sortable: true, formatter: (v) => this.formatTimestamp(v) },
        { key: 'vendedor', label: 'Vendedor', sortable: true },
        {
          key: 'total_teorico_base',
          label: `Teórico ${this.codigoBase}`,
          headerTitle: `Suma de (Fondo Anterior + Recaudado) de todas las monedas convertido a ${this.codigoBase}`,
          sortable: true,
          thClass: 'text-right bg-light',
          tdClass: 'text-right bg-light',
          formatter: (v) => this.formatNumber(v)
        }
      ];

      const porMoneda = [];
      this.monedas.forEach((m) => {
        porMoneda.push(
          {
            key: `rec_${m.codigo}`,
            label: `Rec. ${m.codigo}`,
            headerTitle: `Ventas en efectivo de este turno en ${m.nombre}`,
            sortable: true,
            thClass: 'text-right',
            tdClass: 'text-right',
            formatter: (v) => this.formatNumber(v)
          },
          {
            key: `ret_${m.codigo}`,
            label: `Ret. ${m.codigo}`,
            headerTitle: `Efectivo retirado físicamente en ${m.nombre}`,
            sortable: true,
            thClass: 'text-right',
            tdClass: 'text-right',
            formatter: (v) => this.formatNumber(v)
          },
          {
            key: `fondo_${m.codigo}`,
            label: `Fondo ${m.codigo}`,
            headerTitle: `Efectivo que se quedó en la gaveta en ${m.nombre}`,
            sortable: true,
            thClass: 'text-right',
            tdClass: 'text-right',
            formatter: (v) => this.formatNumber(v)
          },
          {
            key: `diff_${m.codigo}`,
            label: `Diff ${m.codigo}`,
            headerTitle: `(Retirado + Fondo) - (Fondo Anterior + Recaudado) en ${m.nombre}`,
            sortable: true,
            thClass: 'text-right',
            tdClass: (v) => `text-right font-weight-bold ${this.getDiffClass(v)}`,
            formatter: (v) => this.formatNumber(v)
          }
        );
      });

      const totales = [
        {
          key: 'total_real_base',
          label: `Total Real ${this.codigoBase}`,
          headerTitle: `Suma de (Retirado + Fondo) convertido a ${this.codigoBase}`,
          sortable: true,
          thClass: 'text-right bg-light',
          tdClass: 'text-right bg-light font-weight-bold',
          formatter: (v) => this.formatNumber(v)
        },
        {
          key: 'diferencia_base',
          label: `Diff ${this.codigoBase}`,
          headerTitle: `Total Real ${this.codigoBase} - Total Teórico ${this.codigoBase}`,
          sortable: true,
          thClass: 'text-right',
          tdClass: (v) => `text-right font-weight-bold ${this.getDiffClass(v)}`,
          formatter: (v) => this.formatNumber(v)
        }
      ];

      return [...base, ...porMoneda, ...totales];
    },
    // Aplana `porMoneda` (array por fila) a claves planas (rec_USD, ret_VES, ...)
    // que coincidan con las keys dinámicas de `fields`, tal como lo espera b-table.
    balanceData() {
      return this.datos.map((item) => {
        const flat = {
          _id: item._id,
          fecha_cierre: item.fecha_cierre,
          vendedor: item.vendedor,
          total_teorico_base: item.total_teorico_base,
          total_real_base: item.total_real_base,
          diferencia_base: item.diferencia_base
        };
        (item.porMoneda || []).forEach((pm) => {
          flat[`rec_${pm.codigo}`] = pm.recaudado;
          flat[`ret_${pm.codigo}`] = pm.cierre;
          flat[`fondo_${pm.codigo}`] = pm.fondo_nuevo;
          flat[`diff_${pm.codigo}`] = pm.diferencia;
        });
        return flat;
      });
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
        this.monedas = res.data.monedas || [];
        this.monedaBase = res.data.monedaBase || null;
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
    totalDiferenciaPorMoneda(codigo) {
      return this.datos.reduce((acc, item) => {
        const pm = (item.porMoneda || []).find((p) => p.codigo === codigo);
        return acc + (pm ? pm.diferencia : 0);
      }, 0);
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
