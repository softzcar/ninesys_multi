import os

file_path = '/home/developer/Escritorio/niesys/ninesys-api/app/routes/reports.php'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Cambiar el sample para que busque registros desde abril
old_block = """            if ($debug) {
                $sample = $dbEmpresas->goQuery("SELECT * FROM $companyDB.gastos_registros ORDER BY _id DESC LIMIT 10");
                $finalResponse['debug_gastos'] = [
                    'sql' => $sqlGastosReales,
                    'params' => [':inicio' => $inicio, ':fin' => $fin],
                    'raw_results' => $gastosRealesRaw,
                    'sample_data' => $sample,
                    'company_db' => $companyDB
                ];
            }"""

new_block = """            if ($debug) {
                $count_total = $dbEmpresas->goQuery("SELECT COUNT(*) as total FROM $companyDB.gastos_registros");
                $count_period = $dbEmpresas->goQuery("SELECT COUNT(*) as total FROM $companyDB.gastos_registros WHERE fecha_de_gasto >= '2026-04-01'");
                $sample_gastos = $dbEmpresas->goQuery("SELECT * FROM $companyDB.gastos");
                $finalResponse['debug_gastos'] = [
                    'sql' => $sqlGastosReales,
                    'params' => [':inicio' => $inicio, ':fin' => $fin],
                    'raw_results' => $gastosRealesRaw,
                    'registros_desde_abril' => $count_period[0]['total'] ?? 0,
                    'registros_totales' => $count_total[0]['total'] ?? 0,
                    'plantillas_gastos' => $sample_gastos,
                    'company_db' => $companyDB
                ];
            }"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Debug V3 inyectado.")
else:
    print("No se encontró el bloque anterior.")
