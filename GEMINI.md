# GEMINI.md - Instrucciones para el modelo

## Instrucciones Base
- Siempre conversaremos en español.
- Revisa la estructura de directorios y los archivos necesarios para tener el contexto más completo posible del proyecto.
- Siempre prefiere implementar código de la manera menos invasiva posible.
- Evita hacer cambios o mejoras que no se te soliciten, pero siempre puedes sugerirlas.
- **Antes de iniciar cualquier acción,** siempre actualízate leyendo los logs anteriores en `/logs_gemini/`.
- **REGLA DE ORO DE DIRECTORIOS:** El único lugar autorizado para modificar frontend es `/home/developer/Escritorio/niesys/app_multi/`. El único backend es `/home/developer/Escritorio/niesys/ninesys-api/`. Queda ESTRICTAMENTE PROHIBIDO utilizar o leer carpetas fuera de `/home/developer/Escritorio/niesys/`.

## Contexto Técnico
- **Framework del Backend:** Slim Framework.
- **Rutas de la API:** `https://raw.githubusercontent.com/softzcar/ninesys-api/refs/heads/main/app/routes.php` (Usar `curl` para leer el contenido).

## ⚠️ REGLAS DE SEGURIDAD Y DESPLIEGUE (LECTURA OBLIGATORIA)

- **Prohibición de Contabo (Producción):** Queda ESTRICTAMENTE PROHIBIDO realizar cualquier tipo de despliegue, sincronización o comando remoto hacia el servidor de Contabo sin una orden explícita, directa y literal del usuario para esa acción específica.
- **Prohibición de Despliegue Automático:** NUNCA asumas que un cambio debe ser desplegado inmediatamente a PRODUCCIÓN. 
- **🛑 SCRIPTS DE DESPLIEGUE — UBICACIÓN CENTRALIZADA:** Todos los scripts de despliegue deben ejecutarse ÚNICAMENTE desde `/home/developer/Escritorio/niesys/ninesys-hub/bin/`. Los scripts en directorios individuales del proyecto (`app_multi/deploy.sh`, etc.) pueden estar DESACTUALIZADOS en rutas de VPS. **NO ejecutar scripts de despliegue que no estén en `ninesys-hub/bin/`.**
  - Frontend: `ninesys-hub/bin/deploy.sh` (opción 2 para Hostinger)
  - Backend: `ninesys-hub/bin/deploy_backend.sh` (opción 2 para Hostinger)
- **Sincronización Obligatoria Backend (Hostinger):** TODO cambio realizado en el código local del backend (`ninesys-api`) DEBE ser subido inmediatamente al servidor de DESARROLLO (Hostinger - `vps-ninesys`) una vez verificado mínimamente en local. Los cambios no sincronizados se consideran inútiles.
- **Protocolo Pre-Despliegue Producción:** Antes de sugerir o ejecutar un despliegue a Contabo, DEBES:
    1. Releer esta sección de `GEMINI.md`.
    2. Ejecutar el workflow `/.agents/workflows/validar-seguridad-despliegue.md`.
    3. Obtener confirmación textual del usuario para el servidor específico (Hostinger o Contabo).

## Flujos de Trabajo (Workflows) Obligatorios
- **Gestión de Bitácora:** Al finalizar CADA tarea técnica, ejecuta estrictamente el workflow `/.agents/workflows/registrar-tarea.md`.
- **Generación de Reportes:** Al finalizar la sesión de trabajo o cuando el usuario lo solicite, ejecuta el workflow `/.agents/workflows/generar-reporte.md`.
- **Validación de Seguridad:** Obligatorio antes de cualquier interacción con servidores remotos: `/.agents/workflows/validar-seguridad-despliegue.md`.