<template>
  <div>
    <b-overlay :show="overlay" spinner-variant="primary">
      <b-container>
        <b-row class="mb-4 align-items-center">
          <b-col>
            <h3>Gastos Adicionales</h3>
            <p class="text-muted mb-0">Gastos esporádicos o únicos (reparaciones, compras puntuales, etc.)</p>
          </b-col>
          <b-col class="text-right">
            <b-button variant="success" @click="openCreateModal">
              <b-icon-plus-circle-fill></b-icon-plus-circle-fill> Registrar Gasto Adicional
            </b-button>
          </b-col>
        </b-row>

        <!-- Filtro de mes -->
        <b-row class="mb-3">
          <b-col md="4">
            <b-form-group label="Filtrar por mes:" label-for="filtro-mes-adicional" class="mb-0">
              <b-form-input id="filtro-mes-adicional" v-model="filtroMes" type="month" @change="getRegistros"></b-form-input>
            </b-form-group>
          </b-col>
          <b-col class="d-flex align-items-end">
            <b-badge variant="info" class="p-2" v-if="totalMes > 0">
              Total del período: <strong>{{ totalMes | currency }}</strong>
            </b-badge>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-table striped hover :items="registros" :fields="fields" responsive show-empty empty-text="No hay gastos adicionales en este período.">
              <template #cell(monto)="data">
                {{ data.item.monto | currency }} {{ data.item.moneda }}
              </template>
              <template #cell(fecha_de_gasto)="data">
                {{ formatDate(data.item.fecha_de_gasto) }}
              </template>
              <template #cell(acciones)="data">
                <b-button variant="primary" size="sm" class="mr-1" @click="openEditModal(data.item)">
                  <b-icon icon="pencil-square"></b-icon>
                </b-button>
                <b-button variant="danger" size="sm" @click="confirmDelete(data.item)">
                  <b-icon icon="trash-fill"></b-icon>
                </b-button>
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>

    <!-- Modal Registrar/Editar Gasto Adicional -->
    <b-modal id="modal-gasto-adicional" :title="editMode ? 'Editar Gasto Adicional' : 'Registrar Gasto Adicional'" @ok="handleOk" @hidden="resetModal" centered ok-title="Guardar" cancel-title="Cancelar" ok-variant="success">
      <b-alert v-if="!editMode" show variant="info" class="small">
        <b-icon icon="info-circle"></b-icon> Los gastos adicionales se registran como ya pagados en el momento del registro.
      </b-alert>
      <b-form-group label="Concepto del gasto:" label-for="nombre-adicional">
        <b-form-input id="nombre-adicional" v-model="gastoModel.nombre" required placeholder="Ej: Reparación de aire acondicionado"></b-form-input>
      </b-form-group>
      <b-form-group label="Descripción (opcional):" label-for="desc-adicional">
        <b-form-textarea id="desc-adicional" v-model="gastoModel.descripcion" rows="2" placeholder="Detalle adicional..."></b-form-textarea>
      </b-form-group>
      <b-row>
        <b-col md="7">
          <b-form-group label="Monto pagado:" label-for="monto-adicional">
            <b-form-input id="monto-adicional" v-model.number="gastoModel.monto" type="number" step="0.01" min="0.01" required placeholder="0.00"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col md="5">
          <b-form-group label="Moneda:" label-for="moneda-adicional">
            <b-form-select id="moneda-adicional" v-model="gastoModel.moneda" :options="['USD', 'VES', 'COP', 'bolivar']"></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      <b-form-group label="Fecha del gasto:" label-for="fecha-adicional">
        <b-form-input id="fecha-adicional" v-model="gastoModel.fecha_de_gasto" type="date" required></b-form-input>
      </b-form-group>

      <!-- Solo en modo edición: campo de motivo (auditoría) -->
      <div v-if="editMode">
        <hr>
        <b-alert show variant="warning" class="small">
          <b-icon icon="exclamation-triangle"></b-icon> Al editar un pago se registrará en la bitácora de auditoría.
        </b-alert>
        <b-form-group label="Motivo de la edición:" label-for="motivo-adicional">
          <b-form-input id="motivo-adicional" v-model="gastoModel.motivo" required placeholder="Explica el motivo de la modificación"></b-form-input>
        </b-form-group>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'GastosAdicionales',
  computed: {
    ...mapState('login', ['dataUser']),
    totalMes() {
      return this.registros.reduce((acc, r) => acc + parseFloat(r.monto || 0), 0)
    }
  },
  data() {
    const now = new Date()
    return {
      overlay: true,
      registros: [],
      editMode: false,
      filtroMes: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      gastoModel: { _id: null, nombre: '', descripcion: '', monto: null, moneda: 'USD', fecha_de_gasto: new Date().toISOString().substring(0, 10), motivo: '' },
      fields: [
        { key: 'nombre', label: 'Concepto', sortable: true },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'monto', label: 'Monto', sortable: true },
        { key: 'fecha_de_gasto', label: 'Fecha', sortable: true },
        { key: 'acciones', label: 'Acciones' },
      ],
    }
  },
  methods: {
    formatDate(d) {
      if (!d) return '-'
      return new Date(d + 'T00:00:00').toLocaleDateString('es-VE')
    },
    async getRegistros() {
      this.overlay = true
      try {
        const { data } = await this.$axios.get(`${this.$config.API}/gastos/registros`, {
          params: { tipo: 'adicional', periodo: this.filtroMes }
        })
        this.registros = data || []
      } catch (e) {
        this.$bvToast.toast('No se pudieron cargar los gastos.', { title: 'Error', variant: 'danger', solid: true })
      } finally { this.overlay = false }
    },
    openCreateModal() { this.resetModal(); this.$bvModal.show('modal-gasto-adicional') },
    openEditModal(item) {
      this.gastoModel = { ...item, fecha_de_gasto: item.fecha_de_gasto?.substring(0, 10) || '', motivo: '' }
      this.editMode = true
      this.$bvModal.show('modal-gasto-adicional')
    },
    resetModal() {
      this.gastoModel = { _id: null, nombre: '', descripcion: '', monto: null, moneda: 'USD', fecha_de_gasto: new Date().toISOString().substring(0, 10), motivo: '' }
      this.editMode = false
    },
    handleOk(bvEvt) { bvEvt.preventDefault(); this.editMode ? this.updateRegistro() : this.createRegistro() },
    async createRegistro() {
      if (!this.gastoModel.nombre || !this.gastoModel.monto || !this.gastoModel.fecha_de_gasto) {
        this.$bvToast.toast('Concepto, monto y fecha son obligatorios.', { title: 'Advertencia', variant: 'warning', solid: true }); return
      }
      this.overlay = true
      try {
        const data = new URLSearchParams()
        data.set('tipo', 'adicional')
        data.set('nombre', this.gastoModel.nombre)
        data.set('descripcion', this.gastoModel.descripcion || '')
        data.set('monto', this.gastoModel.monto)
        data.set('moneda', this.gastoModel.moneda)
        data.set('fecha_de_gasto', this.gastoModel.fecha_de_gasto)
        data.set('periodo', this.gastoModel.fecha_de_gasto.substring(0, 7))
        data.set('id_usuario', this.dataUser.id_empleado)
        await this.$axios.post(`${this.$config.API}/gastos/registros`, data)
        this.$bvToast.toast('Gasto registrado.', { title: 'Éxito', variant: 'success', solid: true })
        this.$bvModal.hide('modal-gasto-adicional')
        await this.getRegistros()
      } catch (e) { this.$bvToast.toast('Error al registrar.', { title: 'Error', variant: 'danger', solid: true }) }
      finally { this.overlay = false }
    },
    async updateRegistro() {
      if (!this.gastoModel.motivo) {
        this.$bvToast.toast('El motivo de la edición es obligatorio.', { title: 'Advertencia', variant: 'warning', solid: true }); return
      }
      this.overlay = true
      try {
        const data = new URLSearchParams()
        data.set('nombre', this.gastoModel.nombre)
        data.set('descripcion', this.gastoModel.descripcion || '')
        data.set('monto', this.gastoModel.monto)
        data.set('moneda', this.gastoModel.moneda)
        data.set('fecha_de_gasto', this.gastoModel.fecha_de_gasto)
        data.set('id_usuario', this.dataUser.id_empleado)
        data.set('nombre_usuario', this.dataUser.nombre || this.dataUser.email)
        data.set('detalle', this.gastoModel.motivo)
        await this.$axios.put(`${this.$config.API}/gastos/registros/${this.gastoModel._id}`, data)
        this.$bvToast.toast('Gasto actualizado.', { title: 'Éxito', variant: 'success', solid: true })
        this.$bvModal.hide('modal-gasto-adicional')
        await this.getRegistros()
      } catch (e) { this.$bvToast.toast('Error al actualizar.', { title: 'Error', variant: 'danger', solid: true }) }
      finally { this.overlay = false }
    },
    confirmDelete(item) {
      this.$bvModal.msgBoxConfirm(`¿Eliminar el gasto "${item.nombre}"? Esta acción quedará en la bitácora de auditoría.`, {
        title: 'Confirmar Eliminación', okVariant: 'danger', okTitle: 'Eliminar', cancelTitle: 'Cancelar', centered: true,
      }).then(async val => {
        if (!val) return
        const motivo = prompt('Ingresa el motivo de la eliminación (obligatorio):')
        if (!motivo) { this.$bvToast.toast('El motivo es obligatorio.', { title: 'Advertencia', variant: 'warning', solid: true }); return }
        this.overlay = true
        try {
          const data = new URLSearchParams()
          data.set('id_usuario', this.dataUser.id_empleado)
          data.set('nombre_usuario', this.dataUser.nombre || this.dataUser.email)
          data.set('detalle', motivo)
          await this.$axios.delete(`${this.$config.API}/gastos/registros/${item._id}`, { data })
          this.$bvToast.toast('Gasto eliminado.', { title: 'Éxito', variant: 'success', solid: true })
          await this.getRegistros()
        } catch (e) { this.$bvToast.toast('Error al eliminar.', { title: 'Error', variant: 'danger', solid: true }) }
        finally { this.overlay = false }
      })
    },
  },
  mounted() { this.getRegistros() },
}
</script>
