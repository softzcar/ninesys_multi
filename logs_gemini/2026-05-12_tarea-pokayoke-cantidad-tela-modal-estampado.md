# Tarea: Poka-Yoke en campo Cantidad del Modal "Datos Extra Estampado"

**Fecha:** 12 de mayo de 2026
**Estado:** Finalizado

## Solicitud del Usuario
En el modal "Datos Extra Estampado" (accesible desde "Terminar Todo" en la vista de órdenes en curso del empleado), el campo "Cantidad" del formulario dinámico de materiales debe recibir metros de tela consumidos, NO kilos. Se solicitó mejorar la UX para prevenir que el empleado ingrese el peso del rollo restante en kg en lugar de los metros efectivamente usados.

## Contexto Técnico
- El backend (`/inventario-movimientos/empleados/update-insumo`) espera `cantidad_consumida` en **metros** para insumos de tipo `tela`. Convierte internamente: `kg = metros / rendimiento`.
- El error humano detectado: el empleado pesa el rollo sobrante (ej. 9.41 kg) y escribe ese número en el campo en lugar de calcular los metros que usó (~1.5 mts).
- Dos patrones de error: (1) confusión de unidad kg→metros, (2) consumo anómalo vs estimado del sistema.

## Cambios Realizados

**Archivo:** `components/empleados/SseOrdenesAsignadasModalExtra.vue`

### 1. Descripción contextual bajo el input
Se añadió `:description="descripcionCantidadRow(index)"` al `b-form-group` del campo Cantidad. Para insumos tipo `tela` muestra: *"Metros de tela que usaste. NO el peso del rollo en kg."*

### 2. Alerta reactiva (b-alert) con dos patrones de detección

**Patrón 1 — `kg_coincidence`**: se activa cuando el valor ingresado está a ±1.5 del stock del rollo en kg. Mensaje: informa cuántos metros equivalen esos kg según el `rendimiento` del insumo.

**Patrón 2 — `alto_vs_estimado`**: se activa cuando el valor supera 3× el estimado del sistema (`materialEstimadoDepartamento.total`). Muestra el % de desviación y recuerda que el campo espera metros de la orden, no del rollo completo.

Las alertas son informativas — no bloquean el envío. El empleado puede ignorarlas si el valor es correcto.

### 3. Tres computeds nuevos

| Computed | Función |
|---|---|
| `insumoDeFormRow(index)` | Resuelve el objeto insumo del inventario a partir del string del typeahead |
| `descripcionCantidadRow(index)` | Texto de ayuda contextual (solo para telas) |
| `warningCantidadTela(index)` | Lógica de detección de patrones; retorna `null` o `{tipo, ...datos}` |

## Comportamiento esperado en el flujo de Estampado

1. Empleado selecciona el rollo de tela en el typeahead.
2. En el campo **Cantidad (Metros)** aparece el hint: *"Metros de tela que usaste. NO el peso del rollo en kg."*
3. Si escribe `9.41` (el kg del rollo sobrante, stock ~9.76 kg):
   - Se activa **`kg_coincidence`** → alerta: *"¿Estás ingresando el peso del rollo? Si consumiste 9.41 kg, eso equivale a 37.64 metros (rendimiento: 4 mts/kg)."*
4. Si escribe un valor > 3× el estimado del sistema:
   - Se activa **`alto_vs_estimado`** → alerta con el porcentaje de desviación.
5. Si escribe un valor razonable (ej. 1.5 mts): no aparece ninguna alerta.

## Observaciones
- La alerta no reemplaza la rutina de corrección del administrador para datos ya guardados incorrectamente.
- El patrón `kg_coincidence` usa un margen de ±1.5 kg para tolerar ligeras diferencias entre el stock registrado y el peso real del rollo.
- No hay cambios en backend ni en la lógica de envío — solo mejora visual/preventiva.
