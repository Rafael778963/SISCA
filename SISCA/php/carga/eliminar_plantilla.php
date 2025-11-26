<?php
/**
 * Eliminar (soft delete) una plantilla
 */

include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {
    $plantilla_id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $usuario_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;

    if ($plantilla_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID de plantilla inválido'
        ]);
        exit;
    }

    if ($usuario_id <= 0) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no identificado'
        ]);
        exit;
    }

    // Verificar que la plantilla existe y pertenece al usuario
    $sql_check = "SELECT id FROM carga_plantillas
                  WHERE id = ?
                    AND usuario_id = ?
                    AND estado = 'activo'";

    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param('ii', $plantilla_id, $usuario_id);
    $stmt_check->execute();
    $result = $stmt_check->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Plantilla no encontrada o no tienes permisos para eliminarla'
        ]);
        $stmt_check->close();
        exit;
    }
    $stmt_check->close();

    // Soft delete
    $sql_delete = "UPDATE carga_plantillas SET estado = 'eliminado' WHERE id = ?";
    $stmt_delete = $conn->prepare($sql_delete);
    $stmt_delete->bind_param('i', $plantilla_id);

    if ($stmt_delete->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Plantilla eliminada exitosamente',
            'id' => $plantilla_id
        ]);
    } else {
        throw new Exception('Error al eliminar: ' . $stmt_delete->error);
    }

    $stmt_delete->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al eliminar plantilla: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
