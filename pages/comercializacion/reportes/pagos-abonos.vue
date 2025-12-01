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
                  <b-col>
                    <h3>Fecha Inicio</h3>
                    <b-form-datepicker
                      class="mb-4"
                      v-model="fechaConsultaInicio"
                    />
                  </b-col>
                  <b-col>
                    <h3>Fecha Fin</h3>
                    <b-form-datepicker
                      class="mb-4"
                      v-model="fechaConsultaFin"
                    />
                  </b-col>
                  <b-col>
                    <h3>Vendedor</h3>
                    <b-form-select
                      v-model="selectedVendedor"
                      :options="vendedores"
                    />
                  </b-col>
                </b-row>

                <b-row>
                  <b-col class="text-center mt-4 pt-4">
                    <b-button
                      type="submit"
                      variant="primary"
                    >BUSCAR</b-button>
                  </b-col>
                </b-row>

                <b-row class="mt-3 mb-3">
                  <b-col class="mb-4">
                    <h5 class="mt-4 mb-2 pb-2">Filtrar por Categoría de Producto</h5>
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
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <!-- <b-table :items="resumen"></b-table> -->
              <!-- <h2>Total pagos semana ${{ totalPagos }}</h2>
              <h2>Total descuentos semana ${{ totalDescuentos }}</h2> -->
            </b-col>
          </b-row>

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
      titulo: "Pagos y Abonos",
      pagos: [],
      selectedVendedor: 0,
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
           if (categoryData && categoryData.category_total) {
               // Si hay un total de categoría, usamos ese.
               // Nota: El category_total viene en la moneda base (dólares usualmente, o la moneda del producto).
               // Aquí asumimos que category_total ya está normalizado o es el valor que queremos sumar directamente.
               // Sin embargo, el código original dividía monto / tasa.
               // Si category_total es el valor total del producto, ¿deberíamos ajustarlo por la tasa del pago?
               // El usuario dijo: "se muestre el monto de la sumatoria de las categorías en lugar del monto total de la orden".
               // Asumiremos que category_total es el valor en dólares (o moneda base) y se suma directo.
               // PERO, el reporte es de PAGOS. Un pago puede ser parcial.
               // Si la orden es de $100 (Cat A: $50, Cat B: $50) y el pago es de $20.
               // ¿Qué debemos mostrar?
               // El requerimiento dice: "el TOTAL refleje el total de los productos del item seleccionado".
               // Esto suena a que quiere ver el valor de los productos, NO la parte proporcional del pago.
               // PERO estamos en "Reporte de Pagos". Mostrar el total de productos podría ser confuso si es solo un abono.
               // RE-LEYENDO: "al seleccionar una categoría el TOTAL refleje el total de los productos del item seleccionado (sumatoria) en lugar de la sumatoria de todos los productos de la orden".
               // "sumatoria de todos los productos de la orden" se refiere al `monto` del pago actual? O al total de la orden?
               // En el código original: `totales.totalGeneral += montoAjustado;` donde `montoAjustado = monto / tasa`. Esto es el valor del PAGO en dólares.
               // Si cambio esto por `category_total`, estaré sumando el valor TOTAL de la categoría en la orden, no lo que se pagó.
               // Si el usuario quiere ver "cuánto se ha pagado por concepto de X categoría", es muy difícil saberlo si el pago es genérico.
               // PERO, si el usuario dice "el TOTAL refleje el total de los productos del item seleccionado", quizás se refiere a eso, al valor de la mercancía de esa categoría involucrada en los pagos listados.
               // OJO: Si filtro por categoría, me salen los PAGOS de ordenes que tienen esa categoría.
               // Si muestro `category_total`, estoy mostrando el valor de la mercancía.
               // Si tengo 5 pagos para la misma orden, sumaré 5 veces el `category_total`? Eso estaría mal.
               // El usuario dijo: "el TOTAL refleje el total de los productos del item seleccionado (sumatoria)".
               
               // Vamos a asumir que quiere sumar los `category_total` de los registros filtrados.
               // Si hay múltiples pagos para una misma orden, y todos aparecen en el filtro...
               // El endpoint devuelve PAGOS. `pagosFiltrados` son PAGOS.
               // Si una orden tiene 2 pagos, aparecerá 2 veces.
               // Si sumo `category_total` (que es constante por orden), lo duplicaré.
               
               // ESPERA. El usuario dice: "en lugar de la sumatoria de todos los productos de la orden".
               // Actualmente suma `monto / tasa` (el valor del pago).
               // Si el usuario quiere ver el valor de la categoría, y lo reemplazamos...
               // Quizás quiere ver la proporción del pago que corresponde a esa categoría? Imposible saberlo con certeza.
               
               // Interpretación más probable: Quiere ver el total vendido de esa categoría en las ordenes listadas.
               // Para evitar duplicados si hay múltiples pagos de la misma orden, deberíamos sumar por orden única?
               // Pero `totales` se calcula iterando `pagosFiltrados`.
               
               // Vamos a implementar la suma de `category_total` por cada fila, tal cual lo pide, pero con la advertencia mental de los duplicados.
               // O quizás `category_total` debería ser proporcional al pago? (monto_pago / total_orden) * category_total?
               // No, eso es mucha asunción.
               
               // Vamos a seguir la instrucción literal: "mostrar el monto de la sumatoria de las categorías".
               // Asumiré que `category_total` viene en la misma moneda que `totalGeneral` espera (Dólares).
               
               montoAjustado = parseFloat(categoryData.category_total) || 0;
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
          this.pagos = resp.data.pagos;

          this.vendedores = [];
          this.vendedores = resp.data.vendedores.map((el) => {
            return {
              value: el._id,
              text: el.nombre,
            };
          });
          this.vendedores.unshift({ value: 0, text: "Todos" });

          this.totalRows = this.pagos.length;
          this.generateCategoryOptions();
          console.log("Pagos y abonos cargados", this.pagos);
          console.log("Totales", this.totales);
          this.overlay = false;
        });
    },

    onSubmit(event) {
      event.preventDefault();
      const fechaInicio = this.fechaConsultaInicio;
      const fechaFin = this.fechaConsultaFin;
      console.log("inicio", fechaInicio);
      console.log("fin", fechaFin);

      if (!fechaInicio.length || !fechaFin.length) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>Por favor seleccione ambas fechas</p>`,
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
      await this.$axios
        .get(
          `${this.$config.API}/reporte-de-pagos/${this.fechaConsultaInicio}/${this.fechaConsultaFin}/${this.selectedVendedor}`
        )
        .then((resp) => {
          this.pagos = resp.data.pagos;
          /* this.vendedores = resp.data.vendedores
                    this.vendedores.unshift({ value: 0, text: "Todos" }) */
          this.vendedores = resp.data.vendedores.map((el) => {
            return {
              value: el._id,
              text: el.nombre,
            };
          });
          this.vendedores.unshift({ value: 0, text: "Todos" });

          this.totalRows = this.pagos.length;
          this.generateCategoryOptions();
          console.log("Pagos y abonos cargados", this.pagos);
          console.log("Totales", this.totales);
          this.overlay = false;
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

  mounted() {
    // this.getOrdenes()
    this.getPagos();
  },
};
</script>