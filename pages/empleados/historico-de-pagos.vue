<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div v-if="dataUser.departamento === 'Administración'">
                <b-overlay :show="overlay" spinner-small>
                    <b-container>
                        <b-row>
                            <b-col>
                                <!-- <h3>aqui estoy</h3> -->
                                <h2 class="mb-4 mt-4 text-center">{{ titulo }}</h2>
                                <admin-PagosHistorico />
                            </b-col>
                        </b-row>
                    </b-container>
                </b-overlay>
            </div>

            <div v-else>
                <accessDenied />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    data() {
        return {
            titulo: 'Histórico de Pagos',
            overlay: true,
        }
    },
    computed: {
        ...mapState('login', ['dataUser', 'access']),
    },

    mounted() {
        this.overlay = false

        /* this.getEmpleados().then(() => {
          console.log('data', this.dataTable)
          this.overlay = false
        }) */
    },
}
</script>
