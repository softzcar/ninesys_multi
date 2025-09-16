export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  // target: 'server',
  target: "static",

  // Should hold all env variables that are public as these will be exposed on the frontend.
  publicRuntimeConfig: {
    // PRODUCCIÓN
    /* LOCAL_IP: `https://api.nineteengreen.com`,
    LOCAL_IP_WOO: `https://api.nineteengreen.com`,
    API: `https://api.nineteengreen.com`,
    CDN: `https://cdn.nineteengreen.com`,
    LIVE: `https://live.nineteengreen.com`,
    APP_URL: `https://app.nineteencustom.com`,
    WS_API: `https://ws.nineteengreen.com`, // Produccion
    // WS_API: `http://localhost:3000`, // Desarrollo
    HORARIO: {
      horaInicioManana: 8.5,  // 8:30 AM
      horaFinManana: 12,     // 12:00 PM
      horaInicioTarde: 13,   // 1:00 PM
      horaFinTarde: 17.5,    // 5:30 PM
      diasLaborales: [1, 2, 3, 4, 5] // Lunes (1) a Viernes (5)
    }, */

    // DESARROLLO
    LOCAL_IP: `https://apidev.nineteengreen.com`,
    LOCAL_IP_WOO: `https://apidev.nineteengreen.com`,
    API: `https://apidev.nineteengreen.com`,
    CDN: `https://cdn.nineteengreen.com`,
    LIVE: `https://live.nineteengreen.com`,
    APP_URL: `https://app.nineteencustom.com`,
    WS_API: `https://ws.nineteengreen.com`, // Produccion
    // WS_API: `http://localhost:3000`, // Desarrollo
    HORARIO: {
      horaInicioManana: 8.5,  // 8:30 AM
      horaFinManana: 12,     // 12:00 PM
      horaInicioTarde: 13,   // 1:00 PM
      horaFinTarde: 17.5,    // 5:30 PM
      diasLaborales: [1, 2, 3, 4, 5] // Lunes (1) a Viernes (5)
    },

    // Datos Empresa
    EMPRESA: {
      nombre: "Nineteen",
      direccion:
        "av. 13 entre calles 1 y 3 local 1-54, El Vigía 5145, Mérida",
      email: "empresa@email.com",
      teléfono: "+584147495435",
      rif: "J-00000000-0",
      /* nombre: 'Nombre Empresa',
direccion: 'Dirección Empresa',
email: 'empresa@email.com',
teléfono: '+580400000000',
rif: 'J-00000000-0', */
    },

    DEPARTAMENT_OPTIONS: [
      { value: "Comercialización", text: "Comercialización" },
      { value: "Diseño", text: "Diseño" },
      { value: "Impresión", text: "Impresión" },
      { value: "Estampado", text: "Estampado" },
      { value: "Corte", text: "Corte" },
      { value: "Limpieza", text: "Limpieza" },
      { value: "Costura", text: "Costura" },
      { value: "Revisión", text: "Revisión" },
      { value: "Producción", text: "Producción" },
      { value: "Administración", text: "Administración" },
    ],

    // socketServerURL: 'http://localhost/phpClient/simulateBackend.php', // URL del servidor de pruebas
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "ninesys",
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  router: {
    middleware: ["auth"],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    // CSS file in the project
    "@/assets/css/main.css",
    // quilli
    "quill/dist/quill.core.css",
    // for snow theme
    "quill/dist/quill.snow.css",
    // for bubble theme
    "quill/dist/quill.bubble.css",
    // '@/assets/css/bootstrap_slate.min.css',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // Alerts
    "~/plugins/axios-interceptor.js",
    // "~/plugins/sse.js",
    // "~/plugins/websocket.js",
    "~/plugins/alerts.js",
    "~/plugins/wizard.js",
    "~/plugins/typehead.js",
    "~/plugins/loading-twa.js",
    "~/mixins/mixins.js",
    {
      src: "~/plugins/socketPlugin.js",
      options: { socketServerURL: "http://localhost" },
    },
    // '~/plugins/socketPlugin.js',
    // { src: '~/plugins/socketPlugin.js', options: { socketServerURL: 'http://localhost' } },
    { src: "~plugins/nuxt-quill-plugin", ssr: false },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    "bootstrap-vue/nuxt",
    "@nuxtjs/axios",

    // https://go.nuxtjs.dev/axios
    // '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    "@nuxtjs/pwa",
  ],

  // antiguo
  /* bootstrapVue: {
    path: "@assets/css/bootstrap_slate.min.css",
    icons: true,
    locate: "es",
  }, */

  bootstrapVue: {
    // Deshabilita la carga del CSS por defecto de Bootstrap
    bootstrapCSS: false,
    // Deshabilita la carga del CSS por defecto de BootstrapVue
    bootstrapVueCSS: true,
    // Mantenemos los iconos, que es muy útil
    icons: true
  },


  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  /* axios: {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    retries: 50,
    sendTimeout: 30000,
    timeout: 30000,
    auth: {
      id_empresa: 2,
    },
  }, */

  axios: {
    // Necesario para manejar grandes volúmenes de datos y archivos.
    maxContentLength: Infinity,
    maxBodyLength: Infinity,

    // Un tiempo de espera de 30 segundos para peticiones lentas.
    timeout: 30000,
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    // Usa tu imagen para generar todos los íconos necesarios
    icon: {
      source: 'static/favicon.png',
      fileName: 'favicon.png'
    },
    manifest: {
      lang: 'es',
      name: 'Ninesys 2',
      short_name: 'Ninesys',
      description: 'Aplicación para la gestión de procesos.',
      theme_color: '#272b30',
      background_color: '#272b30',
      display: 'standalone',
      start_url: '/'
    }
  },

  loading: false,

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    analyze: true,
    transpile: ['date-fns', 'quill-image-resize-module'],
    extractCSS: true,
    splitChunks: {
      layouts: true,
      pages: true,
      commons: true,
      vendor: true,
    },
    generateDynamicRoutes: true,
    vendor: ["axios"],
    extend(config, ctx) {
      config.module.rules.push({
        test: /\.(mp3)$/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      })
    },
  },

  // Mode: This option lets you define the development or production mode of Nuxt (important when you use Nuxt programmatically)
  dev: process.env.NODE_ENV !== "development",
}
