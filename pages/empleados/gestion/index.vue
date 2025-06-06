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
                <b-overlay :show="overlay" spinner-small>
                    <b-container fluid>
                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <AdminEmpleadoNuevo :departamentos="departamentos" @reload="loadData" />
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-table responsive :fields="dataTable.fields" :items="dataTable.items">
                                    <template #cell(departamentos)="data">
                                        <!-- {{ data.item.departamentos }} -->
                                        <div v-for="dep in data.item.departamentos" :key="dep.id">
                                            {{ dep.nombre }}
                                        </div>
                                    </template>

                                    <template #cell(acciones)="data">
                                        <span class="floatme">
                                            <AdminEmpleadoEditar :departamentos="departamentos" :item="data.item"
                                                @reload="loadData" />
                                        </span>
                                        <span class="floatme">
                                            <b-button variant="danger" v-on:click="
                                                deleteEmpleado(
                                                    data.item._id
                                                )
                                                ">
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
import { mapState } from "vuex"
import mixin from "~/mixins/mixin-login.js";

export default {
    mixins: [mixin],

    data() {
        return {
            titulo: "Gestión de Empleados",
            overlay: true,
            dataTable: [],
            departamentos: [],
        }
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
    methods: {
        async loadData() {
            await Promise.all([this.getDepartamentos(), this.getEmpleados()]);
        }
        ,
        async getDepartamentos() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/departamentos`)
                .then((res) => {
                    this.departamentos = res.data
                    this.$store.commit("login/setDepartamentos", res.data)
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error cargando los departamentos",
                        html: `<p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },

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
                "question"
            )
                .then(() => {
                    this.overlay = true
                    const data = new URLSearchParams()
                    data.set("id", id_emp)

                    this.$axios
                        .post(`${this.$config.API}/empleados/eliminar`, data)
                        .then((res) => {
                            let msgDat
                            if (parseInt(res.data.asignaciones) === 0) {
                                msgDat = {
                                    icon: 'success',
                                    msg: 'El empleado ha sido eliminado'
                                }
                                this.getEmpleados()
                            } else {
                                msgDat = {
                                    icon: 'warning',
                                    msg: 'El empleado tiene registros de tareas realizadas previamente y no se puede eliminar'
                                }
                            }

                            this.$fire({
                                title: "Eliminar Empleado",
                                html: `<p>${msgDat.msg}</p>`,
                                type: msgDat.icon,
                            })
                        }).catch((err) => {
                            this.$fire({
                                title: "Eliminar Empleado",
                                html: `<p>Ocurrió un error al eliminar el empleado</p><p>${err}</p>`,
                                type: "danger",
                            })
                        }).finally(() => {
                            this.overlay = false
                        })
                })
                .catch((err) => {
                    console.log("CATCH!!!", err)
                    return false
                })
        },
    },
    mounted() {
        this.loadData().then(() => {
            console.log("data", this.dataTable)
            this.overlay = false
        })
    },
}
</script>
