# GEMINI.md

## Instrucciones para el modelo:

- Siempre concersaremos en español
- Revisa la estructura de directorios y los archivos necesarios para que tengas el contexto más completo posible del proyecto
- **Gestión de Bitácora (CRÍTICO):**
    - Al iniicar siempre actualizate leyendo los logs anteriores
    
    - **Gestión de Bitácora (CRÍTICO):**
    - **Estrategia de Logging:** Se utilizarán archivos `.log` individuales para registrar cada tarea completada. Estos archivos se almacenarán en la carpeta `/logs_gemini`.
    - **Nomenclatura de Archivos:** Cada archivo de log se nombrará siguiendo el formato `YYYY-MM-DD_HH-MM-SS_tarea-[descripcion_corta].log` para asegurar la unicidad y la cronología.
    - **Registro de Tareas:** Después de CADA tarea completada, se debe crear un nuevo archivo `.log` con la siguiente estructura de información:
        ```
        - Solicitud del Usuario: [Texto completo de la solicitud del usuario]
        - Archivos Involucrados: [Lista de rutas de archivos afectados o relevantes para la tarea]
        - Acción Realizada: [Descripción detallada y técnica de mi acción, incluyendo funciones modificadas, comandos ejecutados, etc.]
        - Herramienta(s) Utilizada(s): [Ej: `default_api.write_file`, `default_api.run_shell_command`]
        - Resultado: [Éxito | Fallo | Parcial]
        - Verificación: [Descripción técnica de cómo se verificó la tarea, incluyendo resultados de pruebas, salidas de comandos, comportamiento observado, etc.]
        - Observaciones de Gemini: [Cualquier detalle adicional relevante o auto-reflexión sobre la tarea]
        - Respuesta de Gemini: [La respuesta final que se le dio al usuario después de completar la tarea]
        ```
    - Este registro es fundamental para el seguimiento del proyecto y para la generación de reportes. **La precisión y la inmediatez son IMPERATIVA.
- Siempre prefiere implementar código de la manera menos invasiva posible
- Evita hacer cambios o mejoras que no se te soliciten pero siempre puedes sugerirlas

## Información del Backend:

- **Framework:** Slim Framework
- **Rutas de la API:** `https://raw.githubusercontent.com/softzcar/ninesys-apidev/refs/heads/main/app/routes.php` (Usar `curl` para leer el contenido)

## Repositorios Git (IMPORTANTE):

### Frontend (Nuxt.js)
- **Repositorio:** `https://github.com/softzcar/ninesys_multi.git`
- **Rama:** `main`
- **Despliegue en VPS:** `git fetch origin && git checkout main && git pull origin main`

### Backend (Slim Framework - API)
- **Repositorio:** `https://github.com/softzcar/ninesys-apidev.git`
- **Rama:** `refactor/modular-routes`
- **Despliegue en VPS:** `git fetch origin && git checkout refactor/modular-routes && git pull origin refactor/modular-routes`

## Despliegue en Producción

### ⚠️ IMPORTANTE - NO DESPLEGAR AUTOMÁTICAMENTE
**NUNCA desplegar la aplicación frontend automáticamente.** Solo desplegar cuando el usuario lo solicite explícitamente. Esto es porque no es conveniente subir cambios cada vez que se hace alguna modificación en el entorno de desarrollo.

### Frontend (Nuxt.js) - Script de Despliegue
- **Script:** `./deploy.sh` (en la raíz del proyecto)
- **Host VPS:** `194.195.86.253`
- **Usuario:** `root`
- **Ruta remota:** `/home/app.nineteencustom.com/public_html`

**Proceso del script:**
1. Solicita confirmación del usuario
2. Elimina el directorio `./dist` anterior
3. Ejecuta `npm run generate` para transpilar
4. Crea backup local en `./backups_transpilaciones`
5. Crea backup remoto en `/home/app.nineteencustom.com/backups_deploys`
6. Sube archivos al VPS via `rsync`
7. Limpia backups locales antiguos (conserva los últimos 12)

## Acceso al VPS

### Conexión SSH
- **Alias SSH:** `vps-ninesys` (configurado en `~/.ssh/config`)
- **Host:** `194.195.86.253`
- **Usuario:** `root`
- **Clave SSH:** `~/.ssh/id_ed25519_vps`

### Rutas en el VPS
| Aplicación | Ruta en VPS |
|------------|-------------|
| Frontend (Nuxt.js) | `/home/app.nineteencustom.com/public_html/` |
| Backend (Slim API) | `/home/apidev.nineteengreen.com/public_html/` |

### Comandos de Actualización Remota
**Actualizar API en VPS:**
```bash
ssh vps-ninesys "cd /home/apidev.nineteengreen.com/public_html && git fetch origin && git checkout refactor/modular-routes && git pull origin refactor/modular-routes"
```

**Verificar estado del VPS:**
```bash
ssh vps-ninesys "uptime && df -h"
```

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