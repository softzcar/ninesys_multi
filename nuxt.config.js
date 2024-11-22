export default {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,

    // Target: https://go.nuxtjs.dev/config-target
    // target: 'server',
    target: "static",

    // Should hold all env variables that are public as these will be exposed on the frontend.
    publicRuntimeConfig: {
        // NINETEENCUSTOM API2 (MERGE DATABASES )
        /* LOCAL_IP: `https://ntapi.appz.one`,
    LOCAL_IP_WOO: `https://ntapi.appz.one`,
    API: `https://ntapi.appz.one`,
    CDN: `https://ntcdn.appz.one`,
    LIVE: `https://live.appz.one`,
    APP_URL: `https://ntapp.appz.one`, */

        // NINETEENCUSTOM 2
        /* LOCAL_IP: `https://api2.nineteencustom.com`,
    LOCAL_IP_WOO: `https://api2.nineteencustom.com`,
    API: `https://api2.nineteencustom.com`, */
        LOCAL_IP: `https://api.nineteengreen.com`,
        LOCAL_IP_WOO: `https://api.nineteengreen.com`,
        API: `https://api.nineteengreen.com`,
        CDN: `https://cdn.nineteencustom.com`,
        LIVE: `https://live.nineteencustom.com`,
        APP_URL: `https://app.nineteengreen.com`,

        // NINETEENCUSTOM PRODUCTION
        /*  LOCAL_IP: `https://api.nineteencustom.com`,
     LOCAL_IP_WOO: `https://api.nineteencustom.com`,
     API: `https://api.nineteencustom.com`,
     CDN: `https://cdn.nineteencustom.com`,
     LIVE: `https://live.nineteencustom.com`,
     APP_URL: `https://app.nineteengreen.com`, */

        // NINETEENGREEN
        /* LOCAL_IP: `https://api.nineteengreen.com`,
    LOCAL_IP_WOO: `https://api.nineteengreen.com`,
    API: `https://api.nineteengreen.com`,
    CDN: `https://cdn.nineteencustom.com`,
    LIVE: `https://live.nineteencustom.com`, */

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
        "~/plugins/sse.js",
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

    bootstrapVue: {
        path: "@assets/css/bootstrap_slate.min.css",
        icons: true,
        locate: "es",
    },

    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        retries: 50,
        sendTimeout: 30000,
        timeout: 30000,
        auth: {
            id_empresa: 2,
        },
    },

    // PWA module configuration: https://go.nuxtjs.dev/pwa
    pwa: {
        manifest: {
            lang: "es",
            name: "ninesys 2",
        },
    },

    loading: false,

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
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
