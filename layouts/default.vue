<template>
  <div class="app-wrapper">
    <!-- Sidebar - solo visible si está logueado y no está en páginas de auth -->
    <AppSidebar v-show="showSidebar" @toggle="onSidebarToggle" @close-mobile="sidebarVisible = false" :class="{ 'show': sidebarVisible }" />

    <!-- Overlay para móvil -->
    <div v-show="showSidebar && sidebarVisible" class="sidebar-overlay d-lg-none" @click="sidebarVisible = false" />

    <!-- Contenido Principal -->
    <div
      class="main-wrapper"
      :class="{ 'with-sidebar': showSidebar, 'sidebar-collapsed': sidebarCollapsed, 'with-aichat': chatDocked }"
      :style="{ '--aichat-width': chatWidth + 'px' }"
    >
      <!-- Header móvil con toggle -->
      <div v-show="showSidebar" class="mobile-header d-lg-none">
        <button class="btn btn-link sidebar-toggle-btn" @click="sidebarVisible = !sidebarVisible">
          <b-icon icon="list" scale="1.5" />
        </button>
        <span class="mobile-brand">{{ displayDepartament }}</span>
      </div>

      <!-- Contenido de Nuxt -->
      <div class="main-content">
        <Nuxt />
      </div>
    </div>

    <!-- Asistente IA: panel lateral derecho (se abre desde la barra superior, MenuLoader).
         Su estado vive en el store `aichat`, así que la conversación sobrevive a la navegación. -->
    <AiChatPanel v-if="showChat" />

    <!-- Overlay de reautenticación (JWT vencido) -- auditoría de seguridad
         2026-09-11. Como hermano de <Nuxt /> arriba, nunca desmonta el árbol
         de componentes de la página actual (no se pierde el trabajo en
         curso). Ver plugins/axios-interceptor.js (quien lo dispara) y
         components/SesionExpiradaOverlay.vue. -->
    <SesionExpiradaOverlay v-if="sesionExpirada" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AiChatPanel from "@/components/ai/AiChatPanel.vue";
import SesionExpiradaOverlay from "@/components/SesionExpiradaOverlay.vue";

// Rutas sin sidebar ni asistente (auth y wizard obligatorio de primera vez).
const HIDDEN_ROUTES = ['/login', '/logout', '/registro', '/password-reset', '/configuracion-operativa'];

export default {
  name: 'DefaultLayout',
  components: {
    AppSidebar,
    AiChatPanel,
    SesionExpiradaOverlay,
  },
  data() {
    return {
      sidebarVisible: false,
      sidebarCollapsed: false,
    };
  },
  computed: {
    ...mapState("login", ["access", "currentDepartament", "dataUser", "sesionExpirada"]),
    empresaNombre() {
      return this.$store.state.login.dataEmpresa?.nombre || "NineSys";
    },
    displayDepartament() {
      if (this.currentDepartament) {
        return this.currentDepartament;
      }
      const departamentos = this.$store.getters["login/getDepartamentosEmpleadoSelect"];
      if (departamentos && departamentos.length > 0) {
        return departamentos[0].text;
      }
      if (this.dataUser && this.dataUser.departamento) {
        return this.dataUser.departamento;
      }
      return this.empresaNombre;
    },
    isLoggedIn() {
      return !!this.access;
    },
    showSidebar() {
      // No mostrar sidebar en páginas de auth ni durante el wizard de
      // configuración obligatorio de primera vez -- si el sidebar quedara
      // visible ahí, el cliente podría saltarse el wizard navegando
      // directamente a cualquier módulo antes de tener datos correctos.
      const currentPath = this.$route?.path || '';

      // Solo mostrar si está logueado y tiene departamento asignado
      return this.isLoggedIn &&
        this.currentDepartament &&
        !HIDDEN_ROUTES.some(route => currentPath.startsWith(route));
    },
    showChat() {
      const currentPath = this.$route?.path || '';
      return this.$config.AI_CHAT_ENABLED && this.isLoggedIn && !HIDDEN_ROUTES.some(route => currentPath.startsWith(route));
    },
    // Panel del asistente abierto: en escritorio empuja el contenido.
    chatDocked() {
      return this.showChat && this.$store.state.aichat.isOpen;
    },
    chatWidth() {
      return this.$store.state.aichat.width;
    },
  },
  methods: {
    onSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed;
    },
  },
  mounted() {
    // Desregistrar Service Workers activos para asegurar la actualización inmediata del frontend en dispositivos de pruebas
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister().then(() => {
            console.log('Service Worker desregistrado con éxito.');
          });
        }
      });
      // Limpiar el Cache Storage del navegador
      if ('caches' in window) {
        caches.keys().then(names => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
    }
  },
  watch: {
    '$route'() {
      // Cerrar sidebar en móvil al navegar solo si está abierto
      if (this.sidebarVisible) {
        this.sidebarVisible = false;
      }
    },
  },
}
</script>

<style lang="scss">
// Variables
$sidebar-width: 260px;
$header-height: 56px;
$primary-color: #17a2b8;

.app-wrapper {
  min-height: 100vh;
  background: #f8f9fa;
}

.main-wrapper {
  min-height: 100vh;
  transition: margin-left 0.3s ease, margin-right 0.3s ease;

  // Asistente IA acoplado a la derecha (solo escritorio; en móvil se superpone).
  &.with-aichat {
    @media (min-width: 992px) {
      margin-right: var(--aichat-width, 440px);
    }
  }

  &.with-sidebar {
    @media (min-width: 992px) {
      margin-left: $sidebar-width;
    }

    &.sidebar-collapsed {
      @media (min-width: 992px) {
        margin-left: 70px;
      }
    }
  }
}

.main-content {
  padding: 0;

  @media (max-width: 991.98px) {
    padding-top: 56px !important; /* Compensar la barra superior móvil fija */
  }
}

// Header móvil
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  z-index: 1030;
  background: linear-gradient(135deg, $primary-color 0%, darken($primary-color, 10%) 100%);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .sidebar-toggle-btn {
    color: #fff;
    padding: 0.25rem;
  }

  .mobile-brand {
    color: #fff;
    font-weight: 600;
    font-size: 1.1rem;
  }
}

// Overlay para móvil
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1035;
}

// Mostrar sidebar en móvil
@media (max-width: 991.98px) {
  .app-sidebar {
    transform: translateX(-100%);

    &.show {
      transform: translateX(0);
    }
  }
}
</style>
