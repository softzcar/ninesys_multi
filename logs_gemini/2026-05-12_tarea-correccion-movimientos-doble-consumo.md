# Tarea: Corrección de Movimientos de Inventario — Doble Consumo Tela

**Fecha:** 12 de mayo de 2026
**Estado:** Finalizado

## Solicitud del Usuario
Corregir los movimientos incorrectos de inventario en las órdenes 4392, 4561, 4554 y 4552, generados por el bug de doble consumo de tela (Corte + Estampado).

## Diagnóstico

### Análisis por orden

| Mov | Orden | Dept | Insumo | Delta | Diagnóstico |
|---|---|---|---|---|---|
| 1997 | 4392 | Estampado | dryfit 786 | 68.88 mts | Legítimo |
| **1998** | **4392** | **Corte** | **dryfit 786** | **50.52 mts** | **DUPLICADO — eliminado** |
| 1979 | 4552 | Corte | dryfit 786 | 90.40 mts | id_orden=4552 es paso de Impresión — incorrecto |
| 1980 | 4552 | Corte | golf escocia 712 | 36.82 mts | Igual — paso incorrecto |
| **1979, 1980** | — | — | — | — | **Eliminados** |
| 1983 | 4554 | Corte | dryfit 786 | 84.20 mts | Corte en su propio paso, sin duplicado Estampado — conservado |
| 1986 | 4561 | Estampado | dryfit 786 | 87.92 mts | Legítimo |
| **1987** | **4561** | **Corte** | **dryfit 786** | **90.28 mts** | **DUPLICADO — eliminado** |

### Contexto de 4552/4554
Ambas son pasos de la misma orden de producción (id_orden=2060):
- `4552` = paso Impresión
- `4554` = paso Corte

Los movimientos 1979 y 1980 tenían `departamento='Corte'` pero `id_orden=4552` (paso de Impresión). Eso es anómalo — se eliminaron.

## Correcciones Aplicadas

### Backup
```sql
CREATE TABLE inventario_movimientos_backup_20260512 LIKE inventario_movimientos;
INSERT INTO inventario_movimientos_backup_20260512
SELECT * FROM inventario_movimientos WHERE _id IN (1979, 1980, 1987, 1998);
```

### Eliminaciones
```sql
DELETE FROM inventario_movimientos WHERE _id IN (1979, 1980, 1987, 1998);
-- 4 filas eliminadas
```

Movimiento 1983 (Corte, orden 4554) conservado por decisión del usuario.

## Estado Final del Inventario

Los valores de `inventario.cantidad` no se modificaron (ya habían sido corregidos previamente por el administrador con la rutina existente):
- `insumo 786` (dryfit blanco 1,6m): 12.63 kg = 50.52 mts
- `insumo 712` (golf escocia blanco 1.6m): 11.14 kg = 43.45 mts

## Observaciones
- La tabla `inventario_movimientos_backup_20260512` contiene las 4 filas eliminadas para referencia/reversión si fuera necesario.
- Las correcciones afectan directamente al reporte `/reporte-costos-produccion` — los costos de insumos de estas órdenes ya no mostrarán el doble consumo.
- La causa raíz del bug fue corregida en el mismo día (commit `f53e5e6`) — ver log `2026-05-12_tarea-fix-doble-consumo-tela-corte-estampado.md`.
