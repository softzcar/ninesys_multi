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
      </b-col>
    </b-row>

    <div v-if="value.trim() != ''">
      <b-row>
        <b-col class="mt-4">
          <b-row>
            <b-col class="mt-4">
              <h3>TOTAL GENERAL {{ totalCancelado.totalGeneral }}</h3>
            </b-col>
          </b-row>
          <h3 class="mb-4">Vendedores</h3>
          <b-table
            responsive
            small
            striped
            :items="pagosResumenVendedores"
            :fields="fields"
          >
            <template #cell(nombre)="data">
              <PagosHistoricoModal
                :empleado="data.item"
                :detalles="filterVendedor(data.item.id_empleado)"
                :salario="filterSalario(data.item.id_empleado)"
                :bonos="filterBonos(data.item.id_empleado)"
                :descuentos="filterDescuentos(data.item.id_empleado)"
                :comision="calculateComisionReal(data.item.pago, data.item.id_empleado)"
              />
            </template>

            <template #cell(fecha_pago)="data">
              {{ formatTimestampDate(data.item.fecha_pago) }}
            </template>

            <template #cell(pago)="data">
              <div
                class="floatme"
                style="width: 100%"
              >
                <span> ${{ data.item.pago }}</span>
              </div>
            </template>
          </b-table>
          <p class="text-right total-table">TOTAL ${{ totalCancelado.totalVendedores }}</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="mt-4">
          <h3 class="mb-4">Empleados</h3>
          <!-- >{{ pagosResumen }}</pre> -->
          <b-table
            responsive
            small
            striped
            :items="pagosResumen"
            :fields="fields"
          >
            <template #cell(nombre)="data">
              <PagosHistoricoModal
                :empleado="data.item"
                :detalles="filterEmpleado(data.item.id_empleado)"
                :salario="filterSalario(data.item.id_empleado)"
                :bonos="filterBonos(data.item.id_empleado)"
                :descuentos="filterDescuentos(data.item.id_empleado)"
                :comision="calculateComisionReal(data.item.pago, data.item.id_empleado)"
              />
            </template>

            <template #cell(fecha_pago)="data">
              {{ formatTimestampDate(data.item.fecha_pago) }}
            </template>

            <template #cell(pago)="data">
              <div
                class="floatme"
                style="width: 100%"
              >
                <span> ${{ data.item.pago }}</span>
              </div>
            </template>
          </b-table>
          <p class="text-right total-table">TOTAL ${{ totalCancelado.totalEmpleados }}</p>
        </b-col>
      </b-row>

      <b-row>
        <b-col class="mt-4">
          <h3 class="mb-4">Diseñadores</h3>
          <b-table
            responsive
            small
            striped
            :items="pagosResumenDiseno"
            :fields="fields"
          >
            <template #cell(nombre)="data">
              <PagosHistoricoModal
                :empleado="data.item"
                :detalles="filterDesigner(data.item.id_empleado)"
                :salario="filterSalario(data.item.id_empleado)"
                :bonos="filterBonos(data.item.id_empleado)"
                :descuentos="filterDescuentos(data.item.id_empleado)"
                :comision="calculateComisionReal(data.item.pago, data.item.id_empleado)"
              />
            </template>

            <template #cell(fecha_pago)="data">
              {{ formatTimestampDate(data.item.fecha_pago) }}
            </template>
            <template #cell(pago)="data">
              <div
                class="floatme"
                style="width: 100%"
              >
                <span> ${{ data.item.pago }}</span>
              </div>
            </template>
          </b-table>
          <!-- > {{ pagosResumenDiseno }} <hr> {{ pagos.data }} </pre> -->
        </b-col>
      </b-row>
    </div>
  </div>
</template>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import PagosHistoricoModal from "~/components/admin/PagosHistoricoModal.vue";

