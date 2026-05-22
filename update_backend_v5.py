import os

file_path = '/home/developer/Escritorio/niesys/ninesys-api/app/routes/reports.php'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Lógica robusta: 
# 1. Sumar reales del periodo.
# 2. Si un tipo está en cero en reales, usar plantilla proporcional.
new_block_logic = """            // 12. Gastos (Combinación de Registros Reales + Proporción de Plantillas)
            
            // A. Registros Reales estrictamente en el periodo
            $sqlGastosReales = "SELECT tipo, moneda, SUM(monto) as total 
                                FROM $companyDB.gastos_registros 
                                WHERE fecha_de_gasto BETWEEN :inicio AND :fin 
                                GROUP BY tipo, moneda";
            $gastosRealesRaw = $dbEmpresas->goQuery($sqlGastosReales, [':inicio' => $inicio, ':fin' => $fin]);

            // B. Plantillas Proporcionales (Basado en la tabla 'gastos')
            $fecha_inicio_dt = new DateTime($inicio);
            $fecha_fin_dt = new DateTime($fin);
            $intervalo = $fecha_inicio_dt->diff($fecha_fin_dt);
            $dias_periodo = $intervalo->days + 1;
            $factor_mensual = $dias_periodo / 30.44;

            $sqlPlantillas = "SELECT tipo, moneda, SUM(monto) as total_mensual 
                              FROM $companyDB.gastos 
                              WHERE estatus = 'activo' 
                              GROUP BY tipo, moneda";
            $plantillasRaw = $dbEmpresas->goQuery($sqlPlantillas);

            $gastosPorTipo = [
                'fijo' => [],
                'variable' => [],
                'adicional' => []
            ];

            // Mapa para acumular resultados finales
            $finalGastosMap = [];

            // 1. Inicializar mapa con plantillas (lo que DEBERÍA gastarse)
            if (is_array($plantillasRaw) && !isset($plantillasRaw['status'])) {
                foreach ($plantillasRaw as $pr) {
                    $t = strtolower($pr['tipo']);
                    $m = $pr['moneda'];
                    $monto_proporcional = (float)$pr['total_mensual'] * $factor_mensual;
                    if ($monto_proporcional > 0) {
                        $finalGastosMap[$t][$m] = $monto_proporcional;
                    }
                }
            }

            // 2. Sobreescribir con registros reales si existen en el periodo
            if (is_array($gastosRealesRaw) && !isset($gastosRealesRaw['status'])) {
                foreach ($gastosRealesRaw as $gr) {
                    $t = strtolower($gr['tipo']);
                    $m = $gr['moneda'];
                    $monto_real = (float)$gr['total'];
                    if ($monto_real > 0) {
                        // Si hay gasto real, reemplazamos la estimación de la plantilla para ese tipo/moneda
                        $finalGastosMap[$t][$m] = $monto_real;
                    }
                }
            }

            // 3. Convertir mapa a formato de respuesta esperado por el frontend
            foreach ($finalGastosMap as $tipo => $monedas) {
                if (isset($gastosPorTipo[$tipo])) {
                    foreach ($monedas as $moneda => $total) {
                        $gastosPorTipo[$tipo][] = [
                            'moneda' => $moneda,
                            'total' => round($total, 2)
                        ];
                    }
                }
            }"""

# Identificar el bloque a reemplazar (desde el comentario 12 hasta antes del finalResponse)
import re
pattern = re.compile(r"// 12\. Gastos.*?\n\s+\$finalResponse\['costos_operativos'\] =", re.DOTALL)

if pattern.search(content):
    content = pattern.sub(new_block_logic + "\n\n            $finalResponse['costos_operativos'] =", content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Backend refinado con éxito (Lógica V5).")
else:
    print("No se pudo identificar el bloque exacto para reemplazo dinámico.")
