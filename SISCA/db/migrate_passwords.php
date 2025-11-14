<?php
/**
 * Script de Migración de Contraseñas
 * ===================================
 *
 * Este script migra las contraseñas en texto plano de la tabla usuarios
 * a contraseñas hasheadas usando password_hash() de PHP (bcrypt).
 *
 * IMPORTANTE:
 * - Ejecutar UNA SOLA VEZ después de actualizar la estructura de la tabla usuarios
 * - Hace backup de las contraseñas originales antes de migrar
 * - No se puede revertir automáticamente (usar backup manual de BD)
 *
 * USO:
 * php migrate_passwords.php
 *
 * O acceder desde navegador (solo en desarrollo):
 * http://localhost/SISCA/db/migrate_passwords.php
 *
 * @author SISCA Development Team
 * @version 2.0
 * @date 2025-11-14
 */

// Configuración de errores para desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Seguridad: Solo permitir ejecución en CLI o localhost
if (php_sapi_name() !== 'cli') {
    if (!in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1', 'localhost'])) {
        die("ERROR: Este script solo puede ejecutarse desde localhost o línea de comandos.\n");
    }
}

// Colores para terminal (solo en CLI)
$COLORS = [
    'reset' => "\033[0m",
    'red' => "\033[31m",
    'green' => "\033[32m",
    'yellow' => "\033[33m",
    'blue' => "\033[34m",
    'bold' => "\033[1m",
];

if (php_sapi_name() !== 'cli') {
    // Deshabilitar colores en navegador
    $COLORS = array_fill_keys(array_keys($COLORS), '');
}

function printColor($text, $color = 'reset') {
    global $COLORS;
    echo $COLORS[$color] . $text . $COLORS['reset'] . "\n";
}

function printHeader($text) {
    printColor("\n" . str_repeat("=", 60), 'blue');
    printColor($text, 'bold');
    printColor(str_repeat("=", 60), 'blue');
}

// ============================================================================
// CONFIGURACIÓN DE BASE DE DATOS
// ============================================================================

printHeader("SCRIPT DE MIGRACIÓN DE CONTRASEÑAS - SISCA v2.0");

// Cargar configuración desde archivo de conexión
$configFile = __DIR__ . '/../php/conexion.php';
if (file_exists($configFile)) {
    printColor("✓ Cargando configuración de BD desde conexion.php...", 'green');
    require_once $configFile;

    // Usar variables del archivo de conexión
    $host = $servername;
    $database = $dbname;
    $user = $username;
    $pass = $password;
} else {
    printColor("⚠ Archivo conexion.php no encontrado. Usando configuración por defecto...", 'yellow');

    // Configuración por defecto
    $host = "localhost";
    $database = "sisca";
    $user = "root";
    $pass = "";
}

printColor("Base de datos: $database@$host", 'blue');

// ============================================================================
// CONEXIÓN A BASE DE DATOS
// ============================================================================

printHeader("CONECTANDO A BASE DE DATOS");

try {
    $conn = new mysqli($host, $user, $pass, $database);

    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }

    $conn->set_charset("utf8mb4");
    printColor("✓ Conexión establecida exitosamente", 'green');

} catch (Exception $e) {
    printColor("✗ ERROR: " . $e->getMessage(), 'red');
    exit(1);
}

// ============================================================================
// VERIFICAR ESTRUCTURA DE TABLA
// ============================================================================

printHeader("VERIFICANDO ESTRUCTURA DE TABLA");

// Verificar si existe la columna contraseña_hash
$result = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'contraseña_hash'");

if ($result->num_rows == 0) {
    printColor("⚠ La columna 'contraseña_hash' no existe.", 'yellow');
    printColor("Creando columna 'contraseña_hash'...", 'blue');

    $alterSQL = "ALTER TABLE usuarios ADD COLUMN contraseña_hash VARCHAR(255) NULL AFTER contraseña";

    if ($conn->query($alterSQL)) {
        printColor("✓ Columna 'contraseña_hash' creada exitosamente", 'green');
    } else {
        printColor("✗ ERROR al crear columna: " . $conn->error, 'red');
        exit(1);
    }
} else {
    printColor("✓ Columna 'contraseña_hash' ya existe", 'green');
}

// Verificar si existe la columna debe_cambiar_password
$result = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'debe_cambiar_password'");

if ($result->num_rows == 0) {
    printColor("Creando columna 'debe_cambiar_password'...", 'blue');

    $alterSQL = "ALTER TABLE usuarios ADD COLUMN debe_cambiar_password TINYINT(1) DEFAULT 0 AFTER contraseña_hash";

    if ($conn->query($alterSQL)) {
        printColor("✓ Columna 'debe_cambiar_password' creada exitosamente", 'green');
    } else {
        printColor("✗ ERROR al crear columna: " . $conn->error, 'red');
        // No es crítico, continuar
    }
}

// ============================================================================
// CREAR TABLA DE BACKUP
// ============================================================================

printHeader("CREANDO BACKUP DE CONTRASEÑAS");

$backupTable = "usuarios_password_backup_" . date('Ymd_His');

$createBackupSQL = "
CREATE TABLE $backupTable AS
SELECT id, nombre_usuario, contraseña, NOW() as fecha_backup
FROM usuarios
";

