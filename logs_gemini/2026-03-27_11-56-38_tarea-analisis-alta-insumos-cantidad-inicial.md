# Log de Tarea: Análisis Alta de Insumos y cantidad_inicial

**Fecha:** 2026-03-27 11:56:38

## Solicitud del Usuario
Revisar el formulario de “Nuevo Insumo” en `/inventario/gestion` para confirmar qué campos se envían a la API y por qué `cantidad_inicial` queda en 0.

## Archivos Involucrados
- [InsumoNuevo.vue](file:///home/developer/Escritorio/niesys/app_multi/components/inventario/InsumoNuevo.vue)

## Hallazgos
- El formulario envía `cantidad` pero no envía `cantidad_inicial`.
- Al clonar por SKU, se copian metadatos (insumo, unidad, tipo, rendimiento, departamento, id_catalogo), pero no cantidades.

## Resultado
Análisis completado y documentado para soportar el fix en backend.

