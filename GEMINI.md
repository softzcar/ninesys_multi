# GEMINI.md

## Instrucciones para el modelo:

- **⚠️ Solo existe la empresa 163 (producción).** No hay empresa de pruebas disponible. Usar con extrema precaución.
- Siempre concersaremos en español
- **⚠️ RECORDATORIO CRÍTICO DE CIERRE:** Al finalizar el trabajo del día, DEBES resumir el trabajo realizado y asignar un título descriptivo a la conversación para que aparezca correctamente en el historial de Ninesys.
- Revisa la estructura de directorios y los archivos necesarios para que tengas el contexto más completo posible del proyecto
- **Gestión de Bitácora (CRÍTICO - OBLIGATORIO):**
    - **Al iniciar:** SIEMPRE actualízate leyendo los últimos 3-5 logs para entender el contexto reciente del proyecto
    
    - **Estrategia de Logging:** Se utilizarán archivos `.log` individuales para registrar CADA tarea completada. Estos archivos se almacenarán en la carpeta `logs_gemini/`.
    
    - **Nomenclatura de Archivos:** Cada archivo de log se nombrará siguiendo el formato `YYYY-MM-DD_HH-MM-SS_tarea-[descripcion_corta].log` para asegurar la unicidad y la cronología.
    
    - **⚠️ CREACIÓN OBLIGATORIA DE LOGS — SIN EXCEPCIÓN:**
        - **SIEMPRE** crea un log después de completar una tarea, **SIN EXCEPCIONES**
        - Esto aplica incluso si trabajas manualmente sin usar herramientas de IA
        - Incluso en días festivos o fines de semana, si trabajas, DEBES crear el log
        - **Sin log = trabajo NO documentado = NO aparece en el reporte semanal**
        - El log es la ÚNICA fuente primaria confiable para reconstruir el trabajo del día
    
    - **Registro de Tareas:** Después de CADA tarea completada, se debe crear un nuevo archivo `.log` con la siguiente estructura de información:
        ```markdown
        - **Solicitud del Usuario:** [Texto completo de la solicitud del usuario]
        - **Fecha y Hora:** [YYYY-MM-DD HH:MM:SS]
        - **Proyecto(s):** [Frontend / Backend / Ambos]
        - **Archivos Involucrados:** [Lista de rutas de archivos afectados o relevantes para la tarea]
        - **Commits Relacionados:**
            - Frontend: [ID Commit o N/A]
            - Backend: [ID Commit o N/A]
        - **Acción Realizada:** [Descripción detallada y técnica de la acción, incluyendo funciones modificadas, comandos ejecutados, etc.]
        - **Inconvenientes y Desafíos:** [Descripción de cualquier bloqueo, dificultad técnica o error encontrado durante el proceso]
        - **Decisión Final y Justificación:** [Razonamiento detrás de la solución técnica elegida y por qué se descartaron otras opciones]
        - **Herramienta(s) Utilizada(s):** [Ej: `write_to_file`, `run_command`, `replace_file_content`]
        - **Resultado:** [Éxito | Fallo | Parcial]
        - **Verificación:** [Descripción técnica de cómo se verificó la tarea, incluyendo resultados de pruebas, salidas de comandos, comportamiento observado, etc.]
        - **Logro Conseguido:** [Resumen conciso del valor aportado por esta tarea, ideal para el reporte semanal]
        - **Referencias de Sesión (Contexto):** 
            - Task: [task.md](file:///home/developer/.gemini/antigravity/brain/[CONVERSATION-ID]/task.md)
            - Walkthrough: [walkthrough.md](file:///home/developer/.gemini/antigravity/brain/[CONVERSATION-ID]/walkthrough.md)
        
        - **⚠️ NOTA DE PERSISTENCIA:** Los links anteriores son temporales. Para que la información sea PERMANENTE y aparezca en los reportes, **DEBES** detallar todo el proceso técnico en 'Acción Realizada', 'Verificación' e 'Inconvenientes'. No te limites a poner "ver walkthrough".
        
        - **Observaciones de Gemini:** [Cualquier detalle adicional relevante o auto-reflexión sobre la tarea]
        - **Respuesta de Gemini:** [La respuesta final que se le dio al usuario después de completar la tarea]
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

## Despliegue y Entornos de Prueba (⚠️ REGLAS CRÍTICAS - LECTURA OBLIGATORIA)

- **Servidor de Producción (Contabo - `nineteencustom.com`):** 
    - > [!CAUTION]
    - > **PROHIBICIÓN TOTAL:** NUNCA actualices, despliegues o realices `git reset --hard / pull` en Contabo (ni Backend ni Frontend) sin una petición explícita y directa del usuario para esa acción específica. Es un entorno de producción crítico.
- **Servidor de Pruebas (Hostinger - `api.nineteengreen.com`):**
    - **Backend (API):** Es **OBLIGATORIO** actualizar el backend en Hostinger (`git fetch && git pull`) CADA VEZ que realices cambios en el código de la API. Esto es necesario para que las pruebas locales del frontend (que se conectan a esta API) funcionen correctamente.
    - **Frontend:** **NO** actualices el frontend en Hostinger a menos que el usuario lo solicite explícitamente. Las pruebas de frontend se validan ejecutando `npm run dev` localmente.
- **Desarrollo Local (Frontend):** Las pruebas del Frontend se hacen EXCLUSIVAMENTE de forma local ejecutando `npm run dev`. No es necesario desplegar al VPS para validar ajustes visuales o de lógica.

### Frontend (Nuxt.js) - Script de Despliegue Multi-Entorno
- **Script:** `./deploy.sh` (en la raíz del proyecto)
- **Modo:** Interactivo. Al ejecutarlo, permite elegir entre:
  1. **Producción (Contabo):** Despliega en `app.nineteencustom.com` y configura la app para usar las APIs de `nineteencustom.com`.
  2. **Pruebas (Hostinger):** Despliega en `app.nineteengreen.com` y configura la app para usar las APIs de `nineteengreen.com`.

**Proceso del script:**
1. Solicita selección de entorno (1 o 2).
2. Solicita confirmación final.
3. Elimina el directorio `./dist` anterior.
4. Ejecuta `npm run generate` inyectando automáticamente las variables de entorno para el destino seleccionado.
5. Crea backup local en `./backups_transpilaciones`.
6. Crea backup remoto en el servidor de destino.
7. Sube archivos vía `rsync`.
8. Limpia backups locales antiguos.

### Frontend (Nuxt.js) - Script de Rollback
- **Script:** `./rollback.sh` (en la raíz del proyecto)
- **Modo:** Interactivo. Permite elegir el entorno y luego seleccionar uno de los últimos 10 respaldos remotos para restaurarlo.
- **Seguridad:** Antes de restaurar, el script mueve la versión actual a un directorio temporal `temp_before_rollback` en el VPS.

## Acceso al VPS

### VPS Contabo (NUEVO - Servidor Principal)
- **Alias SSH:** `vps-contabo` (configurado en `~/.ssh/config`)
- **Host:** `217.216.95.32`
- **Usuario:** `root`
- **Clave/Password:** `vpsContabo_Scure_2026$`
- **Panel CyberPanel:** `http://217.216.95.32:8090`
- **Clave MariaDB:** `-pvpsMDBr00t_2026!#`

