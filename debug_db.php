<?php
// Intentar cargar el entorno de ninesys-api
chdir('/home/developer/Escritorio/niesys/ninesys-api');
require_once 'app/settings.php';
require_once 'app/model/LocalDB.php';

try {
    $adminDNS = str_replace('127.0.0.1', 'localhost', EMPRESAS_DNS);
    $db = new LocalDB('', $adminDNS, EMPRESAS_USER, EMPRESAS_PASS);
    
    $companyDB = LOCAL_DB;
    echo "DB: $companyDB\n";
    
    // Listar tablas para estar seguros
    $tables = $db->goQuery("SHOW TABLES FROM $companyDB");
    echo "Tables in $companyDB:\n";
    foreach($tables as $t) {
        echo "- " . array_values($t)[0] . "\n";
    }
    
    // Buscar gastos_registros
    $sql = "SELECT * FROM $companyDB.gastos_registros LIMIT 1";
    $res = $db->goQuery($sql);
    echo "Sample Gasto Registro:\n";
    print_r($res);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
