# GEMINI.md

## Instrucciones para el modelo:

- Siempre concersaremos en español
- Revisa la estructura de directorios y los archivos necesarios para que tengas el contexto más completo posible del proyecto
- **Gestión de Bitácora (CRÍTICO - OBLIGATORIO):**
    - **Al iniciar:** SIEMPRE actualízate leyendo los últimos 3-5 logs para entender el contexto reciente del proyecto
    
    - **Estrategia de Logging:** Se utilizarán archivos `.log` individuales para registrar CADA tarea completada. Estos archivos se almacenarán en la carpeta `logs_gemini/`.
    
    - **Nomenclatura de Archivos:** Cada archivo de log se nombrará siguiendo el formato `YYYY-MM-DD_HH-MM-SS_tarea-[descripcion_corta].log` para asegurar la unicidad y la cronología.
    
    - **⚠️ CREACIÓN OBLIGATORIA DE LOGS:**
        - **SIEMPRE** crea un log después de completar una tarea, **SIN EXCEPCIONES**
        - Esto aplica incluso si trabajas manualmente sin usar herramientas de IA
        - Incluso en días festivos o fines de semana, si trabajas, DEBES crear el log
        - El log es la única forma de documentar el trabajo realizado para futuros reportes
    
    - **Registro de Tareas:** Después de CADA tarea completada, se debe crear un nuevo archivo `.log` con la siguiente estructura de información:
        ```
        - Solicitud del Usuario: [Texto completo de la solicitud del usuario]
        - Archivos Involucrados: [Lista de rutas de archivos afectados o relevantes para la tarea]
        - Acción Realizada: [Descripción detallada y técnica de mi acción, incluyendo funciones modificadas, comandos ejecutados, etc.]
        - Herramienta(s) Utilizada(s): [Ej: `write_to_file`, `run_command`, `replace_file_content`]
        - Resultado: [Éxito | Fallo | Parcial]
        - Verificación: [Descripción técnica de cómo se verificó la tarea, incluyendo resultados de pruebas, salidas de comandos, comportamiento observado, etc.]
        - Observaciones de Gemini: [Cualquier detalle adicional relevante o auto-reflexión sobre la tarea]
        - Respuesta de Gemini: [La respuesta final que se le dio al usuario después de completar la tarea]
        ```
    
    - **Importancia:** Este registro es FUNDAMENTAL para el seguimiento del proyecto y para la generación de reportes. **La precisión y la inmediatez son IMPERATIVAS**. Sin logs, no hay manera de documentar el trabajo realizado.
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

## Bases de Datos por Empresa

### Empresa 152 (NineteenCustom)
| Campo | Valor |
|-------|-------|
| Base de datos | `api_emp_152` |
| Usuario | `api_user_152` |
| Password | `cf747993a6231d6e0a15f731` |
| Host | `localhost` |

**Consulta via SSH:**
```bash
ssh vps-ninesys "mysql -u api_user_152 -pcf747993a6231d6e0a15f731 api_emp_152 -e 'SELECT * FROM tabla LIMIT 10;'"
```

### Empresa 159 (Pruebas)
| Campo | Valor |
|-------|-------|
| Base de datos | `api_emp_159` |
| Usuario | `api_user_159` |
| Password | `18a5d8dbf1bf95463e3aff10` |
| Host | `localhost` |

**Consulta via SSH:**
```bash
ssh vps-ninesys "mysql -u api_user_159 -p'18a5d8dbf1bf95463e3aff10' api_emp_159 -e 'SELECT * FROM tabla LIMIT 10;'"
```

### Base de Datos Central (api_empresas)
Contiene la tabla `empresas` con credenciales de todas las empresas y `empresas_usuarios` con todos los empleados.

| Campo | Valor |
|-------|-------|
| Base de datos | `api_empresas` |
| Usuario | `api_adminemp` |
| Password | `rkyaFy!dAs8L5Lq8` |
| Host | `localhost` |

