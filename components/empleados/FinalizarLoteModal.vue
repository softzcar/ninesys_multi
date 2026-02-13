<template>
  <b-modal v-model="show" :title="`Finalizar Lote #${loteId}`" size="xl" hide-footer @hidden="resetAndClose">
    <b-overlay :show="overlay">
      <b-container fluid>
        <b-row>
          <b-col>
            <b-card bg-variant="light" class="mb-3 text-center">
              <h5 class="card-title">Resumen de Consumo Previo</h5>
              <p class="card-text mb-0">
                <strong>Papel Utilizado (calculado):</strong>
                <span class="h5"> {{ totalPapelUtilizado.toFixed(2) }} m²</span>
              </p>
            </b-card>
          </b-col>
        </b-row>

        <b-row v-if="telasDelLote.length > 0" class="mb-3">
          <b-col>
            <b-alert show variant="light" border-variant="primary" class="text-center py-3 mb-0 shadow-sm">
              <div class="h6 mb-2 text-uppercase font-weight-bold text-primary">
                <b-icon icon="info-circle-fill" class="mr-1"></b-icon>
                Material(es) del Catálogo Seleccionado(s) por Vendedor:
              </div>
              <div class="h4 font-weight-bold mb-0 text-dark">
                {{ telasDelLote.join(', ') }}
              </div>
            </b-alert>
          </b-col>
        </b-row>

        <hr />

        <hr />
        <h5>Registro de Consumo de Material por Orden</h5>

        <!-- Lista de órdenes -->
        <b-row v-for="(orden, index) in ordenesDeduplicadas" :key="orden.id_orden"
          v-if="debeMostrarOrden(orden.id_orden)" class="mb-3 align-items-center">
          <b-col md="12">
            <b-card border-variant="dark" shadow-sm>
              <b-row class="align-items-center">
                <b-col md="4">
                  <div class="d-flex flex-column">
                    <strong>#{{ orden.id_orden }} - {{ orden.cliente_nombre }}</strong>
                    <small v-if="orden.tela_vendedor_unificada" class="text-primary font-weight-bold mt-1">
                      <b-icon icon="info-circle-fill"></b-icon> Tela: {{ orden.tela_vendedor_unificada }}
                    </small>
                  </div>
                </b-col>
                <b-col md="4" class="text-info">
                  <small v-if="estimadosPorOrden[orden.id_orden]">
                    Material Estimado: {{ estimadosPorOrden[orden.id_orden] }}
                  </small>
                </b-col>
                <b-col md="4" class="text-right">
                  <b-form-checkbox v-model="consumosPorOrden[orden.id_orden][0].active" switch>
                    Registrar Consumo
                  </b-form-checkbox>
                </b-col>
              </b-row>

              <!-- Inputs si está activo -->
              <div v-if="consumosPorOrden[orden.id_orden].length > 0 && consumosPorOrden[orden.id_orden][0].active">
                <hr>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="mb-0 text-muted font-weight-bold">
                    <b-icon icon="layers-half"></b-icon> Registro de Materiales
                  </h6>
                  <b-button variant="outline-primary" size="sm" @click="addMaterial(orden.id_orden)" pill>
                    <b-icon icon="plus-circle-fill"></b-icon> Añadir otro material
                  </b-button>
                </div>

                <b-row v-for="(consumo, cIndex) in consumosPorOrden[orden.id_orden]" :key="cIndex"
                  class="mt-2 pb-3 mb-2 border-bottom align-items-end no-gutters">
                  <b-col md="4" class="px-2">
                    <b-form-group label="Material" label-size="sm" class="mb-0">
                      <empleados-InsumoTypeHead v-model="consumo.id_insumo" :insumos="insumos" />
                    </b-form-group>
                  </b-col>
                  <b-col :md="isCorte ? 2 : 3" class="px-2">
                    <b-form-group :label="getLabelCantidad(consumo.id_insumo)" label-size="sm" class="mb-0">
                      <b-form-input v-model.number="consumo.cantidad" type="number" step="0.01" size="sm"
                        :state="consumo.cantidad > 0" :placeholder="getItemUnidad(consumo.id_insumo)" />
                    </b-form-group>
                  </b-col>
                  <b-col v-if="isCorte" md="2" class="px-2">
                    <b-form-group label="Desperdicio (Kg)" label-size="sm" class="mb-0">
                      <b-form-input v-model.number="consumo.desperdicio" type="number" step="0.01" size="sm" />
                    </b-form-group>
                  </b-col>
                  <b-col md="2" class="px-2 pb-1">
                    <b-form-checkbox v-model="consumo.terminar_material" variant="danger"
                      class="small font-weight-bold text-danger">
                      Terminar Material
                    </b-form-checkbox>
                  </b-col>
                  <b-col md="1" class="text-right pb-1">
                    <b-button v-if="cIndex > 0" variant="link" class="text-danger p-0" title="Eliminar fila"
                      @click="removeMaterial(orden.id_orden, cIndex)">
                      <b-icon icon="trash-fill" font-scale="1.2"></b-icon>
                    </b-button>
                  </b-col>

                  <b-col md="12" class="px-2 mt-1" v-if="consumo.id_insumo">
                    <small :class="validarStockItem(orden.id_orden, cIndex) ? 'text-muted' : 'text-danger fw-bold'">
                      <b-icon
                        :icon="validarStockItem(orden.id_orden, cIndex) ? 'info-circle' : 'exclamation-circle'"></b-icon>
                      Stock disponible: {{ getStockDisponibleItem(orden.id_orden, cIndex).toFixed(2) }} {{
                        getItemUnidad(consumo.id_insumo) }}
                    </small>
                  </b-col>
                </b-row>
              </div>

              <!-- Sección de Tintas (solo Impresión) -->
              <div v-if="isImpresion && consumosPorOrden[orden.id_orden][0].active">
                <hr>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="mb-0 text-muted font-weight-bold">
                    <b-icon icon="printer-fill"></b-icon> Registro de Tintas
                  </h6>
                  <b-button variant="outline-info" size="sm" @click="addImpresora(orden.id_orden)" pill
                    :disabled="!puedeAnadirImpresoraOrden(orden.id_orden)">
                    <b-icon icon="plus-circle-fill"></b-icon> Añadir Impresora
                  </b-button>
                </div>

                <b-card v-for="(tinta, tIndex) in tintasPorOrden[orden.id_orden]" :key="'tinta-' + tIndex"
                  bg-variant="light" class="mb-2" body-class="py-2 px-3">
                  <b-row align-v="center">
                    <b-col md="5">
                      <b-form-group label="Impresora" label-size="sm" class="mb-0">
                        <b-form-select v-model="tinta.id_impresora" size="sm"
                          :options="getImpresorasOptionsForOrden(orden.id_orden, tIndex)">
                        </b-form-select>
                      </b-form-group>
                    </b-col>
                    <b-col v-for="color in ['c', 'm', 'y', 'k']" :key="color" class="px-1">
                      <b-form-group :label="color.toUpperCase()" label-size="sm" class="mb-0">
                        <b-form-input v-model.number="tinta[color]" type="number" step="0.1" size="sm" :style="{
                          backgroundColor: colorMap[color],
                          color: color === 'k' || color === 'm' ? 'white' : 'black',
                          fontWeight: 'bold'
                        }" :disabled="!tinta.id_impresora"></b-form-input>
                      </b-form-group>
                    </b-col>
                    <b-col v-if="showWhiteInkField(orden.id_orden, tIndex)" class="px-1">
                      <b-form-group label="W" label-size="sm" class="mb-0">
                        <b-form-input v-model.number="tinta.w" type="number" step="0.1" size="sm" :style="{
                          backgroundColor: colorMap.w,
                          color: 'black',
                          fontWeight: 'bold'
                        }" :disabled="!tinta.id_impresora"></b-form-input>
                      </b-form-group>
                    </b-col>
                    <b-col md="1" class="text-right" v-if="tintasPorOrden[orden.id_orden].length > 1">
                      <b-button variant="link" class="text-danger p-0" @click="removeImpresora(orden.id_orden, tIndex)">
                        <b-icon icon="trash-fill" font-scale="1.1"></b-icon>
                      </b-button>
                    </b-col>
                  </b-row>
                </b-card>
              </div>
            </b-card>
          </b-col>
        </b-row>

        <!-- Mensaje si no hay órdenes que requieran insumos -->
        <b-row v-if="ordenesQueRequierenInsumos.length === 0" class="mb-3">
          <b-col>
            <b-alert show variant="info" class="text-center">
              No hay insumos configurados para las órdenes de este lote en este departamento.<br>
              Puede finalizar el lote para registrar el paso y las comisiones.
            </b-alert>
          </b-col>
        </b-row>

        <hr />

        <b-row>
          <b-col>
            <b-button variant="success" @click="confirmarFinalizacion" :disabled="!formValid" block size="lg">
              <b-icon icon="check-all"></b-icon> Confirmar y Finalizar Lote
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>
  </b-modal>
