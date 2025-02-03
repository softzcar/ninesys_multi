<template>
    <div></div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: {
        ...mapState('login', ['access']),
    },

    mounted() {
        this.$store.commit('login/setAccess', false)
        window.location.assign('/')
    },
}
</script>
