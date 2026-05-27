<template>
  <div>
    <div class="d-flex align-items-center mb-3">
      <b-button @click="initTiemposDeProduccion" :variant="buttonState.variant" :disabled="buttonState.disabled">
        <b-icon icon="arrow-clockwise" :animation="isLoading ? 'spin' : ''"></b-icon>
        {{ buttonState.text }}
      </b-button>

      <produccionsse-asignacion-masiva :items="items" :empleados="empleados" :ordenes-proyectadas="ordenesProyectadas2"
        @reload="initTiemposDeProduccion" />
    </div>

    <!-- 1. Reposiciones por aprobar (Cabecera y Collapse) -->
    <div class="section-header bg-warning-accent d-flex align-items-center justify-content-between mt-4 mb-3" @click="toggleSection('isReposicionesAsignarVisible')">
      <div class="d-flex align-items-center">
        <h3 class="section-title mb-0">Reposiciones por aprobar</h3>
        <b-badge pill variant="warning" class="ml-3 px-2 py-1 count-badge">
          {{ reposiciones_solicitadas.length }}
        </b-badge>
      </div>
      <b-button variant="link" class="collapse-toggle-btn text-decoration-none p-0">
        <b-icon icon="chevron-down" class="chevron-icon" :class="{ 'rotated': !isReposicionesAsignarVisible }"></b-icon>
      </b-button>
    </div>

    <b-collapse v-model="isReposicionesAsignarVisible" class="mb-4">
      <b-overlay :show="isLoading" opacity="0.6" rounded="sm" spinner-variant="success">
        <template #overlay>
          <div class="text-center">
            <b-spinner variant="success" label="Cargando..."></b-spinner>
            <h3 class="mt-2">Cargando reposiciones...</h3>
          </div>
        </template>

        <div v-if="reposiciones_solicitadas.length === 0 && !isLoading">
          <b-alert class="text-center mb-4" show variant="info">
            <h4 class="mb-0">No hay reposiciones para asignar</h4>
          </b-alert>
        </div>

        <div v-else>
          <b-container fluid>
            <!-- Cabeceras para Reposiciones (misma estructura que Ordenes en curso) -->
            <div class="list-group-header-reposiciones">
              <div class="list-group-header-item">⋮</div>
              <div class="list-group-header-item">Orden</div>
              <div class="list-group-header-item">Interacción</div>
              <div class="list-group-header-item">Und.</div>
              <div class="list-group-header-item">Producto</div>
              <div class="list-group-header-item">Fecha</div>
              <div class="list-group-header-item">Empleado</div>
              <div class="list-group-header-item">Detalle</div>
              <div class="list-group-header-item"></div>
              <div class="list-group-header-item">Acciones</div>
            </div>

            <b-overlay :show="isReordering" rounded="sm" spinner-variant="success" opacity="0.7">
              <template #overlay>
                <div class="text-center">
                  <b-spinner variant="success"></b-spinner>
                  <p class="mt-2 mb-0"><strong>Guardando nuevo orden...</strong></p>
                </div>
              </template>
              <draggable v-model="reposiciones_solicitadas" @end="afterDragRep" tag="ul" class="list-group">
                <li v-for="(el, index) in reposiciones_solicitadas" :key="`rep-${el.id_reposicion}-${refreshKey}`"
                  class="list-group-item" style="list-style: none; padding: 0; margin: 0; border: none">
                  <b-list-group class="list-group-reposiciones">
                    <b-list-group-item class="pb-3 drag-handle d-flex align-items-left">
                      <span class="drag-handle-zone" style="padding-top: 12px; padding-right: 16px; cursor: grab;">☰</span>
                    </b-list-group-item>

                    <b-list-group-item data-label="Orden">
                      <div>
                        <link-search :id="el.id_orden" :key="el.id_orden" />
                      </div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Interacción">
                      <produccionsse-reposicionesPendientes :empleados="empleados" :item="el" :key="index"
                        @reload="initTiemposDeProduccion" />
                    </b-list-group-item>

                    <b-list-group-item data-label="Unidades">
                      <div>{{ el.unidades }}</div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Producto">
                      <div>
                        <strong>{{ el.producto }}</strong>
                        <br />
                        <small class="text-muted">{{ el.talla }} · {{ el.corte }} · {{ el.tela }}</small>
                      </div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Fecha">
                      <div>
                        <small>{{ el.fecha }}<br />{{ el.hora }}</small>
                      </div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Empleado">
                      <div class="text-truncate" :title="el.empleado">
                        <small>{{ el.empleado }}</small>
                      </div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Detalle">
                      <div class="text-truncate" :title="el.detalle_emisor">
                        <small>{{ el.detalle_emisor }}</small>
                      </div>
                    </b-list-group-item>

                    <b-list-group-item>
                      <!-- Reservado -->
                    </b-list-group-item>

                    <b-list-group-item data-label="Acciones">
                      <b-button variant="outline-danger" size="sm" class="px-2 py-1" @click="confirmarEliminarReposicion(el)" style="border-radius: 20px; font-weight: 500; font-size: 0.8em; white-space: nowrap;">
                        <b-icon icon="trash-fill" class="mr-1"></b-icon> Eliminar
                      </b-button>
                    </b-list-group-item>
                  </b-list-group>
                </li>
              </draggable>
            </b-overlay>
          </b-container>
        </div>
      </b-overlay>
    </b-collapse>

    <!-- 2. Reposiciones en curso (Cabecera y Collapse) -->
    <div class="section-header bg-info-accent d-flex align-items-center justify-content-between mt-4 mb-3" @click="toggleSection('isReposicionesCursoVisible')">
      <div class="d-flex align-items-center">
        <h3 class="section-title mb-0">Reposiciones en curso</h3>
        <b-badge pill variant="info" class="ml-3 px-2 py-1 count-badge">
          {{ reposiciones_en_curso.length }}
        </b-badge>
      </div>
      <b-button variant="link" class="collapse-toggle-btn text-decoration-none p-0">
        <b-icon icon="chevron-down" class="chevron-icon" :class="{ 'rotated': !isReposicionesCursoVisible }"></b-icon>
      </b-button>
    </div>

    <b-collapse v-model="isReposicionesCursoVisible" class="mb-4">
      <b-overlay :show="isLoading" opacity="0.6" rounded="sm" spinner-variant="success">
        <template #overlay>
          <div class="text-center">
            <b-spinner variant="success" label="Cargando..."></b-spinner>
            <h3 class="mt-2">Cargando reposiciones en curso...</h3>
          </div>
        </template>

        <div v-if="reposiciones_en_curso.length === 0 && !isLoading">
          <b-alert class="text-center mb-4" show variant="info">
            <h4 class="mb-0">No hay reposiciones en curso</h4>
          </b-alert>
        </div>

        <div v-else>
          <b-container fluid>
            <!-- Cabeceras para Reposiciones en Curso (grilla compacta de 8 columnas) -->
            <div class="list-group-header-reposiciones-curso">
              <div class="list-group-header-item">⋮</div>
              <div class="list-group-header-item">Orden</div>
              <div class="list-group-header-item">Asignación</div>
              <div class="list-group-header-item">Und.</div>
              <div class="list-group-header-item">Producto</div>
              <div class="list-group-header-item">Fecha</div>
              <div class="list-group-header-item">Creador</div>
              <div class="list-group-header-item">Acciones</div>
            </div>

            <b-overlay :show="isReordering" rounded="sm" spinner-variant="success" opacity="0.7">
              <template #overlay>
                <div class="text-center">
                  <b-spinner variant="success"></b-spinner>
                  <p class="mt-2 mb-0"><strong>Guardando nuevo orden...</strong></p>
                </div>
              </template>
              <draggable v-model="reposiciones_en_curso" @end="afterDragRepCurso" tag="ul" class="list-group">
                <li v-for="el in reposiciones_en_curso" :key="`rep-curso-${el.id_reposicion}-${refreshKey}`"
                  class="list-group-item" style="list-style: none; padding: 0; margin: 0; border: none">
                  <b-list-group class="list-group-reposiciones-curso">
                    <b-list-group-item class="pb-3 drag-handle d-flex align-items-center" style="gap: 8px;">
                      <span class="drag-handle-zone" style="cursor: grab; padding-top: 4px;">☰</span>
                      <b-icon icon="play-circle-fill" variant="info" animation="pulse" style="font-size: 0.95rem;"></b-icon>
                    </b-list-group-item>

                    <b-list-group-item data-label="Orden">
                      <div>
                        <link-search :id="el.id_orden" :key="el.id_orden" />
                      </div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Asignación">
                      <div class="d-flex align-items-center justify-content-between w-100">
                        <div class="d-flex flex-column align-items-start" style="gap: 2px;">
                          <b-badge v-if="el.empleado" variant="light" class="text-dark border" style="font-size: 0.85em; font-weight: 600;">
                            <b-icon icon="person-fill" class="mr-1"></b-icon>{{ el.empleado }}
                          </b-badge>
                          <b-badge v-else variant="warning" style="font-size: 0.85em; font-weight: 600;">
                            <b-icon icon="person-dash-fill" class="mr-1"></b-icon>Sin asignar
                          </b-badge>
                          <b-badge variant="primary" style="font-size: 0.75em; font-weight: 500;">
                            <b-icon icon="building" class="mr-1"></b-icon>{{ el.nombre_departamento }}
                          </b-badge>
                        </div>
                        <b-button variant="outline-info" size="sm" class="px-2 py-1 ml-3" @click="showRepDetalle(el)" style="border-radius: 20px; font-weight: 500; font-size: 0.8em; white-space: nowrap;">
                          <b-icon icon="info-circle" class="mr-1"></b-icon>Info Completa
                        </b-button>
                      </div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Unidades">
                      <div><strong>{{ el.unidades }}</strong></div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Producto">
                      <div>
                        <strong>{{ el.producto }}</strong>
                        <br />
                        <small class="text-muted">{{ el.talla }} · {{ el.corte }} · {{ el.tela }}</small>
                      </div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Fecha">
                      <div>
                        <small>{{ el.fecha }}<br />{{ el.hora }}</small>
                      </div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Creador">
                      <div class="text-truncate" :title="el.emisor">
                        <small>{{ el.emisor }}</small>
                      </div>
                    </b-list-group-item>

                    <b-list-group-item data-label="Acciones" class="d-flex align-items-center" style="gap: 8px;">
                      <b-button variant="outline-primary" size="sm" class="px-3 py-1" @click="showAssignRepModal(el)" style="border-radius: 20px; font-weight: 500; font-size: 0.8em; white-space: nowrap;">
                        <b-icon icon="person-plus-fill" class="mr-1"></b-icon> Asignar
                      </b-button>
                      <b-button variant="outline-danger" size="sm" class="px-2 py-1" @click="confirmarEliminarReposicion(el)" style="border-radius: 20px; font-weight: 500; font-size: 0.8em;">
                        <b-icon icon="trash-fill"></b-icon>
                      </b-button>
                    </b-list-group-item>
                  </b-list-group>
                </li>
              </draggable>
            </b-overlay>
          </b-container>
        </div>
      </b-overlay>
    </b-collapse>

    <!-- 3. Órdenes en curso (Cabecera y Collapse) -->
    <div class="section-header bg-success-accent d-flex align-items-center justify-content-between mt-4 mb-3" @click="toggleSection('isOrdenesCursoVisible')">
      <div class="d-flex align-items-center">
        <h3 class="section-title mb-0">Órdenes en curso</h3>
        <b-badge pill variant="success" class="ml-3 px-2 py-1 count-badge">
          {{ itemsFiltrados.length }}
        </b-badge>
      </div>
      <b-button variant="link" class="collapse-toggle-btn text-decoration-none p-0">
        <b-icon icon="chevron-down" class="chevron-icon" :class="{ 'rotated': !isOrdenesCursoVisible }"></b-icon>
      </b-button>
    </div>

    <b-collapse v-model="isOrdenesCursoVisible" class="mb-4">
      <!-- Filtros -->
      <b-row class="mb-3">
        <b-col md="3">
          <b-form-group label="Filtrar por Orden" label-for="filter-orden">
            <b-form-input id="filter-orden" v-model="filterOrden" placeholder="Ej: 1234" type="text"
              debounce="300"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col md="3">
          <b-form-group label="Filtrar por Cliente" label-for="filter-cliente">
            <b-form-input id="filter-cliente" v-model="filterCliente" placeholder="Nombre del cliente"
              debounce="300"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col md="3">
          <b-form-group label="Filtrar por Estado" label-for="filter-estatus">
            <b-form-input id="filter-estatus" v-model="filterEstatus" placeholder="Estado de la orden"
              debounce="300"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col md="3" class="d-flex align-items-end flex-column">
          <b-button v-if="isUserFiltering" @click="clearFilters" variant="outline-danger" size="sm" class="mb-2 w-100">
            <b-icon icon="x-circle"></b-icon> Limpiar Filtros
          </b-button>
          <b-alert v-if="isUserFiltering" show variant="warning" class="m-0 p-2 w-100 text-center">
            <small><strong>Reordenamiento desactivado</strong> por filtros
              activos.</small>
          </b-alert>
        </b-col>
      </b-row>

      <b-overlay :show="isLoading" opacity="0.6" rounded="sm" spinner-variant="success">
        <template #overlay>
          <div class="text-center">
            <b-spinner variant="success" label="Cargando..."></b-spinner>
            <h3 class="mt-2">Cargando Ordenes...</h3>
          </div>
        </template>

        <div v-if="items.length === 0 && !isLoading">
          <b-alert show class="mt-2 mb-4" variant="info">
            <h3>No hay ordenes en curso</h3>
          </b-alert>
        </div>

        <div v-else>
          <b-container fluid>
            <!-- Cabeceras fijas con el mismo grid -->
            <div class="list-group-header">
              <div class="list-group-header-item">⋮</div>
              <div class="list-group-header-item">Orden</div>
              <div class="list-group-header-item">Cliente</div>
              <div class="list-group-header-item">Und.</div>
              <div class="list-group-header-item">Progreso</div>
              <div class="list-group-header-item">Entrega</div>
              <div class="list-group-header-item">Vinc.</div>
              <div class="list-group-header-item">Estatus</div>
              <div class="list-group-header-item">Detalles</div>
              <div class="list-group-header-item">Acciones</div>
            </div>

            <b-overlay :show="isReordering" rounded="sm" spinner-variant="success" opacity="0.7">
              <template #overlay>
                <div class="text-center">
                  <b-spinner variant="success"></b-spinner>
                  <p class="mt-2 mb-0"><strong>Guardando nuevo orden...</strong></p>
                </div>
              </template>
            <draggable v-model="itemsFiltrados" @end="afterDrag" tag="ul" class="list-group" handle=".drag-handle-zone"
              :disabled="isUserFiltering || isReordering">
              <li v-for="(el, index) in itemsMostrados" :key="`${el.orden}-${refreshKey}`" class="list-group-item"
                style="list-style: none; padding: 0; margin: 0; border: none">
                <b-list-group class="list-group-draggable">
                  <b-list-group-item class="pb-3 drag-handle d-flex align-items-left">
                    <span class="drag-handle-zone" :style="{
                      cursor: isUserFiltering ? 'not-allowed' : 'grab',
                      paddingTop: '4px',
                      paddingRight: '16px',
                      paddingTop: '12px',
                      opacity: isUserFiltering ? 0.3 : 1
                    }">☰</span>
                  </b-list-group-item>

                  <b-list-group-item data-label="Orden">
                    <div>
                      <link-search :id="el.orden" :key="el.orden" />
                    </div>
                    <div v-if="el.estatus_revision === 'Aprobado'" class="h1 mt-2">
                      <b-button variant="outline-light">
                        <b-icon icon="exclamation-circle-fill" variant="success" @click="showDesigner(el.disenador)"
                          :key="el.orden"></b-icon>
                      </b-button>
                    </div>

                    <div v-else class="h1 mt-2">
                      <b-button variant="outline-light" @click="showDesigner(el.disenador)" :key="el.orden">
                        <b-icon icon="exclamation-circle-fill" style="color: lightgray"></b-icon>
                      </b-button>
                    </div>
                  </b-list-group-item>

                  <b-list-group-item data-label="Cliente">
                    {{ el.cliente }}
                  </b-list-group-item>

                  <b-list-group-item data-label="Unidades">
                    <div>
                      {{ el.unidades }}
                    </div>
                  </b-list-group-item>

                  <b-list-group-item data-label="Progreso">
                    <div>
                      <produccionsse-progress-bar :pasos="pasos" :asignacion="asignacion"
                        :emp_asignados="empleadosAsignados" :empleados="empleados" :por_asignar="por_asignar"
                        :depart="pActivo(el.orden)" :item="el" :orden_productos="filterOrdenProductos(el.orden)"
                        :reposicion_ordenes_productos="reposicion_ordenes_productos
                          " :lote_detalles="filterLoteDetalles(el.orden)" :lotes_fisicos="lotes_fisicos" :key="el.orden"
                        @reload="initTiemposDeProduccion" />
                    </div>
                  </b-list-group-item>

                  <b-list-group-item data-label="Entrega">
                    <div style="margin-top: 32px">
                      <!-- ===================== INICIO DE MODIFICACIÓN ==================== -->
                      <!-- Se reemplaza @reload por los eventos de modal -->
                      <progreso-tiempo-semaforo :key="el.orden" @modal-shown="handleModalShown"
                        @modal-hidden="handleModalHidden" :ordenesTodas="fechas" :id_orden="el.orden"
                        :ordenesProyectadas2="ordenesProyectadas2" :is-parent-loading="isProyeccionLoading" />
                      <!-- ====================== FIN DE MODIFICACIÓN ====================== -->
                    </div>
                  </b-list-group-item>

                  <b-list-group-item data-label="Vinculada">
                    <div class="floatme">
                      <ordenes-vinculadas-v2 :ordenes_vinculadas="filterVinculadas(el.acciones)" :key="el.orden"
                        :id_orden="el.orden" />
                    </div>
                  </b-list-group-item>

                  <b-list-group-item data-label="Estatus">
                    <div>
                      {{ el.estatus }}
                    </div>
                  </b-list-group-item>

                  <b-list-group-item data-label="Detalles">
                    <div>
                      <produccion-control-de-produccion-detalles-editor :idorden="el.orden" :item="el"
                        :detalles="el.detalles" :detalle_empleado="el.detalle_empleado" :key="el.orden"
                        :productos="productsFilter(el.orden)" />
                      <produccionsse-ModalNotasProduccion :id_orden="el.orden" />
                    </div>
                  </b-list-group-item>

                  <b-list-group-item data-label="Acciones">
                    <div class="d-flex" style="gap: 5px;">
                      <b-button variant="info" size="sm" @click="$bvModal.show('modal-notas-' + el.orden)" title="Ver notas de empleados">
                        <b-icon icon="chat-left-text"></b-icon>
                      </b-button>
                      <ordenes-editar :data="el" :key="el.orden" />
                    </div>
                  </b-list-group-item>
                </b-list-group>
              </li>
            </draggable>

            <!-- 🆕 SENTINELA PARA INFINITE SCROLL -->
            <div id="infinite-scroll-sentinel" style="height: 50px; display: flex; align-items: center; justify-content: center;">
              <div v-if="itemsMostrados.length < itemsFiltrados.length" class="text-muted italic">
                <b-spinner small variant="success" class="mr-2"></b-spinner>
                Cargando más órdenes ({{ itemsMostrados.length }} de {{ itemsFiltrados.length }})...
              </div>
              <div v-else-if="itemsFiltrados.length > 0" class="text-muted small">
                Fin de la lista ({{ itemsFiltrados.length }} órdenes mostradas)
              </div>
            </div>
            </b-overlay>
          </b-container>
        </div>
      </b-overlay>
    </b-collapse>
    <!-- Modal Detalle Completo de la Reposición -->
    <b-modal id="modal-detalle-reposicion" title="Detalle Completo de la Reposición" hide-footer size="lg" @hidden="selectedRep = null; repQueue = []; handleModalHidden()">
      <div v-if="selectedRep">
        <b-container fluid class="p-0">
          <b-row class="mb-3">
            <b-col md="6">
              <div class="card h-100 shadow-sm border-light">
                <div class="card-header bg-dark text-white font-weight-bold d-flex align-items-center justify-content-between py-2">
                  <span><b-icon icon="info-square" class="mr-1"></b-icon> Información Básica</span>
                  <b-badge variant="light">ID: #{{ selectedRep.id_reposicion }}</b-badge>
                </div>
                <b-list-group flush>
                  <b-list-group-item>
                    <strong>Orden Vinculada:</strong> <link-search :id="selectedRep.id_orden" :key="selectedRep.id_orden" class="ml-1" />
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Unidades a Reponer:</strong> <b-badge variant="info" pill class="px-2 font-weight-bold">{{ selectedRep.unidades }}</b-badge>
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Creador original:</strong> <span class="text-secondary font-weight-bold">{{ selectedRep.emisor }}</span>
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Fecha de Solicitud:</strong> <small class="text-muted"><b-icon icon="calendar3" class="mr-1"></b-icon>{{ selectedRep.fecha }} {{ selectedRep.hora }}</small>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </b-col>
            
            <b-col md="6">
              <div class="card h-100 shadow-sm border-light">
                <div class="card-header bg-primary text-white font-weight-bold py-2">
                  <b-icon icon="person-badge" class="mr-1"></b-icon> Asignación Actual
                </div>
                <b-list-group flush>
                  <b-list-group-item class="d-flex align-items-center justify-content-between">
                    <strong>Empleado Responsable:</strong>
                    <b-badge v-if="selectedRep.empleado" variant="light" class="text-dark border font-weight-bold">
                      <b-icon icon="person-fill" class="mr-1"></b-icon>{{ selectedRep.empleado }}
                    </b-badge>
                    <b-badge v-else variant="warning" class="font-weight-bold">
                      <b-icon icon="person-dash-fill" class="mr-1"></b-icon>Sin asignar
                    </b-badge>
                  </b-list-group-item>
                  <b-list-group-item class="d-flex align-items-center justify-content-between">
                    <strong>Departamento Asignado:</strong>
                    <b-badge variant="primary" class="font-weight-bold">
                      <b-icon icon="building" class="mr-1"></b-icon>{{ selectedRep.nombre_departamento }}
                    </b-badge>
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Departamento Solicitante:</strong>
                    <b-badge variant="secondary" class="font-weight-bold">
                      <b-icon icon="arrow-return-left" class="mr-1"></b-icon>Dpto. Solicitante #{{ selectedRep.id_departamento_solicitante }}
                    </b-badge>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </b-col>
          </b-row>

          <b-row class="mb-3">
            <b-col>
              <div class="card shadow-sm border-light">
                <div class="card-header bg-light font-weight-bold py-2">
                  <b-icon icon="tag" class="mr-1 text-secondary"></b-icon> Detalles del Producto
                </div>
                <div class="card-body py-3">
                  <h6 class="font-weight-bold text-dark mb-1">{{ selectedRep.producto }}</h6>
                  <p class="mb-0 text-muted small">
                    <strong>Talla:</strong> {{ selectedRep.talla }} &nbsp;&nbsp;|&nbsp;&nbsp; 
                    <strong>Corte:</strong> {{ selectedRep.corte }} &nbsp;&nbsp;|&nbsp;&nbsp; 
                    <strong>Tela:</strong> {{ selectedRep.tela }}
                  </p>
                </div>
              </div>
            </b-col>
          </b-row>

          <b-row class="mb-3">
            <b-col md="6">
              <div class="card shadow-sm border-light">
                <div class="card-header font-weight-bold py-2" style="background-color: rgba(255,193,7,0.1); border-bottom: 1px solid rgba(255,193,7,0.2);">
                  <b-icon icon="exclamation-circle" class="mr-1 text-warning"></b-icon> Detalle de Solicitud (Emisor)
                </div>
                <div class="card-body p-3 bg-light text-dark" style="min-height: 80px; font-size: 0.95em; white-space: pre-line;">
                  {{ selectedRep.detalle_emisor || 'Ninguno proporcionado.' }}
                </div>
              </div>
            </b-col>
            <b-col md="6">
              <div class="card shadow-sm border-light">
                <div class="card-header font-weight-bold py-2" style="background-color: rgba(40,167,69,0.1); border-bottom: 1px solid rgba(40,167,69,0.2);">
                  <b-icon icon="check2-circle" class="mr-1 text-success"></b-icon> Detalle de Aprobación (Supervisor)
                </div>
                <div class="card-body p-3 bg-light text-dark" style="min-height: 80px; font-size: 0.95em; white-space: pre-line;">
                  {{ selectedRep.detalle || 'Ninguno proporcionado.' }}
                </div>
              </div>
            </b-col>
          </b-row>

          <!-- Cola de Departamentos (Timeline dinámico) -->
          <b-row v-if="loadingRepQueue" class="my-4">
            <b-col class="text-center">
              <b-spinner variant="primary" small></b-spinner>
              <span class="ml-2 text-muted small">Cargando cola de departamentos...</span>
            </b-col>
          </b-row>
          <b-row v-else-if="repQueue.length > 0">
            <b-col>
              <div class="card shadow-sm border-light">
                <div class="card-header bg-dark text-white font-weight-bold py-2">
                  <b-icon icon="list-check" class="mr-1"></b-icon> Cola de Departamentos para el Retrabajo
                </div>
                <div class="card-body bg-light py-3">
                  <div class="d-flex flex-wrap" style="gap: 10px;">
                    <div
                      v-for="(dep, idx) in repQueue"
                      :key="dep.id_departamento"
                      class="d-flex align-items-center p-2 border rounded shadow-sm bg-white"
                      :class="{
                        'border-success': dep.es_inicio == 1,
                        'border-primary': dep.es_destino == 1,
                        'border-light text-muted': dep.excluido == 1
                      }"
                      style="min-width: 170px; font-size: 0.85em;"
                    >
                      <div class="flex-grow-1 text-truncate" :title="dep.departamento">
                        <strong class="mr-1 text-secondary">#{{ idx + 1 }}</strong>
                        <span :class="{ 'text-muted text-decoration-line-through': dep.excluido == 1 }">
                          {{ dep.departamento }}
                        </span>
                        <div class="mt-1">
                          <b-badge v-if="dep.es_inicio == 1" variant="success" style="font-size:0.65em">inicio</b-badge>
                          <b-badge v-if="dep.es_destino == 1" variant="primary" style="font-size:0.65em">destino</b-badge>
                          <b-badge v-if="dep.excluido == 1" variant="secondary" style="font-size:0.65em">omitido</b-badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </b-col>
          </b-row>
        </b-container>
      </div>
      <div class="text-right mt-3 border-top pt-2">
        <b-button variant="secondary" size="sm" @click="$bvModal.hide('modal-detalle-reposicion')">Cerrar</b-button>
      </div>
    </b-modal>

    <!-- Modal Asignar Empleado a Reposición -->
    <b-modal id="modal-asignar-reposicion" title="Asignar Empleado a Reposición" hide-footer size="md" @hidden="onAssignModalHidden">
      <b-overlay :show="assignOverlay" spinner-small>
        <div v-if="assignRepItem">
          <p class="small text-muted mb-3">
            Asigna un responsable y departamento para la reposición de la orden <strong>#{{ assignRepItem.id_orden }}</strong> ({{ assignRepItem.unidades }} unds. {{ assignRepItem.producto }}).
          </p>

          <b-form @submit.prevent="submitAssignRep">
            <b-form-group label="Empleado:" label-for="rep-assign-emp">
              <b-form-select
                id="rep-assign-emp"
                v-model="assignRepForm.emp"
                :options="selectEmpleados"
                size="sm"
                required
              ></b-form-select>
            </b-form-group>

            <b-form-group
              v-if="assignRepForm.emp && assignRepForm.emp !== 0 && selectedEmployeeDepartmentsAssign.length > 0"
              label="Departamento del Empleado:"
              label-for="rep-assign-dep"
            >
              <b-form-select
                id="rep-assign-dep"
                v-model="assignRepForm.id_departamento"
                :options="selectDepartmentOptionsAssign"
                size="sm"
                required
              ></b-form-select>
            </b-form-group>

            <div class="text-right mt-4 border-top pt-2">
              <b-button variant="secondary" size="sm" @click="$bvModal.hide('modal-asignar-reposicion')" class="mr-2">Cancelar</b-button>
              <b-button type="submit" variant="success" size="sm" :disabled="!assignRepForm.emp || !assignRepForm.id_departamento">Guardar Asignación</b-button>
            </div>
          </b-form>
        </div>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import mixin3 from "~/mixins/procesamientoOrdenes.js";
