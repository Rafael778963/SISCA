<?php

include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $periodo_id = isset($_GET['periodo_id']) ? intval($_GET['periodo_id']) : 0;
        $usuario_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;

        if ($periodo_id <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El periodo_id es requerido'
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
                WHERE usuario_id = ?
                  AND periodo_id = ?
                  AND estado = 'activo'
                ORDER BY fecha_modificacion DESC";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $usuario_id, $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $plantillas = [];
        while ($row = $result->fetch_assoc()) {
            $plantillas[] = $row;
        }

        echo json_encode([
            'success' => true,
            'data' => $plantillas
        ]);

        $stmt->close();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener plantillas: ' . $e->getMessage()
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
