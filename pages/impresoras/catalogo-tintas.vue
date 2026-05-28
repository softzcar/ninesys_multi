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
                  <b-icon icon="droplet-fill" class="mr-2 text-info" />
                  {{ titulo }}
                </h2>
                <p class="text-muted">Clasifique y administre los tipos de tintas utilizados en los equipos de impresión de la empresa.</p>
              </b-col>
              <b-col md="4" class="text-md-right mt-3 mt-md-0">
                <b-button variant="info" @click="openAddModal" class="shadow-sm font-weight-bold px-3">
                  <b-icon icon="plus-circle-fill" class="mr-2" />
                  Nuevo Tipo de Tinta
                </b-button>
              </b-col>
            </b-row>

            <!-- Glassmorphic search and count card -->
            <b-card class="shadow-sm border-0 mb-4 bg-light">
              <b-row class="align-items-center">
                <b-col md="6">
                  <b-input-group>
                    <b-input-group-prepend is-text class="bg-white border-right-0 text-muted">
                      <b-icon icon="search" />
                    </b-input-group-prepend>
                    <b-form-input v-model="filter" placeholder="Buscar por nombre..." class="border-left-0" />
                    <b-input-group-append v-if="filter">
                      <b-button @click="filter = ''" variant="outline-secondary">Limpiar</b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-col>
                <b-col md="6" class="text-md-right mt-2 mt-md-0">
                  <span class="badge badge-info p-2 font-weight-bold shadow-sm">
                    {{ filteredItemsCount }} Tipos Registrados
                  </span>
                </b-col>
              </b-row>
            </b-card>

            <!-- Table of classifications -->
            <b-row>
              <b-col>
                <b-table
                  responsive
                  hover
                  striped
                  :fields="fields"
                  :items="catalogoTintas"
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

                  <!-- Name Column -->
                  <template #cell(nombre)="data">
                    <span class="font-weight-bold text-dark">{{ data.item.nombre }}</span>
                  </template>

                  <!-- Actions Column -->
                  <template #cell(acciones)="data">
                    <div class="d-flex justify-content-center align-items-center">
                      <b-button size="sm" variant="warning" class="mr-2 text-white shadow-sm" @click="openEditModal(data.item)" title="Editar">
                        <b-icon icon="pencil-square" />
                      </b-button>
                      <b-button size="sm" variant="danger" class="shadow-sm" @click="deleteInkType(data.item)" title="Eliminar">
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
        <b-modal id="modal-add-tinta" title="Nuevo Tipo de Tinta" centered hide-footer header-bg-variant="info" header-text-variant="white">
          <b-form @submit.prevent="saveNewInkType">
            <b-form-group label="Nombre del Tipo de Tinta:" label-for="add-nombre" description="Ingrese una descripción descriptiva. Ej: Tinta DTF (Direct to Film)">
              <b-form-input id="add-nombre" v-model="newTintaName" placeholder="Nombre de clasificación..." required autofocus />
            </b-form-group>
            <div class="text-right mt-4">
              <b-button variant="secondary" class="mr-2 px-3" @click="$bvModal.hide('modal-add-tinta')">Cancelar</b-button>
              <b-button type="submit" variant="info" class="px-4 font-weight-bold" :disabled="!newTintaName.trim()">Guardar</b-button>
            </div>
          </b-form>
        </b-modal>

        <!-- EDIT MODAL -->
        <b-modal id="modal-edit-tinta" title="Editar Tipo de Tinta" centered hide-footer header-bg-variant="warning" header-text-variant="white">
          <b-form @submit.prevent="updateInkType">
            <b-form-group label="Nombre del Tipo de Tinta:" label-for="edit-nombre" description="Actualice el nombre descriptivo de la clasificación.">
              <b-form-input id="edit-nombre" v-model="editTintaName" placeholder="Nombre de clasificación..." required autofocus />
            </b-form-group>
            <div class="text-right mt-4">
              <b-button variant="secondary" class="mr-2 px-3" @click="$bvModal.hide('modal-edit-tinta')">Cancelar</b-button>
              <b-button type="submit" variant="warning" class="text-white px-4 font-weight-bold" :disabled="!editTintaName.trim()">Actualizar</b-button>
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

