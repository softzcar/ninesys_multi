<template>
  <div class="container mt-4">
    <b-card>
      <b-card-title>Websocket Client</b-card-title>
      <b-card-body>
        <b-button
          @click="enviarMensajeAlServidor"
          variant="primary"
        >Enviar Mensaje</b-button>
        <b-alert
          :variant="alertVariant"
          show
          dismissible
        >
          {{ msgMounted }}
        </b-alert>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      wsResponse: null,
      alertVariant: "info",
      msgMounted: "",
      packet: "feedback",
    };
  },
  computed: {
    formattedResponse() {
      if (!this.wsResponse) return "";
      return JSON.stringify(this.wsResponse, null, 2);
    },
  },
  methods: {
    enviarMensajeAlServidor() {
      this.$socket.triggerAJAX(this.$socket.uuid());
    },
  },
  mounted() {
    this.$socket.setCallbackReadMessage((packet) => {
      try {
        this.wsResponse = JSON.parse(packet);
        this.alertVariant = "success"; // Cambiar el color de la alerta a éxito
        this.msgMounted = "Todo parece ir bien por aqui";
      } catch (error) {
        console.error(
          "Error al parsear la respuesta JSON del servidor:",
          error
        );
        this.msgMounted = "Error al parsear la respuesta JSON del servidor:";
        this.alertVariant = "danger"; // Cambiar el color de la alerta a peligro en caso de error
      }
    });
  },
};
</script>
