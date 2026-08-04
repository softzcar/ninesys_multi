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
            <b-col>
              <h1>Balance de Cierres de Caja</h1>
              <common-page-guide />
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

                <template #cell(show_details)="row">
                  <b-button size="sm" variant="outline-secondary" @click="row.toggleDetails">
                    <i :class="row.detailsShowing ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    {{ row.detailsShowing ? 'Ocultar' : 'Ver' }}
                  </b-button>
                </template>

                <template #row-details="row">
                  <b-card class="m-2">
                    <b-table
                      v-if="monedasConActividad(row.item).length > 0"
                      small
                      striped
                      responsive
                      :items="monedasConActividad(row.item)"
                      :fields="fieldsDetalleMoneda"
                    ></b-table>
                    <div v-else class="text-muted text-center">Sin movimiento por moneda en este cierre.</div>
                  </b-card>
                </template>
              </b-table>
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
        // ID 5 = Administración según la plantilla estándar de nueva empresa
        // (antes decía 7 por error, que en realidad es Diseño, ver hallazgo 2026-08-03).
        this.currentDepartamentId === 5
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
    // Tabla principal: solo los totales combinados (siempre relevantes) + un
    // botón para expandir el detalle por moneda -- antes generaba 4 columnas
    // por cada moneda activa (hasta 21 columnas en total), casi todas en 0.00
    // para cualquier cierre dado, reportado como "muy difícil de leer" por el
    // usuario (2026-08-04). El detalle por moneda vive ahora en #row-details.
    fields() {
      return [
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
        },
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
          label: `Diferencia Total ${this.codigoBase}`,
          headerTitle: `Total Real ${this.codigoBase} - Total Teórico ${this.codigoBase} (todas las monedas combinadas)`,
          sortable: true,
          thClass: 'text-right',
          tdClass: (v) => `text-right font-weight-bold ${this.getDiffClass(v)}`,
          formatter: (v) => this.formatNumber(v)
        },
        { key: 'show_details', label: 'Detalle por moneda', thClass: 'text-center', tdClass: 'text-center' }
      ];
    },
    balanceData() {
      return this.datos.map((item) => ({ ...item }));
    },
    // Columnas de la tabla anidada (#row-details) -- sin sufijo de moneda en
    // las etiquetas porque cada fila ya trae su propia moneda en "nombre".
    fieldsDetalleMoneda() {
      return [
        { key: 'nombre', label: 'Moneda' },
        {
          key: 'recaudado',
          label: 'Recaudado',
          headerTitle: 'Ventas en efectivo de este turno',
          thClass: 'text-right',
          tdClass: 'text-right',
          formatter: (v) => this.formatNumber(v)
        },
        {
          key: 'cierre',
          label: 'Retirado',
          headerTitle: 'Efectivo entregado/depositado al cerrar caja (no es un retiro del módulo de Retiros)',
          thClass: 'text-right',
          tdClass: 'text-right',
          formatter: (v) => this.formatNumber(v)
        },
        {
          key: 'fondo_nuevo',
          label: 'Fondo',
          headerTitle: 'Efectivo que se quedó en la gaveta para el próximo turno',
          thClass: 'text-right',
          tdClass: 'text-right',
          formatter: (v) => this.formatNumber(v)
        },
        {
          key: 'diferencia',
          label: 'Diferencia',
          headerTitle: '(Retirado + Fondo) - (Fondo Anterior + Recaudado) en esta moneda',
          thClass: 'text-right',
          tdClass: (v) => `text-right font-weight-bold ${this.getDiffClass(v)}`,
          formatter: (v) => this.formatNumber(v)
        }
      ];
    }
  },
  mounted() {
    if (this.isAdmin) {
      this.cargarVendedores();
      this.cargarDatos();
    }
  },
  methods: {
    // Solo las monedas con algún movimiento real en ESTE cierre -- oculta el
    // ruido de monedas activas de la empresa que no participaron en el turno.
    monedasConActividad(item) {
      return (item.porMoneda || []).filter((pm) =>
        Math.abs(pm.recaudado) > 0.001 ||
        Math.abs(pm.cierre) > 0.001 ||
        Math.abs(pm.fondo_nuevo) > 0.001 ||
        Math.abs(pm.fondo_anterior) > 0.001
      );
    },
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
