<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="dataUser.departamento === 'Administración'">
        <div class="animated fadeIn">
          <b-card>
            <div slot="header">
              <strong>Gestión de Remanentes</strong>
              <small>Administración de remanentes de inventario</small>
            </div>

            <!-- Filtros -->
            <b-row class="mb-3">
              <b-col md="3">
                <label>Estado:</label>
                <b-form-select v-model="filtros.tipo" @change="cargarRemanentes">
                  <option value="activos">Items Activos</option>
                  <option value="terminados">Items Terminados</option>
                  <option value="todos">Todos</option>
                </b-form-select>
              </b-col>
              <b-col md="3">
                <label>Desde:</label>
                <b-form-input type="date" v-model="filtros.fecha_desde" @change="cargarRemanentes" />
              </b-col>
              <b-col md="3">
                <label>Hasta:</label>
                <b-form-input type="date" v-model="filtros.fecha_hasta" @change="cargarRemanentes" />
              </b-col>
              <b-col md="3">
                <label>Buscar:</label>
                <b-form-input 
                  v-model="filtros.busqueda" 
                  placeholder="ID, SKU, empleado..."
                  @input="buscarConDebounce"
                />
              </b-col>
            </b-row>

            <!-- Tabla -->
            <b-table
              :items="remanentes"
              :fields="campos"
              :busy="cargando"
              striped
              hover
              responsive
              show-empty
              @sort-changed="cambiarOrden"
            >
              <template #table-busy>
                <div class="text-center my-2">
                  <b-spinner class="align-middle mr-2"></b-spinner>
                  <strong>Cargando...</strong>
                </div>
              </template>

              <template #empty>
                <p class="text-center text-muted my-3">No se encontraron remanentes</p>
              </template>

              <template #cell(nombre_insumo)="data">
                <div>
                  <strong>{{ data.item.nombre_insumo }}</strong>
                  <br>
                  <small class="text-muted">
                    ID: {{ data.item.id_insumo }} | SKU: {{ data.item.sku }}
                  </small>
                </div>
              </template>

              <template #cell(cantidad_remanente)="data">
                {{ parseFloat(data.value).toFixed(2) }} {{ data.item.unidad }}
              </template>

              <template #cell(stock_actual)="data">
                <b-badge 
                  :variant="data.value > 0 ? 'success' : 'secondary'"
                  class="p-2"
                >
                  {{ parseFloat(data.value).toFixed(2) }} {{ data.item.unidad }}
                </b-badge>
              </template>

              <template #cell(fecha)="data">
               {{ formatearFecha(data.value) }}
              </template>

              <template #cell(acciones)="data">
                <b-button-group size="sm">
                  <b-button variant="primary" @click="abrirModalEditar(data.item)">
                    <i class="fa fa-edit"></i> Editar
                  </b-button>
                  <b-button variant="danger" @click="confirmarEliminar(data.item)">
                    <i class="fa fa-trash"></i> Eliminar
                  </b-button>
                </b-button-group>
              </template>
            </b-table>

            <!-- Paginación -->
            <b-pagination
              v-model="paginaActual"
              :total-rows="totalRegistros"
              :per-page="registrosPorPagina"
              @change="cambiarPagina"
              align="center"
              class="mt-3"
            ></b-pagination>

            <div class="text-center text-muted small">
              Mostrando {{ rangoInicio }} - {{ rangoFin }} de {{ totalRegistros }} registros
            </div>
          </b-card>

          <!-- Modal Editar -->
          <b-modal
            id="modal-editar"
            title="Editar Remanente"
            @ok="guardarCambios"
            ok-title="Guardar"
            cancel-title="Cancelar"
          >
            <b-form v-if="remanenteSeleccionado">
              <b-form-group label="Insumo:">
                <b-form-input 
                  :value="`${remanenteSeleccionado.nombre_insumo} (${remanenteSeleccionado.sku})`"
                  disabled
                />
              </b-form-group>

              <b-form-group label="Cantidad:">
                <b-input-group :append="remanenteSeleccionado.unidad">
                  <b-form-input
                    v-model.number="formEditar.cantidad"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </b-input-group>
              </b-form-group>

              <b-form-group label="Motivo:">
                <b-form-input v-model="formEditar.motivo" required />
              </b-form-group>

              <b-form-group label="Observación:">
                <b-form-textarea v-model="formEditar.observacion" rows="3" />
              </b-form-group>
            </b-form>
          </b-modal>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'GestionRemanentes',
  
  data() {
    return {
      remanentes: [],
      cargando: false,
      filtros: {
        tipo: 'activos',
        busqueda: '',
        fecha_desde: null,
        fecha_hasta: null
      },
      ordenamiento: {
        campo: 'r.fecha',
        direccion: 'DESC'
      },
      paginaActual: 1,
      registrosPorPagina: 20,
      totalRegistros: 0,
      remanenteSeleccionado: null,
      formEditar: {
        cantidad: 0,
        motivo: '',
        observacion: ''
      },
      debounceTimeout: null,
      campos: [
        { key: 'id_remanente', label: 'ID Rem.', sortable: true },
        { key: 'nombre_insumo', label: 'Insumo', sortable: true },
        { key: 'cantidad_remanente', label: 'Cant. Remanente', sortable: true },
        { key: 'stock_actual', label: 'Stock Actual', sortable: true },
        { key: 'nombre_empleado', label: 'Empleado', sortable: true },
        { key: 'fecha', label: 'Fecha', sortable: true },
        { key: 'motivo', label: 'Motivo', sortable: false },
        { key: 'acciones', label: 'Acciones', sortable: false }
      ]
    }
  },
  
  computed: {
    ...mapState('login', ['dataUser', 'access']),
    rangoInicio() {
      return (this.paginaActual - 1) * this.registrosPorPagina + 1
    },
    rangoFin() {
      const fin = this.paginaActual * this.registrosPorPagina
      return fin > this.totalRegistros ? this.totalRegistros : fin
    }
  },
  
  mounted() {
    this.cargarRemanentes()
  },
  
  methods: {
    async cargarRemanentes() {
      this.cargando = true
      try {
        const params = {
          tipo: this.filtros.tipo,
          busqueda: this.filtros.busqueda,
          fecha_desde: this.filtros.fecha_desde,
          fecha_hasta: this.filtros.fecha_hasta,
          page: this.paginaActual,
          limit: this.registrosPorPagina,
          order_by: this.ordenamiento.campo,
          order_dir: this.ordenamiento.direccion
        }
        
        const response = await this.$axios.get(
          `${this.$config.API}/inventario/remanentes`,
          { params }
        )
        
        if (response.data.success) {
          this.remanentes = response.data.data
          this.totalRegistros = response.data.total
        }
      } catch (error) {
        console.error('Error al cargar remanentes:', error)
        this.$fire({
          type: 'error',
          title: 'Error',
          html: '<p>No se pudieron cargar los remanentes</p>'
        })
      } finally {
        this.cargando = false
      }
    },
    
    buscarConDebounce() {
      clearTimeout(this.debounceTimeout)
      this.debounceTimeout = setTimeout(() => {
        this.paginaActual = 1
        this.cargarRemanentes()
      }, 500)
    },
    
    cambiarOrden(ctx) {
      const mapeo = {
        'id_remanente': 'r._id',
        'nombre_insumo': 'i.insumo',
        'cantidad_remanente': 'r.cantidad',
        'stock_actual': 'i.cantidad',
        'nombre_empleado': 'emp.nombre',
        'fecha': 'r.fecha'
      }
      
      this.ordenamiento.campo = mapeo[ctx.sortBy] || 'r.fecha'
      this.ordenamiento.direccion = ctx.sortDesc ? 'DESC' : 'ASC'
      this.cargarRemanentes()
    },
    
    cambiarPagina(pagina) {
      this.paginaActual = pagina
      this.cargarRemanentes()
    },
    
    abrirModalEditar(item) {
      this.remanenteSeleccionado = { ...item }
      this.formEditar = {
        cantidad: parseFloat(item.cantidad_remanente),
        motivo: item.motivo || '',
        observacion: item.observacion || ''
      }
      this.$bvModal.show('modal-editar')
    },
    
    async guardarCambios(bvModalEvt) {
      bvModalEvt.preventDefault()
      
      try {
        const response = await this.$axios.put(
          `${this.$config.API}/inventario/remanentes/${this.remanenteSeleccionado.id_remanente}`,
          this.formEditar
        )
        
        if (response.data.success) {
          this.$fire({
            type: 'success',
            title: 'Éxito',
            html: '<p>Remanente actualizado correctamente</p>'
          })
          this.$bvModal.hide('modal-editar')
          this.cargarRemanentes()
        }
      } catch (error) {
        console.error('Error al actualizar remanente:', error)
        this.$fire({
          type: 'error',
          title: 'Error',
          html: '<p>No se pudo actualizar el remanente</p>'
        })
      }
    },
    
    confirmarEliminar(item) {
      this.$confirm(
        `¿Está seguro que desea eliminar el remanente de "${item.nombre_insumo}"? Esta acción no se puede deshacer.`,
        'Confirmar eliminación',
        'warning'
      )
        .then(async () => {
          await this.eliminarRemanente(item.id_remanente)
        })
        .catch(() => {
          // Usuario canceló
        })
    },
    
    async eliminarRemanente(id) {
      try {
        const response = await this.$axios.delete(
          `${this.$config.API}/inventario/remanentes/${id}`
        )
        
        if (response.data.success) {
          this.$fire({
            type: 'success',
            title: 'Éxito',
            html: '<p>Remanente eliminado correctamente</p>'
          })
          this.cargarRemanentes()
        }
      } catch (error) {
        console.error('Error al eliminar remanente:', error)
        this.$fire({
          type: 'error',
          title: 'Error',
          html: '<p>No se pudo eliminar el remanente</p>'
        })
      }
    },
    
    formatearFecha(fecha) {
      if (!fecha) return '-'
      const d = new Date(fecha)
      return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.badge {
  font-size: 0.9em;
}
</style>
