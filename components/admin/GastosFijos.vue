<template>
  <div>
    <b-overlay :show="overlay" spinner-variant="primary">
      <b-container>
        <b-row class="mb-4">
          <b-col>
            <h3>Gestión de Gastos Fijos</h3>
          </b-col>
          <b-col class="text-right">
            <b-button variant="success" @click="openCreateModal">
              <b-icon-plus-circle-fill></b-icon-plus-circle-fill> Nuevo Gasto
            </b-button>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-table striped hover :items="gastos" :fields="fields" responsive>
              <template #cell(monto)="data">
                {{ data.item.monto | currency }} {{ data.item.moneda }}
              </template>

              <template #cell(estatus)="data">
                <b-badge
                  :variant="
                    data.item.estatus === 'activo' ? 'success' : 'danger'
                  "
                  >{{ data.item.estatus }}</b-badge
                >
              </template>

              <template #cell(acciones)="data">
                <b-button
                  variant="primary"
                  size="sm"
                  class="mr-2"
                  @click="openEditModal(data.item)"
                >
                  <b-icon-pencil-square></b-icon-pencil-square>
                </b-button>
                <b-button
                  variant="danger"
                  size="sm"
                  @click="confirmDelete(data.item)"
                >
                  <b-icon-trash-fill></b-icon-trash-fill>
                </b-button>
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>

    <!-- Modal para Crear/Editar Gastos -->
    <b-modal
      id="modal-gasto"
      :title="editMode ? 'Editar Gasto' : 'Crear Nuevo Gasto'"
      @ok="handleOk"
      @hidden="resetModal"
      centered
    >
      <b-form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group label="Nombre del Gasto:" label-for="nombre-input">
          <b-form-input
            id="nombre-input"
            v-model="gastoModel.nombre"
            required
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="Descripción (Opcional):"
          label-for="descripcion-input"
        >
          <b-form-textarea
            id="descripcion-input"
            v-model="gastoModel.descripcion"
            rows="3"
          ></b-form-textarea>
        </b-form-group>

        <b-form-group label="Monto:" label-for="monto-input">
          <b-form-input
            id="monto-input"
            v-model="gastoModel.monto"
            type="number"
            step="0.01"
            required
          ></b-form-input>
        </b-form-group>

        <b-form-group label="Moneda:" label-for="moneda-select">
          <b-form-select
            id="moneda-select"
            v-model="gastoModel.moneda"
            :options="['USD', 'COP', 'VES']"
          ></b-form-select>
        </b-form-group>

        <b-form-group label="Periodicidad:" label-for="periodicidad-select">
          <b-form-select
            id="periodicidad-select"
            v-model="gastoModel.periodicidad"
            :options="['mensual', 'trimestral', 'semestral', 'anual', 'único']"
          ></b-form-select>
        </b-form-group>

        <b-form-group label="Estatus:" label-for="estatus-select">
          <b-form-select
            id="estatus-select"
            v-model="gastoModel.estatus"
            :options="['activo', 'inactivo']"
          ></b-form-select>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      overlay: true,
      gastos: [],
      fields: [
        { key: "nombre", label: "Nombre", sortable: true },
        { key: "monto", label: "Monto", sortable: true },
        { key: "periodicidad", label: "Periodicidad", sortable: true },
        { key: "estatus", label: "Estatus", sortable: true },
        { key: "acciones", label: "Acciones" },
      ],
      gastoModel: {
        _id: null,
        nombre: "",
        descripcion: "",
        monto: 0,
        moneda: "USD",
        periodicidad: "mensual",
        estatus: "activo",
      },
      editMode: false,
    };
  },
  methods: {
    async getGastos() {
      this.overlay = true;
      try {
        const { data } = await this.$axios.get(`${this.$config.API}/gastos`);
        this.gastos = data;
      } catch (error) {
        console.error("Error al obtener los gastos:", error);
        this.$bvToast.toast("No se pudieron cargar los gastos.", {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      } finally {
        this.overlay = false;
      }
    },
    resetModal() {
      this.gastoModel = {
        _id: null,
        nombre: "",
        descripcion: "",
        monto: 0,
        moneda: "USD",
        periodicidad: "mensual",
        estatus: "activo",
      };
      this.editMode = false;
    },
    openCreateModal() {
      this.resetModal();
      this.$bvModal.show("modal-gasto");
    },
    openEditModal(item) {
      this.gastoModel = { ...item };
      this.editMode = true;
      this.$bvModal.show("modal-gasto");
    },
    handleOk(bvModalEvent) {
      bvModalEvent.preventDefault();
      this.handleSubmit();
    },
    async handleSubmit() {
      if (this.editMode) {
        await this.updateGasto();
      } else {
        await this.createGasto();
      }
    },
    async createGasto() {
      this.overlay = true;
      try {
        const { _id, ...gastoData } = this.gastoModel; // Excluir _id para la creación
        const data = new URLSearchParams();
        for (const key in gastoData) {
          if (gastoData[key] !== null) {
            data.set(key, gastoData[key]);
          }
        }
        await this.$axios.post(`${this.$config.API}/gastos`, data);
        this.$bvToast.toast("Gasto creado exitosamente.", {
          title: "Éxito",
          variant: "success",
          solid: true,
        });
        this.$bvModal.hide("modal-gasto");
        await this.getGastos();
      } catch (error) {
        console.error("Error al crear el gasto:", error);
        this.$bvToast.toast("Error al crear el gasto.", {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      } finally {
        this.overlay = false;
      }
    },
    async updateGasto() {
      this.overlay = true;
      try {
        const data = new URLSearchParams();
        for (const key in this.gastoModel) {
          if (key !== "_id" && this.gastoModel[key] !== null) {
            data.set(key, this.gastoModel[key]);
          }
        }
        await this.$axios.put(
          `${this.$config.API}/gastos/${this.gastoModel._id}`,
          data
        );
        this.$bvToast.toast("Gasto actualizado exitosamente.", {
          title: "Éxito",
          variant: "success",
          solid: true,
        });
        this.$bvModal.hide("modal-gasto");
        await this.getGastos();
      } catch (error) {
        console.error("Error al actualizar el gasto:", error);
        this.$bvToast.toast("Error al actualizar el gasto.", {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      } finally {
        this.overlay = false;
      }
    },
    confirmDelete(item) {
      this.$bvModal
        .msgBoxConfirm(
          `¿Estás seguro de que deseas eliminar el gasto "${item.nombre}"?`,
          {
            title: "Confirmar Eliminación",
            size: "sm",
            buttonSize: "sm",
            okVariant: "danger",
            okTitle: "Sí, eliminar",
            cancelTitle: "No",
            footerClass: "p-2",
            hideHeaderClose: false,
            centered: true,
          }
        )
        .then(async (value) => {
          if (value) {
            this.overlay = true;
            try {
              await this.$axios.delete(
                `${this.$config.API}/gastos/${item._id}`
              );
              this.$bvToast.toast("Gasto eliminado.", {
                title: "Éxito",
                variant: "success",
                solid: true,
              });
              await this.getGastos();
            } catch (error) {
              console.error("Error al eliminar el gasto:", error);
              this.$bvToast.toast("Error al eliminar el gasto.", {
                title: "Error",
                variant: "danger",
                solid: true,
              });
            } finally {
              this.overlay = false;
            }
          }
        });
    },
  },
  mounted() {
    this.getGastos();
  },
};
</script>