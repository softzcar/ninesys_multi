<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="dataUser.departamento === 'Administración' || dataUser.departamento === 'Producción'">
        <b-overlay :show="overlay" spinner-small>
          <b-container class="mt-4">
            <!-- Header section with elegant layout -->
            <b-row class="mb-4 align-items-center">
              <b-col md="8">
                <h2 class="text-info font-weight-bold mb-1">
                  <b-icon icon="palette-fill" class="mr-2 text-info" />
                  {{ titulo }}
                </h2>
                <p class="text-muted">Gestione los canales de color y tintas especiales (CMYK, Barniz, Colores Fluo, etc.) de las impresoras.</p>
              </b-col>
              <b-col md="4" class="text-md-right mt-3 mt-md-0">
                <b-button variant="info" @click="openAddModal" class="shadow-sm font-weight-bold px-3">
                  <b-icon icon="plus-circle-fill" class="mr-2" />
                  Nuevo Canal de Color
                </b-button>
              </b-col>
            </b-row>

            <!-- Search and stats card -->
            <b-card class="shadow-sm border-0 mb-4 bg-light">
              <b-row class="align-items-center">
                <b-col md="6">
                  <b-input-group>
                    <b-input-group-prepend is-text class="bg-white border-right-0 text-muted">
                      <b-icon icon="search" />
                    </b-input-group-prepend>
                    <b-form-input v-model="filter" placeholder="Buscar por código o nombre..." class="border-left-0" />
                    <b-input-group-append v-if="filter">
                      <b-button @click="filter = ''" variant="outline-secondary">Limpiar</b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-col>
                <b-col md="6" class="text-md-right mt-2 mt-md-0">
                  <span class="badge badge-info p-2 font-weight-bold shadow-sm">
                    {{ filteredItemsCount }} Colores Registrados
                  </span>
                </b-col>
              </b-row>
            </b-card>

            <!-- Table of colors -->
            <b-row>
              <b-col>
                <b-table
                  responsive
                  hover
                  striped
                  :fields="fields"
                  :items="catalogoColores"
                  :filter="filter"
                  @filtered="onFiltered"
                  class="bg-white shadow-sm rounded border overflow-hidden"
                  show-empty
                  empty-text="No hay registros para mostrar"
                  empty-filtered-text="No se encontraron coincidencias para su búsqueda"
                >
                  <!-- ID Column -->
                  <template #cell(_id)="data">
                    <span class="text-muted font-weight-bold">#{{ data.item._id }}</span>
                  </template>

                  <!-- Code Column -->
                  <template #cell(codigo)="data">
                    <span class="badge badge-dark p-2 font-weight-bold">{{ data.item.codigo }}</span>
                  </template>

                  <!-- Name Column -->
                  <template #cell(nombre)="data">
                    <span class="font-weight-bold text-dark">{{ data.item.nombre }}</span>
                  </template>

                  <!-- Color Hex Column -->
                  <template #cell(color_hex)="data">
                    <div class="d-flex align-items-center">
                      <span 
                        class="d-inline-block rounded-circle mr-2" 
                        :style="{ backgroundColor: data.item.color_hex, width: '20px', height: '20px', border: '1px solid rgba(0,0,0,0.15)' }"
                      ></span>
                      <code class="text-muted font-weight-bold">{{ data.item.color_hex }}</code>
                    </div>
                  </template>

                  <!-- Actions Column -->
                  <template #cell(acciones)="data">
                    <div class="d-flex justify-content-center align-items-center">
                      <b-button size="sm" variant="warning" class="mr-2 text-white shadow-sm" @click="openEditModal(data.item)" title="Editar">
                        <b-icon icon="pencil-square" />
                      </b-button>
                      <b-button size="sm" variant="danger" class="shadow-sm" @click="deleteColor(data.item)" title="Eliminar">
                        <b-icon icon="trash" />
                      </b-button>
                    </div>
                  </template>
                </b-table>
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>

        <!-- ADD MODAL -->
        <b-modal id="modal-add-color" title="Nuevo Canal de Color" centered hide-footer header-bg-variant="info" header-text-variant="white">
          <b-form @submit.prevent="saveNewColor">
            <b-form-group label="Código del Color:" label-for="add-codigo" description="Ej: C, M, Y, K, W, V (Barniz), FL (Fluorescente)">
              <b-form-input id="add-codigo" v-model="form.codigo" placeholder="Código corto..." required />
            </b-form-group>
            
            <b-form-group label="Nombre del Color:" label-for="add-nombre" description="Ej: Cyan, Magenta, Yellow, Black, White, Barniz">
              <b-form-input id="add-nombre" v-model="form.nombre" placeholder="Nombre completo..." required />
            </b-form-group>

            <b-form-group label="Muestra de Color Visual (Hex):" label-for="add-color-hex" description="Seleccione o escriba la muestra de color hexadecimal para la interfaz.">
              <b-row align-v="center">
                <b-col cols="3">
                  <b-form-input id="add-color-hex-picker" type="color" v-model="form.color_hex" class="h-auto p-1" />
                </b-col>
                <b-col cols="9">
                  <b-form-input id="add-color-hex" v-model="form.color_hex" placeholder="#FFFFFF" required />
                </b-col>
              </b-row>
            </b-form-group>

            <div class="text-right mt-4">
              <b-button variant="secondary" class="mr-2 px-3" @click="$bvModal.hide('modal-add-color')">Cancelar</b-button>
              <b-button type="submit" variant="info" class="px-4 font-weight-bold" :disabled="!form.codigo.trim() || !form.nombre.trim()">Guardar</b-button>
            </div>
          </b-form>
        </b-modal>

        <!-- EDIT MODAL -->
        <b-modal id="modal-edit-color" title="Editar Canal de Color" centered hide-footer header-bg-variant="warning" header-text-variant="white">
          <b-form @submit.prevent="updateColor">
            <b-form-group label="Código del Color:" label-for="edit-codigo">
              <b-form-input id="edit-codigo" v-model="editForm.codigo" required />
            </b-form-group>
            
            <b-form-group label="Nombre del Color:" label-for="edit-nombre">
              <b-form-input id="edit-nombre" v-model="editForm.nombre" required />
            </b-form-group>

            <b-form-group label="Muestra de Color Visual (Hex):" label-for="edit-color-hex">
              <b-row align-v="center">
                <b-col cols="3">
                  <b-form-input id="edit-color-hex-picker" type="color" v-model="editForm.color_hex" class="h-auto p-1" />
                </b-col>
                <b-col cols="9">
                  <b-form-input id="edit-color-hex" v-model="editForm.color_hex" required />
                </b-col>
              </b-row>
            </b-form-group>

            <div class="text-right mt-4">
              <b-button variant="secondary" class="mr-2 px-3" @click="$bvModal.hide('modal-edit-color')">Cancelar</b-button>
              <b-button type="submit" variant="warning" class="text-white px-4 font-weight-bold" :disabled="!editForm.codigo.trim() || !editForm.nombre.trim()">Actualizar</b-button>
            </div>
          </b-form>
        </b-modal>

      </div>
      <div v-else><accessDenied /></div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixin-login.js";

