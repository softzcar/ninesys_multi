// plugins/websocket.js
export default function ({ app }, inject) {
    const socket = new WebSocket('ws://194.195.86.253:3900');
    
    console.log(`inicaando websocket`);
    

  socket.onopen = () => {
    console.log('Conexión WebSocket establecida (plugin)');
  };

  socket.onmessage = event => {
    console.log('Mensaje WebSocket recibido (plugin):', event.data);
  };

  socket.onerror = error => {
    console.error('Error WebSocket (plugin):', error);
  };

  socket.onclose = () => {
    console.log('Conexión WebSocket cerrada (plugin)');
  };

  inject('socket', socket);
};