# GEMINI.md

## Instrucciones para el modelo:

- Siempre concersaremos en español
- Revisa la estructura de directorios y los archivos necesarios para que tengas el contexto más completo posible del proyecto
- **Gestión de Bitácora (CRÍTICO):**
    - **Proceso de Actualización Diaria:**
        1. Al inicio de una nueva sesión, leer `bitacora.md` para identificar la fecha del último encabezado `H1`.
        2. Si la fecha del último `H1` **no es la fecha actual**, se debe añadir un nuevo encabezado `H1` con la fecha del día de hoy.
        3. Debajo del `H1` correspondiente al día actual, añadir un `H2` con la hora de inicio de la sesión (ej. `## Sesión iniciada a las 10:00`).
        4. **NUNCA** se debe copiar contenido de días anteriores bajo la fecha nueva. La bitácora es un registro cronológico.
    - **Registro de Tareas:**
        - Después de CADA tarea completada, se debe **AÑADIR (append)** la nueva entrada al final del archivo `bitacora.md`.
        - Cada entrada debe seguir el siguiente formato estructurado:
            ```markdown
            ### Tarea: [Descripción concisa de la tarea]
            - **Solicitud del Usuario:** [Referencia breve a la solicitud]
            - **Acción Realizada:** [Descripción de mi acción, ej: Modificación de archivo, ejecución de comando]
            - **Herramienta(s) Utilizada(s):** [Ej: `default_api.replace`, `default_api.run_shell_command`]
            - **Resultado:** [Éxito | Fallo | Parcial]
            - **Verificación:** [Ej: "El comando `replace` retornó éxito.", "La compilación de Nuxt se completó sin errores.", "El endpoint devolvió los datos esperados."]
            - **Observaciones:** (Opcional) [Cualquier detalle adicional relevante]
            ```
    - Este registro es fundamental para el seguimiento del proyecto y para la generación de reportes. **La precisión y la inmediatez son IMPERATIVAS.**
- Siempre prefiere implementar código de la manera menos invasiva posible
- Evita hacer cambios o mejoras que no se te soliciten pero siempre puedes sugerirlas

## Información del Backend:

- **Framework:** Slim Framework
- **Rutas de la API:** `https://raw.githubusercontent.com/softzcar/ninesys-apidev/refs/heads/main/app/routes.php`

## Elaboración de Reportes:

- Al final de cada sesión de trabajo, o cuando el usuario lo solicite, se deberá generar un reporte en un archivo `reporte.md`.
- El reporte debe seguir la siguiente estructura:
    - Iniciar con un encabezado H1: `# Reporte Frontend`.
    - Añadir un H2 con la fecha completa: `## [Día de la semana], [día] de [mes] de [año]`.
    - Utilizar encabezados H2 y H3 para organizar la información de las tareas realizadas.
    - Para cada tarea, se debe incluir:
        - Un resumen de la tarea realizada, basado en la información de la bitácora.
        - El resultado o logro conseguido con dicha tarea.
    - Al final del reporte, se debe incluir una sección de resumen con:
        - Un listado de los logros generales de la jornada.
        - Un listado de las tareas que quedaron pendientes o que requieren acciones futuras.