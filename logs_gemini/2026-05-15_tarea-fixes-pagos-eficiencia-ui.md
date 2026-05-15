# Tarea: Fixes — Pagos FK violation, NaN en costos, UI planilla, Eficiencia inflada

**Fecha:** 15 de mayo de 2026
**Estado:** Finalizado

## Solicitud del Usuario

Tres problemas reportados en la sesión de pruebas con empresa nueva (ID 185):

1. Empleado de Impresión no aparecía en `/empleados/planilla-de-pagos` tras completar la primera orden.
2. Subtotal de comisiones mostraba `$ NaN` en el modal "Detalle de Costos de Mano de Obra" de `/reporte-costos-produccion`.
3. El botón "Ver Detalles" del modal "Confirmar Pago" debía sustituirse por el ícono de reporte ya existente en la tabla.
4. La "Eficiencia Tareas Completadas" se inflaba ~100% por cada nueva orden asignada.

---

## 1. FK violation en INSERT de `pagos` — empleado invisible en planilla

### Causa raíz

`pagos.id_reposicion` tiene una FK constraint hacia `reposiciones._id`. Para tareas normales (no reposiciones), el código insertaba `id_reposicion = 0`. En empresas nuevas la tabla `reposiciones` está vacía, por lo que `_id = 0` no existe → MySQL rechazaba el INSERT silenciosamente → sin registro en `pagos` → empleado invisible en planilla.

Solo la rama `fija` de `registrar-paso-empleado` usaba `'NULL'` correctamente. El resto tenían el bug.

Adicionalmente, las queries de verificación de duplicados usaban `id_reposicion = NULL` (SQL inválido, siempre `false`), lo que deshabilitaba la detección de duplicados para pagos normales.

### Archivos modificados

**`ninesys-api/app/routes/manufacturing.php`**

Se corrigieron **7 lugares** con el bug:

| Endpoint | Tipo de fix |
|---|---|
| `registrar-paso-empleado` — rama porcentaje | `'0'` → `'NULL'` en `$id_reposicion_val`; sqlCheck usa `IS NULL` |
| `registrar-paso-empleado` — rama fija | sqlCheck usa `IS NULL` (ya tenía `'NULL'` en INSERT) |
| `registrar-paso-empleado` — rama variable | `'0'` → `'NULL'` en `$id_reposicion_val`; sqlCheck usa `IS NULL` |
| `finalizar-departamento` | `id_reposicion = 0` → `IS NULL` en check; `0` → `NULL` en INSERT |
| `finalizar-impresion` | `0` → `NULL` en INSERT |
| `finalizar-corte` | `id_reposicion = 0` → `IS NULL` en check; `0` → `NULL` en INSERT |
| Corte-Excedente (×2) | `id_reposicion = 0` → `IS NULL` en check; `0` → `NULL` en INSERT |

El patrón del fix para los sqlCheck:
```php
$id_reposicion_cond = ($id_reposicion_val === 'NULL') ? 'id_reposicion IS NULL' : "id_reposicion = $id_reposicion_val";
```

### Commits (backend `ninesys-api`, rama `refactor/modular-routes`)

| Hash | Descripción |
|------|-------------|
| `19b7ba5` | `fix(pagos): corregir FK violation y duplicate check para id_reposicion NULL` |
| `ebc1be5` | `fix(pagos): corregir id_reposicion = 0 en Corte-Excedente (FK violation)` |

Ambos commits fueron desplegados al VPS Hostinger vía `deploy_backend.sh`.

---

## 2. `$ NaN` en subtotal de comisiones — `/reporte-costos-produccion`

### Causa raíz

En `ReporteCostosProduccionLabor.vue`, el slot `#foot(subtotal_variable)` del footer de la tabla de comisiones usaba:

```html
$ {{ (totalVariable - sumaSalariosPagados).toFixed(2) }}
```

