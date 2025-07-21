<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <!-- <div v-else>
                        <menus-MenuLoader />

                <div
                    v-if="
                        dataUser.departamento === 'Comercialización' ||
                        dataUser.departamento === 'Jefe de diseño' ||
                        dataUser.departamento === 'Diseño' ||
                        dataUser.departamento === 'Producción' ||
                        dataUser.departamento === 'Empleado' ||
                        dataUser.departamento === 'Corte' ||
                        dataUser.departamento === 'Impresión' ||
                        dataUser.departamento === 'Estampado' ||
                        dataUser.departamento === 'Costura' ||
                        dataUser.departamento === 'Limpieza' ||
                        dataUser.departamento === 'Revisión' ||
                        dataUser.departamento === 'montar tallas' ||
                        dataUser.departamento === 'Administración'
                    "
                > -->
            <div v-if="accessModule.access || accessModule.access === null">
                
                <!-- Si es comercialización -->
                <b-container
                    v-if="accessModule.accessData.id_modulo === 2"
                >
                    <b-row>
                        <b-col>
                            <ordenes-nueva />
                        </b-col>
                    </b-row>
                </b-container>

                <b-container v-else>
                    <b-row
                        class="text-center vh-100"
                        style="margin-top: -8rem"
                        align-v="center"
                    >
                        <b-col>
                            <h1>ninesys</h1>
                            <em>CONTROL DE PROCESOS DE PRODUCCIÓN</em>
                            <br>
                            <em>V 4.1.0</em>
                        </b-col>
                    </b-row>
                </b-container>
            </div>

            <div v-else>
                <h3>Dennied en Home.vue</h3>
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
            response: [],
            m: null,
        };
    },
    computed: {
        ...mapState("login", ["access", "dataUser"]),
    },
};
</script>
