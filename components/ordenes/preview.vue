<template>
    <div>
        <div v-if="!editingOrderId || (form && form.nombre)">
            <b-row>
                <b-col>
                    <table class="table-main table-header">
                        <tr>
                            <th>
                                <table class="table-header">
                                    <tr>
                                        <td>
                                            <h2>
                                                {{ this.$config.EMPRESA.nombre }}
                                            </h2>
                                            <p>
                                                {{ this.$config.EMPRESA.direccion }}
                                            </p>
                                            <p>{{ this.$config.EMPRESA.email }}</p>
                                            <p>
                                                {{ this.$config.EMPRESA.telefono }}
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>CLIENTE: </strong
                                            >{{
                                            form.nombre + "  " + form.apellido
                                        }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>DIRECCIÓN:</strong>
                                            {{ form.direccion }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>CORREO:</strong>
                                            {{ form.email }}
                                        </td>
                                    </tr>
                                </table>
                            </th>
                            <td>
                                <table class="table-header">
                                    <tr>
                                        <td>
                                            <h1>ORDEN # {{ editingOrderId ? editingOrderId : nextId }}</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>INICIO: </strong
                                            >{{ makeDate() }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>ENTREGA: </strong
                                            >{{ makeDate(form.fechaEntrega) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>CI | RIF: </strong
                                            >{{ form.cedula }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>TELEFONO: </strong
                                            >{{ form.telefono }}
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

                        <template v-for="product in form.productos">
                            <tr class="row-product" :key="product.cod">
                                <!-- <td style="text-align: right">{{ index + 1 }}</td> -->
                                <!-- <td style="text-align: center">
                                    {{ product.cod }}
                                </td> -->
                                <td>{{ product.producto }}</td>
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
                                        dataUser.departamento ===
                                            'Comercialización' ||
                                        dataUser.departamento === 'Administración'
                                    "
                                    style="text-align: right"
                                >
                                    {{ product.precio }}
                                </td>
                                <td
                                    class="hideMe"
                                    v-if="
                                        dataUser.departamento ===
                                            'Comercialización' ||
                                        dataUser.departamento === 'Administración'
                                    "
                                    style="text-align: right"
                                >
                                    {{
                                        (
                                            parseFloat(product.precio) *
                                            parseFloat(product.cantidad)
                                        ).toFixed(2)
                                    }}
                                </td>
                            </tr>
                        </template>
                    </table>

                    <div class="izquierda">
                        <h2>
                            TOTAL PRODUCTOS:
                            {{ totalProductos(form.productos, "cantidad") }}
                        </h2>
                    </div>

                    <div
                        class="spacer hideMe derecha"
                        style="width: 100% !important"
                        v-if="
                            dataUser.departamento === 'Comercialización' ||
                            dataUser.departamento === 'Administración'
                        "
                    >
                        <h2>ABONO: {{ floatMe(form.abono) }}</h2>
                        <h2>DESCUENTOS: {{ floatMe(form.descuento) }}</h2>
                        <h2>
                            RESTA:
                            {{
                                (
                                    parseFloat(montoTotalOrden(form.productos) || 0) -
                                    parseFloat(form.abono || 0) -
                                    parseFloat(form.descuento || 0)
                                ).toFixed(2)
                            }}
                        </h2>
                        <h1>
                            TOTAL: {{ floatMe(montoTotalOrden(form.productos) || 0) }}
                        </h1>
                    </div>

                    <div class="spacer">
                        <div style="text-align: center; margin-top: 40px">
                            <h2>OBSERVACIONES</h2>
                        </div>
                        <div class="observaciones">
                            <h3 style="text-transform: uppercase">
                                TIPO DE DISEÑO: {{ form.diseno }}
                            </h3>
                        </div>
                        <div class="spacer observaciones" v-html="form.obs"></div>
                    </div>
                </b-col>
            </b-row>
            <div id="toprint"></div>
        </div>
        <div v-else>
            <b-alert show variant="info">
                <strong>Orden no encontrada.</strong> No se ha podido encontrar el número de orden especificado. Por favor, verifique el número e intente de nuevo.
            </b-alert>
        </div>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"
import { mapState, mapMutations } from "vuex"

export default {
    data() {
        return {
            nextId: 0,
            show: true,
            output: null,
            preview: false,
            formx: {
                id: 205,
                cedula: "",
                nombre: "",
                apellido: "",
                telefono: "",
                email: "",
                direccion: "",
                fechaEntrega: "",
                productos: [
                    {
                        item: 0,
                        cod: 0,
                        producto: "",
                        existencia: null,
                        cantidad: "0",
                        talla: "",
                        corte: "",
                        precio: "",
                    },
                ],
                obs: "",
                abono: "0",
                diseno: "",
            },
        }
    },

    computed: {
        ...mapState("buscar", ["id_orden", "result"]),
        ...mapState("login", ["access", "dataUser"]),
    },

    methods: {
        ...mapMutations("buscar", ["setResult"]),

        floatMe(val) {
            return parseFloat(val).toFixed(2)
        },
        montoTotalOrden(productos) {
            if (productos && productos.length > 0) {
                return productos
                    .map((item) => {
                        let miPrecio = parseFloat(item.precio);
                        if (isNaN(miPrecio)) miPrecio = 0;
                        return miPrecio * parseFloat(item.cantidad);
                    })
                    .reduce((acc, curr) => acc + curr, 0); // Initialize reduce with 0
            }
            return 0; // Return 0 if no products
        },

        makeDate(date) {
            let f
            if (!date) {
                let tmp = new Date()
                f =
                    tmp.getDate() +
                    "/" +
                    (tmp.getMonth() + 1) +
                    "/" +
                    tmp.getFullYear()
            } else {
                let tmp = date.split("-")
                f = `${tmp[2]}/${tmp[1]}/${tmp[0]}`
            }

            return f
        },
        async nextIdOrden() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/next-id-order`)
                .then((res) => {
                    this.nextId = res.data.id
                })
                .catch((err) => {
                    console.error("Error consultado nextIdOrden", err)
                })
                .finally(() => {
                    this.overlay = false
                })
        },
    },

    mounted() {
        if (this.showpreview) this.preview = true
        this.nextIdOrden()
    },
    mixins: [mixin],
    props: ["form", "showpreview", "go", "editingOrderId"],
}
</script>

<style scoped>
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
</style>