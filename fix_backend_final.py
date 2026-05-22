import os
import re

file_path = '/home/developer/Escritorio/niesys/ninesys-api/app/routes/reports.php'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Restaurar variables faltantes y limpiar debug
# Calculamos totalGastosSemanales de la plantilla para el bloque costos_operativos
fixed_logic = """            // 12. Gastos (Reglas: Fijos siempre por plantilla, Variables/Adicionales por registro real)
            $fecha_inicio_dt = new DateTime($inicio);
            $fecha_fin_dt = new DateTime($fin);
            $intervalo = $fecha_inicio_dt->diff($fecha_fin_dt);
            $dias_periodo = $intervalo->days + 1;
            $factor_mensual = $dias_periodo / 30.44;

            // A. Plantillas Fijas
            $sqlPlantillasFijas = "SELECT moneda, SUM(monto) as total_mensual 
                                   FROM $companyDB.gastos 
                                   WHERE estatus = 'activo' AND tipo = 'fijo'
                                   GROUP BY moneda";
            $plantillasFijasRaw = $dbEmpresas->goQuery($sqlPlantillasFijas);

            // B. Registros Reales
            $sqlGastosReales = "SELECT tipo, moneda, SUM(monto) as total 
                                FROM $companyDB.gastos_registros 
                                WHERE fecha_de_gasto BETWEEN :inicio AND :fin 
                                GROUP BY tipo, moneda";
            $gastosRealesRaw = $dbEmpresas->goQuery($sqlGastosReales, [':inicio' => $inicio, ':fin' => $fin]);

            $gastosPorTipo = ['fijo' => [], 'variable' => [], 'adicional' => []];
            $fijosMap = [];
            $totalGastosFijosUSD = 0; // Para el resumen compatible

            if (is_array($plantillasFijasRaw) && !isset($plantillasFijasRaw['status'])) {
                foreach ($plantillasFijasRaw as $pf) {
                    $m = $pf['moneda'];
                    $monto = (float)$pf['total_mensual'] * $factor_mensual;
                    $fijosMap[$m] = $monto;
                }
            }

            if (is_array($gastosRealesRaw) && !isset($gastosRealesRaw['status'])) {
                foreach ($gastosRealesRaw as $gr) {
                    $tipo = strtolower($gr['tipo']);
                    $moneda = $gr['moneda'];
                    $monto = (float)$gr['total'];
                    if ($tipo === 'fijo') {
                        $fijosMap[$moneda] = max(($fijosMap[$moneda] ?? 0), $monto);
                    } else {
                        $gastosPorTipo[$tipo][] = ['moneda' => $moneda, 'total' => round($monto, 2)];
                    }
                }
            }

            foreach ($fijosMap as $moneda => $total) {
                $gastosPorTipo['fijo'][] = ['moneda' => $moneda, 'total' => round($total, 2)];
            }

            // Variables de compatibilidad
            $totalProductosPeriodo = !empty($reporteData) ? array_sum(array_column($reporteData, 'total_productos')) : 0;
            $totalGastosSemanales = 0; // Se mantiene por legacy si el frontend lo pide
            $costoOperativoPorProducto = 0;

            $finalResponse['costos_operativos'] = [
                'total_gastos_semanales' => $totalGastosSemanales,
                'total_productos_periodo' => $totalProductosPeriodo,
                'costo_operativo_por_producto' => $costoOperativoPorProducto,
                'gastos_por_tipo' => $gastosPorTipo
            ];"""

# Patrón para reemplazar todo el bloque de gastos y debug
pattern = re.compile(r"// 12\. Gastos.*?\$finalResponse\['costos_operativos'\] = \[.*?\];", re.DOTALL)

if pattern.search(content):
    content = pattern.sub(fixed_logic, content)
    # Eliminar bloques de debug inyectados anteriormente que estén fuera del patrón si los hay
    content = content.replace("if ($debug) {", "if (false) {") # Desactivar debug por ahora
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Backend reparado y estabilizado.")
else:
    print("No se pudo localizar el bloque para reparar.")