if ($conn->query($createBackupSQL)) {
    printColor("✓ Backup creado en tabla: $backupTable", 'green');

    // Contar registros
    $countResult = $conn->query("SELECT COUNT(*) as total FROM $backupTable");
    $count = $countResult->fetch_assoc()['total'];
    printColor("  Registros respaldados: $count", 'blue');
} else {
    printColor("✗ ERROR al crear backup: " . $conn->error, 'red');
    printColor("⚠ Continuando sin backup (riesgoso)...", 'yellow');
}

// ============================================================================
// MIGRAR CONTRASEÑAS
// ============================================================================

printHeader("MIGRANDO CONTRASEÑAS");

// Obtener todos los usuarios con contraseñas en texto plano
$sql = "SELECT id, nombre_usuario, contraseña FROM usuarios WHERE contraseña IS NOT NULL AND contraseña != ''";
$result = $conn->query($sql);

if (!$result) {
    printColor("✗ ERROR al obtener usuarios: " . $conn->error, 'red');
    exit(1);
}

$totalUsuarios = $result->num_rows;
printColor("Usuarios a migrar: $totalUsuarios", 'blue');

$migrados = 0;
$errores = 0;

printColor("\nProcesando...\n", 'bold');

while ($usuario = $result->fetch_assoc()) {
    $id = $usuario['id'];
    $username = $usuario['nombre_usuario'];
    $passwordPlain = $usuario['contraseña'];

    echo sprintf("  [%d/%d] %s ... ", $migrados + $errores + 1, $totalUsuarios, $username);

    // Generar hash bcrypt (cost factor = 10)
    $passwordHash = password_hash($passwordPlain, PASSWORD_BCRYPT, ['cost' => 10]);

    if (!$passwordHash) {
        printColor("✗ ERROR al generar hash", 'red');
        $errores++;
        continue;
    }

    // Actualizar usuario con contraseña hasheada
    $updateStmt = $conn->prepare("
        UPDATE usuarios
        SET contraseña_hash = ?,
            debe_cambiar_password = 1
        WHERE id = ?
    ");

    if (!$updateStmt) {
        printColor("✗ ERROR: " . $conn->error, 'red');
        $errores++;
        continue;
    }

    $updateStmt->bind_param("si", $passwordHash, $id);

    if ($updateStmt->execute()) {
        printColor("✓ OK", 'green');
        $migrados++;
    } else {
        printColor("✗ ERROR: " . $updateStmt->error, 'red');
        $errores++;
    }

    $updateStmt->close();
}

// ============================================================================
// RESUMEN Y LIMPIEZA
// ============================================================================

printHeader("RESUMEN DE MIGRACIÓN");

printColor("Total usuarios:     $totalUsuarios", 'blue');
printColor("Migrados:           $migrados", 'green');
printColor("Errores:            $errores", $errores > 0 ? 'red' : 'green');

if ($migrados > 0) {
    printColor("\n✓ Migración completada exitosamente", 'bold');

    printColor("\n⚠ IMPORTANTE:", 'yellow');
    printColor("1. Los usuarios deben cambiar su contraseña en el próximo login", 'yellow');
    printColor("2. Las contraseñas originales están respaldadas en: $backupTable", 'yellow');
    printColor("3. Actualizar el archivo login.php para usar password_verify()", 'yellow');
    printColor("4. Probar el login antes de eliminar la columna 'contraseña'", 'yellow');

    // Preguntar si quiere eliminar la columna contraseña
    if (php_sapi_name() === 'cli') {
        printColor("\n¿Deseas eliminar la columna 'contraseña' (texto plano)? (s/N): ", 'bold');
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        fclose($handle);

        if (trim(strtolower($line)) === 's') {
            printColor("\nEliminando columna 'contraseña'...", 'blue');

            if ($conn->query("ALTER TABLE usuarios DROP COLUMN contraseña")) {
                printColor("✓ Columna 'contraseña' eliminada exitosamente", 'green');
                printColor("✓ Ahora solo existe 'contraseña_hash' (seguro)", 'green');
            } else {
                printColor("✗ ERROR al eliminar columna: " . $conn->error, 'red');
            }
        } else {
            printColor("✓ Columna 'contraseña' conservada (puedes eliminarla manualmente después)", 'yellow');
        }
    } else {
        printColor("\nPara eliminar la columna de texto plano, ejecuta:", 'yellow');
        printColor("ALTER TABLE usuarios DROP COLUMN contraseña;", 'blue');
    }

    printColor("\n✓ MIGRACIÓN COMPLETADA", 'green');
    printColor("\nPróximos pasos:", 'bold');
    printColor("1. Actualizar login.php con password_verify()", 'blue');
    printColor("2. Probar login con usuarios migrados", 'blue');
    printColor("3. Actualizar formularios de creación/edición de usuarios", 'blue');
    printColor("4. Eliminar tabla de backup después de confirmar funcionamiento", 'blue');

} else {
    printColor("\n✗ No se migraron usuarios", 'red');

    if ($errores > 0) {
        printColor("Revisar errores y ejecutar nuevamente", 'yellow');
    }
}

$conn->close();

printColor("\n" . str_repeat("=", 60) . "\n", 'blue');

exit($errores > 0 ? 1 : 0);
?>
