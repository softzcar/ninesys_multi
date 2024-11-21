/**
 * Intercepta axios para incluir en el HEADER de la solicitud
 *  el ID de la Empresa cada llamada que se haga a la API
 */

export default function ({ $axios, store }) {
    if (!$axios) {
        throw new Error("Instance of $axios is undefined")
    }

    $axios.onRequest((config) => {
        const id_empresa = store.state.login.dataEmpresa.idEmpresa
        if (id_empresa) {
            // Adjuntar el ID de la empresa a los encabezados de la solicitud
            config.headers.common["X-ID-Empresa"] = id_empresa
        } else {
            config.headers.common["X-ID-Empresa"] = 0
        }
        return config
    })

    $axios.onError((error) => {
        return Promise.reject(error)
    })
}
