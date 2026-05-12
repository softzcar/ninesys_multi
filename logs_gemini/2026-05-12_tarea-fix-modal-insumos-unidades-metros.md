# Tarea: Fix Modal Detalle de Insumos — Normalización a Metros

**Fecha:** 12 de mayo de 2026
**Estado:** Finalizado

## Solicitud del Usuario
En la página `/reporte-costos-produccion`, la columna "Costo" del modal de detalle de insumos de la orden 4563 mostraba valores inflados ($115.64 cuando debería ser ~$1.31). Se pidió investigar si el origen era error humano de registro, confusión de unidades Kg/Mts, o una fórmula incorrecta en frontend o backend. Adicionalmente, el usuario señaló que la columna "Costo" debería mostrar el costo por metro y que todas las columnas de cantidad deben estandarizarse a metros.

## Diagnóstico

### Error humano confirmado (datos en BD)
Los valores inflados en la orden 4563 (costos_de_insumos = $166.35 para 2 camisetas) son consecuencia de un error de registro: el empleado ingresó `9.41` (peso del rollo restante en Kg) en lugar de `~0.59` (consumo real). La fórmula `delta_kg × precio_por_kg` en el backend es **correcta**. El administrador corrige estos datos con la rutina existente.

### Problema de visualización en el modal
La columna `costo` del endpoint `/reporte/insumos-cosumidos-por-orden` retornaba `inv.costo` = costo total del lote completo (ej. $115.64 por el rollo), no el costo por metro ($1.3141/mts). Además, `cantidad_utilizada` estaba en Kg para telas mientras que el papel ya estaba en metros, generando inconsistencia de unidades entre filas.

## Cambios Realizados

### 1. Backend (`ninesys-api`)
- **Archivo:** `app/routes/inventory.php`
- **Endpoint:** `GET /reporte/insumos-cosumidos-por-orden`
- **Cambios en la query SQL:**
  - `costo` → `ROUND((costo / cantidad_inicial) / rendimiento, 4)` — ahora es costo por metro
  - `cantidad_utilizada` → `ROUND(ABS(delta) * rendimiento, 2)` — siempre en metros
  - `cantidad_restante` → `ROUND(inv.cantidad * rendimiento, 2)` — siempre en metros
  - `unidad` → literal `"Mts"` en lugar del valor variable del inventario
  - `total_insumo` — sin cambios, la fórmula monetaria era correcta
- **Despliegue:** Sincronizado con Hostinger (vps-ninesys) mediante `deploy_backend.sh`. Commit backend: `d79d311`.

### 2. Frontend (`app_multi`)
- **Archivo:** `components/admin/ReporteCostosDeProduccionInsumos.vue`
- **Cambios:**
  - Labels de columnas actualizados: `"Costo"` → `"Costo/mts"`, `"Utilizado"` → `"Consumido (mts)"`, `"Restante"` → `"Restante (mts)"`, `"Total Insumo"` → `"Total ($)"`
  - Cell template de `costo`: ahora muestra 4 decimales con sufijo `/mts` (ej. `$ 1.3141/mts`)
  - Cell templates de `cantidad_utilizada` y `cantidad_restante`: unidad fija `mts` (el backend ya no envía unidad variable)

## Verificación

Resultado del endpoint en producción tras el deploy para orden 4563:

| Insumo | costo | consumido | restante | total ($) |
|---|---|---|---|---|
| dryfit blanco 1,6m | $1.3141/mts | 37.64 mts | 39.04 mts | $49.46 |
| dryfit blanco 1,6m | $1.3141/mts | 40.04 mts | 39.04 mts | $52.62 |
| Papel sublimacion 80gsm | $0.4000/mts | 160.69 mts | 160.69 mts | $64.28 |

Los `total_insumo` no cambiaron — la fórmula monetaria era correcta desde antes.

## Observaciones
- El problema de datos (error humano de registro) y el problema de visualización (unidades) son independientes. El primero lo resuelve el admin con su rutina; el segundo quedó corregido en este fix.
- Para insumos con `rendimiento = 1` (ej. papel ya en metros), la transformación es transparente — los valores no cambian.
- La normalización a metros aplica a todos los insumos del sistema, no solo tela.
