<template>
  <div>
    <b-button variant="warning" @click="$bvModal.show(modal)">
      <b-icon icon="skip-backward-fill"></b-icon>
    </b-button>

    <b-modal :id="modal" :title="title" hide-footer size="xl">
      <b-overlay :show="overlay" spinner-small>
        <div>
          {{ $data }}
        </div>
        <b-container>
          <b-row>
            <b-col xl="6" lg="6" md="6" sm="12">
              <b-card-group deck>
                <b-card header="Datos de la orden">
                  <b-list-group>
                    <span><strong>Orden:</strong> {{ id_orden }}</span>
                  </b-list-group>
                  <b-list-group>
                    <span><strong>Cliente:</strong> {{ item.cliente }}</span>
                  </b-list-group>
                  <b-list-group>
                    <span>
                      <strong>Paso actual:</strong>
                      <span
                        style="
                          text-transform: uppercase;
                          background-color: #fff3cd;
                          font-weight: 700;
                          padding: 4px;
                        "
                        >{{ item.paso }}</span
                      >
                    </span>
                  </b-list-group>
                </b-card>
              </b-card-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col class="mt-4">
              <b-table hover :items="tablaProductos">
                <template #cell(Reponer)="data">
                  <produccionsse-reposicion-form
                    :item="data"
                    :empleados="empleados"
                    @reload_this="reloadTareasAsignadas"
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
import axios from 'axios';

export default {
  data() {
    return {
      title: `Orden ${this.id_orden}`,
      size: "xl",
      title: "Reposición de piezas",
      overlay: false,
      productos: [],
      item: {},
      showError: false,
    };
  },

  computed: {
    tablaProductos() {
      return this.productos.map((item) => ({
        Orden: item.id_orden,
        Producto: item.producto,
        Talla: item.talla,
        Cantidad: item.cantidad,
        Tela: item.tela,
        Corte: item.corte,
        Reponer: item._id,
      }));
    },

    modal() {
      return `modal-${this.id_orden}`;
    },
  },

  methods: {
    reloadTareasAsignadas() {
      return null
    },
    async getReposicionData() {
      await axios.get(`${this.$config.API}/insumos`).then((resp) => {
        console.log('test mounted',resp.data) ;
      });
    },

    async getReposicionData00() {
      await axios
        .get(`${this.$config.API}/empleados/reposicion/${this.id_orden}`)
        .then((resp) => {
          this.productos = resp.data.reposicion_ordenes_productos;
          this.item = resp.data.item;
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se cargaron los datos de la reposición</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  fetch() {
    this.getReposicionData();
  },

  props: ["id_orden", "reload_this"],
};
</script>
