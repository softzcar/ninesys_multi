<template>
  <div>
    <div>
      <!-- <b-button v-b-modal.modalPopover>Ver detalles</b-button> -->
      <b-button variant="primary" @click="$bvModal.show(modal)">
        <b-icon icon="eye"></b-icon>
      </b-button>

      <b-modal :id="modal" :title="title" size="lg" ok-only>
        <b-row class="mt-2">
          <b-col>
            <!-- Contenedor flex para botones -->
            <div class="d-flex flex-wrap gap-2 mb-3" style="gap: 0.5rem;">
              <diseno-viewImage :id="idorden" />
              <b-button v-b-toggle.collapse-1 variant="primary">Ver original</b-button>
              <b-button v-b-toggle.collapse-2 variant="primary">Productos</b-button>
            </div>

            <!-- Collapse Ver original -->
            <b-collapse id="collapse-1" class="mt-2">
              <b-card>
                <div v-html="detalles_orden"></div>
              </b-card>
            </b-collapse>

            <!-- Collapse Productos -->
            <b-collapse id="collapse-2" class="mt-2">
              <b-card>
                <b-table striped hover :fields="fields" :items="productos">
                  <template #cell(terminado)="row">
                    <empleados-check-tarea :id_orden="row.item.id_orden"
                      :id_ordenes_productos="row.item.id_ordenes_productos"
                      :id_lotes_detalles="row.item.id_lotes_detalles" :terminado="row.item.terminado"
                      :key="row.item.id_lotes_detalles" />
                  </template>

                  <template #cell(detalle_reposicion)="row">
                    <produccion-control-de-produccion-detalle-reposicion :detalle="row.item.detalle_reposicion" />
                  </template>
                </b-table>
              </b-card>
            </b-collapse>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <div style="border: red 1px; text-align: right">
              {{ msg }}
            </div>
          </b-col>
        </b-row>

        <b-row class="mt-4">
          <b-col>
            <quill-editor v-model="borrador" @change="onEditorChange($event)" :options="quillOptions"
              :key="editorKey"></quill-editor>
          </b-col>
        </b-row>
      </b-modal>
    </div>
  </div>
</template>

<script>
import quillOptions from "~/plugins/nuxt-quill-plugin";

