<?php
/**
 * Archivo de Configuración de Base de Datos - SISCA v2.0
 * =======================================================
 *
 * IMPORTANTE: En producción, las credenciales deben estar en variables de entorno
 * o en un archivo .env fuera del directorio web público.
 *
 * Para usar variables de entorno:
 * - Crear archivo .env en el directorio raíz (NO en carpeta pública)
 * - Agregar .env al .gitignore
 * - Usar biblioteca como vlucas/phpdotenv
 *
 * @version 2.0
 * @date 2025-11-14
 */

// Prevenir acceso directo
if (!defined('SISCA_ACCESS')) {
    die('Acceso directo no permitido');
}

// ============================================================================
// CONFIGURACIÓN DE BASE DE DATOS
// ============================================================================

// Intentar cargar desde variables de entorno primero
$db_config = [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASS') ?: '',
    'database' => getenv('DB_NAME') ?: 'sisca',
    'port' => getenv('DB_PORT') ?: 3306,
    'charset' => 'utf8mb4'
];

// ============================================================================
// CONFIGURACIÓN DE SESIÓN
// ============================================================================

$session_config = [
    'name' => 'SISCA_SESSION',
    'cookie_lifetime' => 0, // Expira al cerrar navegador
    'cookie_path' => '/',
    'cookie_domain' => '',
    'cookie_secure' => true, // CAMBIAR A true cuando se implemente HTTPS
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true,
    'use_only_cookies' => true,
    'gc_maxlifetime' => 900, // 15 minutos de inactividad
];

// ============================================================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================================================

$security_config = [
    'password_cost' => 10, // Cost factor para bcrypt
    'max_login_attempts' => 5,
    'lockout_time' => 1800, // 30 minutos en segundos
    'session_timeout' => 900, // 15 minutos en segundos
    'token_expiry' => 3600, // 1 hora para tokens de recuperación
];

// ============================================================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================================================

$app_config = [
    'name' => 'SISCA',
    'version' => '2.0',
    'timezone' => 'America/Mexico_City',
    'debug_mode' => false, // CAMBIAR A false en producción
    'environment' => getenv('APP_ENV') ?: 'development', // development, staging, production
];

// ============================================================================
// CONFIGURACIÓN DE ERRORES
// ============================================================================

if ($app_config['environment'] === 'production') {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0);

    // En producción, registrar errores en archivo log
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../logs/php-errors.log');
} else {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

// ============================================================================
// ZONA HORARIA
// ============================================================================

date_default_timezone_set($app_config['timezone']);

// ============================================================================
// FUNCIÓN DE CONEXIÓN A BASE DE DATOS
// ============================================================================

/**
 * Obtiene una conexión a la base de datos
 *
 * @return mysqli Objeto de conexión MySQL
 * @throws Exception Si la conexión falla
 */
function getDBConnection() {
    global $db_config;

    $conn = new mysqli(
        $db_config['host'],
        $db_config['username'],
        $db_config['password'],
        $db_config['database'],
        $db_config['port']
    );

    if ($conn->connect_error) {
        // No revelar detalles de conexión en producción
        global $app_config;
        if ($app_config['environment'] === 'production') {
            error_log('Database connection failed: ' . $conn->connect_error);
            throw new Exception('Error de conexión a la base de datos');
        } else {
            throw new Exception('Error de conexión: ' . $conn->connect_error);
        }
    }

    // Establecer charset
    if (!$conn->set_charset($db_config['charset'])) {
        throw new Exception('Error al establecer charset: ' . $conn->error);
    }

    return $conn;
}

// ============================================================================
// FUNCIONES DE SEGURIDAD
// ============================================================================

/**
 * Sanitiza input para prevenir XSS
 *
 * @param string $data Datos a sanitizar
 * @return string Datos sanitizados
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Valida token CSRF
 *
 * @param string $token Token recibido
 * @return bool True si es válido
 */
function validateCSRFToken($token) {
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Genera token CSRF
 *
 * @return string Token generado
 */
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verifica si la sesión está activa y válida
 *
 * @return bool True si la sesión es válida
 */
function isSessionValid() {
    global $security_config;

    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        return false;
    }

    // Verificar timeout de inactividad
    if (isset($_SESSION['last_activity'])) {
        $inactivity = time() - $_SESSION['last_activity'];
        if ($inactivity > $security_config['session_timeout']) {
            return false;
        }
    }

    // Verificar que IP y User Agent no hayan cambiado
    if (isset($_SESSION['ip_address']) && $_SESSION['ip_address'] !== $_SERVER['REMOTE_ADDR']) {
        return false;
    }

    if (isset($_SESSION['user_agent'])) {
        $current_user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        if ($_SESSION['user_agent'] !== $current_user_agent) {
            return false;
        }
    }

    // Actualizar tiempo de última actividad
    $_SESSION['last_activity'] = time();

    return true;
}

// ============================================================================
// INICIALIZACIÓN DE SESIÓN SEGURA
// ============================================================================

/**
 * Inicia sesión con configuración segura
 */
function initSecureSession() {
    global $session_config;

    if (session_status() === PHP_SESSION_NONE) {
        session_name($session_config['name']);

        session_set_cookie_params([
            'lifetime' => $session_config['cookie_lifetime'],
            'path' => $session_config['cookie_path'],
            'domain' => $session_config['cookie_domain'],
            'secure' => $session_config['cookie_secure'],
            'httponly' => $session_config['cookie_httponly'],
            'samesite' => $session_config['cookie_samesite']
        ]);

        ini_set('session.use_strict_mode', $session_config['use_strict_mode']);
        ini_set('session.use_only_cookies', $session_config['use_only_cookies']);
        ini_set('session.gc_maxlifetime', $session_config['gc_maxlifetime']);

        session_start();

        // Regenerar ID de sesión periódicamente
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 1800) {
            // Regenerar cada 30 minutos
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
}

// ============================================================================
// AUTOLOAD (Opcional para futuras clases)
// ============================================================================

/*
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/classes/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});
*/

?>
