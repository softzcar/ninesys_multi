import { io } from 'socket.io-client';

export default ({ $config, store }, inject) => {
    // Crear instancia de Socket.io
    const socket = io($config.WS_API, {
        autoConnect: false,  // No conectar automáticamente
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    // Logging para debug
    socket.on('connect', () => {
        console.log('[Socket.io] Conectado:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket.io] Desconectado:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket.io] Error de conexión:', error.message);
    });

    // Inyectar socket en el contexto de Nuxt
    inject('socket', socket);
};
