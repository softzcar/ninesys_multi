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
              <admin-PagosVendedorResumen
                showbutton="false"
                :item="data.item"
                @reload="reloadMe"
                :detalles="filterVendedor(data.item.id_empleado)"
              />
            </template>

            <template #cell(fecha_pago)="data">
              <!-- {{ formatTimestampDate(data.item.fecha_pago) }} -->
              {{ data.item.fecha_pago }}
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
              <admin-PagosEmpleadoResumen
                showbutton="false"
                :item="data.item"
                :products="products"
                @reload="reloadMe"
                :detalles="filterEmpleado(data.item.id_empleado)"
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
              <admin-PagosDisenioResumen
                showbutton="false"
                :item="data.item"
                @reload="reloadMe"
                :detalles="filterDesigner(data.item.id_empleado)"
                :adicionales="pagosTrabajosAdicionales"
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

<script>
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],

  data() {
    return {
      totalCancelado: 0,
      pagos: [],
      pagosVendedores: [],
      pagosEmpleados: [],
      pagosDiseno: [],
      pagosTrabajosAdicionales: [],
      value: "",
      context: null,
      dataReporte: [],
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

      // Retornar el resultado como un JSON
      return {
        totalGeneral: totalGeneral.toFixed(2), // Total general de pagos
        totalVendedores: totalVendedores.toFixed(2), // Total de pagos a vendedores
        totalEmpleados: totalEmpleados.toFixed(2), // Total de pagos a empleados
        totalDiseno: totalDiseno.toFixed(2), // Total de pagos a diseñadores
      };
    },

    onContext(ctx) {
      this.context = ctx;
    },

    filterEmpleado(id_empleado) {
      let emp = this.pagosEmpleados.filter(
        (el) => el.id_empleado === id_empleado
      );
      return emp;
    },

    filterVendedor(id_empleado) {
      let emp = this.pagosVendedores.filter(
        (el) => el.id_empleado === id_empleado
      );
      return emp;
    },

    filterDesigner(id_empleado) {
      let emp = this.pagosDiseno.filter((el) => el.id_empleado === id_empleado);
      return emp;
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

    async getPagosHistorico() {
      // this.overlay = true
      await this.$axios
        .get(
          `${this.$config.API}/pagos/historico/${this.obtenerNumeroSemana(
            this.value
          )}`
        )
        .then((res) => {
          this.dataReporte = res.data;
          this.pagosVendedores = res.data.data.vendedores;
          this.pagosEmpleados = res.data.data.empleados;
          this.pagosDiseno = res.data.data.diseno;
          this.totalCancelado = this.totalPagos(res.data.data);
        });
    },

    obtenerNumeroSemana(fechaStr) {
      // Convertir la cadena de fecha a un objeto Date
      const fecha = new Date(fechaStr);

      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        throw new Error("Fecha no válida. Formato esperado: YYYY-MM-DD");
      }

      // Obtener el primer día del año
      const inicioAño = new Date(fecha.getFullYear(), 0, 1);

      // Calcular la diferencia en milisegundos entre la fecha y el inicio del año
      const diferenciaTiempo = fecha - inicioAño;

      // Convertir la diferencia a días
      const diferenciaDias = Math.floor(
        diferenciaTiempo / (1000 * 60 * 60 * 24)
      );

      // Calcular el número de la semana
      const numeroSemana = Math.ceil(
        (diferenciaDias + inicioAño.getDay() + 1) / 7
      );

      return numeroSemana;
    },
  },
};
</script>