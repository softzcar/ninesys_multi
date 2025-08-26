<template>
  <b-modal
    v-model="show"
    :title="`Finalizar Lote de Impresión #${loteId}`"
    size="xl"
    hide-footer
    @hidden="resetAndClose"
  >
    <b-overlay :show="overlay">
      <b-container fluid>
        <!-- Sección de Papel -->
        <h5>Registro de Consumo de Papel</h5>
        <div v-for="(papel, index) in consumoPapel" :key="papel.key">
          <b-card class="mb-2" body-class="p-2">
            <b-row align-v="center">
              <b-col md="6">
                <b-form-group :label="`Rollo de Papel #${index + 1}`" class="mb-0">
                  <b-form-select
                    v-model="papel.id_insumo"
                    :options="insumosOptions"
                  ></b-form-select>
                </b-form-group>
              </b-col>
              <b-col md="4">
                <b-form-group label="Cantidad Consumida (Metros)" class="mb-0">
                  <b-form-input
                    v-model.number="papel.cantidad_total"
                    type="number"
                    placeholder="Ej: 50.5"
                    step="0.1"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col md="2" class="text-right">
                <b-button
                  variant="danger"
                  @click="removePapel(index)"
                  :disabled="consumoPapel.length <= 1"
                  size="sm"
                  class="mt-4"
                >
                  <b-icon icon="trash"></b-icon>
                </b-button>
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
        <b-card bg-variant="light">
          <b-row>
            <b-col md="12">
              <b-form-group label="Impresora Utilizada">
                <b-form-select
                  v-model="consumoTinta.id_impresora"
                  :options="impresorasOptions"
                ></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col v-for="color in Object.keys(consumoTinta.tinta)" :key="color">
              <b-form-group :label="color.toUpperCase()">
                <b-form-input
                  v-model.number="consumoTinta.tinta[color]"
                  type="number"
                  step="0.1"
                  :style="{
                    backgroundColor: colorMap[color],
                    color:
                      color === 'k' || color === 'c' || color === 'm'
                        ? 'white'
                        : 'black',
                  }"
                  :disabled="
                    !consumoTinta.id_impresora ||
                    (color === 'w' && !whiteInkEnabled)
                  "
                ></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
        </b-card>

        <hr />

        <!-- Botón de Finalización -->
        <b-row class="mt-4">
          <b-col>
            <b-button
              variant="success"
              @click="confirmarFinalizacion"
              :disabled="!formValid"
              block
              size="lg"
            >
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
export default {
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
  },
  data() {
    return {
      overlay: false,
      consumoPapel: [{ id_insumo: null, cantidad_total: null, key: Date.now() }],
      consumoTinta: {
        id_impresora: null,
        tinta: {
          c: 0,
          m: 0,
          y: 0,
          k: 0,
          w: 0,
        },
      },
      colorMap: {
        c: '#00FFFF',
        m: '#FF00FF',
        y: '#FFFF00',
        k: '#343A40',
        w: '#F8F9FA',
      },
    }
  },
  computed: {
    whiteInkEnabled() {
      if (!this.consumoTinta.id_impresora) return false
      const selectedPrinter = this.impresoras.find(
        (p) => p._id === this.consumoTinta.id_impresora
      )
      // Lógica replicada del componente original para consistencia
      return selectedPrinter ? selectedPrinter.tipo_tecnologia === 'CMYK+W' : false
    },
    insumosOptions() {
      const insumosPapel = this.insumos.filter(
        (i) => i.departamento === 'Impresión'
      )
      if (!insumosPapel || insumosPapel.length === 0) return []
      const options = insumosPapel.map((insumo) => {
        return {
          value: insumo._id,
          text: `${insumo.insumo} (Rollo: ${
            insumo.rollo || 'N/A'
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
    formValid() {
      const papelValido = this.consumoPapel.every(
        (p) => p.id_insumo && p.cantidad_total > 0
      )
      const tintaValida =
        this.consumoTinta.id_impresora &&
        Object.values(this.consumoTinta.tinta).some((v) => v > 0)
      return papelValido && tintaValida
    },
  },
  watch: {
    whiteInkEnabled(newVal) {
      if (!newVal) {
        this.consumoTinta.tinta.w = 0
      }
    },
  },
  methods: {
    addPapel() {
      this.consumoPapel.push({
        id_insumo: null,
        cantidad_total: null,
        key: Date.now(),
      })
    },
    removePapel(index) {
      if (this.consumoPapel.length > 1) {
        this.consumoPapel.splice(index, 1)
      }
    },
    resetModal() {
      this.overlay = false
      this.consumoPapel = [
        { id_insumo: null, cantidad_total: null, key: Date.now() },
      ]
      this.consumoTinta = {
        id_impresora: null,
        tinta: { c: 0, m: 0, y: 0, k: 0, w: 0 },
      }
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
        .catch(() => {})
    },
    async enviarDatos() {
      this.overlay = true

      const consumosPapelParaEnviar = this.consumoPapel.map((p) => ({
        id_insumo: p.id_insumo,
        cantidad_total: p.cantidad_total,
      }))

      const payload = {
        id_empleado: this.$store.state.login.dataUser.id_empleado,
        id_departamento: this.$store.state.login.currentDepartamentId,
        consumo_papel: consumosPapelParaEnviar,
        consumo_tinta: {
          id_impresora: this.consumoTinta.id_impresora,
          ...this.consumoTinta.tinta,
        },
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
}
</script>