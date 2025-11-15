<?php
include 'session_check.php';
include 'periodo_session.php';

header('Content-Type: application/json');

try {
    $periodo_id = get_periodo_activo();
    $periodo_nombre = get_periodo_nombre();
    $periodo_año = get_periodo_año();

    echo json_encode([
        'success' => true,
        'periodo_id' => $periodo_id,
        'periodo_nombre' => $periodo_nombre,
        'periodo_año' => $periodo_año
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener periodo activo: ' . $e->getMessage()
    ]);
}
?>
