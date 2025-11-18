<?php

function splitSqlStatements($sql)
{
    $statements = [];
    $lines = explode("\n", $sql);
    $currentStatement = '';
    $inDelimiterBlock = false;
    $delimiter = ';';

    foreach ($lines as $line) {
        $line = trim($line);

        // Saltar líneas vacías
        if (empty($line)) continue;

        // Manejar cambios de delimitador
        if (preg_match('/^DELIMITER\s+(\S+)$/i', $line, $matches)) {
            $delimiter = $matches[1];
            continue;
        }

        $currentStatement .= $line . "\n";

        // Si estamos en un bloque delimitado y encontramos el delimitador
        if ($inDelimiterBlock && strpos($line, $delimiter) !== false && substr($line, -strlen($delimiter)) === $delimiter) {
            // Remover el delimitador del final antes de guardar
            $cleanStatement = trim(substr($currentStatement, 0, -strlen($delimiter)));
            $statements[] = trim($cleanStatement);
            $currentStatement = '';
            $inDelimiterBlock = false;
            $delimiter = ';'; // Reset to default
            continue;
        }

        // Detectar inicio de bloque (CREATE TRIGGER, CREATE PROCEDURE, CREATE FUNCTION)
        if (!$inDelimiterBlock && preg_match('/^(CREATE\s+(TRIGGER|PROCEDURE|FUNCTION))/i', $line)) {
            $inDelimiterBlock = true;
        }

        // Para statements normales terminados con ;
        if (!$inDelimiterBlock && strpos($line, ';') !== false && substr($line, -1) === ';') {
            $currentStatement = trim(substr($currentStatement, 0, -1));
            if (!empty($currentStatement) && !preg_match('/^(\s*--|\s*\/\*|\s*#)/', $currentStatement)) {
                $statements[] = $currentStatement . ';';
            }
            $currentStatement = '';
        }
    }

    // Agregar cualquier statement restante
    if (!empty(trim($currentStatement))) {
        $statements[] = trim($currentStatement);
    }

    return $statements;
}

// Leer el archivo SQL
$sql_file = 'create_new_company_api_emp_N.sql';
if (!file_exists($sql_file)) {
    die("Archivo SQL no encontrado: $sql_file\n");
}

$sql_content = file_get_contents($sql_file);
if ($sql_content === false) {
    die("No se pudo leer el archivo SQL\n");
}

echo "Contenido del archivo SQL (primeros 500 caracteres):\n";
echo substr($sql_content, 0, 500) . "\n\n";

$statements = splitSqlStatements($sql_content);

echo "Número total de statements encontrados: " . count($statements) . "\n\n";

echo "Primeros 10 statements:\n";
for ($i = 0; $i < min(10, count($statements)); $i++) {
    echo "Statement " . ($i + 1) . ":\n";
    echo substr($statements[$i], 0, 200) . (strlen($statements[$i]) > 200 ? "..." : "") . "\n\n";
}

echo "Últimos 5 statements:\n";
$start = max(0, count($statements) - 5);
for ($i = $start; $i < count($statements); $i++) {
    echo "Statement " . ($i + 1) . ":\n";
    echo substr($statements[$i], 0, 200) . (strlen($statements[$i]) > 200 ? "..." : "") . "\n\n";
}

// Buscar statements que contengan "DELIMITER"
$delimiterStatements = array_filter($statements, function($stmt) {
    return stripos($stmt, 'DELIMITER') !== false;
});

echo "Statements que contienen 'DELIMITER': " . count($delimiterStatements) . "\n";
foreach ($delimiterStatements as $stmt) {
    echo substr($stmt, 0, 100) . "\n";
}

// Buscar statements que contengan "CREATE TRIGGER"
$triggerStatements = array_filter($statements, function($stmt) {
    return stripos($stmt, 'CREATE TRIGGER') !== false;
});

echo "\nStatements que contienen 'CREATE TRIGGER': " . count($triggerStatements) . "\n";
foreach ($triggerStatements as $stmt) {
    echo substr($stmt, 0, 100) . "\n";
}

?>