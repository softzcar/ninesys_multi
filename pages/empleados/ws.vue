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
                    accessModule.accessData.id_modulo === 4 ||
                    accessModule.accessData.id_modulo === 6 
                "
            >
                <WebSocketClient />
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
