<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-row class="mb-4">
        <b-col>
          <h3 class="text-center">REPORTE DE EFICIENCIA DE EMPLEADOS</h3>
        </b-col>
      </b-row>

      <b-row class="mb-4 justify-content-center">
        <b-col cols="12" md="6" lg="4">
          <b-form-group
            label="Seleccionar Empleado"
            label-class="small font-weight-bold text-muted text-uppercase mb-1"
          >
            <b-form-select
              v-model="selectedEmployeeId"
              :options="empleadosSelect"
              @change="onEmployeeSelected"
              class="empleado-select"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-list-group class="mb-4">
            <b-list-group-item>
              <h3>RELACIÓN DE PAGOS</h3>
            </b-list-group-item>
            <b-list-group-item
              variant="info"
              class="horas-trabajadas-item"
              @click="abrirModalHoras"
            >
              <h3>{{ horasTrabajadas }} HORAS</h3>
            </b-list-group-item>
            <b-list-group-item variant="success"
              ><strong>TERMINADO</strong> $ {{ totalTerminado }}</b-list-group-item
            >
            <b-list-group-item variant="danger"
              ><strong>PENDIENTE</strong> $ {{ totalPendiente }}</b-list-group-item
            >
            <b-list-group-item variant="primary"
              ><strong>TOTAL</strong> $ {{ total }}</b-list-group-item
            >
          </b-list-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col class="mt-4">
          <b-tabs>
            <b-tab title="PENDIENTES" active>
              <b-table-lite
                bordered
                responsive
                small
                striped
                :items="trabajosPendientes()"
                :fields="fields.pendientes"
              >
                <template #cell(id_orden)="data">
                  <linkSearch :id="data.item.id_orden" />
                </template>
                <template #cell(cantidad)="data">
                  {{ data.item.cantidad }}
                </template>
                <template #cell(calculo_pago)="data">
                  ${{
                    montoComisionEmpelado(
                      data.item.comision_tipo,
                      data.item.total_comision_variable,
                      data.item.total_comision_fija
                    )
                  }}
                </template>
                <template #cell(estado_proyeccion)="data">
                  <b-alert
                    :variant="filterFechaEstimada(data.item.id_orden).variant"
                    show
                  >
                    <h4 class="alert-heading">
                      {{ filterFechaEstimada(data.item.id_orden).variant_text }}
                      {{
                        filterFechaEstimada(data.item.id_orden)
                          .fecha_estimada_fin_formateada
                      }}
                    </h4>
                  </b-alert>
                </template>
              </b-table-lite>
            </b-tab>

            <b-tab title="TERMINADOS">
              <b-table-lite
                bordered
                responsive
                small
                striped
                hover
                :items="trabajosTerminados"
                :fields="fields.terminadas"
              >
                <template #cell(id_orden)="data">
                  <linkSearch :id="data.item.id_orden" />
                </template>
                <template #cell(calculo_pago)="data">
                  ${{ data.item.monto_pago }}
                </template>
                <template #cell(producto)="data">
                  <span style="text-transform: capitalize">
                    {{ data.item.producto }}
                  </span>
                </template>
                <template #cell(eficiencia)="data">
                  <a href="#" @click.prevent="abrirModal(data.item)">
                    {{ calcularEficiencia(data.item) }}{{ calcularEficiencia(data.item) !== 'N/A' ? '%' : '' }}
                  </a>
                </template>
                <template #cell(eficiencia_insumos)="data">
                  <a href="#" @click.prevent="abrirModalInsumos(data.item)">
                    {{ calcularEficienciaInsumos(data.item.id_orden) }}{{ calcularEficienciaInsumos(data.item.id_orden) !== 'N/A' ? '%' : '' }}
                  </a>
                </template>
              </b-table-lite>
            </b-tab>
          </b-tabs>
        </b-col>
      </b-row>
    </b-overlay>

    <EficienciaDetalleModal
      :orden="selectedOrden"
      :modal-id="'eficiencia-detalle-modal'"
      @modal-closed="selectedOrden = null"
    />

    <EficienciaInsumosDetalleModal
      :insumo="selectedInsumo"
      :modal-id="'eficiencia-insumos-detalle-modal'"
      @modal-closed="selectedInsumo = null"
    />

    <HorasTrabajadasDetalleModal
      :tareas="ordenesSemana"
      :modal-id="'horas-trabajadas-detalle-modal'"
    />
  </div>
</template>

<script>
import mixin from '~/mixins/mixins.js'
import mixin2 from '~/mixins/mixin-proyeccion-entrega.js'
import procesamientoOrdenesMixin from '~/mixins/procesamientoOrdenes.js'
import EficienciaDetalleModal from '~/components/EficienciaDetalleModal.vue'
import EficienciaInsumosDetalleModal from '~/components/EficienciaInsumosDetalleModal.vue'
import HorasTrabajadasDetalleModal from '~/components/empleados/HorasTrabajadasDetalleModal.vue'

