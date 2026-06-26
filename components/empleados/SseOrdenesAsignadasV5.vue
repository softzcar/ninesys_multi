<template>
  <div class="dashboard-v2-container">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Cabecera Fija Superior (Solo Buscador y Enviar Mensajes a Personal) -->
    <div class="fixed-top-header">
      <div class="d-flex align-items-center justify-content-between w-100">
        <!-- Buscador principal -->
        <div class="search-container flex-grow-1 mr-2">
          <b-input-group size="md" class="search-input-group">
            <b-input-group-prepend is-text class="search-icon-prepend">
              <b-icon icon="search"></b-icon>
            </b-input-group-prepend>
            <b-form-input v-model="filter" placeholder="Filtrar Orden" class="search-input" type="search"></b-form-input>
            <b-input-group-append v-if="filter">
              <b-button @click="filter = ''" variant="light" class="search-clear-btn">Limpiar</b-button>
            </b-input-group-append>
          </b-input-group>
        </div>
        <!-- Botón WhatsApp del componente correcto (para enviar mensajes al personal) -->
        <admin-WsSendMsgCustomInterno class="flex-shrink-0" />
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="dashboard-content-area">
      <!-- Buscador de órdenes general en base de datos (solo visible en móviles dentro de la zona scrolleable) -->
      <!-- El botón WhatsApp NO se muestra aquí: ya está en el header fijo superior -->
      <div class="d-lg-none mobile-search-wrapper mb-3 p-3 bg-white rounded shadow-sm">
        <buscar-BarraDeBusqueda />
      </div>

      <!-- Título de Depto (En el flujo normal de scroll) -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="dept-title mb-0">
          <span class="dept-label">Departamento</span>
          <span class="dept-name">{{ currentDepartamentName || 'Mis Tareas' }}</span>
        </h4>
      </div>

      <!-- Barras de Eficiencia (No fijas, arriba de las pestañas) -->
      <div class="efficiency-container mb-3" v-if="reporteData || inputEfficiencyData">
        <!-- Eficiencia de Tiempo -->
        <div class="efficiency-row mb-2" v-if="reporteData && (reporteData.totalProjectedTerminadas > 0 || reporteData.totalProjectedEnCurso > 0)">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="eff-label"><b-icon icon="clock-history" class="mr-1"></b-icon> Eficiencia de Tiempo</span>
            <span class="eff-value" :class="'text-' + tiempoEfficiencyVariant">{{ tiempoEfficiencyPercentage }}%</span>
          </div>
          <b-progress :value="tiempoEfficiencyPercentage" :variant="tiempoEfficiencyVariant" class="custom-progress-bar" animated></b-progress>
        </div>
        
        <!-- Eficiencia de Insumos / Material -->
        <div class="efficiency-row" v-if="inputEfficiencyData">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="eff-label"><b-icon icon="layers-half" class="mr-1"></b-icon> Eficiencia de Insumos</span>
            <span class="eff-value" :class="'text-' + materialEfficiencyVariant">{{ materialEfficiencyPercentage }}%</span>
          </div>
          <b-progress :value="materialEfficiencyPercentage" :variant="materialEfficiencyVariant" class="custom-progress-bar" animated></b-progress>
        </div>
      </div>

      <!-- b-overlay envuelve tabs, resumen Y lista para cubrir todo durante la carga -->
      <b-overlay :show="loadingOrders" spinner-small rounded="sm">

      <!-- Pestañas de Navegación (No fijas) -->
      <div class="nav-tabs-container mb-3">
        <button class="nav-tab-item" :class="{ active: activeTab === 'ordenes' }" @click="activeTab = 'ordenes'">
          Órdenes <b-badge pill :variant="activeTab === 'ordenes' ? 'primary' : 'light'" class="ml-1">{{ totalOrdersCount }}</b-badge>
        </button>
        <button class="nav-tab-item" :class="{ active: activeTab === 'revisiones' }" @click="activeTab = 'revisiones'">
          Revisiones <b-badge pill :variant="activeTab === 'revisiones' ? 'primary' : 'light'" class="ml-1">{{ totalRevisionCount }}</b-badge>
        </button>
      </div>
      
      <!-- Panel de Resumen de Tareas -->
      <div class="summary-panel mb-4">
        <b-row class="no-gutters text-center">
          <b-col cols="3" class="summary-box">
            <div class="summary-num">{{ summaryStats.completadas }}</div>
            <div class="summary-label">Completadas</div>
          </b-col>
          <b-col cols="3" class="summary-box">
            <div class="summary-num color-process">{{ summaryStats.enProceso }}</div>
            <div class="summary-label">En proceso</div>
          </b-col>
          <b-col cols="3" class="summary-box">
            <div class="summary-num color-pending">{{ summaryStats.pendientes }}</div>
            <div class="summary-label">Pendientes</div>
          </b-col>
          <b-col cols="3" class="summary-box">
            <div class="summary-num color-urgent">{{ summaryStats.urgentes }}</div>
            <div class="summary-label">Urgentes</div>
          </b-col>
        </b-row>
      </div>


        
        <!-- PESTAÑA: ÓRDENES -->
        <div v-show="activeTab === 'ordenes'">
          <!-- Sección URGENTES (Compartida en ambas pestañas) -->
          <div class="section-container mb-3" v-if="urgentItems.length > 0">
            <div class="section-header bg-urgent-header" @click="collapsedSections.urgente = !collapsedSections.urgente">
              <div class="d-flex align-items-center">
                <b-icon :icon="collapsedSections.urgente ? 'chevron-right' : 'chevron-down'" class="mr-2"></b-icon>
                <h5 class="mb-0 font-weight-bold text-uppercase text-danger"><b-icon icon="exclamation-circle-fill" class="mr-1"></b-icon> URGENTE</h5>
                <b-badge variant="danger" class="ml-2">{{ urgentItems.length }}</b-badge>
              </div>
            </div>
            <b-collapse :visible="!collapsedSections.urgente">
              <div class="section-content mt-2">
                <div v-for="item in urgentItems" :key="item.esreposicion ? 'rep-' + item.id_reposicion : 'ord-' + item.id_orden" class="task-card-item" :id="`task-card-${item.esreposicion ? 'rep-' + item.id_reposicion : 'ord-' + item.id_orden}`">
                  
                  <!-- Card Component Reutilizado con estructura responsiva -->
                  <div class="modern-task-card urgent-card">
                    <div class="card-main-row">
                      <div class="card-left-select" v-if="!isTaskInProcess(item) && esDepartamentoDeMateriales">
                        <b-form-checkbox v-model="ordenesSeleccionadas" :value="item.id_orden || item.orden" size="lg" :disabled="!item.esreposicion && verificarOrdenProceso(item.orden_proceso, item.orden_proceso_min)" />
                      </div>
                      <div class="card-badge-col">
                        <div class="badge-type-box" :class="item.esreposicion ? 'type-rev' : 'type-ord'">
                          <span class="type-text">{{ item.esreposicion ? 'REV' : 'ORD' }}</span>
                          <linkSearch :id="item.orden || item.id_orden" class="type-id-link" />
                        </div>
                      </div>
                      <div class="card-info-col">
                        <div class="info-top-row">
                          <span class="info-item pzas-badge" @click="abrirDetalleMaterial(item.orden || item.id_orden)" v-b-tooltip.hover title="Ver Material Estimado">
                            <b-icon icon="box-seam" class="mr-1"></b-icon>
                            <strong>{{ item.unidades }}</strong> pzas
                          </span>
                          <span class="info-item time-badge" :class="filterFechaEstimada(item.orden || item.id_orden).variant">
                            <span class="time-text-content">
                              {{ filterTiempoEstimado(item.orden || item.id_orden) || '--' }}
                            </span>
                          </span>
                        </div>
                        <div class="info-bottom-row mt-2">
                          <span class="status-pill status-urgent">Urgente</span>
                          <div class="card-progress-bar-container ml-auto" v-if="isTaskInProcess(item)">
                            <empleados-ProgressBarEmpleados :idOrden="item.orden || item.id_orden" />
                          </div>
                        </div>
                      </div>
                      <div class="card-right-action" :class="getRightPanelClass(item)" @click="handleRightPanelClick(item)">
                        <b-icon :icon="isTaskInProcess(item) ? 'check-lg' : 'play-fill'"></b-icon>
                      </div>
                    </div>

                    <!-- Fila de Acciones Secundarias -->
                    <div class="card-actions-bar mt-3">
                      <div class="btn-extra-actions-wrapper" v-if="isTaskInProcess(item)">
                        <empleados-SseOrdenesAsignadasModalExtra :pausas="pausas" :departamento="$store.state.login.dataUser.departamento" :item="item" :items="filterOrder(item.orden || item.id_orden, 'en curso')" :esreposicion="item.esreposicion ? 1 : 0" :impresoras="impresoras" :insumosTodos="insumos" :insumosimp="insumosImpresion" :insumosest="insumosEstampado" :insumoscos="insumosCostura" :insumoslim="insumosLimpieza" :insumosrev="insumosRevision" :insumoscor="insumosCorte" :data-insumos="dataInsumos" tipo="todo" :idorden="item.orden || item.id_orden" :id_ordenes_productos="item.id_ordenes_productos" @reload="reloadMe()" :orden_proceso_departamento="item.orden_proceso_departamento" />
                      </div>
                      <div class="btn-lote-wrapper">
                        <empleados-InsumosEstimadosVista :ref="'insumos-' + (item.orden || item.id_orden)" :hideButton="true" :idorden="item.orden || item.id_orden" :departamentoId="$store.state.login.currentDepartamentId" :dataInsumos="dataInsumos" />
                      </div>
                      <div class="btn-reposicion-wrapper" v-if="isTaskInProcess(item)">
                        <empleados-reposicion @reload_this="reloadMe" :id_orden="item.orden || item.id_orden" :itemRep="item" :productos="productsFilter(item.orden || item.id_orden)" />
                      </div>
                      <div class="btn-diseno-wrapper" v-if="!isTaskInProcess(item)">
                        <diseno-view-image :id="item.orden || item.id_orden" />
                      </div>
                      <div class="btn-dano-wrapper">
                        <produccion-control-de-produccion-detalles-editor :esreposicion="item.esreposicion ? 'true' : 'false'" :idorden="item.orden || item.id_orden" :detalles-externos="item.detalle_reposicion" :detalles="item.observaciones" :detalle_empleado="item.detalle_empleado" :productos="productsFilter(item.orden || item.id_orden)" />
                      </div>
                      <div class="btn-vinculadas-wrapper" v-if="filterVinculdas(item.orden || item.id_orden).length > 0">
                        <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculdas(item.orden || item.id_orden)" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </b-collapse>
          </div>

          <!-- Lotes en Proceso (Sección Colapsable) -->
          <div v-if="lotesActivos.length > 0" class="section-container mb-4">
            <div class="section-header active-lotes-header" @click="collapsedSections.lotes = !collapsedSections.lotes">
              <div class="d-flex align-items-center">
                <b-icon :icon="collapsedSections.lotes ? 'chevron-right' : 'chevron-down'" class="mr-2"></b-icon>
                <h5 class="mb-0 font-weight-bold text-uppercase">
                  <b-icon icon="collection-play" class="mr-1"></b-icon> Lotes en Proceso
                </h5>
                <b-badge variant="dark" class="ml-2">{{ lotesActivos.length }}</b-badge>
              </div>
            </div>
            <b-collapse :visible="!collapsedSections.lotes">
              <div class="section-content mt-2">
                <div v-for="lote in lotesActivos" :key="lote.id" class="lote-card mb-3 p-3">
                  <!-- Fila principal: título + estado + botón de acción -->
                  <div class="card-main-row mb-2">
                    <div class="card-info-col">
                      <div class="info-top-row">
                        <span class="lote-title">Lote #{{ lote.id }}</span>
                        <b-badge
                          :variant="lote.estado === 'en_curso' ? 'success' : 'secondary'"
                          class="ml-2"
                        >{{ lote.estado }}</b-badge>
                      </div>
                    </div>
                    <!-- Botón acción: ▶ Iniciar (pendiente) | ✓ Finalizar (en_curso) -->
                    <div
                      class="card-right-action flex-shrink-0"
                      :class="lote.estado === 'en_curso' ? 'right-normal-process' : 'right-normal-pending'"
                      @click="lote.estado === 'pendiente' ? iniciarLote(lote.id) : finalizarLotePorDepartamento(lote.id)"
                    >
                      <b-icon :icon="lote.estado === 'en_curso' ? 'check-lg' : 'play-fill'"></b-icon>
                    </div>
                  </div>
                  <!-- Lista de órdenes del lote -->
                  <div class="lote-orders-list">
                    <div v-for="orden in lote.ordenes" :key="orden.id_orden" class="lote-order-item d-flex align-items-center">
                      <div class="card-badge-col flex-shrink-0 mr-3">
                        <div class="badge-type-box type-ord">
                          <span class="type-text">ORD</span>
                          <linkSearch :id="orden.id_orden" class="type-id-link" />
                        </div>
                      </div>
                      <span class="lote-cliente-nombre flex-grow-1">{{ orden.cliente_nombre }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </b-collapse>
          </div>

          <!-- Sección EN PROCESO: incluye órdenes normales + urgentes ya iniciadas -->
          <div class="section-container mb-3">
            <div class="section-header" @click="collapsedSections.enProceso = !collapsedSections.enProceso">
              <div class="d-flex align-items-center">
                <b-icon :icon="collapsedSections.enProceso ? 'chevron-right' : 'chevron-down'" class="mr-2"></b-icon>
                <h5 class="mb-0 font-weight-bold text-uppercase text-primary"><b-icon icon="gear-fill" class="mr-1"></b-icon> EN PROCESO</h5>
                <b-badge variant="primary" class="ml-2">{{ ordersInProcess.length }}</b-badge>
              </div>
            </div>
            <b-collapse :visible="!collapsedSections.enProceso">
              <div class="section-content mt-2">
                <b-alert v-if="ordersInProcess.length === 0" show variant="info" class="text-center py-3">No tienes tareas en curso</b-alert>
                <div v-for="item in ordersInProcess" :key="'ord-' + item.id_orden" class="task-card-item" :id="`task-card-ord-${item.id_orden}`">
                  
                  <div :class="['modern-task-card', parseInt(item.prioridad) > 0 ? 'urgent-card' : '']">
                    <div class="card-main-row">
                      <div class="card-badge-col">
                        <div class="badge-type-box type-ord">
                          <span class="type-text">ORD</span>
                          <linkSearch :id="item.orden || item.id_orden" class="type-id-link" />
                        </div>
                      </div>
                      <div class="card-info-col">
                        <div class="info-top-row">
                          <span class="info-item pzas-badge" @click="abrirDetalleMaterial(item.orden || item.id_orden)" v-b-tooltip.hover title="Ver Material Estimado">
                            <b-icon icon="box-seam" class="mr-1"></b-icon>
                            <strong>{{ item.unidades }}</strong> pzas
                          </span>
                          <span class="info-item time-badge" :class="filterFechaEstimada(item.orden || item.id_orden).variant">
                            <span class="time-text-content">
                              {{ filterTiempoEstimado(item.orden || item.id_orden) || '--' }}
                            </span>
                          </span>
                        </div>
                        <div class="info-bottom-row mt-2">
                          <!-- Pill dinámico: Urgente si prioridad > 0, si no En proceso -->
                          <span :class="['status-pill', parseInt(item.prioridad) > 0 ? 'status-urgent' : 'status-process']">
                            {{ parseInt(item.prioridad) > 0 ? 'Urgente' : 'En proceso' }}
                          </span>
                          <div class="card-progress-bar-container ml-auto">
                            <empleados-ProgressBarEmpleados :idOrden="item.orden || item.id_orden" />
                          </div>
                        </div>
                      </div>
                      <div class="card-right-action right-normal-process" @click="handleRightPanelClick(item)">
                        <b-icon icon="check-lg"></b-icon>
                      </div>
                    </div>

                    <!-- Acciones secundarias -->
                    <div class="card-actions-bar mt-3">
                      <div class="btn-extra-actions-wrapper">
                        <empleados-SseOrdenesAsignadasModalExtra :pausas="pausas" :departamento="$store.state.login.dataUser.departamento" :item="item" :items="filterOrder(item.orden || item.id_orden, 'en curso')" :esreposicion="0" :impresoras="impresoras" :insumosTodos="insumos" :insumosimp="insumosImpresion" :insumosest="insumosEstampado" :insumoscos="insumosCostura" :insumoslim="insumosLimpieza" :insumosrev="insumosRevision" :insumoscor="insumosCorte" :data-insumos="dataInsumos" tipo="todo" :idorden="item.orden || item.id_orden" :id_ordenes_productos="item.id_ordenes_productos" @reload="reloadMe()" :orden_proceso_departamento="item.orden_proceso_departamento" />
                      </div>
                      <div class="btn-lote-wrapper">
                        <empleados-InsumosEstimadosVista :ref="'insumos-' + (item.orden || item.id_orden)" :hideButton="true" :idorden="item.orden || item.id_orden" :departamentoId="$store.state.login.currentDepartamentId" :dataInsumos="dataInsumos" />
                      </div>
                      <div class="btn-reposicion-wrapper">
                        <empleados-reposicion @reload_this="reloadMe" :id_orden="item.orden || item.id_orden" :itemRep="item" :productos="productsFilter(item.orden || item.id_orden)" />
                      </div>
                      <div class="btn-dano-wrapper">
                        <produccion-control-de-produccion-detalles-editor :esreposicion="'false'" :idorden="item.orden || item.id_orden" :detalles-externos="item.detalle_reposicion" :detalles="item.observaciones" :detalle_empleado="item.detalle_empleado" :productos="productsFilter(item.orden || item.id_orden)" />
                      </div>
                      <div class="btn-vinculadas-wrapper" v-if="filterVinculdas(item.orden || item.id_orden).length > 0">
                        <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculdas(item.orden || item.id_orden)" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </b-collapse>
          </div>

          <!-- Sección PENDIENTES -->
          <div class="section-container mb-3">
            <div class="section-header" @click="collapsedSections.pendientes = !collapsedSections.pendientes">
              <div class="d-flex align-items-center">
                <b-icon :icon="collapsedSections.pendientes ? 'chevron-right' : 'chevron-down'" class="mr-2"></b-icon>
                <h5 class="mb-0 font-weight-bold text-uppercase text-success"><b-icon icon="clock-fill" class="mr-1"></b-icon> PENDIENTES</h5>
                <b-badge variant="success" class="ml-2">{{ ordersPending.length }}</b-badge>
              </div>
            </div>
            <b-collapse :visible="!collapsedSections.pendientes">
              <div class="section-content mt-2">
                <b-alert v-if="ordersPending.length === 0" show variant="info" class="text-center py-3">No tienes tareas pendientes</b-alert>
                <div v-for="item in ordersPending" :key="'ord-' + item.id_orden" class="task-card-item" :id="`task-card-ord-${item.id_orden}`">
                  
                  <div class="modern-task-card">
                    <div class="card-main-row">
                      <div class="card-left-select" v-if="esDepartamentoDeMateriales">
                        <b-form-checkbox v-model="ordenesSeleccionadas" :value="item.id_orden || item.orden" size="lg" :disabled="verificarOrdenProceso(item.orden_proceso, item.orden_proceso_min)" />
                      </div>
                      <div class="card-badge-col">
                        <div class="badge-type-box type-ord">
                          <span class="type-text">ORD</span>
                          <linkSearch :id="item.orden || item.id_orden" class="type-id-link" />
                        </div>
                      </div>
                      <div class="card-info-col">
                        <div class="info-top-row">
                          <span class="info-item pzas-badge" @click="abrirDetalleMaterial(item.orden || item.id_orden)" v-b-tooltip.hover title="Ver Material Estimado">
                            <b-icon icon="box-seam" class="mr-1"></b-icon>
                            <strong>{{ item.unidades }}</strong> pzas
                          </span>
                          <span class="info-item time-badge" :class="filterFechaEstimada(item.orden || item.id_orden).variant">
                            <span class="time-text-content">
                              {{ filterTiempoEstimado(item.orden || item.id_orden) || '--' }}
                            </span>
                          </span>
                        </div>
                        <div class="info-bottom-row mt-2">
                          <span class="status-pill status-pending">Pendiente</span>
                        </div>
                      </div>
                      <div class="card-right-action right-normal-pending" :class="{ 'disabled-action': !item.esreposicion && verificarOrdenProceso(item.orden_proceso, item.orden_proceso_min) }" @click="handleRightPanelClick(item)">
                        <b-icon icon="play-fill"></b-icon>
                      </div>
                    </div>

                    <!-- Acciones secundarias -->
                    <div class="card-actions-bar mt-3">
                      <div class="btn-lote-wrapper">
                        <empleados-InsumosEstimadosVista :ref="'insumos-' + (item.orden || item.id_orden)" :hideButton="true" :idorden="item.orden || item.id_orden" :departamentoId="$store.state.login.currentDepartamentId" :dataInsumos="dataInsumos" />
                      </div>
                      <div class="btn-diseno-wrapper">
                        <diseno-view-image :id="item.orden || item.id_orden" />
                      </div>
                      <div class="btn-dano-wrapper">
                        <produccion-control-de-produccion-detalles-editor :esreposicion="'false'" :idorden="item.orden || item.id_orden" :detalles-externos="item.detalle_reposicion" :detalles="item.observaciones" :detalle_empleado="item.detalle_empleado" :productos="productsFilter(item.orden || item.id_orden)" />
                      </div>
                      <div class="btn-vinculadas-wrapper" v-if="filterVinculdas(item.orden || item.id_orden).length > 0">
                        <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculdas(item.orden || item.id_orden)" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </b-collapse>
          </div>
        </div>

        <!-- PESTAÑA: REVISIONES -->
        <div v-show="activeTab === 'revisiones'">
          <!-- Sección URGENTES (Compartida en ambas pestañas) -->
          <div class="section-container mb-3" v-if="urgentItems.length > 0">
            <div class="section-header bg-urgent-header" @click="collapsedSections.urgente = !collapsedSections.urgente">
              <div class="d-flex align-items-center">
                <b-icon :icon="collapsedSections.urgente ? 'chevron-right' : 'chevron-down'" class="mr-2"></b-icon>
                <h5 class="mb-0 font-weight-bold text-uppercase text-danger"><b-icon icon="exclamation-circle-fill" class="mr-1"></b-icon> URGENTE</h5>
                <b-badge variant="danger" class="ml-2">{{ urgentItems.length }}</b-badge>
              </div>
            </div>
            <b-collapse :visible="!collapsedSections.urgente">
              <div class="section-content mt-2">
                <div v-for="item in urgentItems" :key="item.esreposicion ? 'rep-' + item.id_reposicion : 'ord-' + item.id_orden" class="task-card-item" :id="`task-card-${item.esreposicion ? 'rep-' + item.id_reposicion : 'ord-' + item.id_orden}`">
                  
                  <div class="modern-task-card urgent-card">
                    <div class="card-main-row">
                      <div class="card-left-select" v-if="!isTaskInProcess(item) && esDepartamentoDeMateriales">
                        <b-form-checkbox v-model="ordenesSeleccionadas" :value="item.id_orden || item.orden" size="lg" :disabled="!item.esreposicion && verificarOrdenProceso(item.orden_proceso, item.orden_proceso_min)" />
                      </div>
                      <div class="card-badge-col">
                        <div class="badge-type-box" :class="item.esreposicion ? 'type-rev' : 'type-ord'">
                          <span class="type-text">{{ item.esreposicion ? 'REV' : 'ORD' }}</span>
                          <linkSearch :id="item.orden || item.id_orden" class="type-id-link" />
                        </div>
                      </div>
                      <div class="card-info-col">
                        <div class="info-top-row">
                          <span class="info-item pzas-badge" @click="abrirDetalleMaterial(item.orden || item.id_orden)" v-b-tooltip.hover title="Ver Material Estimado">
                            <b-icon icon="box-seam" class="mr-1"></b-icon>
                            <strong>{{ item.unidades }}</strong> pzas
                          </span>
                          <span class="info-item time-badge" :class="filterFechaEstimada(item.orden || item.id_orden).variant">
                            <span class="time-text-content">
                              {{ filterTiempoEstimado(item.orden || item.id_orden) || '--' }}
                            </span>
                          </span>
                        </div>
                        <div class="info-bottom-row mt-2">
                          <span class="status-pill status-urgent">Urgente</span>
                          <div class="card-progress-bar-container ml-auto" v-if="isTaskInProcess(item)">
                            <empleados-ProgressBarEmpleados :idOrden="item.orden || item.id_orden" />
                          </div>
                        </div>
                      </div>
                      <div class="card-right-action" :class="getRightPanelClass(item)" @click="handleRightPanelClick(item)">
                        <b-icon :icon="isTaskInProcess(item) ? 'check-lg' : 'play-fill'"></b-icon>
                      </div>
                    </div>

                    <!-- Fila de Acciones Secundarias -->
                    <div class="card-actions-bar mt-3">
                      <div class="btn-extra-actions-wrapper" v-if="isTaskInProcess(item)">
                        <empleados-SseOrdenesAsignadasModalExtra :pausas="pausas" :departamento="$store.state.login.dataUser.departamento" :item="item" :items="filterOrder(item.orden || item.id_orden, 'en curso')" :esreposicion="item.esreposicion ? 1 : 0" :impresoras="impresoras" :insumosTodos="insumos" :insumosimp="insumosImpresion" :insumosest="insumosEstampado" :insumoscos="insumosCostura" :insumoslim="insumosLimpieza" :insumosrev="insumosRevision" :insumoscor="insumosCorte" :data-insumos="dataInsumos" tipo="todo" :idorden="item.orden || item.id_orden" :id_ordenes_productos="item.id_ordenes_productos" @reload="reloadMe()" :orden_proceso_departamento="item.orden_proceso_departamento" />
                      </div>
                      <div class="btn-lote-wrapper">
                        <empleados-InsumosEstimadosVista :ref="'insumos-' + (item.orden || item.id_orden)" :hideButton="true" :idorden="item.orden || item.id_orden" :departamentoId="$store.state.login.currentDepartamentId" :dataInsumos="dataInsumos" />
                      </div>
                      <div class="btn-reposicion-wrapper" v-if="isTaskInProcess(item)">
                        <empleados-reposicion @reload_this="reloadMe" :id_orden="item.orden || item.id_orden" :itemRep="item" :productos="productsFilter(item.orden || item.id_orden)" />
                      </div>
                      <div class="btn-diseno-wrapper" v-if="!isTaskInProcess(item)">
                        <diseno-view-image :id="item.orden || item.id_orden" />
                      </div>
                      <div class="btn-dano-wrapper">
                        <produccion-control-de-produccion-detalles-editor :esreposicion="item.esreposicion ? 'true' : 'false'" :idorden="item.orden || item.id_orden" :detalles-externos="item.detalle_reposicion" :detalles="item.observaciones" :detalle_empleado="item.detalle_empleado" :productos="productsFilter(item.orden || item.id_orden)" />
                      </div>
                      <div class="btn-vinculadas-wrapper" v-if="filterVinculdas(item.orden || item.id_orden).length > 0">
                        <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculdas(item.orden || item.id_orden)" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </b-collapse>
          </div>

          <!-- Sección EN PROCESO -->
          <div class="section-container mb-3">
            <div class="section-header" @click="collapsedSections.enProceso = !collapsedSections.enProceso">
              <div class="d-flex align-items-center">
                <b-icon :icon="collapsedSections.enProceso ? 'chevron-right' : 'chevron-down'" class="mr-2"></b-icon>
                <h5 class="mb-0 font-weight-bold text-uppercase text-primary"><b-icon icon="gear-fill" class="mr-1"></b-icon> EN PROCESO</h5>
                <b-badge variant="primary" class="ml-2">{{ revisionsInProcess.length }}</b-badge>
              </div>
            </div>
            <b-collapse :visible="!collapsedSections.enProceso">
              <div class="section-content mt-2">
                <b-alert v-if="revisionsInProcess.length === 0" show variant="info" class="text-center py-3">No tienes revisiones en curso</b-alert>
                <div v-for="item in revisionsInProcess" :key="'rep-' + item.id_reposicion" class="task-card-item" :id="`task-card-rep-${item.id_reposicion}`">
                  
                  <div :class="['modern-task-card', parseInt(item.prioridad) > 0 ? 'urgent-card' : '']">
                    <div class="card-main-row">
                      <div class="card-badge-col">
                        <div class="badge-type-box type-rev">
                          <span class="type-text">REV</span>
                          <linkSearch :id="item.orden || item.id_orden" class="type-id-link" />
                        </div>
                      </div>
                      <div class="card-info-col">
                        <div class="info-top-row">
                          <span class="info-item pzas-badge" @click="abrirDetalleMaterial(item.orden || item.id_orden)" v-b-tooltip.hover title="Ver Material Estimado">
                            <b-icon icon="box-seam" class="mr-1"></b-icon>
                            <strong>{{ item.unidades }}</strong> pzas
                          </span>
                          <span class="info-item time-badge" :class="filterFechaEstimada(item.orden || item.id_orden).variant">
                            <span class="time-text-content">
                              {{ filterTiempoEstimado(item.orden || item.id_orden) || '--' }}
                            </span>
                          </span>
                        </div>
                        <div class="info-bottom-row mt-2">
                          <span :class="['status-pill', parseInt(item.prioridad) > 0 ? 'status-urgent' : 'status-process']">
                            {{ parseInt(item.prioridad) > 0 ? 'Urgente' : 'En proceso' }}
                          </span>
                          <div class="card-progress-bar-container ml-auto">
                            <empleados-ProgressBarEmpleados :idOrden="item.orden || item.id_orden" />
                          </div>
                        </div>
                      </div>
                      <div class="card-right-action right-normal-process" @click="handleRightPanelClick(item)">
                        <b-icon icon="check-lg"></b-icon>
                      </div>
                    </div>

                    <!-- Acciones secundarias -->
                    <div class="card-actions-bar mt-3">
                      <div class="btn-extra-actions-wrapper">
                        <empleados-SseOrdenesAsignadasModalExtra :pausas="pausas" :departamento="$store.state.login.dataUser.departamento" :item="item" :items="filterOrder(item.orden || item.id_orden, 'en curso')" :esreposicion="1" :impresoras="impresoras" :insumosTodos="insumos" :insumosimp="insumosImpresion" :insumosest="insumosEstampado" :insumoscos="insumosCostura" :insumoslim="insumosLimpieza" :insumosrev="insumosRevision" :insumoscor="insumosCorte" :data-insumos="dataInsumos" tipo="todo" :idorden="item.orden || item.id_orden" :id_ordenes_productos="item.id_ordenes_productos" @reload="reloadMe()" :orden_proceso_departamento="item.orden_proceso_departamento" />
                      </div>
                      <div class="btn-lote-wrapper">
                        <empleados-InsumosEstimadosVista :ref="'insumos-' + (item.orden || item.id_orden)" :hideButton="true" :idorden="item.orden || item.id_orden" :departamentoId="$store.state.login.currentDepartamentId" :dataInsumos="dataInsumos" />
                      </div>
                      <div class="btn-reposicion-wrapper">
                        <empleados-reposicion @reload_this="reloadMe" :id_orden="item.orden || item.id_orden" :itemRep="item" :productos="productsFilter(item.orden || item.id_orden)" />
                      </div>
                      <div class="btn-dano-wrapper">
                        <produccion-control-de-produccion-detalles-editor :esreposicion="'true'" :idorden="item.orden || item.id_orden" :detalles-externos="item.detalle_reposicion" :detalles="item.observaciones" :detalle_empleado="item.detalle_empleado" :productos="productsFilter(item.orden || item.id_orden)" />
                      </div>
                      <div class="btn-vinculadas-wrapper" v-if="filterVinculdas(item.orden || item.id_orden).length > 0">
                        <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculdas(item.orden || item.id_orden)" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </b-collapse>
          </div>

          <!-- Sección PENDIENTES -->
          <div class="section-container mb-3">
            <div class="section-header" @click="collapsedSections.pendientes = !collapsedSections.pendientes">
              <div class="d-flex align-items-center">
                <b-icon :icon="collapsedSections.pendientes ? 'chevron-right' : 'chevron-down'" class="mr-2"></b-icon>
                <h5 class="mb-0 font-weight-bold text-uppercase text-success"><b-icon icon="clock-fill" class="mr-1"></b-icon> PENDIENTES</h5>
                <b-badge variant="success" class="ml-2">{{ revisionsPending.length }}</b-badge>
              </div>
            </div>
            <b-collapse :visible="!collapsedSections.pendientes">
              <div class="section-content mt-2">
                <b-alert v-if="revisionsPending.length === 0" show variant="info" class="text-center py-3">No tienes revisiones pendientes</b-alert>
                <div v-for="item in revisionsPending" :key="'rep-' + item.id_reposicion" class="task-card-item" :id="`task-card-rep-${item.id_reposicion}`">
                  
                  <div class="modern-task-card">
                    <div class="card-main-row">
                      <div class="card-left-select" v-if="esDepartamentoDeMateriales">
                        <b-form-checkbox v-model="ordenesSeleccionadas" :value="item.id_orden || item.orden" size="lg" :disabled="verificarOrdenProceso(item.orden_proceso, item.orden_proceso_min)" />
                      </div>
                      <div class="card-badge-col">
                        <div class="badge-type-box type-rev">
                          <span class="type-text">REV</span>
                          <linkSearch :id="item.orden || item.id_orden" class="type-id-link" />
                        </div>
                      </div>
                      <div class="card-info-col">
                        <div class="info-top-row">
                          <span class="info-item pzas-badge" @click="abrirDetalleMaterial(item.orden || item.id_orden)" v-b-tooltip.hover title="Ver Material Estimado">
                            <b-icon icon="box-seam" class="mr-1"></b-icon>
                            <strong>{{ item.unidades }}</strong> pzas
                          </span>
                          <span class="info-item time-badge" :class="filterFechaEstimada(item.orden || item.id_orden).variant">
                            <span class="time-text-content">
                              {{ filterTiempoEstimado(item.orden || item.id_orden) || '--' }}
                            </span>
                          </span>
                        </div>
                        <div class="info-bottom-row mt-2">
                          <span class="status-pill status-pending">Pendiente</span>
                        </div>
                      </div>
                      <div class="card-right-action right-normal-pending" :class="{ 'disabled-action': !item.esreposicion && verificarOrdenProceso(item.orden_proceso, item.orden_proceso_min) }" @click="handleRightPanelClick(item)">
                        <b-icon icon="play-fill"></b-icon>
                      </div>
                    </div>

                    <!-- Acciones secundarias -->
                    <div class="card-actions-bar mt-3">
                      <div class="btn-lote-wrapper">
                        <empleados-InsumosEstimadosVista :ref="'insumos-' + (item.orden || item.id_orden)" :hideButton="true" :idorden="item.orden || item.id_orden" :departamentoId="$store.state.login.currentDepartamentId" :dataInsumos="dataInsumos" />
                      </div>
                      <div class="btn-diseno-wrapper">
                        <diseno-view-image :id="item.orden || item.id_orden" />
                      </div>
                      <div class="btn-dano-wrapper">
                        <produccion-control-de-produccion-detalles-editor :esreposicion="'true'" :idorden="item.orden || item.id_orden" :detalles-externos="item.detalle_reposicion" :detalles="item.observaciones" :detalle_empleado="item.detalle_empleado" :productos="productsFilter(item.orden || item.id_orden)" />
                      </div>
                      <div class="btn-vinculadas-wrapper" v-if="filterVinculdas(item.orden || item.id_orden).length > 0">
                        <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculdas(item.orden || item.id_orden)" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </b-collapse>
          </div>
        </div>

      </b-overlay>
    </div>

    <!-- Barra inferior flotante para Iniciar en Lote -->
    <div class="bottom-batch-bar shadow-lg" v-if="ordenesSeleccionadas.length > 0">
      <div class="d-flex justify-content-between align-items-center w-100 px-4 py-2">
        <span class="batch-count-label">Seleccionadas: <b-badge variant="info" style="font-size: 1.05rem;">{{ ordenesSeleccionadas.length }}</b-badge></span>
        <b-button @click="crearLote" variant="success" pill class="batch-action-btn font-weight-bold">
          <b-icon icon="play-fill" class="mr-1"></b-icon> Iniciar lote
        </b-button>
      </div>
    </div>

    <!-- MODALES DE COMPONENTE ORIGINAL (PRESERVADOS INTACTOS) -->
    <!-- MODAL PARA FINALIZAR LOTE -->
    <FinalizarLoteModal v-if="loteParaFinalizar" :show="showFinalizarLoteModal" :lote-id="loteParaFinalizar.id"
      :total-papel-utilizado="papelUtilizadoLote" :insumos="insumos" :ordenes="ordenesParaFinalizar"
      :data-insumos="dataInsumos" :impresoras="impresoras" :es-reposicion="esReposicionParaFinalizar"
      @close="showFinalizarLoteModal = false" @lote-finalizado="handleLoteFinalizado" />

    <!-- MODAL PARA FINALIZAR LOTE DE IMPRESIÓN -->
    <FinalizarLoteImpresionModal v-if="loteParaFinalizar" :show="showFinalizarImpresionModal"
      :lote-id="loteParaFinalizar.id" :insumos="insumos" :impresoras="impresoras" :ordenes="ordenesParaFinalizar"
      :es-reposicion="esReposicionParaFinalizar" @close="showFinalizarImpresionModal = false"
      @lote-finalizado="handleLoteFinalizado" />

    <!-- MODAL PARA FINALIZAR LOTE DE CORTE -->
    <FinalizarLoteCorteModal v-if="loteParaFinalizar" :show="showFinalizarCorteModal" :lote-id="loteParaFinalizar.id"
      :insumos="insumos" :ordenes="ordenesParaFinalizar" @close="showFinalizarCorteModal = false"
      @lote-finalizado="handleLoteFinalizado" />
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import mixin2 from "~/mixins/mixin-proyeccion-entrega.js";
import procesamientoOrdenesMixin from "~/mixins/procesamientoOrdenes.js";
import mixintime from "~/mixins/mixin-time.js";
import FinalizarLoteModal from '~/components/empleados/FinalizarLoteModal.vue';
import FinalizarLoteImpresionModal from '~/components/empleados/FinalizarLoteImpresionModal.vue';
import FinalizarLoteCorteModal from '~/components/empleados/FinalizarLoteCorteModal.vue';
import CorteItemView from '~/components/produccion/CorteItemView.vue';

export default {
  name: "SseOrdenesAsignadasV5",
  components: {
    FinalizarLoteModal,
    FinalizarLoteImpresionModal,
    FinalizarLoteCorteModal,
    CorteItemView,
  },
  data() {
    return {
      // Pestañas e interfaz
      activeTab: 'ordenes',
      collapsedSections: {
        lotes: false,
        urgente: false,
        enProceso: false,
        pendientes: false
      },
      completedTodayCount: 0,

      // Modal de finalización
      showFinalizarLoteModal: false,
      showFinalizarImpresionModal: false,
      showFinalizarCorteModal: false,
      loteParaFinalizar: null,
      ordenesParaFinalizar: [],
      esReposicionParaFinalizar: false,
      papelUtilizadoLote: 0,

      // Propiedades para la nueva funcionalidad de lotes
      ordenesSeleccionadas: [],
      lotesActivos: [],

      orden_proceso_departamento: null,
      disIniciar: false,
      filter: null,
      includedFields: ["orden"],
      promptHTML: "HTML PROMPT!!!",
      prompInputType: "text",
      value: 45,
      // Infinite scroll - carga 10 en 10
      itemsPerBatch: 10,
      visibleReposicionesPendientes: 10,
      visibleReposicionesEnCurso: 10,
      visibleEnCurso: 10,
      visiblePendientes: 10,
      loadingObservers: {},
      loadingReposicionesPendientes: false,
      loadingReposicionesEnCurso: false,
      loadingEnCurso: false,
      loadingPendientes: false,
      msg: "Estamos buscando sus tareas por favor espere...",
      enCurso: null,
      dataInsumos: [],
      fechas: [],
      fechasResult: [],
      departamento: "",
      dataOrdenEnCurso: [],
      showAlert: true,
      ordenes: [],
      reposiciones: [],
      vinculadas: [],
      productos: [],
      pausas: [],
      insumos: [],
      pagos: [],
      overlay: false,
      reload: false,
      filedsLista: [
        {
          key: "orden",
          label: "",
          variant: "",
        },
      ],
      impresoras: [],

      // New loading states and data for sectioned loading
      loadingEfficiency: false,
      loadingOrders: false,
      isFetchingOrders: false,
      isFetchingEfficiency: false,
      lastFetchOrdersAt: null,
      lastFetchEfficiencyAt: null,
      fetchEfficiencyPromise: null,
      reporteData: null,
      inputEfficiencyData: null,
      eficienciaOrdenCache: {},
      dataInsumosCacheOrderIdsKey: "",

      isReloading: false,
    };
  },

  mixins: [mixin, mixin2, procesamientoOrdenesMixin, mixintime],

  watch: {
    reload(val) {
      this.dataOrdenEnCurso = [{ data: "hola" }];
      return true;
    },
  },

  computed: {
    currentDepartamentName() {
      return this.$store.state.login.currentDepartament;
    },

    esDepartamentoDeMateriales() {
      const tipo = this.$store.getters['login/currentDepartamentTipo'];
      return ['estampado', 'corte', 'impresion'].includes(tipo);
    },

    ordenProceso() {
      if (this.$store.getters["login/getDepartamentosOrdenProceso"]) {
        return this.$store.getters["login/getDepartamentosOrdenProceso"][0];
      } else {
        return 0;
      }
    },

    insumosImpresion() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter((item) => item.departamento === "Impresión");
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosEstampado() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter((item) => item.departamento === "Telas" || item.departamento === "Estampado");
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosCostura() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter((item) => item.departamento === "Costura");
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosRevision() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter((item) => item.departamento === "Producción");
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosLimpieza() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter((item) => item.departamento === "Producción");
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    insumosCorte() {
      if (!Array.isArray(this.insumos)) return [];
      let options = this.insumos.filter((item) => item.departamento === "Telas");
      options = options.concat({ value: 0, text: "Seleccion insumo" });
      return options;
    },

    dataTableEnCurso() {
      const ordenesEnLotes = this.lotesActivos.flatMap((lote) => lote.ordenes.map((o) => o.id_orden));
      let enCurso = [];
      const tipo = this.$store.getters['login/currentDepartamentTipo'];
      
      if (tipo === 'impresion') {
        enCurso = this.ordenes.filter((el) => !ordenesEnLotes.includes(el.id_orden) && el.fecha_terminado == null && ((el.fecha_inicio != null && el.en_reposiciones === 0) || el.status === 'pausada'));
      } else if (tipo === 'estampado') {
        enCurso = this.ordenes.filter((el) => !ordenesEnLotes.includes(el.id_orden) && el.fecha_terminado == null && (el.progreso === 'en curso' || el.status === 'pausada'));
      } else if (tipo === 'corte') {
        enCurso = this.ordenes.filter((el) => !ordenesEnLotes.includes(el.id_orden) && el.fecha_terminado == null && (el.progreso === 'en curso' || el.status === 'pausada') && el.en_reposiciones === 0);
      } else {
        enCurso = this.ordenes.filter((el) => !ordenesEnLotes.includes(el.id_orden) && el.fecha_terminado == null && (el.progreso === 'en curso' || el.status === 'pausada') && el.en_reposiciones === 0 && el.fecha_inicio != null);
      }

      return enCurso.map((el) => ({
        ...el,
        esreposicion: false,
        en_reposiciones: el.en_reposiciones,
        id_orden: el.id_orden,
        fecha_hora: el.fecha_inicio || el.fecha_entrega || null,
        extra: el.extra,
        orden: el.id_orden,
        urgent: el.prioridad,
        entrega: el.fecha_entrega,
        id_lotes_detalles: el.id_lotes_detalles_empleados_asignados || el.id_lotes_detalles,
        lotes_detalles_empleados_asignados: el.lotes_detalles_empleados_asignados,
        unidades: el.unidades,
        id_woo: el.id_woo,
        en_inv_mov: el.en_inv_mov,
        en_tintas: el.en_tintas,
        valor_inicial: el.valor_inicial,
        valor_final: el.valor_final,
        observaciones: el.observaciones,
        detalle_empleado: el.detalle_empleado,
        orden_proceso_departamento: el.orden_proceso_departamento,
      })).reduce((acc, item) => {
        const existing = acc.find((row) => row.orden === item.orden);
        if (!existing) {
          acc.push({
            ...item,
            unidades: parseInt(item.unidades) || 0
          });
        } else {
          existing.unidades += parseInt(item.unidades) || 0;
        }
        return acc;
      }, []).sort((a, b) => {
        const prioA = parseInt(a.prioridad) || parseInt(a.urgent) || 0;
        const prioB = parseInt(b.prioridad) || parseInt(b.urgent) || 0;
        if (prioA !== prioB) {
          return prioB - prioA;
        }
        const dateA = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0;
        const dateB = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0;
        return dateA - dateB;
      });
    },

    dataTablePendiente() {
      const ordenesEnLotes = this.lotesActivos.flatMap(lote => lote.ordenes.map(o => o.id_orden));
      return this.ordenes.filter((el) => el.fecha_inicio === null && !ordenesEnLotes.includes(el.id_orden)).map((el) => ({
        ...el,
        fecha_hora: el.fecha_inicio || el.fecha_entrega || null,
        id_orden: el.id_orden,
        esreposicion: false,
        en_reposiciones: el.en_reposiciones,
        orden: el.id_orden,
        urgent: el.prioridad,
        entrega: el.fecha_entrega,
        id_lotes_detalles: el.id_lotes_detalles,
        unidades: el.unidades,
        orden_proceso: el.orden_proceso,
        orden_proceso_departamento: el.orden_proceso_departamento,
        orden_proceso_min: el.orden_proceso_min,
        observaciones: el.observaciones,
        detalle_empleado: el.detalle_empleado,
      })).reduce((acc, item) => {
        const existing = acc.find((row) => row.orden === item.orden);
        if (!existing) {
          acc.push({
            ...item,
            unidades: parseInt(item.unidades) || 0
          });
        } else {
          existing.unidades += parseInt(item.unidades) || 0;
        }
        return acc;
      }, []).sort((a, b) => {
        const dateA = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0;
        const dateB = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0;
        return dateA - dateB;
      });
    },

    dataTableReposiciones() {
      return this.reposiciones.map((el) => ({
        ...el,
        fecha_hora: el.fecha_inicio || el.fecha_entrega || null,
        esreposicion: true,
        en_reposiciones: 1,
        orden: el.id_orden,
        id_woo: el.id_producto,
        urgent: el.prioridad,
        entrega: el.fecha_entrega,
        unidades: el.unidades,
        detalle_empleado: el.detalle_empleado,
        detalle_reposicion: el.detalle_reposicion,
        id_ordenes_productos: el.id_ordenes_productos,
        fecha_inicio: el.fecha_inicio,
        fecha_terminado: el.fecha_terminado,
        id_reposicion: el.id_reposicion,
      })).sort((a, b) => {
        const prioA = parseInt(a.prioridad) || parseInt(a.urgent) || 0;
        const prioB = parseInt(b.prioridad) || parseInt(b.urgent) || 0;
        if (prioA !== prioB) {
          return prioB - prioA;
        }
        const dateA = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0;
        const dateB = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0;
        return dateA - dateB;
      });
    },

    reposicionesPendientes() {
      return this.dataTableReposiciones.filter(r => !r.fecha_inicio);
    },

    reposicionesEnCurso() {
      return this.dataTableReposiciones.filter(r => r.fecha_inicio && !r.fecha_terminado);
    },

    reposicionesPendientesFiltradas() {
      let data = this.reposicionesPendientes;
      if (this.filter && this.filter.trim()) {
        const st = this.filter.trim().toLowerCase();
        data = data.filter(item => {
          if (!item) return false;
          return (item.orden && String(item.orden).toLowerCase().includes(st));
        });
      }
      return data;
    },

    reposicionesEnCursoFiltradas() {
      let data = this.reposicionesEnCurso;
      if (this.filter && this.filter.trim()) {
        const st = this.filter.trim().toLowerCase();
        data = data.filter(item => {
          if (!item) return false;
          return (item.orden && String(item.orden).toLowerCase().includes(st));
        });
      }
      return data;
    },

    dataTableEnCursoFiltradas() {
      let data = this.dataTableEnCurso;
      if (this.filter && this.filter.trim()) {
        const st = this.filter.trim().toLowerCase();
        data = data.filter(item => {
          if (!item) return false;
          return (item.orden && String(item.orden).toLowerCase().includes(st));
        });
      }
      return data;
    },

    dataTablePendienteFiltradas() {
      let data = this.dataTablePendiente;
      if (this.filter && this.filter.trim()) {
        const st = this.filter.trim().toLowerCase();
        data = data.filter(item => {
          if (!item) return false;
          return (item.orden && String(item.orden).toLowerCase().includes(st));
        });
      }
      return data;
    },

    ordenesSize() {
      if (this.loadingOrders) {
        this.msg = 'Cargando órdenes asignadas...';
        return 0;
      }
      const size = parseInt((this.ordenes.length || 0) + (this.reposiciones.length || 0));
      this.msg = size < 1 ? 'No tienes tareas asignadas' : '';
      return size;
    },

    // COMPUTED PROP: Nuevos Contadores y Métricas
    totalOrdersCount() {
      return this.dataTableEnCursoFiltradas.length + this.dataTablePendienteFiltradas.length;
    },

    totalRevisionCount() {
      return this.reposicionesEnCursoFiltradas.length + this.reposicionesPendientesFiltradas.length;
    },

    tiempoEfficiencyPercentage() {
      if (!this.reporteData) return 0;
      const projected = this.reporteData.totalProjectedTerminadas || 0;
      const real = this.reporteData.totalRealTerminadas || 0;
      if (projected === 0 || real === 0) return 0;
      return Math.round((projected / real) * 100);
    },

    tiempoEfficiencyVariant() {
      const p = this.tiempoEfficiencyPercentage;
      if (p >= 100) return "success";
      if (p >= 80) return "warning";
      return "danger";
    },

    materialEfficiencyPercentage() {
      if (!this.inputEfficiencyData) return 0;
      const estimado = this.inputEfficiencyData.totalEstimado || 0;
      const real = this.inputEfficiencyData.totalReal || 0;
      if (estimado === 0 || real === 0) return 0;
      return Math.round((estimado / real) * 100);
    },

    materialEfficiencyVariant() {
      const p = this.materialEfficiencyPercentage;
      if (p >= 100) return "success";
      if (p >= 80) return "warning";
      return "danger";
    },

    summaryStats() {
      const totalAsignadas = this.totalOrdersCount + this.totalRevisionCount;
      const enProceso = this.dataTableEnCurso.length + this.reposicionesEnCurso.length;
      const pendientes = this.dataTablePendiente.length + this.reposicionesPendientes.length;
      const urgentes = this.urgentItems.length;
      return {
        completadas: `${this.completedTodayCount} de ${totalAsignadas}`,
        enProceso,
        pendientes,
        urgentes
      };
    },

    urgentItems() {
      // Solo urgentes que AÚN NO han sido iniciadas (estado pendiente)
      // Una vez iniciadas, aparecen en EN PROCESO marcadas visualmente como urgentes
      const uOrders = this.dataTablePendiente.filter(o => parseInt(o.prioridad) > 0 && !this.isTaskInProcess(o));
      const uRepos = this.reposicionesPendientes.filter(r => parseInt(r.prioridad) > 0 && !this.isTaskInProcess(r));
      const combined = [...uOrders, ...uRepos];

      // Deduplicar
      return combined.reduce((acc, item) => {
        const key = item.esreposicion ? `rep-${item.id_reposicion}` : `ord-${item.id_orden}`;
        if (!acc.some(x => (x.esreposicion ? `rep-${x.id_reposicion}` : `ord-${x.id_orden}`) === key)) {
          acc.push(item);
        }
        return acc;
      }, []);
    },

    // Listas filtradas: EN PROCESO incluye TODAS las órdenes en curso (urgentes o no)
    // Las urgentes en curso se muestran visualmente marcadas dentro de EN PROCESO
    ordersInProcess() {
      return this.dataTableEnCursoFiltradas;
    },

    ordersPending() {
      return this.dataTablePendienteFiltradas.filter(item => !parseInt(item.prioridad));
    },

    revisionsInProcess() {
      return this.reposicionesEnCursoFiltradas;
    },

    revisionsPending() {
      return this.reposicionesPendientesFiltradas.filter(item => !parseInt(item.prioridad));
    }
  },

  methods: {
    abrirDetalleMaterial(idorden) {
      const refName = `insumos-${idorden}`;
      const targets = this.$refs[refName];
      if (targets) {
        if (Array.isArray(targets)) {
          if (targets[0] && typeof targets[0].openModal === 'function') {
            targets[0].openModal();
          }
        } else if (typeof targets.openModal === 'function') {
          targets.openModal();
        }
      }
    },

    isTaskInProcess(item) {
      if (item.esreposicion) {
        return !!item.fecha_inicio && !item.fecha_terminado;
      }
      return item.fecha_inicio !== null && item.fecha_terminado === null;
    },

    filterTiempoEstimado(idOrden) {
      if (!Array.isArray(this.fechasResult)) return '';
      const filtrado = this.fechasResult.find((el) => el.id_orden == idOrden);
      if (filtrado && filtrado.tareas) {
        const deptoId = this.$store.state.login.currentDepartamentId;
        const tarea = filtrado.tareas.find((el) => el.id_departamento === deptoId);
        if (tarea) {
          const segundos = parseFloat(tarea.tiempo_total_orden_depto) || 0;
          const hrs = Math.floor(segundos / 3600);
          const mins = Math.floor((segundos % 3600) / 60);
          const secs = Math.floor(segundos % 60);
          const hrsStr = hrs > 0 ? String(hrs).padStart(2, '0') + ':' : '';
          return `${hrsStr}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} min`;
        }
      }
      return '';
    },

    getTaskTimeDuration(item) {
      return this.filterTiempoEstimado(item.orden || item.id_orden) || '--';
    },

    getTaskStatusPillLabel(item) {
      if (parseInt(item.prioridad) > 0) return 'Urgente';
      return this.isTaskInProcess(item) ? 'En proceso' : 'Pendiente';
    },

    getTaskStatusPillClass(item) {
      if (parseInt(item.prioridad) > 0) return 'status-urgent';
      return this.isTaskInProcess(item) ? 'status-process' : 'status-pending';
    },

    getRightPanelClass(item) {
      const isUrgent = parseInt(item.prioridad) > 0;
      if (this.isTaskInProcess(item)) {
        return isUrgent ? 'right-urgent-process' : 'right-normal-process';
      }
      // Pendiente: Si está bloqueada por el departamento previo
      if (!item.esreposicion && this.verificarOrdenProceso(item.orden_proceso, item.orden_proceso_min)) {
        return 'disabled-action';
      }
      return isUrgent ? 'right-urgent-pending' : 'right-normal-pending';
    },

    handleRightPanelClick(item) {
      if (this.isTaskInProcess(item)) {
        // En proceso: Hacer click programático en el botón Terminar
        const cardKey = item.esreposicion ? `rep-${item.id_reposicion}` : `ord-${item.id_orden}`;
        const cardEl = document.getElementById(`task-card-${cardKey}`);
        if (cardEl) {
          const btn = cardEl.querySelector('[data-testid="btn-terminar-todo"]');
          if (btn) {
            btn.click();
          } else {
            console.warn("No se encontró el botón de terminar en la tarjeta");
          }
        }
      } else {
        // Pendiente: Iniciar tarea (Validar que no esté bloqueada por departamento anterior)
        if (!item.esreposicion && this.verificarOrdenProceso(item.orden_proceso, item.orden_proceso_min)) {
          return; // Salir silenciosamente sin iniciar ni alertar confirmación
        }
        if (item.esreposicion) {
          this.iniciarReposicion(item);
        } else {
          this.iniciarTodo(item.orden || item.id_orden, item.unidades);
        }
      }
    },


    // Metodos originales de scroll e interacción
    loadMoreReposicionesPendientes() {
      if (this.visibleReposicionesPendientes < this.reposicionesPendientes.length) {
        this.visibleReposicionesPendientes += this.itemsPerBatch;
      }
    },
    loadMoreReposicionesEnCurso() {
      if (this.visibleReposicionesEnCurso < this.reposicionesEnCurso.length) {
        this.visibleReposicionesEnCurso += this.itemsPerBatch;
      }
    },
    loadMoreEnCurso() {
      if (this.visibleEnCurso < this.dataTableEnCurso.length) {
        this.visibleEnCurso += this.itemsPerBatch;
      }
    },
    loadMorePendientes() {
      if (this.visiblePendientes < this.dataTablePendiente.length) {
        this.visiblePendientes += this.itemsPerBatch;
      }
    },

    setupInfiniteScroll() {
      const sections = [
        { name: 'ReposicionesPendientes', loadMore: this.loadMoreReposicionesPendientes, id: 'sentinel-reposiciones-pendientes' },
        { name: 'ReposicionesEnCurso', loadMore: this.loadMoreReposicionesEnCurso, id: 'sentinel-reposiciones-en-curso' },
        { name: 'EnCurso', loadMore: this.loadMoreEnCurso, id: 'sentinel-en-curso' },
        { name: 'Pendientes', loadMore: this.loadMorePendientes, id: 'sentinel-pendientes' }
      ];

      if (this.loadingObservers && Object.keys(this.loadingObservers).length > 0) {
        Object.values(this.loadingObservers).forEach(observer => {
          if (observer && typeof observer.disconnect === 'function') observer.disconnect();
        });
        this.loadingObservers = {};
      }

      sections.forEach(section => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this[`loading${section.name}`]) {
              this[`loading${section.name}`] = true;
              section.loadMore();
              this.$nextTick(() => {
                this[`loading${section.name}`] = false;
              });
            }
          });
        }, { threshold: 0.1 });

        this.loadingObservers[section.name] = observer;
        const el = document.getElementById(section.id);
        if (el) observer.observe(el);
      });
    },

    async getLotesActivos() {
      const payload = new URLSearchParams();
      payload.append('id_empleado', this.$store.state.login.dataUser.id_empleado);
      payload.append('id_departamento', this.$store.state.login.currentDepartamentId);

      await this.$axios.post(`${this.$config.API}/lotes/activos`, payload)
        .then(res => {
          this.lotesActivos = res.data;
        })
        .catch(err => {
          console.error('Error al cargar los lotes activos:', err);
          this.lotesActivos = [];
        });
    },

    async _ejecutarInicioDeLote(loteId, ordenesDelLote) {
      this.overlay = true;
      try {
        await this.$axios.post(`${this.$config.API}/lotes/${loteId}/iniciar`);
        const promesas = ordenesDelLote.map(idOrden => {
          const ordenCompleta = this.ordenes.find(o => o.id_orden === idOrden);
          if (ordenCompleta) {
            return this.registrarEstado(
              "inicio",
              ordenCompleta.id_orden,
              ordenCompleta.unidades,
              false,
              ordenCompleta.lotes_detalles_empleados_asignados
            );
          }
          return Promise.resolve();
        });

        await Promise.all(promesas);
        this.$fire({
          title: 'Éxito',
          html: `<p>El lote #${loteId} y sus ${ordenesDelLote.length} órdenes han sido iniciados.</p>`,
          type: 'success',
        });
      } catch (err) {
        this.$fire({
          title: 'Error',
          html: `<p>Ocurrió un error al iniciar el lote.</p><p>${err}</p>`,
          type: 'warning',
        });
      } finally {
        this.ordenesSeleccionadas = [];
        setTimeout(() => {
          this.reloadMe();
          this.overlay = false;
        }, 1000);
      }
    },

    crearLote() {
      if (this.ordenesSeleccionadas.length < 2) {
        this.$fire({
          title: 'Información',
          html: '<p>Debe seleccionar más de una orden para crear un lote.</p>',
          type: 'info',
        });
        return;
      }

      const ordenesParaLote = [...this.ordenesSeleccionadas];
      this.$confirm(
        `¿Desea crear un nuevo lote con ${ordenesParaLote.length} órdenes? Se iniciará automáticamente.`,
        'Confirmar Creación e Inicio',
        'question'
      ).then(() => {
        this.overlay = true;
        const payload = new URLSearchParams();
        payload.append('id_empleado', this.$store.state.login.dataUser.id_empleado);
        payload.append('id_departamento', this.$store.state.login.currentDepartamentId);
        payload.append('ordenes', ordenesParaLote.join(','));

        this.$axios.post(`${this.$config.API}/lotes`, payload)
          .then(res => {
            const newLoteId = res.data.id_lote;
            this.$nextTick(() => {
              this._ejecutarInicioDeLote(newLoteId, ordenesParaLote);
            });
          })
          .catch(err => {
            this.$fire({
              title: 'Error',
              html: `<p>No se pudo crear el lote.</p><p>${err}</p>`,
              type: 'warning',
            });
            this.overlay = false;
          });
      }).catch(() => {});
    },

    iniciarLote(loteId) {
      const lote = this.lotesActivos.find(l => l.id === loteId);
      if (!lote) return;
      const ordenesDelLote = lote.ordenes.map(o => o.id_orden);
      this.$confirm(`¿Desea iniciar el Lote #${loteId}?`, 'Confirmar Inicio', 'question')
        .then(() => {
          this._ejecutarInicioDeLote(loteId, ordenesDelLote);
        }).catch(() => {});
    },

    finalizarLotePorDepartamento(loteId) {
      const lote = this.lotesActivos.find((l) => l.id === loteId);
      if (!lote || !lote.ordenes || lote.ordenes.length === 0) {
        this.$fire({
          title: 'Error',
          html: '<p>Lote no encontrado o vacío.</p>',
          type: 'error',
        });
        return;
      }

      this.loteParaFinalizar = lote;
      this.ordenesParaFinalizar = lote.ordenes.map(lo => {
        const fullOrders = this.ordenes.filter(o => o.id_orden === lo.id_orden);
        const telas = [...new Set(fullOrders.filter(o => o.tela_vendedor).map(o => o.tela_vendedor))];
        return { ...lo, tela_vendedor: telas.join(', ') };
      });
      
      this.esReposicionParaFinalizar = lote.ordenes.some(o => o.en_reposiciones === 1 || o.esreposicion === true);
      let papelConsumido = 0;
      const ordenesIdsDelLote = lote.ordenes.map((o) => o.id_orden);
      const ordenesCompletasDelLote = this.ordenes.filter((o) => ordenesIdsDelLote.includes(o.id_orden));

      ordenesCompletasDelLote.forEach((orden) => {
        if (orden.valor_inicial && orden.valor_final) {
          papelConsumido += parseFloat(orden.valor_inicial) - parseFloat(orden.valor_final);
        }
      });

      this.papelUtilizadoLote = papelConsumido;
      this.showFinalizarLoteModal = true;
    },

    handleLoteFinalizado() {
      this.showFinalizarLoteModal = false;
      this.showFinalizarImpresionModal = false;
      this.showFinalizarCorteModal = false;
      this.loteParaFinalizar = null;
      this.reloadMe();
    },

    verificarOrdenProceso(idOrdenProceso, min) {
      let IdVerificado = idOrdenProceso === null ? min : idOrdenProceso;
      return IdVerificado != this.$store.state.login.currentOrdenProceso;
    },

    filterFechaEstimada(idOrden) {
      if (!Array.isArray(this.fechasResult)) return { variant: '' };
      const filtrado = this.fechasResult.filter((el) => el.id_orden == idOrden);
      if (filtrado.length) {
        const deptoId = this.$store.state.login.currentDepartamentId;
        const fechaEstimada = filtrado[0].tareas.filter((el) => el.id_departamento === deptoId).map((el) => ({
          fecha_estimada_fin_formateada: el.fecha_estimada_fin_formateada,
          variant: el.variant,
          variant_text: el.variant_text,
        }));
        return fechaEstimada[0] || { variant: '', variant_text: 'No est.', fecha_estimada_fin_formateada: '' };
      }
      return { variant: '', variant_text: 'No reg.', fecha_estimada_fin_formateada: '' };
    },

    contarItems(cantidad) {
      return `Total ${cantidad}`;
    },

    filterVinculdas(id_orden) {
      return this.vinculadas.filter((el) => el.id_father === id_orden);
    },

    productsFilter(id) {
      return this.productos.filter((el) => el.id_orden == id).map((prod) => {
        const repo = this.reposiciones.find((r) => r.id_ordenes_productos == prod.id_ordenes_productos);
        if (repo) {
          return {
            ...prod,
            detalle_reposicion: repo.detalle_emisor || repo.detalle_reposicion || repo.detalle || prod.detalle_reposicion,
          };
        }
        return prod;
      });
    },

    filterOrder(id_orden, tipo) {
      let products;
      if (tipo === "en curso") {
        if (this.departamento === "Impresión") {
          products = this.ordenes.filter(
            (item) =>
              item.id_orden === id_orden &&
              item.progreso === tipo
          );
        } else {
          products = this.ordenes.filter(
            (item) => item.id_orden === id_orden && (item.progreso === tipo || item.status === "pausada")
          );
        }
      } else if (tipo === "todo") {
        products = this.ordenes.filter(
          (item) => item.id_orden === id_orden && !item.fecha_inicio != null
        );
      } else {
        products = this.ordenes.filter(
          (item) => item.id_orden === id_orden && item.progreso === tipo
        );
      }
      return products;
    },

    async registrarEstado(tipo, id_orden, unidades, es_reposicion = false, id_lotes_detalles_param = null, id_reposicion = null) {
      const data = new URLSearchParams();
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("id_departamento", this.$store.state.login.currentDepartamentId);
      data.set("id_orden", id_orden);
      data.set("id_lotes_detalles", id_lotes_detalles_param);
      data.set("tipo", tipo);
      data.set("es_reposicion", es_reposicion);
      data.set("id_reposicion", id_reposicion);
      data.set("unidades", unidades);
      data.set("departamento", this.$store.state.login.currentDepartament);
      data.set("orden_proceso", this.$store.state.login.currentOrdenProceso);
      return this.$axios.post(`${this.$config.API}/registrar-paso-empleado`, data);
    },

    iniciarTodo(idOrden, unidades) {
      this.$confirm(``, `¿Desea iniciar todas las tareas de la Orden ${idOrden}?`, "question")
        .then(() => {
          this.overlay = true;
          const matchingOrder = this.ordenes.find(o => o.id_orden === idOrden);
          const loteDetalles = matchingOrder ? matchingOrder.lotes_detalles_empleados_asignados : null;
          this.registrarEstado("inicio", idOrden, unidades, false, loteDetalles)
            .then(() => {
              if (!this.isLastDepartment()) {
                this.sendMsgCustom(idOrden, 'paso', this.$store.state.login.currentDepartamentId);
              }
              this.reloadMe();
            })
            .catch((err) => {
              this.$fire({
                title: "Error",
                html: `<p>No se pudo registrar la acción.</p><p>${err}</p>`,
                type: "warning",
              });
            })
            .finally(() => {
              this.overlay = false;
            });
        });
    },

    iniciarReposicion(item) {
      this.$confirm(``, `¿Desea iniciar la reposición de la Orden ${item.orden}?`, "question")
        .then(() => {
          this.overlay = true;
          this.registrarEstado("inicio", item.orden, item.unidades, true, null, item.id_reposicion)
            .then(() => {
              this.reloadMe();
            })
            .catch((err) => {
              this.$fire({
                title: "Error",
                html: `<p>No se pudo registrar la acción.</p><p>${err}</p>`,
                type: "warning",
              });
            })
            .finally(() => {
              this.overlay = false;
            });
        });
    },

    isLastDepartment() {
      const departamentos = this.$store.state.login.departamentos;
      if (!departamentos || departamentos.length === 0) return false;
      const departamentosConPaso = departamentos.filter((dep) => dep.asignar_numero_de_paso);
      if (departamentosConPaso.length === 0) return false;
      const maxOrdenProceso = Math.max(...departamentosConPaso.map((dep) => dep.orden_proceso));
      return this.$store.state.login.currentOrdenProceso === maxOrdenProceso;
    },

    async getOrdenesAsignadas() {
      if (this.isFetchingOrders) return;
      const now = Date.now();
      if (this.lastFetchOrdersAt && now - this.lastFetchOrdersAt < 5000) return;
      this.lastFetchOrdersAt = now;

      this.isFetchingOrders = true;
      this.loadingOrders = true;
      
      const deptoId = this.$store.state.login.currentDepartamentId;
      const ordProc = this.$store.state.login.currentOrdenProceso;

      await this.$axios.get(`${this.$config.API}/empleados/ordenes-asignadas/v2/${this.emp}/${deptoId}/${ordProc}`)
        .then(async (resp) => {
          if (resp.data.ordenes.length === 0 && resp.data.reposiciones.length === 0) {
            this.msg = "Usted no tiene ordenes asignadas";
          }
          this.ordenes = resp.data.ordenes;
          this.reposiciones = resp.data.reposiciones;
          this.vinculadas = resp.data.vinculadas;
          this.productos = resp.data.productos;
          this.pausas = resp.data.pausas;

          await this.loadDataInsumos();
          this.fetchEfficiency();
        })
        .finally(() => {
          this.loadingOrders = false;
          this.isFetchingOrders = false;
        });
    },

    async loadDataInsumos() {
      try {
        const allOrdenes = [...(this.ordenes || []), ...(this.reposiciones || []), ...(this.vinculadas || [])];
        const ordenesIds = [...new Set(allOrdenes.map(o => o.id_orden || o.orden).filter(Boolean))];

        if (ordenesIds.length === 0) {
          this.dataInsumos = [];
          return;
        }

        const sortedKey = ordenesIds.slice().sort((a, b) => a - b).join(',');
        if (sortedKey === this.dataInsumosCacheOrderIdsKey) {
          this.dataInsumos = ordenesIds.reduce((acc, idOrden) => acc.concat(this.eficienciaOrdenCache[idOrden] || []), []);
          return;
        }
        this.dataInsumosCacheOrderIdsKey = sortedKey;
        const idsToFetch = ordenesIds.filter(id => !this.eficienciaOrdenCache[id]);

        if (idsToFetch.length > 0) {
          const insumosPromises = idsToFetch.map((idOrden) =>
            this.$axios.get(`${this.$config.API}/eficiencia-orden/${idOrden}`)
              .then((resp) => {
                const insumos = resp.data.insumos_asignados || [];
                const datos = insumos.map((ins) => ({ ...ins, id_orden: idOrden }));
                this.eficienciaOrdenCache[idOrden] = datos;
                return datos;
              })
              .catch((err) => {
                console.error(`Error loading insumos for order ${idOrden}:`, err);
                this.eficienciaOrdenCache[idOrden] = [];
                return [];
              })
          );
          await Promise.all(insumosPromises);
        }

        this.dataInsumos = ordenesIds.reduce((acc, idOrden) => acc.concat(this.eficienciaOrdenCache[idOrden] || []), []);
      } catch (error) {
        console.error('Error in loadDataInsumos:', error);
        this.dataInsumos = [];
      }
    },

    async fetchEfficiency() {
      const now = Date.now();
      if (this.isFetchingEfficiency) return;
      if (this.lastFetchEfficiencyAt && now - this.lastFetchEfficiencyAt < 5000) return;
      this.lastFetchEfficiencyAt = now;
      
      this.isFetchingEfficiency = true;
      this.loadingEfficiency = true;
      
      try {
        const empId = this.$store.state.login?.dataUser?.id_empleado;
        const deptoId = this.$store.state.login.currentDepartamentId;

        let finishedToday = [];
        let unpaidIds = [];
        if (empId && deptoId) {
          const [respTerminadas, respUnpaid] = await Promise.allSettled([
            this.$axios.get(`${this.$config.API}/empleados/terminadas-hoy/${empId}/${deptoId}`),
            this.$axios.get(`${this.$config.API}/empleados/unpaid-orders/${empId}/${deptoId}`),
          ]);
          if (respTerminadas.status === 'fulfilled') {
            finishedToday = Array.isArray(respTerminadas.value.data) ? respTerminadas.value.data : [];
            // Guardar total completadas hoy para estadísticas de resumen
            this.completedTodayCount = finishedToday.length;
          }
          if (respUnpaid.status === 'fulfilled' && Array.isArray(respUnpaid.value.data)) {
            unpaidIds = respUnpaid.value.data.map(o => o.id_orden).filter(Boolean);
          }
        }

        const activePool = [...this.ordenes, ...this.reposiciones, ...this.vinculadas];
        const activeIds = activePool.map(o => o.orden || o.id_orden).filter(id => id);
        let uniqueIds = [...new Set([...activeIds, ...unpaidIds, ...finishedToday])];

        if (uniqueIds.length === 0) {
          this.reporteData = null;
          this.inputEfficiencyData = null;
          this.loadingEfficiency = false;
          this.isFetchingEfficiency = false;
          return;
        }

        const startedPool = [...this.ordenes, ...this.reposiciones].filter(o => o.fecha_inicio != null);
        const startedIds = startedPool.map(o => o.orden || o.id_orden).filter(id => id);
        const inputEffIds = [...new Set([...startedIds, ...finishedToday])];
        const idsForInputEff = inputEffIds.length > 0 ? inputEffIds.join(',') : uniqueIds.join(',');

        const postData = {
          id_ordenes: uniqueIds,
          id_empleado: empId || null,
          id_departamento: deptoId || null,
        };

        const [timeResponse, inputResponse] = await Promise.all([
          this.$axios.post(`${this.$config.API}/reports/manufacturing-time`, postData),
          this.$axios.get(`${this.$config.API}/reports/input-efficiency/${idsForInputEff}`)
        ]);

        if (timeResponse.data && timeResponse.data.resumen) {
          const resumen = timeResponse.data.resumen;
          const detalles = timeResponse.data.tareas_detalles || [];
          
          let horarioLaboral = this.$store.state.login.dataEmpresa.horario_laboral;
          if (typeof horarioLaboral === 'string') {
            try { horarioLaboral = JSON.parse(horarioLaboral); } catch(e) { horarioLaboral = null; }
          }

          let totalRealTerminadas = 0;
          let totalRealEnCurso = 0;
          const timezone = this.$store.state.login.dataEmpresa?.timezone || 'America/Caracas';
          const ahoraEmpresa = this.obtenerAhoraEnTimezone(timezone);
          const pausasProcesadas = (this.pausas || []).map(p => ({
            fecha_inicio: new Date(p.pausa_inicio.replace(' ', 'T')),
            fecha_fin: p.pausa_fin ? new Date(p.pausa_fin.replace(' ', 'T')) : ahoraEmpresa
          }));

          if (horarioLaboral && detalles.length > 0) {
            detalles.forEach(task => {
              const fStartStr = task.fecha_inicio ? task.fecha_inicio.replace(' ', 'T') : null;
              const fEndStr = task.fecha_terminado ? task.fecha_terminado.replace(' ', 'T') : null;
              if (!task.fecha_inicio) return;
              const tareaObj = {
                fecha_inicio: new Date(fStartStr),
                fecha_fin: fEndStr ? new Date(fEndStr) : ahoraEmpresa
              };
              const tiempoEfectivoSegundos = this.calcularTiempoTrabajoIndividual(tareaObj, pausasProcesadas, horarioLaboral) / 1000;
              if (task.fecha_terminado) {
                totalRealTerminadas += tiempoEfectivoSegundos;
              } else {
                totalRealEnCurso += tiempoEfectivoSegundos;
              }
            });
          } else {
            totalRealTerminadas = resumen.filter(item => item.tarea_terminada == 1).reduce((acc, item) => acc + (parseFloat(item.totalRealTerminadas) || 0), 0);
            totalRealEnCurso = resumen.filter(item => item.tarea_terminada != 1).reduce((acc, item) => acc + (parseFloat(item.totalRealEnCurso) || 0), 0);
          }

          if (totalRealTerminadas === 0) {
            totalRealTerminadas = resumen.filter(item => item.tarea_terminada == 1).reduce((acc, item) => acc + (parseFloat(item.totalRealTerminadas) || 0), 0);
          }
          if (totalRealEnCurso === 0) {
            totalRealEnCurso = resumen.filter(item => item.tarea_terminada != 1).reduce((acc, item) => acc + (parseFloat(item.totalRealEnCurso) || 0), 0);
          }

          const totalProjectedTerminadas = resumen.filter(item => item.tarea_terminada == 1).reduce((acc, item) => acc + (item.totalProjectedTerminadas || 0), 0);
          const totalProjectedEnCurso = resumen.filter(item => item.tarea_terminada != 1).reduce((acc, item) => acc + (item.totalProjectedEnCurso || item.tiempo_proyectado_segundos || 0), 0);

          this.reporteData = {
            totalRealTerminadas,
            totalProjectedTerminadas,
            totalRealEnCurso,
            totalProjectedEnCurso,
            totalReal: totalRealTerminadas + totalRealEnCurso,
            totalProjected: totalProjectedTerminadas + totalProjectedEnCurso,
            totalElapsed: 0
          };
        }

        if (inputResponse.data && inputResponse.data.length > 0) {
          let totalEstimado = 0;
          let totalReal = 0;
          let unidad = 'Mt';

          inputResponse.data.forEach(item => {
            if (this.$store.state.login.currentDepartamentId && parseInt(item.id_departamento) !== parseInt(this.$store.state.login.currentDepartamentId)) {
              return;
            }
            totalEstimado += parseFloat(item.cantidad_estandar) || 0;
            totalReal += parseFloat(item.cantidad_real) || 0;
            unidad = item.unidad || 'Mt';
          });

          this.inputEfficiencyData = (totalEstimado > 0 || totalReal > 0) ? { totalEstimado, totalReal, unidad } : null;
        } else {
          this.inputEfficiencyData = null;
        }
      } catch (error) {
        console.error("Error fetching efficiency data:", error);
        this.reporteData = null;
      } finally {
        this.loadingEfficiency = false;
        this.isFetchingEfficiency = false;
      }
    },

    async getOrdenesFechas() {
      this.overlay = true;
      await this.$axios.get(`${this.$config.API}/ordenes/proyeccion-entrega`)
        .then((res) => {
          this.fechas = res.data;
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se recibieron las fechas</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    async getInsumos() {
      await this.$axios.get(`${this.$config.API}/insumos`).then((resp) => {
        this.insumos = resp.data;
      });
    },

    async getImpresoras() {
      await this.$axios.get(`${this.$config.API}/impresoras`).then((resp) => {
        this.impresoras = resp.data;
      });
    },

    async reloadMe() {
      if (this.isReloading) return;
      this.isReloading = true;

      try {
        const isImpresion = this.$store.getters['login/currentDepartamentTipo'] === "impresion";
        await Promise.all([
          this.getLotesActivos(),
          this.getInsumos(),
          this.getOrdenesAsignadas().then(() => {
            this.$nextTick(() => { this.setupInfiniteScroll(); });
          }),
          this.getOrdenesFechas().then(() => {
            this.fechasResult = this.generarPlanProduccionCompleto(
              this.fechas,
              this.$store.state.login.dataEmpresa.horario_laboral
            );
          }),
          isImpresion ? this.getImpresoras() : Promise.resolve()
        ]);
      } catch (error) {
        console.error('[SseOrdenesAsignadasV5] Error during reload:', error);
      } finally {
        this.isReloading = false;
      }
    },
  },

  mounted() {
    // Si estamos en resolución móvil, habilitar el scroll interno controlado en el body
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      document.body.classList.add('mobile-internal-scroll');
      document.documentElement.classList.add('mobile-internal-scroll');
    }

    const tipo = this.$store.getters['login/currentDepartamentTipo'];
    if (tipo === "impresion") {
      this.promptHTML = "<h2>Ingrese la cantidad en metros</h2>";
      this.prompInputType = "number";
    } else if (tipo === "estampado") {
      this.promptHTML = "<h2>Ingrese el número de rollo</h2>";
      this.prompInputType = "number";
    } else if (tipo === "corte") {
      this.promptHTML = "<h2>Ingrese el peso del desperdicio en Gramos</h2>";
      this.prompInputType = "number";
    }
    this.reloadMe();
  },

  beforeDestroy() {
    if (typeof window !== 'undefined') {
      document.body.classList.remove('mobile-internal-scroll');
      document.documentElement.classList.remove('mobile-internal-scroll');
    }
    Object.values(this.loadingObservers).forEach(observer => observer.disconnect());
  },

  props: ["emp", "updatedata"],
};
</script>

