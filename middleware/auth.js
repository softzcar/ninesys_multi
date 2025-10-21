export default function ({ store, route, redirect }) {
    // Si el usuario no tiene una empresa válida O no está autenticado
    if (!store.state?.login?.idEmpresa || store.state.login.idEmpresa === 0 || !store.state?.login?.access) {
        // Solo redirigir si no estamos ya en login o páginas públicas
        if (route.path !== "/" && route.path !== "/login") {
            return redirect("/")
        }
    }
}
