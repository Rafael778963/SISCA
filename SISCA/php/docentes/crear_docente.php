<?php
// ============================================
// CREAR_DOCENTE.PHP - REGISTRO DE DOCENTES
// ============================================

include '../session_check.php';
include '../conexion.php';

try {
    // ============================================
    // OBTENER Y VALIDAR DATOS
    // ============================================
    $data = json_decode(file_get_contents('php://input'), true);

    $nombre_docente = trim($data['nombre_docente'] ?? '');
    $turno = trim($data['turno'] ?? '');
    $regimen = trim($data['regimen'] ?? '');
    $periodo_id = isset($data['periodo_id']) ? (int)$data['periodo_id'] : null;

    // Validar campos obligatorios
    if (empty($nombre_docente) || empty($turno) || empty($regimen)) {
        throw new Exception('Todos los campos son obligatorios');
    }

    // Validar que hay un periodo activo
    if (empty($periodo_id)) {
        throw new Exception('Debe seleccionar un período activo antes de guardar');
    }

    // Validar que el periodo existe
    $stmt_check = $conn->prepare("SELECT id FROM periodos WHERE id = ?");
    $stmt_check->bind_param("i", $periodo_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows === 0) {
        throw new Exception('El período seleccionado no existe');
    }
    $stmt_check->close();

    // ============================================
    // INSERTAR DOCENTE CON PERIODO_ID
    // ============================================
    $stmt = $conn->prepare("INSERT INTO docentes (nombre_docente, turno, regimen, periodo_id) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sssi", $nombre_docente, $turno, $regimen, $periodo_id);

    if (!$stmt->execute()) {
        throw new Exception('Error al guardar el docente');
    }

    // ============================================
    // RESPUESTA EXITOSA
    // ============================================
    echo json_encode([
        'success' => true,
        'message' => 'Docente registrado exitosamente',
        'id' => $conn->insert_id
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