export default {
  mixins: [mixin],
  components: {
    PagosHistoricoModal
  },

  data() {
    return {
      totalCancelado: 0,
      pagos: [],
      pagosVendedores: [],
      pagosEmpleados: [],
      pagosDiseno: [],
      salariosDetalles: [],
      bonosDetalles: [],
      descuentosDetalles: [],
      pagosTrabajosAdicionales: [],
      value: "",
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
    pagosResumen() {
      if (this.pagosEmpleados.length > 0) {
        const result = this.pagosEmpleados.reduce((acc, curr) => {
          const index = acc.findIndex((el) => el.nombre === curr.nombre);
          if (index === -1) {
            acc.push({
              nombre: curr.nombre,
              id_empleado: curr.id_empleado,
              departamento: curr.departamento,
              fecha_pago: curr.fecha_pago,
              cantidad: parseInt(curr.cantidad),
              pago: parseFloat(curr.pago),
            });
          } else {
            acc[index].cantidad += parseInt(curr.cantidad);
            acc[index].pago += parseFloat(curr.pago);
          }
          return acc;
        }, []);
        return result.map((item) => {
          // No sobreescribir pago con string aquí si queremos sumar después, pero bueno, el componente espera props.
          // El cálculo final del total se hace en el modal.
          // Aquí 'pago' es la suma de solo lo que viene de la tabla pagos (comisiones/salarios por registro que no sea desglose)
          // Pero espera, en historico el 'monto_pago' ya incluye todo si fue guardado asi?
          // No necesariamente.
          // En pagos_empleados (planilla), sumamos dinamicamente.
          // En el backend 'pagos' tabla tiene 'monto_pago' que es el valor final de ese registro.
          // Si guardamos el pago ya dividido, la suma de los registros de pago debería dar el total.
          item.pago = item.pago.toFixed(2);
          return item;
        });
      } else {
        return [];
      }
    },

    pagosResumenVendedores() {
      if (this.pagosVendedores.length > 0) {
        const result = this.pagosVendedores.reduce((acc, curr) => {
          const index = acc.findIndex((el) => el.nombre === curr.nombre);
          if (index === -1) {
            acc.push({
              nombre: curr.nombre,
              id_empleado: curr.id_empleado,
              departamento: curr.departamento,
              fecha_pago: curr.fecha_pago,
              pago: parseFloat(curr.pago),
            });
          } else {
            acc[index].cantidad += parseInt(curr.cantidad);
            acc[index].pago += parseFloat(curr.pago);
          }
          return acc;
        }, []);
        return result.map((item) => {
          item.pago = item.pago.toFixed(2);
          return item;
        });
      } else {
        return [];
      }
    },

    pagosResumenDiseno() {
      if (this.pagosDiseno.length > 0) {
        const result = this.pagosDiseno.reduce((acc, curr) => {
          const index = acc.findIndex((el) => el.nombre === curr.nombre);
          if (index === -1) {
            acc.push({
              id_empleado: curr.id_empleado,
              nombre: curr.nombre,
              id_orden: curr.id_orden,
              departamento: curr.departamento,
              fecha_pago: curr.fecha_pago,
              cantidad: 1,
              producto: curr.producto,
              pago: parseFloat(curr.monto_pago),
            });
          } else {
            acc[index].cantidad += 1;
            acc[index].pago += parseFloat(curr.monto_pago);
          }
          return acc;
        }, []);
        return result.map((item) => {
          item.monto_pago = item.pago.toFixed(2);
          return item;
        });
      } else {
        return [];
      }
    },
  },

  methods: {
    totalPagos(data) {
      // Función para sumar los pagos de un array de objetos
      const sumarPagos = (arr) =>
        arr.reduce((total, item) => total + (parseFloat(item.pago) || 0), 0);

      // Calcular totales
      const totalVendedores = data.vendedores ? sumarPagos(data.vendedores) : 0;
      const totalEmpleados = data.empleados ? sumarPagos(data.empleados) : 0;
      const totalDiseno = data.diseno ? sumarPagos(data.diseno) : 0;
      const totalGeneral = totalVendedores + totalEmpleados + totalDiseno;

      return {
        totalGeneral: totalGeneral.toFixed(2), 
        totalVendedores: totalVendedores.toFixed(2), 
        totalEmpleados: totalEmpleados.toFixed(2), 
        totalDiseno: totalDiseno.toFixed(2), 
      };
    },

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

          this.totalCancelado = this.totalPagos(res.data.data);
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