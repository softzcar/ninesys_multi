import os

file_path = '/home/developer/Escritorio/niesys/ninesys-api/app/routes/reports.php'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Buscamos el bloque de gastos para inyectar la lógica de plantillas
old_block = """            // 12. Gastos Reales por Tipo y Moneda (Basado en registros)
            $sqlGastosReales = "SELECT tipo, moneda, SUM(monto) as total 
                                FROM $companyDB.gastos_registros 
                                WHERE fecha_de_gasto BETWEEN :inicio AND :fin 
                                GROUP BY tipo, moneda";"""

new_block = """            // 12. Gastos (Combinación de Registros Reales + Proporción de Plantillas)
            
            // A. Registros Reales en el periodo
            $sqlGastosReales = "SELECT tipo, moneda, SUM(monto) as total 
                                FROM $companyDB.gastos_registros 
                                WHERE fecha_de_gasto BETWEEN :inicio AND :fin 
                                GROUP BY tipo, moneda";
            $gastosRealesRaw = $dbEmpresas->goQuery($sqlGastosReales, [':inicio' => $inicio, ':fin' => $fin]);

            // B. Plantillas Proporcionales (Para asegurar que siempre haya datos si están configurados)
            // Calculamos cuántas semanas/días representa el periodo para prorratear la plantilla mensual
            $fecha_inicio_dt = new DateTime($inicio);
            $fecha_fin_dt = new DateTime($fin);
            $intervalo = $fecha_inicio_dt->diff($fecha_fin_dt);
            $dias_periodo = $intervalo->days + 1;
            $factor_mensual = $dias_periodo / 30.44; // Promedio de días al mes

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

            // Combinar ambos: Priorizamos reales, pero si reales es cero para un tipo, usamos plantilla
            $tempGastos = []; // Para acumular por tipo/moneda

            // Procesar Reales
            if (is_array($gastosRealesRaw) && !isset($gastosRealesRaw['status'])) {
                foreach ($gastosRealesRaw as $gr) {
                    $t = strtolower($gr['tipo']);
                    $m = $gr['moneda'];
                    $tempGastos[$t][$m] = ($tempGastos[$t][$m] ?? 0) + (float)$gr['total'];
                }
            }

            // Procesar Plantillas (Solo si no hay reales para ese tipo/moneda en este periodo, 
            // o podrías querer sumarlos, pero usualmente si no hay reales usamos la estimación)
            if (is_array($plantillasRaw) && !isset($plantillasRaw['status'])) {
                foreach ($plantillasRaw as $pr) {
                    $t = strtolower($pr['tipo']);
                    $m = $pr['moneda'];
                    $monto_estimado = (float)$pr['total_mensual'] * $factor_mensual;
                    
                    // Si no hubo registros reales de este tipo en el periodo, usamos la plantilla
                    if (!isset($tempGastos[$t][$m]) || $tempGastos[$t][$m] == 0) {
                        $tempGastos[$t][$m] = $monto_estimado;
                    }
                }
            }

            // Convertir a formato de respuesta
            foreach ($tempGastos as $tipo => $monedas) {
                foreach ($monedas as $moneda => $total) {
                    $gastosPorTipo[$tipo][] = ['moneda' => $moneda, 'total' => $total];
                }
            }"""

if old_block in content:
    # También removemos el bloque duplicado que procesaba gastosRealesRaw antes
    content = content.replace(old_block, new_block)
    # Limpiamos el procesamiento viejo que quedó abajo
    content = content.replace("""            if (is_array($gastosRealesRaw) && !isset($gastosRealesRaw['status'])) {
                foreach ($gastosRealesRaw as $gr) {
                    $tipo = strtolower($gr['tipo']);
                    if (isset($gastosPorTipo[$tipo])) {
                        $gastosPorTipo[$tipo][] = [
                            'moneda' => $gr['moneda'],
                            'total' => (float)$gr['total']
                        ];
                    }
                }
            }""", "")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Backend actualizado con lógica de plantillas.")
else:
    print("No se encontró el bloque base.")
