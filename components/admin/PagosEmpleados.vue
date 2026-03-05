<template>
  <b-overlay :show="overlay2" spinner-small>
    <b-row>
      <b-col cols="9">
        <admin-pagos-empleados-terminar @reload="reloadMe" :totalCancelado="totalCancelado"
          :pagosResumen="pagosResumenUnificado" :pagosResumenVendedores="[]" :pagosResumenDiseno="[]"
          :fechaConsultaInicio="form.fechaConsultaInicio" :fechaConsultaFin="form.fechaConsultaFin" />
      </b-col>
      <b-col cols="3">
        <b-form @submit="onSubmit">
          <b-form-group id="input-group-1" label="Fecha inicio:" label-for="fecha-1">
            <b-form-datepicker id="fecha-1" v-model="form.fechaConsultaInicio" class="mb-2"></b-form-datepicker>
          </b-form-group>

          <b-form-group id="input-group-2" label="Fecha fin:" label-for="fecha-2">
            <b-form-datepicker v-model="form.fechaConsultaFin" class="mb-2"></b-form-datepicker>
          </b-form-group>
          <b-button type="submit" variant="primary" class="w-100 mb-3 block">Buscar pagos</b-button>

          <b-form-group label="Filtrar por Departamento:"
            v-if="pagosResumenUnificado && pagosResumenUnificado.length > 0">
            <b-form-select v-model="departamentoFiltro" :options="departamentosUnicos"></b-form-select>
          </b-form-group>
        </b-form>
      </b-col>
    </b-row>

    <b-row>
      <b-col class="mt-4">
        <b-row>
          <b-col class="mt-2 mb-4 d-flex justify-content-between align-items-center">
            <h3>Planilla de Empleados</h3>
            <h3 class="text-success">TOTAL GENERAL ${{ totalCancelado.totalGeneral }}</h3>
          </b-col>
        </b-row>

        <b-table responsive small striped hover :items="pagosResumenUnificadoFiltrado" :fields="fields">
          <template #cell(nombre)="data">
            <span v-if="data.item.pago === '0.00' && data.item.monto_salario === 0" class="text-muted">
              {{ data.item.nombre }}
            </span>
            <pagos-confirmacion-modal v-else :empleado="data.item" :total-base="data.item.pago"
              :tipo-empleado="'Empleado'"
              :detalles="[...filterEmpleado(data.item.id_empleado), ...filterVendedor(data.item.id_empleado), ...filterDesigner(data.item.id_empleado)]"
              :salario-calculado="data.item.monto_salario" :comision-calculada="data.item.monto_comision"
              @pago-exitoso="onPagoExitoso" @pago-error="onPagoError" />
          </template>

          <template #cell(reporte)="data">
            <pagos-reporte-empleado
              :id-empleado="data.item.id_empleado"
              :nombre-empleado="data.item.nombre"
              :pendiente="true"
            />
          </template>

          <template #cell(pago)="data">
            <div class="floatme" style="width: 100%">
              <span
                v-if="data.item.pago === '0.00' && data.item.monto_salario === 0 && data.item.salario_tipo !== 'Comisión'"
                class="text-success font-weight-bold">
                <small><b-icon icon="check-circle"></b-icon> Salario Pagado</small>
              </span>
              <span v-else-if="data.item.pago === '0.00' && data.item.salario_tipo === 'Comisión'" class="text-muted">
                <small>Sin comisiones</small>
              </span>
              <span v-else> <strong>${{ data.item.pago }}</strong></span>
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </b-overlay>
</template>

<script>
import PagosConfirmacionModal from '~/components/admin/PagosConfirmacionModal.vue'
import PagosReporteEmpleado from '~/components/admin/PagosReporteEmpleado.vue'
import PrintService from '@/utils/PrintService'

