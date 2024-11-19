<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <b-container>
                <b-row>
                    <b-col>
                        <div v-if="dataUser.departamento === 'Administración' ||
                            dataUser.departamento === 'Comercialización' ||
                            dataUser.departamento === 'Empleado' ||
                            dataUser.departamento === 'Corte' ||
                            dataUser.departamento === 'Impresión' ||
                            dataUser.departamento === 'Estampado' ||
                            dataUser.departamento === 'Costura' ||
                            dataUser.departamento === 'Limpieza' ||
                            dataUser.departamento === 'Revisión' ||
                            dataUser.departamento === 'Diseño'
                            ">
                            <empleados-TablaDePagos :emp="this.$store.state.login.dataUser.id_empleado" />
                        </div>

                        <div v-else>
                            <b-container>
                                <b-row>
                                    <b-col>
                                        <b-alert variant="danger" show>
                                            <h1>Este módulo no existe</h1>
                                        </b-alert>
                                    </b-col>
                                </b-row>
                            </b-container>
                        </div>
                    </b-col>
                </b-row>
            </b-container>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import TablaDePagos from '~/components/empleados/TablaDePagos.vue';

export default {
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
}
</script>
