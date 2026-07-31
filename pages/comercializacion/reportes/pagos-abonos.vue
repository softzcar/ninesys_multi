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
              <h1 class="mb-4">{{ titulo }}</h1>
            </b-col>
          </b-row>
          <b-row>
            <b-col
              offset-lg="8"
              offset-xl="8"
            >
              <b-input-group
                class="mb-4"
                size="sm"
              >
                <b-form-input
                  id="filter-input"
                  v-model="filter"
                  type="search"
                  placeholder="Filtrar Resultados"
                ></b-form-input>

                <b-input-group-append>
                  <b-button
                    :disabled="!filter"
                    @click="filter = ''"
                  >
                    Limpiar
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form
                class="mb-4"
                @submit="onSubmit"
              >
                <b-row>
                  <b-col md="4">
                    <h3>Vendedor</h3>
                    <b-form-select
                      v-model="selectedVendedor"
                      :options="vendedores"
                      class="mb-4"
                    >
                      <template #first>
                        <b-form-select-option :value="null" disabled>-- Seleccione un vendedor --</b-form-select-option>
                        <b-form-select-option :value="0">Todos los vendedores</b-form-select-option>
                      </template>
                    </b-form-select>
                  </b-col>
                  <b-col md="4">
                    <h3>Fecha Inicio</h3>
                    <b-form-datepicker
                      class="mb-4"
                      v-model="fechaConsultaInicio"
                    />
                  </b-col>
                  <b-col md="4">
                    <h3>Fecha Fin</h3>
                    <b-form-datepicker
                      class="mb-4"
                      v-model="fechaConsultaFin"
                    />
                  </b-col>
                </b-row>

                <b-row>
                  <b-col class="text-center mt-2">
                    <b-button
                      type="submit"
                      variant="primary"
                      size="lg"
                      class="px-5 shadow-sm"
                    >
                      <b-icon icon="search" class="mr-2"></b-icon> GENERAR REPORTE
                    </b-button>
                  </b-col>
                </b-row>

                <b-row class="mt-4 mb-3" v-if="reporteGenerado">
                  <b-col class="mb-2">
                    <h5 class="mt-2 mb-2 pb-2">Filtrar por Categoría de Producto</h5>
                    <b-form-radio-group
                      id="category-filter"
                      v-model="selectedCategory"
                      :options="optionsCategories"
                      name="category-filter-radios"
                      buttons
                      button-variant="outline-primary"
                      size="lg"
                    ></b-form-radio-group>
                  </b-col>
                </b-row>

                <b-row class="mb-3" v-if="reporteGenerado">
                  <b-col class="mb-2">
                    <h5 class="mt-2 mb-2 pb-2">Filtrar por Moneda</h5>
                    <b-form-radio-group
                      id="moneda-filter"
                      v-model="selectedMoneda"
                      :options="optionsMonedas"
                      name="moneda-filter-radios"
                      buttons
                      button-variant="outline-primary"
                      size="sm"
                    ></b-form-radio-group>
                  </b-col>
                </b-row>

                <b-row class="mb-3" v-if="reporteGenerado">
                  <b-col class="mb-2">
                    <h5 class="mt-2 mb-2 pb-2">Filtrar por Método de Pago</h5>
                    <b-form-radio-group
                      id="metodo-pago-filter"
                      v-model="selectedMetodoPago"
                      :options="optionsMetodoPago"
                      name="metodo-pago-filter-radios"
                      buttons
                      button-variant="outline-primary"
                      size="sm"
                    ></b-form-radio-group>
                  </b-col>
                </b-row>
              </b-form>

              <div v-if="!reporteGenerado" class="py-5 text-center">
                <b-icon icon="info-circle" variant="info" font-scale="4" class="mb-4"></b-icon>
                <h2 class="text-muted">Seleccione un vendedor y un rango de fechas para generar el reporte</h2>
                <p class="text-muted small">Puede filtrar por un vendedor específico o visualizar los pagos globales.</p>
              </div>

              <div v-else>
                <b-row>
                  <b-col>
                    <b-overlay
                      :show="overlay"
                      spinner-small
                    >
                      <!-- RESUMEN FINANCIERO EMBELLECIDO -->
                      <b-row class="mb-4">
                        <!-- Columna de KPIs -->
                        <b-col lg="8" md="12">
                          <b-row>
                            <!-- Total Bruto -->
                            <b-col sm="4" class="mb-3">
                              <div class="h-100 p-3 rounded text-center border" style="background-color: #f8fafc; border-color: #cbd5e1 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                <b-icon icon="calculator" class="text-muted mb-2" font-scale="1.5"></b-icon>
                                <div class="text-muted text-uppercase font-weight-bold" style="font-size: 0.75rem; letter-spacing: 0.05em;">Total Bruto</div>
                                <div class="h4 font-weight-bold text-dark mt-1 mb-0">
                                  {{ formatNumber(totales.sumas.total_orden) }} $
                                </div>
                              </div>
                            </b-col>

                            <!-- Total Descuentos -->
                            <b-col sm="4" class="mb-3">
                              <div class="h-100 p-3 rounded text-center border" style="background-color: #fffbeb; border-color: #fde68a !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                <b-icon icon="percent" class="text-warning mb-2" font-scale="1.5"></b-icon>
                                <div class="text-warning text-uppercase font-weight-bold" style="font-size: 0.75rem; letter-spacing: 0.05em;">Descuentos</div>
                                <div class="h4 font-weight-bold text-warning mt-1 mb-0">
                                  {{ formatNumber(totales.sumas.descuentos) }} $
                                </div>
                              </div>
                            </b-col>

                            <!-- Total Neto -->
                            <b-col sm="4" class="mb-3">
                              <div class="h-100 p-3 rounded text-center border" style="background-color: #f0fdf4; border-color: #bbf7d0 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                <b-icon icon="cash" class="text-success mb-2" font-scale="1.5"></b-icon>
                                <div class="text-success text-uppercase font-weight-bold" style="font-size: 0.75rem; letter-spacing: 0.05em;">Total Neto</div>
                                <div class="h4 font-weight-bold text-success mt-1 mb-0">
                                  {{ formatNumber(totales.sumas.neto) }} $
                                </div>
                              </div>
                            </b-col>
                          </b-row>

                          <b-row>
                            <!-- Total Pagado / Abonos -->
                            <b-col sm="6" class="mb-3">
                              <div class="h-100 p-3 rounded text-center border" style="background-color: #eff6ff; border-color: #bfdbfe !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                                <b-icon icon="check2-circle" class="text-primary mb-2" font-scale="1.8"></b-icon>
                                <div class="text-primary text-uppercase font-weight-bold" style="font-size: 0.8rem; letter-spacing: 0.05em;">Total Pagado / Abonos</div>
                                <div class="h2 font-weight-bold text-primary mt-1 mb-0">
                                  {{ formatNumber(totales.totalGeneral) }} $
                                </div>
                              </div>
                            </b-col>

                            <!-- Saldo Pendiente Total -->
                            <b-col sm="6" class="mb-3">
                              <div class="h-100 p-3 rounded text-center border" style="background-color: #fef2f2; border-color: #fecaca !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                                <b-icon icon="exclamation-circle" class="text-danger mb-2" font-scale="1.8"></b-icon>
                                <div class="text-danger text-uppercase font-weight-bold" style="font-size: 0.8rem; letter-spacing: 0.05em;">Saldo Pendiente Total</div>
                                <div class="h2 font-weight-bold text-danger mt-1 mb-0">
                                  {{ formatNumber(totales.sumas.saldo) }} $
                                </div>
                              </div>
                            </b-col>
                          </b-row>
                        </b-col>

                        <!-- Desglose por Método de Pago -->
                        <b-col lg="4" md="12" class="mb-3">
                          <div class="h-100 p-3 rounded border" style="background-color: #ffffff; border-color: #cbd5e1 !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                            <div class="d-flex align-items-center mb-3">
                              <b-icon icon="wallet2" class="text-muted mr-2" font-scale="1.2"></b-icon>
                              <span class="text-uppercase font-weight-bold text-secondary" style="font-size: 0.85rem; letter-spacing: 0.05em;">Métodos de Pago</span>
                            </div>
                            <div v-if="totales.porMetodoPago && totales.porMetodoPago.length">
                              <div 
                                v-for="pago in totales.porMetodoPago" 
                                :key="pago.metodoPago"
                                class="d-flex justify-content-between align-items-center mb-2 pb-2"
                                style="border-bottom: 1px dashed #e2e8f0;"
                              >
                                <span class="text-dark font-weight-bold" style="font-size: 0.9rem;">{{ pago.metodoPago }}</span>
                                <span class="px-2 py-1 rounded font-weight-bold" style="font-size: 0.9rem; background-color: #f1f5f9; color: #334155; border: 1px solid #e2e8f0;">
                                  {{ formatNumber(pago.total) }} $
                                </span>
                              </div>
                            </div>
                            <div v-else class="text-muted text-center py-4 small">
                              No hay pagos registrados.
                            </div>
                          </div>
                        </b-col>
                      </b-row>

                        <b-table
                          sort-icon-left
                          foot-clone
                          ref="table"
                          responsive
                          small
                          :fields="campos"
                          :items="pagosFiltrados"
                          @filtered="onFiltered"
                          :filter="filter"
                          :filter-included-fields="includedFields"
                        >
                        <template #cell(orden)="data">
                          <linkSearch
                            :key="data.item._id"
                            :id="data.item.orden"
                          />
                        </template>

                        <template #cell(monto)="data">
                          {{ formatNumber(data.item.montoAjustadoLocal) }}
                        </template>

                        <template #cell(tasa)="data">
                          {{ formatNumber(data.item.tasa) }}
                        </template>

                        <template #cell(_id)="data">
                          {{ formatNumber(data.item.montoAjustadoUsd) }}
                        </template>

                        <template #cell(total_orden)="data">
                          {{ data.item.esDuplicado ? '-' : formatNumber(data.item.total_orden) }}
                        </template>

                        <template #cell(total_descuento_valor)="data">
                          {{ data.item.esDuplicado ? '-' : formatNumber(data.item.total_descuento_valor) }}
                        </template>

                        <template #cell(total_nota_credito_valor)="data">
                          {{ data.item.esDuplicado ? '-' : formatNumber(data.item.total_nota_credito_valor) }}
                        </template>

                        <template #cell(total_neto)="data">
                          <b>{{ data.item.esDuplicado ? '-' : formatNumber(data.item.total_neto) }}</b>
                        </template>

                        <template #cell(saldo_pendiente)="data">
                          <span v-if="!data.item.esDuplicado" :class="parseFloat(data.item.saldo_pendiente) > 0 ? 'text-danger font-weight-bold' : 'text-success'">
                            {{ formatNumber(data.item.saldo_pendiente) }}
                          </span>
                          <span v-else>-</span>
                        </template>

                        <!-- FOOTER TOTALS -->
                        <template #foot(monto)>
                          <div class="text-right">{{ formatNumber(totales.sumas.monto) }}</div>
                        </template>
                        <template #foot(_id)>
                          <div class="text-right">{{ formatNumber(totales.sumas.usd) }}</div>
                        </template>
                        <template #foot(total_orden)>
                          <div class="text-right">{{ formatNumber(totales.sumas.total_orden) }}</div>
                        </template>
                        <template #foot(total_descuento_valor)>
                          <div class="text-right">{{ formatNumber(totales.sumas.descuentos) }}</div>
                        </template>
                        <template #foot(total_nota_credito_valor)>
                          <div class="text-right">{{ formatNumber(totales.sumas.notaCredito) }}</div>
                        </template>
                        <template #foot(total_neto)>
                          <div class="text-right"><b>{{ formatNumber(totales.sumas.neto) }}</b></div>
                        </template>
                        <template #foot(saldo_pendiente)>
                          <div class="text-right"><b class="text-danger">{{ formatNumber(totales.sumas.saldo) }}</b></div>
                        </template>
                      </b-table>
                    </b-overlay>
                  </b-col>
                </b-row>
              </div>
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
import mixinLogin from "~/mixins/mixin-login.js";
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin, mixinLogin],

  data() {
    return {
      includedFields: ["orden", "empleado"],
      fechaConsultaInicio: "",
      fechaConsultaFin: "",
      vendedores: [],
      filter: null,
      perPage: 25,
      currentPage: 1,
      totalRows: 0,
      overlay: true,
      reporteGenerado: false,
      titulo: "Balance de pagos y abonos",
      pagos: [],
      selectedVendedor: null,
      selectedCategory: 'Todas',
      optionsCategories: [],
      selectedMoneda: 'Todas',
      optionsMonedas: [],
      selectedMetodoPago: 'Todos',
      optionsMetodoPago: [],
      campos: [
        {
          key: "orden",
          label: "Orden",
          sortable: true,
        },
        {
          key: "empleado",
          label: "Vendedor",
          sortable: true,
        },
        {
          key: "metodo_pago",
          label: "Método",
          sortable: true,
        },
        {
          key: "detalle",
          label: "Detalles",
        },
        {
          key: "fecha",
          label: "Fecha",
          sortable: true,
        },
        {
          key: "hora",
          label: "Hora",
        },
        {
          key: "moneda",
          label: "Moneda",
          sortable: true,
        },
        {
          key: "tasa",
          label: "Tasa",
          sortable: true,
          tdClass: "text-right",
          thClass: "text-right",
        },
        {
          key: "monto",
          label: "Monto",
          sortable: true,
          tdClass: "text-right",
          thClass: "text-right",
        },
        {
          key: "_id",
          label: "Total $",
          tdClass: "text-right",
          thClass: "text-right",
        },
        {
          key: "total_orden",
          label: "Monto Total",
          sortable: true,
          tdClass: "text-right",
          thClass: "text-right",
        },
        {
          key: "total_descuento_valor",
          label: "Descuentos",
          sortable: true,
          tdClass: "text-right",
          thClass: "text-right",
        },
        {
          key: "total_nota_credito_valor",
          label: "Nota de Crédito",
          sortable: true,
          tdClass: "text-right",
          thClass: "text-right",
        },
        {
          key: "total_neto",
          label: "Monto Neto",
          sortable: true,
          tdClass: "text-right",
          thClass: "text-right",
        },
        {
          key: "saldo_pendiente",
          label: "Saldo Pendiente",
          sortable: true,
          tdClass: "text-right",
          thClass: "text-right",
        },
      ],
      ordenes: [],
    };
  },

  computed: {
    ...mapState("login", ["dataUser", "access"]),
    monedaBaseNombre() {
      return this.$store.state.login.dataEmpresa?.moneda_base?.nombre || "Dólares";
    },
    pagosFiltrados() {
      const pagosSeguro = Array.isArray(this.pagos) ? this.pagos : [];
      const ordenesProcesadas = new Set();

      return pagosSeguro
        .filter(pago => {
          if (this.selectedCategory === 'Todas' || !this.selectedCategory) {
            return true;
          }
          return pago.product_categories && Array.isArray(pago.product_categories) && pago.product_categories.some(cat => cat && cat.category_name === this.selectedCategory);
        })
        .filter(pago => this.selectedMoneda === 'Todas' || pago.moneda === this.selectedMoneda)
        .filter(pago => this.selectedMetodoPago === 'Todos' || pago.metodo_pago === this.selectedMetodoPago)
        .map(pago => {
          const montoLocal = parseFloat(pago.monto) || 0;
          const tasaVal = parseFloat(pago.tasa) || 1;

          let ratio = 1;
          let montoAjustadoLocal = montoLocal;
          let montoAjustadoUsd = parseFloat(this.convertirAMonedaBase(pago.moneda, montoLocal, tasaVal)) || 0;

          if (this.selectedCategory && this.selectedCategory !== 'Todas') {
            const categoryData = pago.product_categories.find(cat => cat && cat.category_name === this.selectedCategory);
            if (categoryData && categoryData.category_total && pago.total_orden) {
              const totalCategoria = parseFloat(categoryData.category_total) || 0;
              const totalOrden = parseFloat(pago.total_orden) || 1;
              ratio = totalCategoria / totalOrden;
              montoAjustadoLocal = ratio * montoLocal;
              montoAjustadoUsd = parseFloat(this.convertirAMonedaBase(pago.moneda, montoAjustadoLocal, tasaVal)) || 0;
            }
          }

          const ordenId = pago.orden;
          const yaProcesada = ordenesProcesadas.has(ordenId);
          ordenesProcesadas.add(ordenId);

          // NOTA: total_nota_credito se maneja aparte de total_descuento y se SUMA
          // (no se resta) al saldo pendiente. Es la misma convención ya usada en
          // ordenes/abono.vue y en linkSearch (buscar/resultado.vue): una nota de
          // crédito incrementa lo que el cliente aún debe, no lo reduce.
          const totalDescuentoBase = parseFloat(pago.total_descuento) || 0;
          const totalNotaCreditoBase = parseFloat(pago.total_nota_credito) || 0;
          const totalOrdenBase = parseFloat(pago.total_orden) || 0;
          const totalAbonoBase = parseFloat(pago.total_abonos_base) || 0;

          // Scaled versions (proportional to category if filtered)
          const totalOrdenScaled = ratio * totalOrdenBase;
          const totalDescuentoScaled = ratio * totalDescuentoBase;
          const totalNotaCreditoScaled = ratio * totalNotaCreditoBase;
          const totalNetoScaled = totalOrdenScaled - totalDescuentoScaled;
          const saldoPendienteScaled = totalNetoScaled - (ratio * totalAbonoBase) + totalNotaCreditoScaled;

          // Zero out duplicate values for displaying/summing order-level fields
          const total_orden = yaProcesada ? 0 : totalOrdenScaled;
          const total_descuento_valor = yaProcesada ? 0 : totalDescuentoScaled;
          const total_nota_credito_valor = yaProcesada ? 0 : totalNotaCreditoScaled;
          const total_neto = yaProcesada ? 0 : totalNetoScaled;
          const saldo_pendiente = yaProcesada ? 0 : (saldoPendienteScaled > 0.01 ? saldoPendienteScaled : 0);

          return {
            ...pago,
            montoAjustadoLocal,
            montoAjustadoUsd,
            total_orden,
            total_descuento_valor,
            total_nota_credito_valor,
            total_neto,
            saldo_pendiente: saldo_pendiente,
            esDuplicado: yaProcesada
          };
        });
    },
    totales() {
      const totales = {
        porMetodoPago: {},
        totalGeneral: 0,
        sumas: {
          monto: 0,
          usd: 0,
          total_orden: 0,
          descuentos: 0,
          notaCredito: 0,
          neto: 0,
          saldo: 0
        }
      };

      const pagosSeguro = Array.isArray(this.pagosFiltrados) ? this.pagosFiltrados : [];

      pagosSeguro.forEach((item) => {
        const { metodo_pago, montoAjustadoUsd, montoAjustadoLocal, total_orden, total_descuento_valor, total_nota_credito_valor, total_neto, saldo_pendiente } = item;
        const montoUsd = parseFloat(montoAjustadoUsd) || 0;

        totales.totalGeneral += montoUsd;

        totales.sumas.monto += parseFloat(montoAjustadoLocal) || 0;
        totales.sumas.usd += montoUsd;

        // Sumamos métricas de orden directly (duplicates are already 0 in pagosFiltrados)
        totales.sumas.total_orden += parseFloat(total_orden) || 0;
        totales.sumas.descuentos += parseFloat(total_descuento_valor) || 0;
        totales.sumas.notaCredito += parseFloat(total_nota_credito_valor) || 0;
        totales.sumas.neto += parseFloat(total_neto) || 0;
        totales.sumas.saldo += parseFloat(saldo_pendiente) || 0;

        if (!totales.porMetodoPago[metodo_pago]) {
          totales.porMetodoPago[metodo_pago] = 0;
        }
        totales.porMetodoPago[metodo_pago] += montoUsd;
      });

      const resultadoPorMetodoPago = Object.entries(totales.porMetodoPago).map(
        ([metodoPago, total]) => ({
          metodoPago,
          total: total.toFixed(2),
        })
      );

      console.log("Resultado final:", {
        porMetodoPago: resultadoPorMetodoPago,
        totalGeneral: totales.totalGeneral.toFixed(2),
      });

      return {
        porMetodoPago: resultadoPorMetodoPago,
        totalGeneral: totales.totalGeneral.toFixed(2),
        sumas: totales.sumas
      };
    },
  },

  watch: {
    pagosFiltrados(newVal) {
      this.totalRows = newVal.length;
      this.currentPage = 1;
    }
  },

  methods: {
    generateCategoryOptions() {
      const allCategories = [];
      if (Array.isArray(this.pagos)) {
        this.pagos.forEach(pago => {
          if (pago.product_categories && Array.isArray(pago.product_categories)) {
            pago.product_categories.forEach(cat => {
              if (cat.category_name) {
                allCategories.push(cat.category_name);
              }
            });
          }
        });
      }
      
      console.log("All Categories extracted:", allCategories);
      const uniqueCategories = [...new Set(allCategories)];
      console.log("Unique Categories:", uniqueCategories);
      const options = uniqueCategories.filter(c => c).sort().map(category => ({
        value: category,
        text: category
      }));
      this.optionsCategories = [{ value: 'Todas', text: 'Todas' }, ...options];
      console.log("Final Options:", this.optionsCategories);
    },

    generateMonedaOptions() {
      const pagosSeguro = Array.isArray(this.pagos) ? this.pagos : [];
      const unicos = new Map();
      pagosSeguro.forEach((p) => {
        if (p.moneda) {
          const key = p.moneda.trim();
          if (!unicos.has(key)) unicos.set(key, key);
        }
      });

      const opciones = [...unicos.values()]
        .sort((a, b) => a.localeCompare(b))
        .map((moneda) => ({ text: moneda, value: moneda }));

      this.optionsMonedas = [{ text: "Todas", value: "Todas" }, ...opciones];
    },

    generateMetodoPagoOptions() {
      const pagosSeguro = Array.isArray(this.pagos) ? this.pagos : [];
      const unicos = new Map();
      pagosSeguro.forEach((p) => {
        if (p.metodo_pago) {
          const key = p.metodo_pago.trim();
          if (!unicos.has(key)) unicos.set(key, key);
        }
      });

      const opciones = [...unicos.values()]
        .sort((a, b) => a.localeCompare(b))
        .map((metodo) => ({ text: metodo, value: metodo }));

      this.optionsMetodoPago = [{ text: "Todos", value: "Todos" }, ...opciones];
    },

    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },

    async getPagos() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/reporte-de-pagos`)
        .then((resp) => {
          this.pagos = []; // Inicialmente vacío

          this.vendedores = (resp.data.vendedores || []).map((el) => {
            return {
              value: el._id,
              text: el.nombre,
            };
          });

          this.totalRows = 0;
          this.generateCategoryOptions();
          this.generateMonedaOptions();
          this.generateMetodoPagoOptions();
          this.overlay = false;
        });
    },

    onSubmit(event) {
      event.preventDefault();
      const fechaInicio = this.fechaConsultaInicio;
      const fechaFin = this.fechaConsultaFin;
      console.log("inicio", fechaInicio);
      console.log("fin", fechaFin);

      if (this.selectedVendedor === null || !fechaInicio || !fechaFin) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>Por favor seleccione un vendedor y ambas fechas</p>`,
          type: "warning",
        });
        return;
      }

      if (new Date(fechaInicio) > new Date(fechaFin)) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
          type: "warning",
        });
        return;
      }
      this.realizarConsulta();
    },

    async realizarConsulta() {
      this.overlay = true;
      const vendedorId = this.selectedVendedor;
      await this.$axios
        .get(
          `${this.$config.API}/reporte-de-pagos/${this.fechaConsultaInicio}/${this.fechaConsultaFin}/${vendedorId}`
        )
        .then((resp) => {
          this.pagos = resp.data.pagos || [];
          // Vendedores should already be populated by getPagos, no need to re-fetch/re-add "Todos"
          // this.vendedores = (resp.data.vendedores || []).map((el) => {
          //   return {
          //     value: el._id,
          //     text: el.nombre,
          //   };
          // });
          // this.vendedores.unshift({ value: 0, text: "Todos" });

          this.totalRows = this.pagos.length;
          this.generateCategoryOptions();
          this.generateMonedaOptions();
          this.generateMetodoPagoOptions();
          this.selectedMoneda = 'Todas';
          this.selectedMetodoPago = 'Todos';
          this.reporteGenerado = true;
          this.overlay = false;
        })
        .catch(error => {
          console.error("Error fetching filtered payments:", error);
          this.overlay = false;
          this.$fire({
            title: "Error",
            html: `<p>No se pudieron cargar los pagos para los filtros seleccionados.</p>`,
            type: "error",
          });
        });
    },

    convertirAMonedaBase(moneda, monto, tasa) {
      // Validación de datos de entrada
      if (!isNaN(monto) && !isNaN(tasa)) {
        let tot;

        if (moneda !== this.monedaBaseNombre) {
          tot = parseFloat(monto) / parseFloat(tasa);
        } else {
          tot = parseFloat(monto);
        }

        // Validación de NaN y división por cero
        if (isNaN(tot)) {
          return "Error en el cálculo"; // O cualquier otro mensaje de error
        } else {
          return tot.toFixed(2);
        }
      } else {
        return "Monto o tasa no válidos";
      }
    },
  },

  created() {
  },

  beforeMount() {
    this.fechaConsultaInicio = this.nowDate();
    this.fechaConsultaFin = this.nowDate();
  },

  mounted() {
    // this.getOrdenes()
    this.getPagos();
  },

  destroyed() {
  }
};
</script>