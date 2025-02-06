export default function ({ store, route, redirect }) {
    // Si el usuario no tiene una empresa válida
    if (!store.state?.login?.idEmpresa || store.state.login.idEmpresa === 0) {
        // Evitar redirigir si ya estamos en la página principal
        if (route.path !== "/") {
            return redirect("/")
        }
    }
}
