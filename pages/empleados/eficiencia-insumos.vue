<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="
                    accessModule.accessData.id_modulo === 1 ||
                    accessModule.accessData.id_modulo === 2 ||
                    accessModule.accessData.id_modulo === 3 ||
                    accessModule.accessData.id_modulo === 4 
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
