# Tarea: Lógica Estricta de Gastos (Fijos vs Variables) en Reporte de Costos

**Fecha:** 6 de mayo de 2026
**Estado:** Finalizado

## Resumen
Se implementó un sistema de costeo operativo híbrido en el reporte de costos de producción para la empresa 163. La solución asegura que los costos fijos (como alquiler y servicios) se reflejen siempre de forma proporcional, mientras que los variables dependen de registros reales.

## Cambios realizados

### 1. Backend (`ninesys-api`)
- **Archivo:** `app/routes/reports.php`
- **Lógica de Gastos Fijos:** Ahora se consultan las plantillas de la tabla `gastos`. El monto mensual se prorratea por los días transcurridos en el rango de fechas (`(Monto Mensual / 30.44) * Días del Periodo`).
- **Lógica de Gastos Variables/Adicionales:** Se mantiene la consulta a `gastos_registros`. Solo se muestran si existe un pago registrado en el periodo.
- **Robustez:** Se corrigió un error 500 por variable no definida (`$costoOperativoPorProducto`) y se eliminaron los logs de depuración inyectados.
- **Despliegue:** Sincronizado con Hostinger (vps-ninesys) y verificado con `curl`.

### 2. Frontend (`app_multi`)
- **Archivo:** `components/admin/ReporteCostosProduccion.vue`
- **Integración:** Se vinculó la respuesta del backend con los switches de la interfaz.
- **Cálculo:** El prorrateo por producto ahora usa los datos mixtos (plantilla + real) enviados por la API.
- **Utilidad Neta:** El resumen final ahora refleja con precisión la rentabilidad estimada restando los gastos operativos seleccionados.

## Verificación
- Los gastos fijos (Alquiler $500, Electricidad $120) aparecen prorrateados aunque no haya registros en `gastos_registros` para abril/mayo.
- Los gastos variables aparecen en cero si no hay registros reales, cumpliendo el requerimiento.
- La tabla actualiza totales y ganancias de forma reactiva al mover los switches.

## Commits Relacionados
- **Backend:** `0c8500e fix(reports): corregir variable no definida y estabilizar respuesta`
- **Backend:** `c51eaf1 feat(reports): fijos siempre por plantilla, variables solo por registro real`
- **Frontend:** Implementación de interfaz dinámica y lógica de conversión de tasas.
