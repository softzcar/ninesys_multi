<template>
    <div>
        <b-row>
            <b-col>
                <b-navbar toggleable="lg" type="dark" variant="info">
                    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

                    <b-collapse id="nav-collapse" is-nav>
                        <b-navbar-nav>
                            <b-nav-item to="/">
                                <b-icon-house-fill></b-icon-house-fill>
                            </b-nav-item>

                            <router-link
                                class="nav-link"
                                to="/test"
                                custom
                                v-slot="{ navigate }"
                            >
                                <span
                                    @click="navigate"
                                    @keypress.enter="navigate"
                                    role="link"
                                >
                                    Control de Producción
                                </span>
                            </router-link>

                            <router-link
                                class="nav-link"
                                to="/produccion/ordenes-activas"
                                custom
                                v-slot="{ navigate }"
                            >
                                <span
                                    @click="navigate"
                                    @keypress.enter="navigate"
                                    role="link"
                                >
                                    Ordenes Activas
                                </span>
                            </router-link>

                            <router-link
                                class="nav-link"
                                to="/ordenes-fechas-entrega"
                                custom
                                v-slot="{ navigate }"
                            >
                                <span
                                    @click="navigate"
                                    @keypress.enter="navigate"
                                    role="link"
                                >
                                    Ordenes fechas de entrega
                                </span>
                            </router-link>

                            <router-link
                                class="nav-link"
                                to="/produccion/cortar"
                                custom
                                v-slot="{ navigate }"
                            >
                                <span
                                    @click="navigate"
                                    @keypress.enter="navigate"
                                    role="link"
                                >
                                    Cortar
                                </span>
                            </router-link>

                            <router-link
                                class="nav-link"
                                to="/produccion/lotes"
                                custom
                                v-slot="{ navigate }"
                            >
                                <span
                                    @click="navigate"
                                    @keypress.enter="navigate"
                                    role="link"
                                >
                                    Lotes
                                </span>
                            </router-link>

                            <!-- <router-link
                class="nav-link"
                to="/produccion/asistencias"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Asistencias old
                </span>
              </router-link> -->

                            <router-link
                                class="nav-link"
                                to="/asistencias"
                                custom
                                v-slot="{ navigate }"
                            >
                                <span
                                    @click="navigate"
                                    @keypress.enter="navigate"
                                    role="link"
                                >
                                    Asistencias
                                </span>
                            </router-link>

                            <b-nav-item-dropdown text="Inventario" right>
                                <router-link
                                    class="nav-link"
                                    to="/inventario/gestion"
                                    custom
                                    v-slot="{ navigate }"
                                >
                                    <span
                                        @click="navigate"
                                        @keypress.enter="navigate"
                                        role="link"
                                    >
                                        Gestión de inventario
                                    </span>
                                </router-link>
                                <hr />
                                <router-link
                                    class="nav-link"
                                    to="/inventario/reportes/orden"
                                    custom
                                    v-slot="{ navigate }"
                                >
                                    <span
                                        @click="navigate"
                                        @keypress.enter="navigate"
                                        role="link"
                                    >
                                        Reporte por orden
                                    </span>
                                </router-link>

                                <router-link
                                    class="nav-link"
                                    to="/inventario/reportes/insumo"
                                    custom
                                    v-slot="{ navigate }"
                                >
                                    <span
                                        @click="navigate"
                                        @keypress.enter="navigate"
                                        role="link"
                                    >
                                        Reporte por insumo
                                    </span>
                                </router-link>
                                <router-link
                                    class="nav-link"
                                    to="/inventario/reportes/producto"
                                    custom
                                    v-slot="{ navigate }"
                                >
                                    <span
                                        @click="navigate"
                                        @keypress.enter="navigate"
                                        role="link"
                                    >
                                        Reporte por producto
                                    </span>
                                </router-link>

                                <router-link
                                    class="nav-link"
                                    to="/inventario/reportes/empleado"
                                    custom
                                    v-slot="{ navigate }"
                                >
                                    <span
                                        por
                                        empleadon
                                        @click="navigate"
                                        @keypress.enter="navigate"
                                        role="link"
                                    >
                                        Reporte
                                    </span>
                                </router-link>
                            </b-nav-item-dropdown>

                            <!-- <router-link
                class="nav-link"
                to="/logout"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Salir
                </span>
              </router-link> -->
                        </b-navbar-nav>

                        <!-- Right aligned nav items -->
                        <!-- <b-navbar-nav class="ml-auto">

            </b-navbar-nav> -->
                    </b-collapse>
                </b-navbar>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import { mapState } from "vuex";
import buscar from "~/components/buscar/BarraDeBusqueda.vue";

export default {
    computed: {
        ...mapState("login", ["dataUser"]),
    },
    components: {
        buscar,
    },
    props: ["user", "departamento"],
};
</script>

<style scoped>
.user-info {
    font-size: 1.2rem;
}

.buscar {
    margin-top: 2rem;
}
</style>
