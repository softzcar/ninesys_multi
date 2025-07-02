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
                <template #cell(id_orden)="data">
                  <linkSearch :id="data.item.id_orden" />
                </template>
                <template #cell(tipo)="data">
                  {{ data.item.moment }}
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
import axios from "axios";
export default {
  data() {
    return {
      size: "xl",
      title: `Empleado:`,
      overlay: false,
      //   dataTable: [],
      fields: [
        {
          key: "id_orden",
          label: "Orden",
        },
        {
          key: "id_revision",
          label: "Revisión",
        },
        {
          key: "producto",
          label: "Producto",
        },
        /* {
                    key: "detalle_pago",
                    label: "Tipo",
                }, 
                {
                    key: "cantidad",
                    label: "Cantidad",
                },*/
        {
          key: "nombre",
          label: "Empleado",
        },
        {
          key: "departamento",
          label: "Departamento",
        },

        {
          key: "monto_pago",
          label: "Pago",
        },
      ],
    };
  },

  methods: {
    getCantidad(id_orden, id_diseno) {
      // return this.adicionales.filter((el) => el.tipo == tipo && el.id_orden == id_orden)
      return `id: ${id_orden} tipo: ${id_diseno}`;
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

    reloadMe() {
      this.$emit("reload");
    },
  },

  computed: {
    pagoTotal() {
      const total = this.detalles.reduce((acc, curr) => {
        const pagoDecimal = parseFloat(curr.monto_pago);
        return acc + pagoDecimal;
      }, 0);

      console.log("pagoTotal", total);

      return "$" + total.toFixed(2);
    },

    dataTable() {
      const joinData = this.detalles.map((el) => {
        let arr = {
          Orden: el.id_orden,
          Tipo: el.tipo,
        };
      });
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },

  props: [
    "id_empleado",
    "detalles",
    "reload",
    "item",
    "adicionales",
    "showbutton",
  ],
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