<style>
/* ================================================================= */
/* CONFIGURACIÓN Y ESTILOS DE INTERFAZ DEL PANEL DE EMPLEADOS V2    */
/* ================================================================= */

.dashboard-v2-container {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #2b303a;
  background-color: #f7f9fc;
  min-height: 100vh;
  padding: 15px;
  padding-top: 90px; /* Espacio para compensar el buscador fijo en escritorio */
  padding-bottom: 90px; /* Espacio para barra inferior flotante */
  position: relative;
}

/* Cabecera Fija en la parte superior */
.fixed-top-header {
  position: fixed;
  top: 0;
  left: 260px; /* Ancho del sidebar por defecto */
  right: 0;
  z-index: 1020;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  border-bottom: 1px solid #eef2f6;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: left 0.3s ease;
}

/* Si el sidebar está colapsado */
.sidebar-collapsed .fixed-top-header {
  left: 70px;
}

.dept-title {
  display: flex;
  flex-direction: column;
}

.dept-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #8a9099;
  letter-spacing: 1px;
  font-weight: 700;
}

.dept-name {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1a202c;
  background: linear-gradient(135deg, #0b7285, #008b8b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.whatsapp-btn {
  background-color: #25d366 !important;
  border: none !important;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3) !important;
  transition: transform 0.2s ease;
}

