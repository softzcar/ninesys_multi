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

              <b-button type="submit" variant="primary" @click="letMeIn($event)" data-testid="btn-entrar"
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
    // requiere_seleccion_empresa más abajo).
    async elegirEmpresa(idEmpresa) {
      this.loading = true;
      this.mostrarSelectorEmpresa = false;
      await this.doLogin(idEmpresa);
    },

    async doLogin(idEmpresa) {
        this.loading = true;

        const data = new URLSearchParams();
        data.set("email", this.form.email);
        data.set("password", this.form.password);
        if (idEmpresa) {
          data.set("id_empresa", idEmpresa);
        }

        await this.$axios
          .post(`${this.$config.API}/login`, data)
                    .then((res) => {
                      if (res.data.requiere_seleccion_empresa) {
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
                        this.getConfigData();
                      } else {
                        // Este bloque 'else' es por si la API devuelve un código 200 pero con acceso denegado.
                        // Es una capa extra de seguridad.
                        this.loading = false;
                        this.$fire({
                          type: "warning",
                          title: "Acceso Denegado",
                          html: res.data.msg || "No se pudo procesar el acceso.",
                        });
                      }
                    })          .catch((err) => {
            this.loading = false;
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
              // Caso 2: Credenciales incorrectas (error 401)
              else if (responseData.msg) {
                this.$fire({
                  type: "error",
                  title: "Datos incorrectos",
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
