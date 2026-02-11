<template>
  <div style="display: inline-flex; gap: 0.5rem; align-items: center;">
    <span style="display: inline-block;">
      <b-button @click="$bvModal.show(modal)" variant="success" :disabled="ButtonDisabled"
        data-testid="btn-terminar-todo">{{ btnText }}</b-button>
    </span>

    <!-- Pausas -->
    <span style="display: inline-block;">
      <empleados-pausasEmpleados :pausas="filterPausa(item.orden)" :pausasRaw="pausas" :item="$props.item"
        @reload="reloadMe" @disBtnTodo="disBtnTodo" />
    </span>

    <b-modal :id="modal" :title="title" hide-footer size="lg" data-testid="modal-datos-extra">
      <b-overlay :show="overlay" spinner-small>

        <!-- Alerta cuando faltan impresoras o insumos -->
        <b-alert v-if="$store.state.login.currentDepartament === 'Impresión' && !puedeUsarModalImpresion" show
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
          <div v-if="$store.state.login.currentDepartament === 'Impresión'">
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

              <!-- Tintas en layout horizontal -->
              <b-row>
                <b-col>
                  <b-form-group label="C">
                    <b-form-input :id="'input-cyan-' + index" v-model="impresora.colorCyan" type="number" step="0.1"
                      min="0" :disabled="!puedeUsarModalImpresion || impresora.id_impresora === null" :style="{
                        backgroundColor: colorMap.c,
                        color: 'black',
                        fontWeight: 'bold'
                      }"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group label="M">
                    <b-form-input :id="'input-magenta-' + index" v-model="impresora.colorMagenta" type="number"
                      step="0.1" min="0" :disabled="!puedeUsarModalImpresion || impresora.id_impresora === null" :style="{
                        backgroundColor: colorMap.m,
                        color: 'white',
                        fontWeight: 'bold'
                      }"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group label="Y">
                    <b-form-input :id="'input-yellow-' + index" v-model="impresora.colorYellow" type="number" step="0.1"
                      min="0" :disabled="!puedeUsarModalImpresion || impresora.id_impresora === null" :style="{
                        backgroundColor: colorMap.y,
                        color: 'black',
                        fontWeight: 'bold'
                      }"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group label="K">
                    <b-form-input :id="'input-black-' + index" v-model="impresora.colorBlack" type="number" step="0.1"
                      min="0" :disabled="!puedeUsarModalImpresion || impresora.id_impresora === null" :style="{
                        backgroundColor: colorMap.k,
                        color: 'white',
                        fontWeight: 'bold'
                      }"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col v-if="showWhiteInkFieldForIndex(index)">
                  <b-form-group label="W">
                    <b-form-input :id="'input-white-' + index" v-model="impresora.colorWhite" type="number" step="0.1"
                      min="0" :disabled="!puedeUsarModalImpresion || impresora.id_impresora === null" :style="{
                        backgroundColor: colorMap.w,
                        color: 'black',
                        fontWeight: 'bold'
                      }"></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
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
          <!-- INPUT DE DESPERDICIO PARA CORTE (SIEMPRE VISIBLE) -->
          <div v-if="$store.state.login.currentDepartament === 'Corte'" class="mb-4">
            <b-card bg-variant="light" border-variant="danger" class="mb-3">
              <h6 class="text-danger font-weight-bold mb-2">
                <b-icon icon="trash"></b-icon> Registro de Desperdicio
              </h6>
              <b-form-group label="Peso del desperdicio en kilos" label-size="sm" class="mb-0">
                <b-form-input id="input-13" v-model="desperdicioCorte" type="number" step="0.01" min="0"
                  size="lg" placeholder="Peso desperdicio (Kg)" required></b-form-input>
              </b-form-group>
            </b-card>
          </div>
          <!-- <div v-if="$store.state.login.currentDepartament === 'Corte'">
            <b-form-group label="Peso del desperdicio en kilos" label-for="desperdicio-corte">
              <b-form-input
                id="desperdicio-corte"
                v-model="desperdicioCorte"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ingrese el peso del desperdicio"
                required
              />
            </b-form-group>
          </div> -->


          <!-- MOSTRAR CANTIDAD DE MATERIAL UTILIZADO (PARA TODOS LOS DEPARTAMENTOS CONFIGURADOS) -->
          <!-- Ocultar para reposiciones porque no aplica el cálculo por pieza -->
          <div v-if="showSelect && !esReposicion" class="mb-4">
            <h5><strong>📊 Resumen de Material</strong></h5>
            
            <!-- INFO TELA VENDEDOR -->
            <div v-if="item.tela_vendedor" class="mb-3">
              <b-alert show variant="light" border-variant="primary" class="mb-0 py-2">
                <div class="d-flex align-items-center">
                  <b-icon icon="info-circle-fill" variant="primary" class="mr-2"></b-icon>
                  <div>
                    <span class="small font-weight-bold text-uppercase d-block text-primary">Tela Seleccionada por Vendedor:</span>
                    <span class="font-weight-bold text-dark">{{ item.tela_vendedor }}</span>
                  </div>
                </div>
              </b-alert>
            </div>

            <b-card bg-variant="light" class="mb-3">
              <!-- Material Estimado (desglosado por catálogo si hay múltiples insumos) -->
              <div v-if="materialEstimadoPorCatalogo.length === 1">
                <p class="mb-2">
                  <strong>Material Estimado (Sistema):</strong>
                  {{ materialEstimadoPorCatalogo[0].total }} {{ materialEstimadoPorCatalogo[0].unidad }}
                  de {{ materialEstimadoPorCatalogo[0].catalogo }}
                </p>
              </div>
              <div v-else-if="materialEstimadoPorCatalogo.length > 1">
                <p class="mb-2"><strong>Material Estimado (Sistema):</strong></p>
                <ul class="mb-2">
                  <li v-for="(item, index) in materialEstimadoPorCatalogo" :key="index">
                    <strong>{{ item.catalogo }}:</strong> {{ item.total }} {{ item.unidad }}
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
                  <small class="text-muted">({{ eficienciaPorcentaje >= 100 ? 'Óptimo' : 'Por encima del estimado'
                    }})</small>
                </p>
              </div>
            </b-card>
          </div>

          <!-- MUESTRA ROLLOS DE MATEERIAL SI ESTA EN CONFIGURACION -->
          <div v-if="showSelect && materialEstimadoPorCatalogo.length > 0">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0 text-muted font-weight-bold">
                <b-icon icon="layers-half"></b-icon> Asignación de Materiales
              </h5>
              <b-button variant="outline-primary" @click="addItem" pill size="sm">
                <b-icon icon="plus-circle-fill"></b-icon> Añadir Material
              </b-button>
            </div>

            <div v-for="(itemForm, index) in form" :key="index" class="mb-3 p-3 border rounded bg-white shadow-sm position-relative">
              <b-row class="align-items-end no-gutters">
                <b-col md="5" class="px-2">
                  <b-form-group label="Material" label-size="sm" class="mb-0">
                    <!-- Eficiencia de Insumo -->
                    <empleados-eficienciaInsumos v-if="itemForm.validInsumo" class="mb-1" :idorden="idorden"
                      :idinsumo="getId(itemForm.select)" :datainsumos="getCatalogosUnicos"
                      @update_catalogo="updateCatalogo(index, $event)" />
                      
                    <vue-typeahead-bootstrap @hit="loadInsumos(index)" :data="dataSearchInsumo" size="sm"
                      v-model="itemForm.select" placeholder="Buscar Insumo"
                      @input="itemForm.validInsumo = false" />
                  </b-form-group>
                </b-col>

                <b-col md="3" class="px-2">
                  <b-form-group :label="getPlaceholderRow(index)" label-size="sm" class="mb-0">
                    <b-form-input v-model.number="itemForm.input" type="number" step="0.01" min="0" 
                      :state="itemForm.input > 0" :placeholder="getUnidadRow(index)" required></b-form-input>
                  </b-form-group>
                </b-col>

                <b-col md="3" class="px-2 pb-1">
                  <b-form-checkbox v-model="itemForm.terminar" :disabled="!itemForm.validInsumo" 
                    class="small font-weight-bold text-danger">
                    Terminar Material
                  </b-form-checkbox>
                </b-col>

                <b-col md="1" class="text-right pb-1">
                  <b-button v-if="form.length > 1" variant="link" class="text-danger p-0" title="Eliminar fila" @click="removeItem(index)">
                    <b-icon icon="trash-fill" font-scale="1.2"></b-icon>
                  </b-button>
                </b-col>
              </b-row>
              
              <div v-if="itemForm.validInsumo" class="mt-2 px-1">
                <small class="text-muted">
                  <b-icon icon="check-circle-fill" variant="success"></b-icon> Insumo validado correctamente
                </small>
              </div>
            </div>
          </div>

          <b-button
            :disabled="ButtonDisabled || ($store.state.login.currentDepartament === 'Impresión' && !puedeUsarModalImpresion)"
            @click="validateForm" variant="primary" data-testid="btn-enviar-datos-extra">Enviar</b-button>
          <b-button
            :disabled="ButtonDisabled || ($store.state.login.currentDepartament === 'Impresión' && !puedeUsarModalImpresion)"
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
import eficienciaInsumoMixin from "~/mixins/mixin-insumos";
import mixin from "~/mixins/mixins.js";
export default {
  mixins: [eficienciaInsumoMixin, mixin],
  data() {
    return {
      esReposicion: null,
      queryInsumo: "",
      title: `Datos Extra ${this.$store.state.login.currentDepartament}`,
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
      // Array para múltiples impresoras
      impresorasSeleccionadas: [
        { id: 1, id_impresora: null, colorCyan: '', colorMagenta: '', colorYellow: '', colorBlack: '', colorWhite: '' }
      ],
      campos: [
        { key: "input", label: "" },
        { key: "id", label: "" },
      ],
      datosEficiencia: {},
      eficienciaCalculada: null,
      intentoDeCalculo: false,
      desperdicioCorte: 0,
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

    // Computed que combina datos del prop y datos locales del API
    dataInsumosComputed() {
      // Priorizar datos del prop si existen, sino usar los locales
      if (this.dataInsumos && this.dataInsumos.length > 0) {
        return this.dataInsumos;
      }
      return this.dataInsumosLocal;
    },

    dataInsumosFiltrado() {
      const depName = this.$store.state.login.currentDepartament;
      const depId = this.$store.state.login.currentDepartamentId;

      return this.dataInsumosComputed.filter((el) => {
        const isSameOrder = el.id_orden == this.idorden;
        if (!isSameOrder) return false;

        // Si es el mismo departamento ID, incluir
        if (el.id_departamento == depId) return true;

        // Lógica de departamentos hermanos (Estampado y Corte suelen compartir configuración de telas)
        const materialDepts = ["Estampado", "Corte"];
        if (
          materialDepts.includes(depName) &&
          materialDepts.includes(el.departamento)
        ) {
          return true;
        }

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

      // Usar un Map para evitar contar el mismo producto múltiples veces
      const productosUnicos = new Map();
      insumosDept.forEach((item) => {
        const key = item.id_ordenes_productos;
        if (!productosUnicos.has(key)) {
          productosUnicos.set(key, {
            cantidad_estimada: parseFloat(item.cantidad_estimada_de_consumo) || 0,
            unidades: parseInt(item.unidades) || 0,
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

      // Override visual de la unidad para Telas (Kg -> Mt)
      // Buscamos si alguno de los insumos filtrados es de tipo tela
      const esTela = insumosDept.some(ins => ins.tipo_insumo === 'tela');
      if (esTela && unidad === 'Kg') {
        unidad = 'Mt';
      }

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
          productosUnicos.set(key, {
            catalogo: item.catalogo || 'Sin catálogo',
            cantidad_estimada: parseFloat(item.cantidad_estimada_de_consumo) || 0,
            unidades: parseInt(item.unidades) || 0,
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

      // Convertir a array y formatear totales
      return Array.from(catalogoMap.values()).map(item => {
        let unidadMostrar = item.unidad;
        // Override visual de la unidad para Telas (Kg -> Mt)
        if (item.tipo_insumo === 'tela' && unidadMostrar === 'Kg') {
          unidadMostrar = 'Mt';
        }

        return {
          catalogo: item.catalogo,
          total: item.total.toFixed(2),
          unidad: unidadMostrar
        }
      });
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

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    dataSearchInsumo() {
      return this.insumosTodos.map((el) => {
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

      // Lógica dinámica basada en insumosTodos filtrado por el departamento actual
      if (this.insumosTodos && Array.isArray(this.insumosTodos)) {
        // Filtrar insumos que corresponden directamente al departamento
        myOptions = this.insumosTodos.filter((item) => item.departamento === dep);

        // Casos especiales de mapeo de departamentos (Telas -> Estampado/Corte)
        if (["Estampado", "Corte"].includes(dep)) {
          const telInsumos = this.insumosTodos.filter(
            (item) => item.departamento === "Telas"
          );

          let estInsumos = [];
          if (dep === "Corte") {
            estInsumos = this.insumosTodos.filter(
              (item) => item.departamento === "Estampado"
            );
          }

          myOptions = [...myOptions, ...telInsumos, ...estInsumos];
        }

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
      // Reset showSelect antes de re-evaluar
      this.showSelect = false;

      if (this.$store.state.login.currentDepartament === "Impresión") {
        this.showSelect = true;
        return;
      }

      // DETECCIÓN AUTOMÁTICA: Si hay insumos estimados para esta orden y departamento, mostrar sección siempre
      if (
        this.materialEstimadoPorCatalogo &&
        this.materialEstimadoPorCatalogo.length > 0
      ) {
        this.showSelect = true;
        console.log(
          "DEBUG - Modal Extra - Detección automática exitosa (Insumos encontrados)"
        );
        return;
      }

      // CAÍDA A CONFIGURACIÓN MANUAL: Si no hay insumos detectados, respetamos la configuración global
      const dep = this.$store.state.login.currentDepartament;
      const dataSys = this.$store.state.login.datos_personalizacion || {};

      const showEstampado = dataSys.sys_mostrar_rollo_en_empleado_estampado;
      const showCorte = dataSys.sys_mostrar_rollo_en_empleado_corte;
      const showCostura = dataSys.sys_mostrar_insumo_en_empleado_costura;
      const showLimpieza = dataSys.sys_mostrar_insumo_en_empleado_limpieza;
      const showRevision = dataSys.sys_mostrar_insumo_en_empleado_revision;

      if (dep === "Estampado" && showEstampado) this.showSelect = true;
      if (dep === "Corte" && showCorte) this.showSelect = true;
      if (dep === "Costura" && showCostura) this.showSelect = true;
      if (dep === "Limpieza" && showLimpieza) this.showSelect = true;
      if (dep === "Revisión" && showRevision) this.showSelect = true;

      console.log("DEBUG - Modal Extra - showSelect final:", this.showSelect);
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

      // CALCULAR EL RENDIMIENTO DEL MATERIAL
      this.getDataEficiencia(
        this.idorden,
        this.$store.state.login.currentDepartamentId
      ).then(() => this.calcular());
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
        colorCyan: '',
        colorMagenta: '',
        colorYellow: '',
        colorBlack: '',
        colorWhite: '',
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

    // Determina si mostrar el campo de tinta blanca para una impresora específica
    showWhiteInkFieldForIndex(index) {
      if (!this.impresoras || this.impresoras.length === 0) return false;
      const selectedId = this.impresorasSeleccionadas[index]?.id_impresora;
      if (!selectedId) return false;
      const selectedPrinter = this.impresoras.find(imp => imp._id === selectedId);
      return selectedPrinter && selectedPrinter.tipo_tecnologia === 'CMYKW';
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
        if (this.$store.state.login.currentDepartament === 'Estampado') {
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
        // 1. Process standard consumption for ALL items (finished or not)
        // But wait, the user wants: "primero registramos el consumo ... y acto seguido solicitamos terminar"
        // My implementation of termineTodo sends consumption.

        // Strategy:
        // Iterate through batchItems.
        // For each:
        //   1. Send Consumption (standard call, wait response).
        //   2. Check response.
        //   3. If success, Send Finish (tipo='fin', remanente).

        // For items NOT in batchItems but in form? They should be processed normally?
        // terminateTodo iterates over everything.

        // Modified approach: We will handle the "Terminar" items specifically here, 
        // AND we must ensure the `terminarTodo` logic doesn't double-submit or conflict.
        // Ideally `terminarTodo` should only process items that are NOT being finished here?
        // OR `validateForm` calls `prepareBatchTerminar`, and `handleBatchTerminarConfirm` 
        // takes over the responsibility of submitting EVERYTHING.

        // Let's implement full submission loop here for consistency.

        // Separate items into: "To Finish" and "Just Update".
        const indexesToFinish = this.batchItems.map(i => i.originalIndex);

        // Process "Just Update" items (Consumption only)
        for (let i = 0; i < this.form.length; i++) {
          if (!indexesToFinish.includes(i)) {
            // Standard submission logic from postImp/terminarTodo
            // ... (Reuse or call postInventarioMovimientos for normal items)
            // For now, let's focus on the batch items logic requested.
            // The user said: "Intercept submit... register consumption... then finish".

            // We will modify logic to:
            // 1. Submit consumption for ALL validated items (including batch ones).
            // 2. THEN, submit 'Finish' signal for the batch ones.
          }
        }

        // Let's assume validateForm calls prepareBatchTerminar.
        // We will iterate ALL form items.

        for (let i = 0; i < this.form.length; i++) {
          const formItem = this.form[i];
          const batchItem = this.batchItems.find(b => b.originalIndex === i);

          // 1. Send Consumption (Always)
          let idInsumo = formItem.select;
          if (idInsumo && idInsumo.includes('|')) {
            idInsumo = idInsumo.split('|')[0].trim();
          }

          // Call API Consumption
          const res = await this.postInventarioMovimientos(
            formItem.input,
            idInsumo,
            this.item.id_woo,
            null, null, 0, // No remanente
            'consumo' // Explicitly send as consumption
          );

          // 2. If item is in batch AND response success (ignore update_success flag for robustness)
          if (batchItem && res && res.data) { // Removed && res.data.update_success
            // Send Finish Signal with Auto Remanente
            console.log(`Finishing item ${batchItem.insumoName} automatically. AutoRemanente=true`);
            await this.postInventarioMovimientos(
              0, // Consumption 0 (already sent)
              idInsumo,
              this.item.id_woo,
              null, null,
              0, // remanente value ignored by backend if auto_remanente is true, but sent as 0
              'fin', // Type 'fin'
              true // auto_remanente = true
            );
            console.log(`Finish request sent for ${batchItem.insumoName}`);
          }
        }

        // Handle desperdicioCorte if applicable
        if (this.$store.state.login.currentDepartament === "Corte") {
          await this.postInventarioMovimientos(
            0, // cantidad consumida (no aplica para desperdicio)
            null, // id insumo (no aplica)
            null, // id catalogo (no aplica)
            this.item.id_woo,
            this.desperdicioCorte, // desperdicio del corte
            0, // remanente
            'desperdicio' // Custom type for desperdicio
          );
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

    async rendimiento(valor, idOrden) {
      const data = new URLSearchParams();
      data.set("id_orden", idOrden);
      data.set("valor", valor);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("departamento", this.$store.state.login.currentDepartament);

      await this.$axios
        .post(`${this.$config.API}/insumos/rendimiento`, data)
        .then((res) => {
          console.log("Rendimienot enviado");
          // this.resetForm()
          // this.$bvModal.hide(this.modal)
        });
    },

    clearForms() {
      this.form = [];
      this.desperdicioCorte = 0;
      // Reset array de impresoras a estado inicial
      this.impresorasSeleccionadas = [
        { id: 1, id_impresora: null, colorCyan: '', colorMagenta: '', colorYellow: '', colorBlack: '', colorWhite: '' }
      ];

      this.formEst = {
        input: 0,
      };

      this.formCor = {
        input: 0,
      };
    },

    onReserForm(event) {
      event.preventDefault();
      this.clearForms();
    },

    // VALIDACIÓN DE FORMULARIOS
    validateForm() {
      let ok = true;

      // CONDITION MODIFIED: Check if there are actually insumos available to select.
      // selectOptions always has at least at least 1 item ("Seleccione una opción").
      // If it has > 1, it means there are insumos populated for this department.
      const hayInsumosDisponibles = this.selectOptions && this.selectOptions.length > 1;

      if (this.showSelect && hayInsumosDisponibles && this.materialEstimadoPorCatalogo.length > 0) {
        let msg = "";

        if (this.$store.state.login.currentDepartament === "Impresión") {
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
            // Validar cada impresora en el array
            for (let i = 0; i < this.impresorasSeleccionadas.length; i++) {
              const impresora = this.impresorasSeleccionadas[i];
              const numImp = i + 1;

              if (impresora.id_impresora === null) {
                ok = false;
                msg = msg + `<p>Impresora ${numImp}: Seleccione una impresora</p>`;
              }

              if (
                parseFloat(impresora.colorCyan) <= 0 ||
                impresora.colorCyan.toString().trim() === ""
              ) {
                ok = false;
                msg = msg + `<p>Impresora ${numImp}: Ingrese la cantidad de tinta Cyan</p>`;
              }

              if (
                parseFloat(impresora.colorMagenta) <= 0 ||
                impresora.colorMagenta.toString().trim() === ""
              ) {
                ok = false;
                msg = msg + `<p>Impresora ${numImp}: Ingrese la cantidad de tinta Magenta</p>`;
              }

              if (
                parseFloat(impresora.colorYellow) <= 0 ||
                impresora.colorYellow.toString().trim() === ""
              ) {
                ok = false;
                msg = msg + `<p>Impresora ${numImp}: Ingrese la cantidad de tinta Yellow</p>`;
              }

              if (
                impresora.colorBlack.toString().trim() === "" ||
                parseFloat(impresora.colorBlack) <= 0
              ) {
                ok = false;
                msg = msg + `<p>Impresora ${numImp}: Ingrese la cantidad de tinta Black</p>`;
              }

              // Verificar tinta blanca si la impresora la soporta
              if (this.showWhiteInkFieldForIndex(i)) {
                if (
                  impresora.colorWhite.toString().trim() === "" ||
                  parseFloat(impresora.colorWhite) <= 0
                ) {
                  ok = false;
                  msg = msg + `<p>Impresora ${numImp}: Ingrese la cantidad de tinta White</p>`;
                }
              }
            }
          }
        }

        if (this.$store.state.login.currentDepartament === "Corte") {
          // VALIDAR DESPERDICIO DEL CORTE
          if (this.desperdicioCorte === null || this.desperdicioCorte === "") {
            ok = false;
            msg = msg + "<p>Ingrese el peso del desperdicio del corte</p>";
          }
          // Si es 0, permitir pero con confirmación
        }

        if (this.form.length === 0) {
          ok = false;
          msg = msg + "<p>Debe asignar al menos un insumo</p>";
        }

        const formTmp = this.form;

        const errors = formTmp.find(
          (el) => el.input === 0 || el.select === null
        );

        if (errors) {
          ok = false;
          msg =
            msg +
            "<p>Debe seleccionar el tipo de insumo y llenar todos los campos del formulario.</p>";
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

          // ok = false;
        } else {
          // Validación especial para Corte: confirmar si desperdicio es 0
          if (
            this.$store.state.login.currentDepartament === "Corte" &&
            this.desperdicioCorte === 0
          ) {
            this.$confirm(
              "¿Está seguro que desea enviar el desperdicio con valor 0? Esto significa que no hubo desperdicio de material.",
              "Confirmar desperdicio",
              "question"
            )
              .then(() => {
                // Usuario confirmó, continuar con el envío
                this.prepareBatchTerminar();
                // this.terminarTodo(); // Moved inside prepare/handle
              })

              .catch(() => {
                // Usuario canceló, no hacer nada
                return false;
              });
          } else {
            // Validación normal o desperdicio > 0
            if (this.$store.state.login.currentDepartament === "Impresión") {
              this.postImp();
            }
            this.prepareBatchTerminar();
            // this.terminarTodo();
          }
        }
      } else {
        // Enviar solo el formulario aqui
        this.terminarTodo();
      }

      return ok;
    },

    async postImp() {
      // Iterar sobre todas las impresoras seleccionadas
      const promises = this.impresorasSeleccionadas.map(async (impresora, index) => {
        const data = new URLSearchParams();
        data.set("id_orden", this.idorden);
        data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
        data.set("c", impresora.colorCyan);
        data.set("m", impresora.colorMagenta);
        data.set("y", impresora.colorYellow);
        data.set("k", impresora.colorBlack);
        data.set("id_impresora", impresora.id_impresora);
        data.set("w", this.showWhiteInkFieldForIndex(index) ? impresora.colorWhite : null);

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
      autoRemanente = false
    ) {
      // this.overlay = true;
      // Buscar cantidad actual del insumo
      let cantidadInsumo;
      if (this.$store.state.login.currentDepartament === "Impresión") {
        cantidadInsumo = this.insumosimp.filter(
          (item) => item._id == idProducto
        );
      } else if (this.$store.state.login.currentDepartament === "Estampado") {
        console.log("enviemos datos de estampado");
        cantidadInsumo = this.insumosest.filter(
          (item) => item._id == idProducto
        );
      } // (else if...) Continuar con los otros departamentos aqui.
      else if (this.$store.state.login.currentDepartament === "Corte") {
        cantidadInsumo = this.insumoscor.filter(
          (item) => item._id == idProducto
        );
      }

      const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("id_departamento", this.$store.state.login.currentDepartamentId);
      data.set("departamento", this.$store.state.login.currentDepartament);
      data.set("id_insumo", idInsumo);
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

      const response = await this.$axios
        .post(
          `${this.$config.API}/inventario-movimientos/empleados/update-insumo`,
          data
        );

      return response; // Return for response checking
    },

    async postReposicion() {
      const data = new URLSearchParams();
      data.set("id_orden", idOrden);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("terminar", 1);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("departamento", this.$store.state.login.currentDepartament);

      await this.$axios
        .post(`${this.$config.API}/insumos/rendimiento`, data)
        .then((res) => {
          console.log("Rendimienot enviado");
          // this.resetForm()
          // this.$bvModal.hide(this.modal)
        });
    },

    async registrarEstado(tipo, id_orden, unidades) {
      this.overlay = true;
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
      // this.sendMsgCustom(this.idorden, 'fin', this.$store.state.login.currentDepartamentId);

      // Para Corte, enviar el desperdicio único
      if (this.$store.state.login.currentDepartament === "Corte") {
        this.postInventarioMovimientos(
          0, // cantidad consumida (no aplica para desperdicio)
          null, // id insumo (no aplica)
          null, // id catalogo (no aplica)
          this.item.id_woo,
          this.desperdicioCorte // desperdicio del corte
        );
      }

      // Para otros departamentos, enviar los elementos del formulario
      this.form.forEach((el) => {
        console.log("Enviamos elemento del formulario", el);

        this.postInventarioMovimientos(
          // this.formImp.inputImp1,
          el.input,
          el.select,
          el.idCatalogo,
          this.item.id_woo,
          el.desperdicio
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

    calcular() {
      this.intentoDeCalculo = true;
      this.eficienciaCalculada = this.calcularEficienciaInsumo(
        this.datosEficiencia
      );

      // Ejemplo de cómo podrías usarlo con otros datos
      // const otrosDatos = {
      //   cantidadProductosOrden: 10,
      //   consumoRealTotalOrdenUnidadBase: 0, // No se usó este insumo
      //   factorConversionUnidadInsumo: 5,
      //   consumoTeoricoPorProductoUnidadConvertida: 1
      // };
      // const otraEficiencia = this.calcularEficienciaInsumo(otrosDatos);
      // console.log('Otra eficiencia:', otraEficiencia); // Debería ser Infinity

      // const datosConDesperdicio = {
      //   cantidadProductosOrden: 5,
      //   consumoRealTotalOrdenUnidadBase: 0.5, // Se gastó 0.5 kg
      //   factorConversionUnidadInsumo: 1, // kg a kg (sin conversión)
      //   consumoTeoricoPorProductoUnidadConvertida: 0 // No se esperaba gastar nada
      // };
      // const eficienciaDesperdicio = this.calcularEficienciaInsumo(datosConDesperdicio);
      // console.log('Eficiencia con desperdicio:', eficienciaDesperdicio); // Debería ser 0
    },

    async getDataEficiencia(idOrden, idDep) {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/inventario/eficiencia/${idOrden}/${idDep}`)
        .then((res) => {
          console.log("datos:", res.data[0]);

          this.datosEficiencia = res.data[0];
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<P>No se cargaron los datos correctamente</p><p>${err}</p>`,
            type: "error",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    async getEficienciaEstimada() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/eficiencia-orden/${this.idorden}`)
        .then((res) => {
          this.eficienciaDetalles = res.data.detalles;
          this.dataInsumosLocal = (res.data.insumos_asignados || []).map(ins => ({ ...ins, id_orden: this.idorden }));
          this.eficienciaEstimada =
            res.data.total_eficiencia[0].eficiencia_estimada;
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
    'formImp.id_impresora'(newVal, oldVal) {
      // Limpiar los inputs de tintas cuando se cambia la impresora seleccionada
      if (newVal !== oldVal) {
        this.formImp.colorCyan = "";
        this.formImp.colorMagenta = "";
        this.formImp.colorYellow = "";
        this.formImp.colorBlack = "";
        this.formImp.colorWhite = "";
      }
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
      }
    });

    if (this.tipo === "todo") this.btnText = `Terminar Todo`;

    this.evaluateShowSelect();
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