.whatsapp-btn:hover {
  transform: scale(1.08);
}

/* Buscador */
.search-input-group {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
}

.search-icon-prepend {
  background-color: #fff !important;
  border: none !important;
  color: #a0aec0;
}

.search-input {
  border: none !important;
  padding: 12px 10px !important;
  font-size: 0.95rem;
  font-weight: 500;
}

.search-input:focus {
  box-shadow: none !important;
}

.search-clear-btn {
  border: none !important;
  background-color: #f7fafc !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  color: #718096 !important;
}

/* Contenedores de eficiencia */
.efficiency-container {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #edf2f7;
}

.eff-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4a5568;
}

.eff-value {
  font-size: 0.85rem;
  font-weight: 800;
}

.custom-progress-bar {
  height: 6px !important;
  border-radius: 3px !important;
  background-color: #e2e8f0 !important;
}

/* Pestañas de Navegación */
.nav-tabs-container {
  display: flex;
  background-color: #edf2f7;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
}

.nav-tab-item {
  flex: 1;
  border: none;
  background: none;
  padding: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #4a5568;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-tab-item.active {
  background-color: #fff;
  color: #1a202c;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Panel de Resumen */
.summary-panel {
  background-color: #fff;
  border-radius: 16px;
  padding: 15px 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid #edf2f7;
}

.summary-box {
  border-right: 1px solid #f0f4f8;
}

.summary-box:last-child {
  border-right: none;
}

.summary-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2d3748;
}

