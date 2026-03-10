<template>
  <div>
    <b-row>
      <b-col>
        <b-calendar
          block
          v-model="value"
          @selected="getPagosHistorico"
          @context="onContext"
          locale="es-VE"
        ></b-calendar>
      </b-col>
      <b-col>
        <h3>Seleccione una fecha</h3>
        <p v-if="value.trim() != ''">
          Reporte de la semana número {{ obtenerNumeroSemana(value) }} correspondente al día {{
            context.selectedFormatted }}
        </p>
        <b-form-group label="Filtrar por Departamento:" v-if="pagosResumenUnificado && pagosResumenUnificado.length > 0">
          <b-form-select v-model="departamentoFiltro" :options="departamentosUnicos"></b-form-select>
        </b-form-group>
      </b-col>
    </b-row>

    <div v-if="value.trim() != ''">
      <b-row>
        <b-col class="mt-4">
          <b-row>
            <b-col class="mt-4 d-flex justify-content-between align-items-center">
              <h3>Historial de Pagos Unificado</h3>
              <h3 class="text-success">TOTAL GENERAL ${{ totalCancelado.totalGeneral }}</h3>
            </b-col>
          </b-row>

          <b-table responsive small striped hover :items="pagosResumenUnificadoFiltrado" :fields="fields">
            <template #cell(nombre)="data">
              <PagosHistoricoModal :empleado="data.item"
                :detalles="[...filterVendedor(data.item.id_empleado), ...filterEmpleado(data.item.id_empleado), ...filterDesigner(data.item.id_empleado)]"
                :salario="filterSalario(data.item.id_empleado)" :bonos="filterBonos(data.item.id_empleado)"
                :descuentos="filterDescuentos(data.item.id_empleado)"
                :comision="calculateComisionReal(parseFloat(data.item.pago), data.item.id_empleado)" />
            </template>

            <template #cell(reporte)="data">
              <pagos-reporte-empleado :id-empleado="data.item.id_empleado" :nombre-empleado="data.item.nombre"
                :fecha-inicio="semanaInicio" :fecha-fin="semanaFin" />
            </template>

            <template #cell(fecha_pago)="data">
              {{ formatTimestampDate(data.item.fecha_pago) }}
            </template>

            <template #cell(pago)="data">
              <div class="floatme" style="width: 100%">
                <span> ${{ data.item.pago }}</span>
              </div>
            </template>
          </b-table>
        </b-col>
      </b-row>
    </div>
  </div>
</template>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import PagosHistoricoModal from "~/components/admin/PagosHistoricoModal.vue";
import PagosReporteEmpleado from "~/components/admin/PagosReporteEmpleado.vue";

