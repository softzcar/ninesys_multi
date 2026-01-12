<template>
  <div>
    <!-- Diseños -->
    <li class="nav-item">
      <router-link class="nav-link" to="/diseno/disenos">
        <b-icon icon="brush" />
        <span>Diseños</span>
      </router-link>
    </li>

    <!-- Diseños Terminados -->
    <li class="nav-item">
      <router-link class="nav-link" to="/diseno/terminados">
        <b-icon icon="check-circle" />
        <span>Diseños Terminados</span>
      </router-link>
    </li>

    <!-- Relación de Pagos -->
    <li class="nav-item">
      <router-link class="nav-link" to="/relacion-de-pagos">
        <b-icon icon="receipt" />
        <span>Relación de Pagos</span>
      </router-link>
    </li>

    <!-- Tallas y Personalización -->
    <li class="nav-item">
      <router-link class="nav-link" to="/diseno/tallas-y-personalizacion">
        <b-icon icon="rulers" />
        <span>Tallas y Personalización</span>
      </router-link>
    </li>
  </div>
</template>

<script>
export default {
  name: "SidebarDiseno",
};
</script>
