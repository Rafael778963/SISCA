<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $periodo_id = isset($_GET['periodo_id']) ? (int)$_GET['periodo_id'] : null;

        if ($periodo_id === null) {
            throw new Exception('El periodo_id es requerido');
        }

        $sql = "SELECT
                    id,
                    periodo_id,
                    nivel,
                    turno,
                    programa_educativo,
                    cuatrimestre,
                    area_conocimiento,
                    asignatura,
                    horas_total,
                    estado,
                    fecha_creacion,
                    fecha_modificacion
                FROM plan_estudios_asignaturas
                WHERE periodo_id = ? AND estado = 'activo'
                ORDER BY cuatrimestre ASC, area_conocimiento ASC, asignatura ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $asignaturas = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $asignaturas[] = $row;
            }
        }

        echo json_encode([
            'success' => true,
            'data' => $asignaturas
        ]);

        $stmt->close();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener las asignaturas: ' . $e->getMessage()
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
