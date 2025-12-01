<?php
/**
 * Establece el período activo en la sesión
 * Este período se usará para filtrar y guardar todos los datos de la aplicación
 */

include '../session_check.php';

// Leer datos del request
$data = json_decode(file_get_contents('php://input'), true);

// Validar que se recibieron los datos necesarios
if (!isset($data['periodo_id']) || empty($data['periodo_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de período no proporcionado'
    ]);
    exit;
}

// Guardar en la sesión
$_SESSION['periodo_activo'] = [
    'id' => $data['periodo_id'],
    'texto' => $data['periodo_texto'] ?? "Período {$data['periodo_id']}"
];

echo json_encode([
    'success' => true,
    'message' => 'Período activo establecido correctamente',
    'periodo' => $_SESSION['periodo_activo']
]);
?>
