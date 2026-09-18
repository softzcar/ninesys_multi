<template>
  <div class="pagos-v2-container">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <b-overlay :show="overlay" spinner-small>
      <h3 v-if="idModuloUsuario !== 2" class="pagos-title">RELACIÓN DE PAGOS</h3>

      <b-badge v-if="tipoCompensacion" class="comp-type-pill mb-3" :class="'variant-' + tipoCompensacion.variant">
        {{ tipoCompensacion.icono }} {{ tipoCompensacion.texto }}
      </b-badge>

      <div class="summary-panel mb-4">
        <b-row class="no-gutters">
          <b-col
            v-for="stat in summaryStats"
            :key="stat.key"
            class="summary-box"
            :class="{ 'summary-box-total': stat.key === 'total' }"
          >
            <div class="summary-num" :class="stat.colorClass">{{ stat.value }}</div>
            <div class="summary-label">{{ stat.label }}</div>
          </b-col>
        </b-row>
      </div>

      <b-tabs class="pagos-tabs">
        <b-tab v-if="idModuloUsuario !== 2" title="PENDIENTES" active>
          <b-alert v-if="trabajosPendientes().length === 0" show variant="info" class="text-center py-3">
            No tienes trabajos pendientes
          </b-alert>

          <div
            v-for="item in trabajosPendientes()"
            :key="'pend-' + item.id_lote_detalles"
            class="modern-task-card"
          >
            <div class="card-main-row">
              <div class="badge-type-box type-ord">
                <span class="type-text">ORD</span>
                <linkSearch :id="item.id_orden" class="type-id-link" />
              </div>
              <div class="card-info-col">
                <div v-if="campoProducto(fields.pendientes)" class="info-top-row">
                  <span class="card-titular">
                    {{ item[campoProducto(fields.pendientes).key] }}
                  </span>
                </div>
                <div class="info-bottom-row">
                  <span
                    v-for="field in camposDetalle(fields.pendientes)"
                    :key="field.key"
                    class="detail-chip"
                    :class="{ 'detail-chip-money': field.key === 'calculo_pago' }"
                  >
                    <template v-if="field.key === 'calculo_pago'">
                      {{ valorCampoPendiente(item, field) }}
                    </template>
                    <template v-else>
                      {{ field.label }}: {{ valorCampoPendiente(item, field) }}
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </b-tab>

        <b-tab title="TERMINADOS">
          <b-alert v-if="trabajosTerminados.length === 0" show variant="info" class="text-center py-3">
            No tienes trabajos terminados
          </b-alert>

          <div
            v-for="item in trabajosTerminados"
            :key="'term-' + item.id_lote_detalles"
            class="modern-task-card"
          >
            <div class="card-main-row">
              <div class="badge-type-box type-ord">
                <span class="type-text">ORD</span>
                <linkSearch :id="item.id_orden" class="type-id-link" />
              </div>
              <div class="card-info-col">
                <div v-if="campoProducto(fields.terminadas)" class="info-top-row">
                  <span
                    class="card-titular"
                    :class="{ 'text-capitalize': campoProducto(fields.terminadas).key === 'producto' }"
                  >
                    {{ item[campoProducto(fields.terminadas).key] }}
                  </span>
                  <span class="status-pill status-terminado">Terminado</span>
                </div>
                <div class="info-bottom-row">
                  <span
                    v-for="field in camposDetalle(fields.terminadas)"
                    :key="field.key"
                    class="detail-chip"
                    :class="{ 'detail-chip-money': field.key === 'calculo_pago' }"
                  >
                    <template v-if="field.key === 'calculo_pago'">
                      {{ valorCampoTerminado(item, field) }}
                    </template>
                    <template v-else>
                      {{ field.label }}: {{ valorCampoTerminado(item, field) }}
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </b-overlay>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import mixinTime from "~/mixins/mixin-time.js";
import accessModuleMixin from "~/mixins/mixin-login.js";

