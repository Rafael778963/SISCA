<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;

        if ($id <= 0) {
            throw new Exception('ID inválido');
        }

        // Eliminación lógica (cambiar estado a inactivo)
        $sql = "UPDATE plan_estudios_asignaturas
                SET estado = 'inactivo'
                WHERE id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Asignatura eliminada correctamente'
                ]);
            } else {
                throw new Exception('No se encontró la asignatura');
            }
        } else {
            throw new Exception('Error al eliminar la asignatura');
        }

        $stmt->close();

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }

} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}

$conn->close();
?>
