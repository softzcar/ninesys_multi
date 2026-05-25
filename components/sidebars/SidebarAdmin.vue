<template>
  <div>
    <!-- Órdenes y Lotes -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-ordenes'">
        <b-icon icon="file-text" />
        <span>Órdenes y Lotes</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-ordenes" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/ordenes">
              Nueva Orden
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/presupuesto">
              Nuevo Presupuesto
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/relacion-de-pagos">
              Relación de Pagos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/ordenes/activas">
              Órdenes En Curso
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/produccion/ordenes-todas">
              Todas las Órdenes
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Caja -->
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
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/reportes/pagos-abonos">
              Balance de pagos y abonos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/comercializacion/reportes/balance-cierres">
              Balance de cierres
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Diseños -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-disenos'">
        <b-icon icon="palette" />
        <span>Diseños</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-disenos" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/diseno/asignacion">
              Asignación
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/diseno/terminados">
              Terminados
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/diseno/aprobacion">
              Aprobación
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Control de Producción -->
    <li class="nav-item">
      <router-link class="nav-link" to="/test">
        <b-icon icon="gear" />
        <span>Control de Producción</span>
      </router-link>
    </li>

    <!-- Inventario -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-inventario'">
        <b-icon icon="box-seam" />
        <span>Inventario</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-inventario" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario/gestion">
              Inventario
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/administradores/inventario/remanentes">
              Gestión de Remanentes
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/catalogo-insumos-productos">
              Catálogo de Insumos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario/reportes/general/reporte">
              Reporte de Inventario
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario/reportes/movimientos">
              Reporte de Movimientos
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Impresoras -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-impresoras'">
        <b-icon icon="printer" />
        <span>Impresoras</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-impresoras" class="sub-menu">
        <ul class="nav flex-column">
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
            <router-link class="nav-link" to="/impresoras/servicios">
              Servicio Técnico
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/reporte-impresoras">
              Reporte de Impresoras
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/impresoras/tintas-actual">
              Tintas Actuales
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Empleados -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-empleados'">
        <b-icon icon="people" />
        <span>Empleados</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-empleados" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/empleados/gestion">
              Gestión de Empleados
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/departamentos/gestion">
              Gestión de Departamentos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/empleados/activacion">
              Activación de Empleados
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Clientes -->
    <li class="nav-item">
      <router-link class="nav-link" to="/clientes/gestion">
        <b-icon icon="person-lines-fill" />
        <span>Gestión de Clientes</span>
      </router-link>
    </li>

    <!-- Productos -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-productos'">
        <b-icon icon="grid" />
        <span>Productos</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-productos" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/productos/gestion">
              Gestión de Productos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/insumos-productos">
              Insumos de Productos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/comisiones-productos">
              Comisiones de Productos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/atributos-productos">
              Atributos de Productos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/categorias/gestion">
              Categorías
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Pagos -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-pagos'">
        <b-icon icon="wallet2" />
        <span>Pagos</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-pagos" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/empleados/planilla-de-pagos">
              Planilla De Pagos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/empleados/historico-de-pagos">
              Histórico De Pagos
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Reportes -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-reportes'">
        <b-icon icon="bar-chart" />
        <span>Reportes</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-reportes" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/reportes/semanal">
              Reporte General
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario/rendimiento">
              Rendimiento
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/reporte-eficiencia-empleados">
              Eficiencia de Empleados
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario/reportes/orden">
              Insumos por Orden
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario/reportes/insumo">
              Insumos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario/reportes/producto">
              Productos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/reporte-costos-produccion">
              Reporte de Costos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/produccion/reporte-reposiciones">
              Reporte reposiciones
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>



    <!-- Varios -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-varios'">
        <b-icon icon="grid-3x3-gap" />
        <span>Varios</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-varios" class="sub-menu">
        <ul class="nav flex-column">


          <li class="nav-item">
            <router-link class="nav-link" to="/tallas">
              Tallas
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/telas">
              Telas
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/admin/multiplicador-precio">
              Multiplicador de Precio
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/monedas">
              Gestión de Monedas
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Gastos -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-gastos'">
        <b-icon icon="receipt" />
        <span>Gastos</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-gastos" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/empresa/gastos-fijos">
              Gastos Fijos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/empresa/gastos-variables">
              Gastos Variables
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/empresa/gastos-adicionales">
              Gastos Adicionales
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/empresa/gastos-historial">
              Historial de Pagos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/empresa/gastos-bitacora">
              Bitácora de Gastos
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>

    <!-- Configuración -->
    <li class="nav-item">
      <a class="nav-link" v-b-toggle="'sidebar-configuracion'">
        <b-icon icon="gear-fill" />
        <span>Configuración</span>
        <b-icon icon="chevron-down" class="menu-arrow" />
      </a>
      <b-collapse id="sidebar-configuracion" class="sub-menu">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/empresa/configuracion">
              Configuración de Empresa
            </router-link>
          </li>
        </ul>
      </b-collapse>
    </li>
  </div>
</template>

<script>
export default {
  name: "SidebarAdmin",
};
</script>