export default {
  components: {
    PagosConfirmacionModal,
    PagosReporteEmpleado,
  },
  data() {
    return {
      dataEmpleados: null,
      dataVendedores: null,
      empleados: [], // Lista completa de empleados con datos de salario
      totalCancelado: { totalGeneral: '0.00', totalVendedores: '0.00', totalEmpleados: '0.00', totalDiseno: '0.00' },
      datosUltimoPago: null, // Almacenar datos completos del último pago para el recibo
      departamentoFiltro: "",
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
    pagosResumenUnificado() {
      const todosLosPagos = [
        ...this.pagosEmpleados.map(p => ({ ...p, origen: 'Empleado' })),
        ...this.pagosVendedores.map(p => ({ ...p, origen: 'Vendedor' })),
        ...this.pagosDiseno.map(p => ({ ...p, origen: 'Diseñador' }))
      ];

      if (todosLosPagos.length === 0) return [];

      const processedPagos = new Set();

      const result = todosLosPagos.reduce((acc, curr) => {
        // Evitar duplicados si el mismo id_pago viene en múltiples listas
        if (curr.id_pago && processedPagos.has(curr.id_pago)) return acc;
        if (curr.id_pago) processedPagos.add(curr.id_pago);

        const index = acc.findIndex(el => el.id_empleado == curr.id_empleado);
        let comisionPago = parseFloat(curr.pago) || 0;

        if (index === -1) {
          const empleado = this.empleados.find(emp => emp.id == curr.id_empleado || emp._id == curr.id_empleado);
          const fechaString = this.form.fechaConsultaFin || "";
          const fechaReferencia = (fechaString && fechaString.trim() !== "") ? new Date(fechaString) : new Date();
          const salarioPago = this.calcularSalarioPeriodo(empleado, fechaReferencia);
          const tipoSalario = empleado?.salario_tipo || 'No configurado';

          let totalPago = 0;
          let comisionParaRegistro = 0;

          if (tipoSalario === 'Salario') {
            totalPago += salarioPago;
            comisionParaRegistro = 0;
          } else if (tipoSalario === 'Comisión') {
            totalPago += comisionPago;
            comisionParaRegistro = comisionPago;
          } else if (tipoSalario === 'Salario más Comisión') {
            totalPago += (salarioPago + comisionPago);
            comisionParaRegistro = comisionPago;
          } else {
            totalPago += comisionPago;
            comisionParaRegistro = comisionPago;
          }

          let dep = curr.departamento || (curr.origen === 'Diseñador' ? 'Diseño' : (curr.origen === 'Vendedor' ? 'Ventas' : 'Producción'));

          acc.push({
            nombre: curr.nombre || curr.nombre_disenador || (empleado ? empleado.nombre : 'Empleado'),
            id_empleado: curr.id_empleado,
            departamento: dep,
            salario_tipo: tipoSalario,
            pago: totalPago,
            monto_salario: tipoSalario !== 'Comisión' ? salarioPago : 0,
            monto_comision: comisionParaRegistro,
            id_pagos: curr.id_pago ? [curr.id_pago] : [],
          });
        } else {
          const tipoSalario = acc[index].salario_tipo;

          if (tipoSalario === 'Comisión' || tipoSalario === 'Salario más Comisión') {
            acc[index].monto_comision += comisionPago;
            acc[index].pago += comisionPago;
          } else if (tipoSalario !== 'Salario') {
            acc[index].monto_comision += comisionPago;
            acc[index].pago += comisionPago;
          }

          let dep = curr.departamento || (curr.origen === 'Diseñador' ? 'Diseño' : (curr.origen === 'Vendedor' ? 'Ventas' : 'Producción'));
          if (dep && !acc[index].departamento.includes(dep)) {
            acc[index].departamento += ' + ' + dep;
          }

          if (curr.id_pago && !acc[index].id_pagos.includes(curr.id_pago)) {
            acc[index].id_pagos.push(curr.id_pago);
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
  },

  methods: {
    async onPagoExitoso(nombreEmpleado, datosPagoCompletos = null) {
      // Guardar los datos completos del pago para el recibo (incluyendo bonos y descuentos)
      this.datosUltimoPago = {
        nombreEmpleado,
        ...datosPagoCompletos
      };

      // Recargar datos INMEDIATAMENTE para que el empleado desaparezca de la lista
      this.reloadMe(false)

      // Mostrar confirmación para imprimir recibo
      const imprimirRecibo = await this.$confirm(
        `<p>El pago de ${nombreEmpleado} ha sido procesado correctamente</p><p>¿Desea imprimir el recibo de pago?</p>`,
        "Pago realizado",
        "success",
        {
          confirmButtonText: "Sí, imprimir",
          cancelButtonText: "No, gracias"
        }
      )

      if (imprimirRecibo) {
        // Usar el componente PagosVendedorResumen para imprimir el recibo
        // Este es el método que ya funcionaba correctamente
        this.imprimirReciboConComponente(nombreEmpleado)
      }

      // Mostrar mensaje de éxito final
      // Mostrar mensaje de éxito final (COMENTADO: Es redundante porque el usuario ya confirmó arriba y bloquea la UI)
      /* this.$fire({
        title: "Pago realizado",
        html: `<p>El pago de ${nombreEmpleado} ha sido procesado correctamente</p>`,
        type: "success",
      }) */
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
      const ultimoAnio = empleado.ultimo_anio_pagado;
      const periodo = empleado.salario_periodo;

      switch (periodo) {
        case 'semanal':
          return this.debePagarSalarioSemanal(ultimaSemana, ultimoAnio, fechaActual);
        case 'quincenal':
          // El backend ya guarda el índice quincenal completo (año*24 + mes*2 + quincena)
          return this.debePagarSalarioQuincenal(ultimaSemana, fechaActual);
        case 'mensual':
          // El backend ya guarda el índice mensual completo (año*12 + mes)
          return this.debePagarSalarioMensual(ultimaSemana, fechaActual);
        default:
          return 0;
      }
    },

    // Determinar cuántas semanas pendientes hay para pago semanal
    debePagarSalarioSemanal(ultimaSemana, ultimoAnio, fechaActual) {
      const semanaActual = this.obtenerNumeroSemana(fechaActual);
      const anioActual = fechaActual.getFullYear();

      if (ultimaSemana === null || ultimoAnio === null) {
        return 1; // Pagar la semana actual
      }

      // Convertir a un índice lineal de semanas para manejar cambios de año
      // IMPORTANTE: Forzar Number() para evitar concatenación de strings (ej: 105000 + "48" = "10500048")
      const numAnioActual = Number(anioActual);
      const numSemanaActual = Number(semanaActual);
      const numUltimoAnio = Number(ultimoAnio);
      const numUltimaSemana = Number(ultimaSemana);

      const indiceActual = numAnioActual * 52 + numSemanaActual;
      const indiceUltimo = numUltimoAnio * 52 + numUltimaSemana;

      const semanasPendientes = indiceActual - indiceUltimo;

      // Si el resultado es NaN por cualquier motivo, devolvemos 0
      if (isNaN(semanasPendientes)) {
        return 0;
      }

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

    totalPagos(resumenUnificado) {
      let sum = 0;
      if (resumenUnificado && Array.isArray(resumenUnificado)) {
        sum = resumenUnificado.reduce((total, item) => total + (parseFloat(item.pago) || 0), 0);
      }
      return {
        totalGeneral: sum.toFixed(2),
        totalVendedores: '0.00',
        totalEmpleados: '0.00',
        totalDiseno: '0.00'
      };
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
          this.totalCancelado = this.totalPagos(this.pagosResumenUnificado);
        });
      });
    },

    reloadPagos() {
      if (this.form.fecha_inicio === "") {
        this.getPagos().then(() => {
          this.$nextTick(() => {
            this.totalCancelado = this.totalPagos(this.pagosResumenUnificado);
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
          this.pagosDiseno = (res.data.data.diseno || []).map(item => {
            return {
              ...item,
              nombre: item.nombre || item.nombre_disenador || null,
              departamento: 'Diseño'
            }
          });
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

    reloadMe(showOverlay = true) {
      if (showOverlay) {
        this.overlay = true;
      }
      this.pagos = [];
      this.getAttributes().then(() => {
        this.getPagos().then(() => {
          this.$nextTick(() => {
            this.totalCancelado = this.totalPagos(this.pagosResumenUnificado);
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
      return this.pagosVendedores.filter(
        (el) => el.id_empleado == id_empleado
      );
    },

    filterDesigner(id_empleado) {
      return this.pagosDiseno.filter((el) => el.id_empleado == id_empleado);
    },

    filterEmpleado(id_empleado) {
      return this.pagosEmpleados.filter((el) => el.id_empleado == id_empleado);
    },

    imprimirReciboConComponente(nombreEmpleado) {
      // Buscar el empleado en los datos de resumen
      let empleadoData = this.pagosResumenUnificado.find(emp => emp.nombre === nombreEmpleado);

      // Si no se encuentra en las listas (porque ya se recargaron), usar datosUltimoPago como fallback
      if (!empleadoData && this.datosUltimoPago && this.datosUltimoPago.nombreEmpleado === nombreEmpleado) {
        console.log('DEBUG RECIBO - Empleado no encontrado en lista, usando datosUltimoPago');
        empleadoData = this.datosUltimoPago.empleado;
      }

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

      // Intentar determinar empleado desde la lista unificada
      if (this.pagosResumenUnificado.some(emp => emp.nombre === nombreEmpleado)) {
        detalles = [...this.filterVendedor(empleadoData.id_empleado), ...this.filterEmpleado(empleadoData.id_empleado), ...this.filterDesigner(empleadoData.id_empleado)];
        tipoEmpleado = 'Empleado';
      }
      // Fallback: Usar datosUltimoPago si tenemos la info guardada
      else if (this.datosUltimoPago && this.datosUltimoPago.nombreEmpleado === nombreEmpleado) {
        detalles = this.datosUltimoPago.detalles || [];
        tipoEmpleado = this.datosUltimoPago.tipoEmpleado || 'Empleado';
      }

      // Usar los datos completos del último pago si están disponibles (incluyen bonos y descuentos)
      let salarioBase = parseFloat(empleadoData.monto_salario || 0);
      let totalComisiones = detalles.reduce((total, detalle) => {
        return total + parseFloat(detalle.pago || 0);
      }, 0);
      let bonos = [];
      let descuentos = [];
      let totalFinal = parseFloat(empleadoData.pago);

      // Si tenemos datos del último pago (con bonos y descuentos), usarlos (PRIORIDAD)
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

      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const reportDate = `${day}-${month}-${year}`;
      const reportTitle = `Recibo de Pago - ${nombreEmpleado} - ${reportDate}`;

      PrintService.imprimir(reportTitle, printContent);
    },
  },

  mounted() {
    this.getPagos().then(() => {
      // console.log('VAMOS A EJECUTAR totalPagos');

      // this.totalCancelado = this.totalPagos(this.pagosEmpleados, this.pagosVendedores)
      // console.log('RESULTADO totalPagos', this.totalCancelado);
      this.$nextTick(() => {
        this.totalCancelado = this.totalPagos(this.pagosResumenUnificado);
      });
      this.overlay = false;
    });
  },
};
</script>
