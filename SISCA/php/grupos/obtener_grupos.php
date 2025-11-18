<?php
// ============================================
// OBTENER GRUPOS POR PERIODO
// ============================================

include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $estado = isset($_GET['estado']) ? $_GET['estado'] : 'activo';

        $periodo_id = isset($_GET['periodo_id']) ? (int)$_GET['periodo_id'] : null;

        if ($periodo_id === null) {
            throw new Exception('El periodo_id es requerido');
        }

        // ============================================
        // CONSULTAR GRUPOS ACTIVOS DEL PERIODO
        // ============================================

        $sql = "SELECT id, codigo_grupo, generacion, nivel_educativo, programa_educativo, grado, letra_identificacion, turno, estado, fecha_creacion
                FROM grupos
                WHERE estado = ? AND periodo_id = ?
                ORDER BY id ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $estado, $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $grupos = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                if ($row['turno'] === null) {
                    $row['turno'] = 'M';
                }
                $grupos[] = $row;
            }
        }

        echo json_encode([
            'success' => true,
            'data' => $grupos
        ]);

        $stmt->close();

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener los grupos: ' . $e->getMessage()
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