```bash
# Conectar via sshpass (sin alias SSH configurado con key)
sshpass -p 'vpsContabo_Scure_2026$' ssh -o StrictHostKeyChecking=no root@217.216.95.32

# O via alias si se configuró la clave
ssh vps-contabo
```

### VPS Hostinger (ANTERIOR - solo referencia)
- **Alias SSH:** `vps-ninesys` (configurado en `~/.ssh/config`)
- **Host:** `194.195.86.253`
- **Usuario:** `root`
- **Clave SSH:** `~/.ssh/id_ed25519_vps`

### Rutas en el VPS (Contabo)
| Aplicación | Ruta en VPS |
|------------|-------------|
| Frontend (Nuxt.js) | `/home/app.nineteencustom.com/public_html/` |
| Backend (Slim API) | `/home/api.nineteengreen.com/public_html/` |
| Backups | `/home/backup/` |

### Comandos de Actualización Remota (Contabo)
**Actualizar API en VPS:**
```bash
sshpass -p 'vpsContabo_Scure_2026$' ssh -o StrictHostKeyChecking=no root@217.216.95.32 "cd /home/api.nineteengreen.com/public_html && git fetch origin && git checkout refactor/modular-routes && git pull origin refactor/modular-routes"
```

**Verificar estado del VPS:**
```bash
sshpass -p 'vpsContabo_Scure_2026$' ssh -o StrictHostKeyChecking=no root@217.216.95.32 "uptime && df -h"
```

