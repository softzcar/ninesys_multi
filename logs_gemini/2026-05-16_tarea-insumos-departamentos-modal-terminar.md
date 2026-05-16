# Tarea: Insumos por Departamento, Salarios Proporcionales y Fixes Modal Terminar Todo

**Fecha:** 16 de mayo de 2026
**Estado:** Finalizado

## Resumen de Cambios

| # | Solicitud | Archivos | Commits |
|---|---|---|---|
| 1 | Salarios proporcionales (horas trabajadas) en modal Mano de Obra | `reports.php`, `ReporteCostosProduccionLabor.vue` | `e8d8cce`, `e13b542` |
| 2 | Cada departamento ve solo sus propios insumos en modal Terminar Todo | `SseOrdenesAsignadasModalExtra.vue` | `62128d2` |
| 3 | Mostrar Mt en lugar de Kg para telas en Material Estimado (Estampado) | `SseOrdenesAsignadasModalExtra.vue` | `bb40584` |
| 4 | Deshabilitar checkbox Terminar para insumos consumidos por otro departamento | `SseOrdenesAsignadasModalExtra.vue` | `5e7b36c` |
| 5 | Soporte genérico de insumos para departamentos creados a discreción | `SseOrdenesAsignadasModalExtra.vue` | `e4ae3de` |

---

## 1. Salarios proporcionales en modal "Detalle de Costos de Mano de Obra"

### Solicitud
Mostrar en la sección "Salarios" del modal el salario calculado proporcionalmente
en base al tiempo real trabajado (`lotes_detalles_empleados_asignados`), solo para
empleados tipo `Salario` o `Salario más Comisión`.

### Causa raíz anterior
El endpoint retornaba un array plano de `pagos`. La sección de Salarios usaba
`total_salario_pagado` de los registros de pagos, que no reflejaba el tiempo
trabajado en la orden sino el período completo.

### Cambios — Backend (`ninesys-api/app/routes/reports.php`)

Endpoint `/reportes/mano-obra-por-orden/{id_orden}` refactorizado:
- Ahora retorna `{ pagos: [...], salarios: [...] }` en lugar de array plano.
- Nueva sección `salarios`: consulta `lotes_detalles_empleados_asignados` agrupando
  por empleado, suma `TIMESTAMPDIFF(SECOND, fecha_inicio, fecha_terminado) / 3600`
  como `horas_trabajadas`.
- Calcula `costo_por_hora = salario_monto / (horasSemana × factorSemanas)` usando
  el mismo algoritmo del reporte principal (horario de la empresa de `api_empresas.empresas`).
- Calcula `salario_proporcional = costo_por_hora × horas_trabajadas`.
- Solo incluye empleados con `salario_tipo IN ('Salario', 'Salario más Comisión')`.

**Fórmula `costo_por_hora` para periodo semanal:**
```
horasDia = (horaFinMañana - horaInicioMañana) + (horaFinTarde - horaInicioTarde)
horasSemana = horasDia × count(diasLaborales)
factorSemanas = 1 (semanal), 2 (quincenal), 4.33 (mensual), ...
costo_por_hora = salario_monto / (horasSemana × factorSemanas)
```

### Cambios — Frontend (`components/admin/ReporteCostosProduccionLabor.vue`)

- `getManoDeObra()`: lee `data.pagos` y `data.salarios` del nuevo shape.
- `calcularDetallesSalarios()` eliminada (redundante).
- `fieldsSalarios`: ahora 4 columnas → Empleado / Horas / Costo/Hora / Salario Proporcional.
- `totalSalarios` computed: suma `salario_proporcional` en lugar de `subtotal`.

---

## 2. Filtrado estricto de insumos por departamento

### Solicitud
Estampado mostraba materiales de Impresión en el typeahead y en los botones de tipo.
Cada departamento debe ver únicamente los insumos asignados a su propio departamento.

### Causa raíz
La lógica de "departamentos hermanos" en `dataInsumosFiltrado`, `dataSearchInsumo`
y `selectOptions` agrupaba Estampado y Corte junto con Impresión bajo el supuesto
de una inversión histórica de categorías en la DB. Esto hacía que Estampado viera
"Papel para sublimación" y otros materiales de Impresión.

### Cambios (`SseOrdenesAsignadasModalExtra.vue`)

**`dataInsumosFiltrado`**: eliminado bloque de hermanos completo para Corte/Estampado.
Solo se conserva la excepción `Revisión/Limpieza → Producción`.

