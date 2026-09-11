<template>
  <div>
    <Loading :show="loading" :text="loadingText" />
    <b-container>
      <!-- <b-row v-if="!acceso" class="text-center vh-100" align-v="center">
                <b-col align-v="center">
                    <b-alert show :variant="alertType">{{ msg }}</b-alert>
                </b-col>
            </b-row> -->

      <configuracion-wizard v-if="showConfigWizard" />
      <b-row v-else-if="mostrarSelectorEmpresa" class="text-center vh-100" align-v="center">
        <b-col align-v="center">
          <b-card style="max-width: 20rem" class="text-center" align-v="center">
            <h2>ninesys</h2>
            <hr />
            <p>Su cuenta está asignada a más de una empresa. Elija a cuál desea acceder:</p>
            <b-list-group>
              <b-list-group-item
                v-for="emp in empresasDisponibles"
                :key="emp.id_empresa"
                button
                @click="elegirEmpresa(emp.id_empresa)"
              >{{ emp.nombre }}</b-list-group-item>
            </b-list-group>
            <b-button class="mt-3" variant="link" @click="mostrarSelectorEmpresa = false">Cancelar</b-button>
          </b-card>
        </b-col>
      </b-row>
      <b-row v-else class="text-center vh-100" align-v="center">
        <b-col align-v="center">
          <b-card style="max-width: 20rem" class="text-center" align-v="center">
            <h2>
              ninesys
              <h4 style="font-size: 1.2rem !important; color: lightslategray">
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
                  autocomplete="username"
                  data-testid="input-email"
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
                  autocomplete="current-password"
                  data-testid="input-password"
                ></b-form-input>
              </b-form-group>

              <!-- Cloudflare Turnstile (CAPTCHA) -- auditoría de seguridad
                   2026-09-11, protección contra fuerza bruta en /login. -->
              <div ref="turnstileContainer" class="mb-3"></div>

              <b-button type="submit" variant="primary" @click="letMeIn($event)" data-testid="btn-entrar" :disabled="!turnstileToken"
                >Entrar</b-button
              >
            </b-form>
            <!-- <b-button type="reset" variant="danger">Reset</b-button> -->
            <b-button variant="link" size="sm" class="mt-2" @click="mostrarModalOlvidoClave = true"
              >¿Olvidó su clave?</b-button
            >
          </b-card>
        </b-col>
      </b-row>

      <!-- Recuperar clave por WhatsApp -- envía una clave nueva de 8 dígitos
           al teléfono registrado (mismo patrón ya implementado en dtf). -->
      <b-modal
        v-model="mostrarModalOlvidoClave"
        title="Recuperar clave"
        ok-title="Enviar"
        cancel-title="Cancelar"
        :ok-disabled="enviandoRecuperarClave"
        @ok="solicitarClave"
      >
        <p>Se enviará una nueva clave de acceso a su WhatsApp registrado.</p>
        <b-form-group label="Email:" label-for="email-recuperar">
          <b-form-input
            id="email-recuperar"
            v-model="emailRecuperarClave"
            type="email"
            placeholder="Ingrese su email"
          ></b-form-input>
        </b-form-group>
      </b-modal>
    </b-container>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import mixin from "~/mixins/mixins.js";
import ConfiguracionWizard from "~/components/empresa/configuracionWizard.vue";

