<template>
  <div style="display: inline-flex; gap: 0.5rem; align-items: center;">
    <span style="display: none;">
      <b-button @click="$bvModal.show(modal)" variant="success" :disabled="ButtonDisabled"
        data-testid="btn-terminar-todo">{{ btnText }}</b-button>
    </span>

    <!-- Pausas -->
    <span style="display: inline-block;">
      <empleados-pausasEmpleados :pausas="filterPausa(item.orden)" :pausasRaw="pausas" :item="$props.item"
        @reload="reloadMe" @disBtnTodo="disBtnTodo" />
    </span>

    <b-modal :id="modal" :title="title" hide-footer size="lg" data-testid="modal-datos-extra"
      @shown="cargarNotasAnteriores">
      <b-overlay :show="overlay" spinner-small>

        <!-- Información de contexto de la orden -->
        <b-card class="mb-4" bg-variant="light" data-testid="info-contexto-orden">
          <b-row>
            <b-col cols="12" md="8">
              <div v-if="infoProducto" class="mb-1"><strong>Producto:</strong> {{ infoProducto }}
                <span v-if="item && item.talla"> — Talla: {{ item.talla }}</span>
              </div>
              <div v-if="infoCliente" class="mb-1"><strong>Cliente:</strong> {{ infoCliente }}</div>
              <div v-if="infoCantidad !== null" class="mb-1"><strong>Cantidad:</strong> {{ infoCantidad }}</div>
              <div v-if="item && item.fecha_entrega" class="mb-1">
                <!-- fecha_entrega ya llega formateada como DD-MM-YYYY desde el backend -->
                <strong>Fecha de entrega:</strong> {{ item.fecha_entrega }}
              </div>
              <div v-if="esreposicion && item && item.detalle_reposicion" class="mb-1">
                <strong>Detalle de la reposición:</strong> {{ item.detalle_reposicion }}
              </div>
            </b-col>
            <b-col cols="12" md="4" class="text-md-right">
              <b-badge v-if="infoEsUrgente" variant="danger" class="mb-2 p-2">URGENTE</b-badge>
              <div v-if="infoTiempoEstimadoMin !== null">
                Estimado: {{ infoTiempoEstimadoMin }} min
              </div>
              <div v-if="infoTiempoTranscurridoMin !== null" :class="infoVaAtrasado ? 'text-danger' : 'text-success'">
                Transcurrido: {{ infoTiempoTranscurridoMin }} min
              </div>
            </b-col>
          </b-row>

          <div v-if="cargandoNotas" class="mt-3">
            <b-spinner small></b-spinner> Buscando notas de departamentos anteriores...
          </div>
          <div v-else-if="notasAnteriores.length" class="mt-3">
            <strong>Notas de departamentos anteriores:</strong>
            <div v-for="(nota, idx) in notasAnteriores" :key="idx" class="mt-1">
              <b-badge variant="secondary">{{ nota.departamento }}</b-badge>
              <span class="ml-1">({{ nota.empleado }}): {{ nota.nota }}</span>
            </div>
          </div>
        </b-card>

        <!-- Alerta cuando faltan impresoras o insumos -->
        <b-alert v-if="$store.getters['login/currentDepartamentTipo'] === 'impresion' && !puedeUsarModalImpresion" show
          variant="warning" class="mb-4">
          <h5 class="alert-heading">
            <b-icon icon="exclamation-triangle"></b-icon>
            {{ !hayImpresoras ? 'No hay impresoras configuradas' : 'No hay insumos de impresión disponibles' }}
          </h5>
          <div class="mb-0">
            <p v-if="!hayImpresoras">
              No se pueden asignar tintas porque no existen impresoras configuradas en el sistema.
              Contacte al administrador para configurar las impresoras.
            </p>
            <p v-if="!hayInsumosImpresion">
              No se pueden asignar tintas porque no existen insumos de impresión disponibles en el inventario.
              Contacte al administrador para agregar insumos de impresión.
            </p>
          </div>
        </b-alert>

        <!-- Formulario de Impresión -->
        <!-- <div
                    v-if="
                        $store.state.login.currentDepartament === 'Impresión' ||
                        $store.state.login.currentDepartament === 'Estampado' ||
                        $store.state.login.currentDepartament === 'Corte' ||
                        $store.state.login.currentDepartament ===
                            'Corte de papel' ||
                        $store.state.login.currentDepartament === 'Costura' ||
                        $store.state.login.currentDepartament === 'Limpieza' ||
                        $store.state.login.currentDepartament === 'Revisión'
                    "
                > -->
        <b-form @reset="onReserForm">
          <div v-if="$store.getters['login/currentDepartamentTipo'] === 'impresion'">
            <!-- Iteración sobre impresoras seleccionadas -->
            <b-card v-for="(impresora, index) in impresorasSeleccionadas" :key="impresora.id" class="mb-3"
              :header="'Impresora ' + (index + 1)" header-bg-variant="light">
              <template #header>
                <div class="d-flex justify-content-between align-items-center">
                  <span><strong>Impresora {{ index + 1 }}</strong></span>
                  <b-button v-if="impresorasSeleccionadas.length > 1" variant="danger" size="sm"
                    @click="removeImpresora(index)" aria-label="Eliminar impresora">
                    <b-icon icon="trash"></b-icon>
                  </b-button>
                </div>
              </template>


              <b-form-group label="Impresora Utilizada" :label-for="'impresora-select-' + index">
                <b-form-select :id="'impresora-select-' + index" v-model="impresora.id_impresora"
                  :options="getImpresorasOptionsForIndex(index)" :disabled="!puedeUsarModalImpresion"
                  required></b-form-select>
              </b-form-group>

              <!-- Tintas dinámicas según canales_colores de la impresora (solo si la impresora está en modo manual) -->
              <template v-if="esModoManualForIndex(index)">
                <b-row v-if="getCanalesForIndex(index).length > 0">
                  <b-col v-for="canal in getCanalesForIndex(index)" :key="canal.codigo">
                    <b-form-group :label="canal.codigo">
                      <b-form-input
                        :id="'input-canal-' + index + '-' + canal.codigo"
                        v-model="impresora.canales[canal.codigo]"
                        type="number" step="0.1" min="0"
                        :disabled="!puedeUsarModalImpresion || impresora.id_impresora === null"
                        :style="{ backgroundColor: canal.color_hex || '#cccccc', color: getContrastColor(canal.color_hex), fontWeight: 'bold' }"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-alert v-else-if="impresora.id_impresora !== null" show variant="warning" class="mt-2">
                  Esta impresora no tiene canales de color configurados.
                </b-alert>
              </template>
              <b-alert v-else-if="impresora.id_impresora !== null" show variant="info" class="mt-2">
                Esta impresora está en modo automático: no se requiere ingresar ml de tinta manualmente.
              </b-alert>

              <small v-if="tintaEstimadaMlForIndex(index)" class="text-muted d-block mt-2">
                <b-icon icon="info-circle"></b-icon>
                Tinta Estimada (Sistema): {{ tintaEstimadaMlForIndex(index) }} ml
              </small>
            </b-card>

            <!-- Botón para añadir impresora -->
            <b-button variant="outline-primary" size="sm" class="mb-3"
              :disabled="!puedeAnadirImpresora || todasImpresorasSeleccionadas" @click="addImpresora">
              <b-icon icon="plus-lg"></b-icon> Añadir Impresora
            </b-button>

            <!-- Alerta cuando todas las impresoras están seleccionadas -->
            <b-alert v-if="todasImpresorasSeleccionadas && impresorasSeleccionadas.length > 0" show variant="info"
              class="mb-3">
              Ha seleccionado todas las impresoras disponibles.
            </b-alert>
          </div>

          <!-- <div v-if="$store.state.login.currentDepartament === 'Corte'">
            <b-form-group label="Peso del desperdicio en kilos" label-for="desperdicio-corte">
              <b-form-input
                id="desperdicio-corte"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ingrese el peso del desperdicio"
                required
              />
            </b-form-group>
          </div> -->


          <!-- MOSTRAR CANTIDAD DE MATERIAL UTILIZADO (PARA TODOS LOS DEPARTAMENTOS CONFIGURADOS) -->
          <div v-if="showSelect" class="mb-4">
            <h5><strong>📊 Resumen de Material</strong></h5>

             <b-card bg-variant="light" class="mb-3">
              <!-- Material Estimado (desglosado por catálogo si hay múltiples insumos) -->
              <div v-if="materialEstimadoPorCatalogo.length === 1">
                <p class="mb-2">
                  <strong>Material Estimado (Sistema):</strong>
                  {{ materialEstimadoPorCatalogo[0].total }} {{ materialEstimadoPorCatalogo[0].unidad }}
                  ({{ materialEstimadoPorCatalogo[0].catalogo }})
                </p>
              </div>
              <div v-else-if="materialEstimadoPorCatalogo.length > 1">
                <p class="mb-2"><strong>Material Estimado (Sistema):</strong></p>
                <ul class="mb-2">
                  <li v-for="(item, index) in materialEstimadoPorCatalogo" :key="index">
                    {{ item.total }} {{ item.unidad }} ({{ item.catalogo }})
                  </li>
                </ul>
              </div>
              <!-- Mostrar mensaje cuando no hay datos -->
              <div v-else>
                <p class="mb-2">
                  <strong>Material Estimado (Sistema):</strong>
                  <span class="text-muted">No hay datos de insumos disponibles</span>
                </p>
              </div>

              <!-- Material Utilizado y Eficiencia -->
              <div>
                <p class="mb-2">
                  <strong>Material Utilizado:</strong>
                  {{ materialUtilizado }} {{ materialEstimadoDepartamento.unidad }}
                </p>

                <p v-if="parseFloat(materialUtilizado) > 0" class="mb-0">
                  <strong>Eficiencia:</strong>
                  <span :class="eficienciaPorcentaje >= 100 ? 'text-success' : 'text-danger'">
                    {{ eficienciaPorcentaje }}%
                  </span>
                  <small class="text-muted">({{ eficienciaPorcentaje >= 100 ? 'Óptimo' : 'Por debajo del estimado'
                  }})</small>
                </p>
              </div>
            </b-card>
          </div>

          <!-- MUESTRA ROLLOS DE MATEERIAL SI ESTA EN CONFIGURACION -->
          <div v-if="showSelect">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0 text-muted font-weight-bold">
                <b-icon icon="layers-half"></b-icon> Asignación de Materiales
              </h5>
              <b-button v-if="dataInsumosFiltradoEstricto.length > 0" variant="outline-primary" @click="addItem" pill size="sm">
                <b-icon icon="plus-circle-fill"></b-icon> Añadir Material
              </b-button>
            </div>

            <b-alert v-if="dataInsumosFiltradoEstricto.length === 0" show variant="info" class="mb-0">
              <b-icon icon="info-circle" class="mr-1"></b-icon>
              Este departamento no tiene materiales asignados para los productos de esta orden.
            </b-alert>

            <div v-if="getCatalogosUnicos.length > 0" v-for="(itemForm, index) in form" :key="index"
              class="mb-3 p-3 border rounded bg-white shadow-sm position-relative">
              <b-row class="align-items-start no-gutters">
                <b-col md="4" class="px-2">
                  <b-form-group label="Material" label-size="sm" class="mb-0">
                    <!-- Visualización para Insumos Precargados (Escenario 1) -->
                    <div v-if="itemForm.precargado" class="p-2 border rounded bg-light small shadow-sm">
                      <b-icon icon="info-circle-fill" variant="info" class="mr-1"></b-icon>
                      <strong class="text-dark">{{ itemForm.insumoNombre }}</strong><br />
                      <span class="text-muted">ID: <strong>{{ itemForm.idInsumo }}</strong> | SKU: {{ itemForm.sku }}</span>
                      <span class="badge badge-info ml-1">Consumido en Estampado</span>
                    </div>

                    <!-- Buscador Original (Escenario 2) -->
                    <template v-else>
                      <!-- Eficiencia de Insumo -->
                      <empleados-eficienciaInsumos v-if="itemForm.validInsumo && getCatalogosUnicos.length > 0" class="mb-1" :idorden="idorden"
                        :idinsumo="getId(itemForm.select)" :datainsumos="getCatalogosUnicos"
                        @update_catalogo="updateCatalogo(index, $event)" />

                      <vue-typeahead-bootstrap @hit="loadInsumos(index)" :data="dataSearchInsumo" size="sm"
                        v-model="itemForm.select" placeholder="Buscar Insumo" @input="itemForm.validInsumo = false" />
                    </template>
                  </b-form-group>
                </b-col>

                <b-col md="3" class="px-2">
                  <b-form-group
                    :label="getPlaceholderRow(index)"
                    :description="descripcionCantidadRow(index)"
                    label-size="sm"
                    class="mb-0"
                  >
                    <b-form-input
                      v-model.number="itemForm.input"
                      type="number"
                      step="0.01"
                      min="0"
                      :readonly="itemForm.precargado"
                      :state="$store.getters['login/currentDepartamentTipo'] === 'corte' ? (itemForm.input >= 0 && itemForm.input !== '') : itemForm.input > 0"
                      :placeholder="getUnidadRow(index)"
                      required
                    />
                  </b-form-group>
                </b-col>

                <b-col md="5" class="px-2" v-if="needsDesperdicio(index)">
                  <label class="small font-weight-bold text-danger mb-1">Desperdicio</label>
                  <div style="display:flex; align-items:flex-start; gap:8px;">
                    <div style="flex:1; min-width:0;">
                      <b-form-input v-model.number="itemForm.desperdicio" type="number" step="0.01" min="0"
                        class="border-danger" placeholder="0.00" required></b-form-input>
                      <small class="text-muted d-block mt-1" style="font-size: 0.75rem; line-height: 1.15;">
                        Ingresa el desperdicio en Kilos. NO en gramos.
                      </small>
                    </div>
                    <div style="flex-shrink:0; white-space:nowrap; margin-top: 6px;">
                      <b-form-checkbox v-model="itemForm.terminar" :disabled="!itemForm.validInsumo || itemForm.precargado"
                        class="small font-weight-bold text-danger">
                        Terminar
                      </b-form-checkbox>
                    </div>
                    <b-button v-if="form.length > 1 && !itemForm.precargado" variant="link" class="text-danger p-0" title="Eliminar fila"
                      @click="removeItem(index)" style="flex-shrink:0; margin-top: 6px;">
                      <b-icon icon="trash-fill" font-scale="1.2"></b-icon>
                    </b-button>
                  </div>
                </b-col>

                <b-col md="2" class="px-2 pb-1 d-flex align-items-start justify-content-between" v-if="!needsDesperdicio(index)">
                  <b-form-checkbox v-model="itemForm.terminar" :disabled="!itemForm.validInsumo || itemForm.precargado"
                    class="small font-weight-bold text-danger">
                    Terminar
                  </b-form-checkbox>
                  <b-button v-if="form.length > 1 && !itemForm.precargado" variant="link" class="text-danger p-0" title="Eliminar fila"
                    @click="removeItem(index)">
                    <b-icon icon="trash-fill" font-scale="1.2"></b-icon>
                  </b-button>
                </b-col>
              </b-row>

              <div v-if="itemForm.validInsumo" class="mt-2 px-1">
                <small class="text-muted">
                  <b-icon icon="check-circle-fill" variant="success"></b-icon> Insumo validado correctamente
                </small>
              </div>

              <!-- Alerta poka-yoke: confusión kg vs metros en tela -->
              <b-alert
                v-if="warningCantidadTela(index)"
                show
                variant="warning"
                class="mt-2 mb-0 py-2 small"
              >
                <template v-if="warningCantidadTela(index).tipo === 'kg_coincidence'">
                  <b-icon icon="exclamation-triangle-fill" class="mr-1"></b-icon>
                  <strong>¿Estás ingresando el peso del rollo?</strong>
                  Este campo espera <strong>metros de tela usados</strong>, no kilos.
                  Si consumiste <strong>{{ warningCantidadTela(index).kg }} kg</strong> de tela,
                  eso equivale a <strong>{{ warningCantidadTela(index).metros_equivalentes }} metros</strong>
                  (rendimiento: {{ warningCantidadTela(index).rendimiento }} mts/kg).
                </template>
                <template v-else-if="warningCantidadTela(index).tipo === 'alto_vs_estimado'">
                  <b-icon icon="exclamation-triangle-fill" class="mr-1"></b-icon>
                  <strong>Consumo inusualmente alto:</strong>
                  ingresaste <strong>{{ itemForm.input }} mts</strong>,
                  el sistema estimaba <strong>{{ warningCantidadTela(index).estimado }} mts</strong>
                  ({{ warningCantidadTela(index).porcentaje }}% del estimado).
                  Verifica que estás midiendo la tela <em>usada en esta orden</em>, no el rollo completo.
                </template>
              </b-alert>
            </div>
          </div>

          <b-button
            :disabled="ButtonDisabled || ($store.getters['login/currentDepartamentTipo'] === 'impresion' && !puedeUsarModalImpresion)"
            @click="validateForm" variant="primary" data-testid="btn-enviar-datos-extra">Enviar</b-button>
          <b-button
            :disabled="ButtonDisabled || ($store.getters['login/currentDepartamentTipo'] === 'impresion' && !puedeUsarModalImpresion)"
            type="reset" variant="danger" data-testid="btn-borrar-datos-extra">Borrar</b-button>
        </b-form>
      </b-overlay>
    </b-modal>


    <!-- Modal para Batch Finish -->
    <!-- Modal para Batch Finish (Solo Confirmación) -->
    <b-modal :id="`modal-terminar-batch-${idorden}`" title="Confirmar Terminación de Materiales"
      @ok="handleBatchTerminarConfirm" ok-title="Confirmar y Terminar" ok-variant="danger" cancel-title="Cancelar">
      <p class="mb-3">Se procederá a terminar los siguientes insumos. <strong>El inventario restante se guardará
          automáticamente como remanente.</strong></p>

      <ul class="list-group">
        <li v-for="(item, idx) in batchItems" :key="idx"
          class="list-group-item d-flex justify-content-between align-items-center">
          {{ item.insumoName }}
          <span class="badge badge-primary badge-pill">ID {{ item.idInsumoClean }}</span>
        </li>
      </ul>

      <p class="mt-3 text-muted small">Esta acción pondrá el stock en 0 y cerrará el uso del material.</p>
    </b-modal>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

