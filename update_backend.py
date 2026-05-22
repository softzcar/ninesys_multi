import os

file_path = '/home/developer/Escritorio/niesys/ninesys-api/app/routes/reports.php'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """            // 12. Gastos Fijos (Siempre se incluyen para evitar errores en el Frontend)
            $sqlGastos = "SELECT SUM(CASE periodicidad WHEN 'mensual' THEN monto / 4.33 WHEN 'trimestral' THEN monto / 13 WHEN 'semestral' THEN monto / 26 WHEN 'anual' THEN monto / 52 ELSE 0 END) AS total_gastos_semanales FROM $companyDB.empresas_gastos WHERE id_empresa = $id_empresa AND estatus = 'activo'";
            $gastosResult = $dbEmpresas->goQuery($sqlGastos);
            $totalGastosSemanales = (!empty($gastosResult) && isset($gastosResult[0]['total_gastos_semanales'])) ? (float)$gastosResult[0]['total_gastos_semanales'] : 0;

            $totalProductosPeriodo = !empty($reporteData) ? array_sum(array_column($reporteData, 'total_productos')) : 0;
            $costoOperativoPorProducto = $totalProductosPeriodo > 0 ? ($totalGastosSemanales / $totalProductosPeriodo) : 0;

            $finalResponse['costos_operativos'] = [
                'total_gastos_semanales' => $totalGastosSemanales,
                'total_productos_periodo' => $totalProductosPeriodo,
                'costo_operativo_por_producto' => $costoOperativoPorProducto
            ];"""

new_block = """            // 12. Gastos Reales por Tipo y Moneda (Basado en registros)
            $sqlGastosReales = "SELECT tipo, moneda, SUM(monto) as total 
                                FROM $companyDB.gastos_registros 
                                WHERE fecha_de_gasto BETWEEN :inicio AND :fin 
                                GROUP BY tipo, moneda";
            $gastosRealesRaw = $dbEmpresas->goQuery($sqlGastosReales, [':inicio' => $inicio, ':fin' => $fin]);
            
            $gastosPorTipo = [
                'fijo' => [],
                'variable' => [],
                'adicional' => []
            ];
            
            if (is_array($gastosRealesRaw) && !isset($gastosRealesRaw['status'])) {
                foreach ($gastosRealesRaw as $gr) {
                    $tipo = strtolower($gr['tipo']);
                    if (isset($gastosPorTipo[$tipo])) {
                        $gastosPorTipo[$tipo][] = [
                            'moneda' => $gr['moneda'],
                            'total' => (float)$gr['total']
                        ];
                    }
                }
            }

            // Gastos Fijos (Plantilla - Mantener por compatibilidad si es necesario)
            $sqlGastos = "SELECT SUM(CASE periodicidad WHEN 'mensual' THEN monto / 4.33 WHEN 'trimestral' THEN monto / 13 WHEN 'semestral' THEN monto / 26 WHEN 'anual' THEN monto / 52 ELSE 0 END) AS total_gastos_semanales FROM $companyDB.empresas_gastos WHERE id_empresa = $id_empresa AND estatus = 'activo'";
            $gastosResult = $dbEmpresas->goQuery($sqlGastos);
            $totalGastosSemanales = (!empty($gastosResult) && isset($gastosResult[0]['total_gastos_semanales'])) ? (float)$gastosResult[0]['total_gastos_semanales'] : 0;

            $totalProductosPeriodo = !empty($reporteData) ? array_sum(array_column($reporteData, 'total_productos')) : 0;
            $costoOperativoPorProducto = $totalProductosPeriodo > 0 ? ($totalGastosSemanales / $totalProductosPeriodo) : 0;

            $finalResponse['costos_operativos'] = [
                'total_gastos_semanales' => $totalGastosSemanales,
                'total_productos_periodo' => $totalProductosPeriodo,
                'costo_operativo_por_producto' => $costoOperativoPorProducto,
                'gastos_por_tipo' => $gastosPorTipo
            ];"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Backend actualizado con éxito.")
else:
    print("No se encontró el bloque de código original.")
