<template>
  <b-overlay :show="overlay2" spinner-small>
    <b-row>
      <b-col cols="9">
        <admin-pagos-empleados-terminar
          @reload="reloadMe"
          :totalCancelado="totalCancelado"
          :pagosResumen="pagosResumen"
          :pagosResumenVendedores="pagosResumenVendedores"
          :pagosResumenDiseno="pagosResumenDiseno"
          :fechaConsultaInicio="form.fechaConsultaInicio"
          :fechaConsultaFin="form.fechaConsultaFin"
        />
      </b-col>
      <b-col cols="3">
        <b-form @submit="onSubmit">
          <b-form-group
            id="input-group-1"
            label="Fecha inicio:"
            label-for="fecha-1"
          >
            <b-form-datepicker
              id="fecha-1"
              v-model="form.fechaConsultaInicio"
              class="mb-2"
            ></b-form-datepicker>
          </b-form-group>

          <b-form-group
            id="input-group-2"
            label="Fecha fin:"
            label-for="fecha-2"
          >
            <b-form-datepicker
              v-model="form.fechaConsultaFin"
              class="mb-2"
            ></b-form-datepicker>
          </b-form-group>
          <b-button type="submit" variant="primary">Buscar pagos</b-button>
        </b-form>
      </b-col>
    </b-row>

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
            <pagos-confirmacion-modal
              :empleado="data.item"
              :total-base="data.item.pago"
              :tipo-empleado="'Vendedor'"
              :detalles="filterVendedor(data.item.id_empleado)"
              :salario-calculado="data.item.monto_salario"
              :comision-calculada="data.item.monto_comision"
              @pago-exitoso="onPagoExitoso"
              @pago-error="onPagoError"
            />
          </template>

          <template #cell(pago)="data">
            <div class="floatme" style="width: 100%">
              <span v-if="data.item.pago === '0.00' && data.item.monto_salario === 0" class="text-muted">
                <small>Salario ya pagado</small>
              </span>
              <span v-else> ${{ data.item.pago }}</span>
            </div>
          </template>
        </b-table>
        <p class="text-right total-table">
          TOTAL ${{ totalCancelado.totalVendedores }}
        </p>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="mt-4">
        <h3 class="mb-4">Empleados</h3>
        <b-table
          responsive
          small
          striped
          :items="pagosResumen"
          :fields="fields"
        >
          <template #cell(nombre)="data">
            <pagos-confirmacion-modal
              :empleado="data.item"
              :total-base="data.item.pago"
              :tipo-empleado="'Empleado'"
              :detalles="filterEmpleado(data.item.id_empleado)"
              :salario-calculado="data.item.monto_salario"
              :comision-calculada="data.item.monto_comision"
              @pago-exitoso="onPagoExitoso"
              @pago-error="onPagoError"
            />
          </template>

          <template #cell(pago)="data">
            <div class="floatme" style="width: 100%">
              <span v-if="data.item.pago === '0.00' && data.item.monto_salario === 0" class="text-muted">
                <small>Salario ya pagado</small>
              </span>
              <span v-else> ${{ data.item.pago }}</span>
            </div>
          </template>
        </b-table>
        <p class="text-right total-table">
          TOTAL ${{ totalCancelado.totalEmpleados }}
        </p>
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
            <pagos-confirmacion-modal
              :empleado="data.item"
              :total-base="data.item.pago"
              :tipo-empleado="'Diseñador'"
              :detalles="filterDesigner(data.item.id_empleado)"
              :salario-calculado="data.item.monto_salario"
              :comision-calculada="data.item.monto_comision"
              @pago-exitoso="onPagoExitoso"
              @pago-error="onPagoError"
            />
          </template>

          <template #cell(pago)="data">
            <div class="floatme" style="width: 100%">
              <span v-if="data.item.pago === '0.00' && data.item.monto_salario === 0" class="text-muted">
                <small>Salario ya pagado</small>
              </span>
              <span v-else> ${{ data.item.pago }}</span>
            </div>
          </template>
        </b-table>
        <p class="text-right total-table">
          TOTAL ${{ totalCancelado.totalDiseno }}
        </p>
      </b-col>
    </b-row>
  </b-overlay>
</template>

