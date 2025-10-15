<template>
  <b-overlay :show="overlay2" spinner-small>
    <b-row>
      <b-col cols="9">
        <admin-pagos-empleados-terminar @reload="reloadMe" />
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
            <admin-PagosVendedorResumen
              :item="data.item"
              @reload="reloadMe"
              :detalles="filterVendedor(data.item.id_empleado)"
            />
          </template>

          <template #cell(pago)="data">
            <div class="floatme" style="width: 100%">
              <span> ${{ data.item.pago }}</span>
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
            <admin-PagosEmpleadoResumen
              :item="data.item"
              :products="products"
              @reload="reloadMe"
              :detalles="filterEmpleado(data.item.id_empleado)"
            />
          </template>

          <template #cell(pago)="data">
            <div class="floatme" style="width: 100%">
              <span> ${{ data.item.pago }}</span>
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
            <admin-PagosDisenioResumen
              :item="data.item"
              @reload="reloadMe"
              :detalles="filterDesigner(data.item.id_empleado)"
              :adicionales="pagosTrabajosAdicionales"
            />
          </template>

          <template #cell(pago)="data">
            <div class="floatme" style="width: 100%">
              <span> ${{ data.item.pago }}</span>
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </b-overlay>
</template>

<script>
export default {
  data() {
    return {
      dataEmpleados: null,
      dataVendedores: null,
      totalCancelado: 0,
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
            acc.push({
              nombre: curr.nombre,
              id_empleado: curr.id_empleado,
              departamento: curr.departamento,
              cantidad: parseInt(curr.cantidad),
              pago: parseFloat(curr.cantidad) * parseFloat(curr.comision),
            });
          } else {
            acc[index].cantidad += parseInt(curr.cantidad);
            acc[index].pago += parseFloat(curr.cantidad) * parseFloat(curr.comision);
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
    totalPagos(empleados, vendedores, otrosTipos) {
      console.log("totalPagos() vendedores", vendedores);
      console.log("totalPagos() empleados", empleados);

      const sumarPagos = (arr) =>
        // arr.reduce((total, item) => total + (parseFloat(item.pago) || 0), 0);
        arr.reduce(
          (total, item) =>
            total +
            (parseFloat(item.cantidad * parseFloat(item.comision)) || 0),
          0
        );

      const totales = {
        totalGeneral: 0,
        totalVendedores: 0,
        totalEmpleados: 0,
        totalOtros: 0, // Agregar más tipos de empleados aquí si es necesario
      };

      if (vendedores && Array.isArray(vendedores)) {
        totales.totalVendedores = sumarPagos(vendedores);
        totales.totalGeneral += totales.totalVendedores;
      }

      if (empleados && Array.isArray(empleados)) {
        totales.totalEmpleados = sumarPagos(empleados);
        totales.totalGeneral += totales.totalEmpleados;
      }

      if (otrosTipos && Array.isArray(otrosTipos)) {
        totales.totalOtros = sumarPagos(otrosTipos);
        totales.totalGeneral += totales.totalOtros;
      }

      // Redondear a 2 decimales
      totales.totalGeneral = totales.totalGeneral.toFixed(2);
      totales.totalVendedores = totales.totalVendedores.toFixed(2);
      totales.totalEmpleados = totales.totalEmpleados.toFixed(2);
      totales.totalOtros = totales.totalOtros.toFixed(2);

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
        this.totalCancelado = this.totalPagos(
          this.pagosEmpleados,
          this.pagosVendedores
        );
      });
    },

    reloadPagos() {
      if (this.form.fecha_inicio === "") {
        this.getPagos().then(() => {
          this.totalCancelado = this.totalPagos(
            this.pagosEmpleados,
            this.pagosVendedores
          );
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

    async realizarPagoAEmpleado() {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("fecha_inicio", this.form.fechaConsultaInicio);
      data.set("fecha_fin", this.form.fechaConsultaFin);

      await this.$axios
        .post(`${this.$config.API}/pagos/pagar-a-empleados`, data)
        .then((res) => {
          this.overlay = false;
          this.pagos = [];
          this.pagos = res.data;
          this.pagosEmpleados = res.data.data.empleados;
          this.pagosDiseno = res.data.data.diseno;
          // this.urlLink = res.data.linkdrive
        });
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

    async getPagos() {
      try {
        // Ejecutar las funciones asíncronas en paralelo
        await Promise.all([
          this.getPagosVendedores(),
          this.getPagosEmpleados(),
          this.getPagosDisenadores(),
          this.getAttributes(),
        ]);

        // Calcular el total de pagos después de que todas las promesas se resuelvan
        this.totalCancelado = this.totalPagos(
          this.pagosEmpleados,
          this.pagosVendedores
        );
        console.log(`totalCandelado`, this.totalCancelado);

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
          this.totalCancelado = this.totalPagos(
            this.pagosEmpleados,
            this.pagosVendedores
          );
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
  },

  mounted() {
    this.getPagos().then(() => {
      // console.log('VAMOS A EJECUTAR totalPagos');

      // this.totalCancelado = this.totalPagos(this.pagosEmpleados, this.pagosVendedores)
      // console.log('RESULTADO totalPagos', this.totalCancelado);
      this.overlay = true;
    });
  },
};
</script>
