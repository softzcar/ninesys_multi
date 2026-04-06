<template>
  <div>
    <b-link @click="showModal">$ {{ totalManoObra.toFixed(2) }}</b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Costos de Mano de Obra - Orden #${id_orden}`"
      hide-footer
      size="xl"
    >
      <b-overlay :show="isLoading" rounded="sm">
        <div v-if="!isLoading">
          <h4 class="mt-2">Comisiones</h4>
          <b-table
            v-if="manoDeObraData.length"
            striped
            hover
            :items="manoDeObraData"
            :fields="fieldsManoObra"
            responsive
            foot-clone
          >
            <template #cell(comision_pura)="data">
              $ {{ (data.item.comision_pura || 0).toFixed(2) }}
            </template>
            <template #cell(total_bonos)="data">
              <span class="text-success">+ $ {{ (data.item.total_bonos || 0).toFixed(2) }}</span>
            </template>
            <template #cell(total_descuentos)="data">
              <span class="text-danger">- $ {{ (data.item.total_descuentos || 0).toFixed(2) }}</span>
            </template>
            <template #cell(subtotal_variable)="data">
              <strong>$ {{ (data.item.subtotal_variable || 0).toFixed(2) }}</strong>
            </template>

            <!-- Footer para Comisiones -->
            <template #foot(nombre_empleado)>
              <strong>Subtotal:</strong>
            </template>
            <template #foot(departamento)>
              <span>&nbsp;</span>
            </template>
            <template #foot(cantidad)>
              <span>&nbsp;</span>
            </template>
            <template #foot(comision_pura)>
              <strong>$ {{ sumaComisiones.toFixed(2) }}</strong>
            </template>
            <template #foot(total_bonos)>
              <strong class="text-success">$ {{ sumaBonos.toFixed(2) }}</strong>
            </template>
            <template #foot(total_descuentos)>
              <strong class="text-danger">$ {{ sumaDescuentos.toFixed(2) }}</strong>
            </template>
            <template #foot(subtotal_variable)>
              <strong class="text-primary">$ {{ totalVariable.toFixed(2) }}</strong>
            </template>
          </b-table>
          <p v-else>No se encontraron comisiones para esta orden.</p>

          <h4 class="mt-4">Salarios</h4>
          <b-table
            v-if="detallesSalarios.length"
            striped
            hover
            :items="detallesSalarios"
            :fields="fieldsSalarios"
            responsive
            foot-clone
          >
            <template #cell(horas_laboradas)="data">
              {{ data.item.horas_laboradas.toFixed(2) }} hrs
            </template>
            <template #cell(costo_por_hora)="data">
              $ {{ data.item.costo_por_hora.toFixed(2) }}
            </template>
            <template #cell(subtotal)="data">
              <strong>$ {{ data.item.subtotal.toFixed(2) }}</strong>
            </template>

            <template #foot(nombre_empleado)>
              <strong>Subtotal:</strong>
            </template>
            <template #foot(horas_laboradas)>
              <strong>{{ totalHoras.toFixed(2) }} hrs</strong>
            </template>
            <template #foot(costo_por_hora)>
              <span>&nbsp;</span>
            </template>
            <template #foot(subtotal)>
              <strong class="text-primary">$ {{ totalSalarios.toFixed(2) }}</strong>
            </template>
          </b-table>
          <p v-else>No se encontraron detalles de salarios para esta orden.</p>

          <div class="mt-4 p-3 bg-light border rounded">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="mb-0">TOTAL MANO DE OBRA</h3>
              <h3 class="mb-0 text-primary">$ {{ totalGeneral.toFixed(2) }}</h3>
            </div>
            <hr />
            <small class="text-muted">
              * El total incluye la sumatoria neta de Comisiones, Bonos, Descuentos y Salarios calculados por tiempo.
            </small>
          </div>
        </div>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import mixintime from "~/mixins/mixin-time.js";

