<template>
    <div>
        <div v-if="access">
            <menus-MenuLoader />
            <div v-if="accessModule.accessData.id_modulo === 1">
                <b-container>
                    <b-row>
                        <b-col>
                            <h1 class="mb-4">Multiplicador de Precio</h1>
                            <admin-MultiplicadorPrecio />
                        </b-col>
                    </b-row>
                </b-container>
            </div>
            <div v-else>
                <accessDenied />
            </div>
        </div>
        <div v-else>
            <login-form />
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import accessModuleMixin from "~/mixins/mixin-login.js";

export default {
    name: 'MultiplicadorPrecioPage',

    mixins: [accessModuleMixin],

    computed: {
        ...mapState('login', ['dataUser', 'access'])
    }
}
</script>
