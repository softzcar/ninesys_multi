<template>
    <div>
        <Loading :show="loading" :text="loadingText" />
        <b-container>
            <!-- <b-row v-if="!acceso" class="text-center vh-100" align-v="center">
                <b-col align-v="center">
                    <b-alert show :variant="alertType">{{ msg }}</b-alert>
                </b-col>
            </b-row> -->

            <b-row class="text-center vh-100" align-v="center">
                <b-col align-v="center">
                    <b-card
                        style="max-width: 20rem"
                        class="text-center"
                        align-v="center"
                    >
                        <h2>
                            ninesys
                            <h4
                                style="
                                    font-size: 1.2rem !important;
                                    color: lightslategray;
                                "
                            >
                                multiuser
                            </h4>
                        </h2>
                        <hr />
                        <b-form>
                            <b-form-group
                                id="input-group-1"
                                label="Usuario:"
                                label-for="email"
                            >
                                <b-form-input
                                    id="email"
                                    v-model="form.email"
                                    type="email"
                                    placeholder="Ingrese su email"
                                    required
                                ></b-form-input>
                            </b-form-group>

                            <b-form-group
                                id="input-group-2"
                                label="Clave:"
                                label-for="password"
                            >
                                <b-form-input
                                    id="password"
                                    v-model="form.password"
                                    type="password"
                                    placeholder="Ingrese su clave"
                                    required
                                ></b-form-input>
                            </b-form-group>

                            <b-button
                                type="submit"
                                variant="primary"
                                @click="letMeIn($event)"
                                >Entrar</b-button
                            >
                        </b-form>
                        <!-- <b-button type="reset" variant="danger">Reset</b-button> -->
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex"
import mixin from "~/mixins/mixins.js"
import axios from "axios"

export default {
    data() {
        return {
            loading: false,
            msg: "Inicializando...",
            alertType: "light",
            acceso: false,
            loadingText: "Validadndo sus datos, por favor espere...",
            form: {
                email: "",
                password: "",
            },
        }
    },
    computed: {
        ...mapState("login", [
            "access",
            "dataUser",
            "dataEmpresa",
            "dataSys",
            "idEmpresa",
        ]),
        ...mapState("datasys", ["dataSys"]),
    },
    methods: {
        ...mapMutations("login", [
            "setDataUser",
            "setDataEmpresa",
            "setDataSys",
            "setAccess",
            "setIdEmpresa",
        ]),
        ...mapMutations("datasys", ["setDataSys"]),

        async letMeIn(event) {
            event.preventDefault()
            this.loading = true

            let ban = true
            let c = {}

            if (!this.form.email && !this.form.password) {
                ban = false
                c = {}
                this.$fire({
                    type: "error",
                    title: "Dato requerido",
                    html: "Introduzca su email y contraseña",
                })
            } else if (!this.form.email) {
                ban = false
                this.$fire({
                    type: "error",
                    title: "Dato requerido",
                    html: "Introduzca su email",
                })
            } else if (!this.emailCheck(this.form.email)) {
                ban = false
                this.$fire({
                    type: "error",
                    title: "Dato requerido",
                    html: "Introduzca en email válido",
                })
            } else if (!this.form.password) {
                ban = false
                this.$fire({
                    type: "error",
                    title: "Dato requerido",
                    html: "Introduzca su contraseña",
                })
            }

            if (ban) {
                this.loading = true

                const data = new URLSearchParams()
                data.set("email", this.form.email)
                data.set("password", this.form.password)

                await this.$axios
                    .post(`${this.$config.API}/login`, data)
                    .then((res) => {
                        // cargar datos de la empresa aqui con this.getConfigData()

                        console.log(
                            `Respuesta de login: `,
                            res.data.data.access
                        )
                        if (res.data.data.access === true) {
                            this.loadingText =
                                "Cargando datos, por favor espere..."
                            this.$store.commit(
                                "login/setDataUser",
                                res.data.data
                            )
                            this.$store.commit(
                                "login/setDataEmpresa",
                                res.data.empresa
                            )
                            this.$store.commit(
                                "login/setIdEmpresa",
                                res.data.empresa.id
                            )
                            this.$store.commit(
                                "login/setAccess",
                                res.data.data.access
                            )
                            this.$store.commit("login/setLoading", false)

                            // CArgar datos de configuracion del sistema
                            this.getConfigData()

                            // CARGAR EN EL STATE PARA COMERCIALZIACION
                        } else {
                            this.loading = false
                            this.$fire({
                                type: "warning",
                                title: "Datos incorrectos",
                                html: "Verifiquelos e intente de nuevo.",
                            })
                            this.loading = false
                        }
                    })
                    .catch((err) => {
                        this.$fire({
                            type: "error",
                            title: "Error",
                            html: `Error de conexion ${err}`,
                        })
                        this.loading = false
                    })
                    .finally(() => {
                        this.loading = false
                    })
            } else {
                this.loading = false
            }
        },

        async getConfigData() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/config`)
                .then((res) => {
                    console.log("datos de cnfiguración del sistema", res.data)
                    this.$store.commit("datasys/setDataSys", res.data)
                    // this.$store.commit("login/setDataSys", res.data);
                    const activo = parseInt(res.data.activo)

                    if (activo) {
                        this.acceso = true
                        this.msg = "Bienvenido"
                        this.alertType = "info"
                    } else {
                        this.acceso = false
                        this.alertType = "warning"
                        this.msg = "Su cuenta ha sido suspendida"
                    }
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<P>No se recibió la información de la configuración del sistema</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },
    },

    async mounted() {
        /* try {
            const response = await this.$axios.get(`${this.$config.API}/`)
            console.log("Respuesta recibida:", response)
        } catch (error) {
            console.error("Error al hacer la solicitud:", error)
        } */
    },

    mixins: [mixin],
}
</script>

<style scoped>
.card {
    margin: 0 auto; /* Added */
    float: none; /* Added */
    margin-bottom: 10px; /* Added */
}
</style>