export default {
  mixins: [mixin],
  components: {
    PagosHistoricoModal,
    PagosReporteEmpleado,
  },

  data() {
    return {
      pagos: [],
      pagosVendedores: [],
      pagosEmpleados: [],
      pagosDiseno: [],
      salariosDetalles: [],
      bonosDetalles: [],
      descuentosDetalles: [],
      pagosTrabajosAdicionales: [],
      value: "",
      departamentoFiltro: "",
      context: null,
      dataReporte: [],
      infoModal: {
        id: 'info-modal',
        title: '',
        content: ''
      },
      fields: [
        {
          key: "nombre",
          label: "Empleado",
          tdClass: "pl-4",
        },
        {
          key: "reporte",
          label: "Reporte",
          tdClass: "text-center",
          thClass: "text-center",
        },
        {
          key: "departamento",
          label: "Departamento",
        },
        {
          key: "fecha_pago",
          label: "Fecha Pago",
        },
        {
          key: "pago",
          label: "Total Pago",
          tdClass: "text-right pr-5",
          thClass: "text-right pr-5",
        },
      ],
    };
  },

  computed: {
    semanaInicio() {
      if (!this.value) return ''
      const d = new Date(this.value)
      const day = d.getDay() // 0=domingo
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // lunes
      const lunes = new Date(d.setDate(diff))
      return lunes.toISOString().substring(0, 10)
    },
    semanaFin() {
      if (!this.value) return ''
      const d = new Date(this.value)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? 0 : 7) // domingo
      const domingo = new Date(d.setDate(diff))
      return domingo.toISOString().substring(0, 10)
    },
    pagosResumenUnificado() {
      const todosLosPagos = [
        ...this.pagosEmpleados.map(p => ({ ...p, origen: 'Empleado' })),
        ...this.pagosVendedores.map(p => ({ ...p, origen: 'Vendedor' })),
        ...this.pagosDiseno.map(p => ({
          ...p,
          origen: 'Diseñador',
          pago: p.monto_pago // En diseno el campo es monto_pago
        }))
      ];

      if (todosLosPagos.length === 0) return [];

      const result = todosLosPagos.reduce((acc, curr) => {
        const index = acc.findIndex(el => el.id_empleado == curr.id_empleado);
        const montoPago = parseFloat(curr.pago) || 0;

        if (index === -1) {
          let dep = curr.departamento || (curr.origen === 'Diseñador' ? 'Diseño' : (curr.origen === 'Vendedor' ? 'Ventas' : 'Producción'));

          acc.push({
            nombre: curr.nombre,
            id_empleado: curr.id_empleado,
            departamento: dep,
            fecha_pago: curr.fecha_pago,
            pago: montoPago,
          });
        } else {
          acc[index].pago += montoPago;

          let dep = curr.departamento || (curr.origen === 'Diseñador' ? 'Diseño' : (curr.origen === 'Vendedor' ? 'Ventas' : 'Producción'));
          if (dep && !acc[index].departamento.includes(dep)) {
            acc[index].departamento += ' + ' + dep;
          }
        }
        return acc;
      }, []);

      return result.sort((a, b) => {
        const nameA = a.nombre || "";
        const nameB = b.nombre || "";
        return nameA.localeCompare(nameB);
      }).map(item => {
        item.pago = item.pago.toFixed(2);
        return item;
      });
    },

    departamentosUnicos() {
      const deps = new Set();
      if (this.pagosResumenUnificado) {
        this.pagosResumenUnificado.forEach(p => {
          if (p.departamento) {
            p.departamento.split(' + ').forEach(d => deps.add(d.trim()));
          }
        });
      }
      return [{ value: '', text: 'Todos los departamentos' }, ...Array.from(deps).sort().map(d => ({ value: d, text: d }))];
    },

    pagosResumenUnificadoFiltrado() {
      if (!this.departamentoFiltro) return this.pagosResumenUnificado;
      return this.pagosResumenUnificado.filter(p => p.departamento && p.departamento.includes(this.departamentoFiltro));
    },

    totalCancelado() {
      if (!this.pagosResumenUnificado) return { totalGeneral: "0.00" };
      const total = this.pagosResumenUnificado.reduce((acc, curr) => acc + parseFloat(curr.pago), 0);
      return { totalGeneral: total.toFixed(2) };
    },

  },

  methods: {
    onContext(ctx) {
      this.context = ctx;
    },

    filterEmpleado(id_empleado) {
      return this.pagosEmpleados.filter(
        (el) => el.id_empleado === id_empleado
      );
    },

    filterVendedor(id_empleado) {
      return this.pagosVendedores.filter(
        (el) => el.id_empleado === id_empleado
      );
    },

    filterDesigner(id_empleado) {
      return this.pagosDiseno.filter((el) => el.id_empleado === id_empleado);
    },

    // Métodos para filtrar detalles extra
    filterSalario(id_empleado) {
      const sal = this.salariosDetalles.find(el => el.id_empleado === id_empleado);
      // El salario ya viene sumado o es un registro único por periodo?
      // La query agrupa por empleado.
      return sal ? parseFloat(sal.monto) : 0;
    },

    filterBonos(id_empleado) {
       return this.bonosDetalles.filter(el => el.id_empleado === id_empleado);
    },

    filterDescuentos(id_empleado) {
       return this.descuentosDetalles.filter(el => el.id_empleado === id_empleado);
    },
    
    // Obtener la comisión total sumando los pagos individuales (que corresponden a comisiones en el historial)
    // CUIDADO: En el historial, 'pago' es el monto total que se le pagó por ese registro.
    // Si el 'monto_pago' en BD incluye salario prorrateado, entonces 'pago' NO es solo comisión.
    // Analizando el backend:
    // $montoTotalPago = ($salario + $comision + $totalBonos) - $totalDescuentos;
    // $montoPorRegistroDePago = $montoTotalPago / $cantidadDePagos;
    // UPDATE pagos SET monto_pago = $montoPorRegistroDePago...
    //
    // ENTONCES: 'pago' en la tabla histórica es (Total / N).
    // Si sumamos 'pago' de todos los registros, obtenemos el TOTAL PAGADO (Neto).
    //
    // PERO el componente PagosHistoricoModal recompone el total sumando: Salario + Comision + Bonos - Descuentos.
    // Si le pasamos Salario, Bonos y Descuentos explicitamente...
    // ¿Qué le pasamos como 'Comisión'?
    //
    // Si Total = Salario + Comision + Bonos - Descuentos
    // Entonces Comision = Total - Salario - Bonos + Descuentos
    //
    // El 'Total' lo tenemos sumando los pagos individuales (this.pagosResumen... item.pago).
    //
    calculateComisionReal(totalPagado, id_empleado) {
       const salario = this.filterSalario(id_empleado);
       const bonos = this.filterBonos(id_empleado).reduce((s, b) => s + parseFloat(b.monto), 0);
       const descuentos = this.filterDescuentos(id_empleado).reduce((s, d) => s + parseFloat(d.monto), 0);
       
       // Comision = TotalPagado - Salario - Bonos + Descuentos
       const comision = totalPagado - salario - bonos + descuentos;
       return comision > 0 ? comision : 0; // Evitar negativos por redondeo
    },

    async getPagosHistorico() {
      await this.$axios
        .get(
          `${this.$config.API}/pagos/historico/${this.obtenerNumeroSemana(
            this.value
          )}`
        )
        .then((res) => {
          this.dataReporte = res.data;
          this.pagosVendedores = res.data.data.vendedores || [];
          this.pagosEmpleados = res.data.data.empleados || [];
          this.pagosDiseno = res.data.data.diseno || [];
          
          // Nuevos datos
          this.salariosDetalles = res.data.data.salarios_detalles || [];
          this.bonosDetalles = res.data.data.bonos_detalles || [];
          this.descuentosDetalles = res.data.data.descuentos_detalles || [];
        });
    },

    obtenerNumeroSemana(fechaStr) {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) {
        throw new Error("Fecha no válida. Formato esperado: YYYY-MM-DD");
      }
      const inicioAño = new Date(fecha.getFullYear(), 0, 1);
      const diferenciaTiempo = fecha - inicioAño;
      const diferenciaDias = Math.floor(
        diferenciaTiempo / (1000 * 60 * 60 * 24)
      );
      const numeroSemana = Math.ceil(
        (diferenciaDias + inicioAño.getDay() + 1) / 7
      );
      return numeroSemana;
    },
    
    resetInfoModal() {
      this.infoModal.title = ''
      this.infoModal.content = ''
    },
  },
};
</script>