export default {
  name: 'CatalogoTintas',
  data() {
    return {
      titulo: "Catálogo de Clasificación de Tintas",
      overlay: true,
      catalogoTintas: [],
      filter: "",
      filteredItemsCount: 0,
      newTintaName: "",
      editTintaName: "",
      selectedTintaId: null,
      fields: [
        {
          key: "_id",
          label: "ID",
          sortable: true,
          class: "align-middle text-center",
          thStyle: { width: "80px" }
        },
        {
          key: "nombre",
          label: "Tipo de Tinta / Clasificación",
          sortable: true,
          class: "align-middle text-left font-weight-bold"
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
    async getCatalogoTintas() {
      this.overlay = true;
      try {
        const response = await this.$axios.get(`${this.$config.API}/catalogo-tintas`);
        this.catalogoTintas = response.data.data || [];
        this.filteredItemsCount = this.catalogoTintas.length;
      } catch (error) {
        console.error("Error al obtener catálogo de tintas:", error);
        this.$bvToast.toast("No se pudo cargar el catálogo de tintas de la base de datos.", {
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
      this.newTintaName = "";
      this.$bvModal.show("modal-add-tinta");
    },
    async saveNewInkType() {
      if (!this.newTintaName.trim()) return;
      this.overlay = true;
      this.$bvModal.hide("modal-add-tinta");

      const params = new URLSearchParams();
      params.set("nombre", this.newTintaName.trim());

      try {
        const response = await this.$axios.post(`${this.$config.API}/catalogo-tintas`, params);
        if (response.data && !response.data.error) {
          this.$bvToast.toast(`Tipo de tinta "${this.newTintaName}" registrado con éxito.`, {
            title: "Operación Exitosa",
            variant: "success",
            solid: true
          });
          this.getCatalogoTintas();
        } else {
          throw new Error(response.data.message || "Error al registrar");
        }
      } catch (error) {
        console.error("Error al crear tipo de tinta:", error);
        this.$bvToast.toast(error.message || "Ocurrió un error al intentar guardar en el servidor.", {
          title: "Error",
          variant: "danger",
          solid: true
        });
        this.overlay = false;
      }
    },
    openEditModal(item) {
      this.selectedTintaId = item._id;
      this.editTintaName = item.nombre;
      this.$bvModal.show("modal-edit-tinta");
    },
    async updateInkType() {
      if (!this.editTintaName.trim() || !this.selectedTintaId) return;
      this.overlay = true;
      this.$bvModal.hide("modal-edit-tinta");

      try {
        const encodedName = encodeURIComponent(this.editTintaName.trim());
        await this.$axios.post(
          `${this.$config.API}/catalogo-tintas/${this.selectedTintaId}/${encodedName}`
        );
        this.$bvToast.toast("Nombre de clasificación actualizado con éxito.", {
          title: "Actualización Exitosa",
          variant: "success",
          solid: true
        });
        this.getCatalogoTintas();
      } catch (error) {
        console.error("Error al actualizar tipo de tinta:", error);
        this.$bvToast.toast("No se pudo actualizar el tipo de tinta.", {
          title: "Error al Procesar",
          variant: "danger",
          solid: true
        });
        this.overlay = false;
      }
    },
    deleteInkType(item) {
      this.$confirm(
        `¿Desea Eliminar el tipo de tinta "${item.nombre}" del catálogo?`,
        "Eliminar del Catálogo",
        "warning"
      )
        .then(async () => {
          this.overlay = true;
          const params = new URLSearchParams();
          params.set("id", item._id);

          try {
            await this.$axios.post(`${this.$config.API}/catalogo-tintas/eliminar`, params);
            this.$bvToast.toast(`Tipo de tinta "${item.nombre}" ha sido eliminado.`, {
              title: "Eliminación Exitosa",
              variant: "success",
              solid: true
            });
            this.getCatalogoTintas();
          } catch (error) {
            console.error("Error al eliminar tipo de tinta:", error);
            this.$bvToast.toast("No se pudo eliminar el elemento. Podría estar en uso.", {
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
    this.getCatalogoTintas();
  },
  head() {
    return {
      title: this.titulo,
    };
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