.summary-num.color-process { color: #1c7ed6; }
.summary-num.color-pending { color: #2b8a3e; }
.summary-num.color-urgent { color: #c92a2a; }

.summary-label {
  font-size: 0.65rem;
  color: #718096;
  text-transform: uppercase;
  font-weight: 700;
  margin-top: 3px;
  letter-spacing: 0.5px;
}

/* Cabecera de Secciones Colapsables */
.section-container {
  background-color: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.015);
  border: 1px solid #edf2f7;
}

.section-header {
  padding: 12px 15px;
  background-color: #fff;
  border-bottom: 1px solid #f7fafc;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.section-header:hover {
  background-color: #fcfdfe;
}

.section-header h5 {
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.bg-urgent-header {
  background-color: #fff5f5;
  border-bottom: 1px solid #ffe3e3;
}

.active-lotes-header {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
}

.section-content {
  padding: 0 10px 10px 10px;
}

/* Lote Card (Tradicional Adaptado) */
.lote-card {
  background-color: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.lote-title {
  font-weight: 800;
  color: #1a202c;
  font-size: 1rem;
}
.lote-order-item {
  padding: 8px 0;
  border-bottom: 1px dashed #edf2f7;
}
.lote-order-item:last-child {
  border-bottom: none;
}
.lote-cliente-nombre {
  font-size: 0.85rem;
  color: #4a5568;
  font-weight: 500;
}

/* Tarjetas de Tareas Modernas */
.modern-task-card {
  background-color: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 12px;
  margin-bottom: 10px;
  transition: all 0.25s ease;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.01);
}

.modern-task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border-color: #cbd5e0;
}

.urgent-card {
  border-left: 5px solid #e53e3e !important;
  background-color: #fffdfd;
}

.card-main-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.card-left-select {
  margin-right: 12px;
  display: flex;
  align-items: center;
}

/* Badge de Tipo de Tarea (REV / ORD) */
.badge-type-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 6px 12px;
  text-align: center;
  min-width: 65px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.type-ord {
  background-color: #e6f7ff;
  border: 1px solid #bae7ff;
}

.type-ord .type-text {
  color: #0050b3;
  font-size: 0.65rem;
  font-weight: 800;
}

.type-rev {
  background-color: #fff7e6;
  border: 1px solid #ffd591;
}

.type-rev .type-text {
  color: #d46b08;
  font-size: 0.65rem;
  font-weight: 800;
}

/* Sobreescribir linkSearch */
.type-id-link button, 
.type-id-link .btn {
  background: none !important;
  border: none !important;
  padding: 0 !important;
  font-size: 1rem !important;
  font-weight: 800 !important;
  color: #2d3748 !important;
  box-shadow: none !important;
  margin-top: 2px;
}

/* Columna de info */
.card-info-col {
  flex: 1;
  padding-left: 12px;
  padding-right: 8px; /* Pequeño espacio para separar del botón de acción */
  display: flex;
  flex-direction: column;
  min-width: 0; /* Permite wrap */
  overflow: hidden; /* Evita desbordamiento visual */
}

.info-top-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.info-item {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  color: #4a5568;
}

.pzas-badge {
  background-color: #f7fafc;
  border-radius: 6px;
  padding: 2px 6px;
  border: 1px solid #edf2f7;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pzas-badge:hover {
  background-color: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.time-badge {
  background-color: #f7fafc;
  border-radius: 6px;
  padding: 4px 8px;
  border: 1px solid #edf2f7;
  font-weight: 600;
  white-space: normal; /* Permitir saltos de línea */
  display: inline-flex;
  align-items: center; /* Alinea icono y texto verticalmente */
  gap: 4px;
  max-width: 100%;
}

.time-text-content {
  font-size: 0.8rem;
  white-space: normal;
  word-break: break-word;
}

/* Variantes de tiempo */
.time-badge.danger {
  background-color: #fff5f5;
  border-color: #ffe3e3;
  color: #c53030;
}
.time-badge.warning {
  background-color: #fffaf0;
  border-color: #feebc8;
  color: #dd6b20;
}
.time-badge.success {
  background-color: #f0fff4;
  border-color: #c6f6d5;
  color: #22543d;
}
.time-badge.info {
  background-color: #ebf8ff;
  border-color: #bee3f8;
  color: #2b6cb0;
}

.time-status-text {
  font-size: 0.7rem;
  font-weight: 500;
}

/* Pills de estado */
.status-pill {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
  display: inline-block;
}

.status-urgent { background-color: #fed7d7; color: #9b2c2c; }
.status-process { background-color: #bee3f8; color: #2b6cb0; }
.status-pending { background-color: #feebc8; color: #9c4221; }

.card-progress-bar-container {
  width: 100%;
  max-width: 140px;
}
/* Forzar estilos compactos del progressbar */
.card-progress-bar-container .my-bar {
  min-width: 120px !important;
  height: 25px !important;
  font-size: 0.65rem !important;
  margin-top: 0 !important;
}

/* Botón Derecho de Acción Rápida */
.card-right-action {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 12px;
  flex-shrink: 0; /* Evita que el botón se deforme o colapse por flexbox */
}

.right-normal-pending {
  background-color: #0b7285;
  box-shadow: 0 4px 10px rgba(11, 114, 133, 0.2);
}
.right-normal-pending:hover {
  background-color: #095c6b;
  transform: translateY(-2px);
}

.right-normal-process {
  background-color: #2b8a3e;
  box-shadow: 0 4px 10px rgba(43, 138, 62, 0.2);
}
.right-normal-process:hover {
  background-color: #2b8a3e;
  transform: translateY(-2px);
}

.right-urgent-pending {
  background-color: #c92a2a;
  box-shadow: 0 4px 10px rgba(201, 42, 42, 0.2);
}
.right-urgent-pending:hover {
  background-color: #b02525;
  transform: translateY(-2px);
}

.right-urgent-process {
  background-color: #862e9c;
  box-shadow: 0 4px 10px rgba(134, 46, 156, 0.2);
}
.right-urgent-process:hover {
  background-color: #702484;
  transform: translateY(-2px);
}

.disabled-action {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #cbd5e0 !important;
  box-shadow: none !important;
  pointer-events: none !important; /* Desactiva interacción física y clicks nativos */
}
.disabled-action:hover {
  transform: none !important;
}

/* Fila de Botones Secundarios del Card (card-actions-bar) */
.card-actions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f1f3f5;
}

/* Normalización total de botones hijos */
.card-actions-bar button,
.card-actions-bar .btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 38px !important;
  padding: 0 12px !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  border: 1px solid #e9ecef !important;
  background-color: #f8f9fa !important;
  color: #495057 !important;
  transition: all 0.2s ease !important;
  box-shadow: none !important;
}

.card-actions-bar button:hover:not(:disabled),
.card-actions-bar .btn:hover:not(:disabled) {
  background-color: #edf2f7 !important;
  border-color: #cbd5e0 !important;
  transform: translateY(-1px);
}

.card-actions-bar button:disabled,
.card-actions-bar .btn:disabled {
  opacity: 0.45 !important;
  background-color: #f8f9fa !important;
  border-color: #e9ecef !important;
  cursor: not-allowed !important;
}

/* Colores específicos de Botones */
/* 1. Terminar (Success green) */
.card-actions-bar [data-testid="btn-terminar-todo"] {
  color: #2b8a3e !important;
  border-color: #d3f9d8 !important;
  background-color: #ebfbee !important;
}
.card-actions-bar [data-testid="btn-terminar-todo"]:hover:not(:disabled) {
  background-color: #d3f9d8 !important;
}

/* 2. Pausar (Warning/Orange) */
.card-actions-bar .btn-primary { 
  color: #e67e22 !important;
  border-color: #fdebd0 !important;
  background-color: #fef5e7 !important;
}
.card-actions-bar .btn-primary:hover:not(:disabled) {
  background-color: #fdebd0 !important;
}

/* 3. Lote (Blue box icon) */
.card-actions-bar .custom-box-btn {
  color: #1c7ed6 !important;
  border-color: #d0ebff !important;
  background-color: #e7f5ff !important;
}
.card-actions-bar .custom-box-btn:hover:not(:disabled) {
  background-color: #d0ebff !important;
}

/* 4. Retroceder y Detalle yellow (from reposicion.vue) */
.card-actions-bar .btn-warning { 
  color: #d9480f !important;
  border-color: #ffe8cc !important;
  background-color: #fff4e6 !important;
}
.card-actions-bar .btn-warning:hover:not(:disabled) {
  background-color: #ffe8cc !important;
}

/* 5. Ver diseño (diseno-view-image uses variant="primary") */
.btn-diseno-wrapper button {
  color: #0b7285 !important;
  border-color: #c5f6fa !important;
  background-color: #e3fafc !important;
}
.btn-diseno-wrapper button:hover:not(:disabled) {
  background-color: #c5f6fa !important;
}

/* 6. Daño / Editor de detalles (controlDeProduccionDetallesEditor) */
.btn-dano-wrapper button {
  color: #c92a2a !important;
  border-color: #ffe3e3 !important;
  background-color: #fff5f5 !important;
}
.btn-dano-wrapper button:hover:not(:disabled) {
  background-color: #ffe3e3 !important;
}

/* 7. Vinculadas wrapper button */
.btn-vinculadas-wrapper button {
  color: #5f3dc4 !important;
  border-color: #e83e8c !important;
  background-color: #f3f0ff !important;
}

/* Cabecera fija y contenedor para pantallas móviles y tablets (debajo del menú burger) */
@media (max-width: 991.98px) {
  /* Scroll interno controlado en móviles */
  html.mobile-internal-scroll, 
  body.mobile-internal-scroll,
  html.mobile-internal-scroll #__nuxt, 
  html.mobile-internal-scroll #__layout, 
  html.mobile-internal-scroll .app-wrapper, 
  html.mobile-internal-scroll .main-wrapper {
    height: 100vh !important;
    height: -webkit-fill-available !important;
    overflow: hidden !important;
  }

  html.mobile-internal-scroll .main-content {
    height: calc(100vh - 56px) !important;
    overflow: hidden !important;
    padding-top: 56px !important;
  }

  .mobile-internal-scroll .dashboard-v2-container {
    height: calc(100vh - 56px) !important;
    overflow: hidden !important;
    position: relative;
    padding: 0 !important;
  }

  .mobile-internal-scroll .fixed-top-header {
    position: fixed;
    left: 0 !important;
    right: 0 !important;
    top: 56px !important; /* Posicionar debajo de la barra de menú móvil (mobile-header) */
    padding: 10px 15px;
    margin: 0 !important;
    border-bottom: 1px solid #eef2f6;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    z-index: 1020;
    height: 69px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }

  .mobile-internal-scroll .dashboard-content-area {
    height: calc(100vh - 125px) !important; /* Altura total menos menú (56px) y header fijo (69px) */
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
    padding: 15px;
    /* Margin-top para que el contenido empiece DEBAJO del fixed-top-header (69px) */
    /* El contenedor ya tiene top: 69px gracias al posicionamiento del padre */
    margin-top: 69px !important;
  }
}

/* Adaptación móvil - solo íconos */
@media (max-width: 576px) {
  .card-right-action {
    width: 40px !important;
    height: 40px !important;
    font-size: 1.15rem !important;
    margin-left: 8px !important;
    border-radius: 10px !important;
  }

  .card-actions-bar button, 
  .card-actions-bar .btn {
    width: 36px !important;
    height: 36px !important;
    padding: 0 !important;
    font-size: 0 !important; /* Esconde texto */
    border-radius: 50% !important; /* Circulares */
    position: relative !important;
  }

  .card-actions-bar button svg,
  .card-actions-bar button .b-icon,
  .card-actions-bar button img {
    font-size: 1.1rem !important;
    margin: 0 !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    text-indent: 0 !important;
  }
}

/* Barra inferior flotante */
.bottom-batch-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1010;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #edf2f7;
  padding: 8px 10px;
}

.batch-count-label {
  font-size: 0.95rem;
  color: #4a5568;
}

.batch-action-btn {
  padding: 10px 25px !important;
  box-shadow: 0 4px 10px rgba(40, 167, 69, 0.3) !important;
}

/* Buscador de órdenes en zona scrolleable (solo móvil) */
.mobile-search-wrapper {
  width: 100%;
}

/* Sobrescribir el ancho fijo del input-search dentro del componente buscar-BarraDeBusqueda */
.mobile-search-wrapper /deep/ .search-container,
.mobile-search-wrapper /deep/ .form-search,
.mobile-search-wrapper /deep/ .input-search {
  width: 100% !important;
  float: none !important;
}
</style>