export default {
  components: {
    EficienciaDetalleModal,
    EficienciaInsumosDetalleModal,
    HorasTrabajadasDetalleModal,
  },
  mixins: [mixin, mixin2, procesamientoOrdenesMixin],

  data() {
    return {
      overlay: true,
      ordenes: [],
      ordenesSemana: [],
      ordenesTerminadas: [],
      ordenesPendientes: [],
      eficienciInsumos: [],
      departamento: null,
      employees: [],
      selectedEmployeeId: null,
      selectedEmployeeDepartment: null,
      selectedEmployeeDepartmentId: null,
      fechas: [],
      fechasResult: [],
      selectedOrden: null,
      selectedInsumo: null,
    }
  },

  computed: {
    horasTrabajadas() {
      let totalSegundos = 0
      if (
        this.departamento !== 'Comercialización' &&
        this.departamento !== 'Administración'
      ) {
        if (Array.isArray(this.ordenesSemana)) {
          totalSegundos = this.ordenesSemana
            .filter(
              (el) =>
                el.tiempo_transcurrido != null &&
                !isNaN(parseFloat(el.tiempo_transcurrido))
            )
            .reduce(
              (acc, orden) => acc + parseFloat(orden.tiempo_transcurrido),
              0
            )
        }
      }
      if (totalSegundos === 0) {
        return '0.00'
      }
      const totalHoras = totalSegundos / 3600
      return totalHoras.toFixed(2)
    },

    empleadosSelect() {
      const options = []
      options.push({ value: null, text: 'Seleccione un empleado' })
      if (Array.isArray(this.employees)) {
        const sortedEmployees = [...this.employees].sort((a, b) => {
          const nameA = a.nombre.toUpperCase()
          const nameB = b.nombre.toUpperCase()
          if (nameA < nameB) return -1
          if (nameA > nameB) return 1
          return 0
        })
        sortedEmployees.forEach((employee) => {
          if (Array.isArray(employee.departamentos)) {
            employee.departamentos.forEach((department) => {
              options.push({
                value: `${employee._id}_${department.id}`,
                text: `${employee.nombre} - ${department.nombre}`,
              })
            })
          }
        })
      }
      return options
    },

    fields() {
      let fields = {}
      if (this.departamento === 'Comercialización') {
        fields.pendientes = [
          { key: 'id_orden', label: 'ORD', class: 'text-center' },
          { key: 'fecha_de_pago', label: 'FECHA', class: 'text-center' },
          { key: 'tipo_de_pago', label: 'TIPO', class: 'text-center' },
          { key: 'calculo_pago', label: 'COMISIÓN', class: 'text-center' },
        ]
        fields.terminadas = [
          { key: 'id_orden', label: 'ORD', class: 'text-center' },
          { key: 'calculo_pago', label: 'COMISIÓN', class: 'text-center' },
        ]
      } else if (this.departamento === 'Diseño') {
        fields.pendientes = [
          { key: 'id_orden', label: 'ORD', class: 'text-center' },
          { key: 'producto', label: 'PRODUCTO', class: 'text-center' },
          { key: 'monto_pago', label: 'COMISIÓN', class: 'text-center' },
        ]
        fields.terminadas = [
          { key: 'id_orden', label: 'ORD', class: 'text-center' },
          { key: 'producto', label: 'PRODUCTO', class: 'text-center' },
          { key: 'calculo_pago', label: 'COMISIÓN', class: 'text-center' },
        ]
      } else {
        fields.pendientes = [
          { key: 'id_orden', label: 'ORD', class: 'text-center' },
          { key: 'total_productos', label: 'UND', class: 'text-center' },
          { key: 'cliente', label: 'CLIENTE' },
          {
            key: 'calculo_pago',
            label: '$',
            class: 'text-right',
            thClass: 'text-center',
            tdClass: 'pr-4',
          },
          { key: 'estado_proyeccion', label: 'Estado', class: 'text-center' },
        ]
        fields.terminadas = [
          { key: 'id_orden', label: 'ORD', class: 'text-center' },
          { key: 'total_productos', label: 'UND', class: 'text-center' },
          { key: 'cliente', label: 'CLIENTE' },
          { key: 'eficiencia', label: 'EFICIENCIA TIEMPO', class: 'text-center' },
          { key: 'eficiencia_insumos', label: 'EFICIENCIA INSUMOS', class: 'text-center' },
          {
            key: 'calculo_pago',
            label: '$',
            class: 'text-right',
            thClass: 'text-center',
            tdClass: 'pr-4',
          },
        ]
      }
      return fields
    },

    totalTerminado() {
      let comision = 0
      if (
        this.departamento === 'Comercialización' ||
        this.departamento === 'Administración'
      ) {
        comision = this.ordenesTerminadas.reduce((total, orden) => {
          total += parseFloat(orden.monto_pago)
          return total
        }, 0)
      } else {
        comision = this.ordenesTerminadas.reduce((total, orden) => {
          if (orden.fecha_terminado !== null) {
            total += parseFloat(orden.monto_pago)
          }
          return total
        }, 0)
      }
      return comision.toFixed(2)
    },

    totalPendiente() {
      var total = 0
      this.ordenesPendientes.forEach((orden) => {
        if (orden.fecha_terminado === null) {
          total += this.montoComisionEmpelado(
            orden.comision_tipo,
            orden.total_comision_variable,
            orden.total_comision_fija
          )
        }
      })
      return total.toFixed(2)
    },

    total() {
      const tot =
        parseFloat(this.totalPendiente) + parseFloat(this.totalTerminado)
      return tot.toFixed(2)
    },

    trabajosTerminados() {
      if (this.departamento === 'Diseño') {
        return this.ordenesTerminadas
      } else if (
        this.departamento === 'Comercialización' ||
        this.departamento === 'Administración'
      ) {
        return this.ordenesTerminadas
      } else {
        return this.ordenesTerminadas
          .filter((el) => el.progreso === 'terminada')
          .map((obj) => ({
            ...obj,
            calculo_pago: obj.monto_pago,
          }))
      }
    },
  },

  methods: {
    abrirModalHoras() {
      this.$bvModal.show('horas-trabajadas-detalle-modal')
    },

    abrirModal(orden) {
      this.selectedOrden = orden
      this.$bvModal.show('eficiencia-detalle-modal')
    },

    abrirModalInsumos(item) {
      const insumosDeOrden = this.eficienciInsumos.filter(insumo => insumo.id_orden === item.id_orden);
      if (insumosDeOrden.length > 0) {
        this.selectedInsumo = insumosDeOrden[0];
      } else {
        this.selectedInsumo = null;
      }
      this.$bvModal.show('eficiencia-insumos-detalle-modal');
    },

    calcularEficiencia(orden) {
      // Sin tiempo real registrado no hay con qué comparar el estimado --
      // antes esto mostraba "0%" (parece una eficiencia real pésima) en vez
      // de indicar que sencillamente no hay dato. Mismo criterio ya usado en
      // Reporte General de Eficiencia (eficiencia_tiempo/material = N/A).
      if (
        !orden.tiempo_estimado_de_produccion ||
        !orden.tiempo_empleado ||
        orden.tiempo_empleado === 0
      ) {
        return 'N/A'
      }
      // tiempo_estimado_de_produccion y tiempo_empleado vienen ambos en
      // SEGUNDOS desde el backend (SUM(products_tiempos_de_produccion.tiempo
      // * cantidad) y EXTRACT(EPOCH...) respectivamente). Antes se dividía
      // solo tiempo_empleado entre 60 asumiendo por error que el estimado
      // estaba en minutos, inflando la eficiencia mostrada por un factor de
      // 60 (ej. orden 5708: daba 70515% en vez de 1175%).
      const eficiencia =
        (orden.tiempo_estimado_de_produccion / orden.tiempo_empleado) * 100
      return eficiencia.toFixed(2)
    },

    calcularEficienciaInsumos(idOrden) {
      // Mismo criterio: sin consumo real registrado, mostrar N/A en vez de
      // "0%" -- un 0% se lee como "no se aprovechó nada del insumo", cuando
      // en realidad es que no hay ningún movimiento de inventario asociado.
      const insumosFiltrados = this.eficienciInsumos.filter(insumo => insumo.id_orden === idOrden);
      if (!Array.isArray(insumosFiltrados) || insumosFiltrados.length === 0) {
        return 'N/A'
      }
      const totalEstimado = insumosFiltrados.reduce((acc, insumo) => acc + insumo.consumo_estimado_total, 0)
      const totalReal = insumosFiltrados.reduce((acc, insumo) => acc + insumo.consumo_real_total, 0)

      if (totalReal === 0) {
        return 'N/A'
      }

      const eficiencia = (totalEstimado / totalReal) * 100
      return eficiencia.toFixed(2)
    },

    async getOrdenesFechas() {
      this.overlay = true
      await this.$axios
        .get(`${this.$config.API}/ordenes/proyeccion-entrega`)
        .then((res) => {
          this.fechas = res.data
        })
        .catch((err) => {
          this.$fire({
            title: 'Error',
            html: `<P>No se recibieron las fechas</p><p>${err}</p>`,
            type: 'warning',
          })
        })
        .finally(() => {
          this.overlay = false
        })
    },

    filterFechaEstimada(idOrden) {
      const filtrado = this.fechasResult.filter((el) => el.id_orden == idOrden)
      if (filtrado.length > 0) {
        const fechaEstimada = filtrado[0].tareas
          .filter(
            (el) => el.id_departamento === this.selectedEmployeeDepartmentId
          )
          .map((el) => {
            return {
              fecha_estimada_fin_formateada: el.fecha_estimada_fin_formateada,
              variant: el.variant,
              variant_text: el.variant_text,
            }
          })

        if (fechaEstimada.length > 0) {
          return fechaEstimada[0]
        } else {
          return {
            fecha_estimada_fin_formateada: 'N/A',
            variant: 'light',
            variant_text: 'Sin tarea depto.',
          }
        }
      } else {
        return {
          fecha_estimada_fin_formateada: 'N/A',
          variant: 'light',
          variant_text: 'Sin registros',
        }
      }
    },

    montoComisionEmpelado(
      comision_tipo,
      total_comision_variable,
      total_comision_fija
    ) {
      let comision = 0
      if (comision_tipo === 'fija') {
        comision = total_comision_fija
      } else {
        comision = total_comision_variable
      }
      return comision
    },

    trabajosPendientes() {
      if (this.departamento === 'Diseño') {
        return this.ordenesPendientes.filter(
          (el) => el.fecha_terminado === null
        )
      } else {
        return this.ordenesPendientes.filter(
          (el) => el.fecha_terminado === null
        )
      }
    },

    async getOrdenesAsignadas() {
      this.overlay = true
      if (!this.selectedEmployeeId) {
        this.overlay = false
        return
      }
      let tipo = 'empleados'
      if (this.selectedEmployeeDepartment === 'Diseño') {
        tipo = 'disenadores'
      }
      const [employeeId] = this.selectedEmployeeId.split('_')
      const url = `${this.$config.API}/reportes/resumen/${tipo}/${employeeId}/${this.selectedEmployeeDepartmentId}`
      await this.$axios
        .get(url)
        .then((resp) => {
          const detailedOrders = resp.data.ordenes.map((orden) => ({
            ...orden,
            fecha_entrega_orden: orden.fecha_enrega_raw,
          }))
          this.ordenes = detailedOrders
          this.ordenesSemana = resp.data.ordenes_semana
          this.eficienciInsumos = resp.data.eficiencia_insumos
          this.ordenesTerminadas = resp.data.ordenes_terminadas
          this.ordenesPendientes = resp.data.ordenes_pendientes
          this.overlay = false
        })
        .catch((error) => {
          console.error('Error al cargar órdenes asignadas:', error)
          this.overlay = false
        })
    },

    async getEmpleados() {
      await this.$axios
        .get(`${this.$config.API}/empleados`)
        .then((res) => {
          this.employees = res.data.items
        })
        .finally(() => (this.overlay = false))
    },

    async onEmployeeSelected() {
      if (!this.selectedEmployeeId) {
        this.selectedEmployeeDepartment = null
        this.selectedEmployeeDepartmentId = null
        this.departamento = null
        this.ordenes = []
        this.ordenesSemana = []
        this.ordenesTerminadas = []
        this.ordenesPendientes = []
        return
      }
      const [employeeId, departmentId] = this.selectedEmployeeId.split('_')
      const selectedEmp = this.employees.find(
        (emp) => String(emp._id) === employeeId
      )
      if (selectedEmp) {
        const selectedDept = selectedEmp.departamentos.find(
          (dept) => String(dept.id) === departmentId
        )
        if (selectedDept) {
          this.selectedEmployeeDepartment = selectedDept.nombre
          this.selectedEmployeeDepartmentId = selectedDept.id
          this.departamento = this.selectedEmployeeDepartment
          await this.getOrdenesAsignadas()
          await this.getOrdenesFechas()
          this.fechasResult = this.generarPlanProduccionCompleto(
            this.fechas,
            this.$store.state.login.dataEmpresa.horario_laboral
          )
        } else {
          console.error(
            'Departamento no encontrado para el empleado seleccionado.'
          )
          alert('Error: Departamento no encontrado.')
        }
      } else {
        console.error('Empleado no encontrado.')
        alert('Error: Empleado no encontrado.')
      }
    },
  },

  mounted() {
    this.getEmpleados()
  },
}
</script>

<style scoped>
.empleado-select {
  border-radius: 8px;
  border-color: #ced4da;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.empleado-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.15);
}

.horas-trabajadas-item {
  cursor: pointer;
}
</style>