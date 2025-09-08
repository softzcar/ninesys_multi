<template>
  <div>
    <div v-if="error" class="text-center p-5">
        <b-alert show variant="danger">
            <h4>Error al Cargar la Orden</h4>
            <p>{{ error }}</p>
            <b-button @click="loadOrderData" variant="primary">Reintentar</b-button>
        </b-alert>
    </div>
    <b-overlay
      v-else
      :show="overlay"
      spinner-small
      rounded="sm"
    >
      <template #overlay>
        <div class="text-center p-3 bg-white rounded">
          <b-spinner label="Cargando..."></b-spinner>
          <p style="margin-top: 1rem;">Cargando los datos de la orden...</p>
        </div>
      </template>

      <div v-if="resOrden && resOrden.orden && resOrden.orden[0] && resOrden.orden[0]._id !== '0'" class="table-wrapper">
        <b-row>
          <b-col class="mb-4">
            <span
              class="floatme"
              style="margin-right: 0.8rem"
            >
              <b-button
                variant="primary"
                @click="imprimir"
              >Imprimir</b-button>
            </span>
            <span class="floatme">
              <diseno-viewImage :id="orderId" />
            </span>
            <span
              v-if="
                      dataUser.departamento === 'Comecialización' ||
                      dataUser.departamento === 'Administración'
                    "
              class="floatme"
            >
              <b-button-group
                v-if="activeCurrencies.length"
                size="sm"
              >
                <b-button
                  v-for="currency in activeCurrencies"
                  :key="currency.moneda"
                  :variant="selectedCurrency === currency.moneda ? 'primary' : 'outline-primary'"
                  @click="handleCurrencySelection(currency)"
                >{{ currency.mondeda_nombre }}</b-button>
              </b-button-group>
            </span>
          </b-col>
        </b-row>
        <b-row v-if="selectedCurrency !== 'dolar'">
          <b-col>
            <b-alert
              show
              variant="info"
              class="mt-2 pt-2 pb-2 text-center"
            >Mostrando montos en <strong>{{ selectedCurrencyInfo.mondeda_nombre }}</strong>. Tasa de cambio referencial: 1 USD = {{ currentRate }} {{ currencySymbol }}</b-alert>
          </b-col>
        </b-row>

        <b-row id="reporte">
          <b-col>
            <table class="table-main table-header">
              <tr>
                <th>
                  <table class="table-header">
                    <tr>
                      <td>
                        <h1>
                          {{ this.$store.state.login.dataEmpresa.nombre }}
                        </h1>
                        <p>
                          {{ this.$store.state.login.dataEmpresa.direccion }}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>CLIENTE: </strong>{{ resOrden.customer.nombre }}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>DIRECCIÓN:</strong>
                        {{ resOrden.customer.direccion }}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>CORREO:</strong>
                        {{ resOrden.customer.email }}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>VENDEDOR:</strong>
                        {{ resOrden.orden[0].vendedor }}
                      </td>
                    </tr>
                  </table>
                </th>
                <td>
                  <table class="table-header">
                    <tr>
                      <td>
                        <h1>
                          ORDEN #
                          {{ resOrden.orden[0]._id }}
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>INICIO: </strong>{{ makeDate(resOrden.orden[0].fecha_inicio) }}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>ENTREGA: </strong>{{ makeDate(resOrden.orden[0].fecha_entrega) }}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>CI | RIF: </strong>{{ resOrden.customer.cedula }}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>TELEFONO: </strong><span v-html="whatsAppMe(resOrden.customer.telefono, false)"></span>
                        <!-- {{ whatsAppMe(resOrden.customer.telefono) }} -->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <div class="spacer"></div>

            <table class="table-products">
              <!-- <th style="text-align: right">ITEM</th> -->
              <!-- <th style="text-align: center">SKU</th> -->
              <th>PRODUCTO</th>
              <th style="text-align: right">CANT</th>
              <th style="text-align: center">TALLA</th>
              <th>CORTE</th>
              <th>TELA</th>
              <th>ATRIBUTO</th>
              <th
                class="hideMe"
                v-if="
                  dataUser.departamento === 'Comecialización' ||
                  dataUser.departamento === 'Administración'
                "
                style="text-align: right"
              >
                PRECIO
              </th>
              <th
                class="hideMe"
                v-if="
                  dataUser.departamento === 'Comecialización' ||
                  dataUser.departamento === 'Administración'
                "
                style="text-align: right"
              >
                TOTAL
              </th>

              <template v-for="product in resOrden.productos">
                <tr
                  class="row-product"
                  :key="product._id"
                >
                  <!-- <td style="text-align: right">
                                        {{ index + 1 }}
                                    </td> -->
                  <!-- <td style="text-align: center">
                                        {{ product.cod }}
                                    </td> -->
                  <td>{{ product.name }}</td>
                  <td style="text-align: right">
                    {{ product.cantidad }}
                  </td>
                  <td style="text-align: center">
                    {{ product.talla }}
                  </td>
                  <td>{{ product.corte }}</td>
                  <td>{{ product.tela }}</td>
                  <td>{{ product.atributo_nombre || 'N/A' }}</td>
                  <td
                    class="hideMe"
                    v-if="
                      dataUser.departamento === 'Comecialización' ||
                      dataUser.departamento === 'Administración'
                    "
                    style="text-align: right"
                  >
                    {{ currencySymbol }} {{ convertAndFormat(product.precio) }}
                  </td>
                  <td
                    class="hideMe"
                    v-if="
                      dataUser.departamento === 'Comecialización' ||
                      dataUser.departamento === 'Administración'
                    "
                    style="text-align: right"
                  >
                    {{ currencySymbol }}
                    {{
                      convertAndFormat(
                        parseFloat(product.precio) * parseFloat(product.cantidad)
                      )
                    }}
                  </td>
                </tr>
              </template>
            </table>

            <div class="izquierda">
              <h2>
                TOTAL PRODUCTOS:
                {{ totalProductos(resOrden.productos, "cantidad") }}
              </h2>
            </div>

            <div
              class="spacer hideMe derecha"
              v-if="
                dataUser.departamento === 'Comecialización' ||
                dataUser.departamento === 'Administración'
              "
              style="width: 100% !important"
            >
              <h2>
                ABONO:
                {{ currencySymbol }} {{ convertAndFormat(resOrden.orden[0].pago_abono) }}
              </h2>
              <h2>
                DESCUENTOS:
                {{ currencySymbol }} {{ convertAndFormat(resOrden.orden[0].pago_descuento) }}
              </h2>
              <h2>
                RESTA:
                {{ currencySymbol }}
                {{
                  convertAndFormat(
                    montoTotalOrden(resOrden.productos) -
                      resOrden.orden[0].pago_descuento -
                      resOrden.orden[0].pago_abono
                  )
                }}
              </h2>
              <h1>
                TOTAL:
                {{ currencySymbol }}
                {{ convertAndFormat(montoTotalOrden(resOrden.productos)) }}
              </h1>
            </div>

            <div class="spacer">
              <div style="text-align: center; margin-top: 40px">
                <h2 class="mb-2">OBSERVACIONES</h2>
              </div>

              <div v-if="tmpImage.length > 0">
                <hr>
                <h3 class="text-center">Diseño Aprobado</h3>
                <b-img-lazy :src="tmpImage" class="mt-4" fluid-grow></b-img-lazy>
                <hr>
              </div>

              <div class="observaciones">
                <!-- <disenosse-imagesGalery
                  :images="tmpImage"
                  showdelete="false"
                  :idorden="resOrden.orden[0]._id"
                />-->
              </div> 

              <!-- <div class="observaciones">
                                <h3 style="text-transform: uppercase">
                                    TIPO DE DISEÑO: {{ tipoDiseno }}
                                </h3>
                            </div> -->
              <b-overlay :show="overlayObservaciones" spinner-small rounded="sm">
                <template #overlay>
                  <div class="text-center">
                    <b-spinner small label="Cargando..."></b-spinner>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">Cargando observaciones...</p>
                  </div>
                </template>
                <div
                  class="spacer observaciones"
                  v-html="observaciones"
                ></div>
              </b-overlay>
            </div>
          </b-col>
        </b-row>
        <div id="toprint"></div>
      </div>
      <div v-else-if="!overlay">
          <b-alert show variant="info" class="order-not-found-alert">
              <strong>Orden no encontrada.</strong> No se ha podido encontrar la orden con el número <strong>{{ orderId }}</strong>. Por favor, verifique el número e inténtelo de nuevo.
          </b-alert>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import mixin from "~/mixins/mixins.js";