### Empresas Disponibles

Según la base de datos central `api_empresas`:

> **⚠️ IMPORTANTE:** La empresa 171 (Pruebas) fue eliminada. Solo persiste la empresa **163 (NineteenCustom)**, que se utiliza como empresa de producción en **ambos VPS** (Hostinger y Contabo).

| ID  | Nombre | Base de Datos | Uso | Host |
|-----|--------|---------------|--------------|--------------|
| 163 | NineteenCustom | `api_emp_163` | 🏭 Producción (Hostinger y Contabo) | `localhost` |

**Consulta via SSH:**
```bash
ssh vps-ninesys "mysql -u api_user_163 -c45ff25ef00ce4ebb0fca422 api_emp_163 -e 'SELECT * FROM tabla LIMIT 10;'"
```



### Base de Datos Central (api_empresas)
Contiene la tabla `empresas` con credenciales de todas las empresas y `empresas_usuarios` con todos los empleados.

| Campo | Valor |
|-------|-------|
| Base de datos | `api_empresas` |
| Usuario | `api_adminemp` |
| Password | `admEmp_n1ne_2026$` |
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

**Paso 1: Recopilar información de TODAS las fuentes disponibles (en orden de prioridad)**

```bash
# 1a. Logs .log (fuente primaria) - Backend
find /home/developer/Escritorio/Antigravity/ninesys-apidev/logs_gemini -name "YYYY-MM-DD*" | sort

# 1b. Logs .log (fuente primaria) - Frontend
find /home/developer/Escritorio/niesys/app_multi/logs_gemini -name "YYYY-MM-DD*" | sort

# 1c. Si NO hay logs: revisar commits de Git (fuente secundaria)
# Backend:
cd /home/developer/Escritorio/Antigravity/ninesys-apidev
git log --all --since="YYYY-MM-DD 00:00:00" --until="YYYY-MM-DD 23:59:59" --pretty=format:"%ad | %s" --date=format:"%H:%M"

# Frontend:
cd /home/developer/Escritorio/niesys/app_multi
git log --all --since="YYYY-MM-DD 00:00:00" --until="YYYY-MM-DD 23:59:59" --pretty=format:"%ad | %s" --date=format:"%H:%M"

# 1d. Si hay conversaciones de esa fecha: revisar walkthrough.md y task.md en:
# /home/developer/.gemini/antigravity/brain/[CONVERSATION-ID]/walkthrough.md
# /home/developer/.gemini/antigravity/brain/[CONVERSATION-ID]/task.md
```

> **⚠️ IMPORTANTE:** Si no hay archivos `.log` para un día donde sí se trabajó,
> SIEMPRE reconstruye desde commits de Git. Nunca omitas un día solo porque falten logs.
> Indica en el reporte que las tareas fueron reconstruidas desde Git.

**Paso 2: Generar el reporte HTML**

Usando la plantilla establecida (ver reportes existentes en `/home/developer/Escritorio/reportes_logs/`).

**Paso 3: Convertir a PDF (OBLIGATORIO)**

```bash
python3 /home/developer/Escritorio/convertir_html_a_pdf.py
```

El script convierte automáticamente todos los HTML en `reportes_logs/` que no tengan PDF.

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