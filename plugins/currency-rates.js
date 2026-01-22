/**
 * Plugin de Nuxt para cargar tasas de cambio automáticamente
 * @module currency-rates
 */

/**
 * Obtiene las tasas de cambio desde APIs externas
 * @returns {Promise<Object>} Objeto con las tasas actualizadas
 */
export async function obtenerIndicadoresVenezuela() {
    try {
        // 1. Llamadas paralelas a las APIs
        // BCV: Proxy Backend (para evitar CORS)
        // Paralelo: API anterior (ve.dolarapi.com)
        // Global: API de monedas

        // Determinar URL base de la API
        // El usuario indicó explícitamente que debe apuntar a la API en VPS incluso en desarrollo
        const apiBaseUrl = 'https://apidev.nineteengreen.com';

        const [resBcv, resVzla, resGlobal] = await Promise.all([
            fetch(`${apiBaseUrl}/bcv-rates`),
            fetch('https://ve.dolarapi.com/v1/dolares'),
            fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
        ]);

        let bcv = null;
        let paralelo = null;

        // Procesar BCV (Prioridad Alta)
        if (resBcv.ok) {
            const dataBcv = await resBcv.json();
            // La nueva API devuelve { rates: { usd: 123.45 }, ... }
            if (dataBcv.rates && dataBcv.rates.usd) {
                bcv = dataBcv.rates.usd;
            }
        }

        // Procesar Paralelo (Intento Best-Effort)
        if (resVzla.ok) {
            try {
                const dataVzla = await resVzla.json();
                paralelo = dataVzla.find(d => d.fuente === 'paralelo')?.promedio;

                // Si BCV falló con la nueva API, intentamos obtenerlo de la vieja como respaldo
                if (!bcv) {
                    const bcvOld = dataVzla.find(d => d.fuente === 'oficial')?.promedio;
                    if (bcvOld) bcv = bcvOld;
                }
            } catch (e) {
                console.warn('Error parseando respuesta de dolarapi:', e);
            }
        }

        // Validaciones críticas
        if (!bcv) {
            throw new Error('No se pudo obtener la tasa BCV de ninguna fuente');
        }

        // Si falla el paralelo, usamos BCV como fallback para evitar romper la app, 
        // pero idealmente deberíamos notificar o manejarlo en UI. 
        // Por ahora mantenemos la lógica de que si no hay paralelo, usamos BCV * 1.0 (o null si la lógica de negocio lo prefiere, 
        // pero el código original lanzaba error).
        // El código original lanzaba error si !paralelo. Vamos a ser más permisivos.
        if (!paralelo) {
            console.warn('No se pudo obtener tasa Paralelo, usando BCV como referencia');
            paralelo = bcv;
        }

        // 3. Extraer tasa de Peso Colombiano
        let tasaCop = null;
        if (resGlobal.ok) {
            const dataGlobal = await resGlobal.json();
            tasaCop = dataGlobal.usd?.cop;
        }

        if (!tasaCop) {
            // Fallback harcodeado o error? El original lanzaba error.
            // Intentaremos ser robustos.
            throw new Error('No se encontró la tasa del Peso Colombiano');
        }

        // 4. Construir respuesta en formato compatible con el sistema
        const resultado = {
            success: true,
            timestamp: new Date().toISOString(),
            tasas: {
                dolar: 1, // Siempre 1 (moneda base)
                bolivar: parseFloat(bcv.toFixed(4)), // BCV con 4 decimales para precisión
                peso_colombiano: parseFloat(tasaCop.toFixed(2))
            },
            metadata: {
                fuente_bolivar: 'bcv_justcarlux',
                bcv_disponible: bcv,
                paralelo_disponible: paralelo,
                ultima_actualizacion: new Date().toLocaleString('es-VE', {
                    timeZone: 'America/Caracas'
                })
            }
        };

        return resultado;

    } catch (error) {
        console.error('Error obteniendo tasas de cambio:', error);
        return {
            success: false,
            error: error.message,
            tasas: null
        };
    }
}

/**
 * Obtiene tasas con sistema de fallback (localStorage)
 * @returns {Promise<Object>} Tasas obtenidas o desde caché
 */
export async function obtenerTasasConFallback() {
    // Intento 1: APIs externas
    const tasas = await obtenerIndicadoresVenezuela();

    if (tasas.success) {
        // Guardar tasas exitosas en localStorage
        try {
            localStorage.setItem('ultimas_tasas_exitosas', JSON.stringify({
                ...tasas,
                savedAt: Date.now()
            }));
        } catch (e) {
            console.warn('No se pudo guardar en localStorage:', e);
        }
        return { ...tasas, fallback: false };
    }

    // Intento 2: Última tasa guardada en localStorage
    try {
        const ultimas = localStorage.getItem('ultimas_tasas_exitosas');
        if (ultimas) {
            const parsed = JSON.parse(ultimas);

            // Verificar que no sean muy antiguas (< 24 horas)
            const horasTranscurridas = (Date.now() - parsed.savedAt) / (1000 * 60 * 60);

            if (horasTranscurridas < 24) {
                console.warn('Usando tasas desde caché (localStorage). Antigüedad:',
                    horasTranscurridas.toFixed(1), 'horas');
                return {
                    success: true,
                    timestamp: parsed.timestamp,
                    tasas: parsed.tasas,
                    metadata: {
                        ...parsed.metadata,
                        cache_age_hours: horasTranscurridas.toFixed(1)
                    },
                    fallback: true
                };
            }
        }
    } catch (e) {
        console.error('Error leyendo localStorage:', e);
    }

    // Intento 3: Fallo completo
    return {
        success: false,
        require_manual: true,
        error: 'No se pudieron obtener tasas de las APIs ni del caché'
    };
}

/**
 * Valida que una tasa esté dentro de rangos aceptables
 * @param {string} moneda - Nombre de la moneda
 * @param {number} valor - Valor de la tasa
 * @returns {Object} { valid: boolean, message: string }
 */
export function validarTasa(moneda, valor) {
    const rangos = {
        bolivar: { min: 20, max: 200 },           // VES por USD
        peso_colombiano: { min: 3000, max: 6000 } // COP por USD
    };

    const rango = rangos[moneda];

    if (!rango) {
        return { valid: true, message: 'Sin validación configurada' };
    }

    if (valor < rango.min || valor > rango.max) {
        return {
            valid: false,
            message: `Valor fuera de rango esperado (${rango.min}-${rango.max})`
        };
    }

    return { valid: true, message: 'Valor válido' };
}

/**
 * Plugin de Nuxt que inyecta las funciones en el contexto
 */
export default ({ app }, inject) => {
    // Inyectar las funciones en el contexto de Nuxt
    inject('currencyRates', {
        obtenerIndicadoresVenezuela,
        obtenerTasasConFallback,
        validarTasa
    });
};
