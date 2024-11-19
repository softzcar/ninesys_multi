// mixins/mixin-ws.js
import axios from 'axios';
import socketWebClient from '~/utils/socketPluginClient.js';

export default {
    methods: {
        startGUI() {
            'use strict';
            var uuid, i, longString = '';

            this.sock = socketWebClient(this.server, '/');

            // ... Resto del código del mixin ...
        },
        initSocket() {
            this.sock = socketWebClient(this.server, '/');
            this.sock.setCallbackReady(this.ready);
            this.sock.setCallbackReadMessage(this.readMessage);
            this.sock.setCallbackStatus(this.sockStatus);
            this.sock.setCallbackClose(this.closeSocket);
            this.sock.init();
            console.log('Socket iniciado', this.sock);
        },
        sockStatus(m) {
            // Report connection status
            this.connectionStatus = m;
        },
        closeSocket() {
            // Report connection status
            this.connectionStatus = 'Server is gone; closed socket';
        },
        readMessage(packet) {
            // Respond to messages from server
            if (packet.opcode === 'broadcast') {
                this.broadcastMessage = packet.message;
            } else if (packet.opcode === 'feedback') {
                this.feedbackMessage = JSON.stringify(packet.message.data);
            } else if (packet.opcode === 'echo') {
                this.echoMessage = packet.message;
            }
        },
        ready() {
            // We have now the uuid from the server and can start
            this.uuid = this.sock.uuid();
            this.talkToOthers();
        },
        talkToOthers() {
            // Test if messages appear in other web clients in the same order as sent
            // No message is lost, and very long messages are buffered
            this.sock.broadcast(`hallo11 from :${this.uuid}`);
            this.sock.broadcast(`hallo22 from :${this.uuid}`);
            this.sock.broadcast(`hallo33 from :${this.uuid}`);
            this.sock.broadcast(`hallo44 from :${this.uuid}`);
            this.sock.broadcast(this.longString + this.uuid);
        },
        triggerAJAX() {
            // Start dummy backend script
            const req = new XMLHttpRequest();
            req.open('POST', 'http://localhost/phpClient/simulateBackend.php');
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify({ 'uuid': this.uuid, params: { key: 2, msg: 'Hola ws' } }));
        },
        /* triggerAJAX() {
            // Start dummy backend script
            const req = new XMLHttpRequest();
            req.open('POST', 'http://localhost/phpClient/simulateBackend.php');
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify({ 'uuid': this.uuid, params: { key: 2, msg: 'Hola ws' } }));
        }, */
        echo() {
            this.sock.echo(`ECHO from :${this.uuid}`);
        }
    },
    data() {
        return {
            server: 'ws://localhost:8095',
            sock: null,
            uuid: '',
            longString: Array(16 * 10).fill('X>').join(''),
            connectionStatus: '',
            broadcastMessage: '',
            feedbackMessage: 'okok',
            echoMessage: ''
        }
    },
    created() {
        // Iniciar el socket cuando se crea el componente
        this.initSocket();
        // this.uuid = this.sock.uuid()
        // this.ready()
    },
}
