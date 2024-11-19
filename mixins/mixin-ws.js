// mixins/mixin-ws.js
import axios from 'axios'
import socketWebClient from '~/utils/socketPluginClient.js'

export default {
  methods: {
    startGUI() {
      'use strict'
      var uuid,
        i,
        longString = ''

      this.sock = socketWebClient(this.server, '/')

      // ... Resto del código del mixin ...
    },
    initSocket() {
      this.sock = socketWebClient(this.server, '/')
      this.sock.setCallbackReady(this.ready)
      this.sock.setCallbackReadMessage(this.readMessage)
      this.sock.setCallbackStatus(this.sockStatus)
      this.sock.setCallbackClose(this.closeSocket)
      this.sock.init()
      console.log('Socket iniciado', this.sock)
    },
    sockStatus(m) {
      // Report connection status
      this.connectionStatus = m
    },
    closeSocket() {
      // Report connection status
      this.connectionStatus = 'Server is gone; closed socket'
    },
    readMessage(packet) {
      // Respond to messages from server
      if (packet.opcode === 'broadcast') {
        this.broadcastMessage = packet.message
      } else if (packet.opcode === 'feedback') {
        this.feedbackMessage = packet.message.response
        console.log('this.feedbackMessage', this.feedbackMessage)
        console.log('JSON.stringify(packet.message)', packet.message.response)
      } else if (packet.opcode === 'echo') {
        this.echoMessage = packet.message
      } /* else if (packet.opcode === 'update') {
        this.serverResponse = packet.message // Guardar los datos actualizados en la variable serverResponse
      } */ else if (packet.opcode === 'update') {
        this.serverResponse = packet.message.response.status // Guardar los datos actualizados en la variable serverResponse
      }
    },
    ready() {
      // We have now the uuid from the server and can start
      this.uuid = this.sock.uuid()
      this.talkToOthers()
    },
    talkToOthers() {
      // Test if messages appear in other web clients in the same order as sent
      // No message is lost, and very long messages are buffered
      // this.sock.broadcast(`hallo11 from :${this.uuid}`)
      // this.sock.broadcast(`hallo22 from :${this.uuid}`)
      // this.sock.broadcast(`hallo33 from :${this.uuid}`)
      // this.sock.broadcast(`hallo44 from :${this.uuid}`)
      this.sock.broadcast(this.longString + this.uuid)
    },
    triggerAJAX_original() {
      //****************************************
      // start dummy backend script
      //****************************************
      var req
      req = new XMLHttpRequest()
      req.open('POST', 'http://localhost/phpClient/simulateBackend.php')
      req.setRequestHeader('Content-Type', 'application/json')
      req.send(
        JSON.stringify({
          uuid: uuid,
        })
      )
    },
    async triggerAJAX_axios() {
      const requestData = {
        testsend: 'prueba de envio de datos desde AXIOS',
        uuid: this.uuid,
      }

      await axios
        .post(`http://localhost/phpClient/simulateBackend.php`, requestData)
        .then((res) => {
          console.log('Respuesta del Websocket', res)
          this.feedbackMessage =
            'Respuesta recibida del servidor: ' + JSON.stringify(res)
        })
        .catch((err) => {
          this.feedbackMessage =
            'Error de conexión o respuesta del servidor: ' + err
          console.log('Error en la conexión a websocket', err)
        })
        .finally(() => {
          console.log('Hacer algo en finally')
        })
    },

    triggerAJAX(url) {
      this.feedbackMessage = 'Esperando respuesta del servidor...'
      this.callStatus = 'Calling...'
      // Start dummy backend script
      const req = new XMLHttpRequest()
      req.open('POST', 'http://localhost/phpClient/simulateBackend.php')
      req.setRequestHeader('Content-Type', 'application/json')
      req.send(
        JSON.stringify({
          uuid: this.uuid,
          testsend: 'prueba de envio de datos',
          url: url,
        })
        // JSON.stringify({ uuid: this.uuid, params: { key: 2, msg: 'Hola ws' } })
      )
    },
    echo() {
      this.sock.echo(`ECHO from :${this.uuid}`)
    },
    sendDataToServer(url, method, params) {
      // Construir el objeto con la solicitud
      const requestData = {
        url,
        method,
        params,
        uuid: this.uuid, // Agregar el UUID actual del cliente para identificarlo en el servidor
      }

      // Enviar la solicitud al servidor mediante el método sendMsg del socket
      this.sock.feedback(requestData)
    },
  },

  watch: {
    feedbackMessage(val) {
      let msg
      const status = val.status

      if (status != undefined) {
        this.callStatus = status
      }

      if (val === 'Preparado para recibir datos del WebSocket') {
        msg = 'Ready ::: ' + status
      } else if ((val != null || val === '') && status === 'dead') {
        msg = 'La conexión ha muerto ::: ' + status
      } else if (status === 'alive') {
        msg = 'La conexion esta viva ::: ' + status
      } else {
        msg = 'Estableciendo conexión...' + status
      }
      console.log(msg, val)
      this.serverResponse = msg
      // return msg
    },
  },

  data() {
    return {
      server: 'ws://localhost:8095',
      sock: null,
      uuid: '',
      serverResponse: 'Waiting...',
      longString: 'Message ::: ',
      /* longString: Array(16 * 10)
        .fill('X>')
        .join(''), */
      callStatus: 'dead',
      connectionStatus: '',
      broadcastMessage: null,
      feedbackMessage: 'Preparado para recibir datos del WebSocket',
      echoMessage: '',
    }
  },
  created() {
    // Iniciar el socket cuando se crea el componente
    this.initSocket()
    // this.uuid = this.sock.uuid()
    // this.ready()
  },
}
