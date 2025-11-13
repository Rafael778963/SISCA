<?php
include '../session_check.php';
include '../conexion.php';

try {
    // ============================================
    // OBTENER Y VALIDAR DATOS
    // ============================================
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = intval($data['id'] ?? 0);
    $nuevoEstado = trim($data['estado'] ?? 'inactivo');
    
    // Validar ID
    if (empty($id)) {
        throw new Exception('ID de grupo no proporcionado');
    }
    
    // Validar estado
    if (!in_array($nuevoEstado, ['activo', 'inactivo'])) {
        throw new Exception('Estado no válido');
    }
    
    // ============================================
    // ACTUALIZAR ESTADO
    // ============================================
    $stmt = $conn->prepare("UPDATE grupos SET estado = ? WHERE id = ?");
    $stmt->bind_param("si", $nuevoEstado, $id);
    
    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar el estado del grupo');
    }
    
    // Verificar si se actualizó algún registro
    if ($stmt->affected_rows === 0) {
        throw new Exception('No se encontró el grupo o no hubo cambios');
    }
    
    // ============================================
    // RESPUESTA EXITOSA
    // ============================================
    $mensaje = $nuevoEstado === 'inactivo' 
        ? 'Grupo dado de baja exitosamente' 
        : 'Grupo dado de alta exitosamente';
    
    echo json_encode([
        'success' => true,
        'message' => $mensaje
    ]);
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>