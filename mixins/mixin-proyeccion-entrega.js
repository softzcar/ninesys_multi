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

        // Reescrito 2026-08-13: la versión anterior armaba una cola de
        // disponibilidad POR EMPLEADO (colasPorEmpleado), para lo cual
        // necesitaba un id_empleado por fila. El backend (GET
        // /ordenes/proyeccion-entrega) fue optimizado en algún momento
        // ("Versión 7") para devolver una fila agregada por orden+departamento
        // en vez de una fila por asignación individual -- ya no manda
        // id_empleado (solo cant_empleados, un conteo) y el tiempo estimado
        // (tiempo_total_orden_depto) ya viene dividido entre esa cantidad de
        // empleados. El guard `if (id_empleado === null...) return` de la
        // versión anterior descartaba silenciosamente el 100% de las filas
        // (confirmado con datos reales: 456 de 456 items), dejando la página
        // completamente vacía.
        //
        // Simplificación acordada con el usuario: en vez de reconstruir una
        // cola cruzada entre órdenes por empleado (dato que el backend ya no
        // expone), cada orden se proyecta de forma independiente encadenando
        // sus propios departamentos en orden de proceso, usando el tiempo ya
        // paralelizado que manda el backend. Se pierde el detalle por
        // producto (el backend tampoco lo separa por producto en esta
        // consulta agregada) -- el reporte pasa a mostrar departamento en vez
        // de producto > departamento.
        proyectarEntregaConCola(dataDepartamentos, horarioLaboral) {
            if (!dataDepartamentos || !Array.isArray(dataDepartamentos)) { console.error("MIXIN PROYECCIÓN ERROR: 'dataDepartamentos' no es un array."); return []; }
            if (!horarioLaboral || typeof horarioLaboral !== 'object' || !horarioLaboral.diasLaborales || !horarioLaboral.diasLaborales.length) {
                 console.error("MIXIN PROYECCIÓN ERROR: 'horarioLaboral' inválido.", horarioLaboral); return [];
            }

            const ahora = new Date();
            const inicioProyeccionPorDefecto = this.ajustarInicioAlHorarioLaboral(new Date(ahora.getTime()), horarioLaboral) || ahora;

            const ordenesAgregadas = {};

            // 1. Agregación por orden -- cada fila del backend ya es un
            // departamento consolidado (posiblemente varios empleados).
            dataDepartamentos.forEach(item => {
                const {
                    id_orden, id_departamento, nombre_departamento,
                    fecha_inicio, fecha_terminado, fecha_entrega_orden,
                    total_unidades, tiempo_total_orden_depto,
                    orden_fila_orden, orden_proceso_departamento, cant_empleados
                } = item;

                let itemFechaInicioDate = fecha_inicio ? new Date(fecha_inicio.replace(" ", "T")) : null;
                if (itemFechaInicioDate && isNaN(itemFechaInicioDate.getTime())) itemFechaInicioDate = null;
                let itemFechaTerminadoDate = fecha_terminado ? new Date(fecha_terminado.replace(" ", "T")) : null;
                if (itemFechaTerminadoDate && isNaN(itemFechaTerminadoDate.getTime())) itemFechaTerminadoDate = null;
                let itemFechaEntregaDate = fecha_entrega_orden ? this.parseFechaFlexible(fecha_entrega_orden) : null;
                if (itemFechaEntregaDate && isNaN(itemFechaEntregaDate.getTime())) itemFechaEntregaDate = null;

                if (!ordenesAgregadas[id_orden]) {
                    ordenesAgregadas[id_orden] = {
                        id_orden,
                        orden_fila_orden: orden_fila_orden !== null && orden_fila_orden !== undefined ? parseInt(orden_fila_orden) : Infinity,
                        total_unidades: parseInt(total_unidades) || 0,
                        fecha_entrega_orden: itemFechaEntregaDate,
                        items_departamentos_originales: [],
                    };
                } else if (itemFechaEntregaDate && !ordenesAgregadas[id_orden].fecha_entrega_orden) {
                    ordenesAgregadas[id_orden].fecha_entrega_orden = itemFechaEntregaDate;
                }

                ordenesAgregadas[id_orden].items_departamentos_originales.push({
                    id_departamento,
                    nombre_departamento,
                    cant_empleados: parseInt(cant_empleados) || 0,
                    tiempo_estimado_segundos: Math.round(parseFloat(tiempo_total_orden_depto) || 0),
                    orden_proceso: parseInt(orden_proceso_departamento) || 0,
                    fecha_inicio_original_item: itemFechaInicioDate,
                    fecha_terminado: itemFechaTerminadoDate,
                });
            });

            // 2. Ordenar las órdenes por fecha de entrega pactada (la más
            // cercana primero) -- así el reporte se lee de forma útil, en
            // vez del orden de cola de producción que tenía antes. Las
            // órdenes sin fecha de entrega quedan al final. Desempate: mismo
            // criterio de antes (orden_fila_orden, luego id_orden).
            let ordenesFinal = Object.values(ordenesAgregadas);
            ordenesFinal.sort((a, b) => {
                const fechaA = a.fecha_entrega_orden ? a.fecha_entrega_orden.getTime() : Infinity;
                const fechaB = b.fecha_entrega_orden ? b.fecha_entrega_orden.getTime() : Infinity;
                if (fechaA !== fechaB) return fechaA - fechaB;
                if (a.orden_fila_orden === b.orden_fila_orden) return parseInt(a.id_orden) - parseInt(b.id_orden);
                return a.orden_fila_orden - b.orden_fila_orden;
            });

            // 3. Proyectar cada orden de forma independiente, encadenando sus
            // propios departamentos por orden_proceso (reutiliza
            // calcularDuracionesYFechasDeptos, que no depende de id_empleado).
            ordenesFinal.forEach(orden => {
                const deptosOrdenados = [...orden.items_departamentos_originales].sort((a, b) => a.orden_proceso - b.orden_proceso);

                let puntoPartida = null;
                for (const d of deptosOrdenados) {
                    if (d.fecha_inicio_original_item) { puntoPartida = d.fecha_inicio_original_item; break; }
                }
                if (!puntoPartida) puntoPartida = inicioProyeccionPorDefecto;

                const calculo = this.calcularDuracionesYFechasDeptos(puntoPartida, deptosOrdenados, horarioLaboral);

                orden.departamentos = calculo.itemsDepartamentosActualizados;
                orden.tiempo_total_estimado_orden_segundos = calculo.duracionNetaOriginalTotalSegundos;
                orden.tiempo_total_estimado_orden_formateado = this.formatearTiempo(calculo.duracionNetaOriginalTotalSegundos * 1000);
                orden.fecha_inicio_orden_formateada = this.formatDateTime12h(puntoPartida);
                orden.fecha_estimada_finalizacion_orden = calculo.fechaFinalOrdenPendientes;
                orden.fecha_estimada_finalizacion_orden_formateada = calculo.fechaFinalOrdenPendientes
                    ? this.formatDateTime12h(calculo.fechaFinalOrdenPendientes)
                    : (calculo.duracionNetaPendienteSegundos === 0 ? 'Terminado' : 'No calculada');
                orden.fecha_entrega_formateada = orden.fecha_entrega_orden ? this.formatDate(orden.fecha_entrega_orden) : 'N/A';

                const todosDeptosTerminados = deptosOrdenados.length > 0 && deptosOrdenados.every(d => d.fecha_terminado instanceof Date && !isNaN(d.fecha_terminado.getTime()));

                // Estado del badge: se basa solo en qué tan cerca está la fecha de
                // entrega pactada de hoy -- no en la proyección de producción.
                // Antes mezclaba ambos criterios y terminaba usando "EN EL DÍA"
                // para dos cosas distintas (entrega literalmente hoy vs. proyectado
                // a terminar tarde con la fecha aún lejos), lo cual confundía al
                // leer el reporte. A pedido del usuario: A TIEMPO con más de un
                // día de margen, EN EL DÍA si la entrega es hoy, RETRASADO si ya
                // pasó -- sin agregar un estado nuevo.
                orden.variant = 'secondary'; orden.variant_text = '';
                if (todosDeptosTerminados) {
                    orden.variant = 'info'; orden.variant_text = 'TERMINADO';
                } else if (orden.fecha_entrega_orden instanceof Date && !isNaN(orden.fecha_entrega_orden.getTime())) {
                    const hoyNormalizada = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
                    const entregaNormalizada = new Date(orden.fecha_entrega_orden.getFullYear(), orden.fecha_entrega_orden.getMonth(), orden.fecha_entrega_orden.getDate());
                    if (entregaNormalizada.getTime() < hoyNormalizada.getTime()) {
                        orden.variant = 'danger'; orden.variant_text = 'RETRASADO';
                    } else if (entregaNormalizada.getTime() === hoyNormalizada.getTime()) {
                        orden.variant = 'warning'; orden.variant_text = 'EN EL DÍA';
                    } else {
                        orden.variant = 'success'; orden.variant_text = 'A TIEMPO';
                    }
                } else {
                    orden.variant = 'light'; orden.variant_text = 'Sin fecha entrega';
                }
            });

            return ordenesFinal;
        }
    }
};