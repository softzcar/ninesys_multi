<template>
  <b-modal
    v-model="show"
    :title="`Finalizar Lote #${loteId}`"
    size="xl"
    hide-footer
    @hidden="resetAndClose"
  >
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

        <hr />

        <h5>Registro de Consumo de Material (Tela)</h5>

        <!-- Lista dinámica de insumos -->
        <div v-for="(consumo, index) in consumos" :key="consumo.key">
          <b-card class="mb-2" body-class="p-2">
            <b-row align-v="center">
              <b-col md="6">
                <b-form-group :label="`Insumo #${index + 1}`" class="mb-0">
                  <b-form-select
                    v-model="consumo.id_insumo"
                    :options="insumosOptions"
                  ></b-form-select>
                </b-form-group>
              </b-col>
              <b-col md="4">
                <b-form-group label="Cantidad Consumida" class="mb-0">
                  <b-form-input
                    v-model.number="consumo.cantidad_total"
                    type="number"
                    placeholder="Ej: 15.5"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col md="2" class="text-right">
                <b-button
                  variant="danger"
                  @click="removeInsumo(index)"
                  :disabled="consumos.length <= 1"
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
          <b-col class="mt-2">
            <b-button variant="info" @click="addInsumo" size="sm">
              <b-icon icon="plus"></b-icon> Añadir otro Insumo
            </b-button>
          </b-col>
        </b-row>

        <hr />

        <b-row>
          <b-col>
            <b-button
              variant="success"
              @click="confirmarFinalizacion"
              :disabled="!formValid"
              block
              size="lg"
            >
              <b-icon icon="check-all"></b-icon> Confirmar y Finalizar Lote
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
    totalPapelUtilizado: {
      type: Number,
      default: 0,
    },
    insumos: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      overlay: false,
      // Convertido a un array para manejar múltiples insumos
      consumos: [{ id_insumo: null, cantidad_total: null, key: Date.now() }],
    }
  },
  computed: {
    insumosOptions() {
      if (!this.insumos || this.insumos.length === 0) return []
      const options = this.insumos.map((insumo) => {
        return {
          value: insumo._id,
          text: `${insumo.insumo} (Rollo: ${insumo.rollo || 'N/A'}) - Stock: ${insumo.cantidad} ${insumo.unidad}`,
        }
      })
      return [{ value: null, text: 'Por favor, seleccione un rollo' }, ...options]
    },
    formValid() {
      // Validar que cada item en el array de consumos sea válido
      return this.consumos.every(
        (consumo) => consumo.id_insumo && consumo.cantidad_total > 0
      )
    },
  },
  methods: {
    addInsumo() {
      this.consumos.push({
        id_insumo: null,
        cantidad_total: null,
        key: Date.now(), // for unique key in v-for
      })
    },
    removeInsumo(index) {
      if (this.consumos.length > 1) {
        this.consumos.splice(index, 1)
      }
    },
    resetModal() {
      // Reset data to initial state
      this.consumos = [{ id_insumo: null, cantidad_total: null, key: Date.now() }]
      this.overlay = false
    },
    resetAndClose() {
      this.resetModal()
      this.$emit('close')
    },
    confirmarFinalizacion() {
      this.$confirm(
        `¿Confirma que desea registrar ${this.consumos.length} tipo(s) de material consumido para el lote #${this.loteId}? Esta acción es irreversible.`,
        'Confirmar Finalización',
        'warning'
      )
        .then(() => {
          this.enviarDatos()
        })
        .catch(() => {
          // User cancelled
        })
    },
    async enviarDatos() {
      this.overlay = true

      // Filtrar para no enviar la propiedad 'key' al backend
      const consumosParaEnviar = this.consumos.map((c) => ({
        id_insumo: c.id_insumo,
        cantidad_total: c.cantidad_total,
      }))

      const payload = {
        id_empleado: this.$store.state.login.dataUser.id_empleado,
        id_departamento: this.$store.state.login.currentDepartamentId,
        // Cambiado a 'consumos_lote' para que sea un array
        consumos_lote: consumosParaEnviar,
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

        this.$emit('lote-finalizado')
      } catch (error) {
        this.$fire({
          title: 'Error',
          html: `<p>Ocurrió un error al finalizar el lote.</p><p>${error.response.data.error || error}</p>`,
          type: 'error',
        })
      } finally {
        // No se resetea aquí para que el usuario pueda ver los datos si hay un error.
        // El reseteo se hace en el evento @hidden del modal.
        this.overlay = false
      }
    },
  },
}
</script>