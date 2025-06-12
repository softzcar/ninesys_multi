// mixin-proyeccion-cola-ordenes-SIMPLIFICADO.js
export default {
    methods: {
        /**
         * Ajusta una fecha/hora dada al próximo horario laboral válido.
         * Si la fecha ya está en horario laboral, la devuelve sin cambios.
         * Si está fuera de horario (noche, almuerzo, fin de semana), la avanza
         * al inicio del siguiente turno laboral.
         * @param {Date} fechaParam - La fecha a ajustar.
         * @param {Object} horarioLaboral - Objeto con la definición del horario:
         *   { diasLaborales: [0,1,2,3,4,5,6], horaInicioManana: 8.0, horaFinManana: 12.0, horaInicioTarde: 13.0, horaFinTarde: 17.0 }
         * @returns {Date|null} La fecha ajustada o null si hay un error o bucle.
         */
        ajustarInicioAlHorarioLaboral(fechaParam, horarioLaboral) {
            if (!(fechaParam instanceof Date && !isNaN(fechaParam.getTime()))) {
                // console.warn("[ajustarInicioAlHorarioLaboral] Fecha inválida recibida:", fechaParam);
                return null;
            }
            let fecha = new Date(fechaParam.getTime());

            let iteraciones = 0;
            const MAX_ITER_AJUSTE = 730 * 24 * 2 * 7; // Aprox. 2 años de saltos horarios (aumentado por si acaso)

            while (true) {
                iteraciones++;
                if (iteraciones > MAX_ITER_AJUSTE) {
                    console.error(`[ajustarInicioAlHorarioLaboral] ERROR: Posible bucle infinito. Iteraciones: ${iteraciones}. Fecha inicial: ${fechaParam ? fechaParam.toISOString() : 'Invalid Date'}, Fecha actual: ${fecha.toISOString()}`);
                    return null;
                }

                const diaSemana = fecha.getDay();
                const horaActualDecimal = fecha.getHours() + fecha.getMinutes() / 60 + fecha.getSeconds() / 3600;

                if (horarioLaboral.diasLaborales.includes(diaSemana)) {
                    const { horaInicioManana, horaFinManana, horaInicioTarde, horaFinTarde } = horarioLaboral;

                    if (horaActualDecimal < horaInicioManana) {
                        fecha.setHours(Math.floor(horaInicioManana), (horaInicioManana % 1) * 60, 0, 0);
                        return fecha;
                    } else if (horaActualDecimal >= horaInicioManana && horaActualDecimal < horaFinManana) {
                        return fecha;
                    } else if (horaActualDecimal >= horaFinManana && horaActualDecimal < horaInicioTarde) {
                        fecha.setHours(Math.floor(horaInicioTarde), (horaInicioTarde % 1) * 60, 0, 0);
                        return fecha;
                    } else if (horaActualDecimal >= horaInicioTarde && horaActualDecimal < horaFinTarde) {
                        return fecha;
                    } else { // Después del turno de tarde
                        fecha.setDate(fecha.getDate() + 1);
                        fecha.setHours(Math.floor(horaInicioManana), (horaInicioManana % 1) * 60, 0, 0);
                        // El bucle continuará para re-evaluar el nuevo día
                    }
                } else { // Día no laboral
                    fecha.setDate(fecha.getDate() + 1);
                    fecha.setHours(Math.floor(horarioLaboral.horaInicioManana), (horarioLaboral.horaInicioManana % 1) * 60, 0, 0);
                    // El bucle continuará para re-evaluar el nuevo día
                }
            }
        },

        /**
         * Formatea un objeto Date o string de fecha a 'DD/MM/YYYY'.
         * @param {Date|String} date - La fecha a formatear.
         * @returns {String} La fecha formateada o un mensaje de error.
         */
        formatDate(date) {
            let dateObj;
            if (typeof date === 'string') { dateObj = new Date(date.replace(" ", "T")); }
            else if (date instanceof Date && !isNaN(date.getTime())) { dateObj = date; }
            else { return 'Fecha no disponible'; }
            if (isNaN(dateObj.getTime())) { return 'Fecha no disponible'; }
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            return `${day}/${month}/${year}`;
        },

        /**
         * Formatea un objeto Date o string de fecha/hora a 'DD/MM/YYYY HH:MM AM/PM'.
         * @param {Date|String} date - La fecha/hora a formatear.
         * @returns {String} La fecha/hora formateada o un mensaje de error.
         */
        formatDateTime12h(date) {
            let dateObj;
            if (typeof date === 'string') { dateObj = new Date(date.replace(" ", "T")); }
            else if (date instanceof Date && !isNaN(date.getTime())) { dateObj = date; }
            else { return 'Fecha y hora no disponibles'; }
            if (isNaN(dateObj.getTime())) { return 'Fecha y hora no disponibles'; }
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            let hours = dateObj.getHours();
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const strHours = String(hours).padStart(2, '0');
            return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
        },

        /**
         * Formatea una duración en milisegundos a un string legible (días, horas, minutos, segundos).
         * @param {Number} ms - Duración en milisegundos.
         * @returns {String} Duración formateada o un mensaje de error.
         */
        formatearTiempo(ms) {
            if (ms === null || ms === undefined || isNaN(ms)) return 'Tiempo no disponible';
            if (ms < 0) ms = 0;
            if (ms === 0) return '0s';
            const segundosTotales = Math.floor(ms / 1000);
            const minutosTotales = Math.floor(segundosTotales / 60);
            const horasTotales = Math.floor(minutosTotales / 60);
            const diasTotales = Math.floor(horasTotales / 24);
            if (diasTotales >= 1) { const horasRestantes = horasTotales % 24; return `${diasTotales}d ${horasRestantes}h`; }
            else if (horasTotales >= 1) { const minutosRestantes = minutosTotales % 60; return `${horasTotales}h ${minutosRestantes}m`; }
            else if (minutosTotales >= 1) { const segundosRestantes = segundosTotales % 60; return `${minutosTotales}m ${segundosRestantes}s`; }
            else { return `${segundosTotales}s`; }
        },

        /**
         * Calcula la fecha de finalización de una tarea, dado un inicio, duración y horario laboral.
         * @param {Date} fechaInicioTarea - La fecha de inicio ya ajustada al horario laboral.
         * @param {Number} duracionMs - Duración de la tarea en milisegundos.
         * @param {Object} horarioLaboral - Definición del horario laboral.
         * @param {String} debugId - Un ID para logs de depuración (opcional).
         * @returns {Date|null} La fecha de finalización calculada o null si hay error.
         */
        calcularFechaFinTarea(fechaInicioTarea, duracionMs, horarioLaboral, debugId = '') {
            if (!(fechaInicioTarea instanceof Date && !isNaN(fechaInicioTarea.getTime()))) {
                // console.warn(`[calcularFechaFinTarea ${debugId}] Fecha de inicio inválida:`, fechaInicioTarea);
                return null;
            }
            if (isNaN(duracionMs) || duracionMs < 0) {
                // console.warn(`[calcularFechaFinTarea ${debugId}] Duración inválida:`, duracionMs, "Devolviendo fecha de inicio.");
                return new Date(fechaInicioTarea.getTime());
            }
            if (duracionMs === 0) return new Date(fechaInicioTarea.getTime());

            let fechaAvance = new Date(fechaInicioTarea.getTime());
            let tiempoRestanteMs = duracionMs;
            let iterWhile = 0;
            const MAX_ITER_FIN_TAREA = 200000;

            while (tiempoRestanteMs > 0) {
                iterWhile++;
                if (iterWhile > MAX_ITER_FIN_TAREA) {
                    console.error(`[calcularFechaFinTarea ${debugId}] ERROR: Posible bucle infinito. Iter: ${iterWhile}. Inicio: ${fechaInicioTarea.toISOString()}, Restante: ${tiempoRestanteMs}ms, Avance actual: ${fechaAvance.toISOString()}`);
                    return null;
                }

                const diaSemana = fechaAvance.getDay();
                const horaActualDecimal = fechaAvance.getHours() + fechaAvance.getMinutes() / 60 + fechaAvance.getSeconds() / 3600;

                if (horarioLaboral.diasLaborales.includes(diaSemana)) {
                    const { horaInicioManana, horaFinManana, horaInicioTarde, horaFinTarde } = horarioLaboral;
                    let tiempoDisponibleEnSlotActualMs = 0;

                    if (horaActualDecimal >= horaInicioManana && horaActualDecimal < horaFinManana) {
                        tiempoDisponibleEnSlotActualMs = (horaFinManana - horaActualDecimal) * 3600 * 1000;
                    }
                    else if (horaActualDecimal >= horaInicioTarde && horaActualDecimal < horaFinTarde) {
                        tiempoDisponibleEnSlotActualMs = (horaFinTarde - horaActualDecimal) * 3600 * 1000;
                    }

                    if (tiempoDisponibleEnSlotActualMs > 0) {
                        const tiempoAConsumirMs = Math.min(tiempoRestanteMs, tiempoDisponibleEnSlotActualMs);
                        fechaAvance.setTime(fechaAvance.getTime() + tiempoAConsumirMs);
                        tiempoRestanteMs -= tiempoAConsumirMs;
                    }

                    if (tiempoRestanteMs > 0) {
                        let proximoSlot = new Date(fechaAvance.getTime());
                        if (tiempoDisponibleEnSlotActualMs === 0 || tiempoRestanteMs > 0) { // Si no se consumió nada o aún queda
                            // Si estamos justo al final de un slot, o en un hueco, avanzar un poco para que el ajuste no se quede
                            if (horaActualDecimal === horaFinManana || horaActualDecimal === horaFinTarde || (horaActualDecimal >= horaFinManana && horaActualDecimal < horaInicioTarde)) {
                                proximoSlot.setSeconds(proximoSlot.getSeconds() + 1); // Avanzar un segundo para forzar el salto al siguiente slot
                            }
                        }

                        const fechaAjustada = this.ajustarInicioAlHorarioLaboral(proximoSlot, horarioLaboral);
                        if (!fechaAjustada) {
                            console.error(`[calcularFechaFinTarea ${debugId}] ERROR: Fallo al ajustar fechaAvance en bucle. Avance actual: ${proximoSlot.toISOString()}`);
                            return null;
                        }
                        // Evitar bucle si ajustar no mueve la fecha y no hay tiempo disponible (situación de error)
                        if (fechaAjustada.getTime() === fechaAvance.getTime() && tiempoDisponibleEnSlotActualMs <= 0) {
                            console.warn(`[calcularFechaFinTarea ${debugId}] Ajuste no movió la fecha y no hay tiempo disponible. Forzando avance. Fecha: ${fechaAvance.toISOString()}`);
                            // Forzar avance al día siguiente para intentar romper el bucle
                            fechaAjustada.setDate(fechaAjustada.getDate() + 1);
                            fechaAjustada.setHours(Math.floor(horarioLaboral.horaInicioManana), (horarioLaboral.horaInicioManana % 1) * 60, 0, 0);
                            const reAjustada = this.ajustarInicioAlHorarioLaboral(fechaAjustada, horarioLaboral);
                            if (!reAjustada) {
                                console.error(`[calcularFechaFinTarea ${debugId}] ERROR: Fallo al re-ajustar fechaAvance tras forzar día siguiente.`);
                                return null;
                            }
                            fechaAvance = reAjustada;
                        } else {
                            fechaAvance = fechaAjustada;
                        }
                    }
                } else { // Día no laboral
                    let proximoDiaLaboral = new Date(fechaAvance.getTime());
                    proximoDiaLaboral.setDate(proximoDiaLaboral.getDate() + 1);
                    proximoDiaLaboral.setHours(Math.floor(horarioLaboral.horaInicioManana), (horarioLaboral.horaInicioManana % 1) * 60, 0, 0);

                    const fechaAjustada = this.ajustarInicioAlHorarioLaboral(proximoDiaLaboral, horarioLaboral);
                    if (!fechaAjustada) {
                        console.error(`[calcularFechaFinTarea ${debugId}] ERROR: Fallo al ajustar fechaAvance en día no laboral. Avance actual: ${fechaAvance.toISOString()}`);
                        return null;
                    }
                    fechaAvance = fechaAjustada;
                }

                if (tiempoRestanteMs < 1 && tiempoRestanteMs > 0) { // Manejo de residuo muy pequeño
                    fechaAvance.setTime(fechaAvance.getTime() + Math.ceil(tiempoRestanteMs));
                    tiempoRestanteMs = 0;
                }
            }
            return fechaAvance;
        },

        // --- NUEVAS FUNCIONES PARA EL MIXIN SIMPLIFICADO ---

        /**
         * Calcula el resumen de tiempos pendientes por puesto (departamento) en el modelo simplificado.
         * @param {Array} dataOrdenesDeptos - Array de objetos de departamento de las órdenes (ya con tiempo_total_orden_depto).
         * @returns {Object} Tiempos acumulados por puesto.
         */
        calcularTiemposAcumuladosPorPuestoSimplificado(dataOrdenesDeptos) {
            const self = this;
            if (!dataOrdenesDeptos || !Array.isArray(dataOrdenesDeptos)) {
                console.warn("[calcularTiemposAcumuladosPorPuestoSimplificado] dataOrdenesDeptos no es un array válido.");
                return {};
            }
            const tiemposPorPuesto = {};

            dataOrdenesDeptos.forEach(deptoItem => {
                const ftOriginalDate = deptoItem.fecha_terminado ? new Date(deptoItem.fecha_terminado.replace(" ", "T")) : null;
                const estaTerminado = ftOriginalDate instanceof Date && !isNaN(ftOriginalDate.getTime());

                if (!estaTerminado) {
                    if (!tiemposPorPuesto[deptoItem.id_departamento]) {
                        tiemposPorPuesto[deptoItem.id_departamento] = {
                            id_departamento: deptoItem.id_departamento,
                            nombre_departamento: deptoItem.nombre_departamento,
                            tiempo_total_pendiente_segundos: 0,
                        };
                    }
                    tiemposPorPuesto[deptoItem.id_departamento].tiempo_total_pendiente_segundos += (deptoItem.tiempo_total_orden_depto || 0);
                }
            });

            for (const idDepto in tiemposPorPuesto) {
                tiemposPorPuesto[idDepto].tiempo_total_pendiente_formateado = self.formatearTiempo(tiemposPorPuesto[idDepto].tiempo_total_pendiente_segundos * 1000);
            }
            return tiemposPorPuesto;
        },

        /**
         * PROCESADOR INTERNO: Procesa la cola para un punto de partida de proyección dado.
         * Se encarga de la lógica de ordenación de órdenes y cálculo de fechas para una proyección específica.
         * @param {Object} aggregatedOrders - Objeto de órdenes ya agrupadas y pre-procesadas.
         * @param {Date} projectionStartingPoint - La fecha/hora desde la cual iniciar la proyección de las tareas pendientes.
         * @param {Object} horarioLaboral - Definición del horario laboral.
         * @param {Date} currentExecutionMoment - El momento real de la ejecución (para la lógica de estado/variante).
         * @returns {Array} Array de órdenes procesadas con fechas estimadas.
         */
        _processOrdersForProjectionSimplified(aggregatedOrders, projectionStartingPoint, horarioLaboral, currentExecutionMoment) {
            const self = this; // Captura el contexto this
            const colasPorEmpleado = {}; // Reinicia las colas de empleados para esta proyección

            // 1. Ordenar las órdenes para la cola
            let ordenesParaCola = Object.values(aggregatedOrders);
            ordenesParaCola.sort((a, b) => {
                // Prioridad por orden_fila_orden (numérica)
                if (a.orden_fila_orden !== b.orden_fila_orden) {
                    return a.orden_fila_orden - b.orden_fila_orden;
                }
                // Desempate por fecha_inicio_programada_orden (más antigua primero)
                const dateA = a.fecha_inicio_programada_orden ? a.fecha_inicio_programada_orden.getTime() : Infinity;
                const dateB = b.fecha_inicio_programada_orden ? b.fecha_inicio_programada_orden.getTime() : Infinity;
                if (dateA !== dateB) {
                    return dateA - dateB;
                }
                // Desempate final por id_orden
                return parseInt(a.id_orden) - parseInt(b.id_orden);
            });

            // 2. Procesar la cola por cada orden y sus departamentos
            for (const orden of ordenesParaCola) {
                // Hacer una copia profunda de la orden para evitar efectos secundarios en otras proyecciones
                const ordenActual = JSON.parse(JSON.stringify(orden));
                ordenActual.items_departamentos = []; // Reset para poblar con recalculados

                let fechaFinDeptoAnteriorEnEstaOrden = null;
                let fechaInicioRealPrimerDeptoDeLaOrden = null;

                // Ordenar los departamentos de esta orden por orden_proceso_departamento
                const deptosOrdenados = [...ordenActual.departamentos_raw].sort((a, b) => a.orden_proceso_departamento - b.orden_proceso_departamento);

                for (const deptoRaw of deptosOrdenados) {
                    const deptoRecalculado = JSON.parse(JSON.stringify(deptoRaw)); // Copia profunda

                    // Convertir fechas de string a Date (si JSON.parse las convirtió)
                    deptoRecalculado.fecha_inicio = deptoRecalculado.fecha_inicio ? new Date(deptoRecalculado.fecha_inicio.replace(" ", "T")) : null;
                    deptoRecalculado.fecha_terminado = deptoRecalculado.fecha_terminado ? new Date(deptoRecalculado.fecha_terminado.replace(" ", "T")) : null;

                    const idEmp = deptoRecalculado.id_empleado;
                    const debugIdTarea = `Orden ${ordenActual.id_orden}, Depto ${deptoRecalculado.nombre_departamento} (Emp ${idEmp})`;

                    // Formateo inicial para visualización, incluso si no son fechas calculadas finales aún
                    deptoRecalculado.fecha_inicio_formateada = deptoRecalculado.fecha_inicio ? self.formatDateTime12h(deptoRecalculado.fecha_inicio) : 'N/A';
                    deptoRecalculado.fecha_terminado_formateada = deptoRecalculado.fecha_terminado ? self.formatDateTime12h(deptoRecalculado.fecha_terminado) : 'N/A';
                    deptoRecalculado.tiempo_depto_formateado = self.formatearTiempo((deptoRecalculado.tiempo_total_orden_depto || 0) * 1000);


                    if (deptoRecalculado.fecha_terminado) { // Departamento ya terminado
                        deptoRecalculado.fecha_inicio_calculada = deptoRecalculado.fecha_inicio; // El inicio calculado es el real
                        deptoRecalculado.fecha_finalizacion_estimada = new Date(deptoRecalculado.fecha_terminado.getTime());

                        const finTerminadoAjustado = self.ajustarInicioAlHorarioLaboral(new Date(deptoRecalculado.fecha_terminado.getTime()), horarioLaboral);
                        if (finTerminadoAjustado) {
                            if (!colasPorEmpleado[idEmp] || finTerminadoAjustado.getTime() > colasPorEmpleado[idEmp].getTime()) {
                                colasPorEmpleado[idEmp] = new Date(finTerminadoAjustado.getTime());
                            }
                            fechaFinDeptoAnteriorEnEstaOrden = new Date(finTerminadoAjustado.getTime());
                        } else {
                            console.error(`[ProyCola Simplified] Error ajustando fin de depto terminado ${debugIdTarea}`);
                            deptoRecalculado.fecha_finalizacion_estimada_formateada = "ErrAjusteFinTerm";
                        }
                        if (!fechaInicioRealPrimerDeptoDeLaOrden && deptoRecalculado.fecha_inicio_calculada) {
                            fechaInicioRealPrimerDeptoDeLaOrden = new Date(deptoRecalculado.fecha_inicio_calculada.getTime());
                        }

                    } else { // Departamento PENDIENTE
                        let fechaProximaDisponibleEmpleado = colasPorEmpleado[idEmp] ? new Date(colasPorEmpleado[idEmp].getTime()) : new Date(projectionStartingPoint.getTime());

                        let inicioTentativoDepto = new Date(fechaProximaDisponibleEmpleado.getTime());

                        if (fechaFinDeptoAnteriorEnEstaOrden) {
                            inicioTentativoDepto = new Date(Math.max(inicioTentativoDepto.getTime(), fechaFinDeptoAnteriorEnEstaOrden.getTime()));
                        }
                        if (deptoRecalculado.fecha_inicio) { // Si el departamento tiene una fecha_inicio programada original
                            const deptoFIOriginalAjustada = self.ajustarInicioAlHorarioLaboral(deptoRecalculado.fecha_inicio, horarioLaboral);
                            if (deptoFIOriginalAjustada && deptoFIOriginalAjustada > inicioTentativoDepto) {
                                inicioTentativoDepto = deptoFIOriginalAjustada;
                            }
                        }

                        const inicioCalculadoAjustado = self.ajustarInicioAlHorarioLaboral(inicioTentativoDepto, horarioLaboral);

                        if (!inicioCalculadoAjustado) {
                            console.error(`[ProyCola Simplified] Error ajustando inicio para ${debugIdTarea}. Inicio tentativo: ${inicioTentativoDepto.toISOString()}`);
                            deptoRecalculado.fecha_inicio_calculada_formateada = "ErrAjusteIniDepto";
                            deptoRecalculado.fecha_finalizacion_estimada_formateada = "ErrAjusteIniDepto";
                            ordenActual.items_departamentos.push(deptoRecalculado);
                            fechaFinDeptoAnteriorEnEstaOrden = null;
                            break;
                        }

                        deptoRecalculado.fecha_inicio_calculada = new Date(inicioCalculadoAjustado.getTime());
                        if (!fechaInicioRealPrimerDeptoDeLaOrden) {
                            fechaInicioRealPrimerDeptoDeLaOrden = new Date(inicioCalculadoAjustado.getTime());
                        }

                        const tiempoDeptoMs = (deptoRecalculado.tiempo_total_orden_depto || 0) * 1000;
                        const finEstimadoDepto = self.calcularFechaFinTarea(
                            new Date(inicioCalculadoAjustado.getTime()),
                            tiempoDeptoMs,
                            horarioLaboral,
                            debugIdTarea
                        );

                        if (!finEstimadoDepto) {
                            console.error(`[ProyCola Simplified] Error calculando fin para ${debugIdTarea}`);
                            deptoRecalculado.fecha_finalizacion_estimada_formateada = "ErrCalcFinDepto";
                            ordenActual.items_departamentos.push(deptoRecalculado);
                            fechaFinDeptoAnteriorEnEstaOrden = null;
                            break;
                        }

                        deptoRecalculado.fecha_finalizacion_estimada = new Date(finEstimadoDepto.getTime());
                        colasPorEmpleado[idEmp] = new Date(finEstimadoDepto.getTime());
                        fechaFinDeptoAnteriorEnEstaOrden = new Date(finEstimadoDepto.getTime());
                    }

                    // Formatear las fechas calculadas
                    if (!deptoRecalculado.fecha_inicio_calculada_formateada) {
                        deptoRecalculado.fecha_inicio_calculada_formateada = deptoRecalculado.fecha_inicio_calculada ? self.formatDateTime12h(deptoRecalculado.fecha_inicio_calculada) : 'Error';
                    }
                    if (!deptoRecalculado.fecha_finalizacion_estimada_formateada) {
                        deptoRecalculado.fecha_finalizacion_estimada_formateada = deptoRecalculado.fecha_finalizacion_estimada ? self.formatDateTime12h(deptoRecalculado.fecha_finalizacion_estimada) : 'Error';
                    }

                    ordenActual.items_departamentos.push(deptoRecalculado);
                } // Fin for deptoRaw of deptosOrdenados

                ordenActual.fecha_inicio_real_en_cola = fechaInicioRealPrimerDeptoDeLaOrden;
                ordenActual.fecha_finalizacion_estimada_en_cola = fechaFinDeptoAnteriorEnEstaOrden;

                // Formateo final de la orden
                ordenActual.fecha_entrega_formateada = ordenActual.fecha_entrega_orden ? self.formatDate(ordenActual.fecha_entrega_orden) : 'N/A';
                ordenActual.fecha_inicio_formateada = ordenActual.fecha_inicio_real_en_cola ? self.formatDateTime12h(ordenActual.fecha_inicio_real_en_cola) : 'N/A'; // No se usa fecha_inicio_programada_orden aquí
                ordenActual.fecha_estimada_entrega_formateada = ordenActual.fecha_finalizacion_estimada_en_cola ? self.formatDateTime12h(ordenActual.fecha_finalizacion_estimada_en_cola) : 'Error en cálculo de fin';

                // Lógica de variant y variant_text (adaptada)
                ordenActual.variant = 'secondary'; ordenActual.variant_text = '';
                const todosDeptosTerminados = ordenActual.departamentos_raw.every(d => d.fecha_terminado);
                const algunDeptoPendiente = ordenActual.items_departamentos.some(d => !d.fecha_finalizacion_estimada || !d.fecha_terminado);
                const ningunDeptoIniciado = ordenActual.departamentos_raw.every(d => !d.fecha_inicio);

                if (todosDeptosTerminados && !algunDeptoPendiente) {
                    ordenActual.variant = 'info'; ordenActual.variant_text = 'TERMINADO';
                }
                else if (ningunDeptoIniciado && ordenActual.fecha_inicio_real_en_cola && ordenActual.fecha_inicio_real_en_cola > currentExecutionMoment) {
                    ordenActual.variant = 'light'; ordenActual.variant_text = 'Por iniciar';
                } else if (ordenActual.fecha_entrega_orden instanceof Date && !isNaN(ordenActual.fecha_entrega_orden.getTime())) {
                    if (ordenActual.fecha_finalizacion_estimada_en_cola && ordenActual.fecha_finalizacion_estimada_en_cola > ordenActual.fecha_entrega_orden) {
                        ordenActual.variant = 'warning'; ordenActual.variant_text = 'EN EL DÍA';
                    } else {
                        const hoyNormalizada = new Date(currentExecutionMoment.getFullYear(), currentExecutionMoment.getMonth(), currentExecutionMoment.getDate());
                        const entregaPactadaNormalizada = new Date(ordenActual.fecha_entrega_orden.getFullYear(), ordenActual.fecha_entrega_orden.getMonth(), ordenActual.fecha_entrega_orden.getDate());
                        if (entregaPactadaNormalizada.getTime() < hoyNormalizada.getTime() && algunDeptoPendiente) {
                            ordenActual.variant = 'danger'; ordenActual.variant_text = 'RETRASADO';
                        } else if (entregaPactadaNormalizada.getTime() === hoyNormalizada.getTime()) {
                            ordenActual.variant = 'warning'; ordenActual.variant_text = 'EN EL DÍA';
                        } else {
                            ordenActual.variant = 'success'; ordenActual.variant_text = 'A TIEMPO';
                        }
                    }
                } else {
                    if (!ordenActual.fecha_finalizacion_estimada_en_cola) {
                        ordenActual.variant = 'light'; ordenActual.variant_text = 'Error Cálculo Cola';
                    } else {
                        ordenActual.variant = 'light'; ordenActual.variant_text = 'Sin fecha entrega';
                    }
                }
                // Añadir la orden procesada a la lista final
                return ordenActual;
            }
        },

        /**
         * Proyecta las fechas de entrega considerando la cola de trabajo por empleado y departamento.
         * Esta versión simplificada trabaja con tiempo total por orden/departamento.
         * @param {Array} dataOrdenesDeptos - Array de objetos de departamento de las órdenes (ya con tiempo_total_orden_depto).
         * @param {Object} horarioLaboral - Definición del horario laboral.
         * @returns {Object} Un objeto con { proyeccionConsistente, proyeccionActual }.
         */
        proyectarEntregaConColaSimplificado(dataOrdenesDeptos, horarioLaboral) {
            console.log("MIXIN COLA SIMPLIFICADO: proyectarEntregaConColaSimplificado LLAMADO");
            if (!dataOrdenesDeptos || !Array.isArray(dataOrdenesDeptos)) { console.error("MIXIN COLA SIMPLIFICADO ERROR: 'dataOrdenesDeptos' no es un array."); return { proyeccionConsistente: [], proyeccionActual: [] }; }
            if (!horarioLaboral || typeof horarioLaboral !== 'object' || !horarioLaboral.diasLaborales || !horarioLaboral.diasLaborales.length) {
                console.error("MIXIN COLA SIMPLIFICADO ERROR: 'horarioLaboral' inválido.", horarioLaboral); return { proyeccionConsistente: [], proyeccionActual: [] };
            }

            const self = this; // Captura el contexto 'this'

            const resumenTiemposPorPuesto = self.calcularTiemposAcumuladosPorPuestoSimplificado(dataOrdenesDeptos);
            const currentExecutionMoment = new Date(); // Momento exacto de ejecución

            // 1. Pre-procesamiento: Agrupar por orden y consolidar departamentos
            const aggregatedOrders = {};
            dataOrdenesDeptos.forEach(item => {
                const { id_orden, orden_fila_orden, fecha_entrega_orden } = item;

                if (!aggregatedOrders[id_orden]) {
                    aggregatedOrders[id_orden] = {
                        id_orden: id_orden,
                        orden_fila_orden: parseInt(orden_fila_orden),
                        fecha_entrega_orden: fecha_entrega_orden ? new Date(fecha_entrega_orden.replace(" ", "T")) : null,
                        departamentos_raw: [], // Almacena los ítems de departamento brutos para esta orden
                        fecha_inicio_programada_orden: null, // Buscar la fecha_inicio más temprana en los departamentos
                    };
                }

                // Asegurar que fecha_entrega_orden de la orden sea la primera encontrada o la más temprana (si hay duplicados)
                if (item.fecha_entrega_orden && (!aggregatedOrders[id_orden].fecha_entrega_orden || new Date(item.fecha_entrega_orden.replace(" ", "T")) < aggregatedOrders[id_orden].fecha_entrega_orden)) {
                    aggregatedOrders[id_orden].fecha_entrega_orden = new Date(item.fecha_entrega_orden.replace(" ", "T"));
                }

                // Buscar la fecha_inicio_programada_orden más temprana
                if (item.fecha_inicio && (!aggregatedOrders[id_orden].fecha_inicio_programada_orden || new Date(item.fecha_inicio.replace(" ", "T")) < aggregatedOrders[id_orden].fecha_inicio_programada_orden)) {
                    aggregatedOrders[id_orden].fecha_inicio_programada_orden = new Date(item.fecha_inicio.replace(" ", "T"));
                }

                aggregatedOrders[id_orden].departamentos_raw.push(item);
            });

            // Ajustar el inicio de la jornada laboral para consistencia
            let fixedDailyStart = new Date(currentExecutionMoment.getFullYear(), currentExecutionMoment.getMonth(), currentExecutionMoment.getDate());
            fixedDailyStart.setHours(Math.floor(horarioLaboral.horaInicioManana), (horarioLaboral.horaInicioManana % 1) * 60, 0, 0);
            fixedDailyStart = self.ajustarInicioAlHorarioLaboral(fixedDailyStart, horarioLaboral); // Asegura que sea un punto laboral válido

            // 2. Ejecutar la proyección para el inicio fijo del día laboral (proyección consistente)
            const consistentProjectionResult = self._processOrdersForProjectionSimplified(
                JSON.parse(JSON.stringify(aggregatedOrders)), // Copia profunda
                fixedDailyStart,
                horarioLaboral,
                currentExecutionMoment
            );

            // 3. Ejecutar la proyección para el momento actual (proyección actual)
            const effectiveRealtimeStart = new Date(Math.max(fixedDailyStart.getTime(), currentExecutionMoment.getTime()));
            const actualProjectionResult = self._processOrdersForProjectionSimplified(
                JSON.parse(JSON.stringify(aggregatedOrders)), // Otra copia profunda
                effectiveRealtimeStart,
                horarioLaboral,
                currentExecutionMoment
            );

            const r = {
                proyeccionConsistente: consistentProjectionResult,
                proyeccionActual: actualProjectionResult
            };

            console.log('respuesta mixin simplificado', r);

            return r

        }
    }
};