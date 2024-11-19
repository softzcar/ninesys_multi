<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-6">
        <h4>
          Status:
          <span id="connect" style="font-size: 1.2em">not connected</span>
        </h4>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <b-button class="mr-2" variant="primary" @click="connect"
          >Connect to Server</b-button
        >
        <b-button variant="danger" @click="closeConnection"
          >Close connection</b-button
        >
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-md-12">
        <b-card>
          <b-button variant="secondary" @click="callBackend"
            >CALL Backend via AJAX</b-button
          >
          <div class="mt-3">Here you will see feedback from backend :</div>
          <pre>{{ feedback }}</pre>
        </b-card>
      </div>
      <div class="col-md-6">
        <b-card>
          <b-button variant="secondary" @click="echoMessage"
            >Echo message</b-button
          >
          <div class="mt-3">Here you will see echo :</div>
          <pre>{{ echoMsg }}</pre>
        </b-card>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-md-6">
        <b-card>
          <b-button variant="secondary" @click="pingMe">Ping me</b-button>
          <div class="mt-3">Here you will see ping :</div>
          <b
            ><span id="pingmsg">{{ pingMsg }}</span></b
          >
        </b-card>
      </div>
    </div>
    <hr />
    <div class="row mt-4">
      <div class="col-md-6">
        <b-button variant="success" @click="talkToOthers">
          Talk to others; my UUID=<b>{{ uuid }}</b>
        </b-button>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-md-6">
        <b-card>
          <h4>Messages from other web clients:</h4>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from '~/mixins/mixins.js'
export default {
  data() {
    return {
      feedback: '',
      echoMsg: '',
      pingMsg: '', // Propiedad para el mensaje de "ping"
      uuid: '',
    }
  },
  methods: {
    /*
    //********************************************
      //  instrument the buttons
      //*******************************************

      document.getElementById('open').onclick = sock.init;
      document.getElementById('close').onclick = sock.quit;
      document.getElementById('ready').onclick = talkToOthers;
      document.getElementById('ajax').onclick = triggerAJAX;
      document.getElementById('echo').onclick = echo;
      document.getElementById('uuid').innerHTML = uuid; 
     */
    connect() {
      // Lógica para conectarse al servidor
    },
    closeConnection() {
      // Lógica para cerrar la conexión
    },
    callBackend() {
      // Lógica para llamar al backend vía AJAX
    },
    echoMessage() {
      // Lógica para enviar un mensaje de eco
    },
    pingMe() {
      // Lógica para realizar el "ping"
    },
    talkToOthers() {
      // Lógica para comunicarse con otros usuarios
    },
  },
  mixins: [mixin],
  mounted() {
    this.socketWebClient()
    this.startGUI()
  },
}
</script>
