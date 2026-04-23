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
