const RUTAS_EXENTAS_WIZARD_OPERATIVO = ["/", "/login", "/logout", "/configuracion-operativa"]

// Auditoría de seguridad 2026-09-15 (Fase G, hallazgo real probando end-to-end
// con datos reales): páginas públicas para un CLIENTE externo sin cuenta de
// Ninesys (llegan desde un enlace de WhatsApp con su propia validación --
// token firmado en la URL, ver AprobacionClienteHelper.php -- no una sesión
// de empleado). El override `middleware: []` puesto en el propio componente
// de la página NO alcanzó para saltarse este middleware global (confirmado
// en vivo: seguía redirigiendo a "/"), así que la excepción se hace acá,
// mismo patrón que RUTAS_EXENTAS_WIZARD_OPERATIVO ya usa. Se compara con
// startsWith porque el id de la orden varía.
const PREFIJOS_RUTAS_PUBLICAS_CLIENTE = ["/clientes/aprobacion/"]

// El sitio se genera estático (npm run generate), así que las rutas reales
// llegan con slash final (ej. "/configuracion-operativa/") -- sin normalizar,
// las comparaciones exactas de abajo nunca matchean y el middleware termina
// redirigiendo a la misma ruta en la que ya está, colgando la navegación
// (Vue Router lanza NavigationDuplicated sin resolver la promesa).
function normalizarRuta(path) {
    if (path.length > 1 && path.endsWith("/")) {
        return path.slice(0, -1)
    }
    return path
}

export default function ({ store, route, redirect }) {
    const path = normalizarRuta(route.path)

    if (PREFIJOS_RUTAS_PUBLICAS_CLIENTE.some((prefijo) => path.startsWith(prefijo))) {
        return
    }

    // Si el usuario no tiene una empresa válida O no está autenticado
    if (!store.state?.login?.idEmpresa || store.state.login.idEmpresa === 0 || !store.state?.login?.access) {
        // Solo redirigir si no estamos ya en login o páginas públicas
        if (path !== "/" && path !== "/login") {
            return redirect("/")
        }
        return
    }

    // Wizard de Configuración Operativa (fase 2, posterior al institucional): si el
    // backend indicó que aún hay pasos pendientes, no dejar navegar a la app normal.
    // Si el cliente ya eligió "Continuar más tarde" (wizard_operativo_omitido_en),
    // se deja de bloquear aunque falten pasos -- queda auditado, no exigido de nuevo.
    const wizardOperativo = store.state?.login?.wizardOperativo
    if (
        wizardOperativo &&
        !wizardOperativo.wizard_operativo_completo &&
        !wizardOperativo.wizard_operativo_omitido_en &&
        !RUTAS_EXENTAS_WIZARD_OPERATIVO.includes(path)
    ) {
        return redirect("/configuracion-operativa")
    }
}
