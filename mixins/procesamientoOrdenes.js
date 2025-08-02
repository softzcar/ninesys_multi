// mixins/procesamientoOrdenes.js

export default {
  methods: {
    // =================================================================
    // ==                 FUNCIÓN PRINCIPAL PÚBLICA                   ==
    // =================================================================
    generarPlanProduccionCompleto(ordenes, horarioLaboral) {
      const fechaDeCalculo = new Date();

      // Mapear las propiedades de los objetos 'item' a las que espera procesarColaProduccion
      const mappedOrdenes = ordenes.map(item => ({
        id_orden: item.orden, // Mapear 'orden' a 'id_orden'
        status: item.estatus, // Mapear 'estatus' a 'status'
        nombre_departamento: item.paso, // Mapear 'paso' a 'nombre_departamento'
        fecha_inicio: item.inicio, // Mapear 'inicio' a 'fecha_inicio'
        fecha_terminado: item.entrega, // Mapear 'entrega' a 'fecha_terminado'
        orden_fila_orden: item.orden_fila, // Mapear 'orden_fila' a 'orden_fila_orden'
        // tiempo_total_orden_depto: item.tiempo_total_orden_depto || 0, // Si no existe, usar 0
        // Otras propiedades que puedan ser necesarias para procesarColaProduccion
        // y que provengan del 'item' original
        ...item // Mantener el resto de las propiedades del item original
      }));

      const tareasProcesadas = this.procesarColaProduccion(mappedOrdenes, horarioLaboral, fechaDeCalculo);

      if (!tareasProcesadas || !tareasProcesadas.length) return [];

      const ordenesAgrupadas = tareasProcesadas.reduce((acc, tarea) => {
        const id = tarea.id_orden; // Ahora 'id_orden' debería existir
        if (!acc[id]) {
          acc[id] = {
            id_orden: id,
            prioridad: tarea.orden_fila_orden, // Ahora 'orden_fila_orden' debería existir
            fecha_entrega_orden: this.formatDate(tarea.fecha_entrega_orden), // Usar la fecha de entrega original si no hay otra
            fecha_estimada_entrega_formateada: null,
            tiempo_total_estimado_segundos: 0,
            tiempo_restante_segundos: 0,
            tiempo_neto_orden_formateado: '',
            tiempo_pendiente_orden_formateado: '',
            tareas: []
          };
        }
        acc[id].tiempo_total_estimado_segundos += (typeof tarea.tiempo_total_orden_depto === 'number' ? tarea.tiempo_total_orden_depto : 0);
        if (!tarea.fecha_terminado) acc[id].tiempo_restante_segundos += (typeof tarea.tiempo_total_orden_depto === 'number' ? tarea.tiempo_total_orden_depto : 0);

        acc[id].tareas.push(tarea);
        return acc;
      }, {});

      let resultadoFinal = Object.values(ordenesAgrupadas);
      resultadoFinal.forEach(orden => {
        orden.tiempo_neto_orden_formateado = this.formatearTiempo(orden.tiempo_total_estimado_segundos * 1000);
        orden.tiempo_pendiente_orden_formateado = this.formatearTiempo(orden.tiempo_restante_segundos * 1000);

        const { variant, variant_text } = this._determinarVarianteOrden(orden);
        orden.variant = variant;
        orden.variant_text = variant_text;

        if (orden.tareas && orden.tareas.length > 0) {
          const ultimaTarea = orden.tareas[orden.tareas.length - 1];
          orden.fecha_estimada_entrega_formateada = ultimaTarea.fecha_estimada_fin_formateada;
        }
      });

      resultadoFinal.sort((a, b) => a.prioridad - b.prioridad);
      return resultadoFinal;
    },

    /**
     * Calcula la próxima fecha y hora en que la producción estará disponible
     * para comenzar una nueva orden.
     * @param {Array} ordenes - El array de tareas de la cola de producción.
     * @param {Object} horarioLaboral - La definición del horario laboral.
     * @returns {Date|null} Un objeto Date con la próxima fecha disponible, o la fecha actual si la cola está vacía.
     */
    getProximaFechaDisponible(ordenes, horarioLaboral) {
      const fechaDeCalculo = new Date();
      const tareasProcesadas = this.procesarColaProduccion(ordenes, horarioLaboral, fechaDeCalculo);

      // Si no hay tareas o el procesamiento falla, la próxima fecha es ahora mismo.
      if (!tareasProcesadas || tareasProcesadas.length === 0) {
        return this.ajustarInicioAlHorarioLaboral(new Date(), horarioLaboral);
      }

      // La próxima fecha disponible es la fecha de finalización de la última tarea en la cola.
      const ultimaTarea = tareasProcesadas[tareasProcesadas.length - 1];

      // Retornamos la fecha de finalización estimada de la última tarea.
      return ultimaTarea.fecha_estimada_fin;
    },

    // =================================================================
    // ==              FUNCIONES AUXILIARES DE VARIANTE               ==
    // =================================================================
    _determinarVarianteOrden(orden) {
      const esPausada = orden.tareas.every(t => t.status === 'pausada');
      if (esPausada) {
        return { variant: 'secondary', variant_text: 'PAUSADA' };
      } else {
        const esTerminada = orden.tareas.every(t => t.fecha_terminado);
        if (esTerminada) return { variant: 'info', variant_text: 'TERMINADO' };

        const esPorIniciar = orden.tareas.every(t => !t.fecha_inicio);
        if (esPorIniciar) return { variant: 'secondary', variant_text: 'POR INICIAR' };

        const ultimaTarea = orden.tareas[orden.tareas.length - 1];
        const fechaFinEstimada = ultimaTarea ? ultimaTarea.fecha_estimada_fin : null;
        const fechaComprometidaStr = ultimaTarea ? ultimaTarea.fecha_entrega_de_la_orden : null;

        if (fechaFinEstimada instanceof Date && !isNaN(fechaFinEstimada) && fechaComprometidaStr) {
          const fechaEstimadaNorm = new Date(fechaFinEstimada);
          fechaEstimadaNorm.setHours(0, 0, 0, 0);

          // <-- INICIO DE CORRECCIÓN -->
          // Se fuerza la interpretación de la fecha en la zona horaria local añadiendo T00:00:00
          const fechaComprometidaNorm = new Date(`${fechaComprometidaStr}T00:00:00`);
          fechaComprometidaNorm.setHours(0, 0, 0, 0); // Se mantiene por seguridad
          // <-- FIN DE CORRECCIÓN -->

          if (fechaEstimadaNorm.getTime() > fechaComprometidaNorm.getTime()) return { variant: 'danger', variant_text: 'RETRASADO' };
          if (fechaEstimadaNorm.getTime() === fechaComprometidaNorm.getTime()) return { variant: 'warning', variant_text: 'EN EL DÍA' };
          if (fechaEstimadaNorm.getTime() < fechaComprometidaNorm.getTime()) return { variant: 'success', variant_text: 'A TIEMPO' };
        }

        return { variant: 'secondary', variant_text: 'EN PROGRESO' };
      }

    },

    _determinarVarianteTarea(tarea) {
      if (tarea.fecha_terminado) return { variant: 'info', variant_text: 'TERMINADO' };

      const fechaFinEstimada = tarea.fecha_estimada_fin;
      const fechaComprometidaStr = tarea.fecha_entrega_de_la_orden;

      if (fechaFinEstimada instanceof Date && !isNaN(fechaFinEstimada) && fechaComprometidaStr) {
        const fechaEstimadaNorm = new Date(fechaFinEstimada);
        fechaEstimadaNorm.setHours(0, 0, 0, 0);

        // <-- INICIO DE CORRECCIÓN -->
        const fechaComprometidaNorm = new Date(`${fechaComprometidaStr}T00:00:00`);
        fechaComprometidaNorm.setHours(0, 0, 0, 0);
        // <-- FIN DE CORRECCIÓN -->

        if (fechaEstimadaNorm.getTime() > fechaComprometidaNorm.getTime()) return { variant: 'danger', variant_text: 'RETRASADO' };
        if (fechaEstimadaNorm.getTime() === fechaComprometidaNorm.getTime()) return { variant: 'warning', variant_text: 'EN EL DÍA' };
        return { variant: 'success', variant_text: 'A TIEMPO' };
      }

      if (tarea.status === 'pausada') return { variant: 'primary', variant_text: 'PAUSADA' };
      if (tarea.fecha_inicio) return { variant: 'info', variant_text: 'EN PROGRESO' };
      if (!tarea.fecha_inicio) return { variant: 'light', variant_text: 'POR INICIAR' };

      return { variant: 'secondary', variant_text: '' };
    },

    // =================================================================
    // ==        FUNCIONES DE CÁLCULO INTERNAS                      ==
    // =================================================================

    procesarColaProduccion(ordenes, horarioLaboral, fechaDeCalculo) {
      if (!ordenes || !Array.isArray(ordenes) || ordenes.length === 0) return [];
      if (!horarioLaboral) return ordenes;

      const ordenesAProcesar = JSON.parse(JSON.stringify(ordenes));
      ordenesAProcesar.sort((a, b) => {
        if (a.orden_fila_orden !== b.orden_fila_orden) return a.orden_fila_orden - b.orden_fila_orden;
        return a.orden_proceso_departamento - b.orden_proceso_departamento;
      });

      let proximoInicioDisponible = this.ajustarInicioAlHorarioLaboral(fechaDeCalculo, horarioLaboral);
      if (!proximoInicioDisponible) {
        console.error("No se pudo determinar un punto de partida válido para el cálculo.");
        return [];
      }

      for (const tarea of ordenesAProcesar) {
        // Excluir ordenes pausadas
        if (tarea.status !== 'pausada') {
          const fechaInicioReal = tarea.fecha_inicio ? new Date(tarea.fecha_inicio.replace(' ', 'T')) : null;
          const fechaTerminadoReal = tarea.fecha_terminado ? new Date(tarea.fecha_terminado.replace(' ', 'T')) : null;

          tarea.fecha_inicio_formateada = this.formatDateTime12h(fechaInicioReal);
          tarea.fecha_terminado_formateada = this.formatDateTime12h(fechaTerminadoReal);
          tarea.tiempo_total_orden_depto_formateado = this.formatearTiempo(tarea.tiempo_total_orden_depto * 1000);
          tarea.tiempo_real_empleado_segundos = null;
          tarea.tiempo_real_empleado_formateado = null;

          if (fechaInicioReal && fechaTerminadoReal && !isNaN(fechaInicioReal) && !isNaN(fechaTerminadoReal)) {
            const duracionMilisegundos = fechaTerminadoReal.getTime() - fechaInicioReal.getTime();
            tarea.tiempo_real_empleado_segundos = Math.floor(duracionMilisegundos / 1000);
            tarea.tiempo_real_empleado_formateado = this.formatearTiempo(duracionMilisegundos);
          }

          if (fechaTerminadoReal && !isNaN(fechaTerminadoReal)) {
            tarea.fecha_estimada_inicio = fechaInicioReal;
            tarea.fecha_estimada_fin = fechaTerminadoReal;
            tarea.fecha_estimada_inicio_formateada = this.formatDateTime12h(fechaInicioReal);
            tarea.fecha_estimada_fin_formateada = this.formatDateTime12h(fechaTerminadoReal);
            proximoInicioDisponible = new Date(fechaTerminadoReal.getTime());
          } else {
            let fechaInicioCalculada;
            if (fechaInicioReal && !isNaN(fechaInicioReal)) {
              fechaInicioCalculada = fechaInicioReal;
            } else {
              fechaInicioCalculada = new Date(Math.max(proximoInicioDisponible.getTime(), fechaDeCalculo.getTime()));
            }

            const fechaEstimadaInicio = this.ajustarInicioAlHorarioLaboral(fechaInicioCalculada, horarioLaboral);
            if (fechaEstimadaInicio) {
              const fechaEstimadaFin = this.calcularFechaFinLaboral(fechaEstimadaInicio, tarea.tiempo_total_orden_depto, horarioLaboral);
              if (fechaEstimadaFin) {
                tarea.fecha_estimada_inicio = fechaEstimadaInicio;
                tarea.fecha_estimada_fin = fechaEstimadaFin;
                tarea.fecha_estimada_inicio_formateada = this.formatDateTime12h(fechaEstimadaInicio);
                tarea.fecha_estimada_fin_formateada = this.formatDateTime12h(fechaEstimadaFin);
                proximoInicioDisponible = new Date(fechaEstimadaFin.getTime());
              }
            }
          }

          const { variant, variant_text } = this._determinarVarianteTarea(tarea);
          tarea.variant = variant;
          tarea.variant_text = variant_text;
        } else {
          const fechaInicioReal = tarea.fecha_inicio ? new Date(tarea.fecha_inicio.replace(' ', 'T')) : null;
          const fechaTerminadoReal = tarea.fecha_terminado ? new Date(tarea.fecha_terminado.replace(' ', 'T')) : null;

          /*tarea.fecha_inicio_formateada = this.formatDateTime12h(fechaInicioReal);
          tarea.fecha_terminado_formateada = this.formatDateTime12h(fechaTerminadoReal);
          tarea.tiempo_total_orden_depto_formateado = this.formatearTiempo(tarea.tiempo_total_orden_depto * 1000);
          tarea.tiempo_real_empleado_segundos = null;
          tarea.tiempo_real_empleado_formateado = null;
          
          if (fechaInicioReal && fechaTerminadoReal && !isNaN(fechaInicioReal) && !isNaN(fechaTerminadoReal)) {
              const duracionMilisegundos = fechaTerminadoReal.getTime() - fechaInicioReal.getTime();
              tarea.tiempo_real_empleado_segundos = Math.floor(duracionMilisegundos / 1000);
              tarea.tiempo_real_empleado_formateado = this.formatearTiempo(duracionMilisegundos);
          }
 
         if (fechaTerminadoReal && !isNaN(fechaTerminadoReal)) {
              tarea.fecha_estimada_inicio = fechaInicioReal;
              tarea.fecha_estimada_fin = fechaTerminadoReal;
              tarea.fecha_estimada_inicio_formateada = this.formatDateTime12h(fechaInicioReal);
              tarea.fecha_estimada_fin_formateada = this.formatDateTime12h(fechaTerminadoReal);
              proximoInicioDisponible = new Date(fechaTerminadoReal.getTime());
          }  else {
              let fechaInicioCalculada;
              if (fechaInicioReal && !isNaN(fechaInicioReal)) {
                  fechaInicioCalculada = fechaInicioReal;
              } else {
                  fechaInicioCalculada = new Date(Math.max(proximoInicioDisponible.getTime(), fechaDeCalculo.getTime()));
              }
 
              const fechaEstimadaInicio = this.ajustarInicioAlHorarioLaboral(fechaInicioCalculada, horarioLaboral);
              if (fechaEstimadaInicio) {
                  const fechaEstimadaFin = this.calcularFechaFinLaboral(fechaEstimadaInicio, tarea.tiempo_total_orden_depto, horarioLaboral);
                  if(fechaEstimadaFin) {
                      tarea.fecha_estimada_inicio = fechaEstimadaInicio;
                      tarea.fecha_estimada_fin = fechaEstimadaFin;
                      tarea.fecha_estimada_inicio_formateada = this.formatDateTime12h(fechaEstimadaInicio);
                      tarea.fecha_estimada_fin_formateada = this.formatDateTime12h(fechaEstimadaFin);
                      proximoInicioDisponible = new Date(fechaEstimadaFin.getTime());
                  }
              }
          } */

          const { variant, variant_text } = this._determinarVarianteTarea(tarea);
          tarea.variant = variant;
          tarea.variant_text = variant_text;

        }

      }
      return ordenesAProcesar;
    },

    calcularFechaFinLaboral(fechaInicio, duracionSegundos, horarioLaboral) {
      if (!(fechaInicio instanceof Date && !isNaN(fechaInicio.getTime()))) return null;
      let fechaActual = new Date(fechaInicio.getTime());
      let segundosRestantes = duracionSegundos;
      const { horaInicioManana, horaFinManana, horaInicioTarde, horaFinTarde } = horarioLaboral;
      let iteraciones = 0;
      const MAX_ITER_CALCULO = 10000;
      while (segundosRestantes > 0) {
        iteraciones++;
        if (iteraciones > MAX_ITER_CALCULO) return null;
        const fechaAjustada = this.ajustarInicioAlHorarioLaboral(fechaActual, horarioLaboral);
        if (!fechaAjustada) return null;
        fechaActual = fechaAjustada;
        const horaActualDecimal = fechaActual.getHours() + fechaActual.getMinutes() / 60 + fechaActual.getSeconds() / 3600;
        let finTurnoDecimal;
        if (horaActualDecimal >= horaInicioManana && horaActualDecimal < horaFinManana) finTurnoDecimal = horaFinManana;
        else if (horaActualDecimal >= horaInicioTarde && horaActualDecimal < horaFinTarde) finTurnoDecimal = horaFinTarde;
        else { fechaActual.setHours(fechaActual.getHours() + 1); continue; }
        const segundosDisponiblesEnTurno = (finTurnoDecimal - horaActualDecimal) * 3600;
        if (segundosRestantes <= segundosDisponiblesEnTurno) {
          fechaActual.setSeconds(fechaActual.getSeconds() + segundosRestantes);
          segundosRestantes = 0;
        } else {
          segundosRestantes -= segundosDisponiblesEnTurno;
          fechaActual.setHours(Math.floor(finTurnoDecimal), (finTurnoDecimal % 1) * 60, 0, 0);
          fechaActual.setSeconds(fechaActual.getSeconds() + 1);
        }
      }
      return fechaActual;
    },

    ajustarInicioAlHorarioLaboral(fechaParam, horarioLaboral) {
      if (!(fechaParam instanceof Date && !isNaN(fechaParam.getTime()))) return null;
      let fecha = new Date(fechaParam.getTime());
      let iteraciones = 0;
      const MAX_ITER_AJUSTE = 730 * 24 * 2 * 7;
      while (true) {
        iteraciones++;
        if (iteraciones > MAX_ITER_AJUSTE) return null;
        const diaSemana = fecha.getDay();
        const horaActualDecimal = fecha.getHours() + fecha.getMinutes() / 60 + fecha.getSeconds() / 3600;
        if (horarioLaboral.diasLaborales.includes(diaSemana)) {
          const { horaInicioManana, horaFinManana, horaInicioTarde, horaFinTarde } = horarioLaboral;
          if (horaActualDecimal < horaInicioManana) {
            fecha.setHours(Math.floor(horaInicioManana), (horaInicioManana % 1) * 60, 0, 0);
            return fecha;
          } else if (horaActualDecimal >= horaInicioManana && horaActualDecimal < horaFinManana) return fecha;
          else if (horaActualDecimal >= horaFinManana && horaActualDecimal < horaInicioTarde) {
            fecha.setHours(Math.floor(horaInicioTarde), (horaInicioTarde % 1) * 60, 0, 0);
            return fecha;
          } else if (horaActualDecimal >= horaInicioTarde && horaActualDecimal < horaFinTarde) return fecha;
          else {
            fecha.setDate(fecha.getDate() + 1);
            fecha.setHours(Math.floor(horaInicioManana), (horaInicioManana % 1) * 60, 0, 0);
          }
        } else {
          fecha.setDate(fecha.getDate() + 1);
          fecha.setHours(Math.floor(horarioLaboral.horaInicioManana), (horarioLaboral.horaInicioManana % 1) * 60, 0, 0);
        }
      }
    },

    formatDate(date) {
      let dateObj;
      if (typeof date === 'string') dateObj = new Date(date.replace(" ", "T")); // Corregido para manejar fechas con hora
      else if (date instanceof Date && !isNaN(date.getTime())) dateObj = date;
      else return null;
      if (isNaN(dateObj.getTime())) return null;
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    },

    formatDateTime12h(date) {
      let dateObj;
      if (typeof date === 'string') dateObj = new Date(date.replace(" ", "T"));
      else if (date instanceof Date && !isNaN(date.getTime())) dateObj = date;
      else return null;
      if (isNaN(dateObj.getTime())) return null;
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      let hours = dateObj.getHours();
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = String(hours).padStart(2, '0');
      return `${day}/${month}/${year} ${String(strHours).padStart(2, '0')}:${minutes} ${ampm}`;
    },

    formatearTiempo(ms) {
      if (ms === null || ms === undefined || isNaN(ms)) return null;
      if (ms < 0) ms = 0;
      if (ms === 0) return '0s';
      const segundosTotales = Math.floor(ms / 1000);
      const minutosTotales = Math.floor(segundosTotales / 60);
      const horasTotales = Math.floor(minutosTotales / 60);
      const diasTotales = Math.floor(horasTotales / 24);
      if (diasTotales >= 1) {
        const horasRestantes = horasTotales % 24;
        return `${diasTotales}d ${horasRestantes}h`;
      } else if (horasTotales >= 1) {
        const minutosRestantes = minutosTotales % 60;
        return `${horasTotales}h ${minutosRestantes}m`;
      } else if (minutosTotales >= 1) {
        const segundosRestantes = segundosTotales % 60;
        return `${minutosTotales}m ${segundosRestantes}s`;
      } else return `${segundosTotales}s`;
    },
  }
}