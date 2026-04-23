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
              <b-col>
                <b-table
                  responsive
                  :fields="dataTable.fields"
                  :items="dataTable.items"
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
                          v-on:click="deleteEmpleado(data.item._id)"
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
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),
  },
  methods: {
    async loadData() {
      if (this.isFetching) {
        console.log('[DEBUG] loadData: Ya hay una carga en curso, ignorando duplicado');
        return;
      }

      console.log('[DEBUG] loadData: Iniciando carga de datos habitual');
      this.overlay = true;
      this.isFetching = true;

      try {
        await Promise.all([this.getDepartamentos(), this.getEmpleados()]);
        console.log('[DEBUG] loadData: Carga completada');
      } catch (error) {
        console.error('[DEBUG] loadData: Error durante la carga', error);
      } finally {
        this.overlay = false;
        this.isFetching = false;
      }
    },
    async handleReload(data) {
      console.log('[DEBUG] handleReload: Recargando datos')
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
      console.log('[DEBUG] getEmpleados: Solicitando lista de empleados')
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
        console.log('[DEBUG] getEmpleados: Datos cargados exitosamente')
      } catch (error) {
        console.log('[DEBUG] getEmpleados: Error al obtener empleados', error)
      }
    },

    deleteEmpleado(id_emp) {
      this.$confirm(
        `¿Desea Elimiar el empleado ${id_emp} ?`,
        "Eliminar Empleado",
        "question"
      )
      .then(() => {
        this.overlay = true;
        const data = new URLSearchParams();
        data.set("id", id_emp);

        this.$axios
          .post(`${this.$config.API}/empleados/eliminar`, data)
          .then((res) => {
            let msgDat = { icon: parseInt(res.data.eliinado) ? "success" : "warning" };
            this.loadData();
            this.$fire({
              title: "Eliminar Empleado",
              html: `<p>${res.data.message}</p>`,
              type: msgDat.icon,
            });
          })
          .catch((err) => {
            this.$fire({
              title: "Eliminar Empleado",
              html: `<p>Ocurrió un error al eliminar el empleado</p><p>${err}</p>`,
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
    console.log('[DEBUG] mounted: Página montada');
    this.loadData();
  },
};
</script>
