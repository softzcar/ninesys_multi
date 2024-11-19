<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-row>
        <b-col class="mb-4">
          <span class="floatme" style="margin-right: 0.8rem">
            <b-button variant="primary" @click="imprimir">Imprimir</b-button>
          </span>

          <span class="floatme">
            <diseno-viewImage :id="this.id" />
          </span>
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
                      <h1>NOMBRE EMPRESA</h1>
                      <p>Dirección de la empresa.</p>
                      <p>
                        El Vigía. Edo. Mérida. Telef: 0275 8821920 | 0414
                        7495435
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
                      <strong>CORREO:</strong> {{ resOrden.customer.email }}
                    </td>
                  </tr>
                </table>
              </th>
              <td>
                <table class="table-header">
                  <tr>
                    <td>
                      <h1>ORDEN # {{ resOrden.orden[0]._id }}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>INICIO: </strong
                      >{{ makeDate(resOrden.orden[0].fecha_inicio) }}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>ENTREGA: </strong
                      >{{ makeDate(resOrden.orden[0].fecha_entrega) }}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>CI | RIF: </strong>{{ resOrden.customer.cedula }}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>TELEFONO: </strong
                      >{{ resOrden.customer.telefono }}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div class="spacer"></div>

          <table class="table-products">
            <th style="text-align: right">ITEM</th>
            <th style="text-align: center">SKU</th>
            <th>PRODUCTO</th>
            <th style="text-align: right">CANT</th>
            <th style="text-align: center">TALLA</th>
            <th>CORTE</th>
            <th>TELA</th>
            <th
              class="hideMe"
              v-if="
                dataUser.departamento === 'Comercialización' ||
                dataUser.departamento === 'Administración'
              "
              style="text-align: right"
            >
              PRECIO
            </th>
            <th
              class="hideMe"
              v-if="
                dataUser.departamento === 'Comercialización' ||
                dataUser.departamento === 'Administración'
              "
              style="text-align: right"
            >
              TOTAL
            </th>

            <template v-for="(product, index) in resOrden.productos">
              <tr class="row-product" :key="product._id">
                <td style="text-align: right">{{ index + 1 }}</td>
                <td style="text-align: center">{{ product.cod }}</td>
                <td>{{ product.name }}</td>
                <td style="text-align: right">{{ product.cantidad }}</td>
                <td style="text-align: center">{{ product.talla }}</td>
                <td>{{ product.corte }}</td>
                <td>{{ product.tela }}</td>
                <td
                  class="hideMe"
                  v-if="
                    dataUser.departamento === 'Comercialización' ||
                    dataUser.departamento === 'Administración'
                  "
                  style="text-align: right"
                >
                  {{ product.precio }}
                </td>
                <td
                  class="hideMe"
                  v-if="
                    dataUser.departamento === 'Comercialización' ||
                    dataUser.departamento === 'Administración'
                  "
                  style="text-align: right"
                >
                  {{
                    (
                      parseFloat(product.precio) * parseFloat(product.cantidad)
                    ).toFixed(2)
                  }}
                </td>
              </tr>
            </template>
          </table>

          <div
            class="spacer hideMe"
            v-if="
              dataUser.departamento === 'Comercialización' ||
              dataUser.departamento === 'Administración'
            "
            style="text-align: right"
          >
            <h2>ABONO: {{ floatMe(resOrden.orden[0].pago_abono) }}</h2>
            <h2>DESCUENTOS: {{ floatMe(resOrden.orden[0].pago_descuento) }}</h2>
            <h2>
              RESTA:
              {{
                parseFloat(
                  montoTotalOrden(form.productos) -
                    resOrden.orden[0].pago_descuento -
                    resOrden.orden[0].pago_abono
                ).toFixed(2)
              }}
            </h2>
            <h1>TOTAL: {{ floatMe(montoTotalOrden(resOrden.productos)) }}</h1>
          </div>

          <div class="spacer">
            <div style="text-align: center; margin-top: 40px">
              <h2>OBSERVACIONES</h2>
            </div>
            <div class="observaciones">
              <h3 style="text-transform: uppercase">
                TIPO DE DISEÑO: {{ tipoDiseno }}
              </h3>
            </div>
            <div
              class="spacer observaciones"
              v-html="resOrden.orden[0].observaciones"
            ></div>
          </div>
        </b-col>
      </b-row>
      <div id="toprint"></div>
    </b-overlay>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import axios from 'axios'
import mixin from '~/mixins/mixins.js'

export default {
  data() {
    return {
      overlay: false,
      nextId: 0,
      show: true,
      output: null,
      preview: false,
    }
  },

  computed: {
    ...mapState('login', ['access', 'dataUser']),
    ...mapGetters('buscar', ['resOrden']),

    tipoDiseno() {
      let miDiseno
      if (Array.isArray(this.resOrden.diseno)) {
        miDiseno = this.resOrden.diseno[0].tipo
      } else {
        miDiseno = this.resOrden.diseno.tipo
      }
      return miDiseno
    },
    form() {
      console.log('FORM:')
      console.dir(this.$store.state.buscar.orden)
      return this.$store.state.buscar.orden
    },
  },

  methods: {
    ...mapActions('buscar', ['getOrden']),

    imprimir() {
      this.printOrder('reporte')
    },

    floatMe(val) {
      return parseFloat(val).toFixed(2)
    },
    montoTotalOrden(productos) {
      if (productos.length > 0) {
        return productos
          .map((item) => {
            return parseFloat(item.precio) * parseFloat(item.cantidad)
          })
          .reduce((acc, curr) => (acc = acc + curr))
      }
    },

    makeDate(date) {
      // Verificar sila fewhca tiene formato antiguo
      let check = date.split('-')
      if (check.length === 1) {
        return date
      }

      let f
      if (!date) {
        let tmp = new Date()
        f = tmp.getDate() + '/' + (tmp.getMonth() + 1) + '/' + tmp.getFullYear()
      } else {
        let tmp = date.split('-')
        f = `${tmp[2]}/${tmp[1]}/${tmp[0]}`
      }

      return f
    },

    async getOrdenNow() {
      await axios
        .get(`${this.$config.API}/buscar/${this.id}`)
        .then((resp) => {
          this.$store.commit('buscar/setOrden', resp.data)
        })
        .catch((err) => {
          this.$fire({
            title: 'Error en la conexión',
            html: `<p>${err}</p>`,
            type: 'danger',
          })
        })
    },
  },

  /* async asyncData({ params, $http }) {
      const post = await this.getOrdenNow()
    }, */

  props: ['id'],
  mounted() {
    this.getOrden(this.id).then(() => {
      console.log('desactivar overlay')
      this.overlay = false
    })
  },

  mixins: [mixin],
}
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
  content: '';
  content: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}
</style>
