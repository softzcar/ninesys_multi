&lt;template&gt;
&lt;div class="animated fadeIn"&gt;
&lt;b-card&gt;
&lt;div slot="header"&gt;
&lt;strong&gt;Gestión de Remanentes&lt;/strong&gt;
&lt;small&gt;Administración de remanentes de inventario&lt;/small&gt;
&lt;/div&gt;

&lt;!-- Filtros --&gt;
&lt;b-row class="mb-3"&gt;
&lt;b-col md="3"&gt;
&lt;label&gt;Estado:&lt;/label&gt;
&lt;b-form-select v-model="filtros.tipo" @change="cargarRemanentes"&gt;
&lt;option value="activos"&gt;Items Activos&lt;/option&gt;
&lt;option value="terminados"&gt;Items Terminados&lt;/option&gt;
&lt;option value="todos"&gt;Todos&lt;/option&gt;
&lt;/b-form-select&gt;
&lt;/b-col&gt;
&lt;b-col md="3"&gt;
&lt;label&gt;Desde:&lt;/label&gt;
&lt;b-form-input type="date" v-model="filtros.fecha_desde" @change="cargarRemanentes" /&gt;
&lt;/b-col&gt;
&lt;b-col md="3"&gt;
&lt;label&gt;Hasta:&lt;/label&gt;
&lt;b-form-input type="date" v-model="filtros.fecha_hasta" @change="cargarRemanentes" /&gt;
&lt;/b-col&gt;
&lt;b-col md="3"&gt;
&lt;label&gt;Buscar:&lt;/label&gt;
&lt;b-form-input
v-model="filtros.busqueda"
placeholder="ID, SKU, empleado..."
@input="buscarConDebounce"
/&gt;
&lt;/b-col&gt;
&lt;/b-row&gt;

&lt;!-- Tabla --&gt;
&lt;b-table
:items="remanentes"
:fields="campos"
:busy="cargando"
striped
hover
responsive
show-empty
@sort-changed="cambiarOrden"
&gt;
&lt;template #table-busy&gt;
&lt;div class="text-center my-2"&gt;
&lt;b-spinner class="align-middle mr-2"&gt;&lt;/b-spinner&gt;
&lt;strong&gt;Cargando...&lt;/strong&gt;
&lt;/div&gt;
&lt;/template&gt;

&lt;template #empty&gt;
&lt;p class="text-center text-muted my-3"&gt;No se encontraron remanentes&lt;/p&gt;
&lt;/template&gt;

&lt;template #cell(nombre_insumo)="data"&gt;
&lt;div&gt;
&lt;strong&gt;{{ data.item.nombre_insumo }}&lt;/strong&gt;
&lt;br&gt;
&lt;small class="text-muted"&gt;
ID: {{ data.item.id_insumo }} | SKU: {{ data.item.sku }}
&lt;/small&gt;
&lt;/div&gt;
&lt;/template&gt;

&lt;template #cell(cantidad_remanente)="data"&gt;
{{ parseFloat(data.value).toFixed(2) }} {{ data.item.unidad }}
&lt;/template&gt;

&lt;template #cell(stock_actual)="data"&gt;
&lt;b-badge
:variant="data.value &gt; 0 ? 'success' : 'secondary'"
class="p-2"
&gt;
{{ parseFloat(data.value).toFixed(2) }} {{ data.item.unidad }}
&lt;/b-badge&gt;
&lt;/template&gt;

&lt;template #cell(fecha)="data"&gt;
{{ formatearFecha(data.value) }}
&lt;/template&gt;

&lt;template #cell(acciones)="data"&gt;
&lt;b-button-group size="sm"&gt;
&lt;b-button variant="primary" @click="abrirModalEditar(data.item)"&gt;
&lt;i class="fa fa-edit"&gt;&lt;/i&gt; Editar
&lt;/b-button&gt;
&lt;b-button variant="danger" @click="confirmarEliminar(data.item)"&gt;
&lt;i class="fa fa-trash"&gt;&lt;/i&gt; Eliminar
&lt;/b-button&gt;
&lt;/b-button-group&gt;
&lt;/template&gt;
&lt;/b-table&gt;

&lt;!-- Paginación --&gt;
&lt;b-pagination
v-model="paginaActual"
:total-rows="totalRegistros"
:per-page="registrosPorPagina"
@change="cambiarPagina"
align="center"
class="mt-3"
&gt;&lt;/b-pagination&gt;

&lt;div class="text-center text-muted small"&gt;
Mostrando {{ rangoInicio }} - {{ rangoFin }} de {{ totalRegistros }} registros
&lt;/div&gt;
&lt;/b-card&gt;

&lt;!-- Modal Editar --&gt;
&lt;b-modal
id="modal-editar"
title="Editar Remanente"
@ok="guardarCambios"
ok-title="Guardar"
cancel-title="Cancelar"
&gt;
&lt;b-form v-if="remanenteSeleccionado"&gt;
&lt;b-form-group label="Insumo:"&gt;
&lt;b-form-input
:value="`${remanenteSeleccionado.nombre_insumo} (${remanenteSeleccionado.sku})`"
disabled
/&gt;
&lt;/b-form-group&gt;

&lt;b-form-group label="Cantidad:"&gt;
&lt;b-input-group :append="remanenteSeleccionado.unidad"&gt;
&lt;b-form-input
v-model.number="formEditar.cantidad"
type="number"
step="0.01"
min="0"
required
/&gt;
&lt;/b-input-group&gt;
&lt;/b-form-group&gt;

&lt;b-form-group label="Motivo:"&gt;
&lt;b-form-input v-model="formEditar.motivo" required /&gt;
&lt;/b-form-group&gt;

&lt;b-form-group label="Observación:"&gt;
&lt;b-form-textarea v-model="formEditar.observacion" rows="3" /&gt;
&lt;/b-form-group&gt;
&lt;/b-form&gt;
&lt;/b-modal&gt;
&lt;/div&gt;
&lt;/template&gt;

&lt;script&gt;
export default {
name: 'GestionRemanentes',
layout: 'admin',

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
html: '&lt;p&gt;No se pudieron cargar los remanentes&lt;/p&gt;'
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
// Mapear nombre de campo visible a nombre de columna SQL
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
html: '&lt;p&gt;Remanente actualizado correctamente&lt;/p&gt;'
})
this.$bvModal.hide('modal-editar')
this.cargarRemanentes()
}
} catch (error) {
console.error('Error al actualizar remanente:', error)
this.$fire({
type: 'error',
title: 'Error',
html: '&lt;p&gt;No se pudo actualizar el remanente&lt;/p&gt;'
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
html: '&lt;p&gt;Remanente eliminado correctamente&lt;/p&gt;'
})
this.cargarRemanentes()
}
} catch (error) {
console.error('Error al eliminar remanente:', error)
this.$fire({
type: 'error',
title: 'Error',
html: '&lt;p&gt;No se pudo eliminar el remanente&lt;/p&gt;'
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
&lt;/script&gt;

&lt;style scoped&gt;
.badge {
font-size: 0.9em;
}
&lt;/style&gt;
