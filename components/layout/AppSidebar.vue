<template>
  <nav class="app-sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- Header del Sidebar -->
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <span class="brand-name">{{ empresaNombre }}</span>
      </div>
      <button class="sidebar-toggle d-lg-none" @click="toggleSidebar">
        <b-icon icon="x" />
      </button>
    </div>

    <!-- Perfil del Usuario -->
    <div class="sidebar-profile">
      <div class="profile-avatar">
        <b-icon icon="person-circle" scale="2" />
      </div>
      <div class="profile-info">
        <span class="profile-name">{{ dataUser.nombre }}</span>
        <small class="profile-dept">{{ currentDepartament }}</small>
      </div>
    </div>

    <!-- Selector de Departamento (si tiene múltiples) -->
    <div v-if="getDepartamentosEmpleadoSelect.length > 1" class="dept-selector">
      <b-form-select v-model="selectedDepartamento" :options="getDepartamentosEmpleadoSelect" size="sm"
        @change="onDepartamentoChange" />
    </div>

    <!-- Menú dinámico según departamento -->
    <div class="sidebar-menu">
      <ul class="nav flex-column">
        <!-- Item Inicio -->
        <li class="nav-item">
          <router-link class="nav-link" to="/" exact>
            <b-icon icon="house" />
            <span>Inicio</span>
          </router-link>
        </li>

        <!-- Componente de menú dinámico -->
        <component :is="sidebarMenuComponent" v-if="currentComponent" />
      </ul>
    </div>

    <!-- Footer del Sidebar -->
    <div class="sidebar-footer">
      <button class="btn btn-sidebar-logout" @click="goOut">
        <b-icon icon="box-arrow-left" />
        <span>Salir</span>
      </button>
    </div>
  </nav>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  name: "AppSidebar",
  data() {
    return {
      isCollapsed: false,
      selectedDepartamento: null,
    };
  },
  computed: {
    ...mapState("login", [
      "dataUser",
      "currentDepartament",
      "currentComponent",
      "currentMinOrdenProcesoId",
    ]),
    ...mapGetters("login", ["getDepartamentosEmpleadoSelect"]),
    empresaNombre() {
      return this.$store.state.login.dataEmpresa?.nombre || "NineSys";
    },
    sidebarMenuComponent() {
      if (!this.currentComponent) return null;

      // Mapeo desde el nombre del componente del menú al sidebar correspondiente
      const componentMap = {
        'menus/menuAdmin': () => import('@/components/sidebars/SidebarAdmin.vue'),
        'menus/menuComercializacion': () => import('@/components/sidebars/SidebarComercializacion.vue'),
        'menus/menuDisenador': () => import('@/components/sidebars/SidebarDiseno.vue'),
        'menus/menuProduccion': () => import('@/components/sidebars/SidebarProduccion.vue'),
        'menus/menuEmpleado': () => import('@/components/sidebars/SidebarEmpleado.vue'),
        'menus/menuRevision': () => import('@/components/sidebars/SidebarRevision.vue'),
      };

      return componentMap[this.currentComponent] || null;
    },
  },
  watch: {
    currentDepartament: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          const depto = this.getDepartamentosEmpleadoSelect.find(
            (d) => d.text === newVal
          );
          if (depto) {
            this.selectedDepartamento = depto.value;
          }
        }
      },
    },
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      this.$emit("toggle", this.isCollapsed);
    },
    onDepartamentoChange(value) {
      const depto = this.getDepartamentosEmpleadoSelect.find(
        (d) => d.value === value
      );
      if (depto) {
        // Actualizar estado de Vuex
        this.$store.commit("login/scurrentDepartamentId", depto.value);
        this.$store.commit("login/setCurrentOrdenProceso", depto.orden_proceso || this.currentMinOrdenProcesoId);
        this.$store.commit("login/setCurrentMinOrdenProcesoId", depto.orden_proceso_min);
        this.$store.commit("login/scurrentDepartament", depto.text);
        this.$store.commit("login/setCurrentComponent", depto.modulo);

        // Redirigir a la página de inicio para evitar confusión
        // Diferentes departamentos pueden usar la misma interfaz pero con datos distintos
        if (this.$route.path !== '/') {
          this.$router.push('/');
        }
      }
    },
    goOut() {
      this.$confirm("¿Desea Salir del sistema?", "Salir", "question")
        .then(() => {
          this.$router.push("/logout");
        })
        .catch(() => { });
    },
  },
};
</script>

<style lang="scss" scoped>
// Variables de tema claro (acorde con Bootstrap info)
$sidebar-bg: #ffffff;
$sidebar-border: #e9ecef;
$text-primary: #212529;
$text-secondary: #6c757d;
$accent-color: #17a2b8; // Bootstrap info color
$hover-bg: rgba(23, 162, 184, 0.08);
$active-bg: rgba(23, 162, 184, 0.15);

.app-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 260px;
  height: 100vh;
  background: $sidebar-bg;
  color: $text-primary;
  display: flex;
  flex-direction: column;
  z-index: 1040;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
  border-right: 1px solid $sidebar-border;
  transition: transform 0.3s ease;

  &.collapsed {
    transform: translateX(-100%);
  }
}

.sidebar-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid $sidebar-border;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, $accent-color 0%, darken($accent-color, 10%) 100%);

  .brand-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
  }

  .sidebar-toggle {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1.25rem;
    cursor: pointer;
  }
}

.sidebar-profile {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid $sidebar-border;
  background: #f8f9fa;

  .profile-avatar {
    color: $accent-color;
  }

  .profile-info {
    display: flex;
    flex-direction: column;

    .profile-name {
      font-weight: 500;
      font-size: 0.95rem;
      color: $text-primary;
    }

    .profile-dept {
      color: $text-secondary;
      font-size: 0.8rem;
    }
  }
}

.dept-selector {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid $sidebar-border;
  background: #f8f9fa;

  .custom-select,
  .form-control {
    background: #fff;
    border: 1px solid #ced4da;
    color: $text-primary;
    font-size: 0.85rem;

    &:focus {
      border-color: $accent-color;
      box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.25);
    }
  }
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;

  // Estilos para links principales (con ::v-deep para aplicar a componentes hijos)
  ::v-deep .nav-item {
    .nav-link {
      color: $text-primary !important;
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
      text-decoration: none;

      &:hover {
        background: $hover-bg;
        color: $accent-color !important;
      }

      &.router-link-exact-active,
      &.router-link-active {
        background: $active-bg;
        color: $accent-color !important;
        border-left-color: $accent-color;
        font-weight: 500;
      }

      .menu-arrow {
        margin-left: auto;
        transition: transform 0.2s ease;
      }

      &[aria-expanded="true"] .menu-arrow {
        transform: rotate(180deg);
      }
    }
  }

  // Submenús
  ::v-deep .sub-menu {
    background: #f8f9fa;

    .nav-link {
      padding-left: 3rem;
      font-size: 0.9rem;
      border-left: none;
      color: $text-primary !important;

      &:hover {
        color: $accent-color !important;
        background: $hover-bg;
      }

      &.router-link-exact-active,
      &.router-link-active {
        color: $accent-color !important;
        background: $active-bg;
        font-weight: 500;
      }
    }
  }
}

.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid $sidebar-border;
  background: #f8f9fa;

  .btn-sidebar-logout {
    width: 100%;
    background: #fff;
    border: 1px solid #dc3545;
    color: #dc3545;
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: #dc3545;
      color: #fff;
    }
  }
}

// Responsive
@media (max-width: 991.98px) {
  .app-sidebar {
    transform: translateX(-100%);

    &.show {
      transform: translateX(0);
    }
  }
}
</style>
