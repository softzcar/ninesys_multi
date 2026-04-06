<template>
  <div>
    <b-overlay :show="overlay" spinner-variant="primary">
      <b-container>
        <b-row class="mb-4 align-items-center">
          <b-col>
            <h3>Gestión de Gastos Fijos</h3>
          </b-col>
          <b-col class="text-right">
            <b-button variant="success" @click="openCreateModal">
              <b-icon-plus-circle-fill></b-icon-plus-circle-fill> Nuevo Gasto
            </b-button>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-table striped hover :items="gastos" :fields="fields" responsive show-empty empty-text="No hay gastos fijos registrados.">
              <template #cell(monto)="data">
                {{ data.item.monto | currency }} {{ data.item.moneda }}
              </template>

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

    <!-- Modal Crear/Editar Plantilla -->
    <b-modal id="modal-gasto-fijo" :title="editMode ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'" @ok="handleOk" @hidden="resetModal" centered ok-title="Guardar" cancel-title="Cancelar">
      <b-form ref="form">
        <b-form-group label="Nombre del Gasto:" label-for="nombre-input-fijo">
          <b-form-input id="nombre-input-fijo" v-model="gastoModel.nombre" required placeholder="Ej: Alquiler del local"></b-form-input>
        </b-form-group>
        <b-form-group label="Descripción (Opcional):" label-for="descripcion-input-fijo">
          <b-form-textarea id="descripcion-input-fijo" v-model="gastoModel.descripcion" rows="2"></b-form-textarea>
        </b-form-group>
        <b-row>
          <b-col md="6">
            <b-form-group label="Monto de referencia:" label-for="monto-input-fijo">
              <b-form-input id="monto-input-fijo" v-model="gastoModel.monto" type="number" step="0.01" required></b-form-input>
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Moneda:" label-for="moneda-select-fijo">
              <b-form-select id="moneda-select-fijo" v-model="gastoModel.moneda" :options="['USD', 'VES', 'COP', 'bolivar']"></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="6">
            <b-form-group label="Periodicidad:" label-for="periodicidad-select-fijo">
              <b-form-select id="periodicidad-select-fijo" v-model="gastoModel.periodicidad" :options="opcionesPeriodicidad"></b-form-select>
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Estatus:" label-for="estatus-select-fijo">
              <b-form-select id="estatus-select-fijo" v-model="gastoModel.estatus" :options="[{value:'activo', text:'Activo'}, {value:'inactivo', text:'Inactivo'}]"></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
      </b-form>
    </b-modal>

    <!-- Modal Registrar Pago -->
    <b-modal id="modal-pagar-fijo" title="Registrar Pago" @ok="handlePagarOk" @hidden="resetPagoModal" centered ok-title="Registrar Pago" cancel-title="Cancelar" ok-variant="success">
      <div v-if="gastoAPagar">
        <b-alert show variant="info" class="mb-3">
          <strong>{{ gastoAPagar.nombre }}</strong> — Monto referencial: {{ gastoAPagar.monto | currency }} {{ gastoAPagar.moneda }}
        </b-alert>
        <b-form-group label="Monto pagado:" label-for="pago-monto-fijo">
          <b-form-input id="pago-monto-fijo" v-model.number="pagoModel.monto" type="number" step="0.01" required placeholder="Ingrese el monto real pagado"></b-form-input>
        </b-form-group>
        <b-form-group label="Fecha del pago:" label-for="pago-fecha-fijo">
          <b-form-input id="pago-fecha-fijo" v-model="pagoModel.fecha_de_gasto" type="date" required></b-form-input>
        </b-form-group>
        <b-form-group label="Observación (opcional):" label-for="pago-desc-fijo">
          <b-form-input id="pago-desc-fijo" v-model="pagoModel.descripcion" placeholder="Ej: Pago mes de Marzo"></b-form-input>
        </b-form-group>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'GastosFijos',
  computed: {
    ...mapState('login', ['dataUser']),
  },
  data() {
    return {
      overlay: true,
      gastos: [],
      registros: [],
      gastoAPagar: null,
      pagoModel: { monto: 0, fecha_de_gasto: '', descripcion: '' },
      fields: [
        { key: 'nombre', label: 'Nombre', sortable: true },
        { key: 'monto', label: 'Monto ref.', sortable: true },
        { key: 'periodicidad', label: 'Periodicidad', sortable: true },
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
      gastoModel: { _id: null, nombre: '', descripcion: '', monto: 0, moneda: 'USD', periodicidad: 'mensual', estatus: 'activo', tipo: 'fijo' },
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
          case 'mensual':
            return fechaPago.getFullYear() === now.getFullYear() && fechaPago.getMonth() === now.getMonth()
          case 'trimestral':
            return fechaPago.getFullYear() === now.getFullYear() && Math.floor(fechaPago.getMonth() / 3) === Math.floor(now.getMonth() / 3)
          case 'semestral':
            return fechaPago.getFullYear() === now.getFullYear() && Math.floor(fechaPago.getMonth() / 6) === Math.floor(now.getMonth() / 6)
          case 'anual':
            return fechaPago.getFullYear() === now.getFullYear()
          case 'único':
            return true // Si tiene cualquier registro, está pagado
          default:
            return false
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
        this.gastos = (gastosRes.data || []).filter(g => g.tipo === 'fijo')
        this.registros = registrosRes.data || []
      } catch (e) {
        this.$bvToast.toast('No se pudieron cargar los gastos.', { title: 'Error', variant: 'danger', solid: true })
      } finally {
        this.overlay = false
      }
    },
    openCreateModal() {
      this.resetModal()
      this.$bvModal.show('modal-gasto-fijo')
    },
    openEditModal(item) {
      this.gastoModel = { ...item }
      this.editMode = true
      this.$bvModal.show('modal-gasto-fijo')
    },
    openPagarModal(item) {
      this.gastoAPagar = item
      this.pagoModel = {
        monto: item.monto,
        fecha_de_gasto: new Date().toISOString().substring(0, 10),
        descripcion: ''
      }
      this.$bvModal.show('modal-pagar-fijo')
    },
    resetModal() {
      this.gastoModel = { _id: null, nombre: '', descripcion: '', monto: 0, moneda: 'USD', periodicidad: 'mensual', estatus: 'activo', tipo: 'fijo' }
      this.editMode = false
    },
    resetPagoModal() {
      this.gastoAPagar = null
      this.pagoModel = { monto: 0, fecha_de_gasto: '', descripcion: '' }
    },
    handleOk(bvEvt) { bvEvt.preventDefault(); this.handleSubmit() },
    handlePagarOk(bvEvt) { bvEvt.preventDefault(); this.registrarPago() },
    async handleSubmit() {
      this.editMode ? await this.updateGasto() : await this.createGasto()
    },
    async createGasto() {
      this.overlay = true
      try {
        const data = new URLSearchParams()
        const { _id, ...fields } = this.gastoModel
        for (const k in fields) { if (fields[k] !== null) data.set(k, fields[k]) }
        await this.$axios.post(`${this.$config.API}/gastos`, data)
        this.$bvToast.toast('Gasto creado exitosamente.', { title: 'Éxito', variant: 'success', solid: true })
        this.$bvModal.hide('modal-gasto-fijo')
        await this.getGastos()
      } catch (e) {
        this.$bvToast.toast('Error al crear el gasto.', { title: 'Error', variant: 'danger', solid: true })
      } finally { this.overlay = false }
    },
    async updateGasto() {
      this.overlay = true
      try {
        const data = new URLSearchParams()
        for (const k in this.gastoModel) { if (k !== '_id' && this.gastoModel[k] !== null) data.set(k, this.gastoModel[k]) }
        await this.$axios.put(`${this.$config.API}/gastos/${this.gastoModel._id}`, data)
        this.$bvToast.toast('Gasto actualizado.', { title: 'Éxito', variant: 'success', solid: true })
        this.$bvModal.hide('modal-gasto-fijo')
        await this.getGastos()
      } catch (e) {
        this.$bvToast.toast('Error al actualizar el gasto.', { title: 'Error', variant: 'danger', solid: true })
      } finally { this.overlay = false }
    },
    async registrarPago() {
      if (!this.pagoModel.monto || !this.pagoModel.fecha_de_gasto) {
        this.$bvToast.toast('Monto y fecha son obligatorios.', { title: 'Advertencia', variant: 'warning', solid: true })
        return
      }
      this.overlay = true
      try {
        const data = new URLSearchParams()
        data.set('id_gasto_plantilla', this.gastoAPagar._id)
        data.set('tipo', 'fijo')
        data.set('nombre', this.gastoAPagar.nombre)
        data.set('descripcion', this.pagoModel.descripcion || this.gastoAPagar.descripcion || '')
        data.set('monto', this.pagoModel.monto)
        data.set('moneda', this.gastoAPagar.moneda)
        data.set('fecha_de_gasto', this.pagoModel.fecha_de_gasto)
        data.set('periodo', this.pagoModel.fecha_de_gasto.substring(0, 7))
        data.set('id_usuario', this.dataUser.id_empleado)
        await this.$axios.post(`${this.$config.API}/gastos/registros`, data)
        this.$bvToast.toast('Pago registrado exitosamente.', { title: 'Éxito', variant: 'success', solid: true })
        this.$bvModal.hide('modal-pagar-fijo')
        await this.getGastos()
      } catch (e) {
        this.$bvToast.toast('Error al registrar el pago.', { title: 'Error', variant: 'danger', solid: true })
      } finally { this.overlay = false }
    },
    confirmDelete(item) {
      this.$bvModal.msgBoxConfirm(`¿Eliminar la plantilla de gasto "${item.nombre}"? Esto no eliminará los pagos ya registrados.`, {
        title: 'Confirmar Eliminación', okVariant: 'danger', okTitle: 'Sí, eliminar', cancelTitle: 'Cancelar', centered: true,
      }).then(async (val) => {
        if (!val) return
        this.overlay = true
        try {
          await this.$axios.delete(`${this.$config.API}/gastos/${item._id}`)
          this.$bvToast.toast('Gasto eliminado.', { title: 'Éxito', variant: 'success', solid: true })
          await this.getGastos()
        } catch (e) {
          this.$bvToast.toast('Error al eliminar el gasto.', { title: 'Error', variant: 'danger', solid: true })
        } finally { this.overlay = false }
      })
    },
  },
  mounted() { this.getGastos() },
}
</script>