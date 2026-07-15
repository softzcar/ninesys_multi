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
        // Desregistrar Service Workers de forma agresiva
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (const registration of registrations) {
                    registration.unregister();
                }
            });
        }
        if ('caches' in window) {
            caches.keys().then(names => {
                for (const name of names) {
                    caches.delete(name);
                }
            });
        }

        this.$store.commit('login/logout')
        window.location.assign('/')
    },
}
</script>
