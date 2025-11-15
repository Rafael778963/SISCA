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

    // Verificar si hay grupos asociados a este periodo (RESTRICT)
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM grupos WHERE periodo_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if ($row['total'] > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'No se puede eliminar el periodo porque tiene ' . $row['total'] . ' grupo(s) asociado(s). Primero debe reasignar o eliminar los grupos.'
        ]);
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();

    // Verificar si hay asignaciones asociadas a este periodo (se eliminarán en cascada)
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM asignaciones WHERE periodo_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $asignaciones_total = $row['total'];
    $stmt->close();

    // Verificar si hay horarios asociados a este periodo (se eliminarán en cascada)
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM horarios WHERE periodo_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $horarios_total = $row['total'];
    $stmt->close();

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
            $mensaje = 'Periodo eliminado correctamente';
            if ($horarios_total > 0 || $asignaciones_total > 0) {
                $mensaje .= '. También se eliminaron: ';
                $detalles = [];
                if ($horarios_total > 0) $detalles[] = $horarios_total . ' horario(s)';
                if ($asignaciones_total > 0) $detalles[] = $asignaciones_total . ' asignación(es)';
                $mensaje .= implode(', ', $detalles);
            }
            echo json_encode(['success' => true, 'message' => $mensaje]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontró el periodo']);
        }
    } else {
        // Capturar error de clave foránea
        if (strpos($stmt->error, 'foreign key constraint') !== false || strpos($stmt->error, 'RESTRICT') !== false) {
            echo json_encode(['success' => false, 'message' => 'No se puede eliminar el periodo porque tiene datos relacionados']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar el periodo: ' . $stmt->error]);
        }
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'ID no recibido']);
}

$conn->close();
?>