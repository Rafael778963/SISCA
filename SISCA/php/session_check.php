<?php
/**
 * Verificación centralizada de sesión para todos los endpoints
 * Incluir este archivo al inicio de cualquier endpoint protegido
 */

// Iniciar sesión
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configurar headers de seguridad para JSON
header('Content-Type: application/json; charset=utf-8');

// Verificar que la sesión esté iniciada
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'unauthorized',
        'message' => 'Sesión no iniciada. Por favor, inicie sesión.'
    ]);
    exit;
}

// Verificar timeout de inactividad (15 minutos = 900 segundos)
$timeout_duration = 900;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeout_duration) {
    // Destruir la sesión expirada
    session_unset();
    session_destroy();

    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'session_expired',
        'message' => 'Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente.'
    ]);
    exit;
}

// Verificar que el IP address coincida (protección contra session hijacking)
if (isset($_SESSION['ip_address']) && $_SESSION['ip_address'] !== $_SERVER['REMOTE_ADDR']) {
    // IP address cambió - posible intento de secuestro de sesión
    session_unset();
    session_destroy();

    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'session_invalid',
        'message' => 'Sesión inválida. Por favor, inicie sesión nuevamente.'
    ]);
    exit;
}

// Verificar que el user agent coincida (protección adicional)
$current_user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
if (isset($_SESSION['user_agent']) && $_SESSION['user_agent'] !== $current_user_agent) {
    // User agent cambió - posible intento de secuestro de sesión
    session_unset();
    session_destroy();

    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'session_invalid',
        'message' => 'Sesión inválida. Por favor, inicie sesión nuevamente.'
    ]);
    exit;
}

// Actualizar el timestamp de última actividad
$_SESSION['last_activity'] = time();

// La sesión es válida - continuar con el endpoint
?>