export default {
  name: 'CatalogoColores',
  mixins: [mixin],
  data() {
    return {
      titulo: "Catálogo de Colores y Canales",
      overlay: true,
      catalogoColores: [],
      filter: "",
      filteredItemsCount: 0,
      form: {
        codigo: "",
        nombre: "",
        color_hex: "#808080"
      },
      editForm: {
        _id: null,
        codigo: "",
        nombre: "",
        color_hex: ""
      },
      fields: [
        {
          key: "_id",
          label: "ID",
          sortable: true,
          class: "align-middle text-center",
          thStyle: { width: "80px" }
        },
        {
          key: "codigo",
          label: "Código",
          sortable: true,
          class: "align-middle text-center",
          thStyle: { width: "100px" }
        },
        {
          key: "nombre",
          label: "Nombre del Color / Canal",
          sortable: true,
          class: "align-middle text-left font-weight-bold"
        },
        {
          key: "color_hex",
          label: "Visual / Muestra Hex",
          sortable: false,
          class: "align-middle text-left"
        },
        {
          key: "acciones",
          label: "Acciones",
          class: "align-middle text-center",
          thStyle: { width: "150px" }
        }
      ]
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),
  },
  methods: {
    async getCatalogoColores() {
      this.overlay = true;
      try {
        const response = await this.$axios.get(`${this.$config.API}/catalogo-colores-tintas`);
        this.catalogoColores = response.data.data || response.data || [];
        this.filteredItemsCount = this.catalogoColores.length;
      } catch (error) {
        console.error("Error al obtener catálogo de colores:", error);
        this.$bvToast.toast("No se pudo cargar el catálogo de colores.", {
          title: "Error de Conexión",
          variant: "danger",
          solid: true
        });
      } finally {
        this.overlay = false;
      }
    },
    onFiltered(filteredItems) {
      this.filteredItemsCount = filteredItems.length;
    },
    openAddModal() {
      this.form = {
        codigo: "",
        nombre: "",
        color_hex: "#808080"
      };
      this.$bvModal.show("modal-add-color");
    },
    async saveNewColor() {
      if (!this.form.codigo.trim() || !this.form.nombre.trim()) return;
      this.overlay = true;
      this.$bvModal.hide("modal-add-color");

      const params = new URLSearchParams();
      params.set("codigo", this.form.codigo.trim().toUpperCase());
      params.set("nombre", this.form.nombre.trim());
      params.set("color_hex", this.form.color_hex.trim());

      try {
        const response = await this.$axios.post(`${this.$config.API}/catalogo-colores-tintas`, params);
        this.$bvToast.toast(`Canal "${this.form.nombre}" registrado con éxito.`, {
          title: "Operación Exitosa",
          variant: "success",
          solid: true
        });
        this.getCatalogoColores();
      } catch (error) {
        console.error("Error al crear color:", error);
        this.$bvToast.toast("Ocurrió un error al intentar guardar el color en el servidor.", {
          title: "Error",
          variant: "danger",
          solid: true
        });
        this.overlay = false;
      }
    },
    openEditModal(item) {
      this.editForm = {
        _id: item._id,
        codigo: item.codigo,
        nombre: item.nombre,
        color_hex: item.color_hex
      };
      this.$bvModal.show("modal-edit-color");
    },
    async updateColor() {
      if (!this.editForm.codigo.trim() || !this.editForm.nombre.trim() || !this.editForm._id) return;
      this.overlay = true;
      this.$bvModal.hide("modal-edit-color");

      const params = new URLSearchParams();
      params.set("codigo", this.editForm.codigo.trim().toUpperCase());
      params.set("nombre", this.editForm.nombre.trim());
      params.set("color_hex", this.editForm.color_hex.trim());

      try {
        await this.$axios.post(
          `${this.$config.API}/catalogo-colores-tintas/${this.editForm._id}`,
          params
        );
        this.$bvToast.toast("Canal de color actualizado con éxito.", {
          title: "Actualización Exitosa",
          variant: "success",
          solid: true
        });
        this.getCatalogoColores();
      } catch (error) {
        console.error("Error al actualizar color:", error);
        this.$bvToast.toast("No se pudo actualizar el canal de color.", {
          title: "Error al Procesar",
          variant: "danger",
          solid: true
        });
        this.overlay = false;
      }
    },
    deleteColor(item) {
      this.$confirm(
        `¿Desea eliminar el color "${item.nombre}" del catálogo?`,
        "Eliminar del Catálogo",
        "warning"
      )
        .then(async () => {
          this.overlay = true;
          const params = new URLSearchParams();
          params.set("id", item._id);

          try {
            await this.$axios.post(`${this.$config.API}/catalogo-colores-tintas/eliminar`, params);
            this.$bvToast.toast(`Color "${item.nombre}" ha sido eliminado.`, {
              title: "Eliminación Exitosa",
              variant: "success",
              solid: true
            });
            this.getCatalogoColores();
          } catch (error) {
            console.error("Error al eliminar color:", error);
            this.$bvToast.toast("No se pudo eliminar el color. Podría estar en uso por impresoras o recargas.", {
              title: "Error al Eliminar",
              variant: "danger",
              solid: true
            });
            this.overlay = false;
          }
        })
        .catch(() => {});
    }
  },
  mounted() {
    this.getCatalogoColores();
  },
  head() {
    return {
      title: this.titulo,
    };
  }
};
</script>
