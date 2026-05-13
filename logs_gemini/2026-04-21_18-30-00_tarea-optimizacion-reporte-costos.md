# Log de Tarea: Optimización y Consistencia del Reporte de Costos de Producción

**Fecha:** 2026-04-21 18:30:00

## Solicitud del Usuario
Auditar y corregir las discrepancias en el Reporte de Costos de Producción, específicamente en la columna de Mano de Obra, asegurando que se incluyan comisiones y salarios fijos de forma consistente entre la tabla principal y el modal de detalle.

## Archivos Involucrados
- `components/inventario/InsumoNuevo.vue`
- `components/admin/ReporteCostosProduccion.vue`
- `components/admin/ReporteCostosProduccionLabor.vue`
- `mixins/mixin-time.js`
- `ninesys-api/app/routes/reports.php`
- `corregir_cantidad_inicial.sql` (Nuevo)

## Acción Realizada
1. **Fix Insumos:** Se modificó `InsumoNuevo.vue` para enviar `cantidad_inicial` al crear insumos, evitando la división por cero que inflaba costos.
2. **Sincronización de Mano de Obra:**
   - Se implementó un evento `updated-cost` del hijo al padre para actualizar el total del footer reactivamente.
   - Se unificó la lógica en el padre para priorizar los pagos brutos de la API sobre los cálculos teóricos del mixin.
   - Se incluyeron los salarios fijos de empleados sin logs de tiempo (ej. Vendedores) rescatando el dato de la tabla de pagos.
3. **Backend:** Se actualizó la consulta Batch en `reports.php` para devolver el monto bruto de pagos y se desplegó en Hostinger.
4. **Auditoría Orden 4287:** Se corrigió una duplicidad visual en el modal donde los salarios se sumaban al total pero no se restaban del subtotal variable.

## Herramientas Utilizadas
- `replace`, `write_file`, `run_shell_command`, `deploy_backend.sh`

## Resultado
Éxito

## Verificación
- Verificación visual mediante capturas del usuario: el enlace ahora muestra $ 2.11 (Comisiones + Salarios) y el total del footer coincide con la sumatoria de las filas filtradas.

## Observaciones de Gemini
Se detectó que la tabla `inventario_movimientos` tiene inconsistencias históricas (inicial < actual), por lo que se pausó el script SQL de corrección masiva.
