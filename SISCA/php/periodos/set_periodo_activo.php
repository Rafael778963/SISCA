<?php


include '../session_check.php';


$data = json_decode(file_get_contents('php://input'), true);


if (!isset($data['periodo_id']) || empty($data['periodo_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de período no proporcionado'
    ]);
    exit;
}


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
