<template>
  <div class="sesion-expirada-overlay">
    <b-card style="max-width: 22rem" class="text-center">
      <h5>{{ motivoSesionExpirada === 'otro_dispositivo' ? 'Sesión cerrada' : 'Sesión expirada' }}</h5>
      <hr />
      <!--
        Nota de seguridad (auditoría 2026-09-11): este overlay es puramente
        UX, NO es un control de seguridad -- quitarlo del DOM (ej. por
        DevTools) no otorga ningún acceso, porque el backend rechaza
        cualquier request con el JWT viejo/inválido sin importar qué haga el
        navegador. Su único propósito es evitar perder el trabajo en curso
        (no navega, no desmonta la página) al reautenticar.
      -->
      <p class="mb-2">
        <strong>{{ dataUser.nombre }}</strong><br />
        <small class="text-muted">{{ dataUser.email }}</small>
      </p>
      <p class="small">{{ mensajeMotivo }}</p>

      <b-form @submit.prevent="reautenticar">
        <b-form-input
          ref="passwordInput"
          v-model="password"
          type="password"
          placeholder="Clave"
          autocomplete="current-password"
          autofocus
          required
          :state="error ? false : null"
        ></b-form-input>
        <b-form-invalid-feedback :state="error ? false : null">
          {{ error }}
        </b-form-invalid-feedback>

        <!-- Cloudflare Turnstile -- /login exige un token válido en TODO
             request, incluida esta reautenticación (misma protección contra
             fuerza bruta que el login normal, ver components/login/form.vue). -->
        <div ref="turnstileContainer" class="mt-2"></div>

        <b-button type="submit" variant="primary" class="mt-3" block :disabled="cargando || !turnstileToken">
          {{ cargando ? "Verificando..." : "Continuar" }}
        </b-button>
      </b-form>

      <b-button variant="link" size="sm" class="mt-2" @click="cerrarSesion">
        Cerrar sesión
      </b-button>
    </b-card>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SesionExpiradaOverlay",
  data() {
    return {
      password: "",
      cargando: false,
      error: "",
      turnstileToken: "",
      turnstileWidgetId: null,
      // Sesión única por empleado -- auditoría de seguridad 2026-09-11.
      sesionForzada: false,
      // Token corto de un solo uso que el backend entrega junto con
      // requiere_confirmacion_sesion -- permite reintentar sin pedir un
      // segundo CAPTCHA, porque Turnstile y la clave ya se verificaron en el
      // intento que lo generó (bug reportado 2026-09-11: pedía verificar dos
      // veces siempre que había un conflicto real).
      tokenConfirmacionSesion: null,
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "idEmpresa", "motivoSesionExpirada"]),
    mensajeMotivo() {
      return this.motivoSesionExpirada === "otro_dispositivo"
        ? "Su sesión se cerró porque se inició sesión en otro dispositivo. Ingrese su clave para continuar."
        : "Su sesión expiró. Ingrese su clave para continuar.";
    },
  },
  mounted() {
    // Segunda red de seguridad (ver axios-interceptor.js, misma corrección y
    // su porqué en detalle) -- si un modal real de BootstrapVue se abrió en
    // la página de fondo justo en este instante, su atrapa-foco le gana el
    // foco al campo de clave. Se fuerza el cierre llamando hide('FORCE')
    // directo sobre la instancia del modal (no cancelable, a diferencia del
    // evento raíz 'bv::hide::modal'), con ese evento como respaldo.
    if (typeof document !== "undefined") {
      const activo = document.activeElement;
      const sufijoContenido = "___BV_modal_content_";
      if (activo && activo.id && activo.id.endsWith(sufijoContenido)) {
        const modalId = activo.id.slice(0, -sufijoContenido.length);
        let forzado = false;
        try {
          const modalEl = activo.closest(".modal");
          if (modalEl && modalEl.__vue__ && typeof modalEl.__vue__.hide === "function") {
            modalEl.__vue__.hide("FORCE");
            forzado = true;
          }
        } catch (e) {
          // Sigue al respaldo de abajo
        }
        if (!forzado) {
          this.$root.$emit("bv::hide::modal", modalId);
        }
      }
    }
    // Al cerrar el modal de fondo, el foco no vuelve solo al campo de clave
    // (autofocus del <input> ya "se gastó" al montar, cuando el modal seguía
    // reclamando el foco) -- queda en <body>, confirmado en pruebas reales.
    this.$nextTick(() => {
      this.$refs.passwordInput && this.$refs.passwordInput.focus();
    });

    // Red de seguridad continua (reportado 2026-09-11: el modal de fondo,
    // al forzar su cierre, puede a su vez disparar SU PROPIA confirmación
    // -- ej. "hay datos sin guardar, ¿cerrar de todas formas?" -- que
    // vuelve a robarle el foco al campo de clave, sin que podamos conocer
    // de antemano cada posible diálogo que un componente de la página
    // pueda abrir). Mientras este overlay esté montado, cualquier foco que
    // intente salir de él (excepto el iframe de Turnstile, que vive DENTRO
    // de este mismo árbol) se devuelve de inmediato al campo de clave --
    // así no importa qué esté compitiendo por el foco del lado de la
    // página de fondo.
    this._focusGuard = () => {
      const overlayEl = this.$el;
      const activo = document.activeElement;
      if (!overlayEl || !activo || overlayEl.contains(activo)) {
        return;
      }
      if (this.$refs.passwordInput) {
        this.$refs.passwordInput.focus();
      }
    };
    document.addEventListener("focusin", this._focusGuard, true);

    this.renderTurnstile();
  },
  beforeDestroy() {
    if (this._focusGuard) {
      document.removeEventListener("focusin", this._focusGuard, true);
    }
    // Sin esto, un widget de Turnstile queda huérfano en el registro interno
    // de Cloudflare cada vez que este overlay se cierra (reautenticación
    // exitosa) -- si la sesión vuelve a expirar más tarde en la misma
    // pestaña, el siguiente render() ya no crea un iframe funcional (visto
    // en pruebas manuales: "Cannot find Widget ..., consider using
    // turnstile.remove()"). Limpieza explícita al destruir el componente.
    if (window.turnstile && this.turnstileWidgetId !== null) {
      window.turnstile.remove(this.turnstileWidgetId);
    }
  },
  methods: {
    // Mismo patrón que components/login/form.vue.
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
    resetearTurnstile() {
      this.turnstileToken = "";
      if (window.turnstile && this.turnstileWidgetId !== null) {
        window.turnstile.reset(this.turnstileWidgetId);
      }
    },
    // Ver la misma corrección y su porqué en components/login/form.vue --
    // consulta el token vigente directo del SDK en vez de confiar en que el
    // callback ya haya actualizado turnstileToken.
    obtenerTokenTurnstile() {
      if (window.turnstile && this.turnstileWidgetId !== null) {
        return window.turnstile.getResponse(this.turnstileWidgetId) || this.turnstileToken;
      }
      return this.turnstileToken;
    },
    // Sin parámetro -- @submit.prevent="reautenticar" en el template pasa el
    // Event nativo del submit como primer argumento, que es siempre "truthy":
    // si este método hubiera leído ese argumento como forzarSesion, TODO
    // reintento normal habría mandado forzar_sesion=1 y se habría saltado la
    // validación de sesión única (bug encontrado 2026-09-11 al revisar el
    // flujo). El estado real vive en this.sesionForzada.
    async reautenticar() {
      // Si ya hay un token de confirmación de sesión (de un
      // requiere_confirmacion_sesion anterior en este mismo intento),
      // Turnstile y la clave ya se verificaron ahí -- no hace falta un
      // cf-turnstile-response nuevo.
      let tokenTurnstile = "";
      if (!this.tokenConfirmacionSesion) {
        tokenTurnstile = this.obtenerTokenTurnstile();
        if (!tokenTurnstile) {
          this.error = "Espere a que se complete la verificación antes de continuar.";
          return;
        }
      }

      this.cargando = true;
      this.error = "";

      const data = new URLSearchParams();
      data.set("email", this.dataUser.email);
      data.set("password", this.password);
      data.set("cf-turnstile-response", tokenTurnstile);
      if (this.tokenConfirmacionSesion) {
        data.set("token_confirmacion_sesion", this.tokenConfirmacionSesion);
      }
      if (this.idEmpresa) {
        data.set("id_empresa", this.idEmpresa);
      }
      // Si el motivo NO es "otro_dispositivo", esta pantalla apareció por un
      // simple vencimiento normal del token de ESTE mismo dispositivo -- no
      // hay ningún otro dispositivo real compitiendo por la sesión, así que
      // se reclama directo sin pedir confirmación ni doble verificación
      // (reportado 2026-09-11: pedía verificar Turnstile dos veces en cada
      // reautenticación, incluso sin conflicto real). Cuando SÍ es
      // "otro_dispositivo", se mantiene el diálogo de confirmación completo.
      if (this.sesionForzada || this.motivoSesionExpirada !== "otro_dispositivo") {
        data.set("forzar_sesion", "1");
      }

      // El interceptor global (axios-interceptor.js) manda el apiToken
      // actual como Bearer en cada request -- pero ESE token es justo el que
      // está vencido/inválido (por eso apareció este overlay). Si se manda
      // tal cual, IdEmpresaMiddleware.php lo rechaza con 401 ANTES de llegar
      // siquiera al handler real de /login. Se limpia acá para que el
      // interceptor caiga al modo id_empresa crudo (igual que un login
      // normal sin sesión todavía), y se reemplaza por el token fresco
      // recién abajo si la clave es correcta.
      this.$store.commit("login/setApiToken", null);

      try {
        const res = await this.$axios.post(`${this.$config.API}/login`, data, {
          suppressGlobalErrorToast: true,
        });

        if (res.data?.requiere_confirmacion_sesion) {
          // Alguien más (u otra pestaña propia) ya reclamó la sesión --
          // sesión única por empleado, auditoría 2026-09-11. Mismo patrón
          // que components/login/form.vue.
          this.cargando = false;
          const { dispositivo, desde } = res.data.sesion_activa;
          // Turnstile y la clave YA se verificaron en este mismo intento --
          // el backend entrega un token corto de un solo uso para que el
          // reintento no pida un segundo CAPTCHA (bug reportado 2026-09-11).
          this.tokenConfirmacionSesion = res.data.token_confirmacion_sesion || null;
          this.$confirm(
            `Ya hay una sesión abierta en ${dispositivo} desde el ${desde}. Si continúa, esa sesión se cerrará y los cambios sin guardar que tenga allí se perderán. ¿Desea continuar?`,
            "Sesión activa en otro dispositivo",
            "warning"
          ).then(() => {
            this.sesionForzada = true;
            if (this.tokenConfirmacionSesion) {
              this.reautenticar();
            } else {
              // Respaldo (backend viejo, o token ya vencido si el diálogo
              // quedó abierto más de 2 minutos): vuelve al camino manual.
              this.resetearTurnstile();
              this.error = "Complete nuevamente la verificación y presione Continuar.";
            }
          });
          return;
        }

        if (res.data?.data?.access === true && res.data.token) {
          // Deliberadamente SOLO se actualiza el token -- no se toca
          // dataUser/departamentos/modulos/etc., para no re-renderizar ni
          // resetear nada de lo que ya está en pantalla (ver auditoría de
          // seguridad 2026-09-11).
          this.$store.commit("login/setApiToken", res.data.token);
          this.$store.commit("login/setSesionExpirada", false);
          this.password = "";
          this.sesionForzada = false;
          this.tokenConfirmacionSesion = null;
        } else {
          this.tokenConfirmacionSesion = null;
          this.error = res.data?.msg || "Clave incorrecta.";
          this.resetearTurnstile();
        }
      } catch (err) {
        this.tokenConfirmacionSesion = null;
        this.error =
          err.response?.data?.msg || "No se pudo verificar la clave. Intente de nuevo.";
        this.resetearTurnstile();
      } finally {
        this.cargando = false;
      }
    },
    cerrarSesion() {
      this.$store.commit("login/logout");
      this.$store.commit("login/setSesionExpirada", false);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
  },
};
</script>

<style scoped>
.sesion-expirada-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Por encima de cualquier <b-modal> (z-index ~1050) o alerta SweetAlert2
     (vue-simple-alert, z-index ~1060) que pueda quedar abierta de fondo o
     dispararse como efecto secundario al forzar su cierre (reportado
     2026-09-11) -- así el campo de clave siempre queda visible y accesible. */
  z-index: 20000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
</style>
