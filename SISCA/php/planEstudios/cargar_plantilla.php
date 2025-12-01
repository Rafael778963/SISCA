<?php
/**
 * Cargar una plantilla específica de plan de estudios
 */

include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
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

        // Obtener plantilla (solo del usuario actual)
        $sql = "SELECT
                    id,
                    nombre_plantilla,
                    descripcion,
                    periodo_id,
                    usuario_id,
                    datos_json,
                    fecha_creacion,
                    fecha_modificacion
                FROM plan_estudios_plantillas
                WHERE id = ?
                  AND usuario_id = ?
                  AND estado = 'activo'";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $id, $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Plantilla no encontrada'
            ]);
            exit;
        }

        $plantilla = $result->fetch_assoc();

        echo json_encode([
            'success' => true,
            'plantilla' => $plantilla
        ]);

        $stmt->close();

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al cargar plantilla: ' . $e->getMessage()
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
