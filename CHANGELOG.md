# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), versionado según [SemVer](https://semver.org/lang/es/).

Ver también `ninesys-hub/releases/` para el contexto de negocio detrás de cada cambio (qué problema resolvía, qué otros repos se tocaron junto con este).

## [v1.0.15] - 2026-09-04
- Fix: restaurar reposicionesPendientes.vue eliminado por error (columna Interaccion vacia en Reposiciones por aprobar)

## [v1.0.14] - 2026-09-04
- Reporte pagos-abonos: total pagado y saldo pendiente ahora acotados al rango de fechas, no historial completo

## [v1.0.13] - 2026-09-04
- Barra de progreso al subir imagenes desde el editor Quill, mismo patron de b-progress ya usado en app_multi

## [v1.0.12] - 2026-09-04
- Fix: race con v-model impedia detectar imagenes quitadas del editor Quill (nunca disparaba el borrado)

## [v1.0.11] - 2026-09-04
- Limpiar imagenes huerfanas al quitarlas del editor Quill en descripcion de orden

## [v1.0.10] - 2026-09-03
- Quitar switch Repartir: siempre indicar piezas por empleado con 2+ asignados, sin atajo de asignacion completa

## [v1.0.9] - 2026-09-03
- Mensaje explicito de reintento en el error del autoguardado (click en Guardar asignacion)

## [v1.0.8] - 2026-09-03
- Fix: guard de idempotencia contra toasts duplicados y boton activo sin cambios pendientes

## [v1.0.7] - 2026-09-03
- Fix: autoguardado disparaba toasts al abrir el modal (reenviaba lo recien cargado); agregada bandera hidratando

## [v1.0.6] - 2026-09-03
- Asignacion automatica de empleados sin boton Guardar (autoguardado con debounce) + confirmacion al cerrar modal con datos pendientes

## [v1.0.5] - 2026-09-03
- Fix layout Ordenes terminadas: grid dedicado de 3 columnas en vez del de 10 de Ordenes en curso

## [v1.0.4] - 2026-09-03
- Badge de Ordenes terminadas: mostrar puntos suspensivos en vez de 0 mientras no ha cargado

## [v1.0.3] - 2026-09-03
- Seccion Ordenes terminadas en Control de Produccion con emision de reposiciones

## [v1.0.2] - 2026-09-03
- Recuperar escritura de monto en moneda base con auto-conversion en MetodosPagoDinamico

## [v1.0.1] - 2026-09-02
- Prueba del sistema de versionado -- redeploy sin cambios funcionales

## [v1.0.0] - 2026-09-02
Punto de partida del sistema de versionado. No es la primera versión real de la app -- es donde arranca el control formal de versiones, tags de git y este archivo.
