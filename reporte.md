# Reporte Frontend

## Miércoles, 13 de mayo de 2026

| Solicitud (Resumen) | Logro Conseguido |
| :--- | :--- |
| Agregar barra de eficiencia de tiempo en el modal Reporte de Pago de `/empleados/planilla-de-pagos`. | `PagosReporteEmpleado.vue`: agrega `mixin-time`, extrae `id_orden` únicos de `data.pagos` y hace POST a `/reports/manufacturing-time`; calcula tiempo real con `calcularTiempoTrabajoIndividual` (horario laboral) sobre `tareas_detalles`; muestra `charts-EfficiencyChart` si hay datos; invisible para empleados sin tareas de producción. |
| Analizar y verificar cálculo de eficiencia de tiempo del empleado en `/empleados/dashboard`. | Confirmado que los cálculos son correctos: Eficiencia = (proyectado/real)×100 usando `calcularTiempoTrabajoIndividual` (mixin de horario laboral). Porcentajes inusuales eran datos de prueba. |
| Eliminar popup DEBUG de `horarioLaboral` que aparecía en cada recarga. | Reemplazado `this.$fire(...)` por `console.warn` en `SseOrdenesAsignadasV4.vue`. Commit `1a4b073`. |
| Corregir label semántico "Tiempo Total Disponible" en barra de En Progreso. | Renombrado a "Tiempo Estimado" en `RendimientoGeneral.vue`. Commit `9a93738`. |
| Datos de prueba inflaban la eficiencia (órdenes con fechas absurdas de 8 días). | Registros `_id 5762, 6074` (orden 3597) corregidos a sesión realista de 10 min el 20-ene. `_id 8800` (orden 4495) corregido a 2 min el mismo día de inicio (2026-05-07). Resultado: ~105% eficiencia (correcto). |
| Página mostraba "No tienes tareas asignadas" al terminar todas las órdenes aunque hubiera reposiciones. | `ordenesSize` ahora suma `ordenes + reposiciones + vinculadas`. `fetchEfficiency` usa reposiciones/vinculadas como fallback antes de `unpaid-orders`. Commit `61a2697`. |
| Gráfico "Eficiencia de tiempo" no se mostraba para Impresión (dept 1); reemplazar "Pagos semanales" por este gráfico. | Backend: bloque de Impresión en `dashboard-stats` ejecuta el mismo SQL de eficiencia que Producción (antes devolvía 0/0). Frontend: gráfico de Eficiencia visible para todos excepto Diseño (dept 7); Pagos oculto para Impresión (dept 1). |
| Gráfico de inicio mostraba 0% aunque las barras del dashboard mostraban 105%. | `dashboard-stats` usaba raw TIMESTAMPDIFF sin horario laboral y filtraba por `id_departamento` del store (16) que no coincide con el dept guardado en los registros (1). `DashboardEmpleado` ahora usa el mismo flujo exacto: `ordenes-asignadas/v2` + `terminadas-hoy` → `POST /reports/manufacturing-time` → `calcularTiempoTrabajoIndividual` (mixin-time). Commit `e226689`. |
| Label del radialBar mostraba 100% aunque la eficiencia real era 105%. | `EfficiencyChart`: el formatter de ApexCharts recibía el valor de la serie (limitado a 100 para el arco). Corregido capturando `efficiencyPercentage` via closure en la computed `chartOptions`. Commit `d18e96b`. |
| Eficiencia mezclaba tareas de todos los departamentos del empleado al cambiar de dept en el sidebar. | Backend `manufacturing-time` ahora acepta `id_departamento` en el body y filtra CTE, subqueries de proyección, `tareas_detalles` y `tarea_terminada` por ese departamento. Frontend pasa `currentDepartamentId` desde `SseOrdenesAsignadasV4` y `DashboardEmpleado`. Commits `c7e98d5` (frontend) y `b5b41a5` (backend, desplegado). |
| Implementar UI "Eliminar empresa completa" en `setup.nineteengreen.com/usuarios`. | `usuarios.vue`: modal de confirmación con escritura del nombre exacto, muestra BD `api_emp_{N}` y lista de lo que se elimina; botón visible para todas las empresas sin restricción de `activo`. Deploy a Hostinger. |
| `DELETE /setup/user/{id}` respondía 400 para empresas activas (`activo = 1`). | Eliminado el check en `routes.php`; solo se conserva la guardia para `id_empresa = 163`. Commit `6f1d4dc`. |
| Error `Duplicate column name 'id_reposicion'` al crear nueva empresa. | Segunda definición de `id_reposicion` en `lotes_detalles_empleados_asignados` eliminada del schema. Commit `39e3e4a`. |
| Error `Table 'api_emp_N.wa_tenant_config' doesn't exist` al crear nueva empresa. | Bug en `splitSqlStatements`: líneas `--` entre statements se acumulaban al inicio del siguiente, haciendo que el regex de comentario descartara el CREATE TABLE completo. Fix: skip de líneas `--`/`#` cuando `$currentStatement` está vacío. Commit `68283b3`. |