const eficienciaOrdenCacheModal = {};

export default {
  mixins: [mixin],
  data() {
    return {
      esReposicion: null,
      queryInsumo: "",
      title: `Datos Extra ${this.$store.state.login.currentDepartament}`,
      notasAnteriores: [],
      cargandoNotas: false,
      overlay: false,
      btnText: "Terminar",
      ButtonDisabled: false,
      form: [],
      insumos: [],
      dataInsumosLocal: [], // Insumos cargados del API localmente
      eficienciaEstimada: 0,
      // materialUtilizado: 0,
      fields: {},
      eficienciaDetalles: [],
      remanenteInput: 0,
      selectedIndexToFinish: null,
      batchItems: [],
      showSelect: false,
      formEst: {
        input: 0,
      },
      formCor: {
        input: 0,
      },
      // Array para múltiples impresoras (canales dinámicos)
      impresorasSeleccionadas: [
        { id: 1, id_impresora: null, canales: {} }
      ],
      campos: [
        { key: "input", label: "" },
        { key: "id", label: "" },
      ],
      // Mapa de colores para inputs de tinta
      colorMap: {
        c: '#00FFFF',    // Cyan
        m: '#FF00FF',    // Magenta
        y: '#FFFF00',    // Yellow
        k: '#343A40',    // Black
        w: '#F8F9FA',    // White
      },
    };
  },

  computed: {
    placeholderInput() {
      return 'Cantidad de Material utilizado';
    },

    // --- Datos Extra: información de contexto de la orden (item viene con
    // nombres de campo distintos según sea tarea principal o reposición) ---
    infoProducto() {
      return this.item?.producto || this.item?.nombre_producto || '';
    },
    infoCliente() {
      return this.item?.cliente || '';
    },
    infoCantidad() {
      return this.item?.unidades ?? this.item?.piezas_actuales ?? this.item?.unidades_solicitadas ?? null;
    },
    infoEsUrgente() {
      return parseInt(this.item?.prioridad) > 0;
    },
    infoTiempoEstimadoMin() {
      const segundos = parseFloat(this.item?.tiempo_produccion);
      return segundos > 0 ? Math.round(segundos / 60) : null;
    },
    infoTiempoTranscurridoMin() {
      if (!this.item?.fecha_inicio) return null;
      const inicio = new Date(this.item.fecha_inicio.replace(' ', 'T'));
      if (isNaN(inicio.getTime())) return null;
      const minutos = (Date.now() - inicio.getTime()) / 60000;
      return minutos >= 0 ? Math.round(minutos) : null;
    },
    infoVaAtrasado() {
      if (this.infoTiempoEstimadoMin === null || this.infoTiempoTranscurridoMin === null) return false;
      return this.infoTiempoTranscurridoMin > this.infoTiempoEstimadoMin;
    },

    getUnidadRow() {
      return (index) => {
        const item = this.form[index];
        if (!item || !item.select) return '';

        // Parsear ID desde el string del typeahead "ID | Nombre ..."
        const parts = item.select.split('|');
        if (parts.length > 0) {
          const id = parseInt(parts[0].trim());
          const insumo = this.insumosTodos.find(i => i._id == id);
          if (insumo) {
            return insumo.tipo_insumo === 'tela' ? 'Metros' : insumo.unidad;
          }
        }
        return '';
      }
    },

    getPlaceholderRow() {
      return (index) => {
        const unidad = this.getUnidadRow(index);
        return unidad ? `Cantidad (${unidad})` : 'Cantidad';
      };
    },

    needsDesperdicio() {
      return (index) => {
        const itemForm = this.form[index];
        if (!itemForm || !itemForm.validInsumo) return false;

        // Si es Corte, SIEMPRE pedimos desperdicio
        if (this.$store.getters['login/currentDepartamentTipo'] === 'corte') return true;
        
        // El usuario solicitó que la caja de desperdicio se muestre SÓLO cuando
        // ha hecho click en el botón que selecciona el catálogo (itemForm.idCatalogo)
        if (itemForm.idCatalogo) {
          // Buscamos a qué producto pertenece este catálogo
          const matchingAssignment = this.dataInsumosFiltrado.find(d => d.id_catalogo_insumos_productos == itemForm.idCatalogo);
          if (matchingAssignment) {
            const idProduct = matchingAssignment.id_product;
            // Buscamos si ese producto tiene usa_desperdicio=1 en el departamento actual
            let prodDesperdicio = false;
            
            if (this.items && Array.isArray(this.items)) {
              const prod = this.items.find(p => p.id_woo == idProduct);
              if (prod && prod.usa_desperdicio == 1) prodDesperdicio = true;
            } else if (this.item) {
              if (this.item.id_woo == idProduct && this.item.usa_desperdicio == 1) prodDesperdicio = true;
            }
            
            return prodDesperdicio;
          } else {
            // Fallback si no hay matching explícito
            let fallback = false;
            if (this.items && Array.isArray(this.items) && this.items.some(el => el.usa_desperdicio == 1)) fallback = true;
            else if (this.item && this.item.usa_desperdicio == 1) fallback = true;
            return fallback;
          }
        }
        
        return false;
      };
    },

    // Combina datos del prop y datos locales, priorizando datos para la orden actual
    dataInsumosComputed() {
      // El prop contiene insumos de TODAS las órdenes. Filtrar solo los de esta orden.
      const fromProp = (this.dataInsumos || []).filter(item => item.id_orden == this.idorden);
      if (fromProp.length > 0) return fromProp;
      // Si el prop no tiene datos para esta orden, usar los cargados localmente
      return this.dataInsumosLocal;
    },

    dataInsumosFiltrado() {
      const depName = this.$store.state.login.currentDepartament;
      const depId = this.$store.state.login.currentDepartamentId;

      const result = this.dataInsumosComputed.filter((el) => {
        const isSameOrder = el.id_orden == this.idorden;
        if (!isSameOrder) return false;

        // Si es el mismo departamento (por Nombre o por ID), incluir
        let isStrictDepto = false;
        if (depName && el.departamento && el.departamento === depName) {
          isStrictDepto = true;
        } else if (depId && el.id_departamento && parseInt(el.id_departamento) === parseInt(depId)) {
          isStrictDepto = true;
        }

        if (isStrictDepto) return true;

        // Hermandad: Estampado y Corte deben ver los materiales asignados como 'tela' sin importar el departamento asignado
        const currentTipo = this.$store.getters['login/currentDepartamentTipo'];
        const elTipo = this.getDeptTipoById(el.id_departamento);
        if (
          (['corte', 'estampado'].includes(currentTipo)) &&
          (el.tipo_insumo === "tela" || el.catalogo?.toLowerCase().includes("tela")) &&
          elTipo !== "impresion" &&
          !el.catalogo?.toLowerCase().includes("papel")
        ) {
          return true;
        }

        // Hermandad: Revisión y Limpieza heredan de "Producción"
        if (
            (depName === "Revisión" || depName === "Limpieza") &&
            el.departamento === "Producción"
        ) {
            return true;
        }

        return false;
      });

      console.log(
        '[Log || dataInsumosFiltrado]',
        'orden',
        this.idorden,
        'deptName',
        depName,
        'deptId',
        depId,
        'resultCount',
        result.length,
        'items',
        result
      );

      return result;
    },

    /**
     * Filtrado estricto: solo incluye insumos cuyo id_departamento coincide
     * exactamente con el departamento actual del empleado.
     * Se usa para decidir si mostrar la sección de material (sin lógica de hermanos).
     */
    dataInsumosFiltradoEstricto() {
      const depName = this.$store.state.login.currentDepartament;
      const depId = this.$store.state.login.currentDepartamentId;
      return this.dataInsumosComputed.filter((el) => {
        const isSameOrder = el.id_orden == this.idorden;
        if (!isSameOrder) return false;

        // Coincidencia estricta por Nombre de Departamento (Robusto ante migraciones de IDs)
        if (depName && el.departamento && el.departamento === depName) return true;

        // Fallback por ID de Departamento
        if (depId && el.id_departamento && parseInt(el.id_departamento) === parseInt(depId)) return true;

        return false;
      });
    },

    getCatalogosUnicos() {
      if (!this.dataInsumosFiltrado || this.dataInsumosFiltrado.length === 0) {
        return [];
      }

      // 1. Usar Map para extraer solo las propiedades necesarias
      const catalogosMapeados = this.dataInsumosFiltrado.map((item) => ({
        id_catalogo_insumos_productos: item.id_catalogo_insumos_productos,
        catalogo: item.catalogo,
      }));

      // 2. Usar un Set para eliminar duplicados de forma eficiente
      // Convertimos cada objeto a una cadena JSON para que Set pueda detectarlo como único
      const catalogosUnicosString = new Set(
        catalogosMapeados.map((obj) => JSON.stringify(obj))
      );

      // 3. Convertir las cadenas JSON de vuelta a objetos
      const catalogosUnicos = Array.from(catalogosUnicosString).map((str) =>
        JSON.parse(str)
      );

      return catalogosUnicos;
    },

    materialUtilizado() {
      if (!this.form || this.form.length === 0) {
        return "0.00";
      }

      const total = this.form.reduce((acumulador, objeto) => {
        // Asegurarse de que objeto.input sea un número antes de sumar
        const valorInput = parseFloat(objeto.input);
        return acumulador + (isNaN(valorInput) ? 0 : valorInput);
      }, 0);

      return total.toFixed(2);
    },
    papelUtilizado() {
      return (this.item.valor_inicial - this.item.valor_final).toFixed(2);
    },

    /**
     * Calcula el material estimado para el departamento actual
     * usando los datos de product_insumos_asignados (dataInsumos)
     */
    materialEstimadoDepartamento() {
      if (!this.dataInsumosFiltrado || this.dataInsumosFiltrado.length === 0) {
        return { total: '0.00', unidad: 'Metros' };
      }

      const insumosDept = this.dataInsumosFiltrado;

      if (insumosDept.length === 0) {
        return { total: '0.00', unidad: 'Metros' };
      }

      // Deduplicar por producto + catálogo para incluir todos los materiales asignados
      const productosUnicos = new Map();
      insumosDept.forEach((item) => {
        const key = `${item.id_ordenes_productos}_${item.catalogo}`;
        if (!productosUnicos.has(key)) {
          const tipo = this.$store.getters['login/currentDepartamentTipo'];
          const isRepo = !!(this.esReposicion || this.esreposicion || (this.item && (this.item.esreposicion || this.item.es_reposicion)));
          // "unidades" ya viene acotado por el backend a lo que este empleado tiene
          // realmente asignado (asignación granular por producto) cuando aplica, con
          // fallback automático a la cantidad total si no hay asignación granular --
          // por eso debe preferirse sobre "cantidad_original" (que SIEMPRE es el total
          // de la orden sin importar el empleado). Se usa cantidad_original solo si
          // "unidades" viene ausente (null/undefined), no si es 0 (0 es un valor real).
          const u = isRepo
            ? (parseFloat(this.item.unidades) || 0)
            : (tipo === 'corte'
                ? (parseFloat(item.unidades) || 0)
                : (item.unidades !== null && item.unidades !== undefined
                    ? (parseFloat(item.unidades) || 0)
                    : (parseFloat(item.cantidad_original) || 0)));
          productosUnicos.set(key, {
            cantidad_estimada: parseFloat(item.cantidad_estimada_de_consumo) || 0,
            unidades: u,
            unidad: item.unidad_de_medida || 'Metros'
          });
        }
      });

      // Calcular el total: cantidad_estimada * unidades para cada producto
      let total = 0;
      let unidad = 'Metros';
      productosUnicos.forEach((value) => {
        total += value.cantidad_estimada * value.unidades;
        unidad = value.unidad; // Tomar la última unidad (asumiendo que son iguales)
      });

      if (unidad.toLowerCase() === 'kg') unidad = 'Mt';

      return { total: total.toFixed(2), unidad: unidad };
    },

    /**
     * Calcula el material estimado AGRUPADO POR CATÁLOGO DE INSUMO
     * Devuelve un array con {catalogo, total, unidad} para mostrar desglosado
     */
    materialEstimadoPorCatalogo() {
      if (!this.dataInsumosFiltrado || this.dataInsumosFiltrado.length === 0) {
        return [];
      }

      const currentDeptId = this.$store.state.login.currentDepartamentId;

      // Usar los insumos ya filtrados por departamento y orden
      const insumosDept = this.dataInsumosFiltrado;

      if (insumosDept.length === 0) {
        return [];
      }

      // PASO 1: Deduplicar por id_ordenes_productos + catalogo
      // Usamos clave compuesta para evitar contar el mismo producto múltiples veces
      const productosUnicos = new Map();

      insumosDept.forEach((item) => {
        const key = `${item.id_ordenes_productos}_${item.catalogo}`;
        if (!productosUnicos.has(key)) {
          const tipo = this.$store.getters['login/currentDepartamentTipo'];
          const isRepo = !!(this.esReposicion || this.esreposicion || (this.item && (this.item.esreposicion || this.item.es_reposicion)));
          // Ver nota en materialEstimadoDepartamento: "unidades" ya viene acotado por
          // el backend a la asignación granular real del empleado, con fallback
          // automático a la cantidad total si no aplica -- debe preferirse sobre
          // "cantidad_original" (siempre el total de la orden).
          const u = isRepo
            ? (parseFloat(this.item.unidades) || 0)
            : (tipo === 'corte'
                ? (parseFloat(item.unidades) || 0)
                : (item.unidades !== null && item.unidades !== undefined
                    ? (parseFloat(item.unidades) || 0)
                    : (parseFloat(item.cantidad_original) || 0)));
          productosUnicos.set(key, {
            catalogo: item.catalogo || 'Sin catálogo',
            cantidad_estimada: parseFloat(item.cantidad_estimada_de_consumo) || 0,
            unidades: u,
            unidad: item.unidad_de_medida || 'Metros'
          });
        }
      });

      // PASO 2: Agrupar por catálogo y sumar totales
      const catalogoMap = new Map();

      productosUnicos.forEach((producto) => {
        const catalogoNombre = producto.catalogo;
        const totalItem = producto.cantidad_estimada * producto.unidades;

        if (catalogoMap.has(catalogoNombre)) {
          catalogoMap.get(catalogoNombre).total += totalItem;
        } else {
          catalogoMap.set(catalogoNombre, {
            catalogo: catalogoNombre,
            total: totalItem,
            unidad: producto.unidad
          });
        }
      });

      return Array.from(catalogoMap.values()).map(item => ({
        catalogo: item.catalogo,
        total: item.total.toFixed(2),
        unidad: item.unidad.toLowerCase() === 'kg' ? 'Mt' : item.unidad,
      }));
    },

    /**
     * Calcula el porcentaje de eficiencia: (Estimado / Utilizado) * 100
     * >100% significa que usamos menos del estimado (bueno)
     * <100% significa que usamos más del estimado (malo)
     */
    eficienciaPorcentaje() {
      const estimado = parseFloat(this.materialEstimadoDepartamento.total);
      const utilizado = parseFloat(this.materialUtilizado);

      if (utilizado === 0 || estimado === 0) {
        return '0.00';
      }

      return ((estimado / utilizado) * 100).toFixed(2);
    },

    // Devuelve el objeto insumo del inventario para la fila `index` del formulario
    insumoDeFormRow() {
      return (index) => {
        const item = this.form[index];
        if (!item || !item.select) return null;
        const id = parseInt(item.select.split('|')[0].trim());
        return this.insumosTodos ? (this.insumosTodos.find(i => i._id == id) || null) : null;
      };
    },

    // Texto de ayuda bajo el campo Cantidad: solo muestra hint para telas
    descripcionCantidadRow() {
      return (index) => {
        const insumo = this.insumoDeFormRow(index);
        if (insumo && insumo.tipo_insumo === 'tela') {
          return 'Metros de tela que usaste. NO el peso del rollo en kg.';
        }
        return '';
      };
    },

    // Detecta dos patrones de error humano para el campo Cantidad en telas:
    // 1. El valor ingresado es numéricamente similar al stock del rollo en kg → el empleado confundió unidad
    // 2. El valor supera 3× el estimado del sistema → consumo anómalamente alto
    warningCantidadTela() {
      return (index) => {
        const item = this.form[index];
        if (!item || !item.validInsumo) return null;
        const insumo = this.insumoDeFormRow(index);
        if (!insumo || insumo.tipo_insumo !== 'tela') return null;

        const valor = parseFloat(item.input) || 0;
        if (valor <= 0) return null;

        const rendimiento = parseFloat(insumo.rendimiento) || 1;
        const cantidadKg = parseFloat(insumo.cantidad) || 0;

        // Patrón 1: valor ≈ kg del stock (±1.5 kg de margen) → confusión de unidad
        if (cantidadKg > 0 && Math.abs(valor - cantidadKg) <= 1.5) {
          return {
            tipo: 'kg_coincidence',
            kg: valor.toFixed(2),
            metros_equivalentes: (valor * rendimiento).toFixed(2),
            rendimiento,
          };
        }

        // Patrón 2: valor > 3× el estimado del sistema → consumo sospechosamente alto
        const estimado = parseFloat(this.materialEstimadoDepartamento.total) || 0;
        if (estimado > 0 && valor > estimado * 3) {
          return {
            tipo: 'alto_vs_estimado',
            porcentaje: ((valor / estimado) * 100).toFixed(0),
            estimado: estimado.toFixed(2),
          };
        }

        return null;
      };
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    dataSearchInsumo() {
      // Obtener los IDs únicos de catálogo (id_catalogo_insumos_productos) que están asignados 
      // a los productos de esta orden y que pertenecen al departamento actual del empleado
      const idsCatalogoAsignados = new Set(
        this.dataInsumosFiltrado.map(item => item.id_catalogo_insumos_productos)
      );

      
      // Si idsCatalogoAsignados está vacío pero necesitamos mostrar insumos por desperdicio global
      if (idsCatalogoAsignados.size === 0) {
        let myOptions = [];
        const dep = this.$store.state.login.currentDepartament;
        const tipo = this.$store.getters['login/currentDepartamentTipo'];
        if (this.insumosTodos && Array.isArray(this.insumosTodos)) {
          // Ajuste por inversión de categorías en DB
          if (tipo === "impresion") {
            // Impresión debería mostrar Papeles (marcados como Telas)
            myOptions = this.insumosTodos.filter((item) => item.departamento === "Telas");
          } else if (tipo === "corte") {
            // Corte necesita ver todos los rollos de tela disponibles en inventario
            myOptions = this.insumosTodos.filter((item) => item.tipo_insumo === 'tela');
          } else {
            myOptions = this.insumosTodos.filter((item) => item.departamento === dep);
          }
        }
        return myOptions.map((el) => {
          if (el.tipo_insumo === 'tela') {
            const rendimiento = parseFloat(el.rendimiento) || 1;
            const availableMeters = (parseFloat(el.cantidad) * rendimiento).toFixed(2);
            return `${el._id} | ${el.insumo} ${availableMeters} Mt`;
          }
          return `${el._id} | ${el.insumo} ${el.cantidad} ${el.unidad}`;
        });
      }

      const dep = this.$store.state.login.currentDepartament;
      const tipo = this.$store.getters['login/currentDepartamentTipo'];

      // Corte y Estampado siempre ven todas las telas disponibles en inventario
      const listaFinal = (['corte', 'estampado'].includes(tipo) && this.insumosTodos)
        ? this.insumosTodos.filter(el => el.tipo_insumo === 'tela')
        : this.insumosTodos.filter(el => idsCatalogoAsignados.has(el.id_catalogo));

      // Mapear al formato de búsqueda
      return listaFinal.map((el) => {
        if (el.tipo_insumo === 'tela') {
          const rendimiento = parseFloat(el.rendimiento) || 1;
          const availableMeters = (parseFloat(el.cantidad) * rendimiento).toFixed(2);
          return `${el._id} | ${el.insumo} ${availableMeters} Mt`;
        }
        return `${el._id} | ${el.insumo} ${el.cantidad} ${el.unidad}`;
      });
    },

    selectOptions() {
      let myOptions = [];
      const dep = this.$store.state.login.currentDepartament;
      const tipo = this.$store.getters['login/currentDepartamentTipo'];

      // Lógica dinámica basada en insumosTodos filtrado por el departamento actual
      if (this.insumosTodos && Array.isArray(this.insumosTodos)) {
        // Impresión usa insumos catalogados como "Telas" (inversión histórica en DB) o "Impresión"
        const depFilters = tipo === "impresion" ? ["Telas", "Impresión"] : [dep];
        myOptions = this.insumosTodos.filter((item) => depFilters.includes(item.departamento));

        // Casos especiales de mapeo de departamentos (Producción -> Revisión/Limpieza)
        if (["Revisión", "Limpieza"].includes(dep)) {
          const prodInsumos = this.insumosTodos.filter(
            (item) => item.departamento === "Producción"
          );
          myOptions = [...myOptions, ...prodInsumos];
        }

        // Eliminar duplicados si los hay por el merge de casos especiales
        myOptions = [...new Map(myOptions.map(item => [item._id, item])).values()];
      }

      let options = myOptions.map((item) => {
        return {
          text: `${item._id} | ${item.insumo} (${item.cantidad} ${item.unidad})`,
          value: parseInt(item._id),
        };
      });
      options.unshift({ text: "Seleccione una opción", value: null });
      return options;
    },

    impresorasOptions() {
      console.log("impresoras prop in impresorasOptions:", this.impresoras);
      if (!this.impresoras || this.impresoras.length === 0) {
        return [{ value: null, text: "No hay impresoras disponibles" }];
      }
      let options = this.impresoras.map((imp) => {
        return {
          value: imp._id,
          text: `${imp.codigo_interno} - ${imp.marca} ${imp.modelo}`,
          tipo_tecnologia: imp.tipo_tecnologia,
        };
      });
      options.unshift({ value: null, text: "Seleccione una impresora" });
      return options;
    },

    // Devuelve true si la última impresora del array tiene una impresora seleccionada
    puedeAnadirImpresora() {
      if (!this.impresorasSeleccionadas || this.impresorasSeleccionadas.length === 0) return false;
      const ultimaImpresora = this.impresorasSeleccionadas[this.impresorasSeleccionadas.length - 1];
      return ultimaImpresora.id_impresora !== null;
    },

    // Devuelve true si ya se han seleccionado todas las impresoras disponibles
    todasImpresorasSeleccionadas() {
      if (!this.impresoras || this.impresoras.length === 0) return true;
      return this.impresorasSeleccionadas.length >= this.impresoras.length;
    },

    // Devuelve los IDs de impresoras ya seleccionadas (excluyendo el index actual)
    impresorasYaSeleccionadas() {
      return this.impresorasSeleccionadas
        .filter(imp => imp.id_impresora !== null)
        .map(imp => imp.id_impresora);
    },

    hayImpresoras() {
      return this.impresoras && this.impresoras.length > 0;
    },

    hayInsumosImpresion() {
      return this.insumosimp && this.insumosimp.length > 0;
    },

    puedeUsarModalImpresion() {
      return this.hayImpresoras && this.hayInsumosImpresion;
    },
  },

  methods: {
    async cargarNotasAnteriores() {
      if (!this.idorden) return;
      this.cargandoNotas = true;
      try {
        const res = await this.$axios.get(`${this.$config.API}/ordenes/notas-por-empleado/${this.idorden}`);
        const filas = Array.isArray(res.data) ? res.data : [];
        // Solo notas de OTROS departamentos (no el propio, que el empleado ya conoce/escribe aqui mismo)
        this.notasAnteriores = filas.filter(
          (f) => f.tiene_nota == 1 && f.departamento !== this.$store.state.login.currentDepartament
        );
      } catch (e) {
        console.error("Error al cargar notas de departamentos anteriores:", e);
        this.notasAnteriores = [];
      } finally {
        this.cargandoNotas = false;
      }
    },

    async refreshConfig() {
      try {
        console.log("DEBUG - Modal Extra - Refrescando configuración...");
        const res = await this.$axios.get(`${this.$config.API}/config`);
        const configData = Array.isArray(res.data) ? res.data[0] : res.data;

        if (configData) {
          this.$store.commit("login/setDatosPersonalizacion", configData);

          console.log("DEBUG - Modal Extra - Configuración recargada:", configData);
          this.evaluateShowSelect();
        }
      } catch (e) {
        console.error("Error al recargar configuración en Modal Extra:", e);
      }
    },

    evaluateShowSelect() {
      this.showSelect = false;
      const dep = this.$store.state.login.currentDepartament;
      const tipo = this.$store.getters['login/currentDepartamentTipo'];

      // 1. Corte siempre muestra (necesita registrar desperdicio de etapas previas)
      if (tipo === 'corte') {
        this.showSelect = true;
        return;
      }

      // 2. Impresión siempre muestra (lógica de tintas interna)
      if (tipo === 'impresion') {
        this.showSelect = true;
        return;
      }

      // 3. Departamentos con desperdicio habilitado en el producto
      // ("Corte de papel" ya no hace falta aquí: cualquier tipo='corte'
      // retorna en el bloque 1 de arriba antes de llegar a este punto).
      const deptsDesperdicio = ['Estampado'];
      if (deptsDesperdicio.includes(dep) || tipo === 'estampado') {
        const tieneDesperdicio =
          (this.dataInsumosFiltrado && this.dataInsumosFiltrado.some(el => el.usa_desperdicio == 1)) ||
          (this.items && Array.isArray(this.items) && this.items.some(el => el.usa_desperdicio == 1)) ||
          (this.item && this.item.usa_desperdicio == 1);
        if (tieneDesperdicio) {
          this.showSelect = true;
          return;
        }
      }

      // 4. Cualquier departamento (fijo o custom) con insumos asignados a esta orden
      if (this.dataInsumosFiltrado && this.dataInsumosFiltrado.length > 0) {
        this.showSelect = true;
      }
    },

    reloadMe() {
      this.$emit("reload", "true");
    },

    updateCatalogo(index, idCat) {
      this.form[index].idCatalogo = idCat;
    },

    // calculoPorcentaje() {},dataInsumosFiltrado

    disBtnTodo(action) {
      if (action) {
        this.ButtonDisabled = true;
      } else {
        this.ButtonDisabled = false;
      }
    },

    filterPausa(idOrden) {
      return this.pausas.filter((el) => el.id_orden == idOrden);
    },

    // filterPausa(idOrden) {
    //   console.log("ID para filtar la pausa", idOrden);
    //   return this.pausas.filter((el) => el.id_orden == idOrden);
    // },

    getId(value) {
      if (value) {
        let myID = value.split(" | ");
        return parseInt(myID[0]);
      } else {
        return 0;
      }
    },

    loadInsumos(index) {
      if (!this.form[index].select) return;

      let parts = this.form[index].select.split(" | ");
      let selectedId = parts[0].toString();

      // Check for duplicates
      const duplicate = this.form.findIndex((item, idx) => {
        if (idx === index) return false; // Skip self
        if (!item.select) return false;

        // Extract ID from other items (they might be "ID" or "ID | Name")
        let otherId = item.select.toString();
        if (otherId.includes('|')) {
          otherId = otherId.split('|')[0].trim();
        }
        return otherId === selectedId.trim();
      });

      if (duplicate !== -1) {
        this.$fire({
          type: 'warning',
          title: 'Insumo Duplicado',
          text: 'Este insumo ya ha sido seleccionado. No puede seleccionar el mismo insumo dos veces.'
        }).then(() => {
          // Clear selection
          this.$set(this.form[index], 'select', '');
          this.$set(this.form[index], 'validInsumo', false);

          // Try to refocus (optional, depends on UI lib)
          // this.$nextTick(() => { ... })
        });
        return;
      }

      console.log("ID Insumo seleccionado", selectedId);
      // this.form[index].select = parseInt(myID);
      this.form[index].select = selectedId;
      this.$set(this.form[index], 'validInsumo', true); // Marcar como válido
      console.log("ID LISTO", this.form[index].select);
      console.log("form", this.form);
    },

    generateRandomId() {
      let id;
      do {
        // Generar un número aleatorio entre 100000 y 9999999
        id = Math.floor(Math.random() * (9999999 - 100000 + 1)) + 100000;
      } while (this.form.some((obj) => obj.id === id)); // Asegurarse de que el ID no esté repetido en el array
      return id;
    },

    addItem() {
      // const dep = this.$store.state.login.currentDepartament
      const obj = {
        id: this.generateRandomId(),
        select: null,
        input: 0.0,
        idCatalogo: null,
        desperdicio: 0,
        validInsumo: false,
        terminar: false, // Checkbox state
      };
      this.form.push(obj);
    },

    removeItem(index) {
      this.form.splice(index, 1);
    },

    // --- MÉTODOS PARA MÚLTIPLES IMPRESORAS ---
    addImpresora() {
      // Verificar que la última impresora tenga una seleccionada
      if (!this.puedeAnadirImpresora) {
        this.$fire({
          type: 'warning',
          title: 'Selección requerida',
          html: '<p>Debe seleccionar una impresora antes de añadir otra.</p>',
        });
        return;
      }

      if (this.todasImpresorasSeleccionadas) {
        this.$fire({
          type: 'info',
          title: 'Límite alcanzado',
          html: '<p>Ya ha seleccionado todas las impresoras disponibles.</p>',
        });
        return;
      }
      const newId = Math.floor(Math.random() * 1000000);
      this.impresorasSeleccionadas.push({
        id: newId,
        id_impresora: null,
        canales: {},
      });
    },

    removeImpresora(index) {
      if (this.impresorasSeleccionadas.length > 1) {
        this.impresorasSeleccionadas.splice(index, 1);
      }
    },

    // Devuelve opciones de impresora con las ya seleccionadas deshabilitadas (excepto la actual)
    getImpresorasOptionsForIndex(index) {
      if (!this.impresoras || this.impresoras.length === 0) {
        return [{ value: null, text: 'No hay impresoras disponibles' }];
      }
      const currentSelection = this.impresorasSeleccionadas[index]?.id_impresora;
      const otherSelections = this.impresorasSeleccionadas
        .filter((_, i) => i !== index)
        .map(imp => imp.id_impresora)
        .filter(id => id !== null);

      let options = this.impresoras.map((imp) => {
        return {
          value: imp._id,
          text: `${imp.codigo_interno} - ${imp.marca} ${imp.modelo}`,
          tipo_tecnologia: imp.tipo_tecnologia,
          disabled: otherSelections.includes(imp._id),
        };
      });
      options.unshift({ value: null, text: 'Seleccione una impresora' });
      return options;
    },

    // Devuelve los canales de color de la impresora seleccionada para un índice dado
    getCanalesForIndex(index) {
      if (!this.impresoras || this.impresoras.length === 0) return [];
      const selectedId = this.impresorasSeleccionadas[index]?.id_impresora;
      if (!selectedId) return [];
      const selectedPrinter = this.impresoras.find(imp => imp._id === selectedId);
      return (selectedPrinter && selectedPrinter.canales_colores) ? selectedPrinter.canales_colores : [];
    },

    /**
     * Estimado de tinta de referencia (SOLO visual) para la impresora seleccionada
     * en este índice = metros del "Material Estimado (Sistema)" * ml_tinta_por_metro
     * de esa impresora. No autocompleta ni valida los inputs de canal de color.
     */
    tintaEstimadaMlForIndex(index) {
      if (!this.impresoras || this.impresoras.length === 0) return null;
      const selectedId = this.impresorasSeleccionadas[index]?.id_impresora;
      if (!selectedId) return null;
      const selectedPrinter = this.impresoras.find(imp => imp._id === selectedId);
      if (!selectedPrinter) return null;

      const metros = parseFloat(this.materialEstimadoDepartamento.total);
      const mlPorMetro = parseFloat(selectedPrinter.ml_tinta_por_metro);
      if (!metros || isNaN(metros) || metros <= 0) return null;
      if (!mlPorMetro || isNaN(mlPorMetro) || mlPorMetro <= 0) return null;

      return (metros * mlPorMetro).toFixed(2);
    },

    /**
     * true si la impresora seleccionada en este índice exige captura manual de
     * ml por color (comportamiento por defecto/histórico). false = modo
     * automático: no se pide nada al empleado, solo se muestra la referencia.
     * Por defecto true (si no hay impresora seleccionada aún, o el campo no
     * llegó todavía) para no ocultar el formulario sin que el admin lo decida.
     */
    esModoManualForIndex(index) {
      const selectedId = this.impresorasSeleccionadas[index]?.id_impresora;
      if (!selectedId || !this.impresoras) return true;
      const selectedPrinter = this.impresoras.find(imp => imp._id === selectedId);
      if (!selectedPrinter || selectedPrinter.ingresar_tinta_manual === undefined || selectedPrinter.ingresar_tinta_manual === null) return true;
      return parseInt(selectedPrinter.ingresar_tinta_manual) !== 0;
    },

    // Calcula el color de texto (blanco/negro) según el fondo para legibilidad
    getContrastColor(hex) {
      if (!hex) return '#000000';
      const h = hex.replace('#', '');
      const r = parseInt(h.substring(0, 2), 16) || 0;
      const g = parseInt(h.substring(2, 4), 16) || 0;
      const b = parseInt(h.substring(4, 6), 16) || 0;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#ffffff';
    },

    // Determina si mostrar el campo de tinta blanca (legacy, mantenido por compatibilidad)
    showWhiteInkFieldForIndex(index) {
      return false; // Ya no se usa: los canales son dinámicos
    },
    // --- FIN MÉTODOS PARA MÚLTIPLES IMPRESORAS ---

    // --- Batch Logic ---
    prepareBatchTerminar() {
      this.batchItems = this.form
        .map((item, index) => ({ ...item, originalIndex: index }))
        .filter(item => item.terminar && item.validInsumo)
        .map(item => {
          let insumoName = item.select; // Default
          // Find name
          let idInsumo = item.select;
          if (idInsumo && idInsumo.includes('|')) {
            idInsumo = idInsumo.split('|')[0].trim();
          }
          const found = this.insumosTodos.find(i => i._id == idInsumo);
          if (found) insumoName = found.insumo;

          return {
            ...item,
            remanente: 0,
            insumoName: insumoName,
            idInsumoClean: idInsumo
          };
        });

      if (this.batchItems.length > 0) {
        this.$bvModal.show(`modal-terminar-batch-${this.idorden}`);
      } else {
        // Normal submit if no items to finish
        this.terminarTodo();
      }
    },

    loadRemanenteBatch(idx) {
      const item = this.batchItems[idx];
      const originalItem = this.insumosTodos.find(i => i._id == item.idInsumoClean);

      if (originalItem) {
        if (this.$store.getters['login/currentDepartamentTipo'] === 'estampado') {
          const rendimiento = parseFloat(originalItem.rendimiento) || 1;
          const availableMeters = (parseFloat(originalItem.cantidad) * rendimiento).toFixed(2);
          this.batchItems[idx].remanente = availableMeters;
        } else {
          this.batchItems[idx].remanente = originalItem.cantidad;
        }
      }
    },

    async handleBatchTerminarConfirm(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.overlay = true;
      this.$bvModal.hide(`modal-terminar-batch-${this.idorden}`);

      try {
        // We will iterate ALL form items.
        for (let i = 0; i < this.form.length; i++) {
          const formItem = this.form[i];
          const batchItem = this.batchItems.find(b => b.originalIndex === i);

          let idInsumo = formItem.select;
          if (idInsumo && idInsumo.includes('|')) {
            idInsumo = idInsumo.split('|')[0].trim();
          }

          if (formItem.precargado) {
            // For precargados, register only waste via soloRendimiento
            await this.postInventarioMovimientos(
              formItem.input,
              idInsumo,
              formItem.idCatalogo,
              this.item.id_woo,
              formItem.desperdicio,
              0,
              'consumo',
              false,
              true // soloRendimiento = true
            );
            continue;
          }

          // 1. Send Consumption (Always)
          // Call API Consumption with correct arguments
          const res = await this.postInventarioMovimientos(
            formItem.input,
            idInsumo,
            formItem.idCatalogo,
            this.item.id_woo,
            formItem.desperdicio,
            0, // No remanente
            'consumo', // Explicitly send as consumption
            false, // autoRemanente = false
            false // soloRendimiento = false
          );

          // 2. If item is in batch AND response success
          if (batchItem && res && res.data) {
            // Send Finish Signal with Auto Remanente and correct arguments
            console.log(`Finishing item ${batchItem.insumoName} automatically. AutoRemanente=true`);
            await this.postInventarioMovimientos(
              0, // Consumption 0 (already sent)
              idInsumo,
              formItem.idCatalogo,
              this.item.id_woo,
              formItem.desperdicio,
              0, // remanente value ignored by backend if auto_remanente is true, but sent as 0
              'fin', // Type 'fin'
              true, // auto_remanente = true
              false // soloRendimiento = false
            );
            console.log(`Finish request sent for ${batchItem.insumoName}`);
          }
        }

        // Finally, register the state (finish the step)
        await this.registrarEstado("fin", this.idorden, 0);

        this.$emit("reload");

      } catch (e) {
        console.error(e);
        this.$fire({
          type: 'error',
          title: 'Error al terminar materiales',
          html: `<p>Ocurrió un error al procesar la terminación de los materiales: ${e.message}</p>`,
        });
      } finally {
        this.overlay = false;
        this.ButtonDisabled = false;
        this.clearForms(); // Clear forms after submission
      }
    },

    token() {
      const length = 8;
      var a =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
          ""
        );
      var b = [];
      for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
      }
      return b.join("");
    },

    /* terminaMe() {
            if (this.$store.state.login.currentDepartament === "Impresión") {
                this.validateImp();
            } else if (this.$store.state.login.currentDepartament === "Estampado") {
                this.validateEst();
            } else if (this.$store.state.login.currentDepartament === "Corte") {
                this.validateCor();
            } else if (this.$store.state.login.currentDepartament === "Costura") {
                this.validateCor();
            }
        }, */

    async cargarConsumosPrevios() {
      const isCorte = this.$store.getters['login/currentDepartamentTipo'] === 'corte';
      if (!isCorte || !this.idorden) return;
      
      try {
        const response = await this.$axios.get(`${this.$config.API}/inventario/historial/${this.idorden}`);
        const movimientos = response.data.items || [];
        
        movimientos.forEach(mov => {
          // Si el material fue consumido por Estampado, lo traemos a Corte
          if (mov.departamento === 'Estampado') {
            const insumoInfo = this.insumosTodos.find(ins => ins._id == mov.id_insumo);
            if (insumoInfo && insumoInfo.tipo_insumo === 'tela') {
              // Evitar duplicados en el form
              const existe = this.form.find(f => f.select && f.select.split(' | ')[0] == mov.id_insumo);
              if (!existe) {
                this.form.push({
                  select: `${mov.id_insumo} | ${insumoInfo.insumo} | SKU: ${insumoInfo.sku}`,
                  input: 0,
                  desperdicio: null,
                  idCatalogo: insumoInfo.id_catalogo,
                  validInsumo: true,
                  precargado: true,
                  idInsumo: mov.id_insumo,
                  insumoNombre: insumoInfo.insumo,
                  sku: insumoInfo.sku,
                  terminar: false
                });
              }
            }
          }
        });
      } catch (error) {
        console.error("Error al cargar consumos previos:", error);
      }
    },

    clearForms() {
      this.form = [];
      // Reset array de impresoras a estado inicial (canales dinámicos)
      this.impresorasSeleccionadas = [
        { id: 1, id_impresora: null, canales: {} }
      ];

      this.formEst = {
        input: 0,
      };

      this.formCor = {
        input: 0,
      };
    },

    getDeptTipoById(id) {
      if (!id) return 'general';
      const dept = this.$store.state.login.departamentos.find(el => parseInt(el._id) === parseInt(id));
      if (dept && dept.tipo) return dept.tipo;
      return 'general';
    },

    onReserForm(event) {
      event.preventDefault();
      this.clearForms();
    },

    // VALIDACIÓN DE FORMULARIOS
    validateForm() {
      this.ButtonDisabled = true;
      let ok = true;

      // CONDITION MODIFIED: Check if there are actually insumos available to select.
      // selectOptions always has at least at least 1 item ("Seleccione una opción").
      // If it has > 1, it means there are insumos populated for this department.
      const hayInsumosDisponibles = this.selectOptions && this.selectOptions.length > 1;
      const isCorte = this.$store.getters['login/currentDepartamentTipo'] === 'corte';
      const isImpresion = this.$store.getters['login/currentDepartamentTipo'] === 'impresion';
      const hasStrictInsumos = this.dataInsumosFiltradoEstricto && this.dataInsumosFiltradoEstricto.length > 0;

      if (
        (this.showSelect && hayInsumosDisponibles && this.materialEstimadoPorCatalogo.length > 0) ||
        isCorte ||
        isImpresion ||
        hasStrictInsumos
      ) {
        let msg = "";

        if (isImpresion) {
          // Verificar si hay impresoras e insumos configurados
          if (!this.puedeUsarModalImpresion) {
            ok = false;
            if (!this.hayImpresoras) {
              msg =
                msg +
                "<p>No hay impresoras configuradas en el sistema. Contacte al administrador.</p>";
            }
            if (!this.hayInsumosImpresion) {
              msg =
                msg +
                "<p>No hay insumos de impresión disponibles en el inventario. Contacte al administrador.</p>";
            }
          } else {
            // Validar cada impresora en el array con canales dinámicos
            for (let i = 0; i < this.impresorasSeleccionadas.length; i++) {
              const impresora = this.impresorasSeleccionadas[i];
              const numImp = i + 1;

              if (impresora.id_impresora === null) {
                ok = false;
                msg = msg + `<p>Impresora ${numImp}: Seleccione una impresora</p>`;
                continue;
              }

              // En modo automático (ingresar_tinta_manual = 0) no se exige
              // captura de canales -- el formulario ni siquiera se muestra.
              if (!this.esModoManualForIndex(i)) {
                continue;
              }

              const canales = this.getCanalesForIndex(i);
              if (canales.length === 0) {
                ok = false;
                msg = msg + `<p>Impresora ${numImp}: Esta impresora no tiene canales de color configurados.</p>`;
                continue;
              }

              for (const canal of canales) {
                const val = (impresora.canales[canal.codigo] || '').toString().trim();
                if (val === '' || parseFloat(val) <= 0) {
                  ok = false;
                  msg = msg + `<p>Impresora ${numImp}: Ingrese la cantidad de tinta ${canal.nombre} (${canal.codigo})</p>`;
                }
              }
            }
          }
        }

        // --- NUEVA VALIDACIÓN: Obligar a registrar insumos si hay asignados estrictamente ---
        const formNonPrecargado = this.form.filter(f => !f.precargado && f.validInsumo && f.idCatalogo);

        if (hasStrictInsumos && formNonPrecargado.length === 0) {
          ok = false;
          msg += `<p>Debe añadir y registrar al menos un insumo específico para el departamento de ${this.$store.state.login.currentDepartament}.</p>`;
        }

        if (this.form.length === 0 && this.getCatalogosUnicos.length > 0 && hasStrictInsumos) {
          ok = false;
          if (isCorte) {
            msg = msg + "<p>Debe asignar al menos un insumo (puede dejar el consumo en 0) para registrar el desperdicio.</p>";
          } else {
            msg = msg + "<p>Debe asignar al menos un insumo</p>";
          }
        }

        const formTmp = this.form;

        for (let i = 0; i < formTmp.length; i++) {
          const el = formTmp[i];
          
          if (!isCorte) {
            if (el.input === 0 || el.input === "" || el.input === null) {
              ok = false;
              msg += `<p>Ingrese la cantidad para la fila ${i + 1}</p>`;
            }
          } else {
            // En Corte permitimos consumo 0 si no requieren descontar material
            if (el.input === "" || el.input === null) {
              el.input = 0;
            }
          }

          if (!el.select || el.select === "") {
            ok = false;
            msg += `<p>Seleccione un insumo en el buscador para la fila ${i + 1}</p>`;
          } else if (!el.idCatalogo && this.getCatalogosUnicos.length > 0) {
            ok = false;
            msg += `<p>Seleccione una opción en la sección "Seleccione el tipo de insumo" (ej. Tela) para la fila ${i + 1}</p>`;
          }
        }

        // VALIDAR QUE SE HAYA CARGADO TODOS LOS CATÁLOGOS ASIGNADOS AL DEPARTAMENTO
        if (this.getCatalogosUnicos.length > 0 && hasStrictInsumos) {
          const catalogosCubiertos = new Set(
            this.form
              .filter(f => f.validInsumo && f.idCatalogo)
              .map(f => f.idCatalogo)
          );
          const faltantes = this.getCatalogosUnicos.filter(
            c => !catalogosCubiertos.has(c.id_catalogo_insumos_productos)
          );
          if (faltantes.length > 0) {
            ok = false;
            const nombres = faltantes.map(c => c.catalogo).join(', ');
            msg += `<p>Debe registrar el consumo de todos los materiales asignados. Faltan: <strong>${nombres}</strong></p>`;
          }
        }

        // --- NUEVA VALIDACIÓN: Garantizar cobertura estricta (no precargada) ---
        if (hasStrictInsumos) {
          const catalogosStrict = new Set(
            this.dataInsumosFiltradoEstricto
              .filter(item => item.id_catalogo_insumos_productos)
              .map(item => item.id_catalogo_insumos_productos)
          );

          if (catalogosStrict.size > 0) {
            const catalogosCubiertosStrict = new Set(formNonPrecargado.map(f => f.idCatalogo));
            const faltantesStrict = [...catalogosStrict].filter(idCat => !catalogosCubiertosStrict.has(idCat));

            if (faltantesStrict.length > 0) {
              ok = false;
              const nombresFaltantes = this.dataInsumosFiltradoEstricto
                .filter(item => faltantesStrict.includes(item.id_catalogo_insumos_productos))
                .map(item => item.catalogo)
                .filter((value, index, self) => self.indexOf(value) === index)
                .join(', ');
              msg += `<p>Debe registrar el consumo de los materiales asignados a este departamento. Faltan: <strong>${nombresFaltantes}</strong></p>`;
            }
          }
        }

        // VALIDAR DESPERDICIO (siempre, independiente de errores previos)
        for (let i = 0; i < this.form.length; i++) {
          const itemForm = this.form[i];
          if (this.needsDesperdicio(i)) {
            if (itemForm.desperdicio === null || itemForm.desperdicio === "") {
              ok = false;
              msg = msg + `<p>Ingrese el peso del desperdicio para el insumo de la fila ${i + 1}</p>`;
            } else if (isCorte && !itemForm.precargado && parseFloat(itemForm.input) === 0 && parseFloat(itemForm.desperdicio) === 0) {
              ok = false;
              msg = msg + `<p>Debe ingresar un consumo de material o un desperdicio en la fila ${i + 1}</p>`;
            }
          }
        }

        // VALIDAR CANTIDAD DISPONIBLE (Especialmente para Estampado)
        if (ok) { // Solo si no hay errores previos
          for (let i = 0; i < this.form.length; i++) {
            const itemForm = this.form[i];
            const cantidadIngresada = parseFloat(itemForm.input);

            // Obtener ID del insumo seleccionado
            // El v-model 'select' tiene el string del typeahead: "ID | Nombre ..."
            if (itemForm.select) {
              const parts = itemForm.select.split('|');
              if (parts.length > 0) {
                const insumoId = parseInt(parts[0].trim());
                const insumoReal = this.insumosTodos.find(ins => ins._id == insumoId);

                if (insumoReal) {
                  let cantidadDisponible = parseFloat(insumoReal.cantidad);

                  // Si es tela, la cantidad disponible valida (y mostrada) es en Metros
                  if (insumoReal.tipo_insumo === 'tela') {
                    const rendimiento = parseFloat(insumoReal.rendimiento) || 1;
                    cantidadDisponible = cantidadDisponible * rendimiento;
                  }

                  if (cantidadIngresada > cantidadDisponible) {
                    ok = false;
                    const unidadMostrada = insumoReal.tipo_insumo === 'tela' ? 'Mt' : (insumoReal.unidad || 'Unidades');
                    msg = msg + `<p>La cantidad ingresada (${cantidadIngresada} ${unidadMostrada}) para el insumo ${insumoReal.insumo} excede la disponibilidad (${cantidadDisponible.toFixed(2)} ${unidadMostrada}).</p>`;
                  }
                }
              }
            }
          }
        }

        if (!ok) {
          this.$fire({
            type: "info",
            title: "Datos requeridos",
            html: msg,
          });
          this.ButtonDisabled = false;
        } else {
          // Validación especial para Desperdicio: confirmar si alguno es 0
          const alMenosUnDesperdicioCero = this.form.some((item, index) => this.needsDesperdicio(index) && parseFloat(item.desperdicio || 0) === 0);

          if (alMenosUnDesperdicioCero) {
            this.$confirm(
              "Hay uno o más insumos con el desperdicio en 0. ¿Está seguro que desea enviar así? Esto significa que no hubo desperdicio en esos materiales.",
              "Confirmar desperdicio",
              "question"
            )
              .then(() => {
                this.prepareBatchTerminar();
              })
              .catch(() => {
                this.ButtonDisabled = false;
                return false;
              });
          } else {
            // Validación normal o desperdicio > 0
            if (isImpresion) {
              this.postImp();
            }
            this.prepareBatchTerminar();
          }
        }
      } else {
        // Enviar solo el formulario aqui
        this.terminarTodo();
      }

      return ok;
    },

    async postImp() {
      // Iterar sobre todas las impresoras seleccionadas con canales dinámicos
      const promises = this.impresorasSeleccionadas.map(async (impresora, index) => {
        const data = new URLSearchParams();
        data.set("id_orden", this.idorden);
        data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
        data.set("id_impresora", impresora.id_impresora);

        // Enviar cada canal dinámico en el formato colores[id_color]=cantidad que espera el backend
        const canales = this.getCanalesForIndex(index);
        canales.forEach(canal => {
          const cantidad = impresora.canales[canal.codigo] || 0;
          data.set(`colores[${canal.id_color}]`, cantidad);
        });

        return this.$axios.post(`${this.$config.API}/empleados/tintas`, data);
      });

      try {
        await Promise.all(promises);
        console.log(`Se registraron ${this.impresorasSeleccionadas.length} impresora(s) para la orden ${this.idorden}`);
      } catch (error) {
        console.error('Error al registrar tintas:', error);
        this.$fire({
          type: 'error',
          title: 'Error',
          html: '<p>Ocurrió un error al registrar las tintas de una o más impresoras.</p>',
        });
      }
    },

    async postEst() {
      this.overlay = true;
      /* const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("desperdicio", this.formEst.input);
    
      await this.$axios
        .post(`${this.$config.API}/empleados/tintas`, data)
        .then((res) => {
          this.overlay = false;
          this.clearForms();
          this.$emit("reload", "true");
          // this.urlLink = res.data.linkdrive
        });
    */
      this.terminarTodo();
      /* this.postInventarioMovimientos(
        this.formEst.inputEst1,
        this.formEst.selectedEst1
      ); */

      // this.terminarTodo()
    },

    async postForm() {
      this.overlay = true;
      /* const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("desperdicio", this.formEst.input);
    
      await this.$axios
        .post(`${this.$config.API}/empleados/tintas`, data)
        .then((res) => {
          this.overlay = false;
          this.clearForms();
          this.$emit("reload", "true");
          // this.urlLink = res.data.linkdrive
        });
    */
      this.terminarTodo();
      /* this.postInventarioMovimientos(
        this.formEst.inputEst1,
        this.formEst.selectedEst1
      ); */

      // this.terminarTodo()
    },

    async postInventarioMovimientos(
      cantidadConsumida,
      idInsumo,
      idCatalogo,
      idProducto,
      desperdicio,
      remanente = 0,
      forceTipo = null,
      autoRemanente = false,
      soloRendimiento = false
    ) {
      // this.overlay = true;
      // Buscar cantidad actual del insumo
      let cantidadInsumo;
      const tipo = this.$store.getters['login/currentDepartamentTipo'];
      if (tipo === "impresion") {
        cantidadInsumo = this.insumosimp.filter(
          (item) => item._id == idProducto
        );
      } else if (tipo === "estampado") {
        console.log("enviemos datos de estampado");
        cantidadInsumo = this.insumosest.filter(
          (item) => item._id == idProducto
        );
      } // (else if...) Continuar con los otros departamentos aqui.
      else if (tipo === "corte") {
        cantidadInsumo = this.insumoscor.filter(
          (item) => item._id == idProducto
        );
      }

      let parsedIdInsumo = idInsumo;
      if (typeof parsedIdInsumo === 'string' && parsedIdInsumo.includes('|')) {
        parsedIdInsumo = parseInt(parsedIdInsumo.split('|')[0].trim());
      }

      // --- VALIDACIÓN: No enviar si el ID del insumo no es válido ---
      if (!parsedIdInsumo || isNaN(parsedIdInsumo) || parsedIdInsumo <= 0) {
        console.error('postInventarioMovimientos: id_insumo inválido:', idInsumo, '-> parsed:', parsedIdInsumo);
        this.$fire({
          type: 'warning',
          title: 'Insumo no seleccionado',
          html: '<p>Debe seleccionar un insumo válido del buscador antes de enviar el consumo.</p>',
        });
        return null;
      }
      // --- FIN VALIDACIÓN ---

      const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("id_departamento", this.$store.state.login.currentDepartamentId);
      data.set("departamento", this.$store.state.login.currentDepartament);
      data.set("id_insumo", parsedIdInsumo);
      data.set("id_catalogo", idCatalogo);
      data.set("id_ordenes_productos", this.id_ordenes_productos);
      data.set("es_reposicion", this.esReposicion);
      data.set("id_producto", this.item.id_woo);
      data.set("id_departamento", this.$store.state.login.currentDepartamentId);
      // data.set("cantidad_inicial", cantidadInsumo.cantidad);
      data.set("cantidad_consumida", cantidadConsumida);
      data.set("cantidad_consumida", cantidadConsumida);
      data.set("tipo", forceTipo ? forceTipo : "consumo"); // Default to consumption to avoid accidental zeroing

      data.set("valor", desperdicio);
      data.set("remanente", remanente);
      if (autoRemanente) {
        data.set("auto_remanente", "true");
      }
      if (soloRendimiento) {
        data.set("solo_rendimiento", "true");
      }

      const response = await this.$axios
        .post(
          `${this.$config.API}/inventario-movimientos/empleados/update-insumo`,
          data
        );

      return response; // Return for response checking
    },

    async registrarEstado(tipo, id_orden, unidades) {
      this.overlay = true;
      this.ButtonDisabled = true;
      const data = new URLSearchParams();
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("id_departamento", this.$store.state.login.currentDepartamentId);
      data.set("id_lotes_detalles", this.idlotesdetalles); // Usamos la prop idlotesdetalles
      data.set("id_orden", id_orden);
      data.set("tipo", tipo);
      data.set("es_reposicion", this.esReposicion);
      data.set("id_reposicion", this.item.id_reposicion);
      data.set("unidades", unidades);
      data.set("departamento", this.$store.state.login.currentDepartament);
      data.set("orden_proceso", this.$store.state.login.currentOrdenProceso);
      data.set("paso_actual", this.orden_proceso_departamento);

      if (this.item.esreposicion) {
        data.set("id_reposicion", this.item.id_reposicion);
      } else {
        data.set("id_reposicion", null);
      }

      await this.$axios
        .post(`${this.$config.API}/registrar-paso-empleado`, data)
        .then((res) => {
          if (tipo === "fin" && this.isLastDepartment()) {
            this.sendMsgCustom(
              id_orden,
              "paso",
              this.$store.state.login.currentDepartamentId
            );
          }
          console.log("emitimos aqui...");
          this.$emit("reload", "true");
          this.overlay = false;
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se pudo registrar la acción</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
          this.ButtonDisabled = false;
        });
    },

    isLastDepartment() {
      const departamentos = this.$store.state.login.departamentos;
      if (!departamentos || departamentos.length === 0) {
        return false;
      }

      const departamentosConPaso = departamentos.filter(
        (dep) => dep.asignar_numero_de_paso
      );

      if (departamentosConPaso.length === 0) {
        return false;
      }

      const maxOrdenProceso = Math.max(
        ...departamentosConPaso.map((dep) => dep.orden_proceso)
      );

      const currentOrdenProceso = this.$store.state.login.currentOrdenProceso;

      return currentOrdenProceso === maxOrdenProceso;
    },

    terminarTodo() {
      this.registrarEstado("fin", this.idorden, 0);

      // Para otros departamentos, enviar los elementos del formulario
      this.form.forEach((el) => {
        console.log("Enviamos elemento del formulario", el);

        this.postInventarioMovimientos(
          el.input,
          el.select,
          el.idCatalogo,
          this.item.id_woo,
          el.desperdicio,
          0,
          null,
          false,
          el.precargado
        );
      });

      if (this.items.length) {
        // this.registrarEstado("fin", this.idorden, 0).then(() => {
        // Enviar mensaje al cliente
        // this.$root.$on("bv::modal::hide", (bvEvent, modal) => {
        //     // console.log('Modal is about to be shown', bvEvent, modal)
        //     });
        // });
        /* this.$emit(
                    "registrarestado",
                    "fin",
                    this.idorden,
                    this.item.unidades
                ); */
        /* this.items.forEach((item) => {
                    // enviar estado
    
                    this.registrarEstado(
                        "fin",
                        this.idorden,
                        item.unidades
                    ).then(() => {
                        // Enviar mensaje al cliente
                        // this.$root.$on("bv::modal::hide", (bvEvent, modal) => {
                        //     // console.log('Modal is about to be shown', bvEvent, modal)
                        //     });
                    });
                }); */
      }
      // this.clearForms()
      this.$bvModal.hide(this.modal);
      // this.clearForms();
    },

    /* async registrarEstado_old(tipo, id_lotes_detalles, unidades) {
            // tipos: inicio, fin
            this.overlay = true;
            this.ButtonDisabled = true;
    
            await this.$axios
                .post(
                    `${this.$config.API}/empleados/registrar-paso/${tipo}/${this.$store.state.login.currentDepartamentId}/${id_lotes_detalles}/${unidades}`
                )
                .then((resp) => {
                    console.log("emitimos aqui...");
                    this.overlay = false;
                    this.$bvModal.hide(this.modal);
    
                    // this.$emit('reload', 'true')
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error registrando la accion",
                        html: `<p>Por favor intetelo de nuevo</p><p>${err}</p>`,
                        type: "warning",
                    });
                })
                .finally(() => {
                    if (tipo === "fin") {
                        this.$emit("reload");
                    }
                });
        }, */

    async getEficienciaEstimada() {
      if (eficienciaOrdenCacheModal[this.idorden]) {
        const cached = eficienciaOrdenCacheModal[this.idorden];
        this.eficienciaDetalles = cached.detalles;
        this.dataInsumosLocal = cached.insumos;
        this.eficienciaEstimada = cached.eficienciaEstimada;
        return;
      }

      const existing = (this.dataInsumos || []).filter(item => item.id_orden == this.idorden);
      if (existing.length > 0) {
        console.log(`getEficienciaEstimada: using parent dataInsumos for orden ${this.idorden}`);
        this.dataInsumosLocal = existing;
        this.eficienciaDetalles = []; // no detalles extra en cache
        this.eficienciaEstimada = this.eficienciaEstimada || 0;
        eficienciaOrdenCacheModal[this.idorden] = {
          detalles: this.eficienciaDetalles,
          insumos: existing,
          eficienciaEstimada: this.eficienciaEstimada,
        };
        return;
      }

      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/eficiencia-orden/${this.idorden}`, {
          params: {
            id_empleado: this.$store.state.login.dataUser.id_empleado,
            id_departamento: this.$store.state.login.currentDepartamentId,
          },
        })
        .then((res) => {
          this.eficienciaDetalles = res.data.detalles;
          const insumosData = (res.data.insumos_asignados || []).map(ins => ({ ...ins, id_orden: this.idorden }));
          this.dataInsumosLocal = insumosData;
          this.eficienciaEstimada = res.data.total_eficiencia[0].eficiencia_estimada;
          eficienciaOrdenCacheModal[this.idorden] = {
            detalles: this.eficienciaDetalles,
            insumos: insumosData,
            eficienciaEstimada: this.eficienciaEstimada,
          };
          console.log("insumos_Asigandos_Eficiencia", this.dataInsumosComputed);
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<P>No se cargaron los datos correctamente</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  watch: {
    // Observar cambios en el id_impresora de cada item del array
    // Cuando el usuario elige una impresora, inicializamos 'canales' con $set
    // para que Vue 2 pueda rastrear la reactividad de cada clave
    impresorasSeleccionadas: {
      handler(newVal) {
        newVal.forEach((impresora, index) => {
          if (!impresora.id_impresora) return;
          const printer = (this.impresoras || []).find(p => p._id === impresora.id_impresora);
          if (!printer || !printer.canales_colores) return;
          // Solo reinicializar si los canales no coinciden con los de la impresora
          const currentKeys = Object.keys(impresora.canales || {});
          const expectedKeys = printer.canales_colores.map(c => c.codigo);
          const needsInit = expectedKeys.some(k => !currentKeys.includes(k));
          if (needsInit) {
            const newCanales = {};
            printer.canales_colores.forEach(canal => {
              newCanales[canal.codigo] = impresora.canales[canal.codigo] || '';
            });
            this.$set(this.impresorasSeleccionadas[index], 'canales', newCanales);
          }
        });
      },
      deep: true,
    },

    dataInsumosComputed: {
      handler(val) {
        if (val && val.length > 0) {
          this.evaluateShowSelect();
        }
      },
      immediate: true,
    },
  },


  mounted() {
    console.log("XXX", this.inusmosTodos);

    this.esReposicion = parseInt(this.esreposicion);
    this.clearForms();

    this.$root.$on("bv::modal::show", (bvEvent, modal) => {
      if (modal === this.modal) {
        this.getEficienciaEstimada();
        this.refreshConfig();
        this.cargarConsumosPrevios();
      }
    });

    if (this.tipo === "todo") this.btnText = `Terminar Todo`;

    this.evaluateShowSelect();
    this.cargarConsumosPrevios();
  },

  props: [
    "item",
    "insumosTodos",
    "items",
    "pausas",
    "F",
    "tipo",
    "departamento",
    "esreposicion",
    "insumosimp",
    "insumoscos",
    "insumoslim",
    "insumosrev",
    "insumosest",
    "insumoscor",
    "idorden",
    "id_ordenes_productos",
    "reload",
    "orden_proceso_departamento",
    "impresoras",
    "dataInsumos",
  ],
};
</script>

<style scoped>
.cmyk {
  margin-top: 20px;
  padding: 2px !important;
  width: 30% !important;
}

.black-label {
  background-color: black;
  color: antiquewhite;
}

.cyan-label {
  background-color: cyan;
  color: black;
}

.yellow-label {
  background-color: yellow;
  color: black;
}

.magenta-label {
  background-color: magenta;
  color: black;
}

.white-label {
  background-color: white;
  color: black;
}
</style>
