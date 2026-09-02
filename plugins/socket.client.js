import { io } from 'socket.io-client';

export default ({ $config, store }, inject) => {
    // deploy.sh exporta WS_URL explícitamente para cada destino (ninesys19.com
    // o nineteengreen.com) antes de compilar, así que $config.WS_API ya viene
    // horneado con el valor correcto para este build -- no hace falta
    // adivinarlo de nuevo a partir del hostname del navegador.
    const wsUrl = $config.WS_API;

    console.log('[Socket.io] Plugin inicializado. URL destino:', wsUrl);

    // Crear instancia de Socket.io
    // Priorizamos 'polling' primero para evitar bloqueos cuando el proxy
    // (nginx, cloudflare, etc.) no hace el upgrade correcto a WebSocket.
    const socket = io(wsUrl, {
        autoConnect: false,        // No conectar automáticamente
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1500,
        timeout: 10000,            // 10s (antes default 20s)
    });

    // Logging para debug
    socket.on('connect', () => {
        console.log('[Socket.io] ✓ Conectado. id:', socket.id, 'transport:', socket.io.engine.transport.name);
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket.io] ✗ Desconectado:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket.io] Error de conexión:', error.message, '→ URL:', wsUrl);
    });

    // Log de TODOS los eventos que lleguen del servidor (para debug)
    socket.onAny((event, ...args) => {
        console.log('[Socket.io] ← evento:', event, args);
    });

    // Inyectar socket en el contexto de Nuxt como $wsSocket
    // (evita conflicto con el socketPlugin.js legacy que ya usa $socket)
    inject('wsSocket', socket);
};
