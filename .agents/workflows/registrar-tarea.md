---
description: Registra la finalización de una tarea en la bitácora del proyecto
---

# Workflow: Registrar Tarea

Sigue estos pasos EXACTAMENTE después de que hayas completado una tarea para el usuario:

1. Identifica la fecha y hora actual para nombrar el archivo.
2. Genera el nombre de archivo con el formato: `YYYY-MM-DD_HH-MM-SS_tarea-[descripcion_corta].log`.
3. Crea este nuevo archivo dentro de la carpeta `logs_gemini/` en la raíz del proyecto. (Si la carpeta no existe, la herramienta de escritura la creará automáticamente al usar la ruta absoluta).
4. Escribe dentro del archivo la siguiente estructura exacta y llénala con la información real de la tarea que acabas de terminar:

- Solicitud del Usuario: [Texto completo de la solicitud del usuario]
- Archivos Involucrados: [Lista de rutas de archivos afectados o relevantes para la tarea]
- Acción Realizada: [Descripción detallada y técnica de mi acción, incluyendo funciones modificadas, comandos ejecutados, etc.]
- Herramienta(s) Utilizada(s): [Ej: `default_api.write_to_file`, `default_api.run_command`]
- Resultado: [Éxito | Fallo | Parcial]
- Verificación: [Descripción técnica de cómo se verificó la tarea, incluyendo resultados de pruebas, salidas de comandos, comportamiento observado, etc.]
- Observaciones de Gemini: [Cualquier detalle adicional relevante o auto-reflexión sobre la tarea]
- Respuesta de Gemini: [La respuesta final que se le dio al usuario después de completar la tarea]
