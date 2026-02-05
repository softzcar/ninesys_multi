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
            <b-list-group-item variant="info">
              <h3>{{ horasTrabajadas }} HORAS</h3>
            </b-list-group-item>
            <b-list-group-item variant="success"><strong>TERMINADO</strong> $
              {{ totalTerminado }}</b-list-group-item>
            <b-list-group-item variant="danger"><strong>PENDIENTE</strong> $
              {{ totalPendiente }}</b-list-group-item>
            <b-list-group-item variant="primary"><strong>TOTAL</strong> $ {{ total }}</b-list-group-item>
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
          total += parseFloat(orden.monto_pago);
          return total;
        }, 0);
      } else {
        comision = this.ordenesTerminadas.reduce((total, orden) => {
          if (orden.fecha_terminado !== null) {
            total += parseFloat(orden.monto_pago);
          }
          return total;
        }, 0);
      }

      return comision.toFixed(2);
    },

    diferencia() {
      return this.totalTerminado - this.totalPendiente;
    },

    totalPendiente() {
      var total = 0;
      this.ordenesPendientes.forEach((orden) => {
        if (orden.fecha_terminado === null) {
          total += this.montoComisionEmpelado(
            orden.comision_tipo,
            orden.total_comision_variable,
            orden.total_comision_fija
          );
        }
      });

      return total.toFixed(2);
    },
    total() {
      const tot =
        parseFloat(this.totalPendiente) + parseFloat(this.totalTerminado);
      return tot.toFixed(2);
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
        return 0; // O algún otro valor que indique que las fechas no están definidas
      }

      const fechaInicio = new Date(fechaInicioStr);
      const fechaTerminado = new Date(fechaTerminadoStr);

      // Calcular la diferencia en milisegundos
      const diferenciaMs = fechaTerminado.getTime() - fechaInicio.getTime();

      // Convertir milisegundos a minutos
      const diferenciaMinutos = diferenciaMs / (1000 * 60);

      return diferenciaMinutos.toFixed(2);
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