**`dataSearchInsumo` fallback**: Estampado y Corte ahora usan filtro directo por su
propio nombre de departamento. La inversión `Impresión → Telas` para el inventario
solo se conserva para el departamento `Impresión`.

**`selectOptions`**: `depFilter` para Estampado es ahora el nombre del departamento
directamente. Solo Impresión mantiene el mapeo `→ "Telas"`.

---

## 3. Mostrar Metro en lugar de Kg para telas (Estampado)

### Solicitud
El Material Estimado en el modal de Estampado mostraba la unidad como "Kg" para
telas, pero debería mostrar "Mt".

### Causa raíz
El endpoint `/eficiencia-orden` no retorna el campo `tipo_insumo` (que está en la
tabla `inventario`, no en `product_insumos_asignados`). El check
`ins.tipo_insumo === 'tela'` siempre era `undefined → false`, por lo que la
conversión Kg→Mt nunca se ejecutaba. Además, en `materialEstimadoPorCatalogo`,
`tipo_insumo` no se propagaba al `catalogoMap`.

### Fix
Reemplazado el check por `unidad.toLowerCase() === 'kg'`. Cualquier insumo con
unidad Kg se muestra como Mt. Aplica en `materialEstimadoDepartamento` y
`materialEstimadoPorCatalogo`.

---

## 4. Checkbox "Terminar" deshabilitado para insumos de otro departamento

### Solicitud
En el modal de Corte, el checkbox "Terminar" estaba habilitado para insumos
consumidos por Estampado (marcados como `precargado: true`). Solo el departamento
que consumió el insumo puede terminarlo.

### Fix
Condición `:disabled` del checkbox ampliada de `!itemForm.validInsumo` a
`!itemForm.validInsumo || itemForm.precargado`. Los ítems precargados quedan
permanentemente deshabilitados para terminar.

---

## 5. Soporte genérico para departamentos custom

### Solicitud
La sección "Material Estimado" mostraba "No hay datos de insumos disponibles"
para el departamento "Costura" (que tiene "Botones" asignados). Advertencia:
los departamentos se pueden crear a discreción y deben funcionar igual que
los fijos sin necesitar hardcodeo de nombres.

### Causas raíz (dos bugs)

**Bug 1 — `dataInsumosComputed`**:
El prop `dataInsumos` contiene insumos de TODAS las órdenes activas del empleado.
Si el prop tenía ítems de otras órdenes pero no de Costura en la orden actual,
el computed retornaba todos (no solo la orden actual), y `dataInsumosFiltrado`
quedaba vacío al filtrar por `id_orden == idorden`.

**Fix**: `dataInsumosComputed` ahora filtra primero el prop por `id_orden == this.idorden`.
Si no hay nada para esta orden en el prop, usa `dataInsumosLocal`.

```javascript
// ANTES
if (this.dataInsumos && this.dataInsumos.length > 0) return this.dataInsumos;
return this.dataInsumosLocal;

// DESPUÉS
const fromProp = (this.dataInsumos || []).filter(item => item.id_orden == this.idorden);
if (fromProp.length > 0) return fromProp;
return this.dataInsumosLocal;
```

**Bug 2 — `evaluateShowSelect`**:
Lista hardcodeada `["Revisión", "Limpieza", "Costura"]` hacía que departamentos
con otro nombre cayeran al paso 4 (que usaba `dataInsumosFiltradoEstricto`,
con lógica diferente a `dataInsumosFiltrado`).

**Fix**: Eliminados todos los nombres hardcodeados. La lógica ahora es:
1. Corte → siempre activo
2. Impresión → siempre activo
3. Estampado/Corte de papel → activo si `usa_desperdicio == 1`
4. Cualquier otro departamento (fijo o custom) → activo si `dataInsumosFiltrado.length > 0`

---

## Commits Resumen

| Hash | Repo | Descripción |
|------|------|-------------|
| `e8d8cce` | backend | `feat(reporte-costos): calcular salarios proporcionales por horas trabajadas en mano-obra-por-orden` |
| `e13b542` | frontend | `feat(reporte-costos): mostrar salarios proporcionales por horas trabajadas en modal mano de obra` |
| `62128d2` | frontend | `fix(materiales): cada departamento ve solo sus propios insumos en modal Terminar Todo` |
| `bb40584` | frontend | `fix(estampado): mostrar Mt en lugar de Kg para telas en Material Estimado` |
| `5e7b36c` | frontend | `fix(corte): deshabilitar checkbox Terminar para insumos consumidos por otro departamento` |
| `e4ae3de` | frontend | `fix(modal-extra): soporte genérico de insumos para departamentos custom` |
