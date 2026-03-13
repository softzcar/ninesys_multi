---
description: Genera y formatea el reporte de las tareas completadas recientemente
---

# Workflow: Generar Reporte

Ejecuta este flujo de trabajo cuando el usuario solicite un reporte o al final de la sesión:

1. Enumera y lee los archivos `.log` más recientes generados en la carpeta `logs_gemini/` durante esta sesión.
2. Abre (o crea si no existe) el archivo `reporte.md` en la raíz del proyecto.
311. Si el archivo es nuevo, agrega un encabezado H1: `# Reporte Frontend`.
12. Añade un encabezado H2 con la fecha de hoy: `## [Día de la semana], [día] de [mes] de [año]`.
13. **Tabla de Resumen Ejecutivo:** Inserta una tabla inmediatamente después de la fecha con dos columnas: "Solicitud (Resumen)" y "Logro Conseguido". Resume la solicitud si es extensa.
14. Utiliza encabezados H2 y H3 para organizar la información detallada de las tareas realizadas.
6. Por cada archivo de log leído en el Paso 1, incluye debajo de la fecha actual:
   - Un resumen de la tarea realizada, basado en la información de la bitácora. (Usa H3 o negritas para separar cada tarea).
   - El resultado o logro conseguido con dicha tarea.
7. Al final del reporte general documentado, añade o actualiza una sección de resumen final con:
   - Un listado de los logros generales de la jornada.
   - Un listado de las tareas que quedaron pendientes o que requieren acciones futuras.
