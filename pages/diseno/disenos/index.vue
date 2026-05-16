<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="
                    accessModule.accessData.id_modulo === 3 ||
                    accessModule.accessData.id_modulo === 2 ||
                    accessModule.accessData.id_modulo === 1
                "
            >
                <b-container>
                    <b-row class="mb-3 align-items-center">
                        <b-col>
                            <h1 class="mb-0">{{ titulo }}</h1>
                        </b-col>
                        <b-col cols="auto">
                            <b-button variant="outline-secondary" @click="$router.push('/diseno/galeria')">
                                📷 Galería de Catálogo
                            </b-button>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col>
                            <disenosse-asignados />
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
import mixin from "~/mixins/mixin-login.js";

export default {
    mixins: [mixin],

    data() {
        return {
            titulo: "",
        };
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
    },
};
</script>
