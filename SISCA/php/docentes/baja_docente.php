<?php
include '../session_check.php';
include '../conexion.php';

try {

    $data = json_decode(file_get_contents('php://input'), true);

    $id = intval($data['id'] ?? 0);
    $nuevoEstado = trim($data['estado'] ?? 'inactivo');

    if (empty($id)) {
        throw new Exception('ID de docente no proporcionado');
    }

    if (!in_array($nuevoEstado, ['activo', 'inactivo'])) {
        throw new Exception('Estado no válido');
    }

    $stmt = $conn->prepare("UPDATE docentes SET estado = ? WHERE id = ?");
    $stmt->bind_param("si", $nuevoEstado, $id);

    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar el estado del docente');
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception('No se encontró el docente o no hubo cambios');
    }

    $mensaje = $nuevoEstado === 'inactivo'
        ? 'Docente dado de baja exitosamente'
        : 'Docente dado de alta exitosamente';

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
