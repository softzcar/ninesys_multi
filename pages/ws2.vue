<template>
  <div>

    <!-- Botones para interactuar con el servidor -->
    <b-button @click="sendBroadcast">Enviar Broadcast</b-button>
    <b-button @click="sendFeedback">Enviar Feedback</b-button>
    <b-button @click="sendEcho">Enviar Echo</b-button>
    <b-button @click="closeSocket">Cerrar Conexión</b-button>
  </div>
</template>

<script>
// import socketWebClient from '~/path/to/socketWebClient'
import socketWebClient from "~/utils/socketPluginClient.js";

export default {
  data() {
    return {
      serverData: "",
    };
  },
  methods: {
    initWebSocket(initParams) {
      // ...

      // Configurar el callback para manejar el mensaje del servidor
      this.sock.setCallbackReadMessage(this.handleMessage);

      // ...
    },
    handleMessage(data) {
      // Actualizar la información recibida del servidor en la propiedad serverData
      this.serverData = JSON.stringify(data, null, 2);
    },
    sendBroadcast() {
      this.sock.broadcast("Hello from component");
    },
    sendFeedback() {
      this.sock.feedback({ data: "Feedback message from component" });
    },
    sendEcho() {
      this.sock.echo("Echo message from component");
    },
    closeSocket() {
      this.sock.quit();
    },
  },
};
</script>

<style>
/* Estilos de Bootstrap Vue si es necesario */
</style>
