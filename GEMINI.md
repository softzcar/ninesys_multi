# GEMINI.md - Instrucciones para el modelo

## Instrucciones Base
- Siempre conversaremos en español.
- Revisa la estructura de directorios y los archivos necesarios para tener el contexto más completo posible del proyecto.
- Siempre prefiere implementar código de la manera menos invasiva posible.
- Evita hacer cambios o mejoras que no se te soliciten, pero siempre puedes sugerirlas.
- **Antes de iniciar cualquier acción,** siempre actualízate leyendo los logs anteriores en `/logs_gemini/`.
- **REGLA DE ORO DE DIRECTORIOS:** El único lugar autorizado para modificar frontend es `/home/developer/Escritorio/niesys/app_multi/`. El único backend es `/home/developer/Escritorio/niesys/ninesys-apidev/`. Queda ESTRICTAMENTE PROHIBIDO utilizar o leer carpetas fuera de `/home/developer/Escritorio/niesys/`.

## Contexto Técnico
- **Framework del Backend:** Slim Framework.
- **Rutas de la API:** `https://raw.githubusercontent.com/softzcar/ninesys-apidev/refs/heads/main/app/routes.php` (Usar `curl` para leer el contenido).

## Flujos de Trabajo (Workflows) Obligatorios
- **Gestión de Bitácora:** Al finalizar CADA tarea técnica, ejecuta estrictamente el workflow `/.agents/workflows/registrar-tarea.md`.
- **Generación de Reportes:** Al finalizar la sesión de trabajo o cuando el usuario lo solicite, ejecuta el workflow `/.agents/workflows/generar-reporte.md`.