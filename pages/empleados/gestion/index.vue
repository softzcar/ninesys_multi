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
                >
                  <template #cell(departamentos)="data">
                    <!-- {{ data.item.departamentos }} -->
                    <div
                      v-for="dep in data.item.departamentos"
                      :key="dep.id"
                    >
                      {{ dep.nombre }}
                    </div>
                  </template>

                  <template #cell(acciones)="data">
                    <span class="floatme">
                      <AdminEmpleadoEditar
                        :departamentos="departamentos"
                        :item="data.item"
                        @reload="handleReload"
                      />
                    </span>
                    <span class="floatme">
                      <b-button
                        variant="danger"
                        v-on:click="
                                                deleteEmpleado(
                                                    data.item._id
                                                )
                                                "
                      >
                        <b-icon icon="trash"></b-icon>
                      </b-button>
                    </span>
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
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),
  },
  methods: {
    async loadData() {
      console.log('[DEBUG] loadData: Recargando datos de empleados y departamentos')
      await Promise.all([this.getDepartamentos(), this.getEmpleados()]);
    },
    async handleReload(data) {
      console.log('[DEBUG] handleReload: Evento reload recibido desde AdminEmpleadoEditar', data)
      console.log('[DEBUG] handleReload: Llamando a loadData()')
      try {
        await this.loadData()
        console.log('[DEBUG] handleReload: Datos recargados exitosamente')
      } catch (error) {
        console.log('[DEBUG] handleReload: Error al recargar datos', error)
      }
    },
    async getDepartamentos() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/departamentos`)
        .then((res) => {
          this.departamentos = res.data;
          this.$store.commit("login/setDepartamentos", res.data);
        })
        .catch((err) => {
          this.$fire({
            title: "Error cargando los departamentos",
            html: `<p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    async getEmpleados() {
      console.log('[DEBUG] getEmpleados: Solicitando lista de empleados')
      try {
        const resp = await this.$axios.get(`${this.$config.API}/empleados`)
        console.log('[DEBUG] getEmpleados: Datos recibidos', resp.data)
        this.dataTable = resp.data;
        this.overlay = false;
      } catch (error) {
        console.log('[DEBUG] getEmpleados: Error al obtener empleados', error)
        this.overlay = false;
      }
    },

    deleteEmpleado(id_emp) {
      console.log('[DEBUG] deleteEmpleado: Iniciando eliminación de empleado', id_emp)
      this.$confirm(
        `¿Desea Elimiar el empleado ${id_emp} ?`,
        "Eliminar Empleado",
        "question"
      )
      .then(() => {
        console.log('[DEBUG] deleteEmpleado: Usuario confirmó eliminación')
        this.overlay = true;
        const data = new URLSearchParams();
        data.set("id", id_emp);

        this.$axios
          .post(`${this.$config.API}/empleados/eliminar`, data)
          .then((res) => {
            console.log('[DEBUG] deleteEmpleado: API respondió', res.data)
            let msgDat;
            if (parseInt(res.data.eliinado)) {  // Note: API returns 'eliinado' not 'eliminado'
              msgDat = {
                icon: "success",
              };
              console.log('[DEBUG] deleteEmpleado: Empleado eliminado exitosamente, llamando loadData()')
              this.loadData();
            } else {
              msgDat = {
                icon: "warning",
              };
              console.log('[DEBUG] deleteEmpleado: Empleado NO eliminado (deshabilitado), llamando loadData()')
              this.loadData();  // Also reload when disabled
            }

            this.$fire({
              title: "Eliminar Empleado",
              html: `<p>${res.data.message}</p>`,
              type: msgDat.icon,
            });
          })
          .catch((err) => {
            console.log('[DEBUG] deleteEmpleado: Error en API', err)
            this.$fire({
              title: "Eliminar Empleado",
              html: `<p>Ocurrió un error al eliminar el empleado</p><p>${err}</p>`,
              type: "danger",
            });
          })
          .finally(() => {
            console.log('[DEBUG] deleteEmpleado: Finalizando overlay')
            this.overlay = false;
          });
      })
      .catch((err) => {
        console.log('[DEBUG] deleteEmpleado: Usuario canceló eliminación', err);
        return false;
      });
    },
  },
  mounted() {
    console.log('[DEBUG] mounted: Componente montado, iniciando carga inicial')
    this.loadData().then(() => {
      console.log('[DEBUG] mounted: Carga inicial completada', this.dataTable);
      this.overlay = false;
    }).catch(error => {
      console.log('[DEBUG] mounted: Error en carga inicial', error)
      this.overlay = false;
    });
  },
};
</script>