**Obtener credenciales de cualquier empresa:**
```bash
ssh vps-ninesys "mysql -u root api_empresas -e 'SELECT id_empresa, nombre, db_name, db_user, db_password FROM empresas WHERE id_empresa = [ID];'"
```

**Consultar empleados de una empresa:**
```bash
ssh vps-ninesys "mysql -u root api_empresas -e 'SELECT id_usuario, nombre, departamento, comision, comision_tipo, salario_tipo FROM empresas_usuarios WHERE id_empresa = [ID];'"
```

---


## Generación de Reportes Diarios (AUTOMATIZADO):

### Scripts Disponibles

Los scripts para generación de reportes se encuentran en `/home/developer/Escritorio/`:

1. **`generar_reportes_diarios.py`** - Genera reportes HTML consolidando logs de Frontend y Backend
2. **`convertir_html_a_pdf.py`** - Convierte los reportes HTML a PDF

### Cómo Generar Reportes

Cuando el usuario solicite "generar reporte del día X" o "crear reporte de los días X a Y":

**Opción 1: Usar el script existente (recomendado para rangos de fechas)**
```bash
cd /home/developer/Escritorio
python3 generar_reportes_diarios.py
```
El script está configurado para generar reportes del 28-12-2025 al 08-01-2026. Para otras fechas, modifica las variables `fecha_inicio` y `fecha_fin` en el script.

**Opción 2: Generar un reporte individual manualmente**

Si el usuario solicita un reporte de UN día específico:

1. Busca logs de ese día en ambos proyectos:
   ```bash
   find /home/developer/Escritorio/niesys/app_multi/logs_gemini -name "YYYY-MM-DD*"
   find /home/developer/Escritorio/Antigravity/ninesys-apidev/logs_gemini -name "YYYY-MM-DD*"
   ```

2. Si NO hay logs pero sí hay commits en Git, reconstruye desde Git:
   ```bash
   git log --all --since="YYYY-MM-DD 00:00:00" --until="YYYY-MM-DD 23:59:59" --pretty=format:"%H|%an|%ad|%s" --date=format:"%H:%M:%S"
   ```

3. Genera el reporte HTML usando la plantilla establecida (ver reportes existentes como ejemplo)

4. Convierte a PDF:
   ```bash  
   cd /home/developer/Escritorio
   python3 convertir_html_a_pdf.py
   ```

### Estructura del Reporte HTML

Cada reporte debe incluir:
- **Encabezado:** Fecha completa en español, proyecto(s), total de tareas
- **Resumen Ejecutivo:** Tabla con contador por proyecto (Frontend/Backend)
- **Detalle de Tareas:** Para cada tarea:
  - Hora (solo rango de commits, NO calcular tiempo de trabajo)
  - Proyecto
  - Resultado
  - Solicitud del Usuario
  - Acción Realizada
  - Verificación
  - Logro Conseguido
- **Estilos CSS:** Optimizados para impresión, profesionales
- **Botón de impresión:** Integrado en el HTML

### Ubicación de Reportes

- **HTML:** `/home/developer/Escritorio/reportes_logs/reporte_YYYY-MM-DD.html`
- **PDF:** `/home/developer/Escritorio/reportes_logs/reporte_YYYY-MM-DD.pdf`

### ⚠️ IMPORTANTE: No Calcular Tiempo de Trabajo

- **NUNCA** incluyas cálculos de "X horas de trabajo" basados en timestamps de commits
- Solo muestra "Rango de commits: HH:MM - HH:MM" como referencia
- Los commits no reflejan el tiempo real de trabajo (no incluyen pausas, trabajo post-commit, análisis, etc.)

---

## Elaboración de Reportes MD (Legacy - Opcional):

Si el usuario solicita un reporte en formato Markdown (menos común ahora que tenemos HTML/PDF):

- Generar un archivo `reporte.md`
- Estructura:
    - H1: `# Reporte Frontend` o `# Reporte Backend`
    - H2 con fecha completa: `## [Día de la semana], [día] de [mes] de [año]`
    - H2 y H3 para organizar tareas
    - Para cada tarea: resumen y resultado/logro
    - Sección final: logros generales y tareas pendientes