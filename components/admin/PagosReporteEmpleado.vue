<template>
  <span>
    <b-button
      variant="outline-secondary"
      size="sm"
      title="Ver reporte detallado de pago"
      class="ml-1 btn-reporte-empleado"
      @click="abrirReporte"
    >
      <b-icon icon="file-earmark-text" />
    </b-button>

    <b-modal
      :id="`reporte-modal-${idEmpleado}`"
      :title="`Reporte de Pago — ${nombreEmpleado}`"
      size="xl"
      scrollable
      hide-footer
    >
      <div v-if="cargando" class="text-center py-4">
        <b-spinner small /> Cargando reporte...
      </div>

      <div v-else-if="data" ref="reporteContenido">
        <!-- Cabecera empresa -->
        <div class="reporte-header mb-3">
          <strong class="d-block">{{ data.empresa.nombre_empresa }}</strong>
          <small v-if="data.empresa.direccion" class="d-block text-muted">{{ data.empresa.direccion }}</small>
          <small v-if="data.empresa.telefonos" class="d-block text-muted">Tel: {{ data.empresa.telefonos }}</small>
          <small v-if="data.empresa.email" class="d-block text-muted">{{ data.empresa.email }}</small>
          <hr class="my-1" />
          <strong>Reporte de Pago</strong>
          <span class="float-right text-muted"><small>Emisión: {{ fechaEmision }}</small></span>
          <br />
          <span><strong>Empleado:</strong> {{ data.empleado.nombre }}</span>
          <span class="ml-4"><strong>Departamento:</strong> {{ data.empleado.departamento || '—' }}</span>
          <span class="ml-4"><strong>Período:</strong> {{ periodoLabel }}</span>
        </div>

        <!-- Salario -->
        <div v-if="salarioInfo.visible" class="alert mb-2 py-1 px-3"
          :class="salarioInfo.pagado ? 'alert-success' : 'alert-warning'"
          style="font-size:0.85rem"
        >
          <strong>Salario:</strong>
          <span v-if="salarioInfo.pagado"> ${{ numberFmt(salarioInfo.monto) }} <small class="text-success">(✓ Pagado este período)</small></span>
          <span v-else> ${{ numberFmt(salarioInfo.monto) }} <small>(Pendiente de pago)</small></span>
        </div>

        <table class="table table-sm table-bordered reporte-tabla">
          <thead class="thead-light">
            <tr>
              <th>Orden</th>
              <th>Departamento</th>
              <th>Producto</th>
              <th class="text-right">Uds.</th>
              <th class="text-right">Comisión</th>
              <th class="text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="data.pagos && data.pagos.length > 0">
              <tr v-for="pago in data.pagos" :key="pago.id_pago">
                <td>{{ pago.id_orden || '—' }}</td>
                <td>{{ pago.nombre_departamento || pago.departamento_pago || '—' }}</td>
                <td>{{ pago.producto || '—' }}</td>
                <td class="text-right">{{ pago.cantidad }}</td>
                <td class="text-right">
                  <small v-if="pago.comision_tipo === 'fija'">Fija</small>
                  <small v-else-if="pago.comision_tipo === 'variable'">${{ numberFmt(pago.comision) }}/u</small>
                  <small v-else-if="pago.comision_tipo === 'porcentaje'">{{ pago.comision }}%</small>
                  <small v-else>—</small>
                </td>
                <td class="text-right"><strong>${{ numberFmt(pago.monto_pago) }}</strong></td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="6" class="text-center text-muted">Sin registros de comisión</td>
            </tr>
          </tbody>
        </table>

        <!-- Totales -->
        <div class="reporte-totales mt-3">
          <table class="table table-sm table-borderless ml-auto reporte-tabla-totales">
            <tbody>
              <tr>
                <td class="text-right">Total Piezas Trabajadas:</td>
                <td class="text-right"><strong>{{ data.totales.piezas || 0 }}</strong></td>
              </tr>
              <tr>
                <td class="text-right">Total Comisiones:</td>
                <td class="text-right"><strong>${{ numberFmt(data.totales.comision) }}</strong></td>
              </tr>
              <tr v-if="salarioInfo.visible">
                <td class="text-right">
                  <span v-if="salarioInfo.pagado">Salario Pagado:</span>
                  <span v-else class="text-warning">Salario (Pendiente):</span>
                </td>
                <td class="text-right">
                  <strong>
                    <span>${{ numberFmt(salarioInfo.monto) }}</span>
                  </strong>
                </td>
              </tr>
              <tr v-for="bono in data.bonos" :key="'b-' + bono.descripcion">
                <td class="text-right text-success">Bono ({{ bono.descripcion }}):</td>
                <td class="text-right text-success"><strong>+${{ numberFmt(bono.monto) }}</strong></td>
              </tr>
              <tr v-for="desc in data.descuentos" :key="'d-' + desc.descripcion">
                <td class="text-right text-danger">Descuento ({{ desc.descripcion }}):</td>
                <td class="text-right text-danger"><strong>-${{ numberFmt(desc.monto) }}</strong></td>
              </tr>
              <tr class="border-top">
                <td class="text-right">
                  <strong>{{ pendiente ? 'TOTAL A PAGAR:' : 'TOTAL PAGADO:' }}</strong>
                </td>
                <td class="text-right">
                  <strong class="text-success">${{ numberFmt(totalEsperado) }}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="text-muted text-center py-4">No hay datos para mostrar.</div>

      <!-- Botones del modal -->
      <template #modal-footer>
        <b-button variant="secondary" @click="$bvModal.hide(`reporte-modal-${idEmpleado}`)">Cerrar</b-button>
        <b-button variant="primary" :disabled="!data" @click="imprimir">
          <b-icon icon="printer-fill" class="mr-1" /> Imprimir
        </b-button>
      </template>
    </b-modal>
  </span>
