# Tarea: Barra de Eficiencia de Tiempo en Reporte de Pago de Empleado

**Fecha:** 13 de mayo de 2026
**Estado:** Finalizado

## Solicitud del Usuario

En `/empleados/planilla-de-pagos`, la columna "Reporte" muestra un botón que abre el modal `Reporte de Pago — [nombre_empleado]`. Se solicitó agregar en la parte superior del modal una barra de eficiencia de tiempo del empleado, calculada sobre las órdenes que aparecen en la tabla del reporte.

## Criterio de Eficiencia Utilizado

Mismo criterio que el dashboard de empleados (módulo de empleados):

- **Tiempo Real:** calculado con `calcularTiempoTrabajoIndividual` del mixin `mixin-time.js`. Cuenta únicamente segundos dentro del horario laboral configurado por empresa (ej: Lun-Vie 8:30-12:00 y 13:00-17:30), excluyendo almuerzo, fines de semana y fuera de horario.
- **Tiempo Estimado:** `SUM(ptp.tiempo × cantidad)` de `products_tiempos_de_produccion` para las tareas terminadas de esas órdenes.
- **Fórmula:** `(estimado / real) × 100`. Eficiencia > 100% = trabajó más rápido que la meta (bien); < 100% = más lento (mal).
- **Alcance:** las órdenes del período del reporte (`data.pagos[].id_orden`), sin filtro de departamento (el reporte puede cubrir múltiples departamentos del mismo empleado).

## Cambios Realizados

**Archivo:** `components/admin/PagosReporteEmpleado.vue`

### 1. Importación del mixin de tiempo

```javascript
import mixinTime from '~/mixins/mixin-time.js'

export default {
  mixins: [mixinTime],
  // ...
}
```

### 2. Nuevos campos en `data()`

```javascript
eficienciaData: null,       // { tiempo_real, tiempo_estimado } — null si no aplica
cargandoEficiencia: false,
```

### 3. `fetchEficiencia()` — nuevo método

Extrae `id_orden` únicos de `data.pagos`, hace `POST /reports/manufacturing-time` con esos IDs y `id_empleado`, procesa `tareas_detalles` con `calcularTiempoTrabajoIndividual` usando el horario laboral del store, y asigna `eficienciaData` solo si hay tiempos válidos.

```javascript
async fetchEficiencia() {
  const uniqueIds = [...new Set(
    this.data.pagos.map(p => p.id_orden).filter(Boolean).map(Number)
  )]
  // POST /reports/manufacturing-time → tareas_detalles → calcularTiempoTrabajoIndividual
  // Asigna: this.eficienciaData = { tiempo_real, tiempo_estimado }
}
```

### 4. Llamada desde `abrirReporte()`

Se llama `this.fetchEficiencia()` al final de `abrirReporte()` (después de cargar `this.data`), de forma no bloqueante. El modal muestra primero el reporte y luego aparece la eficiencia cuando termina de calcular.

### 5. Template — sección en la parte superior del modal

```html
<div v-if="cargandoEficiencia" class="text-center py-2 mb-3">
  <b-spinner small /> <small>Calculando eficiencia de tiempo...</small>
</div>
<div v-else-if="eficienciaData" class="mb-3 p-2 border rounded bg-light">
  <h6 class="text-center mb-0">Eficiencia de Tiempo — Período del Reporte</h6>
  <charts-EfficiencyChart
    :realTime="eficienciaData.tiempo_real"
    :estimatedTime="eficienciaData.tiempo_estimado"
  />
</div>
```

## Comportamiento

- **Empleados de producción:** la barra aparece mostrando el porcentaje de eficiencia con color semántico (verde ≥ 100%, azul ≥ 80%, amarillo ≥ 60%, rojo < 60%).
- **Vendedores / diseñadores sin tareas de producción:** `eficienciaData` queda `null` y la sección no aparece. No hay errores ni placeholders vacíos.
- **Empleados con múltiples departamentos:** la eficiencia agrega todos los departamentos del período (no se filtra por departamento, a diferencia del dashboard donde sí se filtra por el departamento activo).

## Commit

- `dd9a618` — `feat(planilla-pagos): agregar barra de eficiencia de tiempo en reporte de pago de empleado`
- Branch: `refactor/modular-routes`