<script>
import PagosConfirmacionModal from '~/components/admin/PagosConfirmacionModal.vue'

export default {
  components: {
    PagosConfirmacionModal,
  },
  data() {
    return {
      dataEmpleados: null,
      dataVendedores: null,
      empleados: [], // Lista completa de empleados con datos de salario
      totalCancelado: 0,
      datosUltimoPago: null, // Almacenar datos completos del último pago para el recibo
      form: {
        fechaConsultaInicio: "",
        fechaConsultaFin: "",
      },
      overlay: true,
      overlay2: false,
      pagos: [],
      pagosVendedores: [],
      pagosEmpleados: [],
      pagosDiseno: [],
      pagosTrabajosAdicionales: [],
      products: [],
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
      fieldsDiseno: [
        {
          key: "nombre",
          label: "Empleado",
          tdClass: "pl-4",
        },
        {
          key: "id_orden",
          label: "Orden",
        },
        {
          key: "producto",
          label: "Producto",
        },
        {
          key: "cantidad",
          label: "Cantidad",
        },
        {
          key: "fecha_pago",
          label: "Fecha Pago",
        },
        {
          key: "pago",
          label: "Total Pago",
          tdClass: "text-center pt-4 pb-4",
          thClass: "text-center pr-5",
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
            // Calcular comisión
            const comisionPago = parseFloat(curr.cantidad) * parseFloat(curr.comision);

            // Calcular salario según período
            const empleado = this.empleados.find(emp => emp._id === curr.id_empleado);
            const fechaReferencia = this.form.fechaConsultaFin ? new Date(this.form.fechaConsultaFin) : new Date();
            const salarioPago = this.calcularSalarioPeriodo(empleado, fechaReferencia);

            // Determinar el tipo de pago según salario_tipo
            let totalPago = 0;
            if (empleado && empleado.salario_tipo === 'Salario') {
              // Solo salario
              totalPago = salarioPago;
            } else if (empleado && empleado.salario_tipo === 'Salario más Comisión') {
              // Salario + comisión
              totalPago = comisionPago + salarioPago;
            } else {
              // Comisión (por defecto o cuando salario_tipo es 'Comisión')
              totalPago = comisionPago;
            }

            acc.push({
              nombre: curr.nombre,
              id_empleado: curr.id_empleado,
              departamento: curr.departamento,
              salario_tipo: empleado?.salario_tipo || 'No configurado', // Agregar salario_tipo
              cantidad: parseInt(curr.cantidad),
              pago: totalPago,
              monto_salario: salarioPago, // Salario calculado (0 si no corresponde)
              monto_comision: comisionPago, // Comisión calculada
            });
          } else {
            // Calcular comisión adicional
            const comisionPago = parseFloat(curr.cantidad) * parseFloat(curr.comision);
            acc[index].cantidad += parseInt(curr.cantidad);

            // Para empleados existentes, determinar si sumar comisión o salario
            const empleado = this.empleados.find(emp => emp._id === acc[index].id_empleado);
            if (empleado && empleado.salario_tipo === 'Salario más Comisión') {
              acc[index].pago += comisionPago;
            } else if (empleado && empleado.salario_tipo === 'Comisión') {
              acc[index].pago += comisionPago;
            }
            // Para 'Salario', no se suma comisión adicional
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
            // Calcular salario para vendedores
            const empleado = this.empleados.find(emp => emp._id === curr.id_empleado);
            const fechaReferencia = this.form.fechaConsultaFin ? new Date(this.form.fechaConsultaFin) : new Date();
            const salarioPago = this.calcularSalarioPeriodo(empleado, fechaReferencia);

            // DEBUG: Agregar logs para diagnosticar el problema
            console.log('DEBUG VENDEDOR - Empleado encontrado:', empleado);
            console.log('DEBUG VENDEDOR - ID empleado:', curr.id_empleado);
            console.log('DEBUG VENDEDOR - Salario tipo:', empleado?.salario_tipo);
            console.log('DEBUG VENDEDOR - Salario monto:', empleado?.salario_monto);
            console.log('DEBUG VENDEDOR - Salario periodo:', empleado?.salario_periodo);
            console.log('DEBUG VENDEDOR - Ultima semana pagada:', empleado?.ultima_semana_pagada);
            console.log('DEBUG VENDEDOR - Fecha referencia:', fechaReferencia);
            console.log('DEBUG VENDEDOR - Salario calculado:', salarioPago);
            console.log('DEBUG VENDEDOR - Comisión del pago actual:', curr.pago);
            console.log('DEBUG VENDEDOR - Datos completos del registro actual:', curr);

            // Determinar el tipo de pago según salario_tipo
            let totalPago = 0;
            if (empleado && empleado.salario_tipo === 'Salario') {
              // Solo salario
              totalPago = salarioPago;
            } else if (empleado && empleado.salario_tipo === 'Salario más Comisión') {
              // Salario + comisión
              totalPago = parseFloat(curr.pago) + salarioPago;
              console.log('DEBUG VENDEDOR - Total pago (Salario + Comisión):', totalPago, '=', parseFloat(curr.pago), '+', salarioPago);
            } else {
              // Comisión (por defecto o cuando salario_tipo es 'Comisión')
              totalPago = parseFloat(curr.pago);
            }

            acc.push({
              nombre: curr.nombre,
              id_empleado: curr.id_empleado,
              departamento: curr.departamento,
              salario_tipo: empleado?.salario_tipo || 'No configurado', // Agregar salario_tipo
              pago: totalPago,
              monto_salario: salarioPago, // Salario calculado (0 si no corresponde)
              monto_comision: parseFloat(curr.pago), // Comisión ya viene calculada de la API
            });
          } else {
            // Para vendedores existentes, determinar si sumar comisión o salario
            const empleado = this.empleados.find(emp => emp._id === acc[index].id_empleado);
            if (empleado && empleado.salario_tipo === 'Salario más Comisión') {
              acc[index].pago += parseFloat(curr.pago);
            } else if (empleado && empleado.salario_tipo === 'Comisión') {
              acc[index].pago += parseFloat(curr.pago);
            }
            // Para 'Salario', no se suma comisión adicional
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
            // Calcular salario para diseñadores
            const empleado = this.empleados.find(emp => emp._id === curr.id_empleado);
            const fechaReferencia = this.form.fechaConsultaFin ? new Date(this.form.fechaConsultaFin) : new Date();
            const salarioPago = this.calcularSalarioPeriodo(empleado, fechaReferencia);

            // Determinar el tipo de pago según salario_tipo
            let totalPago = 0;
            if (empleado && empleado.salario_tipo === 'Salario') {
              // Solo salario
              totalPago = salarioPago;
            } else if (empleado && empleado.salario_tipo === 'Salario más Comisión') {
              // Salario + comisión
              totalPago = parseFloat(curr.pago) + salarioPago;
            } else {
              // Comisión (por defecto o cuando salario_tipo es 'Comisión')
              totalPago = parseFloat(curr.pago);
            }


            acc.push({
              id_empleado: curr.id_empleado,
              nombre: curr.nombre,
              id_orden: curr.id_orden,
              departamento: curr.departamento,
              salario_tipo: empleado?.salario_tipo || 'No configurado', // Agregar salario_tipo
              cantidad: 1,
              producto: curr.producto,
              pago: totalPago,
              monto_salario: salarioPago, // Salario calculado (0 si no corresponde)
              monto_comision: parseFloat(curr.pago), // Comisión ya viene calculada de la API
            });
          } else {
            acc[index].cantidad += 1;

            // Para diseñadores existentes, determinar si sumar comisión o salario
            const empleado = this.empleados.find(emp => emp._id === acc[index].id_empleado);
            if (empleado && empleado.salario_tipo === 'Salario más Comisión') {
              acc[index].pago += parseFloat(curr.pago);
            } else if (empleado && empleado.salario_tipo === 'Comisión') {
              acc[index].pago += parseFloat(curr.pago);
            }
            // Para 'Salario', no se suma comisión adicional
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
  },

  methods: {
    async onPagoExitoso(nombreEmpleado, datosPagoCompletos = null) {
      // Guardar los datos completos del pago para el recibo (incluyendo bonos y descuentos)
      this.datosUltimoPago = {
        nombreEmpleado,
        ...datosPagoCompletos
      };

      // Mostrar confirmación para imprimir recibo
      const imprimirRecibo = await this.$confirm({
        title: "Pago realizado",
        html: `<p>El pago de ${nombreEmpleado} ha sido procesado correctamente</p><p>¿Desea imprimir el recibo de pago?</p>`,
        type: "success",
        confirmButtonText: "Sí, imprimir",
        cancelButtonText: "No, gracias"
      })

      if (imprimirRecibo) {
        // Usar el componente PagosVendedorResumen para imprimir el recibo
        // Este es el método que ya funcionaba correctamente
        this.imprimirReciboConComponente(nombreEmpleado)
      }

      // Recargar datos
      this.reloadMe()

      // Mostrar mensaje de éxito final
      this.$fire({
        title: "Pago realizado",
        html: `<p>El pago de ${nombreEmpleado} ha sido procesado correctamente</p>`,
        type: "success",
      })
    },

    onPagoError(errorMessage) {
      this.$fire({
        title: "Error en pago",
        html: `<p>Error al procesar el pago: ${errorMessage}</p>`,
        type: "error",
      })
    },
    // Función principal para determinar si debe pagarse salario (devuelve cantidad de períodos pendientes)
    debePagarSalario(empleado, fechaActual = new Date()) {
      if (!empleado || empleado.salario_tipo === 'Comisión') {
        return 0; // Solo comisión, no paga salario
      }

      const ultimaSemana = empleado.ultima_semana_pagada;
      const periodo = empleado.salario_periodo;

      switch (periodo) {
        case 'semanal':
          return this.debePagarSalarioSemanal(ultimaSemana, fechaActual);
        case 'quincenal':
          return this.debePagarSalarioQuincenal(ultimaSemana, fechaActual);
        case 'mensual':
          return this.debePagarSalarioMensual(ultimaSemana, fechaActual);
        default:
          return 0;
      }
    },

    // Determinar cuántas semanas pendientes hay para pago semanal
    debePagarSalarioSemanal(ultimaSemana, fechaActual) {
      const semanaActual = this.obtenerNumeroSemana(fechaActual);

      if (ultimaSemana === null) {
        return 1; // Pagar la semana actual
      }

      const semanasPendientes = semanaActual - ultimaSemana;
      return Math.max(0, semanasPendientes);
    },

    // Determinar cuántos períodos quincenales pendientes hay (permite pagos acumulados)
    debePagarSalarioQuincenal(ultimaSemana, fechaActual) {
      // Calcular el período quincenal actual
      const periodoActual = this.calcularPeriodoQuincenal(fechaActual);

      // Si nunca se pagó, devolver 1 (pagar el período actual)
      if (ultimaSemana === null) {
        return 1;
      }

      // Calcular cuántos períodos han pasado desde el último pago
      const periodosPendientes = periodoActual - ultimaSemana;

      // Devolver la cantidad de períodos pendientes (0 si ya se pagó el actual)
      return Math.max(0, periodosPendientes);
    },

    // Determinar cuántos meses pendientes hay para pago mensual
    debePagarSalarioMensual(ultimaSemana, fechaActual) {
      const mesActual = fechaActual.getMonth();
      const anioActual = fechaActual.getFullYear();

      // Calcular el número de mes actual
      const mesNumero = anioActual * 12 + mesActual;

      if (ultimaSemana === null) {
        return 1; // Pagar el mes actual
      }

      const mesesPendientes = mesNumero - ultimaSemana;
      return Math.max(0, mesesPendientes);
    },

    // Funciones auxiliares
    obtenerNumeroSemana(fecha) {
      const primerDiaAnio = new Date(fecha.getFullYear(), 0, 1);
      const diasTranscurridos = Math.floor((fecha - primerDiaAnio) / (24 * 60 * 60 * 1000));
      return Math.ceil((diasTranscurridos + primerDiaAnio.getDay() + 1) / 7);
    },

    esUltimoDiaDelMes(fecha) {
      const mes = fecha.getMonth();
      const anio = fecha.getFullYear();
      const ultimoDia = new Date(anio, mes + 1, 0).getDate();
      return fecha.getDate() === ultimoDia;
    },

    calcularPeriodoQuincenal(fecha) {
      const dia = fecha.getDate();
      const mes = fecha.getMonth();
      const anio = fecha.getFullYear();

      // Cada mes tiene 2 períodos quincenales: 1-15 y 16-último
      const periodoMes = dia <= 15 ? 1 : 2;

      // Calcular período total (anio * 24 + mes * 2 + periodoMes - 1)
      return anio * 24 + mes * 2 + periodoMes;
    },

    calcularNumeroSemanaActual() {
      return this.obtenerNumeroSemana(new Date());
    },

    calcularSalarioPeriodo(empleado, fechaActual = new Date()) {
      if (!empleado || !empleado.salario_tipo) return 0;

      // Obtener cantidad de períodos pendientes
      const periodosPendientes = this.debePagarSalario(empleado, fechaActual);

      // Si no hay períodos pendientes, no pagar
      if (periodosPendientes <= 0) {
        return 0;
      }

      const salarioMonto = parseFloat(empleado.salario_monto) || 0;
      const periodo = empleado.salario_periodo;

      // Si es solo comisión, no agregar salario
      if (empleado.salario_tipo === 'Comisión') {
        return 0;
      }

      // Si es "Salario" o "Salario más Comisión", calcular según período
      if (empleado.salario_tipo === 'Salario' || empleado.salario_tipo === 'Salario más Comisión') {
        let montoBase = 0;

        switch (periodo) {
          case 'semanal':
            montoBase = salarioMonto / 4; // Equivalente semanal del salario mensual
            break;
          case 'quincenal':
            montoBase = salarioMonto / 2; // Equivalente quincenal del salario mensual
            break;
          case 'mensual':
            montoBase = salarioMonto; // Pago completo mensual
            break;
          default:
            return 0;
        }

        // Multiplicar por la cantidad de períodos pendientes
        return montoBase * periodosPendientes;
      }

      return 0;
    },

    totalPagos(empleados, vendedores, disenadores) {
      console.log("totalPagos() vendedores", vendedores);
      console.log("totalPagos() empleados", empleados);
      console.log("totalPagos() disenadores", disenadores);

      const sumarPagosEmpleados = (arr) => {
        return arr.reduce((total, item) => {
          // Para empleados, el pago ya incluye comisión + salario calculado en pagosResumen
          return total + (parseFloat(item.pago) || 0);
        }, 0);
      };

      const sumarPagosVendedores = (arr) => {
        return arr.reduce((total, item) => {
          return total + (parseFloat(item.pago) || 0);
        }, 0);
      };

      const sumarPagosDisenadores = (arr) => {
        console.log("sumarPagosDisenadores - arr:", arr);
        return arr.reduce((total, item) => {
          const pagoValue = parseFloat(item.pago) || 0;
          console.log("sumarPagosDisenadores - item.pago:", item.pago, "pagoValue:", pagoValue);
          return total + pagoValue;
        }, 0);
      };

      const totales = {
        totalGeneral: 0,
        totalVendedores: 0,
        totalEmpleados: 0,
        totalDiseno: 0,
      };

      if (vendedores && Array.isArray(vendedores)) {
        totales.totalVendedores = sumarPagosVendedores(vendedores);
        totales.totalGeneral += totales.totalVendedores;
      }

      if (empleados && Array.isArray(empleados)) {
        totales.totalEmpleados = sumarPagosEmpleados(empleados);
        totales.totalGeneral += totales.totalEmpleados;
      }

      if (disenadores && Array.isArray(disenadores)) {
        totales.totalDiseno = sumarPagosDisenadores(disenadores);
        totales.totalGeneral += totales.totalDiseno;
      }

      // Redondear a 2 decimales
      totales.totalGeneral = totales.totalGeneral.toFixed(2);
      totales.totalVendedores = totales.totalVendedores.toFixed(2);
      totales.totalEmpleados = totales.totalEmpleados.toFixed(2);
      totales.totalDiseno = totales.totalDiseno.toFixed(2);

      return totales;
    },

    onSubmit(event) {
      event.preventDefault();
      const fechaConsultaInicio = this.form.fechaConsultaInicio;
      const fechaConsultaFin = this.form.fechaConsultaFin;

      if (!fechaConsultaInicio || !fechaConsultaFin) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>Por favor seleccione ambas fechas</p>`,
          type: "warning",
        });
        return;
      }

      if (new Date(fechaConsultaInicio) > new Date(fechaConsultaFin)) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
          type: "warning",
        });
        return;
      }
      this.getPagos().then(() => {
        this.$nextTick(() => {
          this.totalCancelado = this.totalPagos(
            this.pagosResumen, // Usar pagosResumen que ya incluye salario
            this.pagosResumenVendedores,
            this.pagosResumenDiseno
          );
        });
      });
    },

    reloadPagos() {
      if (this.form.fecha_inicio === "") {
        this.getPagos().then(() => {
          this.$nextTick(() => {
            this.totalCancelado = this.totalPagos(
              this.pagosResumen, // Usar pagosResumen que ya incluye salario
              this.pagosResumenVendedores,
              this.pagosResumenDiseno
            );
          });
        });
      }
    },

    async getPagosVendedores() {
      // this.overlay = true
      await this.$axios
        .get(`${this.$config.API}/pagos/semana/vendedores`)
        .then((res) => {
          console.log(
            "Respuesta de pagos de vendedores",
            res.data.data.vendedores
          );

          this.dataVendedores = res.data.data.vendedores;
          this.pagos = res.data;
          this.pagosVendedores = res.data.data.vendedores;
          // this.overlay = false
        });
    },
    async getPagosEmpleados() {
      // this.overlay = true
      await this.$axios
        .get(`${this.$config.API}/pagos/semana/empleados`)
        .then((res) => {
          console.log(
            "Respuesta de pagos de empleados",
            res.data.data.empleados
          );
          this.pagos = res.data;
          this.dataEmpleados = res.data.data.empleados;
          this.pagosEmpleados = res.data.data.empleados;
          // this.overlay = false
        });
    },
    async getPagosDisenadores() {
      // this.overlay = true
      await this.$axios
        .get(`${this.$config.API}/pagos/semana/disenadores`)
        .then((res) => {
          this.pagos = res.data;
          this.pagosDiseno = res.data.data.diseno;
          // TODO Reprogramar pagos adicionales pendiente de hacer
          /* this.pagosTrabajosAdicionales =
                        res.data.data.trabajos_adicionales */
          // this.overlay = false
        });
    },

    // ESTAMOS USANDO AL FUNCION getPagos() EN LUGAR DE getFilteredData() PARA TRAER LOS PAGOS INDIVIDUALMENTE
    /* async getFilteredData() {
            this.overlay = true
            const data = new URLSearchParams()
            data.set("fecha_inicio", this.form.fechaConsultaInicio)
            data.set("fecha_fin", this.form.fechaConsultaFin)

            await this.$axios
                .post(`${this.$config.API}/pagos/semana`, data)
                .then((res) => {
                    this.overlay = false
                    this.pagos = []
                    this.pagos = res.data
                    this.pagosVendedores = res.data.data.vendedores
                    this.pagosEmpleados = res.data.data.empleados
                    this.pagosDiseno =
                        res.data.data.this.pagosTrabajosAdicionales =
                        res.data.data.trabajos_adicionales
                    // this.urlLink = res.data.linkdrive
                })
        }, */

    // Este método ya no se usa directamente, ahora se usa desde el modal en PagosEmpleadosTerminar
    async realizarPagoAEmpleado() {
      // Método obsoleto - ahora se maneja desde el modal
      console.warn('realizarPagoAEmpleado está obsoleto. Use el modal de confirmación.');
    },

    filterProd(id_woo, campo) {
      // campo puede ser: cod, attributes ó categories
      /* let myProd = this.products
        .filter((el) => el.cod === parseInt(id_woo))
        .map((el) => {
          return {
            cod: el.cod,
            attributes: el.attributes,
            categories: el.categories,
          }
        })
        if (myProd.length === 0) {
        myProd.push({
          cod: 0,
          attributes: [],
          categories: [],
        })
        }
        console.log('filterProd', myProd) */
      let myProd = this.products.filter((el) => el.cod === parseInt(id_woo));

      return myProd[0][campo];
    },

    async getEmpleados() {
      await this.$axios
        .get(`${this.$config.API}/empleados`)
        .then((res) => {
          this.empleados = res.data.items || [];
          console.log("Empleados cargados:", this.empleados);
        })
        .catch((error) => {
          console.error("Error al cargar empleados:", error);
        });
    },

    async getPagos() {
      try {
        // Ejecutar las funciones asíncronas en paralelo, incluyendo getEmpleados
        await Promise.all([
          this.getPagosVendedores(),
          this.getPagosEmpleados(),
          this.getPagosDisenadores(),
          this.getAttributes(),
          this.getEmpleados(),
        ]);

        // Si necesitas ejecutar algo después de que getPagos termine
        // alert('HOLA'); // Esto se ejecutará después de que todo esté listo
      } catch (error) {
        console.error("Error en getPagos:", error);
        this.$fire({
          title: "Pagos",
          html: `<p>Error al cargar datos</p><p>${error}</p>`,
          type: "error",
        });
      }
    },

    reloadMe() {
      this.overlay = true;
      this.pagos = [];
      this.getAttributes().then(() => {
        this.getPagos().then(() => {
          this.$nextTick(() => {
            this.totalCancelado = this.totalPagos(
              this.pagosResumen, // Usar pagosResumen que ya incluye salario
              this.pagosResumenVendedores,
              this.pagosResumenDiseno
            );
          });
          this.overlay = false;
        });
      });
    },

    async getAttributes() {
      // this.overlay = true
      await this.$axios
        .get(`${this.$config.API}/atributos/comisiones`)
        .then((res) => {
          this.products = res.data.data;
          // this.overlay = false
        });
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

    imprimirReciboConComponente(nombreEmpleado) {
      // Buscar el empleado en los datos de resumen
      const empleadoData = this.pagosResumenVendedores.find(emp => emp.nombre === nombreEmpleado) ||
                          this.pagosResumen.find(emp => emp.nombre === nombreEmpleado) ||
                          this.pagosResumenDiseno.find(emp => emp.nombre === nombreEmpleado);

      if (!empleadoData) {
        this.$fire({
          title: "Error",
          html: `<p>No se encontraron datos para imprimir el recibo de ${nombreEmpleado}</p>`,
          type: "error",
        });
        return;
      }

      // Determinar detalles según el tipo de empleado
      let detalles = [];
      let tipoEmpleado = '';
      if (this.pagosResumenVendedores.some(emp => emp.nombre === nombreEmpleado)) {
        detalles = this.filterVendedor(empleadoData.id_empleado);
        tipoEmpleado = 'Vendedor';
      } else if (this.pagosResumen.some(emp => emp.nombre === nombreEmpleado)) {
        detalles = this.filterEmpleado(empleadoData.id_empleado);
        tipoEmpleado = 'Empleado';
      } else if (this.pagosResumenDiseno.some(emp => emp.nombre === nombreEmpleado)) {
        detalles = this.filterDesigner(empleadoData.id_empleado);
        tipoEmpleado = 'Diseñador';
      }

      // Usar los datos completos del último pago si están disponibles (incluyen bonos y descuentos)
      let salarioBase = parseFloat(empleadoData.monto_salario || 0);
      let totalComisiones = detalles.reduce((total, detalle) => {
        return total + parseFloat(detalle.pago || 0);
      }, 0);
      let bonos = [];
      let descuentos = [];
      let totalFinal = parseFloat(empleadoData.pago);

      // Si tenemos datos del último pago (con bonos y descuentos), usarlos
      if (this.datosUltimoPago && this.datosUltimoPago.nombreEmpleado === nombreEmpleado) {
        console.log('DEBUG RECIBO - Usando datos completos del último pago:', this.datosUltimoPago);
        salarioBase = parseFloat(this.datosUltimoPago.salarioBase || 0);
        totalComisiones = parseFloat(this.datosUltimoPago.comisionTotal || 0);
        bonos = this.datosUltimoPago.bonos || [];
        descuentos = this.datosUltimoPago.descuentos || [];
        totalFinal = parseFloat(this.datosUltimoPago.totalFinal || empleadoData.pago);
      } else {
        console.log('DEBUG RECIBO - No hay datos completos del último pago, usando datos básicos');
      }

      console.log('DEBUG RECIBO - Salario base calculado:', salarioBase);
      console.log('DEBUG RECIBO - Total comisiones:', totalComisiones);
      console.log('DEBUG RECIBO - Total final:', totalFinal);

      // Crear contenido del recibo que refleje exactamente lo que se muestra en el modal
      const printContent = `
        <div style="font-family: Arial, sans-serif; color: #000; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px;">
            <h1 style="margin: 0; color: #007bff; font-size: 28pt;">RECIBO DE PAGO</h1>
            <h2 style="margin: 10px 0; color: #666;">${this.$store.state.login.dataEmpresa.nombre || 'Empresa'}</h2>
          </div>

          <div style="margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>${tipoEmpleado}:</strong>
              <span>${empleadoData.nombre}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Tipo de ingreso:</strong>
              <span>${empleadoData.salario_tipo || 'No configurado'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Fecha de Pago:</strong>
              <span>${new Date().toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          <div style="border: 1px solid #000; padding: 20px; margin: 20px 0; background-color: #f9f9f9;">
            <h3 style="margin-top: 0; margin-bottom: 20px;">Resumen del Pago</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Salario Base:</span>
              <span>$${salarioBase.toFixed(2)}</span>
            </div>
            ${totalComisiones > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Comisiones:</span>
              <span>$${totalComisiones.toFixed(2)}</span>
            </div>
            ` : ''}
            ${bonos.length > 0 ? `
            <div style="margin: 15px 0; padding: 10px; background-color: #e8f5e8; border-left: 4px solid #4caf50;">
              <strong>Bonos Aplicados:</strong>
              ${bonos.map(bono => `
                <div style="margin: 5px 0; display: flex; justify-content: space-between;">
                  <span>${bono.descripcion || 'Sin descripción'}</span>
                  <span style="color: #4caf50; font-weight: bold;">+$${parseFloat(bono.monto || 0).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}
            ${descuentos.length > 0 ? `
            <div style="margin: 15px 0; padding: 10px; background-color: #ffeaea; border-left: 4px solid #f44336;">
              <strong>Descuentos Aplicados:</strong>
              ${descuentos.map(descuento => `
                <div style="margin: 5px 0; display: flex; justify-content: space-between;">
                  <span>${descuento.descripcion || 'Sin descripción'}</span>
                  <span style="color: #f44336; font-weight: bold;">-$${parseFloat(descuento.monto || 0).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}
            <div style="border-top: 1px solid #000; padding-top: 10px; margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14pt;">
                <span>TOTAL A PAGAR:</span>
                <span>$${totalFinal.toFixed(2)}</span>
              </div>
            </div>
          </div>


          <div style="margin-top: 50px; display: flex; justify-content: space-between;">
            <div style="width: 200px; text-align: center; border-top: 1px solid #000; padding-top: 10px;">
              <p>Firma del Empleado</p>
            </div>
            <div style="width: 200px; text-align: center; border-top: 1px solid #000; padding-top: 10px;">
              <p>Firma del Empleador</p>
            </div>
          </div>
        </div>
      `;

      // Abrir nueva ventana para impresión (mismo método que PagosVendedorResumen)
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const reportDate = `${day}-${month}-${year}`;
      const reportTitle = `Recibo de Pago - ${nombreEmpleado} - ${reportDate}`;

      const newWindow = window.open("", "_blank", "width=800,height=600");
      newWindow.document.write(`
        <html>
          <head>
            <title>${reportTitle}</title>
            <style>
              @page {
                size: portrait;
                margin: 0.5in;
              }
              body {
                font-family: Verdana, sans-serif;
                font-size: 9pt;
              }
              .report-container {
                color: #000;
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.focus();
      setTimeout(() => {
        newWindow.print();
        newWindow.close();
      }, 250);
    },
  },

  mounted() {
    this.getPagos().then(() => {
      // console.log('VAMOS A EJECUTAR totalPagos');

      // this.totalCancelado = this.totalPagos(this.pagosEmpleados, this.pagosVendedores)
      // console.log('RESULTADO totalPagos', this.totalCancelado);
      this.$nextTick(() => {
        this.totalCancelado = this.totalPagos(
          this.pagosResumen, // Usar pagosResumen que ya incluye salario
          this.pagosResumenVendedores,
          this.pagosResumenDiseno
        );
      });
      this.overlay = false;
    });
  },
};
</script>