export default {
  name: "ReporteCostosProduccionLabor",
  mixins: [mixintime],
  props: {
    id_orden: {
      type: [Number, String],
      required: true,
    },
    costoManoObra: {
      type: Number,
      required: true,
      default: 0,
    },
    empleadosAsignados: {
      type: [String, Number],
      required: true,
    },
    horaEmpleadosPrecios: {
      type: Array,
      required: true,
    },
    horaEmpleadosTiempos: {
      type: Array,
      required: true,
    },
    horarioLaboral: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
      manoDeObraData: [],
      detallesSalarios: [],
      fieldsManoObra: [
        { key: "nombre_empleado", label: "Empleado", sortable: true },
        { key: "departamento", label: "Depto.", sortable: true },
        { key: "cantidad", label: "Cant.", sortable: true },
        { key: "comision_pura", label: "Comisión", sortable: true },
        { key: "total_bonos", label: "Bonos", sortable: true },
        { key: "total_descuentos", label: "Desc.", sortable: true },
        { key: "subtotal_variable", label: "Subtotal", sortable: true },
      ],
      fieldsSalarios: [
        { key: "nombre_empleado", label: "Empleado" },
        { key: "horas_laboradas", label: "Horas Laboradas" },
        { key: "costo_por_hora", label: "Costo/Hora" },
        { key: "subtotal", label: "Subtotal" },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-mano-obra-salarios-${this.id_orden}`;
    },
    totalManoObra() {
      const salarios = this.calcularCostoSalariosOrden(
        this.id_orden,
        this.empleadosAsignados,
        this.horaEmpleadosPrecios,
        this.horarioLaboral,
      );
      return (Number(this.costoManoObra) || 0) + (Number(salarios) || 0);
    },
    totalHoras() {
      return this.detallesSalarios.reduce((sum, item) => sum + (Number(item.horas_laboradas) || 0), 0);
    },
    totalSalarios() {
      return this.detallesSalarios.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    },
    sumaComisiones() {
      return this.manoDeObraData.reduce((sum, item) => sum + (item.comision_pura || 0), 0);
    },
    sumaBonos() {
      return this.manoDeObraData.reduce((sum, item) => sum + (item.total_bonos || 0), 0);
    },
    sumaDescuentos() {
      return this.manoDeObraData.reduce((sum, item) => sum + (item.total_descuentos || 0), 0);
    },
    totalVariable() {
      return this.manoDeObraData.reduce((sum, item) => sum + (item.subtotal_variable || 0), 0);
    },
    totalGeneral() {
      return this.totalVariable + this.totalSalarios;
    },
  },
  methods: {
    async getManoDeObra() {
      try {
        const url = `${this.$config.API}/reportes/mano-obra-por-orden/${this.id_orden}`;
        const { data } = await this.$axios.get(url);
        
        this.manoDeObraData = Array.isArray(data) ? data.map(item => {
          const bonos = Number(item.total_bonos || 0);
          const descuentos = Number(item.total_descuentos || 0);
          const salarioPagado = Number(item.total_salario_pagado || 0);
          const montoPago = Number(item.monto_pago || 0);

          // Si ya fue pagado, monto_pago incluye bonos, descuentos y salario.
          // Queremos aislar la "Comisión" pura para el reporte de costos por orden.
          const comisionPura = salarioPagado > 0 
            ? (montoPago - bonos + descuentos - salarioPagado)
            : montoPago;

          return {
            ...item,
            total_bonos: bonos,
            total_descuentos: descuentos,
            total_salario_pagado: salarioPagado,
            monto_pago: montoPago,
            comision_pura: comisionPura,
            subtotal_variable: comisionPura + bonos - descuentos
          };
        }) : [];
      } catch (error) {
        this.manoDeObraData = [];
        this.$bvToast.toast("No se pudieron cargar los detalles de la mano de obra.", {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      }
    },
    calcularDetallesSalarios() {
      try {
        const ordenId = Number(this.id_orden);
        let empleadosIds = [];
        if (this.empleadosAsignados) {
          if (typeof this.empleadosAsignados === "number") {
            empleadosIds = [this.empleadosAsignados];
          } else if (typeof this.empleadosAsignados === "string") {
            empleadosIds = this.empleadosAsignados
              .split(",")
              .map((id) => parseInt(id.trim()));
          }
        }

        // Crear un mapa de nombres para TODOS los empleados disponibles en las tasas de precios
        const nombreEmpleadoMap = {};
        this.horaEmpleadosPrecios.forEach((emp) => {
          const idEmp = Number(emp.id_usuario ?? emp.id_empleado);
          nombreEmpleadoMap[idEmp] = emp.nombre;
        });

        const empleadosSalario = this.horaEmpleadosPrecios.filter(
          (empleado) =>
            empleadosIds.includes(Number(empleado.id_usuario ?? empleado.id_empleado)) &&
            empleado.salario_tipo?.includes("Salario")
        );

        const costoPorHoraMap = {};
        empleadosSalario.forEach((empleado) => {
          const idEmp = Number(empleado.id_usuario ?? empleado.id_empleado);
          costoPorHoraMap[idEmp] = {
            costo_por_hora: empleado.costo_por_hora,
          };
        });

        const tareasFiltradas = this.horaEmpleadosTiempos.filter(
          (tarea) =>
            Number(tarea.id_orden) === ordenId &&
            empleadosIds.includes(Number(tarea.id_empleado))
        );

        const empleadosAgrupados = {};
        tareasFiltradas.forEach((tarea) => {
          const idEmpleado = tarea.id_empleado;
          if (!empleadosAgrupados[idEmpleado]) {
            empleadosAgrupados[idEmpleado] = {
              id_empleado: idEmpleado,
              nombre_empleado:
                nombreEmpleadoMap[Number(idEmpleado)] || `Empleado ${idEmpleado}`,
              costo_por_hora: costoPorHoraMap[Number(idEmpleado)]?.costo_por_hora || 0,
              horas_totales: 0,
            };
          }

          const horasTarea = this.calcularHorasLaboradasReales(
            tarea.fecha_inicio,
            tarea.fecha_terminado,
            this.horarioLaboral
          );

          empleadosAgrupados[idEmpleado].horas_totales += horasTarea;
        });

        this.detallesSalarios = Object.values(empleadosAgrupados).map(
          (empleado) => ({
            nombre_empleado: empleado.nombre_empleado,
            horas_laboradas: empleado.horas_totales,
            costo_por_hora: empleado.costo_por_hora,
            subtotal: empleado.horas_totales * empleado.costo_por_hora,
          })
        );
      } catch (error) {
        this.detallesSalarios = [];
      }
    },
    async showModal() {
      this.$bvModal.show(this.modalId);
      this.isLoading = true;
      try {
        await this.getManoDeObra();
        this.calcularDetallesSalarios();
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
