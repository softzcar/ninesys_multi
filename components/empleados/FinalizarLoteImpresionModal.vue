<template>
  <b-modal v-model="show" :title="`Finalizar Lote de Impresión #${loteId}`" size="xl" hide-footer
    @hidden="resetAndClose">
    <b-overlay :show="overlay">
      <b-container fluid>
        <!-- Sección de Papel -->
        <h5>Registro de Consumo de Papel</h5>
        <div v-for="(papel, index) in consumoPapel" :key="papel.key">
          <b-card class="mb-3" body-class="p-3" border-variant="primary shadow-sm">
            <b-row align-v="start">
              <b-col md="6">
                <b-form-group :label="`Rollo de Papel #${index + 1}`" class="mb-3">
                  <empleados-InsumoTypeHead v-model="papel.id_insumo" :insumos="insumos" />
                </b-form-group>
              </b-col>
              <b-col md="4">
                <b-form-group label="Cantidad Consumida (Metros)" class="mb-3">
                  <b-form-input v-model.number="papel.cantidad_total" type="number" placeholder="Ej: 50.5"
                    step="0.1"></b-form-input>
                </b-form-group>
              </b-col>
              <b-col md="2" class="text-right">
                <b-button variant="outline-danger" @click="removePapel(index)" :disabled="consumoPapel.length <= 1"
                  size="sm" class="mt-4">
                  <b-icon icon="trash"></b-icon>
                </b-button>
              </b-col>
            </b-row>

            <b-row v-if="ordenes.length > 1">
              <b-col>
                <b-form-group label="Asignar a órdenes específicas (opcional):"
                  description="Si no se selecciona ninguna, el consumo de este rollo se repartirá entre todo el lote.">
                  <b-form-checkbox-group v-model="papel.id_ordenes" :options="ordenesOptions"
                    name="ordenes-asignadas-papel" switches stacked class="columns-2"></b-form-checkbox-group>
                </b-form-group>
              </b-col>
            </b-row>
          </b-card>
        </div>
        <b-row>
          <b-col class="mt-2 mb-3">
            <b-button variant="info" @click="addPapel" size="sm">
              <b-icon icon="plus"></b-icon> Añadir otro Rollo de Papel
            </b-button>
          </b-col>
        </b-row>

        <hr />

        <!-- Sección de Tinta -->
        <h5>Registro de Consumo de Tinta</h5>

        <!-- Iteración sobre impresoras seleccionadas -->
        <b-card v-for="(impresora, index) in impresorasSeleccionadas" :key="impresora.id" bg-variant="light"
          class="mb-3">
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <span><strong>Impresora {{ index + 1 }}</strong></span>
              <b-button v-if="impresorasSeleccionadas.length > 1" variant="danger" size="sm"
                @click="removeImpresora(index)" aria-label="Eliminar impresora">
                <b-icon icon="trash"></b-icon>
              </b-button>
            </div>
          </template>

          <b-row>
            <b-col md="12">
              <b-form-group label="Impresora Utilizada">
                <b-form-select v-model="impresora.id_impresora"
                  :options="getImpresorasOptionsForIndex(index)"></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col v-for="color in ['c', 'm', 'y', 'k']" :key="color">
              <b-form-group :label="color.toUpperCase()">
                <b-form-input v-model.number="impresora[color]" type="number" step="0.1" :style="{
                  backgroundColor: colorMap[color],
                  color: color === 'k' || color === 'm' ? 'white' : 'black',
                  fontWeight: 'bold'
                }" :disabled="!impresora.id_impresora"></b-form-input>
              </b-form-group>
            </b-col>
            <b-col v-if="showWhiteInkFieldForIndex(index)">
              <b-form-group label="W">
                <b-form-input v-model.number="impresora.w" type="number" step="0.1" :style="{
                  backgroundColor: colorMap.w,
                  color: 'black',
                  fontWeight: 'bold'
                }" :disabled="!impresora.id_impresora"></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
        </b-card>

        <!-- Botón para añadir impresora -->
        <b-row class="mb-3">
          <b-col>
            <b-button variant="info" @click="addImpresora" size="sm"
              :disabled="!puedeAnadirImpresora || todasImpresorasSeleccionadas">
              <b-icon icon="plus"></b-icon> Añadir otra Impresora
            </b-button>
          </b-col>
        </b-row>

        <hr />

        <!-- Material Estimado del Lote (ocultar para reposiciones) -->
        <div v-if="!esReposicion" class="mb-4">
          <h5><strong>📊 Resumen de Material</strong></h5>
          <b-card bg-variant="light" class="mb-3">
            <!-- Mostrar siempre, incluso si está vacío -->
            <div v-if="materialesEstimadosAgrupados.length > 0">
              <h6><strong>Material Estimado (Sistema):</strong></h6>
              <div v-if="materialesEstimadosAgrupados.length === 1">
                <p class="mb-2">
                  {{ materialesEstimadosAgrupados[0].total }} {{ materialesEstimadosAgrupados[0].unidad }}
                  de {{ materialesEstimadosAgrupados[0].catalogo }}
                </p>
              </div>
              <div v-else>
                <ul class="mb-2">
                  <li v-for="(item, index) in materialesEstimadosAgrupados" :key="index">
                    <strong>{{ item.catalogo }}:</strong> {{ item.total }} {{ item.unidad }}
                  </li>
                </ul>
              </div>

              <!-- Material Utilizado y Eficiencia -->
              <div>
                <p class="mb-2">
                  <strong>Material Utilizado:</strong>
                  {{ materialUtilizadoTotal }} Metros
                </p>

                <p v-if="parseFloat(materialUtilizadoTotal) > 0" class="mb-0">
                  <strong>Eficiencia:</strong>
                  <span :class="parseFloat(eficienciaLote) >= 100 ? 'text-success' : 'text-danger'">
                    {{ eficienciaLote }}%
                  </span>
                  <small class="text-muted">
                    ({{ parseFloat(eficienciaLote) >= 100 ? 'Óptimo' : 'Por encima del estimado' }})
                  </small>
                </p>
              </div>
            </div>
            <div v-else>
              <p class="text-muted mb-2">
                <b-spinner small></b-spinner> Cargando información de materiales...
              </p>
              <b-button size="sm" variant="outline-primary" @click="cargarMaterialesLote">
                🔄 Recargar Materiales (Debug)
              </b-button>
            </div>
          </b-card>
        </div>

        <!-- Botón de Finalización -->
        <b-row class="mt-4">
          <b-col>
            <b-button variant="success" @click="confirmarFinalizacion" :disabled="!formValid" block size="lg">
              <b-icon icon="check-all"></b-icon> Confirmar y Finalizar Lote de
              Impresión
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
    insumos: {
      type: Array,
      required: true,
    },
    impresoras: {
      type: Array,
      required: true,
    },
    ordenes: {
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
      consumoPapel: [
        {
          id_insumo: null,
          cantidad_total: null,
          id_ordenes: [],
          key: Date.now(),
        },
      ],
      // Array para múltiples impresoras
      impresorasSeleccionadas: [
        { id: 1, id_impresora: null, c: 0, m: 0, y: 0, k: 0, w: 0 }
      ],
      colorMap: {
        c: '#00FFFF',
        m: '#FF00FF',
        y: '#FFFF00',
        k: '#343A40',
        w: '#F8F9FA',
      },
      materialesLote: [], // Datos de materiales estimados del lote
    }
  },
  computed: {
    ordenesOptions() {
      return this.ordenes.map((o) => ({
        value: o.id_orden,
        text: `#${o.id_orden} - ${o.cliente_nombre}`,
      }))
    },
    insumosOptions() {
      const insumosPapel = this.insumos.filter(
        (i) => i.departamento === 'Impresión'
      )
      if (!insumosPapel || insumosPapel.length === 0) return []
      const options = insumosPapel.map((insumo) => {
        return {
          value: insumo._id,
          text: `${insumo.insumo} (Rollo: ${insumo.rollo || 'N/A'
            }) - Stock: ${insumo.cantidad} ${insumo.unidad}`,
        }
      })
      return [
        { value: null, text: 'Por favor, seleccione un rollo de papel' },
        ...options,
      ]
    },
    impresorasOptions() {
      if (!this.impresoras || this.impresoras.length === 0) return []
      const options = this.impresoras.map((imp) => {
        return {
          value: imp._id,
          text: `${imp.codigo_interno} - ${imp.marca} ${imp.modelo}`,
        }
      })
      return [
        { value: null, text: 'Por favor, seleccione una impresora' },
        ...options,
      ]
    },

    // Devuelve true si la última impresora tiene una seleccionada
    puedeAnadirImpresora() {
      if (!this.impresorasSeleccionadas || this.impresorasSeleccionadas.length === 0) return false
      const ultimaImpresora = this.impresorasSeleccionadas[this.impresorasSeleccionadas.length - 1]
      return ultimaImpresora.id_impresora !== null
    },

    // Devuelve true si ya se seleccionaron todas las impresoras disponibles
    todasImpresorasSeleccionadas() {
      if (!this.impresoras || this.impresoras.length === 0) return true
      return this.impresorasSeleccionadas.length >= this.impresoras.length
    },

    formValid() {
      const papelValido = this.consumoPapel.every(
        (p) => p.id_insumo && p.cantidad_total > 0
      )
      const tintaValida = this.impresorasSeleccionadas.every(imp => {
        return imp.id_impresora &&
          (imp.c > 0 || imp.m > 0 || imp.y > 0 || imp.k > 0 || imp.w > 0)
      })
      return papelValido && tintaValida
    },

    // Agrupa materiales estimados por catálogo
    materialesEstimadosAgrupados() {
      if (!this.materialesLote || this.materialesLote.length === 0) {
        return []
      }

      const catalogoMap = new Map()

      this.materialesLote.forEach((item) => {
        const catalogo = item.catalogo || 'Sin catálogo'
        const cantidad_estimada = parseFloat(item.cantidad_estimada_de_consumo) || 0
        const unidades = parseInt(item.unidades) || 0
        const total = cantidad_estimada * unidades
        const unidad = item.unidad_de_medida || 'Metros'

        if (catalogoMap.has(catalogo)) {
          catalogoMap.get(catalogo).total += total
        } else {
          catalogoMap.set(catalogo, {
            catalogo,
            total,
            unidad
          })
        }
      })

      return Array.from(catalogoMap.values()).map(item => ({
        catalogo: item.catalogo,
        total: item.total.toFixed(2),
        unidad: item.unidad
      }))
    },

    // Total de material estimado (suma de todos los catálogos)
    totalMaterialEstimado() {
      if (this.materialesEstimadosAgrupados.length === 0) {
        return 0
      }
      return this.materialesEstimadosAgrupados.reduce((sum, item) => {
        return sum + parseFloat(item.total)
      }, 0).toFixed(2)
    },

    // Total de material utilizado (suma de consumoPapel)
    materialUtilizadoTotal() {
      if (!this.consumoPapel || this.consumoPapel.length === 0) {
        return '0.00'
      }
      const total = this.consumoPapel.reduce((sum, papel) => {
        const cantidad = parseFloat(papel.cantidad_total) || 0
        return sum + cantidad
      }, 0)
      return total.toFixed(2)
    },

    // Eficiencia: (Estimado / Utilizado) * 100
    eficienciaLote() {
      const estimado = parseFloat(this.totalMaterialEstimado)
      const utilizado = parseFloat(this.materialUtilizadoTotal)

      if (utilizado === 0 || estimado === 0) {
        return '0.00'
      }

      return ((estimado / utilizado) * 100).toFixed(2)
    },
  },
  methods: {
    addPapel() {
      this.consumoPapel.push({
        id_insumo: null,
        cantidad_total: null,
        id_ordenes: [],
        key: Date.now(),
      })
    },
    removePapel(index) {
      if (this.consumoPapel.length > 1) {
        this.consumoPapel.splice(index, 1)
      }
    },

    async cargarMaterialesLote() {
      console.log('🔍 cargarMaterialesLote - Iniciando...')
      console.log('ordenes prop:', this.ordenes)

      if (!this.ordenes || this.ordenes.length === 0) {
        console.log('⚠️ No hay órdenes, saliendo...')
        this.materialesLote = []
        return
      }

      try {
        const idsOrdenes = this.ordenes.map(o => o.id_orden)
        console.log('📋 IDs de órdenes:', idsOrdenes)

        const response = await this.$axios.post(
          `${this.$config.API}/ordenes/materiales-lote`,
          { id_ordenes: idsOrdenes }
        )
        console.log('✅ Respuesta del servidor:', response.data)
        this.materialesLote = response.data || []
        console.log('📦 materialesLote actualizado:', this.materialesLote)
      } catch (error) {
        console.error('❌ Error al cargar materiales del lote:', error)
        this.materialesLote = []
      }
    },

    // --- MÉTODOS PARA MÚLTIPLES IMPRESORAS ---
    addImpresora() {
      if (!this.puedeAnadirImpresora) {
        this.$fire({
          type: 'warning',
          title: 'Selección requerida',
          html: '<p>Debe seleccionar una impresora antes de añadir otra.</p>',
        })
        return
      }

      if (this.todasImpresorasSeleccionadas) {
        this.$fire({
          type: 'info',
          title: 'Límite alcanzado',
          html: '<p>Ya ha seleccionado todas las impresoras disponibles.</p>',
        })
        return
      }

      const newId = Math.floor(Math.random() * 1000000)
      this.impresorasSeleccionadas.push({
        id: newId,
        id_impresora: null,
        c: 0,
        m: 0,
        y: 0,
        k: 0,
        w: 0,
      })
    },

    removeImpresora(index) {
      if (this.impresorasSeleccionadas.length > 1) {
        this.impresorasSeleccionadas.splice(index, 1)
      }
    },

    getImpresorasOptionsForIndex(index) {
      if (!this.impresoras || this.impresoras.length === 0) {
        return [{ value: null, text: 'No hay impresoras disponibles' }]
      }
      const otherSelections = this.impresorasSeleccionadas
        .filter((_, i) => i !== index)
        .map(imp => imp.id_impresora)
        .filter(id => id !== null)

      let options = this.impresoras.map((imp) => {
        return {
          value: imp._id,
          text: `${imp.codigo_interno} - ${imp.marca} ${imp.modelo}`,
          disabled: otherSelections.includes(imp._id),
        }
      })
      options.unshift({ value: null, text: 'Por favor, seleccione una impresora' })
      return options
    },

    showWhiteInkFieldForIndex(index) {
      if (!this.impresoras || this.impresoras.length === 0) return false
      const selectedId = this.impresorasSeleccionadas[index]?.id_impresora
      if (!selectedId) return false
      const selectedPrinter = this.impresoras.find(imp => imp._id === selectedId)
      return selectedPrinter && selectedPrinter.tipo_tecnologia === 'CMYKW'
    },
    // --- FIN MÉTODOS PARA MÚLTIPLES IMPRESORAS ---

    resetModal() {
      this.overlay = false
      this.consumoPapel = [
        {
          id_insumo: null,
          cantidad_total: null,
          id_ordenes: [],
          key: Date.now(),
        },
      ]
      this.impresorasSeleccionadas = [
        { id: 1, id_impresora: null, c: 0, m: 0, y: 0, k: 0, w: 0 }
      ]
    },
    resetAndClose() {
      this.resetModal()
      this.$emit('close')
    },
    confirmarFinalizacion() {
      this.$confirm(
        `¿Confirma los datos de consumo de papel y tinta para el lote #${this.loteId}? Esta acción es irreversible.`,
        'Confirmar Finalización de Impresión',
        'warning'
      )
        .then(() => {
          this.enviarDatos()
        })
        .catch(() => { })
    },
    async enviarDatos() {
      this.overlay = true

      const consumosPapelParaEnviar = this.consumoPapel.map((p) => ({
        id_insumo: p.id_insumo,
        cantidad_total: p.cantidad_total,
        id_ordenes: p.id_ordenes,
      }))

      // Mapear impresoras a formato para backend
      const consumosTintas = this.impresorasSeleccionadas.map(imp => ({
        id_impresora: imp.id_impresora,
        c: imp.c,
        m: imp.m,
        y: imp.y,
        k: imp.k,
        w: imp.w,
      }))

      const payload = {
        id_empleado: this.$store.state.login.dataUser.id_empleado,
        id_departamento: this.$store.state.login.currentDepartamentId,
        consumo_papel: consumosPapelParaEnviar,
        consumo_tintas: consumosTintas, // Array de impresoras
      }

      try {
        const response = await this.$axios.post(
          `${this.$config.API}/lotes/${this.loteId}/finalizar-impresion`,
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
          html: `<p>Ocurrió un error al finalizar el lote de impresión.</p><p>${(error.response &&
            error.response.data &&
            error.response.data.error) ||
            error}</p>`,
          type: 'error',
        })
      } finally {
        this.overlay = false
      }
    },
  },
  mounted() {
    console.log('🚀 Modal mounted, show:', this.show)
    if (this.show) {
      this.cargarMaterialesLote()
    }
  },
  watch: {
    show(newVal) {
      console.log('👀 Watcher show triggered:', newVal)
      if (newVal) {
        console.log('✨ Modal abierto, cargando materiales...')
        this.cargarMaterialesLote()
      }
    }
  },
}
</script>
```