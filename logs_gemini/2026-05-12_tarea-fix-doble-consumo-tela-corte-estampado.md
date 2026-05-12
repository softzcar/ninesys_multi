# Tarea: Fix Doble Consumo de Tela — Corte + Estampado

**Fecha:** 12 de mayo de 2026
**Estado:** Finalizado

## Solicitud del Usuario
Al procesar la orden 4392, el modal de detalle de insumos mostraba DOS filas de consumo para "dryfit blanco 1,6m": una del departamento Estampado (68.88 mts) y otra de Corte (50.52 mts). El usuario pidió verificar que Corte no estuviera enviando consumo de tela cuando el insumo no le fue asignado a ese departamento.

## Diagnóstico

### Consulta a MariaDB (vps-ninesys, api_emp_163)

```
_id   id_orden  id_insumo  insumo              departamento  valor_inicial  valor_final  delta_kg  delta_mts
1997  4392      786        dryfit blanco 1,6m  Estampado     22.58          39.80        17.22     68.88
1998  4392      786        dryfit blanco 1,6m  Corte         12.63          0.00         12.63     50.52
```

El movimiento 1998 de Corte consumió los 12.63 kg restantes del rollo, llevando el inventario a 0. Este patrón se repitió en otras órdenes: 4561, 4554, 4552.

### Causa raíz en el código

`cargarConsumosPrevios()` en `SseOrdenesAsignadasModalExtra.vue` se ejecuta al abrir el modal de Corte. Busca en el historial de la orden movimientos de Estampado con `tipo_insumo = 'tela'` y los agrega a `this.form` como items con `precargado: true` e `input: 0` — pensados como referencia visual para que Corte conozca qué tela usó Estampado.

El bug: tanto `terminarTodo()` como `handleBatchTerminarConfirm()` iteraban **todos** los items de `this.form` sin distinguir entre items propios de Corte e items precargados. El item precargado con `input: 0` se enviaba a `postInventarioMovimientos`, generando un movimiento real de inventario (delta = stock actual → 0).

## Cambios Realizados

**Archivo:** `components/empleados/SseOrdenesAsignadasModalExtra.vue`

### 1. `terminarTodo()` — línea ~1915
```javascript
this.form.forEach((el) => {
  // Items precargados de Estampado son solo referencia — ya registraron su consumo
  if (el.precargado) return;
  // ...postInventarioMovimientos(...)
});
```

### 2. `handleBatchTerminarConfirm()` — línea ~1303
```javascript
for (let i = 0; i < this.form.length; i++) {
  const formItem = this.form[i];
  // Items precargados de Estampado son solo referencia — ya registraron su consumo
  if (formItem.precargado) continue;
  // ...
}
```

## Comportamiento corregido

- Corte abre el modal: los insumos de Estampado aparecen como referencia visual (readonly, con etiqueta "Precargado").
- Corte termina la orden: solo se envían a la API los items que Corte ingresó manualmente (los no precargados).
- El inventario del rollo de tela ya no se lleva a 0 por Corte al terminar.

## Commit
- `f53e5e6` — `fix(corte): prevenir doble consumo de tela en órdenes con Estampado previo`
- Branch: `refactor/modular-routes`
- Push: `origin refactor/modular-routes`

## Observaciones
- Los movimientos históricos incorrectos (órdenes 4392, 4561, 4554, 4552) deberán ser corregidos manualmente por el administrador con la rutina de corrección de inventario existente.
- `cargarConsumosPrevios()` no se modifica — su propósito de mostrar referencia es correcto. Solo se bloquea que esos items se envíen como consumo real.
