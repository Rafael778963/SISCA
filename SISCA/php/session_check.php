<?php
// ============================================
// VERIFICACIÓN CENTRALIZADA DE SESIÓN
// ============================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'unauthorized',
        'message' => 'Sesión no iniciada. Por favor, inicie sesión.'
    ]);
    exit;
}

// ============================================
// VERIFICACIÓN DE TIMEOUT DE INACTIVIDAD
// ============================================

$timeout_duration = 900;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeout_duration) {
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

// ============================================
// PROTECCIÓN CONTRA SESSION HIJACKING
// ============================================

if (isset($_SESSION['ip_address']) && $_SESSION['ip_address'] !== $_SERVER['REMOTE_ADDR']) {
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

$current_user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
if (isset($_SESSION['user_agent']) && $_SESSION['user_agent'] !== $current_user_agent) {
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

$_SESSION['last_activity'] = time();
?>
