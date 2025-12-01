<?php


include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $usuario_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de plantilla inválido'
            ]);
            exit;
        }

        if ($usuario_id <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Usuario no identificado'
            ]);
            exit;
        }

        
        $sql = "UPDATE plan_estudios_plantillas
                SET estado = 'eliminado',
                    fecha_modificacion = CURRENT_TIMESTAMP
                WHERE id = ?
                  AND usuario_id = ?
                  AND estado = 'activo'";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $id, $usuario_id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Plantilla eliminada correctamente'
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Plantilla no encontrada o ya fue eliminada'
                ]);
            }
        } else {
            throw new Exception('Error al eliminar: ' . $stmt->error);
        }

        $stmt->close();

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar plantilla: ' . $e->getMessage()
        ]);
    }

} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}

$conn->close();
?>
