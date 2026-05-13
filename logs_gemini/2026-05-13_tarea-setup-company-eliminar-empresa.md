# Tarea: Setup Company — Funcionalidad "Eliminar Empresa Completa"

**Fecha:** 13 de mayo de 2026
**Estado:** Finalizado

## Solicitud del Usuario

En `https://setup.nineteengreen.com/usuarios` implementar la UI para eliminar completamente una empresa creada (base de datos, usuario MySQL, registros centrales). Además, corregir los bugs encontrados durante las pruebas de creación de nuevas empresas.

## Cambios en setup_company (frontend)

**Archivo:** `setup_company/pages/usuarios.vue` — reescrito completamente

- Botón "Eliminar empresa" en tabla (desktop) y tarjetas (móvil), visible para todas las empresas sin restricción de estado `activo`.
- Modal de confirmación (`id="eliminarModal"`, `data-bs-backdrop="static"`):
  - Muestra advertencia con lista de lo que se eliminará: BD `api_emp_{N}`, usuario MySQL `api_user_{N}`, empleados centrales, configuración de gastos.
  - Tabla resumen con nombre, email, BD e ID de la empresa.
  - Campo de confirmación: el usuario debe escribir el nombre exacto de la empresa para habilitar el botón de eliminación.
  - Computed `confirmacionValida`: maneja el caso especial de empresas sin nombre (`'Sin nombre...'`).
- Llama a `DELETE /setup/user/{id_empleado}`.

**Archivo:** `setup_company/nuxt.config.ts`
- `apiBase` apunta a `https://api.nineteengreen.com` (limpieza de referencia antigua a `nineteencustom.com`).

**Archivo:** `setup_company/deploy_setup.sh`
- Eliminadas todas las referencias a Contabo (`vps-contabo`, `217.216.95.32`, `nineteencustom.com`).
- Solo despliega a `vps-ninesys` / `setup.nineteengreen.com` (Hostinger).

## Bugs corregidos en el backend (ninesys-api)

### 1. `DELETE /setup/user/{id}` bloqueaba empresas activas

**Archivo:** `app/routes.php` — líneas 596-600 eliminadas

El endpoint rechazaba con 400 cualquier empresa con `activo = 1` (empresas ya configuradas). Se eliminó el check, conservando únicamente la guardia de seguridad para `id_empresa = 163` (Producción).

**Commit:** `6f1d4dc`

### 2. Columna duplicada en schema de nueva empresa

**Archivo:** `public/model/create_new_company_api_emp_N.sql`

La tabla `lotes_detalles_empleados_asignados` tenía `id_reposicion` definida dos veces (líneas 542 y 551). Provocaba `SQLSTATE[42S21]: Column already exists: 1060 Duplicate column name 'id_reposicion'` al crear cualquier empresa nueva.

Se eliminó la segunda definición (línea 551, la redundante).

**Commit:** `39e3e4a`

### 3. Parser SQL silenciosamente descartaba CREATE TABLE precedidos por comentarios `--`

**Archivo:** `app/routes.php` — función `splitSqlStatements`

**Causa raíz:** El parser acumula líneas en `$currentStatement`. Las líneas de comentario (`-- texto`) entre statements se acumulaban al inicio del siguiente statement. Al capturar ese statement, el regex `/^(\s*--)/ ` detectaba que empezaba con `--` y lo descartaba en silencio, eliminando el CREATE TABLE completo.

Afectaba a:
- `CREATE TABLE wa_usage_monthly` (precedida por 4 líneas de comentario, líneas 1883-1886).
- `CREATE TABLE wa_tenant_config` (precedida por 2 líneas de comentario, líneas 1897-1898).

**Error visible:** `SQLSTATE[42S02]: Base table or view not found: 1146 Table 'api_emp_N.wa_tenant_config' doesn't exist` al intentar el INSERT de inicialización.

**Fix:** Agregar un `continue` al inicio del loop de líneas cuando `$currentStatement` está vacío y la línea es un comentario:

```php
// Saltar líneas de comentario entre statements (-- y #) para que no
// contaminen el inicio del siguiente statement y hagan que sea descartado
if (empty($currentStatement) && preg_match('/^(--|#)/', $line))
    continue;
```

**Commit:** `68283b3`

## Commits

Todos en rama `refactor/modular-routes` de `ninesys-api`:

| Hash | Descripción |
|------|-------------|
| `6f1d4dc` | `fix(setup): permitir eliminación de empresas activas en DELETE /setup/user/{id}` |
| `39e3e4a` | `fix(schema): eliminar columna id_reposicion duplicada en lotes_detalles_empleados_asignados` |
| `68283b3` | `fix(sql-parser): saltar comentarios -- entre statements en splitSqlStatements` |
