<template>
  <div>
    <b-link @click="showModal">
      $ {{ Number(costoManoObra || 0).toFixed(2) }}
    </b-link>

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
              <strong>$ {{ sumaBonos.toFixed(2) }}</strong>
            </template>
            <template #foot(total_descuentos)>
              <strong>$ {{ sumaDescuentos.toFixed(2) }}</strong>
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
              <h3 class="mb-0">TOTAL MANO DE OBRA (API)</h3>
              <h3 class="mb-0 text-primary">$ {{ Number(costoManoObra || 0).toFixed(2) }}</h3>
            </div>
            <hr />
            <div v-if="Math.abs(totalGeneral - costoManoObra) > 0.01" class="text-muted small">
              <p>Suma del desglose: $ {{ totalGeneral.toFixed(2) }}</p>
              <p>Diferencia de ajuste: $ {{ (costoManoObra - totalGeneral).toFixed(2) }}</p>
            </div>
            <small class="text-muted">
              * Este monto es el valor oficial retornado por la API para esta orden.
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

          const comisionPura = montoPago - bonos + descuentos - salarioPagado;

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

        this.manoDeObraData.forEach(pago => {
          const idEmp = Number(pago.id_empleado);
          const salarioPagado = Number(pago.total_salario_pagado || 0);
          
          if (salarioPagado > 0 && !empleadosAgrupados[idEmp]) {
            empleadosAgrupados[idEmp] = {
              id_empleado: idEmp,
              nombre_empleado: pago.nombre_empleado,
              costo_por_hora: 0,
              horas_totales: 0,
              salario_pagado_fijo: salarioPagado
            };
          }
        });

        this.detallesSalarios = Object.values(empleadosAgrupados).map(
          (empleado) => ({
            nombre_empleado: empleado.nombre_empleado,
            horas_laboradas: empleado.horas_totales,
            costo_por_hora: empleado.costo_por_hora,
            subtotal: empleado.horas_totales > 0 
              ? (empleado.horas_totales * empleado.costo_por_hora) 
              : (empleado.salario_pagado_fijo || 0),
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
  mounted() {
    // No es necesario cargar al montar si solo queremos los datos al abrir el modal,
    // pero lo mantenemos por coherencia con la carga de detalles
    this.getManoDeObra().then(() => {
      this.calcularDetallesSalarios();
    });
  },
};
</script>
