// Aviso de nueva versión disponible.
//
// Nuxt 2 recarga la página automáticamente y sin aviso cuando detecta que un
// chunk de JS ya no existe (típicamente porque hubo un despliegue nuevo
// mientras el usuario tenía la app abierta) -- ver
// @nuxt/vue-app/template/utils.js y el guard de router en .nuxt/client.js,
// ambos llaman a window.location.reload(true) directamente. Esa propiedad no
// se puede interceptar (Location.prototype.reload es non-configurable en
// Chrome), así que en vez de intentar bloquear ese reload reactivo, este
// plugin detecta el despliegue nuevo de forma PROACTIVA: revisa
// periódicamente el manifest de webpack referenciado en "/" (su hash cambia
// en cada build) y, si cambió respecto al que se cargó al abrir la app,
// muestra un aviso propio -- así el usuario casi siempre ve este aviso
// amigable antes de toparse con el reload abrupto de Nuxt.
export default ({ app }) => {
  if (typeof window === 'undefined') return

  const POLL_MS = 3 * 60 * 1000 // cada 3 minutos
  let currentBuildId = null
  let toastShown = false

  function extractBuildId(html) {
    const match = html.match(/_nuxt\/manifest\.([a-f0-9]+)\.js/)
    return match ? match[1] : null
  }

  function showUpdateToast() {
    if (toastShown) return
    toastShown = true

    app.$bvToast.toast(
      [
        app.$createElement('div', { class: 'mb-2' }, 'Hay una nueva versión de la aplicación disponible.'),
        app.$createElement(
          'a',
          {
            attrs: { href: '#' },
            class: 'font-weight-bold',
            on: {
              click(e) {
                e.preventDefault()
                window.location.reload()
              },
            },
          },
          'Haz clic aquí para recargar'
        ),
      ],
      {
        title: 'Actualización disponible',
        variant: 'info',
        solid: true,
        noAutoHide: true,
        toaster: 'b-toaster-bottom-right',
      }
    )
  }

  async function checkForUpdate() {
    if (toastShown) return
    try {
      const res = await fetch(window.location.origin + '/', { cache: 'no-store' })
      const html = await res.text()
      const buildId = extractBuildId(html)
      if (!buildId) return

      if (currentBuildId === null) {
        currentBuildId = buildId
        return
      }
      if (buildId !== currentBuildId) {
        showUpdateToast()
      }
    } catch (e) {
      // Silencioso: un fallo de red puntual no debe molestar al usuario.
    }
  }

  setInterval(checkForUpdate, POLL_MS)
}
