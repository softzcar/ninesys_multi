# Tarea: Integración de Gastos Reales en Reporte de Costos

**Fecha:** 6 de mayo de 2026
**Estado:** Finalizado

## Solicitud del Usuario
Incluir los gastos reales (fijos, variables y adicionales) de las tablas `gastos` y `gastos_registros` en el reporte de costos de producción. Los gastos deben poder activarse dinámicamente mediante checkboxes y prorratearse por producto según la cantidad total fabricada en el rango de fechas seleccionado.

## Cambios realizados

### 1. Backend (`ninesys-api`)
- **Archivo:** `app/routes/reports.php`
- **Cambio:** Se actualizó el endpoint `/reportes/costos-produccion/{inicio}/{fin}` para consultar la tabla `gastos_registros`.
- **Lógica:** Sumatoria de montos agrupados por `tipo` y `moneda` dentro del rango de fechas.
- **Respuesta:** Se añadió el objeto `gastos_por_tipo` dentro de `costos_operativos`.
- **Despliegue:** Sincronizado con Hostinger (vps-ninesys) mediante `deploy_backend.sh`.

### 2. Frontend (`app_multi`)
- **Archivo:** `components/admin/ReporteCostosProduccion.vue`
- **Interfaz:**
  - Añadidos checkboxes (switches) para "Fijos", "Variables" y "Adicionales".
  - Columnas dinámicas que aparecen/desaparecen según la selección.
  - Nueva sección de "Resumen de Costos Operativos" al final del reporte.
- **Lógica de Cálculo:**
  - Conversión automática de gastos a USD utilizando las tasas de cambio del `store` (`bolivar`, `peso_colombiano`).
  - Cálculo de costo por unidad: `Total Gasto USD / Total Productos del Periodo`.
  - Prorrateo por fila: `Costo por Unidad * Cantidad de Productos de la Orden`.
  - Actualización reactiva de **Ganancia Neta** y **Costo Total** en tiempo real.

## Verificación
- Backend devuelve el desglose de gastos correctamente.
- Frontend muestra las columnas dinámicamente.
- El pie de página (Totales) refleja la sumatoria de los gastos prorrateados seleccionados.
- La utilidad neta al final del reporte se calcula restando los gastos seleccionados de la ganancia bruta.

## Observaciones
- Se mantuvo la compatibilidad con el cálculo anterior de gastos fijos de plantilla para evitar errores en otras vistas si las hubiera.
- Se asegura que el prorrateo solo ocurra si hay al menos un producto fabricado en el periodo.