---

## Martes, 21 de abril de 2026

| Solicitud (Resumen) | Logro Conseguido |
| :--- | :--- |
| Auditar y corregir el reporte de costos de producción. | Consistencia del 100% en la columna de Mano de Obra entre tablas, enlaces y totales. |
| Corregir montos inflados en insumos. | Fix en el alta de insumos para asegurar la existencia de `cantidad_inicial`. |
| Script para corregir datos históricos. | Creación del script SQL de auditoría y detección de inconsistencias en movimientos. |

### Detalle de Tareas Realizadas

**1. Optimización del Reporte de Costos (Mano de Obra)**
- **Sincronización:** Se implementó comunicación reactiva entre el modal de detalle y la tabla principal. Ahora el total de la columna (footer) suma los valores reales calculados por los hijos.
- **Integración de Salarios Fijos:** Se logró rescatar el salario base de empleados que no marcan tiempo (vendedores) desde la tabla de pagos para que el costo de la orden sea real y no solo basado en comisiones.
- **Limpieza de Lógica:** Se eliminaron duplicidades de salarios que ocurrían al filtrar o recalcular la tabla.

**2. Mejora en la Gestión de Insumos**
- Se modificó el componente `InsumoNuevo.vue` para que siempre inicialice el campo `cantidad_inicial`. Esto previene errores de división por cero en el backend que disparaban los costos unitarios a miles de dólares.

**3. Auditoría de Datos Históricos**
- Se creó el archivo `/home/developer/Escritorio/niesys/app_multi/corregir_cantidad_inicial.sql`.
- Se detectó que algunos registros tienen una cantidad actual mayor a la inicial registrada en sus movimientos, lo que sugiere ediciones manuales en la DB.

### Resumen Final de la Jornada

#### Logros Generales
- El reporte de producción ahora es una herramienta fiable para medir la rentabilidad de las órdenes terminadas.
- Los cambios del backend fueron desplegados exitosamente en el servidor de desarrollo (Hostinger).
- Se resolvieron bugs de reactividad y visualización (typos y discrepancias de cálculo).

#### Tareas Pendientes / En Curso
- **Corrección de Inventario Histórico:** El script SQL está listo pero pausado. Se requiere decidir si forzamos `cantidad_inicial = GREATEST(valor_inicial, cantidad_actual)` para limpiar los ceros.
- **Auditoría Orden 4287:** Se sospecha de una duplicidad de registro de comisión para la vendedora Sarahit Mojica en esta orden específica ($ 4.00 de comisión por una venta de $ 15.00). Pendiente revisar directamente en la tabla `pagos` de la DB.
- **Rendimiento de Tela:** Pendiente en bitácora original implementar el cálculo de rendimiento por kilo (1kg = 4mts) en la edición de insumos.
