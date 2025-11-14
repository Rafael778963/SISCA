<?php
/**
 * Desbloquear Usuario
 * Resetea intentos fallidos y desbloquea un usuario
 */

session_start();
require_once '../conexion.php';

header('Content-Type: application/json; charset=utf-8');

// Verificar autenticación y permisos
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

// Solo Admin puede desbloquear usuarios
if ($_SESSION['area'] !== 'Admin') {
    echo json_encode([
        'success' => false,
        'message' => 'No tiene permisos para desbloquear usuarios'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;

if ($id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de usuario inválido'
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("
        UPDATE usuarios
        SET bloqueado = 0, intentos_fallidos = 0, fecha_bloqueo = NULL
        WHERE id = ?
    ");

    if (!$stmt) {
        throw new Exception('Error al preparar consulta: ' . $conn->error);
    }

    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Usuario desbloqueado exitosamente'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado o ya estaba desbloqueado'
            ]);
        }
    } else {
        throw new Exception('Error al desbloquear usuario: ' . $stmt->error);
    }

    $stmt->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
