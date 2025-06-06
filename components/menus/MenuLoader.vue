<template>
    <div>
        <!-- <div class="p-6 text-center">
            <div class="flex justify-center space-x-4 mb-6">
                <button @click="showComponent('menus/menuAdmin')"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg">Open
                    Admin</button>
                <button @click="showComponent('menus/menuEmpleado')"
                    class="px-4 py-2 bg-green-500 text-white rounded-lg">Open Empleados</button>
            </div>

        </div> -->

        <b-container style="padding: 0px" class="mb-4" fluid>
            <b-row>
                <b-col>
                    <component :is="asyncComponent" v-if="currentComponent" />
                </b-col>
            <pre class="force">{{ accessModule }} </pre>


                <!-- <b-col v-if="dataUser.departamento === 'Comercialización'">
                    <menus-menuComercializacion />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Diseño'">
                    <menus-menuDisenador />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Producción'">
                    <menus-menuProduccion />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Empleado'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Corte'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Impresión'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Estampado'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Costura'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Limpieza'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Revisión'">
                    <menus-menuEmpleado />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Revisión'">
                    <menus-menu-revision />
                </b-col>

                <b-col v-if="dataUser.departamento === 'Administración'">
                    <menus-menu-admin />
                </b-col> -->
            </b-row>

            <b-row>
                <b-col class="mt-3 mb-3 mr-4 pt-2">
                    <b-row>
                        <b-col>
                            <div class="text-right nombre-empresa">
                                <span class="tit-departament">{{
                                    currentDepartament
                                }}</span>
                                {{ $store.state.login.dataEmpresa.nombre }}
                            </div>
                            <div
                                v-if="
                                    $store.state.login.currentDepartament ===
                                    'Administración'
                                "
                            >
                                <div class="text-right">
                                    <checkConnection
                                        style="float: right; margin-left: 12px"
                                    />
                                </div>
                            </div>

                            <div v-else>
                                <div class="text-right">
                                    <admin-WsSendMsgCustomInterno
                                        style="float: right; margin-left: 12px"
                                    />
                                </div>
                            </div>

                            <div class="user-info text-right">
                                <b-icon icon="person" />
                                {{ dataUser.nombre }} |
                                {{ dataUser.departamento }}
                                <!-- <div class="mt-3"> -->
                                <div class="mt-3">
                                    <b-button-group size="lg">
                                        <b-button
                                            @click="
                                                showComponent(
                                                    departamento.modulo,
                                                    departamento.text,
                                                    departamento.value
                                                )
                                            "
                                            v-for="(
                                                departamento, index
                                            ) in getDepartamentosEmpleadoSelect"
                                            :key="index"
                                            variant="info"
                                            >{{ departamento.text }}</b-button
                                        >

                                        <b-button
                                            variant="info"
                                            @click="goOut()"
                                            >Salir</b-button
                                        >
                                    </b-button-group>
                                </div>
                            </div>
                        </b-col>
                    </b-row>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <div v-if="getDepartamentosEmpleadoSelect.length === 0">
                        <b-alert variant="warning" show>
                            <h4 class="text-center alert-heading">
                                No se encontraron modulos asignados
                            </h4>
                        </b-alert>
                    </div>
                </b-col>
            </b-row>
            <b-row>
                <b-col v-if="currentComponent" class="mr-4 text-right">
                    <buscar-BarraDeBusqueda />
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import mixin from "~/mixins/mixin-login.js";

export default {
    mixins: [mixin],
    computed: {
        asyncComponent() {
            if (!this.currentComponent) return null;
            return () => import(`@/components/${this.currentComponent}.vue`);
        },
        ...mapState("login", [
            "access",
            "dataUser",
            "empleado",
            "currentDepartament",
            "currentComponent",
        ]),
        ...mapGetters("login", ["getDepartamentosEmpleadoSelect"]),
    },

    methods: {
        goOut() {
            this.$confirm(`¿Desea Salir del sistema?`, "Salir", "question")
                .then(() => {
                    this.$router.push(`/logout`);
                })
                .catch(() => {
                    return false;
                });
        },

        showComponent(component, departamento, id_departamento) {
            /* if (departamento == this.currentDepartament) {
                this.$fire({
                    title: `Usted ya se encuentra el em módulo ${departamento}`,
                    html: ``,
                    type: "info",
                })
            } else */
            if (
                this.currentComponent != null &&
                this.currentDepartament != departamento
            ) {
                this.$confirm(
                    `¿Desea cargar el módulo ${departamento}?`,
                    "Cargar Módulo",
                    "question"
                ).then(() => {
                    this.$store.commit(
                        "login/scurrentDepartamentId",
                        id_departamento
                    );
                    this.$store.commit(
                        "login/scurrentDepartament",
                        departamento
                    );
                    this.$store.commit("login/setCurrentComponent", component);
                    this.$router.push("/");
                });
            } else {
                this.$store.commit(
                    "login/scurrentDepartamentId",
                    id_departamento
                );
                this.$store.commit("login/scurrentDepartament", departamento);
                this.$store.commit("login/setCurrentComponent", component);
            }
        },
    },

    mounted() {
        if (this.getDepartamentosEmpleadoSelect.length === 1) {
            this.showComponent(
                this.getDepartamentosEmpleadoSelect[0].modulo,
                this.getDepartamentosEmpleadoSelect[0].text,
                this.getDepartamentosEmpleadoSelect[0].value
            );
        }
    },
};
</script>

<style scoped>
.user-info {
    padding-top: 8px;
}
</style>
