<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <b-button
        variant="warning"
        @click="$bvModal.show(modal)"
      >
        <b-icon icon="skip-backward-fill"></b-icon>
      </b-button>
    </b-overlay>

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
        <b-container>
          <b-row>
            <b-col
              xl="6"
              lg="6"
              md="6"
              sm="12"
            >
              <b-card-group deck>
                <b-card header="Datos de la orden">
                  <b-list-group>
                    <span><strong>Orden:</strong>
                      {{ item.orden }}</span>
                  </b-list-group>
                  <b-list-group>
                    <span>
                      <strong>Paso actual:</strong>
                      <span style="
                                                    text-transform: uppercase;
                                                    background-color: #fff3cd;
                                                    font-weight: 700;
                                                    padding: 4px;
                                                ">{{ item.paso }}</span>
                    </span>
                  </b-list-group>
                  <!-- <b-list-group>
                    <span><strong>Cliente:</strong> {{ item.cliente }}</span>
                  </b-list-group> -->
                </b-card>
              </b-card-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col class="mt-4">
              <b-table
                hover
                :items="tablaProductos"
              >
                <template #cell(Reponer)="data">
                  <produccion-reposicion-form :item="data" />
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
      title: "Reposición de piezas",
      overlay: false,
      productos: [],
      pasoActual: null,
      showError: false,
      items: [
        {
          Orden: this.item.orden,
          Cliente: this.item.cliente,
          Paso: this.item.paso,
        },
      ],
    };
  },

  computed: {
    tablaProductos() {
      let tmp = this.productos.map((item) => {
        return {
          Orden: item.id_orden,
          Producto: item.producto,
          Talla: item.talla,
          Cantidad: item.cantidad,
          Tela: item.tela,
          Corte: item.corte,
          Reponer: item._id,
        };
      });

      return tmp;
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },

  methods: {
    async getPasoActual() {
      await this.$axios
        .get(`${this.$config.API}/lotes/paso-actual/${this.item.orden}`)
        .then((resp) => {
          this.pasoActual = resp.data.paso;
          // this.overlay = false
        })
        .catch((error) => {
          alert("getPasoActual ERROR " + error);
        });
    },

    async getProductos() {
      await this.$axios
        .get(`${this.$config.API}/productos-asignados/${this.item.orden}`)
        .then((resp) => {
          this.productos = resp.data.data;
        });
    },
  },

  props: ["item"],

  mounted() {
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      this.overlay = true;
      this.getPasoActual().then(() => {
        this.getProductos().then(() => {
          this.overlay = false;
        });
      });
    });
  },
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
