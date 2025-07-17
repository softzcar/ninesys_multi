<template>
  <div>
    <p>Fecha estimada de entrega</p>
    <p style="margin-top: -16px">
      ${filtrado[0].fecha_estimada_entrega_formateada}
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //
    };
  },

  watch: {
    obj(val) {
      if (val.length > 0) {
        this.filterFechaEstimada();
      } else {
        this.textButton = `Por asignar`; // LA orden no se ha iniciado o está en pausa
      }
      console.log("textList", this.textList);
    },
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    calculatedData() {
      return this.fechasResult.filter((el) => el.id_departamento == 2);
    },
  },

  methods: {
    filterFechaEstimada(idOrden) {
      return false;
      const filtrado = this.fechasResult.filter((el) => el.id_orden == idOrden);
      console.log("fechas filtradas", filtrado);
      // return this.fechasResult;

      if (
        filtrado &&
        filtrado.length > 0 &&
        filtrado[0].fecha_estimada_entrega_formateada === undefined
      ) {
        return `<p>Fecha estimada de entrega</p><p style="margin-top:-16px">&nbsp;</p>`;
      } else {
        return `<p>Fecha estimada de entrega</p><p style="margin-top:-16px">${filtrado[0].fecha_estimada_entrega_formateada}</p>`;
      }
    },

    // Función auxiliar para parsear fechas de YYYY-MM-DD HH:MM:SS (usada para fecha_inicio y fecha_terminado de DB)
    parseDatabaseDateTimeString(dateString) {
      if (!dateString) return null;
      const regex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
      const match = dateString.match(regex);

      if (!match) {
        console.error(
          "Error al parsear fecha de la base de datos: El formato no es el esperado (YYYY-MM-DD HH:MM:SS).",
          dateString
        );
        return null;
      }

      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // Meses son 0-indexados en JavaScript
      const day = parseInt(match[3], 10);
      const hours = parseInt(match[4], 10);
      const minutes = parseInt(match[5], 10);
      const seconds = parseInt(match[6], 10);

      return new Date(year, month, day, hours, minutes, seconds);
    },

    calcularProyeccionEmpleado(
      fechaInicialString,
      procesosOrden,
      filaOrdenFila,
      ordenProceso
    ) {
      console.log("[] fechaInicialString", fechaInicialString);
      console.log("[] ordenProceso", ordenProceso);
      console.log("[] filaOrdenFila", filaOrdenFila);
      // console.log('*********************************');

      // --- 1. Validar y Parsear la Fecha Inicial ---
      if (
        fechaInicialString === null ||
        typeof fechaInicialString === "undefined"
      ) {
        console.error(
          "Error: El string de fecha inicial es null o undefined.",
          fechaInicialString
        );
        return null;
      }

      const regex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}) (AM|PM)$/;
      const match = fechaInicialString.match(regex);

      if (!match) {
        console.error(
          "Error: El formato de fecha inicial no es el esperado (DD/MM/YYYY HH:MM AM/PM).",
          fechaInicialString
        );
        return null;
      }

      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      let hours = parseInt(match[4], 10);
      const minutes = parseInt(match[5], 10);
      const ampm = match[6];

      if (ampm === "PM" && hours !== 12) {
        hours += 12;
      } else if (ampm === "AM" && hours === 12) {
        hours = 0;
      }

      // fechaActualProceso será la fecha que se irá actualizando con cada tarea
      // Inicialmente, es la fecha inicial proporcionada.
      let fechaActualProceso = new Date(year, month, day, hours, minutes, 0);

      if (isNaN(fechaActualProceso.getTime())) {
        console.error(
          "Error: La fecha inicial proporcionada es inválida después de parsear.",
          fechaInicialString
        );
        return null;
      }

      // --- 2. Validar el Array de Procesos y el ID del Empleado ---
      if (!Array.isArray(procesosOrden) || procesosOrden.length === 0) {
        console.warn(
          "Advertencia: El array de procesos de orden está vacío o no es válido."
        );
        return fechaInicialString; // Si no hay procesos, la fecha final es la inicial
      }

      if (
        typeof filaOrdenFila !== "string" &&
        typeof filaOrdenFila !== "number"
      ) {
        console.error(
          "Error: El filaOrdenFila debe ser un número o string numérico."
        );
        return null;
      }

      // --- 3. Filtrar y Ordenar Procesos por Empleado, Fila de Orden y Proceso de Departamento ---
      // Asegurarse de que el orden_proceso_departamento se compare como string, ya que en tus datos es un string.
      const tareasDelEmpleado = procesosOrden.filter(
        (item) =>
          item.fecha_terminado === null &&
          parseInt(item.orden_proceso_departamento) === ordenProceso &&
          parseInt(item.orden_fila_orden) === parseInt(filaOrdenFila)
      );
      console.log(
        `'tareasDelEmpleado' id orden ${this.textList.idOrden}`,
        tareasDelEmpleado
      );

      if (tareasDelEmpleado.length === 0) {
        console.warn(
          `Advertencia: El empleado con ID ${filaOrdenFila} no tiene tareas asignadas en los datos proporcionados.`
        );
        return fechaInicialString; // Si el empleado no tiene tareas asignadas, la fecha final es la inicial.
      }

      // Ordenar las tareas del empleado:02/06/2025
      // Primero por 'orden_fila_orden' (ascendente)
      // Segundo por 'orden_proceso_departamento' (ascendente)
      tareasDelEmpleado.sort((a, b) => {
        const filaA = parseInt(a.orden_fila_orden, 10);
        const filaB = parseInt(b.orden_fila_orden, 10);
        const deptoA = parseInt(a.orden_proceso_departamento, 10);
        const deptoB = parseInt(b.orden_proceso_departamento, 10);

        if (filaA !== filaB) {
          return filaA - filaB;
        }
        return deptoA - deptoB;
      });

      // --- 4. Iterar y Acumular Tiempo de Cada Tarea según su estado ---
      for (const item of tareasDelEmpleado) {
        console.log("test de bucle FOR", item);

        const tiempoEstimado = parseFloat(item.tiempo_estimado_produccion);
        const cantidad = parseFloat(item.cantidad);

        if (isNaN(tiempoEstimado) || isNaN(cantidad)) {
          console.warn(
            `Advertencia: 'tiempo_estimado_produccion' o 'cantidad' no es un número válido para el ítem:`,
            item
          );
          continue; // Saltar este ítem si los valores no son válidos
        }

        // Caso 1: Tarea Completada (fecha_inicio != null y fecha_terminado != null)
        if (item.fecha_inicio !== null && item.fecha_terminado !== null) {
          const fechaTerminadoTarea = this.parseDatabaseDateTimeString(
            item.fecha_terminado
          );
          if (fechaTerminadoTarea && !isNaN(fechaTerminadoTarea.getTime())) {
            // Aseguramos que la fecha actual del proceso no retroceda
            // y sea al menos la fecha de término de la tarea ya completada.
            fechaActualProceso = new Date(
              Math.max(
                fechaActualProceso.getTime(),
                fechaTerminadoTarea.getTime()
              )
            );
            // No se suma tiempo, ya que la tarea está completada.
          } else {
            console.warn(
              `Advertencia: 'fecha_terminado' no pudo ser parseada para la tarea completada:`,
              item
            );
          }
        }
        // Caso 2: Tarea en Curso (fecha_inicio != null y fecha_terminado == null)
        // Caso 3: Tarea No Iniciada (fecha_inicio == null y fecha_terminado == null)
        else {
          // Esto cubre ambos casos: tarea en curso o no iniciada
          // Si la tarea ya tiene una fecha de inicio (está en curso),
          // la proyección no puede ser anterior a esa fecha de inicio real.
          if (item.fecha_inicio !== null) {
            const fechaInicioTarea = this.parseDatabaseDateTimeString(
              item.fecha_inicio
            );
            if (fechaInicioTarea && !isNaN(fechaInicioTarea.getTime())) {
              // Aseguramos que la proyección para esta tarea inicie al menos en su fecha_inicio real,
              // o en la fecha de proyección actual, lo que sea más tardío.
              fechaActualProceso = new Date(
                Math.max(
                  fechaActualProceso.getTime(),
                  fechaInicioTarea.getTime()
                )
              );
            } else {
              console.warn(
                `Advertencia: 'fecha_inicio' no pudo ser parseada para la tarea en curso/no iniciada:`,
                item
              );
            }
          }

          // Sumar el tiempo estimado de esta tarea (tiempo * cantidad) a la proyección.
          // Asumimos que para tareas en curso o no iniciadas, se suma el tiempo total restante.
          const segundosDeEstaTarea = tiempoEstimado * cantidad;
          fechaActualProceso.setSeconds(
            fechaActualProceso.getSeconds() + segundosDeEstaTarea
          );
        }
      }

      // --- 5. Formatear la Nueva Fecha y Retornar ---
      const nuevoDia = String(fechaActualProceso.getDate()).padStart(2, "0");
      const nuevoMes = String(fechaActualProceso.getMonth() + 1).padStart(
        2,
        "0"
      );
      const nuevoAnio = fechaActualProceso.getFullYear();
      let nuevasHoras = fechaActualProceso.getHours();
      const nuevosMinutos = String(fechaActualProceso.getMinutes()).padStart(
        2,
        "0"
      );
      const nuevoAmPm = nuevasHoras >= 12 ? "PM" : "AM";

      nuevasHoras = nuevasHoras % 12;
      nuevasHoras = nuevasHoras ? String(nuevasHoras).padStart(2, "0") : "12"; // '0' horas se convierte a '12' para AM/PM

      return `${nuevoDia}/${nuevoMes}/${nuevoAnio} ${nuevasHoras}:${nuevosMinutos} ${nuevoAmPm}`;
    },

    testDev(obj) {
      const response = obj.map((el) => {
        return;
      });
    },

    filterFechaEstimada() {
      // this.variant = this.obj[0].estado_entrega;
      this.textList.fechaEntrega = this.obj[0].fecha_entrega_formateada;

      this.textList.fechaEntregaEstimada =
        this.obj[0].fecha_estimada_entrega_formateada;

      this.textList.resumenTiempos =
        this.obj[0].resumen_tiempos_pendientes_por_puesto;

      if (this.obj[0].variant === "light") {
        this.textButton = this.obj[0].variant_text;
      } else {
        // this.textButton = this.obj[0].fecha_entrega_formateada;
        this.textButton = this.textList.fechaEntregaEstimada;
      }

      this.textList.tiempoEstimado = this.obj[0].tiempo_neto_orden_formateado;

      this.textList.tiempoRestante =
        this.obj[0].tiempo_pendiente_orden_formateado;

      this.textList.idOrden = this.obj[0].id_orden;
      this.textList.ordenFilaOrden = this.obj[0].orden_fila_orden;

      this.dataTableProductos = this.obj[0].productos;

      this.variant = this.obj[0].variant;
      this.textList.status = this.obj[0].variant_text;
    },
  },

  mounted() {},

  props: ["item", "estimada", "inicio", "filtro", "fechasResult"],
};
</script>
