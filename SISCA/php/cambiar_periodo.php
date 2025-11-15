<?php
include 'session_check.php';
include 'conexion.php';
include 'periodo_session.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $periodo_id = isset($_POST['periodo_id']) ? intval($_POST['periodo_id']) : 0;

        if ($periodo_id <= 0) {
            throw new Exception('ID de periodo inválido');
        }

        // Validar que el periodo existe
        $stmt = $conn->prepare("SELECT id, periodo, año FROM periodos WHERE id = ?");
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            throw new Exception('El periodo seleccionado no existe');
        }

        $periodo = $result->fetch_assoc();
        $stmt->close();

        // Establecer el nuevo periodo en sesión
        set_periodo_activo($periodo['id'], $periodo['periodo'], $periodo['año']);

        echo json_encode([
            'success' => true,
            'message' => 'Periodo cambiado exitosamente',
            'data' => [
                'periodo_id' => $periodo['id'],
                'periodo_nombre' => $periodo['periodo'],
                'periodo_año' => $periodo['año']
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
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
