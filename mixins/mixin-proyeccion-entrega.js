// mixin-proyeccion-cola-ordenes-FINAL-CON-POR-INICIAR.js
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
                            if(!reAjustada){
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

        /**
         * Calcula las fechas de inicio y fin estimadas para los departamentos de UNA SOLA orden (aislada).
         * @param {Date|null} fechaInicioCalculoParaPendientes - Fecha a partir de la cual empiezan los deptos pendientes.
         * @param {Array} itemsDepartamentosOriginal - Array de objetos de departamento para ESTA orden.
         * @param {Object} horarioLaboral - Definición del horario laboral.
         * @returns {Object} Objeto con { fechaFinalOrdenPendientes, duracionNetaOriginalTotalSegundos, duracionNetaPendienteSegundos, itemsDepartamentosActualizados }.
         */
        calcularDuracionesYFechasDeptos(fechaInicioCalculoParaPendientes, itemsDepartamentosOriginal, horarioLaboral) {
            const itemsCalculados = JSON.parse(JSON.stringify(itemsDepartamentosOriginal));
            let duracionNetaPendienteSegundos = 0;
            let duracionNetaOriginalTotalSegundos = 0;

            itemsCalculados.forEach(depto => {
                const tiempoDepto = (depto.tiempo_estimado_segundos || 0);
                duracionNetaOriginalTotalSegundos += tiempoDepto;
                depto.fecha_inicio_original_item = depto.fecha_inicio_original_item ? new Date(depto.fecha_inicio_original_item) : null;
                depto.fecha_terminado = depto.fecha_terminado ? new Date(depto.fecha_terminado) : null;

                depto.fecha_inicio_original_item_formateada = depto.fecha_inicio_original_item ? this.formatDateTime12h(depto.fecha_inicio_original_item) : 'N/A';
                depto.fecha_terminado_original_item_formateada = depto.fecha_terminado ? this.formatDateTime12h(depto.fecha_terminado) : 'N/A';
                
                depto.tiempo_estimado_depto_formateado = this.formatearTiempo(tiempoDepto * 1000);
                 if (depto.tiempo_real_depto_segundos !== undefined && depto.tiempo_real_depto_formateado === undefined) {
                     depto.tiempo_real_depto_formateado = this.formatearTiempo(depto.tiempo_real_depto_segundos * 1000);
                } else if (depto.tiempo_real_depto_segundos === undefined) {
                    depto.tiempo_real_depto_segundos = 0; 
                    depto.tiempo_real_depto_formateado = "0s";
                }

                if (!depto.fecha_terminado) {
                    duracionNetaPendienteSegundos += tiempoDepto;
                    depto.fecha_finalizacion_estimada_depto_formateada = 'Pendiente';
                    depto.fecha_inicio_calculada_depto_formateada = 'Pendiente';
                } else {
                    depto.fecha_finalizacion_estimada_depto = new Date(depto.fecha_terminado.getTime());
                    depto.filaOrdenFila_formateada = depto.fecha_inicio_original_item_formateada; //Asumimos que el inicio calculado es el original si ya terminó
                    depto.fecha_finalizacion_estimada_depto_formateada = depto.fecha_terminado_original_item_formateada;
                }
            });

            if (!(fechaInicioCalculoParaPendientes instanceof Date && !isNaN(fechaInicioCalculoParaPendientes.getTime()))) {
                itemsCalculados.forEach(d => {
                    if (!d.fecha_terminado) {
                        d.fecha_finalizacion_estimada_depto_formateada = 'Sin_Inicio_Orden_Calc';
                        if (d.fecha_inicio_calculada_depto_formateada === 'Pendiente') {
                             d.fecha_inicio_calculada_depto_formateada = d.fecha_inicio_original_item_formateada !== 'N/A' ? d.fecha_inicio_original_item_formateada : 'Sin_Inicio_Orden_Calc';
                        }
                    }
                });
                return { fechaFinalOrdenPendientes: null, duracionNetaOriginalTotalSegundos, duracionNetaPendienteSegundos, itemsDepartamentosActualizados: itemsCalculados };
            }

            let fechaCalculoActual = this.ajustarInicioAlHorarioLaboral(new Date(fechaInicioCalculoParaPendientes.getTime()), horarioLaboral);

            if (!fechaCalculoActual) {
                itemsCalculados.forEach(d => {
                     if (!d.fecha_terminado){
                        d.fecha_finalizacion_estimada_depto_formateada = 'Err_Ajuste_Inicio_Calc';
                        if (d.fecha_inicio_calculada_depto_formateada === 'Pendiente') {
                           d.fecha_inicio_calculada_depto_formateada = d.fecha_inicio_original_item_formateada !== 'N/A' ? d.fecha_inicio_original_item_formateada : 'Err_Ajuste_Inicio_Calc';
                        }
                     }
                });
                return { fechaFinalOrdenPendientes: null, duracionNetaOriginalTotalSegundos, duracionNetaPendienteSegundos, itemsDepartamentosActualizados: itemsCalculados };
            }

            for (const depto of itemsCalculados) {
                if (!fechaCalculoActual) {
                    if (!depto.fecha_terminado) {
                        depto.fecha_inicio_calculada_depto_formateada = "Err_Flujo_Previo_Calc";
                        depto.fecha_finalizacion_estimada_depto_formateada = "Err_Flujo_Previo_Calc";
                    }
                    continue;
                }

                if (depto.fecha_terminado) {
                    const finDeEsteTerminadoAjustado = this.ajustarInicioAlHorarioLaboral(new Date(depto.fecha_terminado.getTime()), horarioLaboral);
                    if (finDeEsteTerminadoAjustado) {
                        if (finDeEsteTerminadoAjustado > fechaCalculoActual) {
                             fechaCalculoActual = finDeEsteTerminadoAjustado;
                        }
                         // Asegurar que la fecha de finalización estimada del depto sea la ajustada para consistencia
                        depto.fecha_finalizacion_estimada_depto = new Date(finDeEsteTerminadoAjustado.getTime());
                        depto.fecha_finalizacion_estimada_depto_formateada = this.formatDateTime12h(finDeEsteTerminadoAjustado);

                    } else {
                        console.error(`Error ajustando fin de depto terminado: ${depto.nombre_departamento} en calcularDuracionesYFechasDeptos`);
                        fechaCalculoActual = null;
                        depto.fecha_finalizacion_estimada_depto_formateada = "Err_Ajuste_Fin_Term_Calc";
                        continue;
                    }
                    continue;
                }

                let inicioDeptoCalculadoTentativo = new Date(fechaCalculoActual.getTime());
                if (depto.fecha_inicio_original_item) {
                    const deptoFIOriginalAjustada = this.ajustarInicioAlHorarioLaboral(depto.fecha_inicio_original_item, horarioLaboral);
                    if (deptoFIOriginalAjustada && deptoFIOriginalAjustada > inicioDeptoCalculadoTentativo) {
                        inicioDeptoCalculadoTentativo = deptoFIOriginalAjustada;
                    }
                }
                
                const inicioDeptoCalculadoAjustado = this.ajustarInicioAlHorarioLaboral(inicioDeptoCalculadoTentativo, horarioLaboral);

                if (!inicioDeptoCalculadoAjustado) {
                     depto.fecha_inicio_calculada_depto_formateada = "Err_Ajuste_Ini_Depto_Calc";
                     depto.fecha_finalizacion_estimada_depto_formateada = "Err_Ajuste_Ini_Depto_Calc";
                     fechaCalculoActual = null;
                     continue;
                }
                depto.fecha_inicio_calculada_depto = new Date(inicioDeptoCalculadoAjustado.getTime()); // Guardar como Date
                depto.fecha_inicio_calculada_depto_formateada = this.formatDateTime12h(inicioDeptoCalculadoAjustado);
                
                let tiempoDeptoMs = (depto.tiempo_estimado_segundos || 0) * 1000;
                const debugIdTarea = `Depto ${depto.id_departamento || depto.nombre_departamento} (CalcIndividual)`;
                const finDeptoCalculado = this.calcularFechaFinTarea(inicioDeptoCalculadoAjustado, tiempoDeptoMs, horarioLaboral, debugIdTarea);

                if (finDeptoCalculado) {
                    depto.fecha_finalizacion_estimada_depto = new Date(finDeptoCalculado.getTime());
                    depto.fecha_finalizacion_estimada_depto_formateada = this.formatDateTime12h(depto.fecha_finalizacion_estimada_depto);
                    fechaCalculoActual = new Date(depto.fecha_finalizacion_estimada_depto.getTime());
                } else {
                    depto.fecha_finalizacion_estimada_depto = null;
                    depto.fecha_finalizacion_estimada_depto_formateada = "Err_Fin_Depto_Loop_Calc";
                    fechaCalculoActual = null;
                }
            }

            return {
                fechaFinalOrdenPendientes: fechaCalculoActual,
                duracionNetaOriginalTotalSegundos,
                duracionNetaPendienteSegundos,
                itemsDepartamentosActualizados: itemsCalculados
            };
        },

        /**
         * Calcula el resumen de tiempos pendientes por puesto (departamento).
         * @param {Array} dataOrdenesOriginal - Datos de entrada.
         * @returns {Object} Tiempos acumulados por puesto.
         */
        calcularTiemposAcumuladosPorPuesto(dataOrdenesOriginal) {
            // --- CAMBIO AÑADIDO: Capturar el contexto 'this' ---
            const self = this; 
            // --- FIN CAMBIO ---

            if (!dataOrdenesOriginal || !Array.isArray(dataOrdenesOriginal)) {
                console.warn("[calcularTiemposAcumuladosPorPuesto] dataOrdenesOriginal no es un array válido.");
                return {};
            }
            const tiemposPorPuesto = {};
            const todosLosDepartamentos = dataOrdenesOriginal.map(item => {
                if (item.id_departamento === null || item.id_departamento === undefined) {
                    return null;
                }
                return {
                    id_orden: item.id_orden,
                    id_departamento: item.id_departamento,
                    item: item,
                    nombre_departamento: item.nombre_departamento,
                    tiempo_estimado_segundos: (parseInt(item.tiempo_estimado_produccion) || 0) * (parseInt(item.cantidad) || 0),
                    fecha_terminado: item.fecha_terminado 
                };
            }).filter(depto => depto !== null);

            todosLosDepartamentos.forEach(depto => {
                const ftOriginalDate = depto.fecha_terminado ? new Date(depto.fecha_terminado.replace(" ", "T")) : null;
                const estaTerminado = ftOriginalDate instanceof Date && !isNaN(ftOriginalDate.getTime());

                if (!estaTerminado) { 
                    if (!tiemposPorPuesto[depto.id_departamento]) {
                        tiemposPorPuesto[depto.id_departamento] = {
                            id_departamento: depto.id_departamento,
                            // item: depto,
                            fecha_inicio: depto.item.fecha_inicio,
                            fecha_terminado: depto.item.fecha_terminado,
                            nombre_departamento: depto.nombre_departamento,
                            tiempo_total_pendiente_segundos: 0,
                        };
                    }
                    tiemposPorPuesto[depto.id_departamento].tiempo_total_pendiente_segundos += depto.tiempo_estimado_segundos;
                }
            });

            for (const idDepto in tiemposPorPuesto) {
                // --- CAMBIO APLICADO AQUÍ: Usar 'self' en lugar de 'this' ---
                tiemposPorPuesto[idDepto].tiempo_total_pendiente_formateado = self.formatearTiempo(tiemposPorPuesto[idDepto].tiempo_total_pendiente_segundos * 1000);
            }
            return tiemposPorPuesto;
        },

        /**
         * Proyecta las fechas de entrega considerando la cola de trabajo por empleado y departamento.
         * @param {Array} dataOrdenes - Array de items de departamento de las órdenes.
         * @param {Object} horarioLaboral - Definición del horario laboral.
         * @returns {Array} Array de órdenes procesadas con fechas estimadas.
         */
        parseFechaFlexible(fechaString) {
            if (!fechaString || typeof fechaString !== 'string') return null;

            // Primero, intentar el formato estándar YYYY-MM-DD, que new Date() maneja bien.
            // El replace de /-/g por '/' ayuda a evitar problemas de zona horaria (convierte a local).
            let date = new Date(fechaString.replace(/-/g, '/'));
            if (date instanceof Date && !isNaN(date.getTime())) {
                if (date.getFullYear() > 2000) {
                    return date;
                }
            }

            // Si falla o el año es incorrecto, intentar el formato DD-MM-YYYY
            const parts = fechaString.split(' ')[0].split('-');
            if (parts.length === 3) {
                const [day, month, year] = parts.map(p => parseInt(p, 10));
                if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 2000) {
                    const ddmmyyyyDate = new Date(year, month - 1, day);
                    if (ddmmyyyyDate.getFullYear() === year && ddmmyyyyDate.getMonth() === month - 1 && ddmmyyyyDate.getDate() === day) {
                        return ddmmyyyyDate;
                    }
                }
            }
            
            return null; // Si ambos fallan
        },

        proyectarEntregaConCola(dataOrdenes, horarioLaboral) {
            console.log("MIXIN COLA vFinal: proyectarEntregaConCola LLAMADO");
            if (!dataOrdenes || !Array.isArray(dataOrdenes)) { console.error("MIXIN COLA ERROR: 'dataOrdenes' no es un array."); return []; }
            if (!horarioLaboral || typeof horarioLaboral !== 'object' || !horarioLaboral.diasLaborales || !horarioLaboral.diasLaborales.length) {
                 console.error("MIXIN COLA ERROR: 'horarioLaboral' inválido.", horarioLaboral); return [];
            }

            const resumenTiemposPorPuesto = this.calcularTiemposAcumuladosPorPuesto(dataOrdenes);

            // --- INICIO DE LOS CAMBIOS RELEVANTES ---
            const realCurrentMoment = new Date(); // La hora exacta en que se ejecuta el mixin (para comparaciones de estado real)

            // Paso 1: Definir el "inicio del día laboral" para la fecha actual (ej. 2025-06-04 08:30:00)
            let fixedDailyStartOfBusiness = new Date(realCurrentMoment.getFullYear(), realCurrentMoment.getMonth(), realCurrentMoment.getDate());
            fixedDailyStartOfBusiness.setHours(Math.floor(horarioLaboral.horaInicioManana), (horarioLaboral.horaInicioManana % 1) * 60, 0, 0);

            // Paso 2: Ajustar este "inicio del día laboral" para asegurar que caiga en un horario laboral válido
            // Esto es crucial si el día actual es un fin de semana o si el horario inicial está en una pausa
            fixedDailyStartOfBusiness = this.ajustarInicioAlHorarioLaboral(fixedDailyStartOfBusiness, horarioLaboral);

            // Paso 3: Determinar el punto de partida REAL para la proyección de colas de empleados
            // Debe ser el MÁXIMO entre el "inicio fijo del día laboral" y el "momento actual real"
            // Esto garantiza consistencia PERO no proyecta trabajo "hacia atrás" si el usuario llega tarde en el día
            const projectionStartingPoint = new Date(Math.max(fixedDailyStartOfBusiness.getTime(), realCurrentMoment.getTime()));
            // --- FIN DE LOS CAMBIOS RELEVANTES ---


            const colasPorEmpleado = {}; // Clave: id_empleado, Valor: Date (próxima disponibilidad)

            const ordenesAgregadas = {};
            // 1. Agregación y conversión inicial
            dataOrdenes.forEach(item => {
                const { id_orden, id_producto, id_empleado, 
                        nombre_producto, cantidad, nombre_departamento,
                        tiempo_estimado_produccion, orden_proceso_departamento,
                        fecha_inicio, fecha_terminado, fecha_entrega_orden, orden_fila_orden
                } = item;
                const idDeptoOriginal = item.id_departamento;

                if (id_empleado === null || id_empleado === undefined) {
                    console.warn(`Item de orden ${id_orden}, depto ${nombre_departamento} no tiene id_empleado. Saltando item.`);
                    return; 
                }

                let itemFechaInicioDate = fecha_inicio ? new Date(fecha_inicio.replace(" ", "T")) : null;
                if (itemFechaInicioDate && isNaN(itemFechaInicioDate.getTime())) itemFechaInicioDate = null;
                let itemFechaTerminadoDate = fecha_terminado ? new Date(fecha_terminado.replace(" ", "T")) : null;
                if (itemFechaTerminadoDate && isNaN(itemFechaTerminadoDate.getTime())) itemFechaTerminadoDate = null;
                let itemFechaEntregaDate = fecha_entrega_orden ? this.parseFechaFlexible(fecha_entrega_orden) : null;
                if (itemFechaEntregaDate && isNaN(itemFechaEntregaDate.getTime())) itemFechaEntregaDate = null;

                const cantidadParsed = parseInt(cantidad) || 0;
                const tiempoItemSegundos = (parseInt(tiempo_estimado_produccion) || 0) * cantidadParsed;

                let tiempoRealDeptoSegundos = 0;
                if (itemFechaInicioDate && itemFechaTerminadoDate) {
                    const diffMs = itemFechaTerminadoDate.getTime() - itemFechaInicioDate.getTime();
                    if (diffMs >= 0) { tiempoRealDeptoSegundos = Math.floor(diffMs / 1000); }
                }
                
                if (!ordenesAgregadas[id_orden]) {
                    ordenesAgregadas[id_orden] = {
                        id_orden: id_orden,
                        orden_fila_orden: orden_fila_orden !== null && orden_fila_orden !== undefined ? parseInt(orden_fila_orden) : Infinity,
                        items_departamentos_originales: [],
                        items_departamentos: [], // Se poblará en el paso 4
                        fecha_inicio_programada_orden: null,
                        tiempo_total_original_orden_segundos: 0,
                        duracion_pendiente_orden_segundos: 0,
                        fecha_final_calculada_individual_pendientes: null,
                        fecha_entrega_orden: itemFechaEntregaDate,
                        fecha_inicio_real_en_cola: null,
                        fecha_finalizacion_estimada_en_cola: null,
                        resumen_tiempos_pendientes_por_puesto: resumenTiemposPorPuesto,
                        productos: [],
                        productos_info_temp: {},
                        fecha_inicio_formateada: 'No iniciada',
                        fecha_entrega_formateada: 'Pendiente formatear',
                        fecha_estimada_entrega_formateada: 'No calculada',
                        tiempo_neto_orden_formateado: '',
                        tiempo_pendiente_orden_formateado: '',
                        variant: 'secondary', variant_text: ''
                    };
                } else {
                    if (itemFechaEntregaDate && !ordenesAgregadas[id_orden].fecha_entrega_orden) {
                         ordenesAgregadas[id_orden].fecha_entrega_orden = itemFechaEntregaDate;
                    }
                }
                const currentFilaOrden = orden_fila_orden !== null && orden_fila_orden !== undefined ? parseInt(orden_fila_orden) : Infinity;
                if (currentFilaOrden < ordenesAgregadas[id_orden].orden_fila_orden) {
                    ordenesAgregadas[id_orden].orden_fila_orden = currentFilaOrden;
                }

                ordenesAgregadas[id_orden].items_departamentos_originales.push({
                    id_orden, // Manteniendo el cambio anterior
                    id_producto, id_departamento: idDeptoOriginal, id_empleado, 
                    nombre_producto, cantidad: cantidadParsed, nombre_departamento,
                    tiempo_estimado_segundos: tiempoItemSegundos,
                    orden_proceso: parseInt(orden_proceso_departamento),
                    orden_fila_orden: parseInt(orden_fila_orden),
                    fecha_inicio_original_item: itemFechaInicioDate, // Date o null
                    fecha_terminado: itemFechaTerminadoDate,       // Date o null
                    tiempo_estimado_depto_formateado: this.formatearTiempo(tiempoItemSegundos * 1000),
                    tiempo_real_depto_segundos: tiempoRealDeptoSegundos,
                    tiempo_real_depto_formateado: this.formatearTiempo(tiempoRealDeptoSegundos * 1000),
                });
                ordenesAgregadas[id_orden].tiempo_total_original_orden_segundos += tiempoItemSegundos;

                if (!ordenesAgregadas[id_orden].productos_info_temp[id_producto]) {
                    ordenesAgregadas[id_orden].productos_info_temp[id_producto] = {
                        id_producto, nombre_producto, cantidad_total: 0,
                        tiempo_total_estimado_producto_segundos: 0,
                    };
                }
                ordenesAgregadas[id_orden].productos_info_temp[id_producto].cantidad_total += cantidadParsed;
                ordenesAgregadas[id_orden].productos_info_temp[id_producto].tiempo_total_estimado_producto_segundos += tiempoItemSegundos;
            });

            // 2. Cálculo individual de duraciones (sin colas de empleados, para `duracion_pendiente_orden_segundos`)
            for (const id_orden in ordenesAgregadas) {
                const orden = ordenesAgregadas[id_orden];
                let itemsParaCalculoInd = JSON.parse(JSON.stringify(orden.items_departamentos_originales));
                itemsParaCalculoInd.sort((a, b) => a.orden_proceso - b.orden_proceso);

                orden.fecha_inicio_programada_orden = null;
                let puntoPartidaParaCalculoIndividual = null;
                let ultimoTerminadoFecha = null;
                let primerPendienteConFechaInicio = null;

                for(const depto of itemsParaCalculoInd){
                    // Las fechas ya son Date o null por el parseo de JSON.parse(JSON.stringify(new Date()))
                    const fiOriginalDate = depto.fecha_inicio_original_item ? new Date(depto.fecha_inicio_original_item) : null;
                    const ftOriginalDate = depto.fecha_terminado ? new Date(depto.fecha_terminado) : null;

                    if (fiOriginalDate) {
                        if (!orden.fecha_inicio_programada_orden || fiOriginalDate < orden.fecha_inicio_programada_orden) {
                            orden.fecha_inicio_programada_orden = fiOriginalDate;
                        }
                    }
                    if(ftOriginalDate){ ultimoTerminadoFecha = ftOriginalDate; }
                    else if(!primerPendienteConFechaInicio && fiOriginalDate){ primerPendienteConFechaInicio = fiOriginalDate; }
                }

                if(primerPendienteConFechaInicio) { puntoPartidaParaCalculoIndividual = new Date(primerPendienteConFechaInicio.getTime()); }
                else if (ultimoTerminadoFecha) { puntoPartidaParaCalculoIndividual = new Date(ultimoTerminadoFecha.getTime()); }
                else if (orden.fecha_inicio_programada_orden) { puntoPartidaParaCalculoIndividual = new Date(orden.fecha_inicio_programada_orden.getTime()); }
                // CAMBIO: Usar 'projectionStartingPoint' para la partida individual si no hay referencias
                else { puntoPartidaParaCalculoIndividual = new Date(projectionStartingPoint.getTime()); } 


                const calculoIndividual = this.calcularDuracionesYFechasDeptos(
                    puntoPartidaParaCalculoIndividual, itemsParaCalculoInd, horarioLaboral
                );
                if (calculoIndividual) {
                    orden.duracion_pendiente_orden_segundos = calculoIndividual.duracionNetaPendienteSegundos || 0;
                    orden.fecha_final_calculada_individual_pendientes = calculoIndividual.fechaFinalOrdenPendientes; // Date o null
                } else {
                    console.warn(`Fallo en calculoIndividual para orden ${id_orden}. Estimando duración pendiente.`);
                    orden.duracion_pendiente_orden_segundos = orden.items_departamentos_originales.reduce((sum, d_orig) => {
                        const ftDate = d_orig.fecha_terminado; // Es Date o null
                        return sum + (!(ftDate instanceof Date && !isNaN(ftDate.getTime())) ? (d_orig.tiempo_estimado_segundos || 0) : 0);
                    },0);
                    orden.fecha_final_calculada_individual_pendientes = null;
                }
                orden.tiempo_neto_orden_formateado = this.formatearTiempo(orden.tiempo_total_original_orden_segundos * 1000);
                orden.tiempo_pendiente_orden_formateado = this.formatearTiempo(orden.duracion_pendiente_orden_segundos * 1000);
            }

            // 3. Ordenar para la Cola (según orden_fila_orden y luego fecha_inicio_programada_orden)
            let ordenesParaCola = Object.values(ordenesAgregadas);
            ordenesParaCola.sort((a, b) => {
                 if (a.orden_fila_orden === Infinity && b.orden_fila_orden === Infinity) {
                    const dateA = a.fecha_inicio_programada_orden ? a.fecha_inicio_programada_orden.getTime() : Infinity;
                    const dateB = b.fecha_inicio_programada_orden ? b.fecha_inicio_programada_orden.getTime() : Infinity;
                    if (dateA === dateB) return parseInt(a.id_orden) - parseInt(b.id_orden);
                    return dateA - dateB;
                }
                if (a.orden_fila_orden === b.orden_fila_orden) {
                    const dateA = a.fecha_inicio_programada_orden ? a.fecha_inicio_programada_orden.getTime() : Infinity;
                    const dateB = b.fecha_inicio_programada_orden ? b.fecha_inicio_programada_orden.getTime() : Infinity;
                    if (dateA === dateB) return parseInt(a.id_orden) - parseInt(b.id_orden);
                    return dateA - dateB;
                }
                return a.orden_fila_orden - b.orden_fila_orden;
            });


            // 4. Procesar la cola CON COLAS POR EMPLEADO
            for (const orden of ordenesParaCola) {
                orden.items_departamentos = []; // Reset para poblar con recalculados
                let fechaFinDeptoAnteriorEnEstaOrden = null;
                let fechaInicioRealPrimerDeptoDeLaOrden = null; 

                const deptosOriginalesOrdenados = [...orden.items_departamentos_originales].sort((a,b) => a.orden_proceso - b.orden_proceso);

                for (const deptoOriginal of deptosOriginalesOrdenados) {
                    const deptoRecalculado = JSON.parse(JSON.stringify(deptoOriginal)); // Copia profunda para modificar
                    // Convertir fechas de string (de JSON.parse) a Date
                    deptoRecalculado.fecha_inicio_original_item = deptoRecalculado.fecha_inicio_original_item ? new Date(deptoRecalculado.fecha_inicio_original_item) : null;
                    deptoRecalculado.fecha_terminado = deptoRecalculado.fecha_terminado ? new Date(deptoRecalculado.fecha_terminado) : null;
                    
                    const idEmp = deptoRecalculado.id_empleado;
                    const debugIdTarea = `Orden ${orden.id_orden}, Depto ${deptoRecalculado.nombre_departamento} (Emp ${idEmp})`;

                    if (deptoRecalculado.fecha_terminado) { // Departamento ya terminado
                        deptoRecalculado.fecha_inicio_calculada_depto = deptoRecalculado.fecha_inicio_original_item; // Asumimos que el inicio fue el original
                        deptoRecalculado.fecha_finalizacion_estimada_depto = new Date(deptoRecalculado.fecha_terminado.getTime());
                        
                        const finTerminadoAjustado = this.ajustarInicioAlHorarioLaboral(new Date(deptoRecalculado.fecha_terminado.getTime()), horarioLaboral);
                        if (finTerminadoAjustado) {
                            if (!colasPorEmpleado[idEmp] || finTerminadoAjustado.getTime() > colasPorEmpleado[idEmp].getTime()) {
                                colasPorEmpleado[idEmp] = new Date(finTerminadoAjustado.getTime());
                            }
                            fechaFinDeptoAnteriorEnEstaOrden = new Date(finTerminadoAjustado.getTime());
                        } else {
                            console.error(`[ProyCola] Error ajustando fin de depto terminado ${debugIdTarea}`);
                            deptoRecalculado.fecha_finalizacion_estimada_depto_formateada = "ErrAjusteFinTerm"; // Marcar error
                        }
                        // El inicio de la orden en cola es el del primer depto (terminado o no)
                        if(!fechaInicioRealPrimerDeptoDeLaOrden && deptoRecalculado.fecha_inicio_calculada_depto) {
                            fechaInicioRealPrimerDeptoDeLaOrden = new Date(deptoRecalculado.fecha_inicio_calculada_depto.getTime());
                        }

                    } else { // Departamento PENDIENTE
                        // CAMBIO: Usar 'projectionStartingPoint' para empleados sin cola
                        let fechaProximaDisponibleEmpleado = colasPorEmpleado[idEmp] ? new Date(colasPorEmpleado[idEmp].getTime()) : new Date(projectionStartingPoint.getTime());
                        
                        let inicioTentativoDepto = new Date(fechaProximaDisponibleEmpleado.getTime());

                        if (fechaFinDeptoAnteriorEnEstaOrden) {
                            inicioTentativoDepto = new Date(Math.max(inicioTentativoDepto.getTime(), fechaFinDeptoAnteriorEnEstaOrden.getTime()));
                        }
                        if (deptoRecalculado.fecha_inicio_original_item) { 
                            inicioTentativoDepto = new Date(Math.max(inicioTentativoDepto.getTime(), deptoRecalculado.fecha_inicio_original_item.getTime()));
                        }
                        
                        const inicioCalculadoAjustado = this.ajustarInicioAlHorarioLaboral(inicioTentativoDepto, horarioLaboral);

                        if (!inicioCalculadoAjustado) {
                            console.error(`[ProyCola] Error ajustando inicio para ${debugIdTarea}. Inicio tentativo: ${inicioTentativoDepto.toISOString()}`);
                            deptoRecalculado.fecha_inicio_calculada_depto_formateada = "ErrAjusteIniDepto";
                            deptoRecalculado.fecha_finalizacion_estimada_depto_formateada = "ErrAjusteIniDepto";
                            orden.items_departamentos.push(deptoRecalculado);
                            fechaFinDeptoAnteriorEnEstaOrden = null; // Propagar error al fin de la orden
                            break; 
                        }
                        
                        deptoRecalculado.fecha_inicio_calculada_depto = new Date(inicioCalculadoAjustado.getTime());
                        if (!fechaInicioRealPrimerDeptoDeLaOrden) {
                            fechaInicioRealPrimerDeptoDeLaOrden = new Date(inicioCalculadoAjustado.getTime());
                        }

                        const tiempoDeptoMs = (deptoRecalculado.tiempo_estimado_segundos || 0) * 1000;
                        const finEstimadoDepto = this.calcularFechaFinTarea(
                            new Date(inicioCalculadoAjustado.getTime()),
                            tiempoDeptoMs,
                            horarioLaboral,
                            debugIdTarea
                        );

                        if (!finEstimadoDepto) {
                            console.error(`[ProyCola] Error calculando fin para ${debugIdTarea}`);
                            deptoRecalculado.fecha_finalizacion_estimada_depto_formateada = "ErrCalcFinDepto";
                            orden.items_departamentos.push(deptoRecalculado);
                            fechaFinDeptoAnteriorEnEstaOrden = null;
                            break; 
                        }

                        deptoRecalculado.fecha_finalizacion_estimada_depto = new Date(finEstimadoDepto.getTime());
                        colasPorEmpleado[idEmp] = new Date(finEstimadoDepto.getTime()); 
                        fechaFinDeptoAnteriorEnEstaOrden = new Date(finEstimadoDepto.getTime()); 
                    }
                    
                    // Formatear fechas para visualización (incluso si hubo error, se mostrará el mensaje)
                    deptoRecalculado.fecha_inicio_original_item_formateada = deptoRecalculado.fecha_inicio_original_item ? this.formatDateTime12h(deptoRecalculado.fecha_inicio_original_item) : 'N/A';
                    deptoRecalculado.fecha_terminado_original_item_formateada = deptoRecalculado.fecha_terminado ? this.formatDateTime12h(deptoRecalculado.fecha_terminado) : 'N/A';
                    
                    if (!deptoRecalculado.fecha_inicio_calculada_depto_formateada) { // Si no se seteó un error antes
                        deptoRecalculado.fecha_inicio_calculada_depto_formateada = deptoRecalculado.fecha_inicio_calculada_depto ? this.formatDateTime12h(deptoRecalculado.fecha_inicio_calculada_depto) : 'Error';
                    }
                    if (!deptoRecalculado.fecha_finalizacion_estimada_depto_formateada) { // Si no se seteó un error antes
                        deptoRecalculado.fecha_finalizacion_estimada_depto_formateada = deptoRecalculado.fecha_finalizacion_estimada_depto ? this.formatDateTime12h(deptoRecalculado.fecha_finalizacion_estimada_depto) : 'Error';
                    }
                    
                    orden.items_departamentos.push(deptoRecalculado);
                } // Fin for deptoOriginal of deptosOriginalesOrdenados

                orden.fecha_inicio_real_en_cola = fechaInicioRealPrimerDeptoDeLaOrden; // Puede ser null si todos los deptos fallaron
                orden.fecha_finalizacion_estimada_en_cola = fechaFinDeptoAnteriorEnEstaOrden; // Puede ser null si el último depto falló

                // Formateo final de la orden
                orden.fecha_entrega_formateada = orden.fecha_entrega_orden ? this.formatDate(orden.fecha_entrega_orden) : 'N/A';
                orden.fecha_inicio_formateada = orden.fecha_inicio_real_en_cola ? this.formatDateTime12h(orden.fecha_inicio_real_en_cola) : (orden.fecha_inicio_programada_orden ? `Programado: ${this.formatDateTime12h(orden.fecha_inicio_programada_orden)} (Error Cola)`: 'Error en cálculo de inicio');
                orden.fecha_estimada_entrega_formateada = orden.fecha_finalizacion_estimada_en_cola ? this.formatDateTime12h(orden.fecha_finalizacion_estimada_en_cola) : 'Error en cálculo de fin';
                
                // Lógica de variant y variant_text (adaptada)
                orden.variant = 'secondary'; orden.variant_text = '';
                const todosDeptosOriginalesTerminados = orden.items_departamentos_originales.length > 0 && orden.items_departamentos_originales.every(
                    d_orig => d_orig.fecha_terminado instanceof Date && !isNaN(d_orig.fecha_terminado.getTime())
                );
                // Un depto está pendiente si NO tiene fecha_terminado en la lista RECALCULADA.
                const algunDeptoRecalculadoPendiente = orden.items_departamentos.some(
                    d_recalc => !(d_recalc.fecha_finalizacion_estimada_depto instanceof Date && !isNaN(d_recalc.fecha_finalizacion_estimada_depto.getTime())) || !d_recalc.fecha_terminado // Si no tiene fecha estimada O no tiene fecha_terminado original
                );
                // Ningún depto original iniciado si NINGUNO tiene fecha_inicio_original_item
                const ningunDeptoOriginalIniciado = orden.items_departamentos_originales.every(
                     d_orig => !(d_orig.fecha_inicio_original_item instanceof Date && !isNaN(d_orig.fecha_inicio_original_item.getTime()))
                );

                // CAMBIO: Usar 'realCurrentMoment' para la lógica de variante
                if (todosDeptosOriginalesTerminados && !algunDeptoRecalculadoPendiente) { // Todos los originales estaban terminados Y todos los recalculados se consideran terminados (tienen fecha estimada)
                     orden.variant = 'info'; orden.variant_text = 'TERMINADO';
                }
                else if (ningunDeptoOriginalIniciado && orden.fecha_inicio_real_en_cola && orden.fecha_inicio_real_en_cola > realCurrentMoment) {
                    orden.variant = 'light'; orden.variant_text = 'Por iniciar';
                } else if (orden.fecha_entrega_orden instanceof Date && !isNaN(orden.fecha_entrega_orden.getTime())) {
                    if (orden.fecha_finalizacion_estimada_en_cola && orden.fecha_finalizacion_estimada_en_cola > orden.fecha_entrega_orden) {
                        orden.variant = 'warning'; orden.variant_text = 'EN EL DÍA';
                    } else {
                        const hoyNormalizada = new Date(realCurrentMoment.getFullYear(), realCurrentMoment.getMonth(), realCurrentMoment.getDate());
                        const entregaPactadaNormalizada = new Date(orden.fecha_entrega_orden.getFullYear(), orden.fecha_entrega_orden.getMonth(), orden.fecha_entrega_orden.getDate());
                        // Si la fecha de entrega ya pasó Y la orden no está marcada como TERMINADO (es decir, algunDeptoRecalculadoPendiente es true)
                        if (entregaPactadaNormalizada.getTime() < hoyNormalizada.getTime() && algunDeptoRecalculadoPendiente) { 
                            orden.variant = 'danger'; orden.variant_text = 'RETRASADO';
                        } else if (entregaPactadaNormalizada.getTime() === hoyNormalizada.getTime()) {
                            orden.variant = 'warning'; orden.variant_text = 'EN EL DÍA';
                        } else {
                            orden.variant = 'success'; orden.variant_text = 'A TIEMPO';
                        }
                    }
                } else { // Sin fecha de entrega clara o error en cálculo de fin de orden
                    if (!orden.fecha_finalizacion_estimada_en_cola) {
                        orden.variant = 'light'; orden.variant_text = 'Error Cálculo Cola';
                    } else {
                        orden.variant = 'light'; orden.variant_text = 'Sin fecha entrega';
                    }
                }

                // Poblar productos finales con los items_departamentos RECALCULADOS
                orden.productos = Object.values(orden.productos_info_temp || {}).map(prodInfo => {
                    const departamentosDelProducto = orden.items_departamentos 
                        .filter(d => d.id_producto === prodInfo.id_producto)
                        .map(d_copia => ({...d_copia})) 
                        .sort((ca,cb) => ca.orden_proceso - cb.orden_proceso);
                    return {
                        id_producto: prodInfo.id_producto, nombre_producto: prodInfo.nombre_producto,
                        cantidad_total: prodInfo.cantidad_total,
                        tiempo_total_estimado_producto_formateado: this.formatearTiempo(prodInfo.tiempo_total_estimado_producto_segundos * 1000),
                        departamentos: departamentosDelProducto
                    };
                });
                delete orden.productos_info_temp; 
            } // Fin for orden of ordenesParaCola

            return ordenesParaCola;
        }
    }
};