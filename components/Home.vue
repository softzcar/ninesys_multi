<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
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
                    dataUser.departamento === 'Administración'
                "
            >
                <b-container
                    v-if="dataUser.departamento === 'Comercialización'"
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
                            <h1>ninesys 4.0</h1>
                            <em>Sistema de contro de procesos</em>
                        </b-col>
                    </b-row>
                </b-container>
            </div>

            <div v-else>
                <accessDenied />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
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
