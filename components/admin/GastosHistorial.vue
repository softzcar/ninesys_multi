<template>
  <div>
    <b-overlay :show="overlay" spinner-variant="primary">
      <b-container>
        <b-row class="mb-4 align-items-center">
          <b-col>
            <h3>Historial de Pagos de Gastos</h3>
            <p class="text-muted mb-0">Todos los pagos registrados con opciones de edición y eliminación auditadas.</p>
          </b-col>
        </b-row>

        <!-- Filtros -->
        <b-card class="mb-4" bg-variant="light">
          <b-row>
            <b-col md="3">
              <b-form-group label="Desde:" label-for="hist-desde" class="mb-0">
                <b-form-input id="hist-desde" v-model="filtros.desde" type="date"></b-form-input>
              </b-form-group>
            </b-col>
            <b-col md="3">
              <b-form-group label="Hasta:" label-for="hist-hasta" class="mb-0">
                <b-form-input id="hist-hasta" v-model="filtros.hasta" type="date"></b-form-input>
              </b-form-group>
            </b-col>
            <b-col md="3">
              <b-form-group label="Tipo de gasto:" label-for="hist-tipo" class="mb-0">
                <b-form-select id="hist-tipo" v-model="filtros.tipo" :options="opcionesTipo"></b-form-select>
              </b-form-group>
            </b-col>
            <b-col md="3" class="d-flex align-items-end">
              <b-button variant="primary" @click="getRegistros" block>
                <b-icon icon="search"></b-icon> Buscar
              </b-button>
            </b-col>
          </b-row>
        </b-card>

        <!-- Totales -->
        <b-row class="mb-3" v-if="registros.length > 0">
          <b-col>
            <b-badge variant="success" class="mr-2 p-2">Pagos: {{ registros.length }}</b-badge>
            <b-badge v-for="(total, moneda) in totalesPorMoneda" :key="moneda" variant="info" class="mr-2 p-2">
              Total {{ moneda }}: {{ total | currency }}
            </b-badge>
          </b-col>
        </b-row>

        <!-- Tabla -->
        <b-row>
          <b-col>
            <b-table striped hover :items="registros" :fields="fields" responsive show-empty empty-text="No se encontraron pagos para el período seleccionado.">
              <template #cell(tipo)="data">
                <b-badge :variant="tipoBadge(data.item.tipo)">{{ data.item.tipo }}</b-badge>
              </template>
              <template #cell(monto)="data">
                {{ data.item.monto | currency }} {{ data.item.moneda }}
              </template>
              <template #cell(fecha_de_gasto)="data">
                {{ formatDate(data.item.fecha_de_gasto) }}
              </template>
              <template #cell(acciones)="data">
                <b-button variant="primary" size="sm" class="mr-1" @click="openEditModal(data.item)">
                  <b-icon icon="pencil-square"></b-icon> Editar
                </b-button>
                <b-button variant="danger" size="sm" @click="openDeleteModal(data.item)">
                  <b-icon icon="trash-fill"></b-icon> Eliminar
                </b-button>
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>

    <!-- Modal Editar Pago -->
    <b-modal id="modal-edit-pago" title="Editar Pago" @ok="handleEditOk" @hidden="resetEditModal" centered ok-title="Guardar Cambios" cancel-title="Cancelar" ok-variant="primary">
      <div v-if="editModel">
        <b-alert show variant="warning" class="small">
          <b-icon icon="exclamation-triangle"></b-icon> Esta acción quedará registrada en la bitácora de auditoría.
        </b-alert>
        <b-form-group label="Monto:" label-for="edit-monto">
          <b-input-group :append="editModel.moneda">
            <b-form-input id="edit-monto" v-model.number="editModel.monto" type="number" step="0.01" required></b-form-input>
          </b-input-group>
        </b-form-group>
        <b-form-group label="Fecha del pago:" label-for="edit-fecha">
          <b-form-input id="edit-fecha" v-model="editModel.fecha_de_gasto" type="date" required></b-form-input>
        </b-form-group>
        <b-form-group label="Descripción:" label-for="edit-desc">
          <b-form-input id="edit-desc" v-model="editModel.descripcion"></b-form-input>
        </b-form-group>
        <hr>
        <b-form-group label="Motivo de la edición *:" label-for="edit-motivo">
          <b-form-textarea id="edit-motivo" v-model="editModel.motivo" rows="2" required placeholder="Explica por qué estás editando este pago..."></b-form-textarea>
        </b-form-group>
      </div>
    </b-modal>

    <!-- Modal Eliminar con Motivo -->
    <b-modal id="modal-delete-pago" title="Eliminar Pago" @ok="handleDeleteOk" @hidden="resetDeleteModal" centered ok-title="Confirmar Eliminación" cancel-title="Cancelar" ok-variant="danger">
      <div v-if="deleteModel">
        <b-alert show variant="danger">
          <strong>¿Eliminar el pago?</strong><br>
          {{ deleteModel.nombre }} — {{ deleteModel.monto | currency }} {{ deleteModel.moneda }} del {{ formatDate(deleteModel.fecha_de_gasto) }}
        </b-alert>
        <b-form-group label="Motivo de la eliminación *:" label-for="delete-motivo">
          <b-form-textarea id="delete-motivo" v-model="deleteMotivo" rows="2" required placeholder="Explica por qué estás eliminando este pago..."></b-form-textarea>
        </b-form-group>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'GastosHistorial',
  computed: {
    ...mapState('login', ['dataUser']),
    totalesPorMoneda() {
      return this.registros.reduce((acc, r) => {
        const m = r.moneda || 'USD'
        acc[m] = (acc[m] || 0) + parseFloat(r.monto || 0)
        return acc
      }, {})
    },
  },
  data() {
    const now = new Date()
    const primerDiaMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const hoy = now.toISOString().substring(0, 10)
    return {
      overlay: false,
      registros: [],
      editModel: null,
      deleteModel: null,
      deleteMotivo: '',
      filtros: { desde: primerDiaMes, hasta: hoy, tipo: '' },
      opcionesTipo: [
        { value: '', text: 'Todos los tipos' },
        { value: 'fijo', text: 'Fijos' },
        { value: 'variable', text: 'Variables' },
        { value: 'adicional', text: 'Adicionales' },
      ],
      fields: [
        { key: 'nombre', label: 'Concepto', sortable: true },
        { key: 'tipo', label: 'Tipo', sortable: true },
        { key: 'monto', label: 'Monto', sortable: true },
        { key: 'fecha_de_gasto', label: 'Fecha', sortable: true },
        { key: 'periodo', label: 'Período' },
        { key: 'acciones', label: 'Acciones' },
      ],
    }
  },
  methods: {
    formatDate(d) {
      if (!d) return '-'
      return new Date(d + 'T00:00:00').toLocaleDateString('es-VE')
    },
    tipoBadge(tipo) {
      return { fijo: 'primary', variable: 'warning', adicional: 'secondary' }[tipo] || 'light'
    },
    async getRegistros() {
      this.overlay = true
      try {
        const params = {}
        if (this.filtros.desde) params.desde = this.filtros.desde
        if (this.filtros.hasta) params.hasta = this.filtros.hasta
        if (this.filtros.tipo) params.tipo = this.filtros.tipo
        const { data } = await this.$axios.get(`${this.$config.API}/gastos/registros`, { params })
        this.registros = data || []
      } catch (e) {
        this.$bvToast.toast('No se pudo cargar el historial.', { title: 'Error', variant: 'danger', solid: true })
      } finally { this.overlay = false }
    },
    openEditModal(item) {
      this.editModel = { ...item, fecha_de_gasto: item.fecha_de_gasto?.substring(0, 10) || '', motivo: '' }
      this.$bvModal.show('modal-edit-pago')
    },
    openDeleteModal(item) {
      this.deleteModel = item
      this.deleteMotivo = ''
      this.$bvModal.show('modal-delete-pago')
    },
    resetEditModal() { this.editModel = null },
    resetDeleteModal() { this.deleteModel = null; this.deleteMotivo = '' },
    handleEditOk(bvEvt) { bvEvt.preventDefault(); this.updateRegistro() },
    handleDeleteOk(bvEvt) { bvEvt.preventDefault(); this.deleteRegistro() },
    async updateRegistro() {
      if (!this.editModel.motivo) {
        this.$bvToast.toast('El motivo de la edición es obligatorio.', { title: 'Advertencia', variant: 'warning', solid: true }); return
      }
      this.overlay = true
      try {
        const data = new URLSearchParams()
        data.set('nombre', this.editModel.nombre)
        data.set('descripcion', this.editModel.descripcion || '')
        data.set('monto', this.editModel.monto)
        data.set('fecha_de_gasto', this.editModel.fecha_de_gasto)
        data.set('id_usuario', this.dataUser.id_empleado)
        data.set('nombre_usuario', this.dataUser.nombre || this.dataUser.email)
        data.set('detalle', this.editModel.motivo)
        await this.$axios.put(`${this.$config.API}/gastos/registros/${this.editModel._id}`, data)
        this.$bvToast.toast('Pago actualizado.', { title: 'Éxito', variant: 'success', solid: true })
        this.$bvModal.hide('modal-edit-pago')
        await this.getRegistros()
      } catch (e) { this.$bvToast.toast('Error al actualizar.', { title: 'Error', variant: 'danger', solid: true }) }
      finally { this.overlay = false }
    },
    async deleteRegistro() {
      if (!this.deleteMotivo) {
        this.$bvToast.toast('El motivo de la eliminación es obligatorio.', { title: 'Advertencia', variant: 'warning', solid: true }); return
      }
      this.overlay = true
      try {
        const data = new URLSearchParams()
        data.set('id_usuario', this.dataUser.id_empleado)
        data.set('nombre_usuario', this.dataUser.nombre || this.dataUser.email)
        data.set('detalle', this.deleteMotivo)
        await this.$axios.delete(`${this.$config.API}/gastos/registros/${this.deleteModel._id}`, { data })
        this.$bvToast.toast('Pago eliminado y auditado.', { title: 'Éxito', variant: 'success', solid: true })
        this.$bvModal.hide('modal-delete-pago')
        await this.getRegistros()
      } catch (e) { this.$bvToast.toast('Error al eliminar.', { title: 'Error', variant: 'danger', solid: true }) }
      finally { this.overlay = false }
    },
  },
  mounted() { this.getRegistros() },
}
</script>
