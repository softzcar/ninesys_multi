<template>
  <b-modal
    v-model="show"
    :title="`Finalizar Lote de Corte #${loteId}`"
    size="xl"
    hide-footer
    @hidden="resetAndClose"
  >
    <b-overlay :show="overlay">
      <b-container fluid>
        <h5>Registro de Consumo y Desperdicio de Material</h5>

        <!-- Lista dinámica de insumos -->
        <div v-for="(consumo, index) in consumos" :key="consumo.key">
          <b-card class="mb-2" body-class="p-2">
            <b-row align-v="center">
              <b-col md="5">
                <b-form-group :label="`Insumo #${index + 1}`" class="mb-0">
                  <b-form-select
                    v-model="consumo.id_insumo"
                    :options="insumosOptions"
                  ></b-form-select>
                </b-form-group>
              </b-col>
              <b-col md="3">
                <b-form-group label="Cantidad Consumida" class="mb-0">
                  <b-form-input
                    v-model.number="consumo.cantidad_total"
                    type="number"
                    placeholder="Ej: 18.5"
                    step="0.1"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col md="3">
                <b-form-group label="Desperdicio (Kilos)" class="mb-0">
                  <b-form-input
                    v-model.number="consumo.desperdicio_total"
                    type="number"
                    placeholder="Ej: 1.2"
                    step="0.1"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col md="1" class="text-right">
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
          <b-col class="mt-2 mb-3">
            <b-button variant="info" @click="addInsumo" size="sm">
              <b-icon icon="plus"></b-icon> Añadir otro Insumo
            </b-button>
          </b-col>
        </b-row>

        <hr />

        <b-row class="mt-4">
          <b-col>
            <b-button
              variant="success"
              @click="confirmarFinalizacion"
              :disabled="!formValid"
              block
              size="lg"
            >
              <b-icon icon="check-all"></b-icon> Confirmar y Finalizar Lote de Corte
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
  },
  data() {
    return {
      overlay: false,
      consumos: [
        {
          id_insumo: null,
          cantidad_total: null,
          desperdicio_total: null,
          key: Date.now(),
        },
      ],
    }
  },
  computed: {
    insumosOptions() {
      const insumosCorte = this.insumos.filter((i) => i.departamento === 'Telas')
      if (!insumosCorte || insumosCorte.length === 0) return []
      const options = insumosCorte.map((insumo) => {
        return {
          value: insumo._id,
          text: `${insumo.insumo} (Rollo: ${
            insumo.rollo || 'N/A'
          }) - Stock: ${insumo.cantidad} ${insumo.unidad}`,
        }
      })
      return [
        { value: null, text: 'Por favor, seleccione un rollo' },
        ...options,
      ]
    },
    formValid() {
      return this.consumos.every(
        (c) =>
          c.id_insumo &&
          c.cantidad_total > 0 &&
          c.desperdicio_total !== null &&
          c.desperdicio_total >= 0
      )
    },
  },
  methods: {
    addInsumo() {
      this.consumos.push({
        id_insumo: null,
        cantidad_total: null,
        desperdicio_total: null,
        key: Date.now(),
      })
    },
    removeInsumo(index) {
      if (this.consumos.length > 1) {
        this.consumos.splice(index, 1)
      }
    },
    resetModal() {
      this.overlay = false
      this.consumos = [
        {
          id_insumo: null,
          cantidad_total: null,
          desperdicio_total: null,
          key: Date.now(),
        },
      ]
    },
    resetAndClose() {
      this.resetModal()
      this.$emit('close')
    },
    confirmarFinalizacion() {
      this.$confirm(
        `¿Confirma los datos de consumo y desperdicio para el lote #${this.loteId}? Esta acción es irreversible.`,
        'Confirmar Finalización de Corte',
        'warning'
      )
        .then(() => {
          this.enviarDatos()
        })
        .catch(() => {})
    },
    async enviarDatos() {
      this.overlay = true

      const consumosParaEnviar = this.consumos.map((c) => ({
        id_insumo: c.id_insumo,
        cantidad_total: c.cantidad_total,
        desperdicio_total: c.desperdicio_total,
      }))

      const payload = {
        id_empleado: this.$store.state.login.dataUser.id_empleado,
        id_departamento: this.$store.state.login.currentDepartamentId,
        consumos_lote: consumosParaEnviar,
      }

      try {
        const response = await this.$axios.post(
          `${this.$config.API}/lotes/${this.loteId}/finalizar-corte`,
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
          html: `<p>Ocurrió un error al finalizar el lote de corte.</p><p>${(error.response &&
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
