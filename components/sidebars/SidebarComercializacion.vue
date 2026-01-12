<template>
  <div>
    <!-- Nueva Orden -->
    <li class="nav-item">
      <router-link class="nav-link" to="/comercializacion/ordenes">
        <b-icon icon="file-plus" />
        <span>Nueva Orden</span>
      </router-link>
    </li>

    <!-- Nuevo Presupuesto -->
    <li class="nav-item">
      <router-link class="nav-link" to="/comercializacion/presupuesto">
        <b-icon icon="calculator" />
        <span>Nuevo Presupuesto</span>
      </router-link>
    </li>

    <!-- Órdenes En Curso -->
    <li class="nav-item">
      <router-link class="nav-link" to="/comercializacion/ordenes/activas">
        <b-icon icon="clock-history" />
        <span>Órdenes En Curso</span>
      </router-link>
    </li>

    <!-- Asignación de Diseños -->
    <li class="nav-item">
      <router-link class="nav-link" to="/diseno/asignacion">
        <b-icon icon="palette" />
        <span>Asignación de Diseños</span>
      </router-link>
    </li>

    <!-- Relación de Pagos -->
    <li class="nav-item">
      <router-link class="nav-link" to="/relacion-de-pagos">
        <b-icon icon="receipt" />
        <span>Relación de Pagos</span>
      </router-link>
    </li>

    <!-- Caja (con submenú) -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-caja'">
        <b-icon icon="cash-stack" />
        <span>Caja</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-caja" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/retiros">
              Retiros
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/abonos">
              Otros Abonos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/cierre-de-caja">
              Cierre de Caja
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/reporte-de-caja">
              Reporte de Caja
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Gestión de Clientes -->
    <li class="nav-item">
      <router-link class="nav-link" to="/clientes/gestion">
        <b-icon icon="people" />
        <span>Gestión de Clientes</span>
      </router-link>
    </li>

    <!-- Reportes (con submenú) -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-reportes'">
        <b-icon icon="bar-chart" />
        <span>Reportes</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-reportes" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/reportes/terminadas">
              Órdenes Terminadas
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/reportes/entregadas">
              Órdenes Entregadas
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/reportes/general">
              Reporte General de Órdenes
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>
  </div>
</template>

<script>
export default {
  name: "SidebarComercializacion",
};
</script>
