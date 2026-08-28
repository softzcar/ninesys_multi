import Vue from 'vue'
import VueSimpleAlert from 'vue-simple-alert'
import { extractApiErrorMessage, getApiErrorTitle } from '@/utils/apiErrorHandler'

Vue.use(VueSimpleAlert)

// Helper para extraer el texto de un error de API en cualquier componente
Vue.prototype.$extractApiError = function (error, fallbackMessage) {
  return extractApiErrorMessage(error, fallbackMessage)
}

// Helper para mostrar error formateado via SweetAlert ($fire) o Toast ($bvToast)
Vue.prototype.$handleApiError = function (error, options = {}) {
  // Evita que el interceptor global dispare un toast duplicado si la petición no lo había suprimido
  if (error && error.config) {
    error.config.suppressGlobalErrorToast = true
  }

  const message = extractApiErrorMessage(error, options.fallbackMessage)
  const title = options.title || getApiErrorTitle(error, 'Error')
  const type = options.type || 'modal' // 'modal' ($fire) o 'toast' ($bvToast)

  if (type === 'toast') {
    const bvToast = this.$bvToast || (typeof window !== 'undefined' && window.$nuxt && window.$nuxt.$bvToast)
    if (bvToast) {
      bvToast.toast(message, {
        title,
        variant: options.variant || 'danger',
        autoHideDelay: options.autoHideDelay || 6000,
        appendToast: true,
        solid: true,
      })
    }
  } else {
    // Por defecto 'modal' usando SweetAlert ($fire)
    if (typeof this.$fire === 'function') {
      this.$fire({
        title,
        html: `<p>${message}</p>`,
        type: options.alertType || 'error',
      })
    }
  }

  return message
}

