# Tarea: Corrección de reactividad y precisión en reportes de costos

**Fecha:** 23 de abril de 2026
**Estado:** Finalizado

## Cambios realizados

### 1. Reactividad en Tablas de Gestión
- **Empleados e Impresoras:** Se implementó `primary-key="_id"` en las tablas de gestión y `:key="data.item._id"` en los componentes de edición (`AdminEmpleadoEditar`, `admin-ImpresoraEditar`). Esto garantiza que los formularios carguen la información correcta al reordenar la tabla.
- **Componente EmpleadoEditar:** Se añadió un `watch` sobre la prop `item` y se estabilizó el ID del modal usando el `_id` del empleado, evitando conflictos de estado entre filas.

### 2. Precisión en Reporte de Costos de Producción
- **Fuente de la Verdad:** Se unificó el reporte para que tanto los links individuales como la sumatoria total utilicen exclusivamente los montos de la API.
- **Cálculo de Totales:** Se ajustó la lógica de acumulación en `reportTotals` para que sume los valores ya redondeados a dos decimales, eliminando discrepancias por precisión de coma flotante.
- **Sincronización:** Se eliminó la retroalimentación del componente hijo al padre para evitar que cálculos locales del desglose alteraran el total oficial de la API en la tabla principal.
- **Desglose en Modal:** El modal de mano de obra ahora muestra el total de la API como valor oficial y presenta una nota de ajuste si existe diferencia con el desglose calculado en tiempo real.

## Archivos modificados
- `pages/empleados/gestion/index.vue`
- `pages/impresoras/gestion/index.vue`
- `components/admin/EmpleadoEditar.vue`
- `components/admin/ReporteCostosProduccion.vue`
- `components/admin/ReporteCostosProduccionLabor.vue`
- `components/produccion/controlDeProduccion.vue`

## Verificación
- La sumatoria de la columna "Costo M.O." coincide exactamente con el total mostrado en el pie de página ($32.96 en las pruebas).
- El reordenamiento de empleados actualiza correctamente el contenido del formulario de edición.
