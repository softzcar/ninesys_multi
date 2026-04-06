# Log de Tarea: Unificación de Columnas - Reporte Costos Producción

**Fecha:** 2026-03-26 17:57:00

## Solicitud del Usuario
Unificar columnas en `/reporte-costos-produccion`: (1) costo de insumos + costo de tintas, (2) salario invertido + mano de obra. Asegurar que el detalle de insumos incluya tintas e insumos y mantener cálculos sin sobrecargar el servidor.

## Archivos Involucrados
- [ReporteCostosProduccion.vue](file:///home/developer/Escritorio/niesys/app_multi/components/admin/ReporteCostosProduccion.vue)
- [ReporteCostosDeProduccionInsumos.vue](file:///home/developer/Escritorio/niesys/app_multi/components/admin/ReporteCostosDeProduccionInsumos.vue)
- [ReporteCostosProduccionLabor.vue](file:///home/developer/Escritorio/niesys/app_multi/components/admin/ReporteCostosProduccionLabor.vue)

## Acción Realizada
- Se removieron las columnas separadas de “Costo Tintas” y “Salario Invertido” de la tabla principal y se consolidaron en:
  - `costo_insumos_total` (insumos + tintas)
  - `costo_mano_de_obra_total` (mano de obra + salarios invertidos)
- Se consolidó el cálculo de `costo_total` y `ganancia` por orden con base en los costos unificados.
- El detalle de insumos continúa mostrando tintas e insumos por separado en modal, pero el total se presenta unificado en la tabla.

## Resultado
Éxito (ajuste visual y de cálculo aplicado localmente).

## Verificación
- Compilación del frontend en modo desarrollo completó correctamente (Nuxt).

