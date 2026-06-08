<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <b-container fluid v-if="hasAccess">
                <b-row>
                    <b-col>
                        <h1 class="mb-4">{{ titulo }}</h1>
                        <admin-reposicionesReporte />
                    </b-col>
                </b-row>
            </b-container>
            
            <div v-else-if="hasAccess === false">
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
            titulo: "Reporte Reposiciones",
        };
    },
    computed: {
        ...mapState("login", ["dataUser", "access"]),
        hasAccess() {
            // Si accessModule o accessData no están listos, retornar null (cargando/resolviendo)
            const idModulo = this.accessModule?.accessData?.id_modulo;
            if (idModulo === null || idModulo === undefined) {
                return null;
            }
            return idModulo === 5 || idModulo === 1;
        }
    }
};
</script>
