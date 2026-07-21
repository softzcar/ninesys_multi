<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="
                accessModule.accessData.id_modulo === 1 ||
                accessModule.accessData.id_modulo === 3 ||
                accessModule.accessData.id_modulo === 4 ||
                accessModule.accessData.id_modulo === 6 
                
            ">
        <b-overlay
          :show="overlay"
          spinner-small
        >
          <b-container fluid>
            <b-row>
              <b-col>
                <h2 class="mb-4">{{ titulo }}</h2>
                <AdminEmpleadoNuevo
                  :departamentos="departamentos"
                  @reload="loadData"
                />
              </b-col>
            </b-row>

            <b-row>
              <b-col
                cols="12"
                lg="7"
                class="mb-4 mt-4"
              >
                <h5 class="mb-2">Filtrar por departamento:</h5>
                <b-form-radio-group
                  id="btn-radios-departamento"
                  v-model="selectedDepartamento"
                  :options="departamentoOptions"
                  button-variant="outline-primary"
                  size="lg"
                  name="radio-btn-departamento"
                  class="filtro-departamento-buttons"
                  buttons
                ></b-form-radio-group>
              </b-col>
              <b-col
                cols="12"
                lg="5"
              >
                <b-input-group
                  class="mb-4"
                  size="sm"
                >
                  <b-form-input
                    id="filter-input"
                    v-model="filter"
                    type="search"
                    placeholder="Filtrar por nombre"
                  ></b-form-input>

                  <b-input-group-append>
                    <b-button
                      :disabled="!filter"
                      @click="filter = ''"
                    >
                      Limpiar
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <b-table
                  responsive
                  :fields="dataTable.fields"
                  :items="filteredItems"
                  :filter="filter"
                  :filter-included-fields="includedFields"
                  primary-key="_id"
                >
                  <template #cell(departamentos)="data">
                    <div v-if="data.item.departamentos">
                      <div
                        v-for="dep in data.item.departamentos"
                        :key="dep.id"
                      >
                        {{ dep.nombre }}
                      </div>
                    </div>
                  </template>

                  <template #cell(acciones)="data">
                    <div class="d-flex">
                      <span class="floatme mr-2">
                        <AdminEmpleadoEditar
                          :key="data.item._id"
                          :departamentos="departamentos"
                          :item="data.item"
                          @reload="handleReload"
                        />
                      </span>
                      <span class="floatme">
                        <b-button
                          variant="danger"
                          title="Desactivar empleado"
                          v-on:click="deleteEmpleado(data.item._id, data.item.nombre)"
                        >
                          <b-icon icon="trash"></b-icon>
                        </b-button>
                      </span>
                    </div>
                  </template>
                </b-table>
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixin-login.js";

export default {
  mixins: [mixin],

  data() {
    return {
      titulo: "Gestión de Empleados",
      overlay: true,
      dataTable: [],
      departamentos: [],
      isFetching: false,
      filter: null,
      includedFields: ["nombre"],
      selectedDepartamento: null,
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),
    departamentoOptions() {
      return [
        { value: null, text: "Todos" },
        ...this.departamentos.map((dep) => ({
          value: dep._id,
          text: dep.departamento,
        })),
      ];
    },
    filteredItems() {
      const items = this.dataTable.items || [];
      if (!this.selectedDepartamento) return items;
      return items.filter(
        (item) =>
          Array.isArray(item.departamentos) &&
          item.departamentos.some((dep) => dep.id === this.selectedDepartamento)
      );
    },
  },
  methods: {
    async loadData() {
      if (this.isFetching) {
        return;
      }

      this.overlay = true;
      this.isFetching = true;

      try {
        await Promise.all([this.getDepartamentos(), this.getEmpleados()]);
      } catch (error) {
        console.error('[Gestión de Empleados] Error durante la carga', error);
      } finally {
        this.overlay = false;
        this.isFetching = false;
      }
    },
    async handleReload(data) {
      await this.loadData()
    },
    async getDepartamentos() {
      try {
        const res = await this.$axios.get(`${this.$config.API}/departamentos`)
        this.departamentos = res.data;
        this.$store.commit("login/setDepartamentos", res.data);
      } catch (err) {
        this.$fire({
          title: "Error cargando los departamentos",
          html: `<p>${err}</p>`,
          type: "warning",
        });
      }
    },

    async getEmpleados() {
      try {
        const resp = await this.$axios.get(`${this.$config.API}/empleados`)

        // --- HABILITACIÓN DE ORDENAMIENTO (SOLO NOMBRE Y USUARIO) ---
        if (resp.data && resp.data.fields) {
          resp.data.fields = resp.data.fields.map(field => {
            if (field.key === 'nombre' || field.key === 'username') {
              return { ...field, sortable: true };
            }
            return field;
          });
        }

        this.dataTable = resp.data;
      } catch (error) {
        console.error('[Gestión de Empleados] Error al obtener empleados', error)
      }
    },

    deleteEmpleado(id_emp, nombre_emp) {
      this.$confirm(
        `¿Desea desactivar al empleado "${nombre_emp || id_emp}"? No se eliminará su registro, solo dejará de aparecer como activo y podrá reactivarse luego desde "Activación de Empleados".`,
        "Desactivar Empleado",
        "question"
      )
      .then(() => {
        this.overlay = true;
        const data = new URLSearchParams();
        data.set("id", id_emp);

        this.$axios
          .post(`${this.$config.API}/empleados/eliminar`, data)
          .then((res) => {
            this.loadData();
            this.$fire({
              title: "Empleado Desactivado",
              html: `<p>${res.data.message}</p>`,
              type: "success",
            });
          })
          .catch((err) => {
            this.$fire({
              title: "Desactivar Empleado",
              html: `<p>Ocurrió un error al desactivar el empleado</p><p>${err}</p>`,
              type: "danger",
            });
          })
          .finally(() => {
            this.overlay = false;
          });
      })
      .catch(() => {});
    },
  },
  mounted() {
    this.loadData();
  },
};
</script>

<style scoped>
.filtro-departamento-buttons {
  flex-wrap: wrap;
}
.filtro-departamento-buttons >>> .btn {
  margin-bottom: 4px;
}
</style>