export default {
  data() {
    return {
      tmpImage: [],
      overlay: true,
      overlayObservaciones: true,
      nextId: 0,
      show: true,
      output: null,
      preview: false,
      selectedCurrency: "dolar",
      imageAbortController: null, // Added for request cancellation
      error: null
    };
  },

  props: {
    id: {
      type: [String, Number],
      default: null,
    },
  },

  computed: {
    ...mapState("login", ["access", "dataUser", "dataEmpresa", "tasas"]),
    ...mapGetters("buscar", ["resOrden"]),
    ...mapState("buscar", ["observaciones"]),
    orderId() {
      // Usa el prop 'id' si está disponible, si no, usa el de la ruta.
      return this.id || this.$route.params.id;
    },
    form() {
      console.log("FORM:");
      console.dir(this.$store.state.buscar.orden);
      return this.$store.state.buscar.orden;
    },
    activeCurrencies() {
      if (this.dataEmpresa && this.dataEmpresa.tipos_de_monedas) {
        return this.dataEmpresa.tipos_de_monedas.filter((c) => c.activo);
      }
      return [];
    },
    currentRate() {
      if (this.tasas && this.selectedCurrency) {
        return this.tasas[this.selectedCurrency] || 1;
      }
      return 1;
    },
    currencySymbol() {
      const symbols = {
        dolar: "$",
        euro: "€",
        bolivar: "Bs.",
        peso_colombiano: "COP",
      };
      return symbols[this.selectedCurrency] || "$";
    },
    selectedCurrencyInfo() {
      if (!this.activeCurrencies) {
        return {};
      }
      return (
        this.activeCurrencies.find((c) => c.moneda === this.selectedCurrency) ||
        {}
      );
    },
  },

  methods: {
    ...mapActions("buscar", ["getOrden", "getObservaciones"]),

    loadOrderData() {
        this.$store.commit("buscar/clearData");

        this.overlay = true;
        this.error = null;
        this.overlayObservaciones = true;

      this.getOrden(this.orderId).then(() => {
        // this.getImagenAprobada(this.orderId)
        })
          .catch((err) => {
            console.error('Error al buscar la orden:', err);
            this.error = 'No se pudieron cargar los datos de la orden. Por favor, inténtelo de nuevo más tarde.';
          })
          .finally(() => {
            this.overlay = false;
          });

        this.getImagenAprobada(this.orderId);

        this.getObservaciones(this.orderId)
          .then(() => {
            this.overlayObservaciones = false;
          });
    },

    handleCurrencySelection(currency) {
      this.selectedCurrency = currency.moneda;
      console.log("Moneda seleccionada:", this.selectedCurrency);
    },

    async getImagenAprobada(idOrden) {
      this.$axios
        .get(
          `${this.$config.CDN}/?id_orden=${idOrden}&id_empresa=${this.$store.state.login.dataEmpresa.id}`
        )
        .then((res) => {
          if (res.data.url === 'images/no-image.png') {
            this.tmpImage = ''
          } else {
            let token = this.token();
            this.tmpImage = `${this.$config.CDN}/${res.data.url}?_=${token}`;
          }
        })
        .catch((err) => {
          console.error("error al traer la imagen", err);
          this.tmpImage = "";
        });
    },

    /* async getImages(idOrderImg) {
      if (this.imageAbortController) {
        this.imageAbortController.abort();
      }
      this.imageAbortController = new AbortController();
      this.$axios
        .get(`${this.$config.API}/disenos/images/${this.orderId}`, {
          signal: this.imageAbortController.signal,
        })
        .then((res) => {
          console.log(`Imágenes encontradas`, res);
          this.tmpImage = res.data;
        })
        .catch((err) => {
          if (this.$axios.isCancel(err)) {
            console.log('Request canceled', err.message);
            return;
          }
          console.error(`El cdn respondio con un error`, err);
          this.tmpImage = [`${this.$config.API}/images/no-image.png`];
        });
    }, */

    imprimir() {
      this.printOrder("reporte");
    },

    floatMe(val) {
      return parseFloat(val).toFixed(2);
    },

    convertAndFormat(valueInDollars) {
      if (isNaN(parseFloat(valueInDollars))) {
        return "0.00";
      }
      const convertedValue = parseFloat(valueInDollars) * this.currentRate;
      return convertedValue.toFixed(2);
    },
    montoTotalOrden(productos) {
      if (productos.length > 0) {
        return productos
          .map((item) => {
            return parseFloat(item.precio) * parseFloat(item.cantidad);
          })
          .reduce((acc, curr) => (acc = acc + curr));
      }
    },

    makeDate(date) {
      // Verificar sila fewhca tiene formato antiguo
      let check = date.split("-");
      if (check.length === 1) {
        return date;
      }

      let f;
      if (!date) {
        let tmp = new Date();
        f =
          tmp.getDate() + "/" + (tmp.getMonth() + 1) + "/" + tmp.getFullYear();
      } else {
        let tmp = date.split("-");
        f = `${tmp[2]}/${tmp[1]}/${tmp[0]}`;
      }

      return f;
    },

    async getOrdenNow() {
      await this.$axios
        .get(`${this.$config.API}/buscar/${this.orderId}`)
        .then((resp) => {
          this.this.tmpImage = [];
          this.getImagenAprobada(this.orderId);
          this.$store.commit("buscar/clearOrden");
          this.$store.commit("buscar/setOrden", resp.data);
        })
        .catch((err) => {
          this.$fire({
            title: "Error en la conexión",
            html: `<p>${err}</p>`,
            type: "danger",
          });
        });
    },
  },

  /* async asyncData({ params, $http }) {
    const post = await this.getOrdenNow()
  }, */
  mounted() {
    this.loadOrderData();
  },

  mixins: [mixin],

  beforeDestroy() {
    if (this.imageAbortController) {
      this.imageAbortController.abort();
    }
  },
};
</script>

