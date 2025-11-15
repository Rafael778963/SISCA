<?php
/**
 * Limpia el período activo de la sesión
 */

include '../session_check.php';

unset($_SESSION['periodo_activo']);

echo json_encode([
    'success' => true,
    'message' => 'Período activo eliminado de la sesión'
]);
?>
