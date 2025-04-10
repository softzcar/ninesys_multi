<template>
    <div>
        <b-container>
            <b-row>
                <b-col>
                    <h2>Websocket</h2>

                    <p v-if="mensaje">{{ mensaje }}</p>
                    <p v-else>Conectando...</p>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
export default {
    data() {
        return {
            mensaje: null,
        };
    },
    mounted() {
        this.$socket.onmessage = (event) => {
            this.mensaje = event.data;
        };
    },
};
</script>