<style scoped>
h1,
h2,
h3 {
  font-size: 1rem !important;
}

.report * {
  font-family: Arial, Helvetica, sans-serif;
}

.report {
  padding: 2rem;
}

.observaciones {
  padding: 1.85rem;
}

.printMe {
  width: 100%;
  text-align: right;
}

.spacer {
  width: 100%;
  margin-bottom: 2rem;
}

.table-main,
.table-products {
  width: 100%;
}

.table-main tr td,
.table-products tr th td {
  padding: 0.25rem;
}

.table-products th {
  font-weight: bold;
  padding: 0.25rem;
  border-top: solid 1px rgb(119, 112, 112);
  border-bottom: solid 1px #000;
}

.table-products tr td {
  padding: 0.25rem 0.4rem;
}

@media print {
  .table-header * {
    border: solid 1px #fff;
  }

  .hideMe {
    display: none;
  }

  .printMe {
    visibility: hidden;
  }
}

.table-products {
  border-bottom: solid 1px #000;
}

@page {
  size: landscape;
}

@media screen {
  /* Contenido del fichero home.css */
}

@media print {
  .noPrint {
    display: none;
  }
}

/* RESET STYLES */
/* http://meyerweb.com/eric/tools/css/reset/
v2.0 | 20110126
License: none (public domain)
*/

html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
}

/* HTML5 display-role reset for older browsers */
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section {
  display: block;
}

body {
  line-height: 1;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: bold;
}

strong {
  font-weight: bold;
}

ol,
ul {
  list-style: none;
}

blockquote,
q {
  quotes: none;
}

blockquote:before,
blockquote:after,
q:before,
q:after {
  content: "";
  content: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.table-header {
  width: 100%;
}

.order-not-found-alert {
  padding: 1rem;
}
</style>