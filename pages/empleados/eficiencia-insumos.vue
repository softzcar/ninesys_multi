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
                <inventario-testEficiencia />
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
            titulo: "Trabajos",
            overlay: true,
        };
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
    methods: {},
    mounted() {
        this.overlay = false;
    },
};
</script>
