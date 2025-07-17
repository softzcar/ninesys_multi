<template>
  <div>
    <b-button
      variant="warning"
      @click="$bvModal.show(modal)"
    >
      <b-icon icon="skip-backward-fill"></b-icon>
    </b-button>

    <b-modal
      :size="size"
      :title="title"
      :id="modal"
      hide-footer
    >
      <b-overlay
        :show="overlay"
        spinner-small
        class="custom-overlay"
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
                      {{ id_orden }}</span>
                  </b-list-group>
                  <b-list-group>
                    <span><strong>Cliente:</strong>
                      {{ item.cliente }}</span>
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
import axios from "axios";

export default {
  data() {
    return {
      size: "xl",
      title: "Reposición de piezas",
      overlay: false,
      productos: [],
      item: {}, // Cambia de [] a {}
      empleados: [],
      showError: false,
      items: [], // Si no se usa, podrías eliminar esto
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
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },
  methods: {
    async getReposicionData() {
      this.overlay = true; // Activar overlay antes de la llamada
      try {
        const resp = await this.$axios.get(
          `${this.$config.API}/empleados/reposicion/${this.id_orden}`
        );
        this.productos = resp.data.reposicion_ordenes_productos;
        this.item = resp.data.item; // Asegúrate de que item siempre sea un objeto
        this.empleados = resp.data.empleados;
      } catch (error) {
        console.error(error);
        this.showError = true; // Muestra el error en la interfaz si es necesario
      } finally {
        this.overlay = false; // Desactivar overlay después de la llamada
      }
    },

    reloadTareasAsignadas() {
      this.$emit("reload_this");
    },
  },

  props: ["id_orden", "reload_this"],
  mounted() {
    this.getReposicionData();
    /* this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      console.log(`Ejecutado al abrir el modal ${modalId}`);
    }); */
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
