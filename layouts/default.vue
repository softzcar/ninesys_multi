<template>
  <div class="app-wrapper">
    <!-- Sidebar - solo visible si está logueado y no está en páginas de auth -->
    <AppSidebar 
      v-if="showSidebar" 
      @toggle="onSidebarToggle"
      :class="{ 'show': sidebarVisible }"
    />
    
    <!-- Overlay para móvil -->
    <div 
      v-if="showSidebar && sidebarVisible" 
      class="sidebar-overlay d-lg-none"
      @click="sidebarVisible = false"
    />
    
    <!-- Contenido Principal -->
    <div class="main-wrapper" :class="{ 'with-sidebar': showSidebar }">
      <!-- Header móvil con toggle -->
      <div v-if="showSidebar" class="mobile-header d-lg-none">
        <button class="btn btn-link sidebar-toggle-btn" @click="sidebarVisible = !sidebarVisible">
          <b-icon icon="list" scale="1.5" />
        </button>
        <span class="mobile-brand">{{ empresaNombre }}</span>
      </div>
      
      <!-- Contenido de Nuxt -->
      <div class="main-content">
        <Nuxt />
      </div>
    </div>
    
    <!-- AI Chat Widget - disponible en todas las páginas -->
    <AiChatWidget v-if="isLoggedIn" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AiChatWidget from "@/components/ai/AiChatWidget.vue";

export default {
  name: 'DefaultLayout',
  components: {
    AppSidebar,
    AiChatWidget,
  },
  data() {
    return {
      sidebarVisible: false,
    };
  },
  computed: {
    ...mapState("login", ["access", "currentDepartament"]),
    empresaNombre() {
      return this.$store.state.login.dataEmpresa?.nombre || "NineSys";
    },
    isLoggedIn() {
      return !!this.access;
    },
    showSidebar() {
      // No mostrar sidebar en páginas de auth
      const hiddenRoutes = ['/login', '/logout', '/registro', '/password-reset'];
      const currentPath = this.$route?.path || '';
      
      // Solo mostrar si está logueado y tiene departamento asignado
      return this.isLoggedIn && 
             this.currentDepartament && 
             !hiddenRoutes.some(route => currentPath.startsWith(route));
    },
  },
  methods: {
    onSidebarToggle(collapsed) {
      this.sidebarVisible = !collapsed;
    },
  },
  watch: {
    '$route'() {
      // Cerrar sidebar en móvil al navegar
      this.sidebarVisible = false;
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
  transition: margin-left 0.3s ease;

  &.with-sidebar {
    @media (min-width: 992px) {
      margin-left: $sidebar-width;
    }
  }
}

.main-content {
  padding: 0;
}

// Header móvil
.mobile-header {
  position: sticky;
  top: 0;
  z-index: 1040;
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
  z-index: 1045;
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
