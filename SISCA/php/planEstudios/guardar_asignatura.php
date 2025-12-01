<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        
        $periodo_id = isset($_POST['periodo_id']) ? (int)$_POST['periodo_id'] : null;
        $nivel = isset($_POST['nivel']) ? trim($_POST['nivel']) : '';
        $turno = isset($_POST['turno']) ? trim($_POST['turno']) : '';
        $programa_educativo = isset($_POST['programa_educativo']) ? trim($_POST['programa_educativo']) : '';
        $cuatrimestre = isset($_POST['cuatrimestre']) ? (int)$_POST['cuatrimestre'] : 0;
        $area_conocimiento = isset($_POST['area_conocimiento']) ? trim($_POST['area_conocimiento']) : null;
        $asignatura = isset($_POST['asignatura']) ? trim($_POST['asignatura']) : '';
        $horas_total = isset($_POST['horas_total']) ? (int)$_POST['horas_total'] : 0;

        
        if ($periodo_id === null || $periodo_id <= 0) {
            throw new Exception('El periodo es requerido');
        }

        if (empty($nivel) || empty($turno) || empty($programa_educativo) || $cuatrimestre <= 0) {
            throw new Exception('Todos los campos obligatorios deben ser completados');
        }

        if (empty($asignatura) || $horas_total <= 0) {
            throw new Exception('La asignatura y las horas totales son requeridas');
        }

        
        $sql = "INSERT INTO plan_estudios_asignaturas
                (periodo_id, nivel, turno, programa_educativo, cuatrimestre, area_conocimiento, asignatura, horas_total, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo')";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "isssissi",
            $periodo_id,
            $nivel,
            $turno,
            $programa_educativo,
            $cuatrimestre,
            $area_conocimiento,
            $asignatura,
            $horas_total
        );

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Asignatura guardada correctamente',
                'id' => $stmt->insert_id
            ]);
        } else {
            throw new Exception('Error al guardar la asignatura');
        }

        $stmt->close();

    } catch (Exception $e) {
        http_response_code(500);
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
