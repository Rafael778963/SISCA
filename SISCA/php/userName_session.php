<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

// Verificar que la sesión esté iniciada
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode([
        'valid' => false,
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
        'valid' => false,
        'message' => 'Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente.'
    ]);
    exit;
}

// Actualizar timestamp de última actividad
$_SESSION['last_activity'] = time();

// Sesión válida - retornar información del usuario
echo json_encode([
    'valid' => true,
    'user' => [
        'username' => $_SESSION['username'] ?? '',
        'username_name' => $_SESSION['username_name'] ?? '',
        'area' => $_SESSION['area'] ?? ''
    ]
]);
?>
