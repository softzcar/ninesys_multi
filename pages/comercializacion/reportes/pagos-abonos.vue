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

                      <h3 class="text-right mt-2 mb-4">
                        TOTAL: {{ totales.totalGeneral }}
                      </h3>

                      <b-table
                        sort-icon-left
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
                          {{ data.item.monto.toFixed(2) }}
                        </template>

                        <template #cell(tasa)="data">
                          {{ data.item.tasa.toFixed(2) }}
                        </template>

                        <template #cell(_id)="data">
                          {{
                                                  usdConverter(
                                                      data.item.moneda,
                                                      data.item.monto,
                                                      data.item.tasa
                                                  )
                                              }}
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
      titulo: "Pagos y Abonos",
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
          key: "_id",
          label: "Total $",
        },
        {
          key: "detalle",
          label: "Detalles",
        },
        {
          key: "moneda",
          label: "Moneda",
          sortable: true,
        },
        {
          key: "monto",
          label: "Monto",
          sortable: true,
        },
        {
          key: "tasa",
          label: "Tasa",
          sortable: true,
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
      ],
      ordenes: [],
    };
  },

  computed: {
    ...mapState("login", ["dataUser", "access"]),
    pagosFiltrados() {
      if (this.selectedCategory === 'Todas' || !this.selectedCategory) {
        return this.pagos;
      }
      return this.pagos.filter(pago => 
        pago.product_categories && pago.product_categories.some(cat => cat.category_name === this.selectedCategory)
      );
    },
    totales() {
      const totales = {
        porMetodoPago: {},
        totalGeneral: 0,
      };

      this.pagosFiltrados.forEach((item) => {
        const { metodo_pago, monto, tasa, product_categories } = item;
        let montoAjustado = 0;

        if (this.selectedCategory !== 'Todas' && this.selectedCategory && product_categories) {
           const categoryData = product_categories.find(cat => cat.category_name === this.selectedCategory);
           if (categoryData && categoryData.category_total && item.total_orden) {
                // Monto Proporcional = (Total Categoría / Total Orden) * (Monto Pago / Tasa)
                const totalCategoria = parseFloat(categoryData.category_total) || 0;
                const totalOrden = parseFloat(item.total_orden) || 1; // Evitar división por cero
                const montoPagoEnUsd = monto / tasa;
                
                montoAjustado = (totalCategoria / totalOrden) * montoPagoEnUsd;
           } else {
                montoAjustado = 0;
           }
        } else {
            montoAjustado = monto / tasa;
        }

        totales.totalGeneral += montoAjustado;
        if (!totales.porMetodoPago[metodo_pago]) {
          totales.porMetodoPago[metodo_pago] = 0;
        }
        totales.porMetodoPago[metodo_pago] += montoAjustado;
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
      const allCategories = this.pagos.flatMap(pago => 
        pago.product_categories ? pago.product_categories.map(cat => cat.category_name) : []
      );
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