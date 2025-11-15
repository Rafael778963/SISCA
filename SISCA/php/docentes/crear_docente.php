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
    
    // Validar campos obligatorios
    if (empty($nombre_docente) || empty($turno) || empty($regimen)) {
        throw new Exception('Todos los campos son obligatorios');
    }
    
    // ============================================
    // INSERTAR DOCENTE
    // ============================================
    $stmt = $conn->prepare("INSERT INTO docentes (nombre_docente, turno, regimen) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $nombre_docente, $turno, $regimen);
    
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