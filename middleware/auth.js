const RUTAS_EXENTAS_WIZARD_OPERATIVO = ["/", "/login", "/logout", "/configuracion-operativa"]

export default function ({ store, route, redirect }) {
    // Si el usuario no tiene una empresa válida O no está autenticado
    if (!store.state?.login?.idEmpresa || store.state.login.idEmpresa === 0 || !store.state?.login?.access) {
        // Solo redirigir si no estamos ya en login o páginas públicas
        if (route.path !== "/" && route.path !== "/login") {
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
        !RUTAS_EXENTAS_WIZARD_OPERATIVO.includes(route.path)
    ) {
        return redirect("/configuracion-operativa")
    }
}
