<?php
// ============================================
// ELIMINAR DOCENTE
// ============================================

include '../session_check.php';
include '../conexion.php';

if(isset($_POST['id'])) {
    $id = intval($_POST['id']);
    $sql = "DELETE FROM docentes WHERE id = $id";

    if($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Docente eliminado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el docente']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID no recibido']);
}

$conn->close();
?>