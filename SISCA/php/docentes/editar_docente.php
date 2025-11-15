<?php
include '../session_check.php';
include '../conexion.php';

try {
    // ============================================
    // OBTENER Y VALIDAR DATOS
    // ============================================
    $data = json_decode(file_get_contents('php://input'), true);

    $id = intval($data['id'] ?? 0);
    $nombre_docente = trim($data['nombre_docente'] ?? '');
    $turno = trim($data['turno'] ?? '');
    $regimen = trim($data['regimen'] ?? '');
    $periodo_id = isset($data['periodo_id']) ? (int)$data['periodo_id'] : null;

    // Validar campos obligatorios
    if ($id <= 0 || empty($nombre_docente) || empty($turno) || empty($regimen)) {
        throw new Exception('Todos los campos son obligatorios');
    }

    // Validar que hay un periodo activo
    if (empty($periodo_id)) {
        throw new Exception('Debe seleccionar un período activo antes de guardar');
    }

    // ============================================
    // VERIFICAR QUE EL DOCENTE EXISTE
    // ============================================
    $stmtCheck = $conn->prepare("SELECT id FROM docentes WHERE id = ?");
    $stmtCheck->bind_param("i", $id);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();

    if ($resultCheck->num_rows === 0) {
        throw new Exception('El docente no existe');
    }
    $stmtCheck->close();

    // Validar que el periodo existe
    $stmt_check_periodo = $conn->prepare("SELECT id FROM periodos WHERE id = ?");
    $stmt_check_periodo->bind_param("i", $periodo_id);
    $stmt_check_periodo->execute();
    $result_check_periodo = $stmt_check_periodo->get_result();

    if ($result_check_periodo->num_rows === 0) {
        throw new Exception('El período seleccionado no existe');
    }
    $stmt_check_periodo->close();

    // ============================================
    // ACTUALIZAR DOCENTE CON PERIODO_ID
    // ============================================
    $stmt = $conn->prepare("UPDATE docentes SET nombre_docente = ?, turno = ?, regimen = ?, periodo_id = ? WHERE id = ?");
    $stmt->bind_param("sssii", $nombre_docente, $turno, $regimen, $periodo_id, $id);

    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar el docente: ' . $stmt->error);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Docente actualizado exitosamente'
    ]);

    $stmt->close();

    //Manejo de errores
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
