<template>
  <div>
    <!-- <b-button variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="journal-code"></b-icon>
        </b-button> -->
    <a href="#" @click="$bvModal.show(modal)">
      {{ item.nombre }}
    </a>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-overlay :show="overlay" spinner-small>
        <b-container fluid>
          <b-row>
            <b-col>
              <div class="floatme" style="width: 100%; margin-bottom: 20px">
                <span v-if="showbutton != 'false'">
                  <b-button
                    @click="pagarEmpleado(item.id_empleado)"
                    variant="success"
                    >PAGAR {{ pagoTotal }}</b-button
                  >
                  <!-- {{ item.pago }} -->
                </span>

                <span
                  style="font-size: 1.4rem; font-weight: bold; padding: 12px"
                >
                  Total piezas {{ obtenerTotales(detalles) }}
                </span>
              </div>
            </b-col>
          </b-row>
          <b-row class="justify-content-md-center">
            <b-col>
              <b-table
                responsive
                small
                striped
                :items="detalles"
                :fields="fields"
              >
                <template #cell(orden)="data">
                  <linkSearch :id="data.item.orden" />
                </template>
                <template #cell(porcentaje)="data">
                  <admin-ComisionesProductosInput
                    :item="data.item"
                    :idprod="filterProd(data.item.id_woo, 'cod')"
                    :attributes="filterProd(data.item.id_woo, 'attributes')"
                    :categories="filterProd(data.item.id_woo, 'categories')"
                    @reload="reloadMe"
                    :lock="data.item.fecha_pago"
                    :departamento="data.item.departamento"
                    :comisionEmp="data.item.comision"
                  />
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      size: "xl",
      title: `Empleado: ${this.item.nombre}`,
      overlay: false,
      dataTable: [],
      fields: [
        {
          key: "orden",
          label: "Orden",
        },
        /* {
                    key: "producto",
                    label: "Producto",
                },
                {
                    key: "talla",
                    label: "Talla",
                }, */
        {
          key: "nombre",
          label: "Empleado",
        },
        {
          key: "departamento",
          label: "Departamento",
        },
        {
          key: "dia",
          label: "Día",
        },
        {
          key: "semana",
          label: "Semana",
        },
        {
          key: "comision_tipo",
          label: "Tipo",
        },
        {
          key: "cantidad",
          label: "Cantidad",
        },
        {
          key: "porcentaje",
          label: "Comisión",
        },
        {
          key: "pago",
          label: "Pago",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "fecha",
          label: "Fecha",
        },
      ],
    };
  },

  methods: {
    obtenerTotales(pagos) {
      // Verificar que el parámetro sea un array
      if (!Array.isArray(pagos)) {
        throw new Error("El parámetro debe ser un array de objetos.");
      }

      let sumatoriaCantidad = 0; // Para almacenar la suma de las cantidades

      // Recorrer cada objeto en el array
      pagos.forEach((pago) => {
        // Convertir el campo "cantidad" de string a entero
        const cantidad = parseInt(pago.cantidad, 10);

        // Verificar que la conversión sea válida
        if (isNaN(cantidad)) {
          throw new Error(
            `El campo "cantidad" no es un número válido en el objeto: ${JSON.stringify(
              pago
            )}`
          );
        }

        // Sumar la cantidad a la sumatoria
        sumatoriaCantidad += cantidad;
      });

      // Retornar el resultado en un objeto JSON
      return sumatoriaCantidad;
    },
    reloadMe() {
      this.$emit("reload");
    },

    async pagarEmpleado() {
      this.overlay = true;

      const idPagos = this.detalles.map((el) => {
        return el.id_pago;
      });
      const data = new URLSearchParams();
      data.set("id_pagos", idPagos);

      await this.$axios
        .post(`${this.$config.API}/pagos/pagar-a-empleados`, data)
        .then((res) => {
          console.log("$sql ejecutar pagos", res.data.sql);
          // this.resetForm()
          /* this.$emit('reload', 'true')
          this.$bvModal.hide(this.modal)
          this.overlay = false */
        })
        .catch((err) => {
          this.$fire({
            title: "Error en pago",
            html: `<p>Algo salió mal al procesar los pagos</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
          this.reloadMe();
          this.$bvModal.hide(this.modal);
        });

      console.log(
        "Vamos a pagar los siguientes registros de la tabla pagos:",
        idPagos
      );
      return idPagos;
    },

    filterProd(id_woo, campo) {
      console.log("Props", this.$props);
      console.log("id_woo", id_woo);
      console.log("campo", campo);
      console.log("----------------");
      // let myProd = this.products.filter((el) => el.cod === parseInt(id_woo))
      // return myProd[0][campo]
    },
    reloadMe() {
      this.$emit("reload");
    },
  },

  computed: {
    pagoTotal() {
      const total = this.detalles.reduce((acc, curr) => {
        const pagoDecimal = parseFloat(curr.pago);
        return acc + pagoDecimal;
      }, 0);

      console.log("pagoTotal", total);

      return "$" + total.toFixed(2);
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },

  props: ["item", "detalles", "products", "reload", "showbutton"],
};
</script>

<style>
.float-button {
  width: 100%;
  float: left;
  margin-bottom: 40px;
  margin-top: 1rem;
}

.image img {
  width: auto;
}
</style>
