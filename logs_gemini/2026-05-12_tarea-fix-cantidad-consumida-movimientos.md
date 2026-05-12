# Tarea: Fix Columna "Consumido (mts)" en Modal de Detalle de Insumos

**Fecha:** 12 de mayo de 2026
**Estado:** Finalizado

## Solicitud del Usuario
En el modal "Detalle de Insumos" del reporte de costos, la columna "Consumido (mts)" mostraba la cantidad restante del material en lugar del consumo real. Prueba controlada con orden 4558 (1 metro de papel + 1 metro de tela): el modal mostraba 299 mts y 83.64 mts respectivamente.

## Diagnóstico

### Causa raíz — backend `inventory.php` línea 1355

Los tres bloques de cálculo (tela, Corte-no-tela, else/Impresión) calculan correctamente:
```php
$cantidad_consumida = stock_inicial - consumo_kg  // e.g. 21.91 - 0.25 = 21.66
```

Luego, el bloque de "rendimiento" (eficiencia) sobrescribía esta variable:
```php
// línea 1355 — BUG
$cantidad_consumida = floatval($miInsumo['cantidad_consumida']); // = 1.0 metros
```

Esto causaba que el INSERT a `inventario_movimientos` guardara:
```
valor_inicial = 21.91  (correcto)
valor_final   = 1.00   (debería ser 21.66)
```

El reporte calcula `ABS(valor_inicial - valor_final) * rendimiento`:
- `ABS(21.91 - 1.00) * 4 = 83.64 mts` ❌ (debería ser `ABS(21.91 - 21.66) * 4 = 1.00 mts`)

### Impacto
Afectaba todos los tipos de insumo (tela, papel, otros) y todos los departamentos (Estampado, Impresión, Corte).

## Corrección

### Backend — `ninesys-api/app/routes/inventory.php`
```php
// ANTES (línea 1355):
$cantidad_consumida = isset($miInsumo['cantidad_consumida']) && ... ? floatval(...) : 0;

// DESPUÉS:
$cantidad_input_rendimiento = isset($miInsumo['cantidad_consumida']) && ... ? floatval(...) : 0;
// Referencias en líneas 1359, 1368, 1371 también actualizadas
```

Commit backend: `01b6aec`

### BD — Corrección movimientos de la orden de prueba 4558
```sql
UPDATE inventario_movimientos SET valor_final = 299.00 WHERE _id = 1999;  -- Papel
UPDATE inventario_movimientos SET valor_final = 21.66  WHERE _id = 2000;  -- Tela
```

## Verificación

Endpoint `/reporte/insumos-cosumidos-por-orden/4558` tras el deploy:

| Insumo | Consumido | Total ($) |
|---|---|---|
| dryfit blanco 1,6m | **1.00 mts** | $1.32 |
| Papel sublimacion 80gsm | **1.00 mts** | $0.40 |

## Observaciones
- La tabla `rendimiento` sigue recibiendo el valor en metros del input (`$cantidad_input_rendimiento`), correcto para el cálculo de eficiencia.
- Los movimientos históricos con valores inflados por este bug (previos al fix) siguen en la BD. Solo los de las órdenes 4392 y 4561 fueron corregidos en la sesión anterior.
