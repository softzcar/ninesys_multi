<template>
  <div>
    <b-container>
      <b-row>
        <b-col>
          <b-card>
            <p><strong>uuid:</strong> {{ this.uuid }}</p>
            <p><strong>Connection Status:</strong> {{ connectionStatus }}</p>
            <p><strong>Broadcast Message:</strong> {{ broadcastMessage }}</p>
            <p><strong>Feedback Message:</strong> {{ feedbackMessage }}</p>
            <p><strong>Echo Message:</strong> {{ echoMessage }}</p>
          </b-card>
        </b-col>
      </b-row>

      <b-row class="mt-3">
        <b-col>
          <b-button @click="talkToOthers()">Broadcast Message</b-button>
        </b-col>
        <b-col>
          <b-button
            @click="
              sock.feedback({ data: 'Feedback message from component !!!' })
            "
            >Feedback Message</b-button
          >
        </b-col>
        <b-col>
          <b-button @click="triggerAJAX()">AJAX</b-button>
        </b-col>
        <b-col>
          <b-button @click="echo('Echo message from component')"
            >Echo Message</b-button
          >
        </b-col>
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
  mixins: [myMixin],
  mounted() {
    console.log('sock en el componente', this.sock)
  },
  /* created() {
    this.startGUI() // Llamamos a la función startGUI del mixin cuando se crea el componente
  }, */
}
</script>

<style>
/* Aquí puedes agregar estilos personalizados si es necesario */
</style>