</template>

<script>
import PrintService from '@/utils/PrintService'

export default {
  name: 'PagosReporteEmpleado',
  props: {
    idEmpleado: { type: [Number, String], required: true },
    nombreEmpleado: { type: String, default: 'Empleado' },
    pendiente: { type: Boolean, default: false },
    fechaInicio: { type: String, default: '' },
    fechaFin:   { type: String, default: '' },
  },
  data() {
    return {
      cargando: false,
      data: null,
    }
  },
  computed: {
    fechaEmision() {
      return new Date().toLocaleDateString('es-VE', { day:'2-digit', month:'2-digit', year:'numeric' })
    },
    periodoLabel() {
      if (this.fechaInicio && this.fechaFin) {
        return `${this.fechaInicio} — ${this.fechaFin}`
      }
      if (this.data && this.data.pagos && this.data.pagos.length > 0) {
        const fp = this.data.pagos[0].fecha_pago
        if (fp) return new Date(fp).toLocaleDateString('es-VE', { day:'2-digit', month:'2-digit', year:'numeric' })
      }
      return '—'
    },
    salarioInfo() {
      if (!this.data) return { visible: false, pagado: false, monto: 0 }
      const tipo = this.data.empleado.salario_tipo || ''
      if (tipo === 'Comisión') return { visible: false, pagado: false, monto: 0 }

      // Si ya fue pagado en el período (registrado en pagos_salarios)
      if (this.data.totales.salario > 0) {
        return { visible: true, pagado: true, monto: this.data.totales.salario }
      }

      // Calcular el monto según período configurado
      const montoMensual = parseFloat(this.data.empleado.salario_monto || 0)
      const periodo = (this.data.empleado.salario_periodo || '').toLowerCase()
      let factor = 1 // mensual
      if (periodo.includes('quincenal')) factor = 0.5
      else if (periodo.includes('semanal')) factor = 0.25
      const montoPeriodo = parseFloat((montoMensual * factor).toFixed(2))

      if (montoPeriodo > 0) {
        return { visible: true, pagado: false, monto: montoPeriodo, periodoLabel: periodo }
      }
      return { visible: false, pagado: false, monto: 0 }
    },
    totalEsperado() {
      if (!this.data) return 0
      // Si los pagos ya están procesados, usamos el total real guardado en BD
      if (!this.pendiente) return parseFloat(this.data.totales.total || 0)
      
      // Para pendientes (simulado): comisiones + salario + bonos - descuentos
      const comisiones = parseFloat(this.data.totales.comision || 0)
      const salario = (this.salarioInfo.visible && !this.salarioInfo.pagado) ? this.salarioInfo.monto : 0
      const bonos = (this.data.bonos || []).reduce((acc, b) => acc + parseFloat(b.monto || 0), 0)
      const descuentos = (this.data.descuentos || []).reduce((acc, d) => acc + parseFloat(d.monto || 0), 0)
      
      return parseFloat((comisiones + salario + bonos - descuentos).toFixed(2))
    },
  },
  methods: {
    async abrirReporte() {
      this.$bvModal.show(`reporte-modal-${this.idEmpleado}`)
      if (this.data) return // ya cargado
      this.cargando = true
      try {
        let url = `${this.$config.API}/pagos/reporte-empleado/${this.idEmpleado}`
        const params = []
        if (this.pendiente) params.push('pendiente=1')
        else if (this.fechaInicio && this.fechaFin) {
          params.push(`fecha_inicio=${this.fechaInicio}`, `fecha_fin=${this.fechaFin}`)
        }
        if (params.length) url += '?' + params.join('&')
        const res = await this.$axios.get(url)
        this.data = res.data.data
      } catch (e) {
        console.error('Error cargando reporte empleado:', e)
      } finally {
        this.cargando = false
      }
    },

    numberFmt(val) {
      return parseFloat(val || 0).toFixed(2)
    },

    imprimir() {
      if (!this.data) return
      const d = this.data

      const filasPagos = d.pagos && d.pagos.length > 0
        ? d.pagos.map(p => `
            <tr>
              <td>${p.id_orden || '—'}</td>
              <td>${p.nombre_departamento || p.departamento_pago || '—'}</td>
              <td>${p.producto || '—'}</td>
              <td style="text-align:right">${p.cantidad}</td>
              <td style="text-align:right">${this.labelComision(p)}</td>
              <td style="text-align:right"><strong>$${this.numberFmt(p.monto_pago)}</strong></td>
            </tr>`).join('')
        : `<tr><td colspan="6" style="text-align:center;color:#999">Sin registros de comisión</td></tr>`

      const filasBonos = d.bonos.map(b =>
        `<tr><td style="text-align:right;color:green">Bono (${b.descripcion}):</td><td style="text-align:right;color:green"><strong>+$${this.numberFmt(b.monto)}</strong></td></tr>`
      ).join('')

      const filasDescuentos = d.descuentos.map(desc =>
        `<tr><td style="text-align:right;color:red">Descuento (${desc.descripcion}):</td><td style="text-align:right;color:red"><strong>-$${this.numberFmt(desc.monto)}</strong></td></tr>`
      ).join('')

      const html = `
        <div class="report-container">
          <div class="report-header">
            <h1>${d.empresa.nombre_empresa || 'Empresa'}</h1>
            ${d.empresa.direccion ? `<p style="margin:0;font-size:8pt">${d.empresa.direccion}</p>` : ''}
            ${d.empresa.telefonos ? `<p style="margin:0;font-size:8pt">Tel: ${d.empresa.telefonos}</p>` : ''}
            ${d.empresa.email ? `<p style="margin:0;font-size:8pt">${d.empresa.email}</p>` : ''}
          </div>
          <div class="report-info">
            <p><strong>Reporte de Pago</strong></p>
            <p><strong>Empleado:</strong> ${d.empleado.nombre} &nbsp;&nbsp; <strong>Departamento:</strong> ${d.empleado.departamento || '—'}</p>
            <p><strong>Período:</strong> ${this.periodoLabel} &nbsp;&nbsp; <strong>Emisión:</strong> ${this.fechaEmision}</p>
          </div>
          <table class="report-table" style="margin-top:0.5rem">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Departamento</th>
                <th>Producto</th>
                <th style="text-align:right">Uds.</th>
                <th style="text-align:right">Comisión</th>
                <th style="text-align:right">Monto</th>
              </tr>
            </thead>
            <tbody>${filasPagos}</tbody>
          </table>
          <table style="margin-left:auto;margin-top:0.5rem;border-collapse:collapse;font-size:8pt">
            <tbody>
              <tr><td style="padding:2px 8px;text-align:right">Total Piezas Trabajadas:</td><td style="padding:2px 8px;text-align:right"><strong>${d.totales.piezas || 0}</strong></td></tr>
              <tr><td style="padding:2px 8px;text-align:right">Total Comisiones:</td><td style="padding:2px 8px;text-align:right"><strong>$${this.numberFmt(d.totales.comision)}</strong></td></tr>
              ${this.salarioInfo.visible ? `<tr><td style="padding:2px 8px;text-align:right">${this.salarioInfo.pagado ? 'Salario Pagado:' : 'Salario (Pendiente):'}</td><td style="padding:2px 8px;text-align:right"><strong>$${this.numberFmt(this.salarioInfo.monto)}</strong></td></tr>` : ''}
              ${filasBonos}
              ${filasDescuentos}
              <tr style="border-top:2px solid #333">
                <td style="padding:2px 8px;text-align:right"><strong>${this.pendiente ? 'TOTAL A PAGAR:' : 'TOTAL PAGADO:'}</strong></td>
                <td style="padding:2px 8px;text-align:right"><strong style="color:green">$${this.numberFmt(this.totalEsperado)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      `
      PrintService.imprimir(`Reporte de Pago — ${d.empleado.nombre}`, html)
    },

    labelComision(pago) {
      if (pago.comision_tipo === 'fija') return 'Fija'
      if (pago.comision_tipo === 'variable') return `$${this.numberFmt(pago.comision)}/u`
      if (pago.comision_tipo === 'porcentaje') return `${pago.comision}%`
      return '—'
    },
  },
}
</script>

<style scoped>
.btn-reporte-empleado {
  padding: 1px 5px;
  font-size: 0.75rem;
  line-height: 1.2;
}
.reporte-tabla th,
.reporte-tabla td {
  font-size: 0.8rem;
  padding: 3px 6px;
}
.reporte-tabla-totales td {
  font-size: 0.85rem;
  padding: 2px 8px;
}
.reporte-totales {
  display: flex;
  justify-content: flex-end;
}
.reporte-header {
  font-size: 0.85rem;
}
</style>
