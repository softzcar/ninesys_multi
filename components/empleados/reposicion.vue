<template>
  <div style="display: inline-flex; gap: 0.5rem; align-items: center;">
    <b-button :disabled="disableBtns.backward" variant="warning" @click="$bvModal.show(modal)">
      <b-icon icon="skip-backward-fill"></b-icon>
    </b-button>
    <b-button :disabled="disableBtns.eye" variant="warning" @click="$bvModal.show(modal2)">
      <b-icon icon="eye"></b-icon>
    </b-button>

    <b-modal :size="size" :title="title" :id="modal2" hide-footer>
      <b-container fluid>
        <b-card no-body class="mb-1 border-0">
          <b-card-body>
            <h4 class="card-title text-info mb-3">
              {{ itemRep.nombre_producto }}
              <b-badge variant="dark" class="ml-2">{{ itemRep.unidades }} Unidades</b-badge>
            </h4>

            <b-alert show variant="warning" class="mb-4">
              <h6 class="alert-heading font-weight-bold"><b-icon icon="exclamation-triangle-fill"></b-icon> Motivo /
                Detalle:</h6>
              <p class="mb-0" style="font-size: 1.1rem;">
                {{ itemRep.detalle_reposicion || itemRep.detalle_emisor || 'Sin detalle especificado' }}
              </p>
            </b-alert>

            <b-row class="mb-2">
              <b-col cols="6">
                <span class="text-muted d-block small">Corte</span>
                <strong>{{ itemRep.corte || 'N/A' }}</strong>
              </b-col>
              <b-col cols="6">
                <span class="text-muted d-block small">Tela</span>
                <strong>{{ itemRep.tela || 'N/A' }}</strong>
              </b-col>
            </b-row>
          </b-card-body>
        </b-card>
      </b-container>
    </b-modal>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-container fluid class="p-3" style="width: 100%">
        <b-row>
          <b-col>
            <h3>Datos de la orden</h3>
            <b-list-group style="width: 100% !important">
              <b-list-group-item>
                <span><strong>Orden:</strong> {{ id_orden }}</span>
              </b-list-group-item>

              <b-list-group-item>
                <span><strong>Cliente:</strong>
                  {{ item.cliente }}
                </span>
              </b-list-group-item>
              <b-list-group-item>
                <span>
                  <strong>Paso actual:</strong>
                  <span style="
                      text-transform: uppercase;
                      background-color: #fff3cd;
                      font-weight: 700;
                      padding: 4px;
                    ">
                    {{ item.paso }}
                  </span>
                </span>
              </b-list-group-item>
              <b-list-group-item>
                <b-button class="mt-2" size="sm" v-b-toggle.collapse-1 variant="light">Ver Detalles</b-button>
                <b-collapse id="collapse-1" class="mt-2">
                  <span v-html="item.detalle_supervisor"></span>
                  <p>Mas detalles...</p>
                </b-collapse>
              </b-list-group-item>
            </b-list-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="mt-4">
            <b-table hover :items="tablaProductos">
              <template #cell(Reponer)="data">
                <empleados-reposicion-form-empleados :item="data" @reload_this="reloadTareasAsignadas" />
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      size: "xl",
      title: "Reposición de piezas",
      overlay: false,
      productos: [],
      disableBtns: {
        backward: false,
        eye: false,
      },
      item: {
        orden: "",
        vinculada: "",
        cliente: "",
        prioridad: "0",
        paso: "",
        detalle_supervisor: null,
        detalle_emisor: null,
        inicio: "",
        entrega: "",
        detalles: "",
        acciones: "",
        estatus: "",
        id_diseno: null,
        disenador: "",
      },
      showError: false,
      dataReposicion: [],
    };
  },

  computed: {
    filterDetallesReposicion() {
      return `${this.itemRep.unidades} ${this.itemRep.nombre_producto}, detalle: ${this.itemRep.detalle_reposicion}`;
    },

    tablaProductos() {
      /* let myItem = [];

      myItem[0] = {
        Orden: this.itemRep.id_orden,
        Producto: this.itemRep.producto,
        Talla: this.itemRep.talla,
        Cantidad: this.itemRep.unidades,
        Tela: this.itemRep.tela,
        Corte: this.itemRep.corte,
        Reponer: this.itemRep.id_ordenes_productos,
        id_ordenes_productos: this.itemRep.id_ordenes_productos,
      }; */

      const myProductsTable = this.productos.map((el) => {
        return {
          Orden: el.id_orden,
          Producto: el.producto,
          Talla: el.talla,
          Cantidad: el.cantidad,
          Tela: el.tela,
          Corte: el.corte,
          Reponer: el._id,
        };
      });

      return myProductsTable;
    },

    tablaProductos2() {
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
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
    modal2() {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },

  methods: {
    async getReposicionData() {
      await this.$axios
        .get(`${this.$config.API}/empleados/reposicion/${this.id_orden}`)
        .then((resp) => {
          // console.log("test mounted", resp.data)
          this.productos = resp.data.reposicion_ordenes_productos;
          this.item = resp.data.item.data; // Asegúrate de que item siempre sea un objeto
          this.dataReposicion = resp.data.item.detalles_reposicion.filter(
            (el) =>
              el.id_empleado == this.$store.state.login.dataUser.id_empleado
          );
        });
    },

    reloadTareasAsignadas() {
      return false;
    },
  },
  beforeMount() {
    this.getReposicionData();
  },

  mounted() {
    if (this.itemRep.en_reposiciones) {
      this.disableBtns.backward = true;
    } else {
      this.disableBtns.eye = true;
    }
  },

  props: ["id_orden", "reload_this", "itemRep"],
};
</script>
