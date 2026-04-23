# Tarea: Corrección de reactividad en tablas con ordenamiento

**Fecha:** 22 de abril de 2026
**Estado:** Finalizado
**Archivos modificados:**
- `pages/empleados/gestion/index.vue`
- `pages/impresoras/gestion/index.vue`
- `components/produccion/controlDeProduccion.vue`

## Descripción
Se detectó un problema en la página de gestión de empleados donde, al reordenar la tabla, los componentes de la columna de acciones (específicamente `AdminEmpleadoEditar`) mantenían la información del ítem anterior. Esto sucedía porque el componente copiaba las props a su estado interno en `mounted()` y Vue reutilizaba la instancia al no tener una clave única (`:key`) en el slot de la tabla.

## Cambios realizados
1.  **Empleados:** Se agregó `primary-key="_id"` a `b-table` y `:key="data.item._id"` al componente `AdminEmpleadoEditar`.
2.  **Impresoras:** Se agregó `:key="data.item._id"` al componente `admin-ImpresoraEditar` en la tabla de gestión.
3.  **Control de Producción:** Se agregaron claves únicas (`:key`) a varios componentes dentro de los slots de la tabla (`ordenes-editar`, `link-search`, `produccion-progress-bar`, etc.) para asegurar que se reinicialicen correctamente al cambiar la fila tras un ordenamiento o filtrado.

## Validación
- Se verificó que los componentes ahora utilicen `:key` para forzar su re-renderizado cuando el ítem de la fila cambia.
- Se mantuvo la coherencia con otros componentes de gestión (como categorías) que ya implementaban este patrón.
