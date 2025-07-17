<template>
  <div>
    <!-- <b-button variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="journal-code"></b-icon>
        </b-button> -->
    <a
      href="#"
      @click="$bvModal.show(modal)"
    >
      {{ item.nombre }}
    </a>

    <b-modal
      :size="size"
      :title="title"
      :id="modal"
      hide-footer
    >
      <b-overlay
        :show="overlay"
        spinner-small
      >
        <b-container fluid>
          <b-row>
            <b-col>
              <div
                class="floatme"
                style="width: 100%; margin-bottom: 20px"
              >
                <span v-if="showbutton != 'false'">
                  <b-button
                    @click="pagarEmpleado(item.id_empleado)"
                    variant="success"
                  >PAGAR {{ item.pago }}</b-button>
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
                <template #cell(pago)="data">
                  $ {{ formatNumber(data.item.pago) }}
                </template>

                <!-- <template #cell(pago)="data">
                  $ {{ formatNumber(data.item.pago) }}
                </template> -->
                <template #cell(comsion_vendedor)="data">
                  <!-- $ {{ formatNumber(data.item.comsion_vendedor) }} -->
                  ${{ data.item.pago }}
                </template>
                <template #cell(id_orden)="data">
                  <linkSearch
                    class="floatme"
                    :id="data.item.id_orden"
                  />
                  <diseno-viewImage
                    class="floatme"
                    :id="data.item.id_orden"
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
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],
  data() {
    return {
      size: "xl",
      title: `Empleado: ${this.item.nombre}`,
      overlay: false,
      dataTable: [],
      fields: [
        {
          key: "id_orden",
          label: "Orden",
          thClass: "text-center",
          tdClass: "text-center",
        },
        {
          key: "nombre",
          label: "Vendedor",
        },
        {
          key: "comision_tipo",
          label: "Tipo",
        },
        {
          key: "comision",
          label: "Comisión",
        },
        {
          key: "monto_abonado",
          label: "Monto",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "pago",
          label: "Monto Pagado",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "fecha_de_pago",
          label: "Fecha P",
        },
      ],
      /* fields2: [
        {
          key: 'id_orden',
          label: 'Orden',
          thClass: 'text-center',
          tdClass: 'text-center',
        },
        {
          key: 'nombre',
          label: 'Vendedor',
        },
        {
          key: 'pago',
          label: 'Monto Pagado',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
        {
          key: 'metodo_pago',
          label: 'Método',
          thClass: 'pl-4',
          tdClass: 'pl-4',
        },
        {
          key: 'moneda',
          label: 'Moneda',
        },
        {
          key: 'comsion_vendedor',
          label: 'Comisión',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
        {
          key: 'tipo_de_pago',
          label: 'Detalle',
        },
        {
          key: 'fecha_de_pago',
          label: 'Fecha',
        },
      ], */
    };
  },

  methods: {
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

    filterProd(id_woo, campo) {
      let myProd = this.products.filter((el) => el.cod === parseInt(id_woo));
      return myProd[0][campo];
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
