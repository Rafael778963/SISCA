<?php


include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID inválido'
        ]);
        exit;
    }

    
    $sql_check = "SELECT id FROM carga_academica WHERE id = ? AND estado = 'activo'";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param('i', $id);
    $stmt_check->execute();
    $result = $stmt_check->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Registro no encontrado o ya eliminado'
        ]);
        $stmt_check->close();
        exit;
    }
    $stmt_check->close();

    
    $sql_delete = "UPDATE carga_academica SET estado = 'eliminado' WHERE id = ?";
    $stmt_delete = $conn->prepare($sql_delete);
    $stmt_delete->bind_param('i', $id);

    if ($stmt_delete->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Carga académica eliminada exitosamente',
            'id' => $id
        ]);
    } else {
        throw new Exception('Error al eliminar: ' . $stmt_delete->error);
    }

    $stmt_delete->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al eliminar: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
