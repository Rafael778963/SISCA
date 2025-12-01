<?php


include '../session_check.php';

if (isset($_SESSION['periodo_activo'])) {
    echo json_encode([
        'success' => true,
        'periodo' => $_SESSION['periodo_activo']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No hay período activo seleccionado'
    ]);
}
?>
