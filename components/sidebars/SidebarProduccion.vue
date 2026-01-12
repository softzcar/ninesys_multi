<template>
  <div>
    <!-- Control de Producción -->
    <li class="nav-item">
      <router-link class="nav-link" to="/test">
        <b-icon icon="gear" />
        <span>Control de Producción</span>
      </router-link>
    </li>

    <!-- Órdenes Activas -->
    <li class="nav-item">
      <router-link class="nav-link" to="/produccion/ordenes-activas">
        <b-icon icon="clock-history" />
        <span>Órdenes Activas</span>
      </router-link>
    </li>

    <!-- Fechas de Entrega -->
    <li class="nav-item">
      <router-link class="nav-link" to="/ordenes-fechas-entrega">
        <b-icon icon="calendar-event" />
        <span>Fechas de Entrega</span>
      </router-link>
    </li>

    <!-- Cortar -->
    <li class="nav-item">
      <router-link class="nav-link" to="/produccion/cortar">
        <b-icon icon="scissors" />
        <span>Cortar</span>
      </router-link>
    </li>

    <!-- Lotes -->
    <li class="nav-item">
      <router-link class="nav-link" to="/produccion/lotes">
        <b-icon icon="collection" />
        <span>Lotes</span>
      </router-link>
    </li>

    <!-- Asistencias -->
    <li class="nav-item">
      <router-link class="nav-link" to="/asistencias">
        <b-icon icon="calendar-check" />
        <span>Asistencias</span>
      </router-link>
    </li>

    <!-- Inventario -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-inventario-prod'">
        <b-icon icon="box-seam" />
        <span>Inventario</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-inventario-prod" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario/gestion">
              Inventario
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/impresoras/gestion">
              Gestión de Impresoras
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario/recarga-tintas">
              Recarga de Tintas
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario/nueva-tinta">
              Nueva Tinta
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/catalogo-insumos-productos">
              Catálogo de Insumos
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>
  </div>
</template>

<script>
export default {
  name: "SidebarProduccion",
};
</script>
