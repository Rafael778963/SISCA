<?php
/**
 * Archivo de Conexión Compatible con Sistema Antiguo
 * ===================================================
 *
 * Este archivo mantiene compatibilidad con el código existente
 * mientras usa la nueva configuración segura.
 *
 * USO:
 * require_once 'conexion_v2.php';
 *
 * @version 2.0
 * @date 2025-11-14
 */

// Definir constante de acceso seguro
define('SISCA_ACCESS', true);

// Cargar configuración
require_once __DIR__ . '/config.php';

// Crear variables compatibles con código antiguo
$servername = $db_config['host'];
$username = $db_config['username'];
$password = $db_config['password'];
$database = $db_config['database'];
$dbname = $db_config['database']; // Algunas partes usan $dbname

// Crear conexión usando la función segura
try {
    $conn = getDBConnection();
} catch (Exception $e) {
    die("Error de conexión: " . $e->getMessage());
}

// Nota: $conn->close() debe ser manejado por el script que incluye este archivo
?>