export default {
  data() {
    return {
      editorKey: 0,
      title: `Detalles de la orden ${this.idorden}`,
      quillOptions,
      msg: "",
      detalles_orden: "",
      detalles_empleado: "",
      borrador: "",
      html2: "",
      fields_static: [
        {
          key: "terminado",
          label: "Terminado",
        },
        {
          key: "name",
          label: "Producto",
        },
        {
          key: "cantidad",
          label: "Cantidad",
        },
        {
          key: "talla",
          label: "Talla",
        },
        {
          key: "corte",
          label: "Corte",
        },
        {
          key: "tela",
          label: "Tela",
        },
        {
          key: "detalle_reposicion",
          label: "Detalle",
        },
      ],
    };
  },

  computed: {
    misProductos() {
      let prods;
      if (this.esreposicion == "true") {
        prods = this.productos
          .filter((el) => el.reposicion_terminada === 0)
          .map((el) => ({ ...el, cantidad: el.unidades_reposicion }));
      } else {
        prods = this.productos.filter((el) => el.reposicion_terminada === null);
      }
      return prods;
    },

    misProductos_filto_chatgpt_por_probar() {
      let prods;
      if (this.esreposicion === "true") {
        prods = this.productos
          .filter((el) => el.reposicion_terminada === 0)
          .map((el) => ({ ...el, cantidad: el.unidades_reposicion }));
      } else {
        prods = this.productos.filter((el) => el.reposicion_terminada === null);
      }

      // Eliminar duplicados basado en el campo 'id' (puedes ajustar el campo según tu estructura de datos)
      const uniqueProds = [];
      const seenIds = new Set();

      for (const prod of prods) {
        if (!seenIds.has(prod.id)) {
          seenIds.add(prod.id);
          uniqueProds.push(prod);
        }
      }

      return uniqueProds;
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);

      return `modal-${rand}`;
    },

    fields() {
      let fields;

      if (this.esreposicion == "true") {
        if (this.$store.state.login.dataUser.departamento === "Corte") {
          fields = [
            {
              key: "terminado",
              label: "Terminado",
            },
            {
              key: "name",
              label: "Producto",
            },
            {
              key: "cantidad_corte",
              label: "Cantidad",
            },
            {
              key: "talla",
              label: "Talla",
            },
            {
              key: "corte",
              label: "Corte",
            },
            {
              key: "tela",
              label: "Tela",
            },
            {
              key: "detalle_reposicion",
              label: "Detalle",
            },
          ];
        } else {
          fields = [
            {
              key: "terminado",
              label: "Terminado",
            },
            {
              key: "name",
              label: "Producto",
            },
            {
              key: "cantidad",
              label: "Cantidad",
            },
            {
              key: "talla",
              label: "Talla",
            },
            {
              key: "corte",
              label: "Corte",
            },
            {
              key: "tela",
              label: "Tela",
            },
            {
              key: "detalle_reposicion",
              label: "Detalle",
            },
          ];
        }
      } else {
        if (this.$store.state.login.dataUser.departamento === "Corte") {
          fields = [
            {
              key: "terminado",
              label: "Terminado",
            },
            {
              key: "name",
              label: "Producto",
            },
            {
              key: "cantidad_corte",
              label: "Cantidad",
            },
            {
              key: "talla",
              label: "Talla",
            },
            {
              key: "corte",
              label: "Corte",
            },
            {
              key: "tela",
              label: "Tela",
            },
          ];
        } else {
          fields = [
            {
              key: "terminado",
              label: "Terminado",
            },
            {
              key: "name",
              label: "Producto",
            },
            {
              key: "cantidad",
              label: "Cantidad",
            },
            {
              key: "talla",
              label: "Talla",
            },
            {
              key: "corte",
              label: "Corte",
            },
            {
              key: "tela",
              label: "Tela",
            },
          ];
        }
      }

      return fields;
    },
  },

  methods: {
    async getObservaciones() {
      this.overlay = true;
      await this.$axios
        .get(
          `${this.$config.API}/ordenes/observaciones/${this.idorden}/${this.$store.state.login.dataUser.id_empleado}/${this.$store.state.login.currentDepartamentId}`
        )
        .then((res) => {
          console.log(
            "resultado de buscar las observaciones del empleado",
            res.data
          );

          this.detalles_orden = res.data[0].observaciones_ordenes;
          this.borrador = res.data[0].observaciones_empleado;
          this.editorKey++;

          console.group("obs");
          console.log("Observaciones orden", this.detalles_orden);
          console.log("Observaciones empleado", this.borrador);
          console.groupEnd("obs");
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<P>No se obtuivieron las observaciones</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    async postBorrador(borrador) {
      this.msg = "Guardando...";
      const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("id_departamento", this.$store.state.login.currentDepartamentId);
      data.set("borrador", borrador);

      await this.$axios
        .post(`${this.$config.API}/ordenes/borrador`, data)
        .then((res) => {
          this.msg = "Se guardaron sus cambios";
          this.$emit("reload");
        })
        .catch((error) => {
          this.msg = "No se pudo guardar su borrador";
        });
    },

    onEditorChange({ editor, html, text }) {
      console.log("editor change!", editor, html, text);
      this.postBorrador(html);
      this.borrador = html;
    },
  },

  mounted() {
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId === this.modal) {
        this.getObservaciones();
      }
    });

    if (this.detalle_empleado === null) {
      this.borrador = this.detalles_orden;
    } else {
      this.borrador = this.detalle_empleado;
    }
  },

  props: [
    "idorden",
    "item",
    "productos",
    "reload",
    "esreposicion",
    "en_reposiciones",
  ],
};
</script>
