import os
import re

file_path = '/home/developer/Escritorio/niesys/ninesys-api/app/routes/reports.php'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_block_logic = """            // 12. Gastos (Reglas: Fijos siempre por plantilla, Variables/Adicionales por registro real)
            
            // A. Registros Reales en el periodo
            $sqlGastosReales = "SELECT tipo, moneda, SUM(monto) as total 
                                FROM $companyDB.gastos_registros 
                                WHERE fecha_de_gasto BETWEEN :inicio AND :fin 
                                GROUP BY tipo, moneda";
            $gastosRealesRaw = $dbEmpresas->goQuery($sqlGastosReales, [':inicio' => $inicio, ':fin' => $fin]);

            // B. Plantillas Proporcionales (Solo para GASTOS FIJOS)
            $fecha_inicio_dt = new DateTime($inicio);
            $fecha_fin_dt = new DateTime($fin);
            $intervalo = $fecha_inicio_dt->diff($fecha_fin_dt);
            $dias_periodo = $intervalo->days + 1;
            $factor_mensual = $dias_periodo / 30.44;

            $sqlPlantillasFijas = "SELECT moneda, SUM(monto) as total_mensual 
                                   FROM $companyDB.gastos 
                                   WHERE estatus = 'activo' AND tipo = 'fijo'
                                   GROUP BY moneda";
            $plantillasFijasRaw = $dbEmpresas->goQuery($sqlPlantillasFijas);

            $gastosPorTipo = [
                'fijo' => [],
                'variable' => [],
                'adicional' => []
            ];

            // 1. Procesar Gastos FIJOS (Priorizamos plantilla prorrateada como base mínima)
            $fijosMap = [];
            if (is_array($plantillasFijasRaw) && !isset($plantillasFijasRaw['status'])) {
                foreach ($plantillasFijasRaw as $pf) {
                    $m = $pf['moneda'];
                    $fijosMap[$m] = (float)$pf['total_mensual'] * $factor_mensual;
                }
            }
            
            // 2. Procesar Registros Reales
            if (is_array($gastosRealesRaw) && !isset($gastosRealesRaw['status'])) {
                foreach ($gastosRealesRaw as $gr) {
                    $tipo = strtolower($gr['tipo']);
                    $moneda = $gr['moneda'];
                    $monto = (float)$gr['total'];
                    
                    if ($tipo === 'fijo') {
                        // Si registraron un gasto fijo real, lo usamos si es mayor que la plantilla o lo sumamos.
                        // Según requerimiento "podemos tomar ese monto siempre", se asume la plantilla es la base.
                        // Usaremos el mayor entre el registro real y la plantilla para no duplicar ni omitir.
                        $fijosMap[$moneda] = max(($fijosMap[$moneda] ?? 0), $monto);
                    } else {
                        // Variables y Adicionales: SOLO si hay registro real
                        $gastosPorTipo[$tipo][] = ['moneda' => $moneda, 'total' => round($monto, 2)];
                    }
                }
            }

            // 3. Añadir los fijos finales al resultado
            foreach ($fijosMap as $moneda => $total) {
                $gastosPorTipo['fijo'][] = ['moneda' => $moneda, 'total' => round($total, 2)];
            }"""

pattern = re.compile(r"// 12\. Gastos.*?\n\s+\$finalResponse\['costos_operativos'\] =", re.DOTALL)

if pattern.search(content):
    content = pattern.sub(new_block_logic + "\n\n            $finalResponse['costos_operativos'] =", content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Backend actualizado con lógica estricta (V6).")
else:
    print("Error: No se pudo localizar el bloque de gastos.")
