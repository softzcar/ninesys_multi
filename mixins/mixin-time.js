/**
  Función: calcularTiempoTrabajoOrdenes

  Descripción:
  Esta función toma un array de objetos 'ordenes', un array de objetos 'pausas',
  y un objeto 'horarioLaboral' como entrada. Itera sobre cada item en el array
  'ordenes' para calcular el tiempo de trabajo efectivo empleado en su producción,
  teniendo en cuenta las pausas y el horario laboral definido.

  Para cada orden, agrupa la información de sus items y calcula:
    - El tiempo total de trabajo efectivo para la orden (en milisegundos y formateado).
    - El número total de unidades producidas para la orden.
    - El tiempo promedio por pieza producida (en segundos y formateado).
    - El tiempo de producción estimado por pieza (tomado del primer item de la orden).
    - Un array de detalles por cada item de la orden, incluyendo:
      - El tiempo de trabajo efectivo para el item (en milisegundos y segundos).
      - El tiempo de producción estimado para el item (en segundos).
      - La diferencia entre el tiempo efectivo y el estimado (en segundos).
      - Boleanos indicando si el tiempo efectivo fue más rápido, más lento o igual al estimado.
      - El porcentaje de eficiencia para el item (entre 0 y 100).

  Además, calcula un porcentaje de eficiencia total global, promediando los porcentajes
  de eficiencia de todos los items procesados.

  Manejo de 'fecha_terminado' null:
  Si la propiedad 'fecha_terminado' de un item es null, se utiliza la fecha y hora
  actual en el momento de la ejecución de la función para calcular el tiempo
  transcurrido, considerando la tarea como en curso.

  Exclusión de items sin 'fecha_inicio':
  Los items en el array 'ordenes' que tengan la propiedad 'fecha_inicio' en null
  se omiten y no se incluyen en los cálculos.

  Parámetros:
    - ordenes: Array de objetos, donde cada objeto representa un item de una orden
      y debe contener al menos las propiedades: 'id_orden', 'fecha_inicio',
      'fecha_terminado', 'tiempo_produccion', y 'unidades'.
    - pausas: Array de objetos, donde cada objeto representa un periodo de pausa
      y debe contener las propiedades: 'fecha_inicio' y 'fecha_fin'.
    - horarioLaboral: Objeto que define el horario laboral, con las propiedades:
      'horaInicioManana', 'horaFinManana', 'horaInicioTarde', 'horaFinTarde',
      y 'diasLaborales' (un array de números representando los días de la semana,
      donde 0 es Domingo, 1 es Lunes, etc.).

  Datos Resultantes (Retorno de la función):
  La función retorna un objeto con las siguientes propiedades:
    - resultadosPorOrdenArray: Un array de objetos. Cada objeto representa una
      orden y contiene las siguientes propiedades:
        - id_orden: El identificador de la orden.
        - tiempo_total_trabajo_efectivo_ms: El tiempo total de trabajo efectivo
          para la orden en milisegundos.
        - tiempo_total_trabajo_efectivo_formateado: El tiempo total de trabajo
          efectivo formateado en días, horas, minutos y segundos según la duración.
        - total_unidades: El número total de unidades producidas en la orden.
        - tiempo_promedio_por_pieza_segundos: El tiempo promedio por pieza en segundos.
        - tiempo_promedio_por_pieza_formateado: El tiempo promedio por pieza formateado.
        - tiempo_produccion_estimado_segundos_orden: El tiempo de producción estimado
          para una pieza (tomado del primer item de la orden).
        - items: Un array de objetos, donde cada objeto representa un item de la orden
          y contiene las siguientes propiedades:
            - id_orden_producto: El identificador del producto dentro de la orden.
            - tiempo_trabajo_efectivo_ms: El tiempo de trabajo efectivo para el item en milisegundos.
            - tiempo_trabajo_efectivo_segundos: El tiempo de trabajo efectivo para el item en segundos.
            - tiempo_produccion_estimado_segundos_item: El tiempo de producción estimado para este item en segundos.
            - diferencia_segundos_item: La diferencia entre el tiempo efectivo y el estimado en segundos.
            - es_mas_rapido_item: Booleano indicando si el tiempo efectivo fue menor que el estimado.
            - es_mas_lento_item: Booleano indicando si el tiempo efectivo fue mayor que el estimado.
            - es_igual_item: Booleano indicando si el tiempo efectivo fue igual al estimado.
            - porcentaje_eficiencia: El porcentaje de eficiencia para este item (0-100).
        - porcentaje_eficiencia_total_orden: El porcentaje de eficiencia promedio
          para todos los items procesados en esta orden (0-100), o null si no hay items.
    - porcentajeEficienciaGlobal: Un número (o null) que representa el porcentaje
      de eficiencia promedio de todos los items procesados en todas las órdenes (0-100).

  Ejemplo de Implementación (dentro de un método de un componente Vue.js):
  ```javascript
  methods: {
    calcularYMostrarResultados() {
      const ordenesData = [
        {
          "id_orden": 1,
          "fecha_inicio": "2025-04-10 09:00:00",
          "fecha_terminado": "2025-04-10 09:10:00",
          "tiempo_produccion": 600,
          "unidades": 1
        },
        {
          "id_orden": 1,
          "fecha_inicio": "2025-04-10 09:15:00",
          "fecha_terminado": "2025-04-10 09:20:00",
          "tiempo_produccion": 300,
          "unidades": 2
        },
        {
          "id_orden": 2,
          "fecha_inicio": "2025-04-10 10:00:00",
          "fecha_terminado": null, // Tarea en curso
          "tiempo_produccion": 1200,
          "unidades": 1
        }
      ];
      const pausasData = [
        { "fecha_inicio": "2025-04-10 11:00:00", "fecha_fin": "2025-04-10 11:15:00" }
      ];
      const horarioLaboralData = {
        horaInicioManana: 9,
        horaFinManana: 12,
        horaInicioTarde: 13,
        horaFinTarde: 17,
        diasLaborales: [1, 2, 3, 4, 5]
      };

      const resultados = this.calcularTiempoTrabajoOrdenes(ordenesData, pausasData, horarioLaboralData);
      this.resultadosCalculo = resultados.resultadosPorOrdenArray;
      this.porcentajeEficienciaGlobal = resultados.porcentajeEficienciaGlobal;

      console.log("Resultados del cálculo:", this.resultadosCalculo);
      console.log("Porcentaje de eficiencia global:", this.porcentajeEficienciaGlobal);
    }
  }
  */

