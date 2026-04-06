<template>
  <div>
    <b-overlay :show="overlay" spinner-variant="primary">
      <b-container>
        <b-row class="mb-4 align-items-center">
          <b-col>
            <h3>Gastos Variables</h3>
            <p class="text-muted mb-0">Gastos recurrentes cuyo monto varía cada período (impuestos, recibos de servicios, etc.)</p>
          </b-col>
          <b-col class="text-right">
            <b-button variant="success" @click="openCreateModal">
              <b-icon-plus-circle-fill></b-icon-plus-circle-fill> Nueva Plantilla
            </b-button>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-table striped hover :items="gastos" :fields="fields" responsive show-empty empty-text="No hay gastos variables registrados.">
              <template #cell(estatus)="data">
                <b-badge :variant="data.item.estatus === 'activo' ? 'success' : 'secondary'">
                  {{ data.item.estatus }}
                </b-badge>
              </template>

              <template #cell(estado_pago)="data">
                <b-badge :variant="isPagado(data.item) ? 'success' : 'warning'">
                  {{ isPagado(data.item) ? '✓ Pagado' : '⏳ Pendiente' }}
                </b-badge>
              </template>

              <template #cell(acciones)="data">
                <b-button variant="success" size="sm" class="mr-1" @click="openPagarModal(data.item)" :disabled="data.item.estatus !== 'activo'">
                  <b-icon icon="cash"></b-icon> Pagar
                </b-button>
                <b-button variant="primary" size="sm" class="mr-1" @click="openEditModal(data.item)">
                  <b-icon-pencil-square></b-icon-pencil-square>
                </b-button>
                <b-button variant="danger" size="sm" @click="confirmDelete(data.item)">
                  <b-icon-trash-fill></b-icon-trash-fill>
                </b-button>
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>

    <!-- Modal Crear/Editar Plantilla Variable -->
    <b-modal id="modal-gasto-variable" :title="editMode ? 'Editar Gasto Variable' : 'Nueva Plantilla de Gasto Variable'" @ok="handleOk" @hidden="resetModal" centered ok-title="Guardar" cancel-title="Cancelar">
      <b-form ref="formVar">
        <b-form-group label="Nombre del Gasto:" label-for="nombre-var">
          <b-form-input id="nombre-var" v-model="gastoModel.nombre" required placeholder="Ej: Pago de impuestos"></b-form-input>
        </b-form-group>
        <b-form-group label="Descripción (Opcional):" label-for="desc-var">
          <b-form-textarea id="desc-var" v-model="gastoModel.descripcion" rows="2"></b-form-textarea>
        </b-form-group>
        <b-row>
          <b-col md="6">
            <b-form-group label="Moneda:" label-for="moneda-var">
              <b-form-select id="moneda-var" v-model="gastoModel.moneda" :options="['USD', 'VES', 'COP', 'bolivar']"></b-form-select>
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Periodicidad:" label-for="period-var">
              <b-form-select id="period-var" v-model="gastoModel.periodicidad" :options="opcionesPeriodicidad"></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
        <b-alert show variant="info" class="small">
          <b-icon icon="info-circle"></b-icon> Para gastos variables no se define un monto fijo. El monto real se ingresa al momento de registrar cada pago.
        </b-alert>
      </b-form>
    </b-modal>

    <!-- Modal Registrar Pago Variable -->
    <b-modal id="modal-pagar-variable" title="Registrar Pago" @ok="handlePagarOk" @hidden="resetPagoModal" centered ok-title="Registrar Pago" cancel-title="Cancelar" ok-variant="success">
      <div v-if="gastoAPagar">
        <b-alert show variant="info" class="mb-3">
          <strong>{{ gastoAPagar.nombre }}</strong> — Ingresa el monto real pagado este período.
        </b-alert>
        <b-form-group label="Monto pagado:" label-for="pago-monto-var">
          <b-input-group :append="gastoAPagar.moneda">
            <b-form-input id="pago-monto-var" v-model.number="pagoModel.monto" type="number" step="0.01" min="0.01" required placeholder="0.00"></b-form-input>
          </b-input-group>
        </b-form-group>
        <b-form-group label="Fecha del pago:" label-for="pago-fecha-var">
          <b-form-input id="pago-fecha-var" v-model="pagoModel.fecha_de_gasto" type="date" required></b-form-input>
        </b-form-group>
        <b-form-group label="Observación (opcional):" label-for="pago-desc-var">
          <b-form-input id="pago-desc-var" v-model="pagoModel.descripcion" placeholder="Ej: Factura N° 00123"></b-form-input>
        </b-form-group>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'GastosVariables',
  computed: {
    ...mapState('login', ['dataUser']),
  },
  data() {
    return {
      overlay: true,
      gastos: [],
      registros: [],
      gastoAPagar: null,
      pagoModel: { monto: null, fecha_de_gasto: '', descripcion: '' },
      fields: [
        { key: 'nombre', label: 'Nombre', sortable: true },
        { key: 'periodicidad', label: 'Periodicidad', sortable: true },
        { key: 'moneda', label: 'Moneda' },
        { key: 'estatus', label: 'Estatus', sortable: true },
        { key: 'estado_pago', label: 'Estado Actual' },
        { key: 'acciones', label: 'Acciones' },
      ],
      opcionesPeriodicidad: [
        { value: 'mensual', text: 'Mensual' },
        { value: 'trimestral', text: 'Trimestral' },
        { value: 'semestral', text: 'Semestral' },
        { value: 'anual', text: 'Anual' },
        { value: 'único', text: 'Único' },
      ],
      gastoModel: { _id: null, nombre: '', descripcion: '', monto: 0, moneda: 'USD', periodicidad: 'mensual', estatus: 'activo', tipo: 'variable' },
      editMode: false,
    }
  },
  methods: {
    isPagado(gasto) {
      if (!this.registros.length) return false
      const now = new Date()
      return this.registros.some(r => {
        if (r.id_gasto_plantilla != gasto._id) return false
        const fechaPago = new Date(r.fecha_de_gasto)
        switch (gasto.periodicidad) {
          case 'mensual': return fechaPago.getFullYear() === now.getFullYear() && fechaPago.getMonth() === now.getMonth()
          case 'trimestral': return fechaPago.getFullYear() === now.getFullYear() && Math.floor(fechaPago.getMonth() / 3) === Math.floor(now.getMonth() / 3)
          case 'semestral': return fechaPago.getFullYear() === now.getFullYear() && Math.floor(fechaPago.getMonth() / 6) === Math.floor(now.getMonth() / 6)
          case 'anual': return fechaPago.getFullYear() === now.getFullYear()
          case 'único': return true
          default: return false
        }
      })
    },
    async getGastos() {
      this.overlay = true
      try {
        const [gastosRes, registrosRes] = await Promise.all([
          this.$axios.get(`${this.$config.API}/gastos`),
          this.$axios.get(`${this.$config.API}/gastos/registros`)
        ])
        this.gastos = (gastosRes.data || []).filter(g => g.tipo === 'variable')
        this.registros = registrosRes.data || []
      } catch (e) {
        this.$bvToast.toast('No se pudieron cargar los gastos.', { title: 'Error', variant: 'danger', solid: true })
      } finally { this.overlay = false }
    },
    openCreateModal() { this.resetModal(); this.$bvModal.show('modal-gasto-variable') },
    openEditModal(item) { this.gastoModel = { ...item }; this.editMode = true; this.$bvModal.show('modal-gasto-variable') },
    openPagarModal(item) {
      this.gastoAPagar = item
      this.pagoModel = { monto: null, fecha_de_gasto: new Date().toISOString().substring(0, 10), descripcion: '' }
      this.$bvModal.show('modal-pagar-variable')
    },
    resetModal() {
      this.gastoModel = { _id: null, nombre: '', descripcion: '', monto: 0, moneda: 'USD', periodicidad: 'mensual', estatus: 'activo', tipo: 'variable' }
      this.editMode = false
    },
    resetPagoModal() { this.gastoAPagar = null; this.pagoModel = { monto: null, fecha_de_gasto: '', descripcion: '' } },
    handleOk(bvEvt) { bvEvt.preventDefault(); this.editMode ? this.updateGasto() : this.createGasto() },
    handlePagarOk(bvEvt) { bvEvt.preventDefault(); this.registrarPago() },
    async createGasto() {
      this.overlay = true
      try {
        const data = new URLSearchParams()
        const { _id, ...fields } = this.gastoModel
        fields.tipo = 'variable'
        for (const k in fields) { if (fields[k] !== null) data.set(k, fields[k]) }
        await this.$axios.post(`${this.$config.API}/gastos`, data)
        this.$bvToast.toast('Plantilla creada.', { title: 'Éxito', variant: 'success', solid: true })
        this.$bvModal.hide('modal-gasto-variable')
        await this.getGastos()
      } catch (e) { this.$bvToast.toast('Error al crear.', { title: 'Error', variant: 'danger', solid: true }) }
      finally { this.overlay = false }
    },
    async updateGasto() {
      this.overlay = true
      try {
        const data = new URLSearchParams()
        for (const k in this.gastoModel) { if (k !== '_id' && this.gastoModel[k] !== null) data.set(k, this.gastoModel[k]) }
        await this.$axios.put(`${this.$config.API}/gastos/${this.gastoModel._id}`, data)
        this.$bvToast.toast('Plantilla actualizada.', { title: 'Éxito', variant: 'success', solid: true })
        this.$bvModal.hide('modal-gasto-variable')
        await this.getGastos()
      } catch (e) { this.$bvToast.toast('Error al actualizar.', { title: 'Error', variant: 'danger', solid: true }) }
      finally { this.overlay = false }
    },
    async registrarPago() {
      if (!this.pagoModel.monto || this.pagoModel.monto <= 0 || !this.pagoModel.fecha_de_gasto) {
        this.$bvToast.toast('Debes ingresar el monto y la fecha del pago.', { title: 'Advertencia', variant: 'warning', solid: true })
        return
      }
      this.overlay = true
      try {
        const data = new URLSearchParams()
        data.set('id_gasto_plantilla', this.gastoAPagar._id)
        data.set('tipo', 'variable')
        data.set('nombre', this.gastoAPagar.nombre)
        data.set('descripcion', this.pagoModel.descripcion || '')
        data.set('monto', this.pagoModel.monto)
        data.set('moneda', this.gastoAPagar.moneda)
        data.set('fecha_de_gasto', this.pagoModel.fecha_de_gasto)
        data.set('periodo', this.pagoModel.fecha_de_gasto.substring(0, 7))
        data.set('id_usuario', this.dataUser.id_empleado)
        await this.$axios.post(`${this.$config.API}/gastos/registros`, data)
        this.$bvToast.toast('Pago registrado.', { title: 'Éxito', variant: 'success', solid: true })
        this.$bvModal.hide('modal-pagar-variable')
        await this.getGastos()
      } catch (e) { this.$bvToast.toast('Error al registrar el pago.', { title: 'Error', variant: 'danger', solid: true }) }
      finally { this.overlay = false }
    },
    confirmDelete(item) {
      this.$bvModal.msgBoxConfirm(`¿Eliminar la plantilla "${item.nombre}"?`, {
        title: 'Confirmar', okVariant: 'danger', okTitle: 'Eliminar', cancelTitle: 'Cancelar', centered: true,
      }).then(async val => {
        if (!val) return
        this.overlay = true
        try {
          await this.$axios.delete(`${this.$config.API}/gastos/${item._id}`)
          this.$bvToast.toast('Plantilla eliminada.', { title: 'Éxito', variant: 'success', solid: true })
          await this.getGastos()
        } catch (e) { this.$bvToast.toast('Error al eliminar.', { title: 'Error', variant: 'danger', solid: true }) }
        finally { this.overlay = false }
      })
    },
  },
  mounted() { this.getGastos() },
}
</script>
