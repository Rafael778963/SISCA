<?php
include '../session_check.php';
include '../conexion.php';
include 'funciones_letras.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    $id = intval($data['id'] ?? 0);
    $nuevoEstado = trim($data['estado'] ?? 'inactivo');

    if (empty($id)) {
        throw new Exception('ID de grupo no proporcionado');
    }

    if (!in_array($nuevoEstado, ['activo', 'inactivo'])) {
        throw new Exception('Estado no válido');
    }

    $stmt = $conn->prepare("UPDATE grupos SET estado = ? WHERE id = ?");
    $stmt->bind_param("si", $nuevoEstado, $id);

    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar el estado del grupo');
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception('No se encontró el grupo o no hubo cambios');
    }

    $stmt->close();

    if ($nuevoEstado === 'inactivo') {
        reorganizarLetrasGrupos($conn, $id);
    }

    $mensaje = $nuevoEstado === 'inactivo'
        ? 'Grupo dado de baja exitosamente. Las letras de los grupos subsecuentes se reorganizaron automáticamente.'
        : 'Grupo dado de alta exitosamente';

    echo json_encode([
        'success' => true,
        'message' => $mensaje
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
