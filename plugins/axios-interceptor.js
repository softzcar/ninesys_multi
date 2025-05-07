// plugins/axios.js
export default function ({ $axios, store }) {
    if (!$axios) {
        throw new Error("Instance of $axios is undefined")
    }

    $axios.onRequest((config) => {
        const id_empresa = store.state.login?.idEmpresa || 0
        config.headers.common["Authorization"] = id_empresa

        // Configura los encabezados
        config.headers["Accept"] = "application/json"

        // console.log("Request Config:", config)
        return config
    })

    $axios.onError((error) => {
        console.error("Axios Error:", error)
        return Promise.reject(error)
    })
}
