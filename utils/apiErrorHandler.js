/**
 * Normaliza y extrae un mensaje de error legible a partir de cualquier respuesta o excepción de Axios/API.
 *
 * Soporta las estructuras:
 * 1. Slim Framework HttpErrorHandler: error.response.data.error.description
 * 2. ApiResponse helper: error.response.data.message
 * 3. Rutas Legacy / Auth: error.response.data.msg
 * 4. Error directo en string: error.response.data.error (string)
 * 5. Detalle de validaciones: error.response.data.errores (array o object)
 * 6. Fallback a error.message o mensaje por defecto
 *
 * @param {Error|Object|string} error - El objeto de error capturado
 * @param {string} [fallbackMessage] - Mensaje alternativo si no se puede extraer ninguno
 * @returns {string} Mensaje limpio en texto/HTML legible
 */
export function extractApiErrorMessage(error, fallbackMessage = 'Ocurrió un error al procesar la solicitud.') {
  if (!error) {
    return fallbackMessage
  }

  if (typeof error === 'string') {
    return error
  }

  const response = error.response
  const data = response?.data

  // Si no hay respuesta del servidor (error de red, timeout, CORS)
  if (!response) {
    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      return 'El servidor tardó demasiado en responder. Por favor verifique su conexión e intente nuevamente.'
    }
    if (error.message === 'Network Error' || (error.message && error.message.includes('Network'))) {
      return 'No se pudo conectar con el servidor. Verifique su conexión a Internet.'
    }
    return error.message || fallbackMessage
  }

  if (data) {
    // Si la data es directamente un string (ej: HTML de error 500 o texto plano)
    if (typeof data === 'string') {
      // Evitar volcar HTML crudo gigantesco si es una página de error 500 de Apache/Nginx
      if (data.trim().startsWith('<') && data.includes('</body>')) {
        return `Error del servidor (${response.status || 500}). Por favor intente más tarde.`
      }
      return data
    }

    // 1. Formato Slim Framework: { error: { description: "...", type: "..." } }
    if (data.error && typeof data.error === 'object' && data.error.description) {
      const desc = data.error.description
      if (desc !== 'An internal error has occurred while processing your request.') {
        return desc
      }
    }

    // 2. Formato ApiResponse: { success: false, message: "..." }
    if (data.message && typeof data.message === 'string' && data.message.trim() !== '') {
      return data.message
    }

    // 3. Formato Auth / Legacy: { msg: "..." }
    if (data.msg && typeof data.msg === 'string' && data.msg.trim() !== '') {
      return data.msg
    }

    // 4. Formato string simple: { error: "Mensaje..." }
    if (data.error && typeof data.error === 'string' && data.error.trim() !== '') {
      return data.error
    }

    // 5. Formato de lista de errores: { errores: ["err1", "err2"] } o { errores: { campo: "..." } }
    if (data.errores) {
      if (Array.isArray(data.errores) && data.errores.length > 0) {
        return data.errores.map(e => (typeof e === 'string' ? e : JSON.stringify(e))).join('<br/>')
      }
      if (typeof data.errores === 'object') {
        const errorList = Object.values(data.errores).flat()
        if (errorList.length > 0) {
          return errorList.join('<br/>')
        }
      }
    }
  }

  // Si hay código HTTP reconocible
  if (response.status === 401) {
    return 'Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.'
  }
  if (response.status === 403) {
    return 'No tiene permisos suficientes para realizar esta acción.'
  }
  if (response.status === 404) {
    return 'El recurso solicitado no fue encontrado.'
  }
  if (response.status === 409) {
    return 'Conflicto con los datos existentes o registro duplicado.'
  }
  if (response.status >= 500) {
    return `Error interno del servidor (${response.status}). Por favor intente más tarde.`
  }

  return error.message || fallbackMessage
}

/**
 * Retorna un título contextual apropiado según el código de estado HTTP o tipo de error.
 *
 * @param {Error|Object} error
 * @param {string} [defaultTitle='Error']
 * @returns {string}
 */
export function getApiErrorTitle(error, defaultTitle = 'Error') {
  const status = error?.response?.status
  if (!status) return defaultTitle

  switch (status) {
    case 400:
      return 'Datos Incorrectos'
    case 401:
      return 'No Autorizado'
    case 403:
      return 'Acceso Denegado'
    case 404:
      return 'No Encontrado'
    case 409:
      return 'Registro Duplicado o Conflicto'
    case 422:
      return 'Validación Requerida'
    case 500:
    case 502:
    case 503:
      return `Error del Servidor (${status})`
    default:
      return `Error (${status})`
  }
}
