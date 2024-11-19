<template>
  <div>
    <b-container>
      <b-row>
        <b-col>
          <h2>{{ callStatus }}</h2>
          <b-card>
            <p><strong>uuid:</strong> {{ this.uuid }}</p>
            <p><strong>Connection Status:</strong> {{ connectionStatus }}</p>
            <p><strong>Call Status:</strong> {{ callStatus }}</p>
            <!-- <p><strong>Respuesta del servidor:</strong> {{ serverResponse }}</p> -->
            <p><strong>Feedback Message:</strong> {{ feedbackMessage }}</p>
            <!-- <p><strong>feedbackStatus:</strong> {{ feedbackStatus }}</p> -->
            <!-- <p><strong>Echo Message:</strong> {{ echoMessage }}</p> -->
            <!-- <p><strong>Broadcast Message:</strong> {{ broadcastMessage }}</p> -->
          </b-card>
        </b-col>
      </b-row>

      <b-row class="mt-3">
        <b-col>
          <b-button @click="triggerAJAX(urlAjax)">Comunicate</b-button>
        </b-col>
        <b-col>
          <b-button @click="talkToOthers()">Broadcast Message</b-button>
        </b-col>
        <!-- <b-col>
          <b-button
            @click="sock.feedback({ data: 'Feedback message from component' })"
            >Feedback Message</b-button
          >
        </b-col>
        <b-col>
          <b-button @click="echo('Echo message from component')"
            >Echo Message</b-button
          >
        </b-col>
        <b-col>
          <b-button @click="enviarMensajeAlServidor()">Comunicate</b-button>
        </b-col> -->
        <b-col>
          <b-button @click="sock.init()">Connect</b-button>
        </b-col>
        <b-col>
          <b-button @click="sock.quit()">Close Socket</b-button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import myMixin from '~/mixins/mixin-ws'

export default {
  data() {
    return {
      // serverResponse: 'null',
      feedbackStatus: null,
      urlAjax: this.$config.API,
    }
  },

  watch: {
    callStatus(val) {
      if (val === 'dead') {
        console.warn('La conexion hamueroto vamos a reiniciarla')
        this.triggerAJAX(urlAjax)
      }
    },
  },

  methods: {
    enviarMensajeAlServidor() {
      const url = this.$config.API
      const method = 'GET'
      const params = {} // Agregar los parámetros que necesites enviar al servidor

      // Llama a la función del mixin para enviar la solicitud al servidor
      this.sendDataToServer(url, method, params)
    },
  },
  mixins: [myMixin],
  mounted() {
    console.log('sock en el componente', this.sock)
    this.initSocket('ws://localhost:8095', '/')
    this.feedbackStatus = this.feedbackMessage
  },
}
</script>
