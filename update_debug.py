import os

file_path = '/home/developer/Escritorio/niesys/ninesys-api/app/routes/reports.php'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Buscamos donde inyectar el debug en la respuesta final
old_line = "            $response->getBody()->write(json_encode($finalResponse, JSON_NUMERIC_CHECK | JSON_UNESCAPED_UNICODE));"
new_line = """            if ($debug) {
                $finalResponse['debug_gastos'] = [
                    'sql' => $sqlGastosReales,
                    'params' => [':inicio' => $inicio, ':fin' => $fin],
                    'raw_results' => $gastosRealesRaw,
                    'company_db' => $companyDB
                ];
            }
            $response->getBody()->write(json_encode($finalResponse, JSON_NUMERIC_CHECK | JSON_UNESCAPED_UNICODE));"""

if old_line in content:
    new_content = content.replace(old_line, new_line)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Debug inyectado con éxito.")
else:
    print("No se encontró la línea para inyectar debug.")
