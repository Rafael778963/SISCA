<?php
include '../session_check.php';
include '../conexion.php';

if(isset($_POST['id'])) {
    $id = intval($_POST['id']);

    // Validar que el ID sea válido
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID inválido']);
        $conn->close();
        exit;
    }

    // Verificar registros relacionados antes de eliminar (para informar al usuario)
    $warnings = [];

    // Contar horarios relacionados
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM horarios WHERE periodo_id = ? AND estado = 'activo'");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    if ($row['total'] > 0) {
        $warnings[] = $row['total'] . ' horario(s)';
    }
    $stmt->close();

    // Contar grupos relacionados
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM grupos WHERE periodo_id = ? AND estado = 'activo'");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    if ($row['total'] > 0) {
        $warnings[] = $row['total'] . ' grupo(s)';
    }
    $stmt->close();

    // Contar cargas académicas relacionadas
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM carga_academica WHERE periodo_id = ? AND estado = 'activo'");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    if ($row['total'] > 0) {
        $warnings[] = $row['total'] . ' carga(s) académica(s)';
    }
    $stmt->close();

    // Construir mensaje de advertencia
    $warningMessage = '';
    if (!empty($warnings)) {
        $warningMessage = ' ADVERTENCIA: Se eliminarán también ' . implode(', ', $warnings) . ' relacionados.';
    }

    // Usar prepared statement para la eliminación
    $stmt = $conn->prepare("DELETE FROM periodos WHERE id = ?");
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Error en la consulta']);
        $conn->close();
        exit;
    }

    $stmt->bind_param("i", $id);

    if($stmt->execute()){
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Periodo eliminado correctamente.' . $warningMessage,
                'deleted_related' => $warnings
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontró el periodo']);
        }
    } else {
        // Verificar si es error de constraint (aunque no debería pasar con CASCADE)
        if ($conn->errno == 1451) {
            echo json_encode(['success' => false, 'message' => 'No se puede eliminar el periodo porque tiene registros relacionados. Contacte al administrador.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar el periodo: ' . $conn->error]);
        }
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'ID no recibido']);
}

$conn->close();
?>