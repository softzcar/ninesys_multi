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
    this.renderTurnstile();
  },
  beforeDestroy() {
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
      const tokenTurnstile = this.obtenerTokenTurnstile();
      if (!tokenTurnstile) {
        this.error = "Espere a que se complete la verificación antes de continuar.";
        return;
      }

      this.cargando = true;
      this.error = "";

      const data = new URLSearchParams();
      data.set("email", this.dataUser.email);
      data.set("password", this.password);
      data.set("cf-turnstile-response", tokenTurnstile);
      if (this.idEmpresa) {
        data.set("id_empresa", this.idEmpresa);
      }
      if (this.sesionForzada) {
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
          this.resetearTurnstile();
          const { dispositivo, desde } = res.data.sesion_activa;
          this.$confirm(
            `Ya hay una sesión abierta en ${dispositivo} desde el ${desde}. Si continúa, esa sesión se cerrará y los cambios sin guardar que tenga allí se perderán. ¿Desea continuar?`,
            "Sesión activa en otro dispositivo",
            "warning"
          ).then(() => {
            // No reintentar de inmediato -- el widget recién se reseteó y
            // todavía no hay un token nuevo. Se guarda el consentimiento y se
            // deja que el usuario vuelva a verificar y presione "Continuar"
            // (mismo bug y misma corrección que components/login/form.vue).
            this.sesionForzada = true;
            this.error = "Complete nuevamente la verificación y presione Continuar.";
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
        } else {
          this.error = res.data?.msg || "Clave incorrecta.";
          this.resetearTurnstile();
        }
      } catch (err) {
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
  z-index: 2000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
</style>