</template>

<script>
import mixin from '~/mixins/mixins.js'

export default {
  mixins: [mixin],
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    loteId: {
      type: Number,
      required: true,
    },
    totalPapelUtilizado: {
      type: Number,
      default: 0,
    },
    insumos: {
      type: Array,
      required: true,
    },
    ordenes: {
      type: Array,
      default: () => [],
    },
    dataInsumos: {
      type: Array,
      default: () => [],
    },
    impresoras: {
      type: Array,
      default: () => [],
    },
    esReposicion: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      overlay: false,
      // Manejar consumos por ID de orden
      consumosPorOrden: {},
      // Manejar tintas por orden (solo Impresión)
      tintasPorOrden: {},
      colorMap: {
        c: '#00FFFF',
        m: '#FF00FF',
        y: '#FFFF00',
        k: '#343A40',
        w: '#F8F9FA',
      },
    }
  },
  watch: {
    ordenes: {
      immediate: true,
      handler(newOrdenes) {
        if (newOrdenes && newOrdenes.length > 0) {
          const newConsumos = { ...this.consumosPorOrden };
          const newTintas = { ...this.tintasPorOrden };
          newOrdenes.forEach((o) => {
            if (!newConsumos[o.id_orden]) {
              this.$set(newConsumos, o.id_orden, [
                {
                  id_insumo: null,
                  cantidad: null,
                  desperdicio: 0,
                  terminar_material: false,
                  active: false,
                }
              ]);
            }
            if (!newTintas[o.id_orden]) {
              this.$set(newTintas, o.id_orden, [
                { id_impresora: null, c: 0, m: 0, y: 0, k: 0, w: 0 }
              ]);
            }
          });
          this.consumosPorOrden = newConsumos;
          this.tintasPorOrden = newTintas;
        }
      },
    },
  },
  computed: {
    estimadosPorOrden() {
      if (!this.dataInsumos || this.dataInsumos.length === 0) return {};
      const result = {};
      this.ordenes.forEach((orden) => {
        result[orden.id_orden] = this.calcularEstimado(orden.id_orden);
      });
      return result;
    },
    isCorte() {
      return this.$store.state.login.currentDepartament === 'Corte';
    },
    isImpresion() {
      return this.$store.state.login.currentDepartament === 'Impresión';
    },
    ordenesQueRequierenInsumos() {
      return this.ordenes.filter(o => this.debeMostrarOrden(o.id_orden));
    },
    stockDinamico() {
      const stockMap = {};
      this.insumos.forEach((ins) => {
        stockMap[ins._id] = parseFloat(ins.cantidad);
      });

      const consumosMap = {};
      Object.keys(this.consumosPorOrden).forEach((idOrden) => {
        const lista = this.consumosPorOrden[idOrden];
        if (lista[0].active) {
          lista.forEach(c => {
            if (c.id_insumo && c.cantidad > 0) {
              const insumo = this.insumos.find(i => i._id === c.id_insumo);
              let consumoKilos = parseFloat(c.cantidad);
              if (this.isTela(insumo)) {
                consumoKilos = c.cantidad / insumo.rendimiento;
              }
              if (!consumosMap[c.id_insumo]) consumosMap[c.id_insumo] = 0;
              consumosMap[c.id_insumo] += consumoKilos;
            }
          });
        }
      });

      const result = {};
      Object.keys(stockMap).forEach((idIns) => {
        result[idIns] = stockMap[idIns] - (consumosMap[idIns] || 0);
      });
      return result;
    },
    formValid() {
      const activeIds = Object.keys(this.consumosPorOrden).filter(k => this.consumosPorOrden[k][0].active);
      if (activeIds.length === 0) return true;
      const materialesValidos = activeIds.every(id => {
        return this.consumosPorOrden[id].every((c, index) => {
          return c.id_insumo && c.cantidad > 0 && this.validarStockItem(id, index);
        });
      });
      if (!materialesValidos) return false;
      // Validación adicional para Impresión: al menos 1 impresora con 1 color > 0
      if (this.isImpresion) {
        return activeIds.every(id => {
          const tintas = this.tintasPorOrden[id];
          if (!tintas || tintas.length === 0) return false;
          return tintas.every(t => {
            return t.id_impresora && (t.c > 0 || t.m > 0 || t.y > 0 || t.k > 0 || t.w > 0);
          });
        });
      }
      return true;
    },
    ordenesDeduplicadas() {
      if (!this.ordenes || this.ordenes.length === 0) return [];
      const map = new Map();
      this.ordenes.forEach(o => {
        if (!map.has(o.id_orden)) {
          map.set(o.id_orden, {
            ...o,
            telas_vendedor_list: new Set()
          });
        }
        if (o.tela_vendedor) {
          map.get(o.id_orden).telas_vendedor_list.add(o.tela_vendedor);
        }
      });
      return Array.from(map.values()).map(o => ({
        ...o,
        tela_vendedor_unificada: Array.from(o.telas_vendedor_list).join(', ')
      }));
    },
    telasDelLote() {
      if (!this.ordenes || this.ordenes.length === 0) return [];
      const telas = new Set();
      this.ordenes.forEach(o => {
        if (o.tela_vendedor) {
          o.tela_vendedor.split(',').forEach(t => {
            const trimmed = t.trim();
            if (trimmed) telas.add(trimmed);
          });
        }
      });
      return Array.from(telas);
    }
  },
  methods: {
    calcularEstimado(idOrden) {
      const depId = this.$store.state.login.currentDepartamentId;
      const depName = this.$store.state.login.currentDepartament;

      const insumosFiltrados = this.dataInsumos.filter((el) => {
        if (el.id_orden != idOrden) return false;
        if (el.id_departamento == depId) return true;
        const materialDepts = ["Estampado", "Corte"];
        return materialDepts.includes(depName) && materialDepts.includes(el.departamento);
      });

      if (insumosFiltrados.length === 0) return null;

      const productosUnicos = new Map();
      insumosFiltrados.forEach((item) => {
        const key = `${item.id_ordenes_productos}_${item.catalogo}`;
        if (!productosUnicos.has(key)) {
          productosUnicos.set(key, {
            catalogo: item.catalogo || 'Sin catálogo',
            cantidad: parseFloat(item.cantidad_estimada_de_consumo) || 0,
            unidades: parseInt(item.unidades) || 0,
            unidad: (item.tipo_insumo === 'tela' && item.unidad_de_medida === 'Kg') ? 'Mt' : (item.unidad_de_medida || 'Metros')
          });
        }
      });

      const catalogoMap = new Map();
      productosUnicos.forEach((p) => {
        const total = p.cantidad * p.unidades;
        if (catalogoMap.has(p.catalogo)) {
          catalogoMap.get(p.catalogo).total += total;
        } else {
          catalogoMap.set(p.catalogo, { total, unidad: p.unidad, nombre_catalogo: p.catalogo });
        }
      });

      return Array.from(catalogoMap.values())
        .map(i => `${i.total.toFixed(2)} ${i.unidad} (${i.nombre_catalogo})`)
        .join(', ');
    },
    debeMostrarOrden(idOrden) {
      // Si hay estimados para esta orden en este departamento (o hermanos), mostrar
      const estimado = this.estimadosPorOrden[idOrden];
      if (estimado && estimado !== '') return true;

      // Si no hay estimados, dependemos de la configuración manual (legacy support)
      const dep = this.$store.state.login.currentDepartament;
      const dataSys = this.$store.state.login.datos_personalizacion || {};

      const configMap = {
        'Estampado': dataSys.sys_mostrar_rollo_en_empleado_estampado,
        'Corte': dataSys.sys_mostrar_rollo_en_empleado_corte,
        'Impresión': dataSys.sys_mostrar_rollo_en_empleado_estampado, // Reutiliza config de Estampado
        'Costura': dataSys.sys_mostrar_insumo_en_empleado_costura,
        'Limpieza': dataSys.sys_mostrar_insumo_en_empleado_limpieza,
        'Revisión': dataSys.sys_mostrar_insumo_en_empleado_revision
      };

      return !!configMap[dep];
    },
    validarStockItem(idOrden, index) {
      const c = this.consumosPorOrden[idOrden][index];
      if (!c || !c.id_insumo) return true;
      const disponible = this.getStockDisponibleItem(idOrden, index);
      return parseFloat(c.cantidad || 0) <= disponible;
    },
    getStockDisponibleItem(idOrden, index) {
      const currentItem = this.consumosPorOrden[idOrden][index];
      if (!currentItem || !currentItem.id_insumo) return 0;

      const insumo = this.insumos.find(i => i._id === currentItem.id_insumo);
      if (!insumo) return 0;

      const stockOriginalKilos = parseFloat(insumo.cantidad);

      // Sumar consumos de TODOS los otros items (otras órdenes u otras filas) que usan este mismo insumo
      let consumosOtrosKilos = 0;
      Object.keys(this.consumosPorOrden).forEach(id => {
        this.consumosPorOrden[id].forEach((oth, oIdx) => {
          // Si no es el item actual y es el mismo insumo
          if ((id != idOrden || oIdx != index) && oth.id_insumo === currentItem.id_insumo && oth.cantidad > 0) {
            if (this.isTela(insumo)) {
              consumosOtrosKilos += parseFloat(oth.cantidad) / insumo.rendimiento;
            } else {
              consumosOtrosKilos += parseFloat(oth.cantidad);
            }
          }
        });
      });

      const disponibleKilos = Math.max(0, stockOriginalKilos - consumosOtrosKilos);

      if (this.isTela(insumo)) {
        return disponibleKilos * insumo.rendimiento;
      }
      return disponibleKilos;
    },
    getItemUnidad(idInsumo) {
      if (!idInsumo) return '';
      const insumo = this.insumos.find(i => i._id === idInsumo);
      if (!insumo) return '';
      return this.isTela(insumo) ? 'Metros' : insumo.unidad;
    },
    getLabelCantidad(idInsumo) {
      const unidad = this.getItemUnidad(idInsumo);
      return unidad ? `Cantidad (${unidad})` : 'Cantidad';
    },
    addMaterial(idOrden) {
      this.consumosPorOrden[idOrden].push({
        id_insumo: null,
        cantidad: null,
        desperdicio: 0,
        terminar_material: false,
        active: true
      });
    },
    removeMaterial(idOrden, index) {
      if (this.consumosPorOrden[idOrden].length > 1) {
        this.consumosPorOrden[idOrden].splice(index, 1);
      }
    },
    isTela(insumo) {
      if (!insumo) return false;
      const unidadesKg = ['Kg', 'Kilos', 'kg', 'kilos'];
      return unidadesKg.includes(insumo.unidad) && parseFloat(insumo.rendimiento) > 0;
    },
    getUnidad(idOrden) {
      const c = this.consumosPorOrden[idOrden];
      if (!c || !c.id_insumo) return '';
      const insumo = this.insumos.find(i => i._id === c.id_insumo);
      if (!insumo) return '';
      return this.isTela(insumo) ? 'Mt' : insumo.unidad;
    },
    // --- MÉTODOS DE TINTAS (IMPRESIÓN) ---
    addImpresora(idOrden) {
      if (!this.tintasPorOrden[idOrden]) return;
      this.tintasPorOrden[idOrden].push({ id_impresora: null, c: 0, m: 0, y: 0, k: 0, w: 0 });
    },
    removeImpresora(idOrden, index) {
      if (this.tintasPorOrden[idOrden] && this.tintasPorOrden[idOrden].length > 1) {
        this.tintasPorOrden[idOrden].splice(index, 1);
      }
    },
    getImpresorasOptionsForOrden(idOrden, index) {
      if (!this.impresoras || this.impresoras.length === 0) {
        return [{ value: null, text: 'No hay impresoras disponibles' }];
      }
      const otherSelections = (this.tintasPorOrden[idOrden] || [])
        .filter((_, i) => i !== index)
        .map(t => t.id_impresora)
        .filter(id => id !== null);
      const options = this.impresoras.map(imp => ({
        value: imp._id,
        text: `${imp.codigo_interno} - ${imp.marca} ${imp.modelo}`,
        disabled: otherSelections.includes(imp._id),
      }));
      return [{ value: null, text: 'Seleccione una impresora' }, ...options];
    },
    showWhiteInkField(idOrden, index) {
      if (!this.impresoras || this.impresoras.length === 0) return false;
      const selectedId = this.tintasPorOrden[idOrden]?.[index]?.id_impresora;
      if (!selectedId) return false;
      const printer = this.impresoras.find(imp => imp._id === selectedId);
      return printer && printer.tipo_tecnologia === 'CMYKW';
    },
    puedeAnadirImpresoraOrden(idOrden) {
      const tintas = this.tintasPorOrden[idOrden];
      if (!tintas || tintas.length === 0) return false;
      const ultima = tintas[tintas.length - 1];
      if (!ultima.id_impresora) return false;
      return tintas.length < (this.impresoras?.length || 0);
    },
    // --- FIN MÉTODOS DE TINTAS ---
    resetModal() {
      this.consumosPorOrden = {};
      this.tintasPorOrden = {};
      this.ordenes.forEach((o) => {
        this.$set(this.consumosPorOrden, o.id_orden, [
          {
            id_insumo: null,
            cantidad: null,
            desperdicio: 0,
            terminar_material: false,
            active: false,
          }
        ]);
        this.$set(this.tintasPorOrden, o.id_orden, [
          { id_impresora: null, c: 0, m: 0, y: 0, k: 0, w: 0 }
        ]);
      });
      this.overlay = false;
    },
    resetAndClose() {
      this.resetModal()
      this.$emit('close')
    },
    confirmarFinalizacion() {
      const activeCount = Object.keys(this.consumosPorOrden).filter(k => this.consumosPorOrden[k][0].active).length;
      const msg = activeCount > 0
        ? `¿Confirma que desea registrar el consumo para ${activeCount} orden(es) y finalizar el lote #${this.loteId}?`
        : `¿Confirma que desea finalizar el lote #${this.loteId} sin registrar consumos específicos?`;

      this.$confirm(msg, 'Confirmar Finalización', 'warning')
        .then(() => {
          this.enviarDatos()
        })
        .catch(() => { })
    },
    async enviarDatos() {
      this.overlay = true

      const consumosParaEnviar = [];
      Object.keys(this.consumosPorOrden).forEach(idOrden => {
        const listaConsumos = this.consumosPorOrden[idOrden];
        if (listaConsumos[0].active) {
          listaConsumos.forEach(c => {
            if (c.id_insumo && c.cantidad > 0) {
              const insumo = this.insumos.find(i => i._id === c.id_insumo);
              let cantidadFinal = c.cantidad;

              if (this.isTela(insumo)) {
                cantidadFinal = c.cantidad / insumo.rendimiento;
              }

              consumosParaEnviar.push({
                id_insumo: c.id_insumo,
                cantidad_total: cantidadFinal,
                desperdicio_total: c.desperdicio || 0,
                terminar_material: c.terminar_material,
                id_ordenes: [parseInt(idOrden)]
              });
            }
          });
        }
      });

      const payload = {
        id_empleado: this.$store.state.login.dataUser.id_empleado,
        id_departamento: this.$store.state.login.currentDepartamentId,
        consumos_lote: consumosParaEnviar,
      }

      // Si es Impresión, agregar consumo de tintas por orden
      if (this.isImpresion) {
        const tintasParaEnviar = [];
        Object.keys(this.tintasPorOrden).forEach(idOrden => {
          // Solo enviar tintas de órdenes con consumo activo
          if (this.consumosPorOrden[idOrden]?.[0]?.active) {
            const tintas = this.tintasPorOrden[idOrden];
            tintas.forEach(t => {
              if (t.id_impresora) {
                tintasParaEnviar.push({
                  id_orden: parseInt(idOrden),
                  id_impresora: t.id_impresora,
                  c: t.c || 0,
                  m: t.m || 0,
                  y: t.y || 0,
                  k: t.k || 0,
                  w: t.w || 0,
                });
              }
            });
          }
        });
        payload.consumo_tintas = tintasParaEnviar;
      }

      try {
        const response = await this.$axios.post(
          `${this.$config.API}/lotes/${this.loteId}/finalizar-departamento`,
          payload
        )

        this.$fire({
          title: 'Éxito',
          html: `<p>${response.data.message}</p>`,
          type: 'success',
        })

        this.ordenes.forEach(orden => {
          this.sendMsgCustom(orden.id_orden, 'paso', this.$store.state.login.currentDepartamentId)
        })

        this.$emit('lote-finalizado')
      } catch (error) {
        this.$fire({
          title: 'Error',
          html: `<p>Ocurrió un error al finalizar el lote.</p><p>${error.response?.data?.error || error}</p>`,
          type: 'error',
        })
      } finally {
        this.overlay = false
      }
    },
  },
}
</script>