<?php
include '../session_check.php';
include '../conexion.php';

if (isset($_POST['id'])) {
    $id = intval($_POST['id']);

    // Validar que el ID sea válido
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID inválido']);
        $conn->close();
        exit;
    }

    // Verificar que la carga académica existe
    $stmt = $conn->prepare("SELECT id FROM carga_academica WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Carga académica no encontrada']);
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();

    // Eliminar la carga académica
    $stmt = $conn->prepare("DELETE FROM carga_academica WHERE id = ?");
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Error en la consulta']);
        $conn->close();
        exit;
    }

    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Carga académica eliminada correctamente'
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se pudo eliminar la carga académica']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar la carga académica: ' . $conn->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'ID no recibido']);
}

$conn->close();
?>
