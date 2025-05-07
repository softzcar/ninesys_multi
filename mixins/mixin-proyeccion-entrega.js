export default {
    methods: {
        /**
         * Procesa un array de datos de órdenes para calcular la fecha de entrega estimada
         * considerando el horario laboral específico.
         *
         * @param {Array<Object>} data - Array de objetos con la información de las órdenes.
         * @param {Object} horarioLaboral - Objeto con la configuración del horario laboral.
         * @returns {Array<Object>} - Array de objetos con las órdenes procesadas y la fecha de entrega estimada.
         */
        procesarDatosOrdenesParaMostrar(data, horarioLaboral) {
            const ordenesProcesadas = {};

            data.forEach(item => {
                const {
                    id_orden,
                    id_producto,
                    nombre_producto,
                    cantidad,
                    nombre_departamento,
                    tiempo_estimado_produccion,
                    orden_proceso_departamento,
                    fecha_inicio
                } = item;

                const tiempoEstimadoDepartamentoSegundos = parseInt(tiempo_estimado_produccion);
                const tiempoDepartamentoTotal = tiempoEstimadoDepartamentoSegundos * parseInt(cantidad);

                if (!ordenesProcesadas[id_orden]) {
                    ordenesProcesadas[id_orden] = {
                        id_orden: id_orden,
                        productos: [],
                        tiempo_total_estimado_orden_segundos: 0,
                        fecha_inicio_orden: fecha_inicio ? new Date(fecha_inicio) : null,
                        fecha_estimada_finalizacion_orden: null
                    };
                } else if (!ordenesProcesadas[id_orden].fecha_inicio_orden && fecha_inicio) {
                    ordenesProcesadas[id_orden].fecha_inicio_orden = new Date(fecha_inicio);
                } else if (ordenesProcesadas[id_orden].fecha_inicio_orden && fecha_inicio) {
                    const fechaActual = new Date(fecha_inicio);
                    if (fechaActual < ordenesProcesadas[id_orden].fecha_inicio_orden) {
                        ordenesProcesadas[id_orden].fecha_inicio_orden = fechaActual;
                    }
                }

                let productoExistenteIndex = ordenesProcesadas[id_orden].productos.findIndex(p => p.id_producto === id_producto);

                if (productoExistenteIndex !== -1) {
                    ordenesProcesadas[id_orden].productos[productoExistenteIndex].cantidad_total += parseInt(cantidad);
                    ordenesProcesadas[id_orden].productos[productoExistenteIndex].tiempo_total_estimado_producto_segundos += tiempoDepartamentoTotal;

                    let departamentoExistenteIndex = ordenesProcesadas[id_orden].productos[productoExistenteIndex].departamentos.findIndex(d => d.nombre_departamento === nombre_departamento);

                    if (departamentoExistenteIndex !== -1) {
                        ordenesProcesadas[id_orden].productos[productoExistenteIndex].departamentos[departamentoExistenteIndex].tiempo_estimado_segundos += tiempoDepartamentoTotal;
                    } else {
                        ordenesProcesadas[id_orden].productos[productoExistenteIndex].departamentos.push({
                            nombre_departamento: nombre_departamento,
                            tiempo_estimado_segundos: tiempoDepartamentoTotal,
                            orden_proceso: parseInt(orden_proceso_departamento)
                        });
                    }
                } else {
                    const tiempoProductoTotal = tiempoEstimadoDepartamentoSegundos * parseInt(cantidad);
                    ordenesProcesadas[id_orden].productos.push({
                        id_producto: id_producto,
                        nombre_producto: nombre_producto,
                        cantidad_total: parseInt(cantidad),
                        tiempo_total_estimado_producto_segundos: tiempoProductoTotal,
                        departamentos: [{
                            nombre_departamento: nombre_departamento,
                            tiempo_estimado_segundos: tiempoDepartamentoTotal,
                            orden_proceso: parseInt(orden_proceso_departamento)
                        }]
                    });
                }

                ordenesProcesadas[id_orden].tiempo_total_estimado_orden_segundos += tiempoDepartamentoTotal;
            });

            // Calcular la fecha de entrega estimada considerando el horario laboral
            for (const idOrden in ordenesProcesadas) {
                if (ordenesProcesadas[idOrden].fecha_inicio_orden && horarioLaboral) {
                    let tiempoRestante = ordenesProcesadas[idOrden].tiempo_total_estimado_orden_segundos * 1000;
                    let fechaActual = new Date(ordenesProcesadas[idOrden].fecha_inicio_orden);

                    while (tiempoRestante > 0) {
                        const diaSemana = fechaActual.getDay(); // 0 (Domingo) - 6 (Sábado)
                        const horaActualDecimal = fechaActual.getHours() + fechaActual.getMinutes() / 60;

                        // Verificar si es un día laboral
                        if (horarioLaboral.diasLaborales.includes(diaSemana)) {
                            let tiempoDisponibleHoy = 0;

                            // Calcular tiempo disponible en la mañana
                            if (horaActualDecimal < horarioLaboral.horaFinManana) {
                                tiempoDisponibleHoy += Math.max(0, horarioLaboral.horaFinManana - Math.max(horaActualDecimal, horarioLaboral.horaInicioManana)) * 3600;
                            }

                            // Calcular tiempo disponible en la tarde
                            if (horaActualDecimal < horarioLaboral.horaFinTarde && horaActualDecimal >= horarioLaboral.horaInicioTarde) {
                                tiempoDisponibleHoy += (horarioLaboral.horaFinTarde - Math.max(horaActualDecimal, horarioLaboral.horaInicioTarde)) * 3600;
                            } else if (horaActualDecimal < horarioLaboral.horaInicioTarde) {
                                tiempoDisponibleHoy += Math.max(0, horarioLaboral.horaFinManana - Math.max(horaActualDecimal, horarioLaboral.horaInicioManana)) * 3600;
                                tiempoDisponibleHoy += (horarioLaboral.horaFinTarde - horarioLaboral.horaInicioTarde) * 3600;
                            } else if (horaActualDecimal >= horarioLaboral.horaFinTarde) {
                                // Ya terminó el horario laboral de hoy
                            }

                            const tiempoTrabajadoHoy = Math.min(tiempoRestante, tiempoDisponibleHoy * 1000);
                            fechaActual.setTime(fechaActual.getTime() + tiempoTrabajadoHoy);
                            tiempoRestante -= tiempoTrabajadoHoy;

                            // Si terminamos el día laboral y aún queda tiempo, avanzar al siguiente día laboral
                            if (tiempoRestante > 0 && fechaActual.getHours() >= Math.floor(horarioLaboral.horaFinTarde)) {
                                fechaActual.setDate(fechaActual.getDate() + 1);
                                fechaActual.setHours(Math.floor(horarioLaboral.horaInicioManana), Math.round((horarioLaboral.horaInicioManana % 1) * 60), 0, 0);
                            }
                        } else {
                            // Si no es un día laboral, avanzar al siguiente día laboral (lunes si es viernes o fin de semana)
                            fechaActual.setDate(fechaActual.getDate() + (diaSemana === 5 ? 3 : 1));
                            fechaActual.setHours(Math.floor(horarioLaboral.horaInicioManana), Math.round((horarioLaboral.horaInicioManana % 1) * 60), 0, 0);
                        }

                        // Evitar bucles infinitos por precaución (si el tiempo restante es muy pequeño)
                        if (tiempoRestante < 1000 && tiempoRestante > 0) {
                            fechaActual.setTime(fechaActual.getTime() + tiempoRestante);
                            tiempoRestante = 0;
                        }
                    }
                    ordenesProcesadas[idOrden].fecha_estimada_finalizacion_orden = fechaActual;
                    ordenesProcesadas[idOrden].fecha_estimada_finalizacion_orden_formateada = this.formatDate(ordenesProcesadas[idOrden].fecha_estimada_finalizacion_orden);
                } else {
                    ordenesProcesadas[idOrden].fecha_estimada_finalizacion_orden_formateada = 'Orden no iniciada';
                }

                ordenesProcesadas[idOrden].fecha_inicio_orden_formateada = ordenesProcesadas[idOrden].fecha_inicio_orden ? this.formatDate(ordenesProcesadas[idOrden].fecha_inicio_orden) : null;

                ordenesProcesadas[idOrden].productos = ordenesProcesadas[idOrden].productos.map(producto => ({
                    ...producto,
                    tiempo_total_estimado_producto_formateado: this.formatearTiempo(producto.tiempo_total_estimado_producto_segundos * 1000),
                    departamentos: producto.departamentos.sort((a, b) => a.orden_proceso - b.orden_proceso)
                }));

                ordenesProcesadas[idOrden].tiempo_total_estimado_orden_formateado = this.formatearTiempo(ordenesProcesadas[idOrden].tiempo_total_estimado_orden_segundos * 1000);

                delete ordenesProcesadas[idOrden].fecha_inicio_orden;
                delete ordenesProcesadas[idOrden].fecha_estimada_finalizacion_orden;
            }

            return Object.values(ordenesProcesadas);
        },

        formatDate(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? String(hours).padStart(2, '0') : '12';
            return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
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
};