export default {
  mixins: [mixin, mixinTime, accessModuleMixin],

  data() {
    return {
      overlay: true,
      ordenes: [],
      ordenesSemana: [],
      ordenesTerminadas: [],
      ordenesPendientes: [],
      datosEmpleado: null, // salario_tipo, salario_monto, salario_periodo, comision, comision_tipo
    };
  },

  computed: {
    departamento() {
      return this.$store.state.login.currentDepartament;
    },
    // Nuevo computed adicional (2026-09-14): id_modulo del departamento activo
    // del usuario logueado. Se usa en las comparaciones contra 'Administración'
    // (1), 'Comercialización' (2) y 'Diseño' (3) de este archivo en vez del
    // nombre de texto, que es editable y frágil. El computed departamento()
    // de arriba se deja intacto porque otras partes del código lo siguen
    // comparando por texto.
    idModuloUsuario() {
      return this.accessModule.accessData.id_modulo;
    },
    horasTrabajadas() {
      let totalSegundos = 0;

      // Excluir a los departamentos que no registran tiempo por tarea.
      if (
        this.idModuloUsuario !== 2 &&
        this.idModuloUsuario !== 1
      ) {
        if (Array.isArray(this.ordenesSemana)) {
          const dataEmpresa = this.$store.state.login.dataEmpresa;
          // dataEmpresa arranca como `[]` (valor por defecto del store,
          // ver store/login.js) hasta que el login termina de restaurarla
          // (vuex-persist) o de recargarla -- sin esta guarda, si este
          // computed corría ANTES de que dataEmpresa estuviera lista, caía
          // directo a la rama "sin horario configurado" de abajo (tiempo
          // crudo sin acotar), mostrando un total muy distinto (y no
          // determinístico entre recargas de la página) al valor real
          // acotado por horario laboral -- hallazgo real 2026-09-18
          // (empleado danuill, Corte: 3554h en una recarga, 5334h en otra,
          // con los mismos datos crudos verificados sin cambios en la BD).
          const dataEmpresaLista = dataEmpresa && !Array.isArray(dataEmpresa);

          if (dataEmpresaLista) {
            let horarioLaboral = dataEmpresa.horario_laboral;
            if (typeof horarioLaboral === "string") {
              try {
                horarioLaboral = JSON.parse(horarioLaboral);
              } catch (e) {
                horarioLaboral = null;
              }
            }

            this.ordenesSemana.forEach((orden) => {
              if (!orden.fecha_inicio || !orden.fecha_terminado) return;

              if (horarioLaboral) {
                // Tiempo efectivo dentro del horario laboral configurado --
                // antes se sumaba la diferencia de calendario cruda entre
                // fecha_inicio y fecha_terminado (tiempo_transcurrido, calculado
                // en el backend), lo que mostraba cientos de "horas" cuando una
                // tarea quedaba abierta varios días antes de cerrarse (mismo
                // patrón que el bug de "983% eficiencia" del dashboard).
                const tarea = {
                  fecha_inicio: new Date(orden.fecha_inicio.replace(" ", "T")),
                  fecha_fin: new Date(orden.fecha_terminado.replace(" ", "T")),
                };
                totalSegundos +=
                  this.calcularTiempoTrabajoIndividual(tarea, [], horarioLaboral) / 1000;
              } else if (
                orden.tiempo_transcurrido != null &&
                !isNaN(parseFloat(orden.tiempo_transcurrido))
              ) {
                // Fallback SOLO cuando la empresa ya está cargada y
                // genuinamente no tiene horario laboral configurado -- nunca
                // como sustituto de "todavía no cargó".
                totalSegundos += parseFloat(orden.tiempo_transcurrido);
              }
            });
          } else {
            // dataEmpresa aún no está lista -- devolver null (en vez de "0.00"
            // o del fallback crudo) para que el panel de resumen pueda
            // distinguir "todavía cargando" de "cero horas reales" y evitar
            // mostrar un número inflado que luego cambia solo.
            return null;
          }
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
      if (this.idModuloUsuario === 2) {
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
      } else if (this.idModuloUsuario === 3) {
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
            label: "PRODUCTO",
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
        ];

        // Solo agregar columna de $ si el empleado gana comisiones
        if (this.debesMostrarComisiones) {
          fields.pendientes.push({
            key: "calculo_pago",
            label: "$",
            class: "text-right",
            thClass: "text-center",
            tdClass: "pr-4",
          });
        }
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
            label: "PRODUCTO",
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
        ];

        // Solo agregar columna de $ si el empleado gana comisiones
        if (this.debesMostrarComisiones) {
          fields.terminadas.push({
            key: "calculo_pago",
            label: "$",
            class: "text-right",
            thClass: "text-center",
            tdClass: "pr-4",
          });
        }
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
          this.idModuloUsuario === 2 ||
          this.idModuloUsuario === 1
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

      totalComisionesTerminadas() {
        let comision = 0;
        if (
          this.idModuloUsuario === 2 ||
          this.idModuloUsuario === 1
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

      salarioFijo() {
        if (!this.datosEmpleado) return "0.00";

        const salarioTipo = this.datosEmpleado.salario_tipo;

        // Solo mostrar salario si tiene configurado salario
        if (salarioTipo === "Salario" || salarioTipo === "Salario más Comisión") {
          const montoBase = parseFloat(this.datosEmpleado.salario_monto || 0);
          const periodo = (this.datosEmpleado.salario_periodo || 'mensual').toLowerCase();

          // Dividir el salario mensual según el periodo configurado
          let divisor = 1; // Mensual por defecto
          if (periodo === 'semanal') {
            divisor = 4; // 4 semanas en un mes
          } else if (periodo === 'quincenal') {
            divisor = 2; // 2 quincenas en un mes
          }

          const montoPeriodo = montoBase / divisor;
          return montoPeriodo.toFixed(2);
        }

        return "0.00";
      },

      // Determinar si se debe mostrar el salario según el tipo de compensación
      debesMostrarSalario() {
        if (!this.datosEmpleado) return false;
        const tipo = this.datosEmpleado.salario_tipo;
        return tipo === "Salario" || tipo === "Salario más Comisión";
      },

      // Determinar si se deben mostrar las comisiones según el tipo de compensación
      debesMostrarComisiones() {
        if (!this.datosEmpleado) return true; // Por defecto mostrar si no hay datos
        const tipo = this.datosEmpleado.salario_tipo;
        return tipo === "Comisión" || tipo === "Salario más Comisión";
      },

      // Información del tipo de compensación para el badge
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
        if (this.idModuloUsuario === 3) {
          comision = this.ordenesPendientes.reduce((total, orden) => {
            if (orden.progreso !== "terminada") {
              total += parseFloat(orden.monto_pago || 0);
            }
            return total;
          }, 0);
        } else if (
          this.idModuloUsuario === 2 ||
          this.idModuloUsuario === 1
        ) {
          comision = this.ordenesPendientes.reduce((total, orden) => {
            total += parseFloat(orden.monto_pago || 0);
            return total;
          }, 0);
        } else {
          var total = 0;
          this.ordenesPendientes.forEach((orden) => {
            if (orden.progreso !== "terminada") {
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
        if (this.idModuloUsuario === 3) {
          comision = this.ordenesPendientes.reduce((total, orden) => {
            if (orden.progreso !== "terminada") {
              total += parseFloat(orden.monto_pago || 0);
            }
            return total;
          }, 0);
        } else if (
          this.idModuloUsuario === 2 ||
          this.idModuloUsuario === 1
        ) {
          comision = this.ordenesPendientes.reduce((total, orden) => {
            total += parseFloat(orden.monto_pago || 0);
            return total;
          }, 0);
        } else {
          var total = 0;
          this.ordenesPendientes.forEach((orden) => {
            if (orden.progreso !== "terminada") {
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

        // Agregar salario si el empleado tiene salario configurado
        if (this.debesMostrarSalario) {
          total += parseFloat(this.salarioFijo);
        }

        // Agregar comisiones si el empleado tiene comisiones configuradas
        if (this.debesMostrarComisiones) {
          total += parseFloat(this.totalComisionesTerminadas) + parseFloat(this.totalComisionesPendientes);
        }

        return total.toFixed(2);
      },

      trabajosTerminados() {
        if (this.idModuloUsuario === 3) {
          // return this.ordenesTerminadas.filter((el) => el.estatus === "Aprobado");
          return this.ordenesTerminadas;
        } else if (
          this.idModuloUsuario === 2 ||
          this.idModuloUsuario === 1
        ) {
          // return this.ordenesTerminadas.filter((el) => el.progreso === 'terminada')
          return this.ordenesTerminadas;
        } else {
          // return this.ordenesTerminadas
          // return this.ordenesTerminadas
          return this.ordenesTerminadas
            .filter((el) => el.progreso === "terminada")
            .map((obj) => ({
              ...obj,
              calculo_pago: obj.monto_pago,
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

      // ---------------------------------------------------------------
      // Computed puramente de presentación (rediseño visual 2026-09-18):
      // arma la lista de "stats" del panel de resumen a partir de los
      // computed de negocio ya existentes arriba -- no agrega ninguna
      // fórmula nueva, solo empaqueta sus resultados para poder iterarlos
      // con v-for y lograr el ancho variable (2 a 5 cajas según el rol)
      // sin duplicar bloques v-if en el template.
      // ---------------------------------------------------------------
      summaryStats() {
        // horasTrabajadas() devuelve null mientras dataEmpresa (horario
        // laboral) todavía no cargó -- mostrar "…" en vez de "null h" o de
        // un número provisional incorrecto; se actualiza solo en cuanto el
        // computed se reevalúe con los datos ya listos.
        const stats = [
          {
            key: "horas",
            label: "Horas Trabajadas",
            value: this.horasTrabajadas === null ? "…" : `${this.horasTrabajadas} h`,
          },
        ];

        if (this.debesMostrarSalario && parseFloat(this.salarioFijo) > 0) {
          stats.push({
            key: "salario",
            label: `Salario Pendiente (${(this.datosEmpleado?.salario_periodo || "semanal").toUpperCase()})`,
            value: `$${this.salarioFijo}`,
            colorClass: "color-pending",
          });
        }

        if (this.debesMostrarComisiones) {
          stats.push({
            key: "com-term",
            label: "Comisiones Terminadas",
            value: `$${this.totalComisionesTerminadas}`,
            colorClass: "color-process",
          });
          stats.push({
            key: "com-pend",
            label: "Comisiones Pendientes",
            value: `$${this.totalComisionesPendientes}`,
            colorClass: "color-urgent",
          });
        }

        stats.push({ key: "total", label: "Total", value: `$${this.total}` });

        return stats;
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
        // return null;
        if (this.idModuloUsuario === 3) {
          return this.ordenesPendientes.filter(
            (el) => el.progreso !== "terminada"
          );
        } else {
          return this.ordenesPendientes.filter(
            (el) => el.progreso !== "terminada"
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
          this.datosEmpleado = resp.data.datos_empleado; // Capturar datos salariales del empleado
          this.overlay = false;
        });
      },

      // ---------------------------------------------------------------
      // Helpers de presentación del rediseño visual (2026-09-18). No
      // cambian ningún cálculo de negocio -- solo deciden qué campo de
      // `fields.pendientes`/`fields.terminadas` (ya definidos arriba,
      // fuente de verdad de qué columnas aplican a cada idModuloUsuario)
      // se muestra como texto "titular" de la tarjeta (producto) y cómo
      // se formatea cada campo restante como chip, preservando EXACTO el
      // mismo formato que aplicaban los slots #cell(...) de las tablas
      // que reemplazan (incluidas sus inconsistencias existentes, como
      // que el campo "monto_pago" de Diseño-pendientes no llevaba
      // símbolo "$" y que "product" -a diferencia de "producto"- nunca
      // se capitalizaba -- no es parte de este cambio corregir eso).
      // ---------------------------------------------------------------
      esCampoProducto(key) {
        return key === "product" || key === "producto";
      },
      campoProducto(fieldsArr) {
        return fieldsArr.find((f) => this.esCampoProducto(f.key)) || null;
      },
      camposDetalle(fieldsArr) {
        return fieldsArr.filter(
          (f) => f.key !== "id_orden" && !this.esCampoProducto(f.key)
        );
      },
      valorCampoPendiente(item, field) {
        switch (field.key) {
          case "calculo_pago":
            return `$${this.montoComisionEmpelado(item.comision_tipo, item.total_comision_variable, item.total_comision_fija)}`;
          default:
            return item[field.key];
        }
      },
      valorCampoTerminado(item, field) {
        switch (field.key) {
          case "calculo_pago":
            return `$${item.monto_pago}`;
          case "rendimiento":
            return `${this.tiempoTranscurridoEnMinutos(item.fecha_inicio, item.fecha_terminado)} min`;
          case "fecha_inicio":
            return this.formatTimestamp(item.fecha_inicio);
          case "fecha_terminado":
            return this.formatTimestamp(item.fecha_terminado);
          default:
            return item[field.key];
        }
      },
    },

    mounted() {
      let tipo = "";

      if (this.idModuloUsuario === 3) {
        tipo = "disenador";
      } else {
        tipo = "empleado";
      }

      this.getOrdenesAsignadas(tipo);
    },

    props: ["emp"],
  };
</script>

<style scoped>
/* ================================================================= */
/* Rediseño visual (2026-09-18) -- mismo lenguaje visual que          */
/* /empleados/dashboard (components/empleados/SseOrdenesAsignadasV5.vue).*/
/* Clases copiadas/adaptadas de ese componente; scoped a propósito     */
/* (ese archivo usa CSS global no-scoped) para que nunca colisionen    */
/* aunque ambas vistas convivan en la misma sesión SPA.                */
/* ================================================================= */

.pagos-v2-container {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #2b303a;
  background-color: #f7f9fc;
  padding: 15px;
  border-radius: 12px;
}

.pagos-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 10px;
}

/* Pill de tipo de compensación (Salario / Comisión / Salario + Comisión) */
.comp-type-pill {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}
.comp-type-pill.variant-warning { background-color: #feebc8 !important; color: #9c4221 !important; }
.comp-type-pill.variant-success { background-color: #c6f6d5 !important; color: #22543d !important; }
.comp-type-pill.variant-info { background-color: #bee3f8 !important; color: #2b6cb0 !important; }

/* Panel de resumen */
.summary-panel {
  background-color: #fff;
  border-radius: 16px;
  padding: 15px 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid #edf2f7;
}
.summary-box {
  border-right: 1px solid #f0f4f8;
  text-align: center;
  padding: 8px 4px;
}
.summary-box:last-child { border-right: none; }
.summary-box-total {
  border-left: 3px solid #0b7285;
  background: linear-gradient(180deg, rgba(11, 114, 133, 0.05), transparent);
  border-radius: 0 8px 8px 0;
}
.summary-num { font-size: 1.15rem; font-weight: 800; color: #2d3748; }
.summary-num.color-process { color: #1c7ed6; }
.summary-num.color-pending { color: #2b8a3e; }
.summary-num.color-urgent { color: #c92a2a; }
.summary-label {
  font-size: 0.65rem;
  color: #718096;
  text-transform: uppercase;
  font-weight: 700;
  margin-top: 3px;
  letter-spacing: 0.5px;
}

/* Tabs (b-tabs) restyled -- los nodos internos no llevan el atributo
   scoped del padre, hace falta ::v-deep para alcanzarlos. */
.pagos-tabs ::v-deep .nav-tabs {
  background-color: #edf2f7;
  padding: 4px;
  border-radius: 10px;
  border: none;
  gap: 4px;
}
.pagos-tabs ::v-deep .nav-item { margin-bottom: 0; }
.pagos-tabs ::v-deep .nav-link {
  border: none;
  background: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: #4a5568;
  border-radius: 8px;
  padding: 8px 14px;
  transition: all 0.2s ease;
}
.pagos-tabs ::v-deep .nav-link.active {
  background-color: #fff;
  color: #1a202c;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.pagos-tabs ::v-deep .tab-content { margin-top: 15px; }

/* Tarjeta de trabajo */
.modern-task-card {
  background-color: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 12px;
  margin-bottom: 10px;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.01);
}
.modern-task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border-color: #cbd5e0;
}
.card-main-row { display: flex; align-items: center; width: 100%; }

.badge-type-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 6px 12px;
  text-align: center;
  min-width: 65px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
}
.type-ord { background-color: #e6f7ff; border: 1px solid #bae7ff; }
.type-ord .type-text { color: #0050b3; font-size: 0.65rem; font-weight: 800; }

/* Restyle de linkSearch sin tocar el componente compartido (60+ usos
   en el resto del sistema) -- mismo patrón ya usado en
   SseOrdenesAsignadasV5.vue. */
.type-id-link ::v-deep button,
.type-id-link ::v-deep .btn {
  background: none !important;
  border: none !important;
  padding: 0 !important;
  font-size: 1rem !important;
  font-weight: 800 !important;
  color: #2d3748 !important;
  box-shadow: none !important;
  margin-top: 2px;
}

.card-info-col {
  flex: 1;
  padding-left: 12px;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.info-top-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}
.card-titular {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a202c;
}

.info-bottom-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-chip {
  background-color: #f7fafc;
  border: 1px solid #edf2f7;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #4a5568;
}
.detail-chip-money {
  margin-left: auto;
  background-color: #f0fff4;
  border-color: #c6f6d5;
  color: #22543d;
  font-size: 0.9rem;
  font-weight: 800;
}

.status-pill {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
  display: inline-block;
}
.status-terminado { background-color: #c6f6d5; color: #22543d; }
</style>
