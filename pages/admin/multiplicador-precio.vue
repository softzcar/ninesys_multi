<template>
    <div>
        <div v-if="access">
            <menus-MenuLoader />
            <div v-if="dataUser.departamento === 'Administración'">
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

export default {
    name: 'MultiplicadorPrecioPage',

    computed: {
        ...mapState('login', ['dataUser', 'access'])
    }
}
</script>