import { differenceInMilliseconds, isWithinInterval, addDays, isWeekend } from 'date-fns';
export default {
    data() {
        return {
            resultadosCalculo: [],
            huboError: false,
            porcentajeEficienciaGlobal: null
        }
    },

    methods: {
        calcularTiempoDeTrabajo() {
            try {
                const resultados = this.calcularTiempoTrabajoOrdenes(this.ordenes, this.pausas, this.horarioLaboral);
                this.resultadosCalculo = resultados.resultadosPorOrdenArray;
                this.porcentajeEficienciaGlobal = resultados.porcentajeEficienciaGlobal;
                this.huboError = false;
            } catch (error) {
                console.error("Error al calcular el tiempo de trabajo:", error);
                this.resultadosCalculo = [];
                this.porcentajeEficienciaGlobal = null;
                this.huboError = true;
            }
        },
        calcularTiempoTrabajoOrdenes(ordenes, pausas, horarioLaboral) {
            const resultadosPorOrden = {};
            const ahora = new Date();
            const porcentajesEficienciaGlobal = [];

            ordenes.forEach(item => {
                if (item.fecha_inicio) { // Procesar items con fecha de inicio
                    const fechaInicio = new Date(item.fecha_inicio);
                    const fechaFin = item.fecha_terminado ? new Date(item.fecha_terminado) : ahora;
                    const tarea = { fecha_inicio: fechaInicio, fecha_fin: fechaFin };
                    const tiempoTrabajoEfectivoMs = this.calcularTiempoTrabajoIndividual(tarea, pausas, horarioLaboral);
                    const tiempoTrabajoEfectivoSegundos = Math.round(tiempoTrabajoEfectivoMs / 1000);
                    const tiempoProduccionEstimadoSegundos = item.tiempo_produccion;
                    const unidades = item.unidades || 1;

                    if (!resultadosPorOrden[item.id_orden]) {
                        resultadosPorOrden[item.id_orden] = {
                            id_orden: item.id_orden,
                            tiempo_total_trabajo_efectivo_ms: 0,
                            tiempo_total_trabajo_efectivo_formateado: '0 segundos',
                            total_unidades: 0,
                            tiempo_promedio_por_pieza_segundos: 0,
                            tiempo_promedio_por_pieza_formateado: '0 segundos',
                            tiempo_produccion_estimado_segundos_orden: ordenes.find(o => o.id_orden === item.id_orden)?.tiempo_produccion || 0,
                            items: [],
                            porcentajes_eficiencia_items: []
                        };
                    }

                    resultadosPorOrden[item.id_orden].tiempo_total_trabajo_efectivo_ms += tiempoTrabajoEfectivoMs;
                    resultadosPorOrden[item.id_orden].total_unidades += unidades;

                    let eficiencia = null;
                    if (tiempoProduccionEstimadoSegundos > 0) {
                        eficiencia = Math.min(100, Math.max(0, Math.round((tiempoProduccionEstimadoSegundos / tiempoTrabajoEfectivoSegundos) * 100)));
                        resultadosPorOrden[item.id_orden].porcentajes_eficiencia_items.push(eficiencia);
                        porcentajesEficienciaGlobal.push(eficiencia); // Añadimos al array global
                    }

                    resultadosPorOrden[item.id_orden].items.push({
                        id_orden_producto: item.id_ordenes_productos,
                        tiempo_trabajo_efectivo_ms: tiempoTrabajoEfectivoMs,
                        tiempo_trabajo_efectivo_segundos: tiempoTrabajoEfectivoSegundos,
                        tiempo_produccion_estimado_segundos_item: tiempoProduccionEstimadoSegundos,
                        diferencia_segundos_item: tiempoTrabajoEfectivoSegundos - tiempoProduccionEstimadoSegundos,
                        es_mas_rapido_item: tiempoTrabajoEfectivoSegundos < tiempoProduccionEstimadoSegundos,
                        es_mas_lento_item: tiempoTrabajoEfectivoSegundos > tiempoProduccionEstimadoSegundos,
                        es_igual_item: tiempoTrabajoEfectivoSegundos === tiempoProduccionEstimadoSegundos,
                        porcentaje_eficiencia: eficiencia
                    });
                }
                // Si fecha_inicio es null, no se procesa este item
            });

            const resultadosPorOrdenArray = Object.values(resultadosPorOrden).map(ordenResultado => {
                if (ordenResultado.tiempo_total_trabajo_efectivo_ms !== null) {
                    ordenResultado.tiempo_total_trabajo_efectivo_formateado = this.formatearTiempo(ordenResultado.tiempo_total_trabajo_efectivo_ms);
                    if (ordenResultado.total_unidades > 0) {
                        ordenResultado.tiempo_promedio_por_pieza_segundos = Math.round(ordenResultado.tiempo_total_trabajo_efectivo_ms / ordenResultado.total_unidades / 1000);
                        ordenResultado.tiempo_promedio_por_pieza_formateado = this.formatearTiempo(ordenResultado.tiempo_promedio_por_pieza_segundos * 1000);
                    }

                    if (ordenResultado.porcentajes_eficiencia_items.length > 0) {
                        const sumaEficiencias = ordenResultado.porcentajes_eficiencia_items.reduce((suma, eficiencia) => suma + eficiencia, 0);
                        ordenResultado.porcentaje_eficiencia_total_orden = Math.round(sumaEficiencias / ordenResultado.porcentajes_eficiencia_items.length);
                    } else {
                        ordenResultado.porcentaje_eficiencia_total_orden = null;
                    }
                } else {
                    ordenResultado.porcentaje_eficiencia_total_orden = null;
                }
                return ordenResultado;
            });

            // Calcular el porcentaje de eficiencia global
            let porcentajeEficienciaGlobal = null;
            if (porcentajesEficienciaGlobal.length > 0) {
                const sumaGlobalEficiencias = porcentajesEficienciaGlobal.reduce((suma, eficiencia) => suma + eficiencia, 0);
                porcentajeEficienciaGlobal = Math.round(sumaGlobalEficiencias / porcentajesEficienciaGlobal.length);
            }

            return { resultadosPorOrdenArray, porcentajeEficienciaGlobal };
        },
        calcularTiempoTrabajoIndividual(tarea, pausas, horarioLaboral) {
            // ... (tu función calcularTiempoTrabajoIndividual sin cambios)
            let tiempoTotalTrabajoMs = differenceInMilliseconds(tarea.fecha_fin, tarea.fecha_inicio);
            let tiempoPausasMs = 0;

            if (pausas && pausas.length > 0) {
                pausas.forEach(pausa => {
                    if (pausa.fecha_inicio < tarea.fecha_fin && pausa.fecha_fin > tarea.fecha_inicio) {
                        const inicioInterseccionPausa = new Date(Math.max(pausa.fecha_inicio, tarea.fecha_inicio));
                        const finInterseccionPausa = new Date(Math.min(pausa.fecha_fin, tarea.fecha_fin));
                        tiempoPausasMs += differenceInMilliseconds(finInterseccionPausa, inicioInterseccionPausa);
                    }
                });
                tiempoTotalTrabajoMs -= tiempoPausasMs;
            }

            let tiempoTrabajoEfectivoMs = 0;
            let fechaActual = new Date(tarea.fecha_inicio);

            while (fechaActual < tarea.fecha_fin) {
                const diaSemana = fechaActual.getDay();

                if (horarioLaboral.diasLaborales.includes(diaSemana)) {
                    const inicioDia = new Date(fechaActual);
                    inicioDia.setHours(0, 0, 0, 0);
                    const finDia = new Date(fechaActual);
                    finDia.setHours(23, 59, 59, 999);

                    const inicioPeriodoTrabajo = new Date(fechaActual);
                    const finPeriodoTrabajo = new Date(Math.min(tarea.fecha_fin, finDia));

                    let tiempoEnPeriodoMs = differenceInMilliseconds(finPeriodoTrabajo, inicioPeriodoTrabajo);

                    // Descontar la hora de descanso del mediodía
                    const inicioDescanso = new Date(fechaActual);
                    inicioDescanso.setHours(12, 0, 0, 0);
                    const finDescanso = new Date(fechaActual);
                    finDescanso.setHours(13, 0, 0, 0);
                    const intervaloDescanso = { start: inicioDescanso, end: finDescanso };

                    const inicioInterseccionDescanso = new Date(Math.max(inicioPeriodoTrabajo, intervaloDescanso.start));
                    const finInterseccionDescanso = new Date(Math.min(finPeriodoTrabajo, intervaloDescanso.end));

                    if (inicioInterseccionDescanso < finInterseccionDescanso) {
                        tiempoEnPeriodoMs -= differenceInMilliseconds(finInterseccionDescanso, inicioInterseccionDescanso);
                    }

                    // Considerar solo el tiempo dentro del horario laboral del día
                    let tiempoLaboralDiaMs = 0;

                    // Mañana
                    const inicioManana = new Date(fechaActual);
                    inicioManana.setHours(Math.floor(horarioLaboral.horaInicioManana), Math.round((horarioLaboral.horaInicioManana % 1) * 60), 0, 0);
                    const finManana = new Date(fechaActual);
                    finManana.setHours(Math.floor(horarioLaboral.horaFinManana), Math.round((horarioLaboral.horaFinManana % 1) * 60), 0, 0);
                    const intervaloManana = { start: inicioManana, end: finManana };

                    const inicioTrabajoManana = new Date(Math.max(inicioPeriodoTrabajo, intervaloManana.start));
                    const finTrabajoManana = new Date(Math.min(finPeriodoTrabajo, intervaloManana.end));

                    if (inicioTrabajoManana < finTrabajoManana) {
                        tiempoLaboralDiaMs += differenceInMilliseconds(finTrabajoManana, inicioTrabajoManana);
                    }

                    // Tarde
                    const inicioTarde = new Date(fechaActual);
                    inicioTarde.setHours(Math.floor(horarioLaboral.horaInicioTarde), Math.round((horarioLaboral.horaInicioTarde % 1) * 60), 0, 0);
                    const finTarde = new Date(fechaActual);
                    finTarde.setHours(Math.floor(horarioLaboral.horaFinTarde), Math.round((horarioLaboral.horaFinTarde % 1) * 60), 0, 0);
                    const intervaloTarde = { start: inicioTarde, end: finTarde };

                    const inicioTrabajoTarde = new Date(Math.max(inicioPeriodoTrabajo, intervaloTarde.start));
                    const finTrabajoTarde = new Date(Math.min(finPeriodoTrabajo, intervaloTarde.end));

                    if (inicioTrabajoTarde < finTrabajoTarde) {
                        tiempoLaboralDiaMs += differenceInMilliseconds(finTrabajoTarde, inicioTrabajoTarde);
                    }

                    tiempoTrabajoEfectivoMs += tiempoLaboralDiaMs;
                }

                fechaActual = addDays(fechaActual, 1);
                fechaActual.setHours(0, 0, 0, 0);
            }

            return tiempoTrabajoEfectivoMs;
        },
        formatearTiempo(ms) {
            const segundosTotales = Math.floor(ms / 1000);
            const minutosTotales = Math.floor(segundosTotales / 60);
            const horasTotales = Math.floor(minutosTotales / 60);
            const diasTotales = Math.floor(horasTotales / 24);

            if (diasTotales >= 1) {
                const horasRestantes = horasTotales % 24;
                return `${diasTotales} días y ${horasRestantes} horas`;
            } else if (horasTotales >= 1) {
                const minutosRestantes = minutosTotales % 60;
                return `${horasTotales} horas y ${minutosRestantes} minutos`;
            } else if (minutosTotales >= 1) {
                const segundosRestantes = segundosTotales % 60;
                return `${minutosTotales} minutos y ${segundosRestantes} segundos`;
            } else {
                return `${segundosTotales} segundos`;
            }
        }
    }
}