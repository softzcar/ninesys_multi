<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="
                    dataUser.departamento === 'Administración' ||
                    dataUser.departamento === 'Comercialización' ||
                    dataUser.departamento === 'Empleado' ||
                    dataUser.departamento === 'Corte' ||
                    dataUser.departamento === 'Impresión' ||
                    dataUser.departamento === 'Estampado' ||
                    dataUser.departamento === 'Costura' ||
                    dataUser.departamento === 'Limpieza' ||
                    dataUser.departamento === 'Revisión' ||
                    dataUser.departamento === 'Diseño'
                "
            >
                <b-overlay :show="overlay" spinner-small>
                    <b-container fluid>
                        <b-row>
                            <b-col>
                                <!-- <h3>aqui estoy</h3> -->
                                <h3 class="mb-4 mt-4 text-center">
                                    {{ titulo }}
                                </h3>
                                <empleados-TablaDePagos
                                    :emp="dataUser.id_empleado"
                                />
                            </b-col>
                        </b-row>
                        <!-- <b-row>
              <b-col>
                <b-table
                  responsive
                  :fields="dataTable.fields"
                  :items="dataTable.items"
                >
                  <template #cell(acciones)="data">
                    <span class="floatme">
                      <AdminEmpleadoEditar
                        :item="data.item"
                        @reload="getEmpleados"
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
                  </template>
                </b-table>
              </b-col>
            </b-row> -->
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
import { mapState } from "vuex"
import axios from "axios"

export default {
    data() {
        return {
            titulo: "Trabajos",
            overlay: true,
            dataTable: [],
        }
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
    methods: {
        async getEmpleados() {
            await this.$axios
                .get(`${this.$config.API}/empleados`)
                .then((resp) => {
                    this.dataTable = resp.data
                    this.overlay = false
                })
        },

        deleteEmpleado(id_emp) {
            this.$confirm(
                `¿Desea Elimiar el empleado ${id_emp} ?`,
                "Eliminar Empleado",
                "warning"
            )
                .then(() => {
                    this.overlay = true
                    const data = new URLSearchParams()
                    data.set("id", id_emp)

                    axios
                        .post(`${this.$config.API}/empleados/eliminar`, data)
                        .then((res) => {
                            this.getEmpleados().then(
                                () => (this.overlay = false)
                            )
                        })
                })
                .catch((err) => {
                    console.log("CATCH!!!", err)
                    return false
                })
        },
    },
    mounted() {
        this.overlay = false

        /* this.getEmpleados().then(() => {
      console.log('data', this.dataTable)
      this.overlay = false
    }) */
    },
}
</script>
