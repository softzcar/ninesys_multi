// socketPlugin.js
import socketWebClient from '~/utils/socketPluginClient';
import { v4 as uuidv4 } from 'uuid'; // Importar la función para generar UUIDs

var server = 'ws://localhost:8095'

function initializeSocket(server, app) {
    console.log('Inicializando el socket con la URL del servidor:', server);
    return socketWebClient(server, app);
}

export default (context, inject) => {
    console.log('Inyectamos el plugin aqui', server);
    const { socketServerURL } = context.$config; // Obtener la URL del servidor desde las opciones de configuración
    const sock = initializeSocket('ws://localhost:8095', '/');
    console.log('sock', sock);

    // Generar UUID dinámicamente una sola vez y almacenarlo en una variable
    const dynamicUUID = uuidv4();

    // Inyectar el socket en el contexto de la aplicación
    inject('socket', sock);

    sock.saludo = function () {
        return 'Hola desde sock'
    }

    // Agregar los métodos triggerAJAX y talkToOthers al contexto del socket
    sock.triggerAJAX = function () {
        console.log('trigerAJAX');
        const req = new XMLHttpRequest();
        req.open('POST', 'http://localhost/phpClient/simulateBackend.php');
        req.setRequestHeader('Content-Type', 'application/json');

        // Incluir el UUID almacenado en la variable en la solicitud POST junto con los parámetros
        req.send(JSON.stringify({ 'uuid': dynamicUUID, params: { key: 2, msg: 'Hola ws' } }));
    };

    sock.talkToOthers = function () {
        // Resto de la función talkToOthers
        // ...
    };
};
