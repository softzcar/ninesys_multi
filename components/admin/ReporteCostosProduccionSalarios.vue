<template>
  <div>
    <b-link @click="showModal">$ {{ valor.toFixed(2) }}</b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Salarios Invertidos - Orden #${id_orden}`"
      hide-footer
      size="xl"
    >
      <b-overlay :show="isLoading" rounded="sm">
        <div v-if="!isLoading && detallesSalarios.length">
          <b-table
            striped
            hover
            :items="detallesSalarios"
            :fields="fields"
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
              $ {{ data.item.subtotal.toFixed(2) }}
            </template>

            <!-- Footer para totales -->
            <template #foot(nombre_empleado)>
              <strong>Total:</strong>
            </template>
            <template #foot(horas_laboradas)>
              <strong>{{ totalHoras.toFixed(2) }} hrs</strong>
            </template>
            <template #foot(costo_por_hora)>
              <span>&nbsp;</span>
            </template>
            <template #foot(subtotal)>
              <strong>$ {{ totalSalarios.toFixed(2) }}</strong>
            </template>
          </b-table>
        </div>
        <p v-else>No se encontraron detalles de salarios para esta orden.</p>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import mixintime from "~/mixins/mixin-time.js";

export default {
  name: "ReporteCostosProduccionSalarios",
  mixins: [mixintime],
  props: {
    id_orden: {
      type: [Number, String],
      required: true,
    },
    valor: {
      type: Number,
      required: true,
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
      detallesSalarios: [],
      isLoading: false,
      fields: [
        { key: "nombre_empleado", label: "Empleado" },
        { key: "horas_laboradas", label: "Horas Laboradas" },
        { key: "costo_por_hora", label: "Costo/Hora" },
        { key: "subtotal", label: "Subtotal" },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-salarios-${this.id_orden}`;
    },
    totalHoras() {
      return this.detallesSalarios.reduce((sum, item) => sum + item.horas_laboradas, 0);
    },
    totalSalarios() {
      return this.detallesSalarios.reduce((sum, item) => sum + item.subtotal, 0);
    },
  },
  methods: {
    calcularDetallesSalarios() {
      this.isLoading = true;

      try {
        // Convertir empleados asignados a array (puede venir como string "500,501" o como número 500)
        let empleadosIds = [];
        if (this.empleadosAsignados) {
          if (typeof this.empleadosAsignados === 'number') {
            empleadosIds = [this.empleadosAsignados];
          } else if (typeof this.empleadosAsignados === 'string') {
            empleadosIds = this.empleadosAsignados.split(',').map(id => parseInt(id.trim()));
          }
        }

        // Filtrar empleados que cobran salario
        const empleadosSalario = this.horaEmpleadosPrecios.filter(empleado =>
          empleadosIds.includes(empleado.id_usuario) &&
          empleado.salario_tipo.includes('Salario')
        );

        // Crear mapa de costo por hora
        const costoPorHoraMap = {};
        empleadosSalario.forEach(empleado => {
          costoPorHoraMap[empleado.id_usuario] = {
            nombre: empleado.nombre,
            costo_por_hora: empleado.costo_por_hora
          };
        });

        // Filtrar tareas por orden y empleados relevantes
        const tareasFiltradas = this.horaEmpleadosTiempos.filter(tarea =>
          tarea.id_orden === this.id_orden &&
          empleadosIds.includes(tarea.id_empleado)
        );

        // Agrupar por empleado
        const empleadosAgrupados = {};

        tareasFiltradas.forEach(tarea => {
          const idEmpleado = tarea.id_empleado;
          if (!empleadosAgrupados[idEmpleado]) {
            empleadosAgrupados[idEmpleado] = {
              id_empleado: idEmpleado,
              nombre_empleado: costoPorHoraMap[idEmpleado]?.nombre || `Empleado ${idEmpleado}`,
              costo_por_hora: costoPorHoraMap[idEmpleado]?.costo_por_hora || 0,
              horas_totales: 0,
              subtotal: 0
            };
          }

          // Calcular horas laboradas para esta tarea
          const horasTarea = this.calcularHorasLaboradasReales(
            tarea.fecha_inicio,
            tarea.fecha_terminado,
            this.horarioLaboral
          );

          empleadosAgrupados[idEmpleado].horas_totales += horasTarea;
        });

        // Calcular subtotales
        this.detallesSalarios = Object.values(empleadosAgrupados).map(empleado => ({
          nombre_empleado: empleado.nombre_empleado,
          horas_laboradas: empleado.horas_totales,
          costo_por_hora: empleado.costo_por_hora,
          subtotal: empleado.horas_totales * empleado.costo_por_hora
        }));

      } catch (error) {
        console.error('Error al calcular detalles de salarios:', error);
        this.detallesSalarios = [];
      } finally {
        this.isLoading = false;
      }
    },
    showModal() {
      this.calcularDetallesSalarios();
      this.$bvModal.show(this.modalId);
    },
  },
};
</script>