import draggable from "vuedraggable";
import { log } from "console";

export default {
  components: {
    draggable,
  },
  data() {
    return {
      isLoading: true,
      isProyeccionLoading: false, // Nuevo: para rastrear el endpoint pesado de proyecciones
      visibleOrders: 10,        // Nuevo: para carga incremental en bloques de 10
      physicalOrdersMap: {},     // Nuevo: índice para búsqueda instantánea de productos físicos
      hasNewData: false,
      toastShown: false,
      isCheckingForUpdates: false,
      ordenesProyectadas2: [],
      fechasResultSemaforo: null,
      fechas: [],
      includedFields: ["orden", "cliente"],
      perPage: 25,
      currentPage: 1,
      ordenesLength: 0,
      filter: null,
      // Nuevos filtros
      filterOrden: '',
      filterCliente: '',
      filterEstatus: '',

      overlay: true,
      items: [],
      pactivos: [],
      vinculadas: [],
      por_asignar: [],
      products: [],
      asignacion: [],
      empleadosAsignados: [],
      orden_productos: [],
      isReposicionesAsignarVisible: true,
      isReposicionesCursoVisible: true,
      isOrdenesCursoVisible: true,
      reposicion_ordenes_productos: [],
      lote_detalles: [],
      lotes_fisicos: [],
      reposiciones_solicitadas: [],
      reposiciones_en_curso: [],
      selectedRep: null,
      repQueue: [],
      loadingRepQueue: false,
      assignRepItem: null,
      assignRepForm: {
        emp: 0,
        id_departamento: null,
      },
      selectedEmployeeDepartmentsAssign: [],
      assignOverlay: false,
      empleados: [],
      pasos: [],
      refreshKey: 0,
      reloadMe: false,
      isReordering: false,
      events: [],
      fields_reposiciones: [{ key: "id_orden", label: " " }],
      fields: [
        { key: "orden", label: "Orden" },
        {
          key: "estatus_revision",
          label: "Diseño",
          thClass: "text-center",
          tdClass: "text-center",
        },
        { key: "cliente", label: "Cliente" },
        { key: "unidades", label: "Unidades", thClass: "text-center" },
        { key: "paso", label: "Progreso" },
        { key: "inicio", label: "Inicio" },
        { key: "entrega", label: "Entrega" },
        { key: "vinculada", label: "Vinculada" },
        { key: "estatus", label: "Estatus" },
        { key: "detalles", label: "Detalles" },
        { key: "acciones", label: "Acciones" },
      ],
      activeModalCount: 0,
      intervaloRecargaDatos: null,
    };
  },

  methods: {
    checkForUpdates() {
      if (this.isCheckingForUpdates || this.isLoading) return;
      this.isCheckingForUpdates = true;

      this.$axios
        .get(`${this.$config.API}/sse/produccion`)
        .then((res) => {
          const newItems = res.data.items;
          const newReposiciones = res.data.reposiciones_solicitadas;
          const newReposicionesEnCurso = res.data.reposiciones_en_curso || [];

          const currentItemsStr = JSON.stringify(this.items.map(i => i.orden));
          const newItemsStr = JSON.stringify(newItems.map(i => i.orden));

          const currentReposicionesStr = JSON.stringify(this.reposiciones_solicitadas.map(r => r.id_reposicion));
          const newReposicionesStr = JSON.stringify(newReposiciones.map(r => r.id_reposicion));

          const currentReposicionesEnCursoStr = JSON.stringify(this.reposiciones_en_curso.map(r => r.id_reposicion));
          const newReposicionesEnCursoStr = JSON.stringify(newReposicionesEnCurso.map(r => r.id_reposicion));

          if (currentItemsStr !== newItemsStr || currentReposicionesStr !== newReposicionesStr || currentReposicionesEnCursoStr !== newReposicionesEnCursoStr) {
            if (!this.toastShown) {
              this.$bvToast.toast("Hay nuevas órdenes o reposiciones.", {
                id: 'new-data-toast',
                title: "Actualización Disponible",
                variant: "success",
                solid: true,
                toaster: "b-toaster-top-right",
                noAutoHide: true,
                appendToast: true,
              });
              this.hasNewData = true;
              this.toastShown = true;
            }
          }
        })
        .catch((err) => {
          console.error("Error al verificar actualizaciones:", err);
        })
        .finally(() => {
          this.isCheckingForUpdates = false;
        });
    },

    handleModalShown() {
      this.activeModalCount++;
    },
    handleModalHidden() {
      this.activeModalCount--;
    },

    async showRepDetalle(rep) {
      this.selectedRep = rep;
      this.repQueue = [];
      this.loadingRepQueue = true;
      this.handleModalShown();
      this.$bvModal.show("modal-detalle-reposicion");

      try {
        const res = await this.$axios.get(
          `${this.$config.API}/reposicion/${rep.id_reposicion}/departamentos-cola`
        );
        this.repQueue = res.data || [];
      } catch (e) {
        console.error("Error al cargar la cola de departamentos para la reposición:", e);
      } finally {
        this.loadingRepQueue = false;
      }
    },

    showAssignRepModal(rep) {
      this.assignRepItem = rep;
      this.assignRepForm.emp = rep.id_empleado || 0;
      this.assignRepForm.id_departamento = rep.id_departamento || null;
      this.handleModalShown();
      this.$bvModal.show("modal-asignar-reposicion");
    },

    onAssignModalHidden() {
      this.assignRepItem = null;
      this.assignRepForm.emp = 0;
      this.assignRepForm.id_departamento = null;
      this.selectedEmployeeDepartmentsAssign = [];
      this.assignOverlay = false;
      this.handleModalHidden();
    },

    async fetchEmployeeDepartmentsAssign(employeeId) {
      this.assignOverlay = true;
      try {
        const response = await this.$axios.get(
          `${this.$config.API}/departamentos-empleado/${employeeId}`
        );
        this.selectedEmployeeDepartmentsAssign =
          response.data.departamentos || response.data || [];
      } catch (error) {
        console.error("Error fetching employee departments for assign:", error);
        this.selectedEmployeeDepartmentsAssign = [];
        this.$fire({
          title: "Error",
          html: "<p>No se pudieron cargar los departamentos del empleado.</p>",
          type: "warning",
        });
      } finally {
        this.assignOverlay = false;
      }
    },

    async submitAssignRep() {
      if (!this.assignRepForm.emp || !this.assignRepForm.id_departamento) return;
      
      this.assignOverlay = true;
      const data = new URLSearchParams();
      data.set("id_orden", this.assignRepItem.id_orden);
      data.set("id_reposicion", this.assignRepItem.id_reposicion);
      data.set("aprobada", "1");
      data.set("id_departamento", this.assignRepForm.id_departamento);
      data.set("id_empleado", this.assignRepForm.emp);
      data.set("id_empleado_emisor", this.$store.state.login.dataUser.id_empleado);
      data.set("detalle", this.assignRepItem.detalle || "Asignado desde panel de producción");
      data.set("detalle_emisor", this.assignRepItem.detalle_emisor || "");
      data.set("cantidad", this.assignRepItem.unidades);
      data.set("id_ordenes_productos", this.assignRepItem.id_ordenes_productos);

      try {
        await this.$axios.post(`${this.$config.API}/produccion/reposicion/final`, data);
        this.$fire({
          title: "Asignación Exitosa",
          html: `<p>El empleado ha sido asignado correctamente a la reposición.</p>`,
          type: "success",
        });
        this.$bvModal.hide("modal-asignar-reposicion");
        this.initTiemposDeProduccion(); // Recargar datos de producción
      } catch (err) {
        this.$fire({
          title: "Error",
          html: `<p>No se pudo guardar la asignación.</p><p>${
            err.response?.data?.message || err.message
          }</p>`,
          type: "error",
        });
      } finally {
        this.assignOverlay = false;
      }
    },

    async confirmarEliminarReposicion(repo) {
      const confirm = await this.$bvModal.msgBoxConfirm(
        `¿Estás seguro de que deseas eliminar esta reposición de la Orden #${repo.id_orden}? Esta acción no se puede deshacer de forma directa.`,
        {
          title: 'Confirmar Eliminación',
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Sí, Eliminar',
          cancelTitle: 'Cancelar',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        }
      );
      if (confirm) {
        await this.eliminarReposicion(repo.id_reposicion);
      }
    },

    async eliminarReposicion(id_reposicion) {
      try {
        this.isLoading = true;
        await this.$axios.post(`${this.$config.API}/produccion/reposicion/eliminar`, {
          id_reposicion
        });
        this.$bvToast.toast('La reposición ha sido eliminada lógicamente con éxito.', {
          title: 'Eliminación Exitosa',
          variant: 'success',
          solid: true
        });
        await this.initTiemposDeProduccion();
      } catch (error) {
        console.error('Error al eliminar la reposición:', error);
        this.$bvToast.toast('Hubo un error al intentar eliminar la reposición.', {
          title: 'Error de Red',
          variant: 'danger',
          solid: true
        });
      } finally {
        this.isLoading = false;
      }
    },

    initTiemposDeProduccion() {
      this.isLoading = true;
      this.isProyeccionLoading = true; // Iniciamos ambas cargas
      this.hasNewData = false;
      this.toastShown = false;
      this.$bvToast.hide('new-data-toast');

      // 1. Cargamos los datos básicos de producción (rápido)
      this.loadOrdersProduction().then(() => {
        // Al terminar el primer bloque, forzamos reactividad para mostrar la lista
        this.refreshKey++;
        // NOTA: isLoading ya se pone en false dentro de loadOrdersProduction.finally()
        
        // 2. Iniciamos el proceso pesado en paralelo o diferido 
        // para que no bloquee los primeros renders
        setTimeout(() => {
           this.getOrdenesFechas().then(() => {
            // El cálculo también es pesado, lo hacemos en el siguiente tick
            setTimeout(() => {
                this.ordenesProyectadas2 = this.generarPlanProduccionCompleto(
                    this.fechas,
                    this.$store.state.login.dataEmpresa.horario_laboral
                );
                this.isProyeccionLoading = false;
            }, 0);
          }).catch(() => {
            this.isProyeccionLoading = false;
          });
        }, 300); // Pequeño margen para que el navegador respire
      });
    },

    async getOrdenesFechas() {
      this.isProyeccionLoading = true;
      // Limpiamos datos viejos para que los hijos vuelvan a estado de carga
      this.ordenesProyectadas2 = []; 
      
      await this.$axios
        .get(`${this.$config.API}/ordenes/proyeccion-entrega`)
        .then((res) => {
          this.fechas = res.data;
        })
        .catch((err) => {
          console.error("Error cargando proyecciones:", err);
          this.$bvToast.toast('No se pudieron sincronizar las proyecciones de entrega (endpoint pesado).', {
            title: "Advertencia",
            variant: "warning",
            solid: true,
          });
        })
        // No ponemos isProyeccionLoading=false aquí porque falta el procesamiento
    },

    async afterDrag(evt) {
      // Construir el lote con el nuevo orden por posición en el array
      const batch = this.items.map((dep, index) => ({
        id_orden: dep.orden,
        orden_fila: index + 1,
      }));

      this.isReordering = true;
      try {
        const res = await this.$axios.post(
          `${this.$config.API}/ordenes/actualizar-filas-batch`,
          batch,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (res.data && res.data.success) {
          // Refrescar datos del servidor una sola vez
          await this.loadOrdersProduction();
        } else {
          const msg = (res.data && res.data.message) || 'Error desconocido al guardar el orden.';
          this.$bvToast.toast(msg, {
            title: 'Error al reordenar',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Error al actualizar orden de filas:', error);
        this.$bvToast.toast('No se pudo guardar el nuevo orden. Verifique la conexión.', {
          title: 'Error al reordenar',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isReordering = false;
      }
    },

    async afterDragRep(evt) {
      // Construir el lote con el nuevo orden de reposiciones
      const batch = this.reposiciones_solicitadas.map((dep, index) => ({
        id_reposicion: dep.id_reposicion,
        orden_fila: index + 1,
      }));

      this.isReordering = true;
      try {
        const res = await this.$axios.post(
          `${this.$config.API}/reposiciones/actualizar-filas-batch`,
          batch,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (res.data && res.data.success) {
          // Solo refrescamos la lista de reposiciones (parte del mismo endpoint)
          await this.loadOrdersProduction();
        } else {
          const msg = (res.data && res.data.message) || 'Error desconocido al guardar el orden.';
          this.$bvToast.toast(msg, {
            title: 'Error al reordenar reposiciones',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Error al actualizar orden de reposiciones:', error);
        this.$bvToast.toast('No se pudo guardar el nuevo orden de reposiciones. Verifique la conexión.', {
          title: 'Error al reordenar',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isReordering = false;
      }
    },

    async afterDragRepCurso(evt) {
      // Construir el lote con el nuevo orden de reposiciones en curso
      const batch = this.reposiciones_en_curso.map((dep, index) => ({
        id_reposicion: dep.id_reposicion,
        orden_fila: index + 1,
      }));

      this.isReordering = true;
      try {
        const res = await this.$axios.post(
          `${this.$config.API}/reposiciones/actualizar-filas-batch`,
          batch,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (res.data && res.data.success) {
          await this.loadOrdersProduction();
        } else {
          const msg = (res.data && res.data.message) || 'Error desconocido al guardar el orden.';
          this.$bvToast.toast(msg, {
            title: 'Error al reordenar reposiciones en curso',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Error al actualizar orden de reposiciones en curso:', error);
        this.$bvToast.toast('No se pudo guardar el nuevo orden de reposiciones en curso. Verifique la conexión.', {
          title: 'Error al reordenar',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isReordering = false;
      }
    },

    productsFilter(id) {
      return this.products.filter((el) => el.id_orden == id);
    },

    showDesigner(designer) {
      this.$fire({
        title: designer,
        html: ``,
        type: "info",
      });
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },

    pActivo(id_orden) {
      return this.pactivos
        .filter((el) => el.id_orden == id_orden)
        .map((el) => {
          return el.departamento;
        });
    },

    filterVinculadas(id_orden) {
      return this.vinculadas
        .filter((el) => el.id_father == id_orden || el.id_child == id_orden)
        .map((el) => {
          // Si somos el padre, el vinculado es el hijo
          // Si somos el hijo, el vinculado es el padre
          return {
            id_child: el.id_father == id_orden ? el.id_child : el.id_father
          };
        });
    },
    filterOrdenProductos(id_orden) {
      return this.orden_productos.filter((el) => el.id_orden == id_orden);
    },

    filterLoteDetalles(id_orden) {
      return this.lote_detalles.filter((el) => el.id_orden == id_orden);
    },

    clearFilters() {
      this.filterOrden = "";
      this.filterCliente = "";
      this.filterEstatus = "";
    },

    toggleSection(key) {
      this[key] = !this[key];
      localStorage.setItem(key, this[key]);
    },

    async loadOrdersProduction() {
      await this.$axios
        .get(`${this.$config.API}/sse/produccion`)
        .then((res) => {
          this.items = res.data.items || [];
          this.empleadosAsignados = res.data.emp_asignados || [];
          this.por_asignar = res.data.por_asignar || [];
          this.ordenesLength =
            parseInt(res.data.items ? res.data.items.length : 0) + 1;
          this.pactivos = res.data.pactivos || [];
          this.vinculadas = res.data.vinculadas || [];
          this.products = res.data.productos || [];
          this.reposiciones_solicitadas =
            res.data.reposiciones_solicitadas || [];
          this.reposiciones_en_curso =
            res.data.reposiciones_en_curso || [];
          this.asignacion = res.data.asignacion || [];
          this.empleados = res.data.empleados || [];
          this.orden_productos = res.data.orden_productos || [];
          this.reposicion_ordenes_productos =
            res.data.reposicion_ordenes_productos || [];
          this.lote_detalles = res.data.lote_detalles || [];
          this.lotes_fisicos = res.data.lotes_fisicos || [];
          this.pasos = res.data.pasos || [];

          // 🆕 PRE-INDEXACIÓN: Crear mapa de órdenes con productos físicos
          const map = {};
          if (res.data.orden_productos) {
            res.data.orden_productos.forEach(p => {
              if (p.fisico == 1) {
                map[p.id_orden] = true;
              }
            });
          }
          this.physicalOrdersMap = map;
        })
        .catch((err) => {
          this.$bvToast.toast("No se pudieron cargar los datos de producción.", {
            title: "Error de Carga",
            variant: "danger",
            solid: true,
          });
          this.hasNewData = true; // Permitir reintentar
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },

  computed: {
    // --- COMPUTED ORIGINAL RESTAURADO ---
    totalRows() {
      return parseInt(this.ordenesLength) + 1;
    },

    isUserFiltering() {
      return (
        (this.filterOrden && this.filterOrden.trim().length > 0) ||
        (this.filterCliente && this.filterCliente.trim().length > 0) ||
        (this.filterEstatus && this.filterEstatus.trim().length > 0)
      );
    },

    selectEmpleados() {
      let tmp = this.empleados.map((item) => {
        return {
          value: item._id,
          text: item.nombre,
        };
      });
      tmp.unshift({ value: 0, text: "Seleccione un empleado" });
      return tmp;
    },

    selectDepartmentOptionsAssign() {
      if (!this.selectedEmployeeDepartmentsAssign || this.selectedEmployeeDepartmentsAssign.length === 0) {
        return [{ value: null, text: "Seleccione un departamento" }];
      }
      let options = this.selectedEmployeeDepartmentsAssign.map((dep) => {
        return {
          value: dep.id_departamento || dep.id,
          text: dep.departamento || dep.nombre_departamento || dep.nombre,
        };
      });
      options.unshift({ value: null, text: "Seleccione un departamento" });
      return options;
    },

    itemsFiltrados: {
      get() {
        if (!this.items.length || !this.orden_productos.length) {
          return [];
        }

        // 1. Filtrado base (Productos físicos) usando el mapa pre-indexado (O(1))
        let filtered = this.items.filter((order) => {
          return this.physicalOrdersMap[order.orden] === true;
        });

        // 2. Aplicar filtros de usuario si existen
        if (this.filterOrden) {
          const fOrden = this.filterOrden.toLowerCase();
          filtered = filtered.filter(item =>
            String(item.orden).toLowerCase().includes(fOrden)
          );
        }

        if (this.filterCliente) {
          const fCliente = this.filterCliente.toLowerCase();
          filtered = filtered.filter(item =>
            (item.cliente && item.cliente.toLowerCase().includes(fCliente))
          );
        }

        if (this.filterEstatus) {
          const fEstatus = this.filterEstatus.toLowerCase();
          filtered = filtered.filter(item =>
            (item.estatus && item.estatus.toLowerCase().includes(fEstatus))
          );
        }

        return filtered;
      },
      set(reorderedItems) {
        // ... (resto del set igual)
        // Si el usuario está filtrando, NO permitimos reordenar (aunque el drag se haya disparado)
        // Esto es una medida de seguridad adicional, aunque el UI debería estar bloqueado.
        if (this.isUserFiltering) {
          return;
        }

        // 1. Obtenemos los items que no son físicos usando el mapa pre-indexado (O(1))
        const itemsNoFisicos = this.items.filter((order) => {
          return this.physicalOrdersMap[order.orden] !== true;
        });

        // 2. Concatenamos la lista reordenada con los no físicos al final.
        this.items = [...reorderedItems, ...itemsNoFisicos];
      },
    },

    buttonState() {
      if (this.isLoading) {
        return {
          variant: 'info',
          text: 'Cargando...',
          disabled: true,
        };
      }
      if (this.hasNewData) {
        return {
          variant: 'success',
          text: 'Recargar para ver cambios',
          disabled: false,
        };
      }
      return {
        variant: 'primary',
        text: 'Recargar',
        disabled: false,
      };
    },

    // 🆕 COMPUTED PARA RENDERIZADO INCREMENTAL
    itemsMostrados() {
      return this.itemsFiltrados.slice(0, this.visibleOrders);
    }
  },

  mounted() {
    if (localStorage.getItem('isReposicionesAsignarVisible') !== null) {
      this.isReposicionesAsignarVisible = localStorage.getItem('isReposicionesAsignarVisible') === 'true';
    }
    if (localStorage.getItem('isReposicionesCursoVisible') !== null) {
      this.isReposicionesCursoVisible = localStorage.getItem('isReposicionesCursoVisible') === 'true';
    }
    if (localStorage.getItem('isOrdenesCursoVisible') !== null) {
      this.isOrdenesCursoVisible = localStorage.getItem('isOrdenesCursoVisible') === 'true';
    }

    this.initTiemposDeProduccion();
    this.intervaloRecargaDatos = setInterval(() => {
      if (this.activeModalCount === 0) {
        this.checkForUpdates();
      }
    }, 60000);

    // 🆕 INTERSECTION OBSERVER PARA CARGA INCREMENTAL
    this.$nextTick(() => {
      const sentinel = document.getElementById('infinite-scroll-sentinel');
      if (sentinel) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && !this.isLoading) {
            if (this.itemsMostrados.length < this.itemsFiltrados.length) {
              console.log('📥 Cargando bloque de 10 órdenes adicionales...');
              this.visibleOrders += 10;
            }
          }
        }, { threshold: 0.1 });
        observer.observe(sentinel);
        this.scrollObserver = observer;
      }
    });
  },

  beforeDestroy() {
    clearInterval(this.intervaloRecargaDatos);
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
  },

  watch: {
    // 🆕 RESETEAR PAGINACIÓN AL FILTRAR
    filterOrden() { this.visibleOrders = 10; },
    filterCliente() { this.visibleOrders = 10; },
    filterEstatus() { this.visibleOrders = 10; },

    "assignRepForm.emp": function (newEmpId) {
      this.assignRepForm.id_departamento = null;
      this.selectedEmployeeDepartmentsAssign = [];
      if (newEmpId && newEmpId !== 0) {
        this.fetchEmployeeDepartmentsAssign(newEmpId);
      }
    },
  },

  mixins: [mixin, mixin3],
};
</script>

<style scoped>
.section-header {
  background: linear-gradient(90deg, rgba(55, 90, 127, 0.3) 0%, rgba(55, 90, 127, 0.02) 100%);
  border-left: 5px solid #4e5d6c;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.section-header:hover {
  background: linear-gradient(90deg, rgba(55, 90, 127, 0.5) 0%, rgba(55, 90, 127, 0.08) 100%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}

.section-accent-line {
  margin-right: 12px;
}

.bg-warning-accent {
  border-left: 5px solid #f39c12 !important;
}

.bg-info-accent {
  border-left: 5px solid #3498db !important;
}

.bg-success-accent {
  border-left: 5px solid #00bc8c !important;
}

.section-title {
  font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.5px;
  color: #2c3e50;
  transition: color 0.3s ease;
}

[data-bs-theme="dark"] .section-title {
  color: #ffffff;
}

.section-header:hover .section-title {
  color: #1a252f;
}

[data-bs-theme="dark"] .section-header:hover .section-title {
  color: #ffffff;
}

.count-badge {
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.section-header:hover .count-badge {
  transform: scale(1.1);
}

.chevron-icon {
  font-size: 1.2rem;
  color: #5d6d7e;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s ease;
}

[data-bs-theme="dark"] .chevron-icon {
  color: #aebbc9;
}

.section-header:hover .chevron-icon {
  color: #1a252f;
}

[data-bs-theme="dark"] .section-header:hover .chevron-icon {
  color: #ffffff;
}

.chevron-icon.rotated {
  transform: rotate(-90deg);
}

.float-me {
  float: left;
  margin-right: 4px;
  margin-top: 4px;
}

/* .reposiciones-grid-container {
  display: grid;
  grid-template-columns: auto auto auto auto 1fr;
} */
/* Nueva grilla para reposiciones */
/* Reposiciones: misma grilla de 10 columnas que Ordenes en curso */
.list-group-header-reposiciones {
  display: grid;
  grid-template-columns: 50px 0.8fr 3fr 60px 340px 160px 70px 100px 80px 90px;
  background-color: #375a7f;
  border: 1px solid #4e5d6c;
  border-bottom: 2px solid #00bc8c;
  padding: 0.75rem 0;
  font-weight: 600;
  margin-bottom: 0;
}

.list-group-reposiciones {
  display: grid;
  grid-template-columns: 50px 0.8fr 3fr 60px 340px 160px 70px 100px 80px 90px;
  padding: 0;
  margin: 0;
}

/* Reposiciones en curso: grilla compacta de 8 columnas */
.list-group-header-reposiciones-curso {
  display: grid;
  grid-template-columns: 50px 0.8fr 3.5fr 60px 340px 160px 80px 120px;
  background-color: #375a7f;
  border: 1px solid #4e5d6c;
  border-bottom: 2px solid #00bc8c;
  padding: 0.75rem 0;
  font-weight: 600;
  margin-bottom: 0;
}

.list-group-reposiciones-curso {
  display: grid;
  grid-template-columns: 50px 0.8fr 3.5fr 60px 340px 160px 80px 120px;
  padding: 0;
  margin: 0;
}

.list-group-reposiciones-curso .list-group-item {
  padding: 0.5rem 0.5rem;
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-bottom: 1px solid #4e5d6c;
}

.list-group-reposiciones .list-group-item {
  padding: 0.5rem 0.5rem;
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-bottom: 1px solid #4e5d6c;
}

/* Cabecera de la tabla list-group */
.list-group-header {
  display: grid;
  grid-template-columns: 50px 0.8fr 3fr 60px 340px 160px 70px 100px 80px 90px;
  background-color: #375a7f;
  border: 1px solid #4e5d6c;
  border-bottom: 2px solid #00bc8c;
  padding: 0.75rem 0;
  font-weight: 600;
  margin-bottom: 0;
}

.list-group-header-item {
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  color: #fff;
}

.list-group-draggable {
  display: grid;
  /* Define 10 columnas: Handle, Orden, Cliente, Unidades, Progreso, Entrega, Vinculada, Estatus, Detalles, Acciones */
  grid-template-columns: 50px 0.8fr 3fr 60px 340px 160px 70px 100px 80px 90px;
  /* Ajusta las columnas según necesites. '1fr' para la columna de cliente que tomará el espacio restante */
  padding: 0;
  margin: 0;
}

.list-group-draggable .list-group-item {
  padding: 0.5rem 0.5rem;
  /* Reducir padding predeterminado de Bootstrap para mejor densidad */
  border: none;
  background-color: transparent;
  /* Importante si hay fondo en filas alternas */
  display: flex;
  align-items: center;
  /* Centrar contenido verticalmente */
  overflow: hidden;
  /* Evitar desbordes */
  border-bottom: 1px solid #4e5d6c;
  /* Simula el borde de la fila */
}

/* Handle de arrastre */
.drag-handle-zone {
  user-select: none;
  touch-action: none;
}

@media (max-width: 1350px) {

  /* Ocultar cabeceras en móvil */
  .list-group-header {
    display: none;
  }

  /* Transformar la fila en tarjeta */
  .list-group-draggable {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    /* Borde suave claro */
    margin-bottom: 1rem;
    background-color: #fff;
    /* Fondo blanco */
    border-radius: 8px;
    /* Bordes redondeados */
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    /* Sombra sutil */
  }

  /* Estilar cada celda como una fila de la tarjeta */
  .list-group-draggable .list-group-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    /* Separador muy sutil */
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    /* Permitir que el contenido baje si es necesario */
    width: 100%;
    /* Ocupar todo el ancho */
    min-height: 50px;
    /* Altura mínima para facilidad táctil */
    color: #333;
    /* Texto oscuro */
  }

  /* Quitar borde del último item */
  .list-group-draggable .list-group-item:last-child {
    border-bottom: none;
  }

  /* Mostrar etiquetas usando data-label */
  .list-group-draggable .list-group-item::before {
    content: attr(data-label);
    font-weight: bold;
    color: #00bc8c;
    /* Verde del tema (se mantiene bien) */
    margin-right: auto;
    /* Empujar el contenido a la derecha */
    padding-right: 1rem;
    display: block;
    /* Asegurar que se comporte bien */
  }

  /* Excepciones */

  /* Handle: Ocultar o mostrar diferente */
  .list-group-draggable .list-group-item:first-child {
    background-color: #375a7f;
    /* Color de cabecera manteniendo identidad */
    justify-content: center;
    padding: 0.5rem;
    color: white;
  }

  .list-group-draggable .list-group-item:first-child::before {
    display: none;
    /* No mostrar label para el handle */
  }

  /* Progreso: Dar más espacio */
  .list-group-draggable .list-group-item[data-label="Progreso"] {
    flex-direction: column;
    align-items: stretch;
    /* Ocupar todo el ancho */
  }

  .list-group-draggable .list-group-item[data-label="Progreso"]::before {
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
    width: 100%;
    padding-bottom: 0.25rem;
  }

  /* Cliente: Resaltar */
  .list-group-draggable .list-group-item[data-label="Cliente"] {
    font-size: 1.1em;
    font-weight: bold;
    background-color: #f8f9fa;
    /* Gris muy claro para resaltar */
  }

  /* REPOSICIONES MOBILE — misma estructura que ordenes */
  .list-group-header-reposiciones,
  .list-group-header-reposiciones-curso {
    display: none;
  }

  .list-group-reposiciones,
  .list-group-reposiciones-curso {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    margin-bottom: 1rem;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .list-group-reposiciones .list-group-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
    min-height: 50px;
    color: #333;
  }

  /* Quitar borde del último item */
  .list-group-reposiciones .list-group-item:last-child {
    border-bottom: none;
  }

  .list-group-reposiciones .list-group-item::before {
    content: attr(data-label);
    font-weight: bold;
    color: #00bc8c;
    margin-right: auto;
    padding-right: 1rem;
    display: block;
  }

  /* Handle: Estilo de cabecera */
  .list-group-reposiciones .list-group-item:first-child {
    background-color: #375a7f;
    justify-content: center;
    padding: 0.5rem;
    color: white;
  }

  .list-group-reposiciones .list-group-item:first-child::before {
    display: none;
  }

  /* Producto: Dar más espacio */
  .list-group-reposiciones .list-group-item[data-label="Producto"] {
    flex-direction: column;
    align-items: stretch;
  }

  .list-group-reposiciones .list-group-item[data-label="Producto"]::before {
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
    width: 100%;
    padding-bottom: 0.25rem;
  }

  /* Interacción / Asignación: Resaltar como el cliente en ordenes */
  .list-group-reposiciones .list-group-item[data-label="Interacción"],
  .list-group-reposiciones .list-group-item[data-label="Asignación"] {
    font-size: 1.1em;
    font-weight: bold;
    background-color: #f8f9fa;
  }
}
</style>