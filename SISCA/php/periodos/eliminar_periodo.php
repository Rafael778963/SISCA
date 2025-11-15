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
            echo json_encode(['success' => true, 'message' => 'Periodo eliminado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontró el periodo']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el periodo']);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'ID no recibido']);
}

$conn->close();
?>