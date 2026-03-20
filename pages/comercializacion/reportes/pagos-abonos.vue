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
                      <b-pagination
                        v-model="currentPage"
                        :total-rows="totalRows"
                        :per-page="perPage"
                      ></b-pagination>

                      <p class="mt-3">
                        Página actual: {{ currentPage }}
                      </p>

                      <h4
                        v-for="pago in totales.porMetodoPago"
                        :key="pago.metodoPago"
                        class="text-right"
                      >
                        {{ pago.metodoPago }}: {{ pago.total }}
                      </h4>

                      <h3 class="text-right mt-2">
                        Total Bruto: {{ formatNumber(totales.sumas.total_orden) }}
                      </h3>

                      <h3 class="text-right">
                        Total Descuentos: {{ formatNumber(totales.sumas.descuentos) }}
                      </h3>

                      <h3 class="text-right">
                        Total Neto: {{ formatNumber(totales.sumas.neto) }}
                      </h3>

                      <h3 class="text-right mt-2 mb-4">
                        TOTAL PAGOS: {{ formatNumber(totales.totalGeneral) }}
                      </h3>

                        <b-table
                          sort-icon-left
                          foot-clone
                          :per-page="perPage"
                          :current-page="currentPage"
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
                          {{ formatNumber(data.item.total_orden) }}
                        </template>

                        <template #cell(total_descuento_valor)="data">
                          {{ formatNumber(data.item.total_descuento_valor) }}
                        </template>

                        <template #cell(total_neto)="data">
                          <b>{{ formatNumber(data.item.total_neto) }}</b>
                        </template>

                        <template #cell(saldo_pendiente)="data">
                          <span :class="parseFloat(data.item.saldo_pendiente) > 0 ? 'text-danger font-weight-bold' : 'text-success'">
                            {{ formatNumber(data.item.saldo_pendiente) }}
                          </span>
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
    pagosFiltrados() {
      const pagosSeguro = Array.isArray(this.pagos) ? this.pagos : [];
      if (this.selectedCategory === 'Todas' || !this.selectedCategory) {
        return pagosSeguro.map(pago => {
          const montoLocal = parseFloat(pago.monto) || 0;
          const tasaVal = parseFloat(pago.tasa) || 1;
          const montoUsd = (pago.moneda === "Bolívares" || pago.moneda === "Pesos") ? (montoLocal / tasaVal) : montoLocal;
          const totalDescuento = (parseFloat(pago.total_descuento) || 0) + (parseFloat(pago.total_nota_credito) || 0);
          const totalAbonoBase = parseFloat(pago.total_abonos_base) || 0;
          const totalOrden = parseFloat(pago.total_orden) || 0;
          const totalNeto = totalOrden - totalDescuento;
          const saldoPendiente = totalNeto - totalAbonoBase;

          return {
            ...pago,
            montoAjustadoLocal: montoLocal,
            montoAjustadoUsd: montoUsd,
            total_descuento_valor: totalDescuento,
            total_neto: totalNeto,
            saldo_pendiente: saldoPendiente > 0.01 ? saldoPendiente : 0
          };
        });
      }
      return pagosSeguro.filter(pago => 
        pago.product_categories && Array.isArray(pago.product_categories) && pago.product_categories.some(cat => cat && cat.category_name === this.selectedCategory)
      ).map(pago => {
        let montoAjustadoLocal = 0;
        let montoAjustadoUsd = 0;
        const montoBase = parseFloat(pago.monto) || 0;
        const tasaBase = parseFloat(pago.tasa) || 1;
        
        const categoryData = pago.product_categories.find(cat => cat && cat.category_name === this.selectedCategory);
        if (categoryData && categoryData.category_total && pago.total_orden) {
             const totalCategoria = parseFloat(categoryData.category_total) || 0;
             const totalOrden = parseFloat(pago.total_orden) || 1;
             
             montoAjustadoLocal = (totalCategoria / totalOrden) * montoBase;
             montoAjustadoUsd = (pago.moneda === "Bolívares" || pago.moneda === "Pesos") ? (montoAjustadoLocal / tasaBase) : montoAjustadoLocal;
        } else {
             montoAjustadoLocal = montoBase;
             montoAjustadoUsd = (pago.moneda === "Bolívares" || pago.moneda === "Pesos") ? (montoAjustadoLocal / tasaBase) : montoAjustadoLocal;
        }
        const totalDescuento = (parseFloat(pago.total_descuento) || 0) + (parseFloat(pago.total_nota_credito) || 0);
        const totalAbonoBase = parseFloat(pago.total_abonos_base) || 0;
        const totalOrden = parseFloat(pago.total_orden) || 0;
        const totalNeto = totalOrden - totalDescuento;
        const saldoPendiente = totalNeto - totalAbonoBase;

        return {
          ...pago,
          montoAjustadoLocal,
          montoAjustadoUsd,
          total_descuento_valor: totalDescuento,
          total_neto: totalNeto,
          saldo_pendiente: saldoPendiente > 0.01 ? saldoPendiente : 0
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
          neto: 0,
          saldo: 0
        }
      };

      const pagosSeguro = Array.isArray(this.pagosFiltrados) ? this.pagosFiltrados : [];
      const ordenesProcesadas = new Set();

      pagosSeguro.forEach((item) => {
        const { orden, metodo_pago, montoAjustadoUsd, montoAjustadoLocal, total_orden, total_descuento_valor, total_neto, saldo_pendiente } = item;
        const montoUsd = parseFloat(montoAjustadoUsd) || 0;

        totales.totalGeneral += montoUsd;
        
        // Sumamos pagos siempre (son individuales)
        totales.sumas.monto += parseFloat(montoAjustadoLocal) || 0;
        totales.sumas.usd += montoUsd;

        // Sumamos métricas de orden SOLO una vez por orden ID
        if (!ordenesProcesadas.has(orden)) {
          totales.sumas.total_orden += parseFloat(total_orden) || 0;
          totales.sumas.descuentos += parseFloat(total_descuento_valor) || 0;
          totales.sumas.neto += parseFloat(total_neto) || 0;
          totales.sumas.saldo += parseFloat(saldo_pendiente) || 0;
          ordenesProcesadas.add(orden);
        }

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

    usdConverter(moneda, monto, tasa) {
      // Validación de datos de entrada
      if (!isNaN(monto) && !isNaN(tasa)) {
        let tot;

        if (moneda === "Bolívares" || moneda === "Pesos") {
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

  beforeMount() {
    this.fechaConsultaInicio = this.nowDate();
    this.fechaConsultaFin = this.nowDate();
  },

  mounted() {
    // this.getOrdenes()
    this.getPagos();
  },
};
</script>