export default {
  components: { ConfiguracionWizard },
  data() {
    return {
      showConfigWizard: false,
      loading: false,
      msg: "Inicializando...",
      alertType: "light",
      acceso: false,
      loadingText: "Verificando sus datos, por favor espere...",
      form: {
        email: "",
        password: "",
      },
      // Una identidad puede estar asignada a más de una empresa (ver /login,
      // 2026-08-12) -- si el backend responde requiere_seleccion_empresa, se
      // muestra esta lista en vez de completar el login de una vez.
      mostrarSelectorEmpresa: false,
      empresasDisponibles: [],
      mostrarModalOlvidoClave: false,
      emailRecuperarClave: "",
      enviandoRecuperarClave: false,
      // Cloudflare Turnstile (CAPTCHA) -- auditoría de seguridad 2026-09-11.
      turnstileToken: "",
      turnstileWidgetId: null,
      // Sesión única por empleado -- auditoría de seguridad 2026-09-11. Se
      // resetea en letMeIn() (nuevo intento manual de login).
      sesionForzada: false,
    };
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
      "setModulos",
    ]),
    ...mapMutations("datasys", ["setDataSys"]),

    async letMeIn(event) {
      event.preventDefault();
      this.loading = true;
      // Nuevo intento manual -- no arrastrar el consentimiento de un intento
      // anterior (sesión única por empleado, auditoría 2026-09-11).
      this.sesionForzada = false;

      let ban = true;
      let c = {};

      if (!this.form.email && !this.form.password) {
        ban = false;
        c = {};
        this.$fire({
          type: "error",
          title: "Dato requerido",
          html: "Introduzca su email y contraseña",
        });
      } else if (!this.form.email) {
        ban = false;
        this.$fire({
          type: "error",
          title: "Dato requerido",
          html: "Introduzca su email",
        });
      } else if (!this.emailCheck(this.form.email)) {
        ban = false;
        this.$fire({
          type: "error",
          title: "Dato requerido",
          html: "Introduzca en email válido",
        });
      } else if (!this.form.password) {
        ban = false;
        this.$fire({
          type: "error",
          title: "Dato requerido",
          html: "Introduzca su contraseña",
        });
      }

      if (ban) {
        await this.doLogin();
      } else {
        this.loading = false;
      }
    },

    // Reenvía el login con la empresa elegida en el selector (ver
    // requiere_seleccion_empresa más abajo). Si el usuario ya confirmó
    // cerrar una sesión activa en otro dispositivo antes de llegar acá, ese
    // consentimiento se mantiene -- no se le vuelve a preguntar dos veces
    // por el mismo intento de login.
    async elegirEmpresa(idEmpresa) {
      this.loading = true;
      this.mostrarSelectorEmpresa = false;
      await this.doLogin(idEmpresa, this.sesionForzada);
    },

    async doLogin(idEmpresa, forzarSesion) {
        this.loading = true;
        if (forzarSesion) {
          this.sesionForzada = true;
        }

        const tokenTurnstile = this.obtenerTokenTurnstile();
        if (!tokenTurnstile) {
          this.loading = false;
          this.$fire({
            type: "warning",
            title: "Verificación pendiente",
            html: "Espere a que se complete la verificación (\"Verifique que es un ser humano\") antes de continuar.",
          });
          return;
        }

        const data = new URLSearchParams();
        data.set("email", this.form.email);
        data.set("password", this.form.password);
        data.set("cf-turnstile-response", tokenTurnstile);
        if (idEmpresa) {
          data.set("id_empresa", idEmpresa);
        }
        if (forzarSesion || this.sesionForzada) {
          data.set("forzar_sesion", "1");
        }

        await this.$axios
          .post(`${this.$config.API}/login`, data, {
            // Este flujo ya tiene su propio manejo de errores específico
            // (abajo, .catch()) para cada caso -- company_full_config,
            // mensaje de credenciales/Turnstile/límite de intentos, etc. Sin
            // esto, el interceptor global (axios-interceptor.js) agrega
            // ADEMÁS un toast genérico redundante en cada error de login,
            // duplicando o confundiendo el mensaje ya mostrado (reportado
            // por el usuario 2026-09-11 al probar sin resolver Turnstile).
            suppressGlobalErrorToast: true,
          })
                    .then((res) => {
                      if (res.data.requiere_confirmacion_sesion) {
                        // Sesión única por empleado -- auditoría de seguridad
                        // 2026-09-11. El token de Turnstile ya se consumió en
                        // este intento, hay que resetear el widget antes de
                        // reintentar.
                        this.loading = false;
                        this.resetearTurnstile();
                        const { dispositivo, desde } = res.data.sesion_activa;
                        this.$confirm(
                          `Ya hay una sesión abierta en ${dispositivo} desde el ${desde}. Si continúa, esa sesión se cerrará y los cambios sin guardar que tenga allí se perderán. ¿Desea continuar?`,
                          "Sesión activa en otro dispositivo",
                          "warning"
                        ).then(() => {
                          this.loading = true;
                          this.doLogin(idEmpresa, true);
                        });
                      } else if (res.data.requiere_seleccion_empresa) {
                        // La identidad tiene más de una empresa asignada -- mostrar el
                        // selector en vez de completar el login todavía.
                        this.loading = false;
                        this.empresasDisponibles = res.data.empresas || [];
                        this.mostrarSelectorEmpresa = true;
                      } else if (res.data.data.access === true) {
                        this.loadingText = "Cargando datos, por favor espere...";

                        // Incluir el teléfono del usuario en dataUser si viene en datos_usuario
                        const dataUser = { ...res.data.data };
                        if (res.data.datos_usuario && res.data.datos_usuario.telefono) {
                          dataUser.telefono = res.data.datos_usuario.telefono;
                        }

                        this.$store.commit("login/setDataUser", dataUser);
                        this.$store.commit(
                          "login/setDepartamentos",
                          res.data.departamentos
                        );
                        this.$store.commit("login/setDataEmpresa", res.data.empresa);
                        this.$store.commit("login/setIdEmpresa", res.data.empresa.id);
                        // Sesión real (JWT) -- auditoría de seguridad 2026-09-10.
                        // El `if` es deliberado: si el backend desplegado aún no
                        // manda `token` (orden de despliegue), el interceptor cae
                        // solo al modo crudo (transición gradual).
                        if (res.data.token) {
                          this.$store.commit("login/setApiToken", res.data.token);
                        }
                        this.$store.commit("login/setEmpleado", res.data.empleado[0]);
                        this.$store.commit("login/setModulos", res.data.modulos);
                        this.$store.commit("login/setAccess", res.data.data.access);

                        // Resetear el componente/departamento activo para que MenuLoader
                        // asigne el menú correcto según el nuevo empleado autenticado.
                        // Sin esto, un valor stale de localStorage del usuario anterior
                        // provocaría que se muestre el menú incorrecto (ej. menuAdmin a un empleado).
                        this.$store.commit("login/setCurrentComponent", null);
                        this.$store.commit("login/scurrentDepartament", "");
                        this.$store.commit("login/scurrentDepartamentId", null);
                        this.$store.commit("login/setCurrentOrdenProceso", null);
                        this.$store.commit("login/setCurrentMinOrdenProcesoId", null);

                        // El token JWT se obtendrá automáticamente cuando sea necesario
                        // gracias al interceptor de axios configurado específicamente para WhatsApp

                        // Guardar datos adicionales para que el wizard funcione tanto en config inicial como edición
                        this.$store.commit("login/setDatosUsuario", res.data.datos_usuario);
                        this.$store.commit("login/setDatosPersonalizacion", res.data.datos_personalizacion);
                        this.$store.commit("login/setConfiguracionFaltante", []); // Array vacío porque está completo
                        this.$store.commit("login/setWizardOperativo", res.data.wizard_operativo || null);

                        this.$store.commit("login/setLoading", false);

                        // El login no siempre dispara una navegación de ruta real (si ya
                        // estamos en "/", el contenido solo cambia reactivamente), y el
                        // middleware "auth" de Nuxt solo se evalúa en cambios de ruta -- sin
                        // esto, un cliente que hace login por primera vez con el wizard
                        // incompleto vería el dashboard normal en vez del wizard.
                        const wo = res.data.wizard_operativo;
                        if (wo && !wo.wizard_operativo_completo && !wo.wizard_operativo_omitido_en) {
                          this.$router.push("/configuracion-operativa");
                          return;
                        }

                        this.getConfigData();
                      } else {
                        // Este bloque 'else' es por si la API devuelve un código 200 pero con acceso denegado.
                        // Es una capa extra de seguridad.
                        this.loading = false;
                        this.resetearTurnstile();
                        this.$fire({
                          type: "warning",
                          title: "Acceso Denegado",
                          html: res.data.msg || "No se pudo procesar el acceso.",
                        });
                      }
                    })          .catch((err) => {
            this.loading = false;
            // El token de Turnstile es de un solo uso -- se resetea en
            // cualquier fallo para que el próximo intento tenga uno fresco.
            this.resetearTurnstile();
            // Manejo de errores inteligente
            if (err.response && err.response.data) {
              const responseData = err.response.data;

              // Caso 1: Configuración de la empresa incompleta (error 403)
              if (responseData.company_full_config === false) {
                // Guardamos los datos parciales para usarlos en el wizard
                this.$store.commit("login/setDataUser", responseData.datos_usuario || {});
                this.$store.commit("login/setDataEmpresa", responseData.datos_empresa || {});
                this.$store.commit("login/setDatosPersonalizacion", responseData.datos_personalizacion || {});
                this.$store.commit('login/setConfiguracionFaltante', responseData.datos_faltantes || []);
                // Esperamos al siguiente ciclo de actualización del DOM para asegurar que la store esté actualizada
                this.$nextTick(() => {
                  this.showConfigWizard = true; // Activamos el wizard
                });
              }
              // Caso 2: msg del backend -- el título depende del código HTTP
              // real, no siempre son "datos incorrectos" (ej. 400 de
              // Turnstile no es una credencial mal escrita, es que no se
              // pudo verificar que la solicitud viene de una persona).
              else if (responseData.msg) {
                const titulosPorEstado = {
                  400: "Verificación fallida",
                  401: "Datos incorrectos",
                  429: "Demasiados intentos",
                };
                this.$fire({
                  type: "error",
                  title: titulosPorEstado[err.response.status] || "No se pudo iniciar sesión",
                  html: responseData.msg,
                });
              }
              // Caso 3: Otro error del servidor con respuesta
              else {
                this.$fire({
                  type: "error",
                  title: "Error del Servidor",
                  html: err.message,
                });
              }
            } else {
              // Caso 4: Error de red (sin respuesta del servidor)
              this.$fire({
                type: "error",
                title: "Error de Conexión",
                html: "No se pudo conectar con el servidor.",
              });
            }
          })
          .finally(() => {
            this.loading = false;
          });
    },

    async solicitarClave(bvModalEvt) {
      bvModalEvt.preventDefault();

      if (!this.emailRecuperarClave || !this.emailCheck(this.emailRecuperarClave)) {
        this.$fire({
          type: "error",
          title: "Dato requerido",
          html: "Introduzca un email válido.",
        });
        return;
      }

      this.enviandoRecuperarClave = true;
      const data = new URLSearchParams();
      data.set("email", this.emailRecuperarClave);

      await this.$axios
        .post(`${this.$config.API}/login/solicitar-clave`, data, {
          // Mismo motivo que en doLogin() -- este flujo ya maneja su propio
          // error específico abajo, no hace falta el toast genérico duplicado.
          suppressGlobalErrorToast: true,
        })
        .then((res) => {
          this.mostrarModalOlvidoClave = false;
          this.emailRecuperarClave = "";
          this.$fire({
            type: "success",
            title: "Clave enviada",
            html: res.data.message || "Se envió una nueva clave a su WhatsApp registrado.",
          });
        })
        .catch((err) => {
          const msg =
            (err.response && err.response.data && err.response.data.error) ||
            "No se pudo enviar la clave. Intente de nuevo.";
          this.$fire({ type: "error", title: "No se pudo enviar", html: msg });
        })
        .finally(() => {
          this.enviandoRecuperarClave = false;
        });
    },

    async getConfigData() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/config`)
        .then((res) => {
          // console.log("datos de cnfiguración del sistema", res.data);
          // Si la API devuelve un array, tomar el primer elemento
          const configData = Array.isArray(res.data) ? res.data[0] : res.data;
          this.$store.commit("datasys/setDataSys", configData);
          // this.$store.commit("login/setDataSys", res.data);
          const activo = parseInt(configData.activo);

          if (activo) {
            this.acceso = true;
            this.msg = "Bienvenido";
            this.alertType = "info";
          } else {
            this.acceso = false;
            this.alertType = "warning";
            this.msg = "Su cuenta ha sido suspendida";
          }
        })
        .catch((err) => {
          const message =
            err.response && err.response.data && err.response.data.message
              ? err.response.data.message
              : `<P>No se recibió la información de la configuración del sistema</p><p>${err}</p>`;
          this.$fire({
            title: "Error",
            html: message,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    // Cloudflare Turnstile (CAPTCHA) -- auditoría de seguridad 2026-09-11.
    // Render explícito (no automático vía atributos data-*) para poder leer
    // el token con un callback propio en vez de depender de una función
    // global en window. El script se carga async/defer (nuxt.config.js), así
    // que puede no estar listo todavía al montar el componente -- reintenta
    // hasta que window.turnstile exista.
    renderTurnstile() {
      if (window.turnstile && this.$refs.turnstileContainer) {
        this.turnstileWidgetId = window.turnstile.render(this.$refs.turnstileContainer, {
          sitekey: this.$config.TURNSTILE_SITE_KEY,
          callback: (token) => {
            this.turnstileToken = token;
          },
          "expired-callback": () => {
            this.turnstileToken = "";
          },
        });
      } else {
        setTimeout(this.renderTurnstile, 200);
      }
    },

    // Reportado por el usuario 2026-09-11: resolvió el widget (vio el check
    // de éxito) pero el payload salió con cf-turnstile-response vacío --
    // carrera entre el postMessage del iframe (que dispara el callback y
    // actualiza turnstileToken) y el clic en "Entrar". window.turnstile
    // .getResponse() consulta el token vigente directo del SDK, sin depender
    // de que el callback ya haya alcanzado a correr -- es la fuente de
    // verdad real, turnstileToken es solo un espejo reactivo para la UI.
    obtenerTokenTurnstile() {
      if (window.turnstile && this.turnstileWidgetId !== null) {
        return window.turnstile.getResponse(this.turnstileWidgetId) || this.turnstileToken;
      }
      return this.turnstileToken;
    },

    // Un token de Turnstile es de un solo uso -- tras un intento fallido hay
    // que resetear el widget para que el usuario pueda reintentar.
    resetearTurnstile() {
      this.turnstileToken = "";
      if (window.turnstile && this.turnstileWidgetId !== null) {
        window.turnstile.reset(this.turnstileWidgetId);
      }
    },
  },

  async mounted() {
    this.renderTurnstile();
  },

  beforeDestroy() {
    // Sin esto, el widget queda huérfano en el registro interno de
    // Cloudflare cuando Home.vue cambia de este formulario al dashboard tras
    // un login exitoso (sin recarga de página, es una SPA) -- si más tarde
    // aparece SesionExpiradaOverlay (misma pestaña, sesión expirada), su
    // propio render() puede fallar por el widget huérfano de acá. Visto en
    // pruebas manuales: "Cannot find Widget ..., consider using
    // turnstile.remove()".
    if (window.turnstile && this.turnstileWidgetId !== null) {
      window.turnstile.remove(this.turnstileWidgetId);
    }
  },

  mixins: [mixin],
};
</script>

<style scoped>
.card {
  margin: 0 auto;
  /* Added */
  float: none;
  /* Added */
  margin-bottom: 10px;
  /* Added */
}
</style>
