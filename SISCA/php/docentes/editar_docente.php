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
    
    // Validar campos obligatorios
    if ($id <= 0 || empty($nombre_docente) || empty($turno) || empty($regimen)) {
        throw new Exception('Todos los campos son obligatorios');
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
    
    // ============================================
    // ACTUALIZAR DOCENTE
    // ============================================
    $stmt = $conn->prepare("UPDATE docentes SET nombre_docente = ?, turno = ?, regimen = ? WHERE id = ?");
    $stmt->bind_param("sssi", $nombre_docente, $turno, $regimen, $id);
    
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