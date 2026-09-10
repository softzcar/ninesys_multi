// Auditoría de seguridad 2026-09-10 (hallazgo C6, ver
// [[project_fase_seguridad_pendiente]]): ninesys-cdn antes no validaba
// identidad alguna en subir/borrar/listar. Este plugin manda el MISMO JWT de
// sesión que ya usa el resto de la app para ninesys-api
// (`store.state.login.apiToken`) -- el CDN lo valida con el mismo secreto
// compartido servidor-a-servidor, nunca visible acá. Mismo patrón que
// plugins/whatsapp.js ($wsApi).
export default function ({ $axios, store, $config }, inject) {
  const cdnApi = $axios.create({
    baseURL: $config.CDN,
  })

  cdnApi.onRequest((config) => {
    const apiToken = store.state.login?.apiToken
    if (apiToken) {
      config.headers.Authorization = `Bearer ${apiToken}`
    }
    return config
  })

  inject('cdnApi', cdnApi)
}
