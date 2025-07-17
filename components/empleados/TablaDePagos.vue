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
      departamento: this.$store.state.login.dataUser.departamento,
    };
  },

  computed: {
    horasTrabajadas() {
      return null;
      let totalHoras = 0;

      if (
        this.$store.state.login.dataUser.departamento != "Comercialización" ||
        this.$store.state.login.dataUser.departamento != "Administración"
      ) {
        const horasFiltradas = this.ordenesSemana.filter(
          (el) => el.tiempo_transcurrido != null
        );
        for (const orden of horasFiltradas) {
          const fechaInicio = new Date(orden.fecha_inicio_ts);
          const fechaTerminado = new Date(orden.fecha_terminado_ts);

          let horasTranscurridas = (fechaTerminado - fechaInicio) / 1000 / 3600; // Diferencia en horas
          console.group("horas");
          console.log(`fechaTerminado`, orden.fecha_inicio_ts, fechaTerminado);
          console.log(`fechaInicio`, orden.fecha_terminado_ts, fechaInicio);
          console.log(`horasTranscurridas`, horasTranscurridas);
          console.groupEnd();

          // Verifica si las fechas son diferentes y calcula las horas según el día de la semana
          if (fechaInicio.toDateString() !== fechaTerminado.toDateString()) {
            // Si la fecha de inicio es un sábado o domingo, resta 24 horas
            if (fechaInicio.getDay() === 0 || fechaInicio.getDay() === 6) {
              horasTranscurridas -= 24;
            } else {
              // De lo contrario, resta 16 horas por día de difereordenesPendientesncia
              const diasDiferencia =
                (fechaTerminado - fechaInicio) / (24 * 3600 * 1000);
              horasTranscurridas -= 16 * diasDiferencia;
            }
          }

          // Agrega las horas calculadas al total
          totalHoras += horasTranscurridas;
        }
      }
      // return horasFiltradas
      return totalHoras.toFixed(2); // Devuelve el total de horas redondeado a 2 decimales
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
          /* {
                        key: "fecha_de_pago",
                        label: "FECHA",
                        class: "text-center",
                    }, 
                    {
                        key: "tipo_de_pago",
                        label: "TIPO",
                        class: "text-center",
                    },*/
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
          /* {
            key: "cantidad",
            label: "CANTIDAD",
            class: "text-center",
          }, */
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
          /* {
            key: "cantidad",
            label: "CANTIDAD",
            class: "text-center",
          }, */
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
            key: "unidades",
            label: "UND",
            class: "text-center",
          },
          {
            key: "product",
            label: "PROD",
          },
          /* {
            key: 'hora_inicio',
            label: 'INICIO',
          },
          {
            key: 'hora_terminado',
            label: 'FIN',
          },
          {
            key: 'hora_terminado',
            label: 'FIN',
          },
          {
            key: 'tiempo_transcurrido',
            label: 'TIEMPO',
          },*/
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
            key: "unidades",
            label: "UND",
            class: "text-center",
          },
          {
            key: "product",
            label: "PROD",
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
      /* if (this.departamento === "Diseño") {
        comision = this.ordenesTerminadas.reduce((total, orden) => {
          if (orden.estatus === "Aprobado") {
            total += parseFloat(orden.monto_pago);
          }
          return total;
        }, 0);
      } else  */ if (
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
      let comision = 0;
      /* if (this.departamento === "Diseño") {
                comision = this.ordenesPendientes.reduce((total, orden) => {
                    if (orden.fecha_terminado === null) {
                        total += parseFloat(orden.monto_pago);
                    }
                    return total;
                }, 0);
            } else if (
                this.departamento === "Comercialización" ||
                this.departamento === "Administración"
            ) {
                comision = this.ordenesPendientes.reduce((total, orden) => {
                    total += parseFloat(orden.monto_pago);
                    return total;
                }, 0);
            } else {
                comision = this.ordenesPendientes.reduce((total, orden) => {
                    if (orden.fecha_terminado === null) {
                        // total += parseFloat(orden.monto_pago);
                        this.montoComisionEmpelado(
                            orden.comision_tipo,
                            orden.total_comision_variable,
                            orden.total_comision_fija
                        );
                    }
                    return total;
                }, 0);
            } */
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

      /* comision = this.ordenesPendientes.reduce((total, orden) => {
                total = 0;
                if (orden.fecha_terminado === null) {
                    total += this.montoComisionEmpelado(
                        orden.comision_tipo,
                        orden.total_comision_variable,
                        orden.total_comision_fija
                    );
                }
                return total;
            }, 0); */

      return total.toFixed(2);
    },
    total() {
      const tot =
        parseFloat(this.totalPendiente) + parseFloat(this.totalTerminado);
      return tot.toFixed(2);
    },

    trabajosTerminados() {
      if (this.departamento === "Diseño") {
        // return this.ordenesTerminadas.filter((el) => el.estatus === "Aprobado");
        return this.ordenesTerminadas;
      } else if (
        this.departamento === "Comercialización" ||
        this.departamento === "Administración"
      ) {
        // return this.ordenesTerminadas.filter((el) => el.progreso === 'terminada')
        return this.ordenesTerminadas;
      } else {
        // return this.ordenesTerminadas
        return this.ordenesTerminadas
          .filter((el) => el.progreso === "terminada")
          .map((obj) => ({
            ...obj,
            calculo_pago: obj.nomto_pago,
          }));
      }
    },

    /* trabajosTerminados() {
            if (this.departamento === "Diseño") {
                return this.ordenesTerminadas.filter(
                    (el) => el.estatus === "Aprobado"
                );
            } else if (
                this.departamento === "Comercialización" ||
                this.departamento === "Administración"
            ) {
                // return this.ordenesTerminadas.filter((el) => el.progreso === 'terminada')
                return this.ordenesTerminadas;
            } else {
                // return this.ordenesTerminadas
                return this.ordenesTerminadas
                    .filter((el) => el.progreso === "terminada")
                    .map((obj) => ({
                        ...obj,
                        calculo_pago: obj.nomto_pago,
                    }));
            }
        }, */
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
      // return null;
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
      // tipo puede ser 'empleado' o 'disenador'
      let url = "";
      if (tipo === "disenador") {
        url = `${this.$config.API}/reportes/resumen/disenadores/${this.emp}/${this.$store.state.login.currentDepartamentId}`;
      } else {
        url = `${this.$config.API}/reportes/resumen/empleados/${this.emp}/${this.$store.state.login.currentDepartamentId}`;
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

    if (this.$store.state.login.currentDepartament === "Diseño") {
      tipo = "disenador";
    } else {
      tipo = "empleado";
    }

    this.getOrdenesAsignadas(tipo);
  },

  props: ["emp"],
};
</script>
