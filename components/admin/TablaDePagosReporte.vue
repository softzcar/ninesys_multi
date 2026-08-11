<template>
  <div>
    <!-- <h1 class="mb-4">{{ this.$store.state.login.dataUser.departamento }}</h1> -->
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <b-row>
        <b-col>
          <b-list-group class="mb-4">
            <b-list-group-item>
              <h3 v-if="departamento != 'Comercialización'">
                RELACIÓN DE PAGOS
              </h3>
            </b-list-group-item>
            <!-- Badge de tipo de compensación -->
            <b-list-group-item v-if="tipoCompensacion" variant="light">
              <b-badge :variant="tipoCompensacion.variant" class="p-2" style="font-size: 1rem;">
                {{ tipoCompensacion.icono }} {{ tipoCompensacion.texto }}
              </b-badge>
            </b-list-group-item>

            <b-list-group-item variant="info">
              <h3>{{ horasTrabajadas }} HORAS</h3>
            </b-list-group-item>

            <!-- Mostrar salario fijo solo si el tipo de compensación lo incluye -->
            <b-list-group-item v-if="debesMostrarSalario && parseFloat(salarioFijo) > 0" variant="warning">
              <strong>SALARIO PENDIENTE ({{ datosEmpleado?.salario_periodo?.toUpperCase() || 'SEMANAL' }})</strong> ${{
                salarioFijo }}
            </b-list-group-item>

            <!-- Mostrar comisiones solo si el tipo de compensación lo incluye -->
            <div v-if="debesMostrarComisiones">
              <b-list-group-item variant="success">
                <strong>COMISIONES TERMINADAS</strong> ${{ totalComisionesTerminadas }}
              </b-list-group-item>
              <b-list-group-item variant="danger">
                <strong>COMISIONES PENDIENTES</strong> ${{ totalComisionesPendientes }}
              </b-list-group-item>
            </div>

            <b-list-group-item variant="primary">
              <strong>TOTAL</strong> $ {{ total }}
            </b-list-group-item>
          </b-list-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col class="mt-4">
          <b-tabs>
            <b-tab
              v-if="departamento != 'Comercialización'"
              title="PENDIENTES"
              active
            >
              <b-table-lite
                bordered
                responsive
                small
                striped
                :items="trabajosPendientes()"
                :fields="fields.pendientes"
              >
                <template #cell(id_orden)="data">
                  <linkSearch :id="data.item.id_orden" />
                </template>
                <template #cell(cantidad)="data">
                  <!-- {{ data.item.unidades_solicitadas }} -->
                  {{ data.item.cantidad }}
                </template>
                <template #cell(calculo_pago)="data">
                  ${{
                    montoComisionEmpelado(
                      data.item.comision_tipo,
                      data.item.total_comision_variable,
                      data.item.total_comision_fija
                    )
                  }}
                </template>
              </b-table-lite>
            </b-tab>

            <b-tab title="TERMINADOS">
              <b-table-lite
                bordered
                responsive
                small
                striped
                hover
                :items="trabajosTerminados"
                :fields="fields.terminadas"
              >
                <template #cell(id_orden)="data">
                  <linkSearch :id="data.item.id_orden" />
                </template>
                <template #cell(calculo_pago)="data">
                  ${{ data.item.monto_pago }}
                </template>
                <template #cell(producto)="data">
                  <span style="text-transform: capitalize">
                    {{ data.item.producto }}
                  </span>
                </template>

                <template #cell(rendimiento)="data">
                  {{
                    tiempoTranscurridoEnMinutos(
                      data.item.fecha_inicio,
                      data.item.fecha_terminado
                    )
                  }}
                </template>

                <template #cell(fecha_inicio)="data">
                  {{ formatTimestamp(data.item.fecha_inicio) }}
                </template>

                <template #cell(fecha_terminado)="data">
                  {{ formatTimestamp(data.item.fecha_terminado) }}
                </template>
              </b-table-lite>
            </b-tab>
          </b-tabs>
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],

  data() {
    return {
      overlay: true,
      ordenes: [],
      ordenesSemana: [],
      ordenesTerminadas: [],
      ordenesPendientes: [],
      datosEmpleado: null,
    };
  },

  computed: {
    horasTrabajadas() {
      let totalSegundos = 0;

      // Excluir a los departamentos que no registran tiempo por tarea.
      if (
        this.departamento !== "Comercialización" &&
        this.departamento !== "Administración"
      ) {
        if (Array.isArray(this.ordenesSemana)) {
          // Filtrar las órdenes que tienen un tiempo transcurrido válido y sumarlo.
          // Asumimos que 'tiempo_transcurrido' está en segundos.
          totalSegundos = this.ordenesSemana
            .filter(
              (el) =>
                el.tiempo_transcurrido != null &&
                !isNaN(parseFloat(el.tiempo_transcurrido))
            )
            .reduce(
              (acc, orden) => acc + parseFloat(orden.tiempo_transcurrido),
              0
            );
        }
      }

      if (totalSegundos === 0) {
        return "0.00";
      }

      // Convertir el total de segundos a horas y redondear a 2 decimales.
      const totalHoras = totalSegundos / 3600;
      return totalHoras.toFixed(2);
    },

    fields() {
      let fields = {};
      if (this.departamento === "Comercialización") {
        fields.pendientes = [
          {
            key: "id_orden",
            label: "ORD",
            class: "text-center",
          },
          {
            key: "fecha_de_pago",
            label: "FECHA",
            class: "text-center",
          },
          {
            key: "tipo_de_pago",
            label: "TIPO",
            class: "text-center",
          },
          {
            key: "calculo_pago",
            label: "COMISIÓN",
            class: "text-center",
          },
        ];
        fields.terminadas = [
          {
            key: "id_orden",
            label: "ORD",
            class: "text-center",
          },
          {
            key: "calculo_pago",
            label: "COMISIÓN",
            class: "text-center",
          },
        ];
      } else if (this.departamento === "Diseño") {
        fields.pendientes = [
          {
            key: "id_orden",
            label: "ORD",
            class: "text-center",
          },
          {
            key: "producto",
            label: "PRODUCTO",
            class: "text-center",
          },
          {
            key: "monto_pago",
            label: "COMISIÓN",
            class: "text-center",
          },
        ];
        fields.terminadas = [
          {
            key: "id_orden",
            label: "ORD",
            class: "text-center",
          },
          {
            key: "producto",
            label: "PRODUCTO",
            class: "text-center",
          },
          {
            key: "calculo_pago",
            label: "COMISIÓN",
            class: "text-center",
          },
        ];
      } else {
        fields.pendientes = [
          {
            key: "id_orden",
            label: "ORD",
            class: "text-center",
          },
          {
            key: "total_productos",
            label: "UND",
            class: "text-center",
          },
          {
            key: "cliente",
            label: "CLIENTE",
          },
          {
            key: "calculo_pago",
            label: "$",
            class: "text-right",
            thClass: "text-center",
            tdClass: "pr-4",
          },
        ];
        fields.terminadas = [
          {
            key: "id_orden",
            label: "ORD",
            class: "text-center",
          },
          {
            key: "total_productos",
            label: "UND",
            class: "text-center",
          },
          {
            key: "cliente",
            label: "CLIENTE",
          },
          {
            key: "fecha_inicio",
            label: "INICIO",
          },
          {
            key: "fecha_terminado",
            label: "FIN",
          },
          {
            key: "rendimiento",
            label: "Minutos",
          },
          {
            key: "calculo_pago",
            label: "$",
            class: "text-right",
            thClass: "text-center",
            tdClass: "pr-4",
          },
        ];
      }

      return fields;
    },

    totalHorasTrabajadas() {
      return null;
      if (!this.ordenesTerminadas || this.ordenesTerminadas.length === 0) {
        return 0; // Si el array está vacío o no está definido, devolvemos 0
      }

      let totalSegundos = 0;

      this.ordenesTerminadas.forEach((orden) => {
        const inicio = new Date(orden.fecha_inicio);
        const fin = new Date(orden.fecha_terminado);

        // Calcular la diferencia en segundos
        const diferenciaSegundos = (fin.getTime() - inicio.getTime()) / 1000;
        totalSegundos += diferenciaSegundos;
      });

      // Convertir segundos a horas
      const totalHoras = totalSegundos / 3600;

      return totalHoras;
    },

    totalTerminado() {
      let comision = 0;
      if (
        this.departamento === "Comercialización" ||
        this.departamento === "Administración"
      ) {
        comision = this.ordenesTerminadas.reduce((total, orden) => {
          total += parseFloat(orden.monto_pago || 0);
          return total;
        }, 0);
      } else {
        comision = this.ordenesTerminadas.reduce((total, orden) => {
          if (orden.fecha_terminado !== null) {
            total += parseFloat(orden.monto_pago || 0);
          }
          return total;
        }, 0);
      }

      return comision.toFixed(2);
    },

    totalComisionesTerminadas() {
      let comision = 0;
      if (
        this.departamento === "Comercialización" ||
        this.departamento === "Administración"
      ) {
        comision = this.ordenesTerminadas.reduce((total, orden) => {
          total += parseFloat(orden.monto_pago || 0);
          return total;
        }, 0);
      } else {
        comision = this.ordenesTerminadas.reduce((total, orden) => {
          if (orden.fecha_terminado !== null) {
            total += parseFloat(orden.monto_pago || 0);
          }
          return total;
        }, 0);
      }
      return comision.toFixed(2);
    },

    salarioFijo() {
      if (!this.datosEmpleado) return "0.00";

      const salarioTipo = this.datosEmpleado.salario_tipo;

      if (salarioTipo === "Salario" || salarioTipo === "Salario más Comisión") {
        const montoBase = parseFloat(this.datosEmpleado.salario_monto || 0);
        const periodo = (this.datosEmpleado.salario_periodo || 'mensual').toLowerCase();
        
        let divisor = 1;
        if (periodo === 'semanal') {
          divisor = 4;
        } else if (periodo === 'quincenal') {
          divisor = 2;
        }
        
        const montoPeriodo = montoBase / divisor;
        return montoPeriodo.toFixed(2);
      }

      return "0.00";
    },

    debesMostrarSalario() {
      if (!this.datosEmpleado) return false;
      const tipo = this.datosEmpleado.salario_tipo;
      return tipo === "Salario" || tipo === "Salario más Comisión";
    },

    debesMostrarComisiones() {
      if (!this.datosEmpleado) return true;
      const tipo = this.datosEmpleado.salario_tipo;
      return tipo === "Comisión" || tipo === "Salario más Comisión";
    },

    tipoCompensacion() {
      if (!this.datosEmpleado) return null;

      const tipo = this.datosEmpleado.salario_tipo;

      const config = {
        'Salario': { texto: 'Salario Fijo', variant: 'warning', icono: '💰' },
        'Comisión': { texto: 'Por Comisión', variant: 'success', icono: '📈' },
        'Salario más Comisión': { texto: 'Salario + Comisión', variant: 'info', icono: '💼' }
      };

      return config[tipo] || null;
    },

    diferencia() {
      return this.totalTerminado - this.totalPendiente;
    },

    totalPendiente() {
      let comision = 0;
      if (this.departamento === "Diseño") {
        comision = this.ordenesPendientes.reduce((total, orden) => {
          if (orden.progreso !== "terminada") {
            total += parseFloat(orden.monto_pago || 0);
          }
          return total;
        }, 0);
      } else if (
        this.departamento === "Comercialización" ||
        this.departamento === "Administración"
      ) {
        comision = this.ordenesPendientes.reduce((total, orden) => {
          total += parseFloat(orden.monto_pago || 0);
          return total;
        }, 0);
      } else {
        var total = 0;
        this.ordenesPendientes.forEach((orden) => {
          if (orden.progreso !== "terminada" && orden.fecha_terminado === null) {
            total += this.montoComisionEmpelado(
              orden.comision_tipo,
              orden.total_comision_variable,
              orden.total_comision_fija
            );
          }
        });
        comision = total;
      }

      return comision.toFixed(2);
    },

    totalComisionesPendientes() {
      let comision = 0;
      if (this.departamento === "Diseño") {
        comision = this.ordenesPendientes.reduce((total, orden) => {
          if (orden.progreso !== "terminada") {
            total += parseFloat(orden.monto_pago || 0);
          }
          return total;
        }, 0);
      } else if (
        this.departamento === "Comercialización" ||
        this.departamento === "Administración"
      ) {
        comision = this.ordenesPendientes.reduce((total, orden) => {
          total += parseFloat(orden.monto_pago || 0);
          return total;
        }, 0);
      } else {
        var total = 0;
        this.ordenesPendientes.forEach((orden) => {
          if (orden.progreso !== "terminada" && orden.fecha_terminado === null) {
            total += this.montoComisionEmpelado(
              orden.comision_tipo,
              orden.total_comision_variable,
              orden.total_comision_fija
            );
          }
        });
        comision = total;
      }
      return comision.toFixed(2);
    },

    total() {
      let total = 0;
      
      if (this.debesMostrarSalario) {
        total += parseFloat(this.salarioFijo);
      }
      
      if (this.debesMostrarComisiones) {
        total += parseFloat(this.totalComisionesTerminadas) + parseFloat(this.totalComisionesPendientes);
      }
      
      return total.toFixed(2);
    },

    trabajosTerminados() {
      if (this.departamento === "Diseño") {
        return this.ordenesTerminadas;
      } else if (
        this.departamento === "Comercialización" ||
        this.departamento === "Administración"
      ) {
        return this.ordenesTerminadas;
      } else {
        return this.ordenesTerminadas
          .filter((el) => el.progreso === "terminada")
          .map((obj) => ({
            ...obj,
            calculo_pago: obj.monto_pago,
          }));
      }
    },
  },

  methods: {
    tiempoTranscurridoEnMinutos(fecha_inicio, fecha_terminado) {
      const fechaInicioStr = fecha_inicio;
      const fechaTerminadoStr = fecha_terminado;

      if (!fechaInicioStr || !fechaTerminadoStr) {
        return "0.00";
      }

      const fechaInicio = new Date(typeof fechaInicioStr === 'string' && !fechaInicioStr.includes('T') ? fechaInicioStr.replace(' ', 'T') : fechaInicioStr);
      const fechaTerminado = new Date(typeof fechaTerminadoStr === 'string' && !fechaTerminadoStr.includes('T') ? fechaTerminadoStr.replace(' ', 'T') : fechaTerminadoStr);

      const diferenciaMs = fechaTerminado.getTime() - fechaInicio.getTime();
      const diferenciaMinutos = diferenciaMs / (1000 * 60);

      return isNaN(diferenciaMinutos) || diferenciaMinutos < 0 ? "0.00" : diferenciaMinutos.toFixed(2);
    },
    montoComisionEmpelado(
      comision_tipo,
      total_comision_variable,
      total_comision_fija
    ) {
      let comision = 0;
      if (comision_tipo === "fija") {
        comision = total_comision_fija;
      } else {
        comision = total_comision_variable;
      }

      return comision;
    },

    trabajosPendientes() {
      if (this.departamento === "Diseño") {
        return this.ordenesPendientes.filter(
          (el) => el.fecha_terminado === null
        );
      } else {
        return this.ordenesPendientes.filter(
          (el) => el.fecha_terminado === null
        );
      }
    },

    async getOrdenesAsignadas(tipo = "empleado") {
      let url = "";
      if (tipo === "disenador") {
        url = `${this.$config.API}/reportes/resumen/disenadores/${this.emp}/${this.departamentoId}`;
      } else {
        url = `${this.$config.API}/reportes/resumen/empleados/${this.emp}/${this.departamentoId}`;
      }

      await this.$axios.get(url).then((resp) => {
        this.ordenes = resp.data.ordenes;
        this.ordenesSemana = resp.data.ordenes_semana;
        this.ordenesTerminadas = resp.data.ordenes_terminadas;
        this.ordenesPendientes = resp.data.ordenes_pendientes;
        this.datosEmpleado = resp.data.datos_empleado;
        this.overlay = false;
      });
    },
  },

  mounted() {
    let tipo = "";

    if (this.departamento === "Diseño") {
      tipo = "disenador";
    } else {
      tipo = "empleado";
    }

    this.getOrdenesAsignadas(tipo);
  },

  props: ["emp", "departamento", "departamentoId"],
};
</script>