`sumaSalariosPagados` nunca fue definida como computed property → `undefined` → `NaN`.

`totalVariable` ya calcula correctamente la suma de `(monto_pago - total_salario_pagado)` por fila, por lo que `sumaSalariosPagados` era redundante.

### Fix

**`components/admin/ReporteCostosProduccionLabor.vue`**

```html
<!-- ANTES -->
$ {{ (totalVariable - sumaSalariosPagados).toFixed(2) }}
<!-- DESPUÉS -->
$ {{ totalVariable.toFixed(2) }}
```

### Commit

| Hash | Descripción |
|------|-------------|
| `7b43dfd` | `fix(reporte-costos): corregir NaN en subtotal de comisiones` |

---

## 3. Sustituir "Ver Detalles" por ícono de reporte en modal "Confirmar Pago"

### Cambio

En `PagosConfirmacionModal.vue`, el footer del modal principal incluía el componente `PagosVendedorResumen` que mostraba un botón "Ver Detalles" abriendo un modal secundario con información menos precisa.

Se reemplazó por `PagosReporteEmpleado` (el mismo ícono 📄 ya visible en la tabla de la planilla), que consulta directamente el endpoint `/pagos/reporte-empleado/{id}` y muestra datos correctos con eficiencia de tiempo.

**`components/admin/PagosConfirmacionModal.vue`**
- Import: `PagosVendedorResumen` → `PagosReporteEmpleado`
- Footer: `<pagos-vendedor-resumen ...>` → `<pagos-reporte-empleado :id-empleado="empleado.id_empleado" :nombre-empleado="empleado.nombre" :pendiente="true" />`

---

## 4. Eficiencia Tareas Completadas inflada con múltiples órdenes asignadas

### Causa raíz

El endpoint `POST /reports/manufacturing-time` devuelve en `resumen` **una fila por producto por orden**. Cuando `id_departamento` está fijado, la condición para `totalProjectedTerminadas` es `AND ptp_sub.id_departamento = $id_departamento` — aplica a TODAS las órdenes del array, incluyendo órdenes nuevas asignadas pero aún no iniciadas por el empleado.

Resultado: al asignar 2 órdenes nuevas con tiempo proyectado de 60s cada una, `totalProjectedTerminadas` pasaba de 60s a 180s mientras `totalRealTerminadas` permanecía en 58s → eficiencia 310% en lugar de ~103%.

El resumen ya incluye el campo `tarea_terminada` (1 si el empleado terminó todos los lotes de esa orden en ese departamento, 0 si no), pero no se usaba al acumular `totalProjectedTerminadas`.

### Fix

**`components/empleados/SseOrdenesAsignadasV4.vue`** (fuente real del `reporteData`)

```javascript
// ANTES
const totalProjectedTerminadas = resumen.reduce((acc, item) => acc + (item.totalProjectedTerminadas || 0), 0);
const totalProjectedEnCurso = resumen.reduce((acc, item) => acc + (item.totalProjectedEnCurso || 0), 0);

// DESPUÉS
const totalProjectedTerminadas = resumen
  .filter(item => item.tarea_terminada == 1)
  .reduce((acc, item) => acc + (item.totalProjectedTerminadas || 0), 0);
const totalProjectedEnCurso = resumen
  .filter(item => item.tarea_terminada != 1)
  .reduce((acc, item) => acc + (item.totalProjectedEnCurso || 0), 0);
```

El mismo fix se aplicó en `components/empleados/DashboardEmpleado.vue` (línea equivalente en `fetchEficienciaChart`).

---

## Commits frontend (rama `refactor/modular-routes`)

| Hash | Descripción |
|------|-------------|
| `7b43dfd` | `fix(reporte-costos): corregir NaN en subtotal de comisiones` |
| *(pendiente)* | `fix(eficiencia/ui): filtrar tarea_terminada en proyectado; sustituir Ver Detalles por PagosReporteEmpleado` |
