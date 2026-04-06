import { io } from 'socket.io-client';

export default ({ $config, store }, inject) => {
    // Determinar la URL del socket dinámicamente según el dominio actual como respaldo
    let wsUrl = $config.WS_API;

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'app.nineteencustom.com') {
            wsUrl = 'https://ws.nineteencustom.com';
        } else if (hostname === 'app.nineteengreen.com' || hostname.includes('nineteengreen')) {
            wsUrl = 'https://ws.nineteengreen.com';
        }
    }

    // Crear instancia de Socket.io
    const socket = io(wsUrl, {
        autoConnect: false,  // No conectar automáticamente
        transports: ['websocket', 'polling'], // Priorizar websocket
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
