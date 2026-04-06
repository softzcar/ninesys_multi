# Log de Tarea: Fix Salarios Invertidos y Consistencia de IDs

**Fecha:** 2026-03-27 10:41:39

## Solicitud del Usuario
Analizar el caso de la orden 4184 donde “Salarios Invertidos” muestra empleados sin nombre y costo/hora en cero; y preparar correcciones de consistencia para cálculo de salarios.

## Archivos Involucrados
- [mixin-time.js](file:///home/developer/Escritorio/niesys/app_multi/mixins/mixin-time.js)
- [ReporteCostosProduccionLabor.vue](file:///home/developer/Escritorio/niesys/app_multi/components/admin/ReporteCostosProduccionLabor.vue)

## Acción Realizada
- Se hizo robusto el cálculo para soportar datos de empleado con `id_usuario` o `id_empleado`.
- Se normalizó comparación numérica de `id_orden` e `id_empleado` para evitar fallos por tipos (string vs number).

## Resultado
Éxito (cálculo preparado para recibir `costo_por_hora` y `nombre` desde API).

## Verificación
- Diagnósticos del editor sin errores.

